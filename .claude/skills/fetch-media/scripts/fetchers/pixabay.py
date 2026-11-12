"""Pixabay fetcher implementation."""

from typing import List, Optional, Dict, Any
from datetime import datetime
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class PixabayFetcher(BaseFetcher):
    """Fetcher for Pixabay."""

    API_URL = "https://pixabay.com/api/"
    BASE_URL = "https://pixabay.com"

    def __init__(self, config: Dict[str, Any]):
        """Initialize Pixabay fetcher.

        Args:
            config: Configuration dictionary with 'api_key' required

        Raises:
            ValueError: If API key is not provided
        """
        super().__init__(config)
        self.api_key = config.get("api_key")
        if not self.api_key:
            raise ValueError(
                "Pixabay API key is required. Set PIXABAY_API_KEY in .env file."
            )
        # Pixabay rate limit: 100 requests per minute, use 0.6s between requests
        self.rate_limit = 0.6

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for media on Pixabay.

        Args:
            query: Search query string
            file_types: Optional list to filter by image_type (photo, illustration, vector)
            limit: Maximum number of results (3-200)

        Returns:
            List of MediaItem objects
        """
        await self._rate_limit_wait()
        client = await self.get_client()

        # Pixabay limits to 200 results per page, minimum 3
        per_page = max(3, min(limit, 200))

        # Determine image_type from file_types parameter
        image_type = "all"
        if file_types:
            # Map common file extensions to Pixabay image_types
            file_types_lower = [ft.lower() for ft in file_types]
            if "svg" in file_types_lower:
                image_type = "vector"
            elif "photo" in file_types_lower or "jpg" in file_types_lower or "jpeg" in file_types_lower:
                image_type = "photo"
            elif "illustration" in file_types_lower or "png" in file_types_lower:
                image_type = "illustration"

        params = {
            "key": self.api_key,
            "q": query,
            "image_type": image_type,
            "per_page": per_page,
        }

        response = await client.get(self.API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        if "hits" in data:
            for item in data["hits"]:
                media_item = self._parse_image(item)
                results.append(media_item)

        return results

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific image.

        Args:
            item_id: Pixabay image ID

        Returns:
            MediaItem with complete details
        """
        await self._rate_limit_wait()
        client = await self.get_client()

        params = {
            "key": self.api_key,
            "id": item_id,
        }

        response = await client.get(self.API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if "hits" in data and len(data["hits"]) > 0:
            return self._parse_image(data["hits"][0])
        else:
            raise ValueError(f"Image with ID {item_id} not found")

    def _parse_image(self, data: Dict[str, Any]) -> MediaItem:
        """Parse Pixabay image data into MediaItem.

        Args:
            data: Raw image data from Pixabay API

        Returns:
            MediaItem object
        """
        # Extract user/author information
        author = data.get("user", "Unknown")
        author_url = f"{self.BASE_URL}/users/{author}-{data.get('user_id', '')}"

        # Build description from tags
        tags = data.get("tags", "")
        description = f"Image tagged: {tags}" if tags else ""

        # Build attribution - Pixabay requires attribution
        attribution = f"Image by {author} from Pixabay"

        # Determine best download URL
        # Priority: largeImageURL > webformatURL > previewURL
        download_url = (
            data.get("largeImageURL")
            or data.get("webformatURL")
            or data.get("previewURL", "")
        )

        # Determine file type from image_type
        image_type = data.get("type", "photo")
        if "vector" in image_type:
            # Free tier: vectors are provided as PNG
            # Premium tier: would have vectorURL for actual SVG
            file_type = "png"
        elif image_type == "illustration":
            file_type = "png"
        else:
            file_type = "jpg"

        # Build metadata
        metadata = {
            "image_type": image_type,
            "tags": tags.split(", ") if tags else [],
            "views": data.get("views", 0),
            "downloads": data.get("downloads", 0),
            "likes": data.get("likes", 0),
            "comments": data.get("comments", 0),
            "user_id": data.get("user_id"),
            "user_profile": author_url,
            "preview_url": data.get("previewURL"),
            "webformat_url": data.get("webformatURL"),
        }

        # Add vector URL if available
        if "vectorURL" in data:
            metadata["vector_url"] = data["vectorURL"]

        # Build title from tags (first 100 chars)
        title = tags[:100] if tags else f"Pixabay Image {data.get('id', 'Unknown')}"

        return MediaItem(
            id=str(data.get("id", "unknown")),
            title=title,
            source="pixabay",
            url=data.get("pageURL", f"{self.BASE_URL}/photos/{data.get('id', '')}"),
            download_url=download_url,
            file_type=file_type,
            file_size=data.get("imageSize"),  # Size in bytes if available
            thumbnail_url=data.get("previewURL"),
            description=description,
            license="Pixabay License (https://pixabay.com/service/license/)",
            attribution=attribution,
            width=data.get("imageWidth") or data.get("webformatWidth"),
            height=data.get("imageHeight") or data.get("webformatHeight"),
            author=author,
            created_date=None,  # Not provided by API
            metadata=metadata,
        )
