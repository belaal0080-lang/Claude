"""Wikimedia Commons fetcher implementation."""

from typing import List, Optional, Dict, Any
from datetime import datetime
import urllib.parse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class WikimediaFetcher(BaseFetcher):
    """Fetcher for Wikimedia Commons."""

    API_URL = "https://commons.wikimedia.org/w/api.php"
    BASE_URL = "https://commons.wikimedia.org"

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers with Wikimedia-compliant User-Agent."""
        # Wikimedia requires a descriptive User-Agent with contact info
        # See: https://www.mediawiki.org/wiki/API:Etiquette
        return {
            "User-Agent": "FetchMediaSkill/1.0 (https://github.com/anthropics/claude-code; educational/research tool)",
            "Accept": "application/json",
        }

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for media on Wikimedia Commons."""
        await self._rate_limit_wait()
        client = await self.get_client()

        # Build search query with file type filter if specified
        search_query = query
        if file_types:
            type_filters = " OR ".join(f"filetype:{ft}" for ft in file_types)
            search_query = f"{query} ({type_filters})"

        # Search parameters
        params = {
            "action": "query",
            "list": "search",
            "srsearch": search_query,
            "srnamespace": "6",  # File namespace
            "srlimit": str(limit),
            "srprop": "size|wordcount|timestamp|snippet",
            "format": "json",
        }

        response = await client.get(self.API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        if "query" in data and "search" in data["query"]:
            for item in data["query"]["search"]:
                try:
                    # Get detailed info for each file
                    media_item = await self._get_file_info(item["title"])
                    if media_item:
                        results.append(media_item)
                except Exception:
                    # Skip items that fail to fetch
                    continue

        return results

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific file."""
        return await self._get_file_info(item_id)

    async def _get_file_info(self, title: str) -> Optional[MediaItem]:
        """Get detailed file information from Wikimedia Commons."""
        await self._rate_limit_wait()
        client = await self.get_client()

        # Ensure title starts with "File:"
        if not title.startswith("File:"):
            title = f"File:{title}"

        params = {
            "action": "query",
            "titles": title,
            "prop": "imageinfo|categories",
            "iiprop": "url|size|mime|extmetadata|user|timestamp",
            "format": "json",
        }

        response = await client.get(self.API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if "query" not in data or "pages" not in data["query"]:
            return None

        # Get the first (and should be only) page
        pages = data["query"]["pages"]
        page_id = list(pages.keys())[0]

        if page_id == "-1":  # Page not found
            return None

        page = pages[page_id]
        if "imageinfo" not in page or not page["imageinfo"]:
            return None

        info = page["imageinfo"][0]
        extmetadata = info.get("extmetadata", {})

        # Extract file extension from mime type or filename
        mime_type = info.get("mime", "")
        file_type = mime_type.split("/")[-1] if "/" in mime_type else ""
        if not file_type:
            # Fallback to extension from filename
            filename = title.split(":")[-1]
            file_type = filename.split(".")[-1] if "." in filename else "unknown"

        # Build description from available metadata
        description = ""
        if "ImageDescription" in extmetadata:
            desc_data = extmetadata["ImageDescription"]
            description = desc_data.get("value", "")
            # Remove HTML tags from description
            from bs4 import BeautifulSoup

            description = BeautifulSoup(description, "html.parser").get_text()

        # Extract license information
        license_short_name = ""
        license_url = ""
        if "LicenseShortName" in extmetadata:
            license_short_name = extmetadata["LicenseShortName"].get("value", "")
        if "LicenseUrl" in extmetadata:
            license_url = extmetadata["LicenseUrl"].get("value", "")

        license_info = license_short_name
        if license_url:
            license_info = f"{license_short_name} ({license_url})"

        # Build attribution
        attribution = self._build_attribution(title, extmetadata, info)

        # Extract artist/author
        artist = ""
        if "Artist" in extmetadata:
            artist_html = extmetadata["Artist"].get("value", "")
            # Remove HTML tags
            from bs4 import BeautifulSoup

            artist = BeautifulSoup(artist_html, "html.parser").get_text()
        if not artist and "user" in info:
            artist = info["user"]

        # Parse timestamp
        created_date = None
        if "timestamp" in info:
            try:
                created_date = datetime.fromisoformat(
                    info["timestamp"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        # Create MediaItem
        return MediaItem(
            id=page["title"],
            title=page["title"].replace("File:", ""),
            source="wikimedia",
            url=f"{self.BASE_URL}/wiki/{urllib.parse.quote(page['title'])}",
            download_url=info["url"],
            file_type=file_type,
            file_size=info.get("size"),
            thumbnail_url=info.get("thumburl"),
            description=description,
            license=license_info,
            attribution=attribution,
            width=info.get("width"),
            height=info.get("height"),
            author=artist,
            created_date=created_date,
            metadata={
                "mime_type": mime_type,
                "page_id": page_id,
                "extmetadata": extmetadata,
            },
        )

    def _build_attribution(
        self, title: str, extmetadata: Dict, info: Dict
    ) -> str:
        """Build proper attribution text for Wikimedia Commons file."""
        parts = []

        # Artist
        artist = ""
        if "Artist" in extmetadata:
            artist_html = extmetadata["Artist"].get("value", "")
            from bs4 import BeautifulSoup

            artist = BeautifulSoup(artist_html, "html.parser").get_text()
        if not artist and "user" in info:
            artist = info["user"]
        if artist:
            parts.append(f"{artist}")

        # License
        if "LicenseShortName" in extmetadata:
            license_name = extmetadata["LicenseShortName"].get("value", "")
            if license_name:
                parts.append(license_name)

        # Source
        parts.append("via Wikimedia Commons")

        # URL
        url = f"{self.BASE_URL}/wiki/{urllib.parse.quote(title)}"
        parts.append(url)

        return ", ".join(parts)
