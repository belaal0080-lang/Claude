"""NIH BioArt Source fetcher implementation."""

import time
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import json
import re
import sys

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem, DownloadResult
from fetchers.base import BaseFetcher


class BioArtFetcher(BaseFetcher):
    """Fetcher for NIH BioArt Source.

    Requires a pre-built JSON index created by bioart_crawler.py.
    Searches the index and fetches files from the BioArt API.
    """

    BASE_URL = "https://bioart.niaid.nih.gov"
    INDEX_FILE = Path(__file__).parent.parent.parent / "bioart_index.json"

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for media on BioArt using the JSON index."""
        # Check if index exists
        if not self.INDEX_FILE.exists():
            raise FileNotFoundError(
                f"BioArt index not found at {self.INDEX_FILE}. "
                "Please run bioart_crawler.py to build the index."
            )

        # Load index
        with open(self.INDEX_FILE, "r", encoding="utf-8") as f:
            index = json.load(f)

        # Search index
        query_terms = query.lower().split()
        results = []

        for item_id, item in index.items():
            score = 0

            # Search in bioart_id (exact ID match)
            if query.lower() in item["bioart_id"].lower():
                score += 100

            # Search in title
            title_lower = item["title"].lower()
            for term in query_terms:
                if term in title_lower:
                    score += 10

            # Search in description
            description_lower = item.get("description", "").lower()
            for term in query_terms:
                if term in description_lower:
                    score += 7

            # Search in keywords
            keywords_lower = [k.lower() for k in item.get("keywords", [])]
            for term in query_terms:
                if term in keywords_lower:
                    score += 5

            # Bonus for items with files
            if item.get("has_files", False):
                score += 1

            if score > 0:
                results.append((score, item))

        # Sort by relevance
        results.sort(key=lambda x: x[0], reverse=True)

        # If user requests specific types (svg, png), prefer items with
        # multiple file endpoints (they likely have SVG + PNG + AI)
        if file_types:
            ft_lower = [t.lower() for t in file_types]
            if "svg" in ft_lower:
                # Boost items with multiple endpoints (more likely to have SVG)
                results = [
                    (score + (5 if len(item.get("file_endpoints", [])) > 1 else 0), item)
                    for score, item in results
                ]
                results.sort(key=lambda x: x[0], reverse=True)

        # Convert to MediaItems (limit results)
        media_items = []
        for score, item in results[:limit]:
            try:
                media_item = await self._convert_to_media_item(item, preferred_types=file_types)
                if media_item:
                    media_items.append(media_item)
            except Exception:
                continue

        return media_items

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific BioArt item.

        Args:
            item_id: BioArt item ID (numeric, e.g., "631")
        """
        # Fetch fresh details from the website
        detail_url = f"{self.BASE_URL}/bioart/{item_id}"

        await self._rate_limit_wait()
        client = await self.get_client()
        response = await client.get(detail_url)
        response.raise_for_status()
        html = response.text

        # Extract file endpoints
        file_endpoints = self._extract_file_endpoints(html, item_id)

        # Parse HTML for metadata
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, "html.parser")

        # Extract title
        title_tag = soup.find("title")
        title = title_tag.text.strip() if title_tag else f"BioArt Item {item_id}"

        if title == "BioArt":
            title = f"BioArt Item {item_id}"

        # Extract license info
        license_text = "Unknown"
        if "Public Domain" in html:
            license_text = "Public Domain"
        elif "CC-BY" in html or "CC BY" in html:
            license_text = "CC-BY"

        # Determine download URL - prefer PNG format
        download_url = ""
        file_type = "png"

        if file_endpoints:
            # Try to find PNG format
            png_endpoint = None
            for endpoint in file_endpoints:
                # Fetch endpoint to check content-type
                # For now, just use first endpoint
                png_endpoint = endpoint
                break

            if png_endpoint:
                download_url = png_endpoint["full_url"]

        # Create attribution
        attribution = (
            f"NIAID Visual & Medical Arts, BioArt Source, {detail_url}"
        )

        return MediaItem(
            id=item_id,
            title=title,
            source="bioart",
            url=detail_url,
            download_url=download_url,
            file_type=file_type,
            description=f"NIH BioArt scientific illustration. ID: BIOART-{item_id.zfill(6)}",
            license=license_text,
            attribution=attribution,
            metadata={
                "detail_url": detail_url,
                "file_endpoints": file_endpoints,
                "bioart_id": f"BIOART-{item_id.zfill(6)}",
            },
        )

    # Map Content-Type to file extension
    CONTENT_TYPE_MAP = {
        "image/png": "png",
        "image/svg+xml": "svg",
        "image/jpeg": "jpg",
        "image/gif": "gif",
        "application/postscript": "eps",
        "application/pdf": "pdf",
        "application/illustrator": "ai",
        "application/octet-stream": "png",  # fallback
    }

    async def _convert_to_media_item(
        self, item: Dict[str, Any], preferred_types: Optional[List[str]] = None
    ) -> Optional[MediaItem]:
        """Convert index item to MediaItem.

        Args:
            item: Index entry for a BioArt illustration
            preferred_types: Optional list of preferred file types (e.g., ["svg", "png"])
        """
        item_id = str(item["id"])

        # Get file endpoints
        file_endpoints = item.get("file_endpoints", [])

        # Default download URL and type
        download_url = ""
        file_type = "png"

        if file_endpoints:
            download_url = file_endpoints[0]["url"]

        return MediaItem(
            id=item_id,
            title=item["title"],
            source="bioart",
            url=item["url"],
            download_url=download_url,
            file_type=file_type,
            description=item.get("description", ""),
            license=item.get("license", "Unknown"),
            attribution=f"NIAID Visual & Medical Arts, BioArt Source, {item['url']}",
            metadata={
                "file_endpoints": file_endpoints,
                "keywords": item.get("keywords", []),
                "bioart_id": item["bioart_id"],
                "available_formats": len(file_endpoints),
            },
        )

    async def download(
        self,
        media_item: MediaItem,
        destination: Path,
        filename: Optional[str] = None,
    ) -> DownloadResult:
        """Override download to detect actual file type from Content-Type header.

        BioArt endpoints are format-agnostic (/api/bioarts/{id}/files/{fid})
        so we must read the Content-Type to know if it's PNG, SVG, AI, etc.
        """
        start_time = time.time()

        try:
            destination.mkdir(parents=True, exist_ok=True)

            # Try to pick a preferred endpoint if multiple are available
            file_endpoints = media_item.metadata.get("file_endpoints", [])
            download_url = media_item.download_url

            # If multiple endpoints, probe to find available formats
            if len(file_endpoints) > 1:
                # User may have set preferred types — check metadata
                # For now, just detect the type of what we're downloading
                pass

            # Stream download and detect type from response headers
            client = await self.get_client()
            await self._rate_limit_wait()

            async with client.stream("GET", download_url) as response:
                response.raise_for_status()

                # Detect actual format from Content-Type
                content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
                detected_type = self.CONTENT_TYPE_MAP.get(content_type, "png")

                # Update the media item's file_type with the real format
                media_item.file_type = detected_type

                # Generate filename with correct extension
                if filename is None:
                    filename = self._generate_filename(media_item)

                file_path = destination / filename

                with open(file_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)

            file_size = file_path.stat().st_size
            duration = time.time() - start_time
            media_item.local_path = str(file_path)

            return DownloadResult(
                success=True,
                media_item=media_item,
                local_path=str(file_path),
                file_size=file_size,
                duration_seconds=duration,
            )

        except Exception as e:
            duration = time.time() - start_time
            return DownloadResult(
                success=False,
                media_item=media_item,
                error=str(e),
                duration_seconds=duration,
            )

    async def download_as(
        self,
        media_item: MediaItem,
        destination: Path,
        preferred_type: str = "png",
    ) -> DownloadResult:
        """Download a specific format variant of a BioArt illustration.

        Probes all file endpoints to find the requested format (e.g., "svg").

        Args:
            media_item: MediaItem to download
            destination: Directory to save to
            preferred_type: Desired format ("png", "svg", "ai", "eps")
        """
        file_endpoints = media_item.metadata.get("file_endpoints", [])

        if not file_endpoints:
            return DownloadResult(
                success=False, media_item=media_item,
                error="No file endpoints available",
            )

        # Probe endpoints to find the requested format
        best_url, best_type = await self._pick_best_endpoint(
            file_endpoints, [preferred_type]
        )

        if best_type != preferred_type and len(file_endpoints) > 1:
            # None of the endpoints matched the preferred type
            pass  # Fall through to download what we have

        # Temporarily update the media item for download
        original_url = media_item.download_url
        media_item.download_url = best_url
        media_item.file_type = best_type

        result = await self.download(media_item, destination)

        # Restore
        media_item.download_url = original_url

        return result

    async def _detect_file_type(self, url: str) -> str:
        """Detect file type by reading magic bytes (BioArt sends no Content-Type).

        Args:
            url: BioArt file endpoint URL

        Returns:
            File extension (e.g., "png", "svg", "jpg")
        """
        try:
            await self._rate_limit_wait()
            client = await self.get_client()
            # Download first 200 bytes to check magic bytes
            async with client.stream("GET", url) as response:
                first_bytes = b""
                async for chunk in response.aiter_bytes(chunk_size=200):
                    first_bytes = chunk
                    break  # Only need the first chunk

            if first_bytes[:8] == b'\x89PNG\r\n\x1a\n':
                return "png"
            elif first_bytes[:2] == b'\xff\xd8':
                return "jpg"
            elif b'<svg' in first_bytes or b'<?xml' in first_bytes:
                return "svg"
            elif first_bytes[:4] == b'%PDF':
                return "pdf"
            elif first_bytes[:3] == b'GIF':
                return "gif"
            elif b'%!' in first_bytes[:10]:
                return "eps"
            else:
                return "png"  # fallback
        except Exception:
            return "png"  # fallback

    async def _pick_best_endpoint(
        self, file_endpoints: List[Dict[str, str]], preferred_types: Optional[List[str]] = None
    ) -> tuple:
        """Pick the best file endpoint based on user's preferred types.

        Probes endpoints with HEAD requests to detect Content-Type,
        then picks the one matching the user's preference.

        Args:
            file_endpoints: List of endpoint dicts with 'url' keys
            preferred_types: Desired types like ["svg", "png"]

        Returns:
            Tuple of (download_url, file_type)
        """
        if not file_endpoints:
            return ("", "png")

        # If only one endpoint or no preference, detect type of first endpoint
        if len(file_endpoints) == 1 or not preferred_types:
            url = file_endpoints[0].get("url", file_endpoints[0].get("full_url", ""))
            detected = await self._detect_file_type(url)
            return (url, detected)

        # Probe each endpoint to find format
        endpoint_types = []
        for ep in file_endpoints:
            url = ep.get("url", ep.get("full_url", ""))
            detected = await self._detect_file_type(url)
            endpoint_types.append((url, detected))

        # Match user preference in order
        pref_lower = [t.lower() for t in preferred_types]
        for pref in pref_lower:
            for url, ft in endpoint_types:
                if ft == pref:
                    return (url, ft)

        # No match — return first
        return endpoint_types[0] if endpoint_types else ("", "png")

    def _extract_file_endpoints(self, html: str, item_id: str) -> List[Dict[str, str]]:
        """Extract file endpoints from detail page HTML."""
        # Pattern: /api/bioarts/{id}/files/{file_id}
        file_pattern = re.compile(r"/api/bioarts/(\d+)/files/(\d+)")
        file_matches = file_pattern.findall(html)

        file_endpoints = []
        seen_files = set()

        for bioart_id, file_id in file_matches:
            if file_id not in seen_files:
                endpoint = f"/api/bioarts/{bioart_id}/files/{file_id}"
                full_url = f"{self.BASE_URL}{endpoint}"
                file_endpoints.append(
                    {
                        "file_id": file_id,
                        "endpoint": endpoint,
                        "full_url": full_url,
                    }
                )
                seen_files.add(file_id)

        return file_endpoints
