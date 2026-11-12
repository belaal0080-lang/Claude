"""photo-forager command-line interface.

  forage search "autumn forest"            # search, print candidates, cache them
  forage search "logo mockup" --json       # machine-readable (for agents/skills)
  forage download --pick 1,3,5             # download chosen candidates + manifest
  forage sources                           # show which sources are enabled

The two-step search -> download flow lets you (or an agent) eyeball the
candidate licenses before committing bytes to disk.
"""

import os
import sys
import json
import argparse

from photo_forager import __version__
from photo_forager.sources import (
    search_all, available_sources, PhotoResult, SOURCE_ORDER,
)
from photo_forager.download import download_results, print_download_summary

CACHE_DIR = os.path.expanduser("~/.cache/photo-forager")
CACHE_FILE = os.path.join(CACHE_DIR, "last.json")


# ---------------------------------------------------------------------------
# Cache (bridges `search` -> `download --pick`)
# ---------------------------------------------------------------------------

def _save_cache(query, results):
    os.makedirs(CACHE_DIR, exist_ok=True)
    payload = {"query": query, "results": [r.to_dict() for r in results]}
    with open(CACHE_FILE, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)


def _load_results(path):
    with open(path, "r", encoding="utf-8") as fh:
        payload = json.load(fh)
    out = []
    for d in payload.get("results", []):
        out.append(PhotoResult(
            source=d["source"], id=d["id"], title=d.get("title", ""),
            thumb_url=d.get("thumb_url", ""), full_url=d.get("full_url", ""),
            width=d.get("width", 0), height=d.get("height", 0),
            photographer=d.get("photographer", ""), source_page=d.get("source_page", ""),
            license_name=d.get("license_name", ""),
            attribution_required=d.get("attribution_required", False),
            attribution_text=d.get("attribution_text", ""),
            extra=d.get("extra", {}),
        ))
    return out


# ---------------------------------------------------------------------------
# Pretty printing
# ---------------------------------------------------------------------------

def _flag(r):
    return "⚠ needs-credit" if r.attribution_required else "✓ free"


def _print_table(query, results, notes):
    print(f'\nphoto-forager — "{query}"  ({len(results)} candidates)\n', file=sys.stderr)
    for i, r in enumerate(results, 1):
        dims = f"{r.width}x{r.height}" if r.width and r.height else "?"
        print(f"[{i:>2}] {r.source:<9} {_flag(r):<14} {dims:>11}  {r.title}", file=sys.stderr)
        print(f"     {r.thumb_url}", file=sys.stderr)
    if notes:
        print("\nnotes:", file=sys.stderr)
        for n in notes:
            print(f"  - {n}", file=sys.stderr)
    if results:
        print(f'\nnext: forage download --pick 1,2,3   (then see ./photos/CREDITS.md)',
              file=sys.stderr)


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_search(args):
    sources = None
    if args.sources:
        sources = [s.strip() for s in args.sources.split(",") if s.strip()]
    results, notes = search_all(
        args.query,
        sources=sources,
        orientation=args.orientation,
        limit=args.limit,
        free_only=args.free_only,
    )
    _save_cache(args.query, results)
    if args.json:
        json.dump(
            {"query": args.query,
             "results": [r.to_dict() for r in results],
             "notes": notes,
             "cache_file": CACHE_FILE},
            sys.stdout, indent=2, ensure_ascii=False,
        )
        print()
    else:
        _print_table(args.query, results, notes)
    return 0 if results else 1


def cmd_download(args):
    path = args.from_file or CACHE_FILE
    if not os.path.isfile(path):
        print(f"no cached results at {path} — run `forage search ...` first",
              file=sys.stderr)
        return 1
    results = _load_results(path)
    if args.pick:
        idxs = []
        for tok in args.pick.split(","):
            tok = tok.strip()
            if "-" in tok:  # support ranges like 1-4
                a, b = tok.split("-", 1)
                idxs.extend(range(int(a), int(b) + 1))
            elif tok:
                idxs.append(int(tok))
        chosen = [results[i - 1] for i in idxs if 1 <= i <= len(results)]
    else:
        chosen = results
    if not chosen:
        print("nothing to download (check your --pick indices)", file=sys.stderr)
        return 1
    manifest, errors = download_results(chosen, args.out)
    print_download_summary(manifest, errors, args.out)
    if args.json:
        json.dump({"out_dir": args.out, "manifest": manifest, "errors": errors},
                  sys.stdout, indent=2, ensure_ascii=False)
        print()
    return 0 if manifest else 1


def cmd_sources(args):
    status = available_sources()
    print("photo-forager sources:\n", file=sys.stderr)
    for s in SOURCE_ORDER:
        st = status[s]
        mark = "●" if st == "ready" else "○"
        print(f"  {mark} {s:<10} {st}", file=sys.stderr)
    print("\nWikimedia & Rawpixel work with no key. Add keys to "
          "~/Tools/photo-forager/.env to enable Pexels/Unsplash.", file=sys.stderr)
    if args.json:
        json.dump(status, sys.stdout, indent=2)
        print()
    return 0


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def build_parser():
    p = argparse.ArgumentParser(
        prog="forage",
        description="Search free, no-attribution stock photos "
                    "(Pexels, Wikimedia CC0/PD, Rawpixel CC0, Unsplash labeled).",
    )
    p.add_argument("--version", action="version", version=f"photo-forager {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("search", help="search sources and list candidates")
    s.add_argument("query", help="what to search for, e.g. \"autumn forest path\"")
    s.add_argument("--sources", help="comma list: pexels,wikimedia,rawpixel,unsplash")
    s.add_argument("--orientation", choices=["landscape", "portrait", "square"])
    s.add_argument("--limit", type=int, default=12, help="max candidates (default 12)")
    s.add_argument("--free-only", action="store_true",
                   help="drop attribution-required results (excludes Unsplash)")
    s.add_argument("--json", action="store_true", help="machine-readable output")
    s.set_defaults(func=cmd_search)

    d = sub.add_parser("download", help="download chosen candidates + write manifest")
    d.add_argument("--pick", help="indices from last search, e.g. 1,3,5 or 1-4")
    d.add_argument("--out", default="./photos", help="output dir (default ./photos)")
    d.add_argument("--from", dest="from_file", help="results JSON (default: last search)")
    d.add_argument("--json", action="store_true", help="machine-readable output")
    d.set_defaults(func=cmd_download)

    o = sub.add_parser("sources", help="show which sources are enabled")
    o.add_argument("--json", action="store_true")
    o.set_defaults(func=cmd_sources)
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
