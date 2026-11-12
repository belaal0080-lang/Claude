"""NASA Images API fetcher implementation."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class NASAFetcher(BaseFetcher):
    """Fetcher for NASA Images API.

    Provides access to NASA's image and video library including space photography,
    Earth imagery, mission photos, and more. No authentication required.

    Supports multi-word queries like "Mars rover Curiosity" or "Hubble telescope".
    """

    BASE_URL = "https://images-api.nasa.gov"

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for media on NASA Images API.

        Args:
            query: Search query (supports multi-word queries)
            file_types: Optional list of file types (jpg, png, tif, etc.)
            limit: Maximum number of results

        Returns:
            List of MediaItem objects
        """
        await self._rate_limit_wait()
        client = await self.get_client()

        # Build search parameters
        params = {
            "q": query,
            "media_type": "image",  # Focus on images
        }

        # Make request
        search_url = f"{self.BASE_URL}/search"
        response = await client.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()

        # Parse results
        media_items = []
        collection = data.get("collection", {})
        items = collection.get("items", [])

        for item in items[:limit]:
            try:
                media_item = self._parse_item(item)
                if media_item:
                    # Filter by file type if specified
                    if file_types:
                        if media_item.file_type in file_types:
                            media_items.append(media_item)
                    else:
                        media_items.append(media_item)
            except Exception:
                continue

        return media_items

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific NASA item.

        Args:
            item_id: NASA ID (e.g., "NHQ201905310044")

        Returns:
            MediaItem with complete details
        """
        # Search for specific NASA ID
        await self._rate_limit_wait()
        client = await self.get_client()

        params = {
            "nasa_id": item_id,
        }

        search_url = f"{self.BASE_URL}/search"
        response = await client.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()

        # Parse result
        collection = data.get("collection", {})
        items = collection.get("items", [])

        if not items:
            raise ValueError(f"NASA item {item_id} not found")

        return self._parse_item(items[0])

    def _parse_item(self, item: Dict[str, Any]) -> Optional[MediaItem]:
        """Parse a NASA API item into a MediaItem.

        Args:
            item: Raw item from NASA API

        Returns:
            MediaItem or None if parsing fails
        """
        # Extract metadata
        data_list = item.get("data", [])
        if not data_list:
            return None

        data = data_list[0]

        # Extract links (images)
        links = item.get("links", [])
        if not links:
            return None

        # Find best quality image link
        # Priority: large > medium > small > thumb
        download_url = ""
        file_type = "jpg"
        width = None
        height = None
        file_size = None

        for link in links:
            if link.get("render") == "image":
                href = link.get("href", "")
                if "~large" in href or "~orig" in href:
                    download_url = href
                    width = link.get("width")
                    height = link.get("height")
                    file_size = link.get("size")
                    # Determine file type from URL
                    if ".tif" in href:
                        file_type = "tif"
                    elif ".png" in href:
                        file_type = "png"
                    else:
                        file_type = "jpg"
                    break

        # If no large image found, use first available
        if not download_url:
            for link in links:
                if link.get("render") == "image":
                    download_url = link.get("href", "")
                    width = link.get("width")
                    height = link.get("height")
                    file_size = link.get("size")
                    if ".tif" in download_url:
                        file_type = "tif"
                    elif ".png" in download_url:
                        file_type = "png"
                    else:
                        file_type = "jpg"
                    break

        # Get thumbnail for preview
        thumbnail_url = None
        for link in links:
            if link.get("rel") == "preview":
                thumbnail_url = link.get("href")
                break

        # Extract metadata
        nasa_id = data.get("nasa_id", "")
        title = data.get("title", f"NASA Image {nasa_id}")
        description = data.get("description", "")
        keywords = data.get("keywords", [])

        # Parse date
        date_created_str = data.get("date_created", "")
        date_created = None
        if date_created_str:
            try:
                # NASA format: "2019-05-31T00:00:00Z"
                date_created = datetime.fromisoformat(date_created_str.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                date_created = None

        photographer = data.get("photographer", "")
        center = data.get("center", "NASA")
        location = data.get("location", "")

        # Build page URL
        url = f"https://images.nasa.gov/details/{nasa_id}"

        # Build attribution
        attribution_parts = []
        if photographer:
            attribution_parts.append(photographer)
        else:
            attribution_parts.append(center if center else "NASA")
        attribution_parts.append(f"NASA Image Library, {url}")
        attribution = ", ".join(attribution_parts)

        return MediaItem(
            id=nasa_id,
            title=title,
            source="nasa",
            url=url,
            download_url=download_url,
            file_type=file_type,
            file_size=file_size,
            thumbnail_url=thumbnail_url,
            description=description,
            license="Public Domain (unless otherwise noted)",
            attribution=attribution,
            width=width,
            height=height,
            author=photographer if photographer else center,
            created_date=date_created,
            metadata={
                "nasa_id": nasa_id,
                "keywords": keywords,
                "center": center,
                "location": location,
                "photographer": photographer,
            },
        )
