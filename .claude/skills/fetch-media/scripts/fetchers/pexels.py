"""Pexels fetcher implementation.

Fetches high-quality stock photos from Pexels (pexels.com).
Requires a free API key from https://www.pexels.com/api/new/
"""

from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class PexelsFetcher(BaseFetcher):
    """Fetcher for Pexels stock photography.

    Uses the Pexels API v1. Authentication is via an Authorization header.
    Rate limit: 200 requests/hour, 20,000/month.
    """

    API_URL = "https://api.pexels.com/v1/search"
    BASE_URL = "https://www.pexels.com"

    def __init__(self, config: Dict[str, Any]):
        """Initialize Pexels fetcher.

        Args:
            config: Configuration dictionary with 'api_key' required

        Raises:
            ValueError: If API key is not provided
        """
        super().__init__(config)
        self.api_key = config.get("api_key")
        if not self.api_key:
            raise ValueError(
                "Pexels API key is required. Set PEXELS_API_KEY in .env file."
            )
        # Pexels rate limit: 200 requests/hour → ~0.6s between requests
        self.rate_limit = 0.6

    def _get_headers(self) -> Dict[str, str]:
        """Override headers to include Pexels Authorization."""
        headers = super()._get_headers()
        headers["Authorization"] = self.api_key
        return headers

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for photos on Pexels.

        Args:
            query: Search query string
            file_types: Optional list (used for orientation: 'landscape', 'portrait', 'square')
            limit: Maximum number of results (1-80)

        Returns:
            List of MediaItem objects
        """
        await self._rate_limit_wait()
        client = await self.get_client()

        per_page = max(1, min(limit, 80))

        params = {
            "query": query,
            "per_page": per_page,
        }

        # Map file_types to orientation if applicable
        if file_types:
            ft_lower = [ft.lower() for ft in file_types]
            for orientation in ("landscape", "portrait", "square"):
                if orientation in ft_lower:
                    params["orientation"] = orientation
                    break

        response = await client.get(self.API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        for photo in data.get("photos", []):
            media_item = self._parse_photo(photo)
            results.append(media_item)

        return results

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific photo.

        Args:
            item_id: Pexels photo ID

        Returns:
            MediaItem with complete details
        """
        await self._rate_limit_wait()
        client = await self.get_client()

        detail_url = f"https://api.pexels.com/v1/photos/{item_id}"
        response = await client.get(detail_url)
        response.raise_for_status()
        data = response.json()

        return self._parse_photo(data)

    def _parse_photo(self, data: Dict[str, Any]) -> MediaItem:
        """Parse Pexels photo data into MediaItem.

        Args:
            data: Raw photo data from Pexels API

        Returns:
            MediaItem object
        """
        photographer = data.get("photographer", "Unknown")
        photographer_url = data.get("photographer_url", "")

        # Alt text as title and description
        alt_text = data.get("alt", "").strip()
        title = alt_text[:100] if alt_text else f"Pexels Photo {data.get('id', 'Unknown')}"

        # Best download URL: original > large2x > large
        src = data.get("src", {})
        download_url = (
            src.get("original")
            or src.get("large2x")
            or src.get("large")
            or src.get("medium", "")
        )

        # Attribution per Pexels guidelines
        attribution = f"Photo by {photographer} on Pexels"
        if photographer_url:
            attribution = f"Photo by {photographer} ({photographer_url}) on Pexels"

        # Build metadata
        metadata = {
            "photographer_id": data.get("photographer_id"),
            "photographer_url": photographer_url,
            "avg_color": data.get("avg_color"),
            "photo_url": data.get("url"),
            "src": src,
        }

        return MediaItem(
            id=str(data.get("id", "unknown")),
            title=title,
            source="pexels",
            url=data.get("url", f"{self.BASE_URL}/photo/{data.get('id', '')}"),
            download_url=download_url,
            file_type="jpg",
            thumbnail_url=src.get("tiny") or src.get("small"),
            description=alt_text or f"Photo by {photographer} on Pexels",
            license="Pexels License (https://www.pexels.com/license/) - Free for personal and commercial use",
            attribution=attribution,
            width=data.get("width"),
            height=data.get("height"),
            author=photographer,
            metadata=metadata,
        )
