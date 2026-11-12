"""Data models for media items and results."""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass
class MediaItem:
    """Represents a media item from any source."""

    id: str
    title: str
    source: str  # "wikimedia", "bioart", "unsplash"
    url: str  # View URL on source website
    download_url: str  # Direct download URL
    file_type: str  # "svg", "png", "jpg", etc.
    file_size: Optional[int] = None  # Bytes
    local_path: Optional[str] = None  # Local file path after download
    thumbnail_url: Optional[str] = None
    description: str = ""
    license: str = ""
    attribution: str = ""  # Full citation text
    width: Optional[int] = None
    height: Optional[int] = None
    author: Optional[str] = None
    created_date: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "source": self.source,
            "url": self.url,
            "download_url": self.download_url,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "local_path": self.local_path,
            "thumbnail_url": self.thumbnail_url,
            "description": self.description,
            "license": self.license,
            "attribution": self.attribution,
            "width": self.width,
            "height": self.height,
            "author": self.author,
            "created_date": (
                self.created_date.isoformat() if self.created_date else None
            ),
            "metadata": self.metadata,
        }


@dataclass
class DownloadResult:
    """Result of a download operation."""

    success: bool
    media_item: MediaItem
    local_path: Optional[str] = None
    error: Optional[str] = None
    file_size: Optional[int] = None
    duration_seconds: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "success": self.success,
            "media_item": self.media_item.to_dict(),
            "local_path": self.local_path,
            "error": self.error,
            "file_size": self.file_size,
            "duration_seconds": self.duration_seconds,
        }
