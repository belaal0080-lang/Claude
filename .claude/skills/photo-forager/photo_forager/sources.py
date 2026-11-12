"""Source adapters + license gating.

Each adapter returns a list of normalized PhotoResult objects. The single most
important job of this module is *license correctness*: every result carries an
honest `attribution_required` flag so downstream content never uses an image
without the credit its license demands.

License reality (verified against live APIs, 2026):
  - Pexels             -> Pexels License, attribution NOT required.
  - Wikimedia Commons  -> mixed; we keep ONLY files whose extmetadata says
                          AttributionRequired == "false" (CC0 / Public Domain).
  - Rawpixel           -> mixed; the `freecc0=1` param leaks ~58% premium, so we
                          query `tags=$publicdomain` AND gate on license == "cc0".
  - Unsplash           -> Unsplash License is permissive, but the Unsplash *API
                          Terms* contractually require crediting the photographer
                          + Unsplash on every result. We therefore mark Unsplash
                          attribution_required == True and attach a ready credit.
"""

import os
import re
import ssl
import sys
import json
import html
import urllib.parse
import urllib.request
import urllib.error
from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PEXELS_KEY_ENV = "PEXELS_API_KEY"
UNSPLASH_KEY_ENV = "UNSPLASH_ACCESS_KEY"

# Sources ordered so attribution-free results rank ahead of Unsplash.
SOURCE_ORDER = ["pexels", "wikimedia", "rawpixel", "unsplash"]
KEYLESS_SOURCES = {"wikimedia", "rawpixel"}
KEYED_SOURCES = {"pexels": PEXELS_KEY_ENV, "unsplash": UNSPLASH_KEY_ENV}

USER_AGENT = (
    "photo-forager/0.1 (https://github.com/fiehrfly/photo-forager) "
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

# Raster types we can actually use in a carousel/web layout.
_RASTER_RE = re.compile(r"\.(jpe?g|png|webp|gif)$", re.IGNORECASE)


# ---------------------------------------------------------------------------
# .env loading (no python-dotenv dependency)
# ---------------------------------------------------------------------------

def load_env():
    """Populate os.environ from a .env file at the repo root, if present.

    Only sets keys that are not already in the environment, so a real env var
    always wins over the file.
    """
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for path in (os.path.join(root, ".env"), os.path.join(os.getcwd(), ".env")):
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k and v and k not in os.environ:
                        os.environ[k] = v
        except OSError:
            pass


# ---------------------------------------------------------------------------
# HTTP helpers (stdlib only)
# ---------------------------------------------------------------------------

_ssl_unverified_warned = False


def _ssl_context():
    return ssl.create_default_context()


def http_json(url, headers=None, timeout=20):
    """GET a URL and parse JSON. Raises on network/parse failure."""
    return json.loads(_http_bytes(url, headers=headers, timeout=timeout).decode("utf-8"))


def http_get(url, headers=None, timeout=20):
    """GET a URL, return raw bytes. Used for download + ToS triggers."""
    return _http_bytes(url, headers=headers, timeout=timeout)


def _http_bytes(url, headers=None, timeout=20):
    global _ssl_unverified_warned
    hdrs = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ssl_context()) as resp:
            return resp.read()
    except ssl.SSLCertVerificationError:
        # Some standalone Python builds lack a trusted cert bundle. These are
        # public read-only image APIs, so fall back to an unverified context
        # rather than failing the whole search.
        if not _ssl_unverified_warned:
            print("photo-forager: SSL cert verification failed; retrying "
                  "without verification (public read-only APIs).", file=sys.stderr)
            _ssl_unverified_warned = True
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read()


def _strip_html(s):
    if not s:
        return ""
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


# ---------------------------------------------------------------------------
# Normalized result
# ---------------------------------------------------------------------------

