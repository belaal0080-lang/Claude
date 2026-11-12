"""Base fetcher class for all media sources."""

import time
import asyncio
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pathlib import Path
import httpx

import sys
sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem, DownloadResult


class BaseFetcher(ABC):
    """Abstract base class for all media fetchers."""

    def __init__(self, config: Dict[str, Any]):
        """Initialize fetcher with configuration.

        Args:
            config: Configuration dictionary with rate_limit, user_agent, etc.
        """
        self.config = config
        self.rate_limit = config.get("rate_limit", 1.0)  # seconds between requests
        self.last_request_time = 0
        self._client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True,
                headers=self._get_headers(),
            )
        return self._client

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests."""
        return {
            "User-Agent": self.config.get(
                "user_agent", "FetchMediaSkill/1.0 (Educational/Research)"
            )
        }

    async def _rate_limit_wait(self):
        """Wait to respect rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.rate_limit:
            await asyncio.sleep(self.rate_limit - time_since_last)
        self.last_request_time = time.time()

    @abstractmethod
    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for media items.

        Args:
            query: Search query string
            file_types: Optional list of file types to filter
            limit: Maximum number of results

        Returns:
            List of MediaItem objects
        """
        pass

    @abstractmethod
    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific item.

        Args:
            item_id: Item identifier

        Returns:
            MediaItem with complete details
        """
        pass

    async def download(
        self,
        media_item: MediaItem,
        destination: Path,
        filename: Optional[str] = None,
    ) -> DownloadResult:
        """Download a media item to local storage.

        Args:
            media_item: MediaItem to download
            destination: Destination directory
            filename: Optional custom filename

        Returns:
            DownloadResult with download information
        """
        start_time = time.time()

        try:
            # Create destination directory if needed
            destination.mkdir(parents=True, exist_ok=True)

            # Determine filename
            if filename is None:
                filename = self._generate_filename(media_item)

            file_path = destination / filename

            # Download file
            client = await self.get_client()
            async with client.stream("GET", media_item.download_url) as response:
                response.raise_for_status()

                with open(file_path, "wb") as f:
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        f.write(chunk)

            # Get file size
            file_size = file_path.stat().st_size
            duration = time.time() - start_time

            # Update media item with local path
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

    def _generate_filename(self, media_item: MediaItem) -> str:
        """Generate a safe filename for the media item.

        Args:
            media_item: MediaItem to generate filename for

        Returns:
            Safe filename string
        """
        # Sanitize title for filename
        safe_title = "".join(
            c for c in media_item.title if c.isalnum() or c in (" ", "-", "_")
        ).strip()

        # Limit length
        safe_title = safe_title[:100]

        # Remove extra spaces
        safe_title = "_".join(safe_title.split())

        # Sanitize ID - replace Windows-forbidden characters: < > : " / \ | ? *
        safe_id = media_item.id
        for char in ['/', '\\', ':', '*', '?', '"', '<', '>', '|']:
            safe_id = safe_id.replace(char, '_')

        # Sanitize file_type (remove + from svg+xml, etc.)
        safe_ext = media_item.file_type.split('+')[0] if '+' in media_item.file_type else media_item.file_type

        # Build filename
        return f"{media_item.source}_{safe_id}_{safe_title}.{safe_ext}"

    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
