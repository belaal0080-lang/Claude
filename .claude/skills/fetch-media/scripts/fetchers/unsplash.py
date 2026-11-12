"""Unsplash fetcher implementation."""

from typing import List, Optional, Dict, Any
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class UnsplashFetcher(BaseFetcher):
    """Fetcher for Unsplash."""

    API_URL = "https://api.unsplash.com"
    BASE_URL = "https://unsplash.com"

    def __init__(self, config: Dict[str, Any]):
        """Initialize Unsplash fetcher.

        Args:
            config: Configuration dictionary with 'api_key' required

        Raises:
            ValueError: If API key is not provided
        """
        super().__init__(config)
        self.api_key = config.get("api_key")
        if not self.api_key:
            raise ValueError(
                "Unsplash API key is required. Set UNSPLASH_API_KEY in .env file."
            )

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers with authorization."""
        headers = super()._get_headers()
        headers["Authorization"] = f"Client-ID {self.api_key}"
        return headers

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for photos on Unsplash."""
        await self._rate_limit_wait()
        client = await self.get_client()

        # Unsplash limits to 30 results per page
        per_page = min(limit, 30)

        params = {
            "query": query,
            "per_page": str(per_page),
        }

        response = await client.get(f"{self.API_URL}/search/photos", params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        if "results" in data:
            for item in data["results"]:
                media_item = self._parse_photo(item)
                results.append(media_item)

        return results

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific photo."""
        await self._rate_limit_wait()
        client = await self.get_client()

        response = await client.get(f"{self.API_URL}/photos/{item_id}")
        response.raise_for_status()
        data = response.json()

        return self._parse_photo(data)

    def _parse_photo(self, data: Dict[str, Any]) -> MediaItem:
        """Parse Unsplash photo data into MediaItem."""
        # Extract user/author information
        user = data.get("user", {})
        author = user.get("name", "Unknown")
        author_url = user.get("links", {}).get("html", "")

        # Build description
        description = data.get("description") or data.get("alt_description", "")

        # Build attribution
        attribution = f"Photo by {author} on Unsplash"
        if author_url:
            attribution = f"Photo by {author} ({author_url}) on Unsplash"

        # Get best quality download URL
        urls = data.get("urls", {})
        download_url = urls.get("raw", urls.get("full", urls.get("regular", "")))

        # Parse created date
        created_date = None
        if "created_at" in data:
            try:
                created_date = datetime.fromisoformat(
                    data["created_at"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        # Build metadata
        metadata = {
            "color": data.get("color"),
            "likes": data.get("likes", 0),
            "downloads": data.get("downloads", 0),
            "views": data.get("views", 0),
            "user_profile": author_url,
            "download_location": data.get("links", {}).get("download_location"),
            "exif": data.get("exif", {}),
            "location": data.get("location", {}),
        }

        return MediaItem(
            id=data["id"],
            title=description[:100] if description else f"Unsplash Photo {data['id']}",
            source="unsplash",
            url=data.get("links", {}).get(
                "html", f"{self.BASE_URL}/photos/{data['id']}"
            ),
            download_url=download_url,
            file_type="jpg",  # Unsplash serves JPEG
            file_size=None,  # Not provided in API response
            thumbnail_url=urls.get("thumb", urls.get("small")),
            description=description,
            license="Unsplash License (https://unsplash.com/license)",
            attribution=attribution,
            width=data.get("width"),
            height=data.get("height"),
            author=author,
            created_date=created_date,
            metadata=metadata,
        )

    async def download(self, media_item, destination, filename=None):
        """Download photo and trigger Unsplash download tracking.

        This override ensures download tracking is triggered as required
        by Unsplash API terms.
        """
        # Trigger download tracking if available
        if "download_location" in media_item.metadata:
            download_location = media_item.metadata["download_location"]
            if download_location:
                try:
                    client = await self.get_client()
                    await client.get(download_location)
                except Exception:
                    # Don't fail download if tracking fails
                    pass

        # Call parent download method
        return await super().download(media_item, destination, filename)