@dataclass
class PhotoResult:
    source: str
    id: str
    title: str
    thumb_url: str
    full_url: str
    width: int
    height: int
    photographer: str
    source_page: str
    license_name: str
    attribution_required: bool
    attribution_text: str
    extra: dict = field(default_factory=dict)

    def to_dict(self):
        d = {
            "source": self.source,
            "id": self.id,
            "title": self.title,
            "thumb_url": self.thumb_url,
            "full_url": self.full_url,
            "width": self.width,
            "height": self.height,
            "photographer": self.photographer,
            "source_page": self.source_page,
            "license_name": self.license_name,
            "attribution_required": self.attribution_required,
            "attribution_text": self.attribution_text,
        }
        if self.extra:
            d["extra"] = self.extra
        return d


def _orientation_ok(width, height, orientation):
    """Aspect-ratio post-filter for sources without an orientation param."""
    if not orientation or not width or not height:
        return True
    ratio = width / height
    if orientation == "landscape":
        return ratio >= 1.1
    if orientation == "portrait":
        return ratio <= 0.91
    if orientation == "square":
        return 0.91 < ratio < 1.1
    return True


# ---------------------------------------------------------------------------
# Pexels  (key required; attribution NOT required)
# ---------------------------------------------------------------------------

def search_pexels(query, orientation=None, limit=12):
    key = os.environ.get(PEXELS_KEY_ENV)
    if not key:
        raise RuntimeError(f"{PEXELS_KEY_ENV} not set")
    params = {"query": query, "per_page": max(1, min(80, limit))}
    if orientation in ("landscape", "portrait", "square"):
        params["orientation"] = orientation
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(params)
    data = http_json(url, headers={"Authorization": key})
    out = []
    for p in data.get("photos", []):
        src = p.get("src", {})
        full = src.get("large2x") or src.get("original") or src.get("large")
        thumb = src.get("medium") or src.get("small") or src.get("tiny")
        if not full:
            continue
        photographer = p.get("photographer", "") or ""
        out.append(PhotoResult(
            source="pexels",
            id=str(p.get("id", "")),
            title=(p.get("alt") or query).strip()[:120],
            thumb_url=thumb or full,
            full_url=full,
            width=int(p.get("width") or 0),
            height=int(p.get("height") or 0),
            photographer=photographer,
            source_page=p.get("url", ""),
            license_name="Pexels License",
            attribution_required=False,
            attribution_text="",
            extra={"optional_credit": f"Photo by {photographer} on Pexels" if photographer else ""},
        ))
    return out


# ---------------------------------------------------------------------------
# Wikimedia Commons  (no key; keep only AttributionRequired == "false")
# ---------------------------------------------------------------------------

_PD_WHITELIST = ("cc0", "public domain", "pdm", "pd-", "no restrictions")


def _wikimedia_is_free(meta):
    """True only when the file is safe to use with no attribution."""
    attr = (meta.get("AttributionRequired", {}) or {}).get("value", "")
    if isinstance(attr, str) and attr.lower() == "false":
        # Guard against multi-licensed files that still carry a BY option.
        lic = (meta.get("LicenseShortName", {}) or {}).get("value", "").lower()
        if " by" in lic or lic.startswith("cc by"):
            return False
        return True
    # Fallback: explicit public-domain markers when AttributionRequired absent.
    if not attr:
        lic = (meta.get("LicenseShortName", {}) or {}).get("value", "").lower()
        return any(w in lic for w in _PD_WHITELIST)
    return False


def search_wikimedia(query, orientation=None, limit=12):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",          # File: namespace
        "gsrlimit": str(min(50, max(limit * 3, 15))),  # over-fetch; we filter
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime",
        "iiurlwidth": "400",
        "iiextmetadatafilter": "LicenseShortName|AttributionRequired|Artist|ImageDescription",
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    data = http_json(url)
    pages = (data.get("query", {}) or {}).get("pages", {}) or {}
    # Preserve search rank via the 'index' field MediaWiki returns.
    ordered = sorted(pages.values(), key=lambda p: p.get("index", 1e9))
    out = []
    for p in ordered:
        info = (p.get("imageinfo") or [{}])[0]
        full = info.get("url", "")
        mime = info.get("mime", "")
        if not full or not (_RASTER_RE.search(full) or mime.startswith("image/")):
            continue
        if mime and not mime.startswith("image/"):
            continue
        # Drop SVG/TIFF that browsers can't render in a layout.
        if full.lower().endswith((".svg", ".tif", ".tiff", ".pdf", ".ogv", ".webm")):
            continue
        meta = info.get("extmetadata", {}) or {}
        if not _wikimedia_is_free(meta):
            continue
        w, h = int(info.get("width") or 0), int(info.get("height") or 0)
        if not _orientation_ok(w, h, orientation):
            continue
        lic = (meta.get("LicenseShortName", {}) or {}).get("value", "Public domain")
        title = (p.get("title", "File:") or "File:").split("File:", 1)[-1]
        title = os.path.splitext(title)[0].replace("_", " ").strip()
        out.append(PhotoResult(
            source="wikimedia",
            id=str(p.get("pageid", "")),
            title=title[:120],
            thumb_url=info.get("thumburl", "") or full,
            full_url=full,
            width=w,
            height=h,
            photographer=_strip_html((meta.get("Artist", {}) or {}).get("value", "")),
            source_page=info.get("descriptionurl", ""),
            license_name=lic,
            attribution_required=False,
            attribution_text="",
            extra={},
        ))
        if len(out) >= limit:
            break
    return out


# ---------------------------------------------------------------------------
# Rawpixel  (no key; tags=$publicdomain + per-result license == cc0 gate)
# ---------------------------------------------------------------------------

def _rawpixel_urls(r):
    """Return (full_url, thumb_url) for a Rawpixel result.

    style_uri is a template like '.../{}/<base64>.jpg' where {} is a size token.
    google_teaser (image_800) and pinterestImage (image_social_square) are
    confirmed-fetchable fallbacks.
    """
    style = r.get("style_uri") or ""
    full = style.replace("{}", "image_1300") if "{}" in style else ""
    thumb = style.replace("{}", "image_500") if "{}" in style else ""
    full = full or r.get("google_teaser") or r.get("pinterestImage") or ""
    thumb = thumb or r.get("pinterestImage") or r.get("google_teaser") or full
    # google_teaser (image_800) is the verified-good fallback if image_1300 404s.
    fallback = r.get("google_teaser") or r.get("pinterestImage") or full
    return full, thumb, fallback


def search_rawpixel(query, orientation=None, limit=12):
    params = {
        "tags": "$publicdomain",   # this filter actually returns 100% CC0
        "html": "0",
        "page": "1",
        "keyword": query,
    }
    url = "https://www.rawpixel.com/api/v1/search?" + urllib.parse.urlencode(params)
    data = http_json(url, headers={"Accept": "application/json"})
    out = []
    for r in data.get("results", []) or []:
        meta = r.get("metadata", {}) or {}
        # Hard CC0 gate — never trust the query param alone.
        if not (meta.get("license") == "cc0" or meta.get("isCC0License") is True):
            continue
        full, thumb, fallback = _rawpixel_urls(r)
        if not full:
            continue
        w, h = int(r.get("width") or 0), int(r.get("height") or 0)
        if not _orientation_ok(w, h, orientation):
            continue
        title = re.split(r"\s*\|\s*", meta.get("title", "") or query)[0].strip()
        artists = meta.get("artist_names") or []
        out.append(PhotoResult(
            source="rawpixel",
            id=str(r.get("id", "")),
            title=title[:120] or query,
            thumb_url=thumb,
            full_url=full,
            width=w,
            height=h,
            photographer=", ".join(a for a in artists if a),
            source_page=r.get("url", ""),
            license_name="CC0 1.0 (Public Domain)",
            attribution_required=False,
            attribution_text="",
            extra={"fallback_url": fallback},
        ))
        if len(out) >= limit:
            break
    return out


# ---------------------------------------------------------------------------
# Unsplash  (key required; attribution required by API ToS -> labeled)
# ---------------------------------------------------------------------------

_UTM = "?utm_source=photo_forager&utm_medium=referral"


def search_unsplash(query, orientation=None, limit=12):
    key = os.environ.get(UNSPLASH_KEY_ENV)
    if not key:
        raise RuntimeError(f"{UNSPLASH_KEY_ENV} not set")
    o = {"square": "squarish"}.get(orientation, orientation)
    params = {"query": query, "per_page": max(1, min(30, limit))}
    if o in ("landscape", "portrait", "squarish"):
        params["orientation"] = o
    url = "https://api.unsplash.com/search/photos?" + urllib.parse.urlencode(params)
    data = http_json(url, headers={"Authorization": f"Client-ID {key}"})
    out = []
    for p in data.get("results", []):
        urls = p.get("urls", {})
        full = urls.get("regular") or urls.get("full") or urls.get("raw")
        thumb = urls.get("small") or urls.get("thumb")
        if not full:
            continue
        user = p.get("user", {}) or {}
        name = user.get("name", "") or "Unknown"
        prof = (user.get("links", {}) or {}).get("html", "https://unsplash.com")
        credit = (f"Photo by {name} ({prof}{_UTM}) on "
                  f"Unsplash (https://unsplash.com{_UTM})")
        out.append(PhotoResult(
            source="unsplash",
            id=str(p.get("id", "")),
            title=(p.get("alt_description") or p.get("description") or query).strip()[:120],
            thumb_url=thumb or full,
            full_url=full,
            width=int(p.get("width") or 0),
            height=int(p.get("height") or 0),
            photographer=name,
            source_page=(p.get("links", {}) or {}).get("html", ""),
            license_name="Unsplash License (API ToS requires credit)",
            attribution_required=True,
            attribution_text=credit,
            # download_location must be pinged on download per Unsplash ToS.
            extra={"download_location": (p.get("links", {}) or {}).get("download_location", "")},
        ))
    return out


_ADAPTERS = {
    "pexels": search_pexels,
    "wikimedia": search_wikimedia,
    "rawpixel": search_rawpixel,
    "unsplash": search_unsplash,
}


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def available_sources():
    """Return {source: status} where status is 'ready' | 'needs key (<ENV>)'."""
    load_env()
    status = {}
    for s in SOURCE_ORDER:
        if s in KEYLESS_SOURCES:
            status[s] = "ready"
        else:
            env = KEYED_SOURCES[s]
            status[s] = "ready" if os.environ.get(env) else f"needs key ({env})"
    return status


def search_all(query, sources=None, orientation=None, limit=12, free_only=False):
    """Search the requested sources, gate licenses, and interleave results.

    Returns (results, notes). `notes` carries human-readable warnings (missing
    keys, source errors) without aborting the whole search.
    """
    load_env()
    requested = sources or list(SOURCE_ORDER)
    notes = []
    collected = {s: [] for s in SOURCE_ORDER}

    # Pull a generous slice per source; we trim after interleaving.
    per_source = max(limit, 8)

    for s in requested:
        if s not in _ADAPTERS:
            notes.append(f"unknown source '{s}' skipped")
            continue
        if s in KEYED_SOURCES and not os.environ.get(KEYED_SOURCES[s]):
            notes.append(f"{s}: skipped — set {KEYED_SOURCES[s]} in .env to enable")
            continue
        try:
            collected[s] = _ADAPTERS[s](query, orientation=orientation, limit=per_source)
        except urllib.error.HTTPError as e:
            notes.append(f"{s}: HTTP {e.code} — skipped")
        except Exception as e:  # resilient: one bad source never kills the run
            notes.append(f"{s}: error ({type(e).__name__}) — skipped")

    if free_only:
        for s in collected:
            collected[s] = [r for r in collected[s] if not r.attribution_required]

    # Round-robin interleave in SOURCE_ORDER (attribution-free first).
    results = []
    pools = {s: list(collected[s]) for s in SOURCE_ORDER}
    while len(results) < limit and any(pools[s] for s in SOURCE_ORDER):
        for s in SOURCE_ORDER:
            if pools[s]:
                results.append(pools[s].pop(0))
                if len(results) >= limit:
                    break
    return results, notes
