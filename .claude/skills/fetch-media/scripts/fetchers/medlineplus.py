"""MedlinePlus ADAM medical diagrams fetcher implementation.

Fetches professional anatomical and medical illustrations from the
MedlinePlus Medical Encyclopedia (medlineplus.gov). Images are
A.D.A.M. illustrations copyrighted by A.D.A.M., Inc.

Uses a lightweight auto-building index of encyclopedia article titles
built from the A-Z index pages on first use.
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
import sys
import xml.etree.ElementTree as ET

sys.path.append(str(Path(__file__).parent.parent))
from models import MediaItem
from fetchers.base import BaseFetcher


class MedlinePlusFetcher(BaseFetcher):
    """Fetcher for MedlinePlus ADAM medical diagrams.

    Searches a local article-title index (auto-built from A-Z encyclopedia
    pages) and then fetches matching article pages to extract ADAM image URLs.

    IMPORTANT: ADAM illustrations are copyrighted by A.D.A.M., Inc.
    They are NOT open-access like BioArt or NASA images.
    """

    BASE_URL = "https://medlineplus.gov"
    ENCY_URL = f"{BASE_URL}/ency"
    INDEX_FILE = Path(__file__).parent.parent.parent / "medlineplus_index.json"
    INDEX_MAX_AGE_DAYS = 30  # Auto-rebuild index if older than this

    # Image URL patterns
    FULLSIZE_PATTERN = re.compile(
        r'//medlineplus\.gov/ency/images/ency/fullsize/(\d+)\.(jpg|gif|png)'
    )
    THUMBNAIL_PATTERN = re.compile(
        r'//medlineplus\.gov/ency/images/ency/tnails/(\d+)t\.(jpg|gif|png)'
    )
    # Exclude the ADAM footer logo
    ADAM_LOGO_PATTERN = re.compile(r'ftrAdamlogo', re.IGNORECASE)

    COPYRIGHT_NOTICE = (
        "Copyrighted - A.D.A.M., Inc. Licensed to U.S. National Library "
        "of Medicine. Not open-access. For educational reference only."
    )

    async def search(
        self,
        query: str,
        file_types: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[MediaItem]:
        """Search for ADAM medical diagrams matching the query.

        Searches article titles in the local index, then fetches matched
        article pages to extract ADAM image URLs.
        """
        # Ensure we have a title index
        await self._ensure_index()

        # Load index
        with open(self.INDEX_FILE, "r", encoding="utf-8") as f:
            index = json.load(f)

        # Search article titles for query terms
        query_terms = query.lower().split()
        scored_articles = []

        for article_id, title in index.get("articles", {}).items():
            score = 0
            title_lower = title.lower()

            for term in query_terms:
                if term in title_lower:
                    score += 10
                    # Bonus for exact word match (not just substring)
                    if re.search(r'\b' + re.escape(term) + r'\b', title_lower):
                        score += 5

            if score > 0:
                scored_articles.append((score, article_id, title))

        # Sort by relevance
        scored_articles.sort(key=lambda x: x[0], reverse=True)

        # Fetch article pages and extract images (up to limit)
        media_items = []
        articles_checked = 0
        max_articles = min(limit * 2, 20)  # Check more articles than limit to find enough images

        for score, article_id, title in scored_articles[:max_articles]:
            if len(media_items) >= limit:
                break

            try:
                images = await self._extract_images_from_article(article_id, title)
                media_items.extend(images)
                articles_checked += 1
            except Exception:
                continue

        return media_items[:limit]

    async def get_details(self, item_id: str) -> MediaItem:
        """Get detailed information about a specific ADAM image.

        Args:
            item_id: Image ID (numeric, e.g., "17004")
        """
        fullsize_url = f"https://medlineplus.gov/ency/images/ency/fullsize/{item_id}.jpg"
        thumbnail_url = f"https://medlineplus.gov/ency/images/ency/tnails/{item_id}t.jpg"

        return MediaItem(
            id=f"adam_{item_id}",
            title=f"ADAM Medical Illustration {item_id}",
            source="medlineplus",
            url=fullsize_url,
            download_url=fullsize_url,
            file_type="jpg",
            thumbnail_url=thumbnail_url,
            description=f"A.D.A.M. medical illustration from MedlinePlus Medical Encyclopedia",
            license=self.COPYRIGHT_NOTICE,
            attribution=f"A.D.A.M. Medical Encyclopedia, via MedlinePlus (medlineplus.gov). "
                        f"© A.D.A.M., Inc. All rights reserved.",
            metadata={
                "copyright_warning": (
                    "This image is copyrighted by A.D.A.M., Inc. and licensed "
                    "to the U.S. National Library of Medicine for display on "
                    "MedlinePlus. It may NOT be freely redistributed. Use for "
                    "educational reference only."
                ),
                "image_id": item_id,
            },
        )

    async def _extract_images_from_article(
        self, article_id: str, article_title: str
    ) -> List[MediaItem]:
        """Fetch an encyclopedia article page and extract ADAM image metadata.

        Parses the article HTML for <img> tags with ADAM illustration URLs,
        extracting image IDs, alt text, and constructing full-size download URLs.

        Args:
            article_id: Encyclopedia article number (e.g., "000171")
            article_title: Article title for context

        Returns:
            List of MediaItem objects for each ADAM image found
        """
        article_url = f"{self.ENCY_URL}/article/{article_id}.htm"

        await self._rate_limit_wait()
        client = await self.get_client()

        try:
            response = await client.get(article_url)
            response.raise_for_status()
        except Exception:
            return []

        html = response.text

        # Parse with BeautifulSoup
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        # Find all ADAM images (class="img-e" for main, class="side-img" for sidebar)
        media_items = []
        seen_ids = set()

        for img in soup.find_all("img"):
            src = img.get("src", "")

            # Skip non-ADAM images and the footer logo
            if "ency/images/ency" not in src:
                continue
            if self.ADAM_LOGO_PATTERN.search(src):
                continue

            # Skip rollover_globals header icons (tiny animated GIFs,
            # not actual ADAM medical illustrations)
            img_class = img.get("class", [])
            if isinstance(img_class, str):
                img_class = img_class.split()
            if "rollover_globals" in img_class:
                continue

            # Extract image ID from URL
            image_id = None
            ext = "jpg"

            # Try fullsize pattern first
            match = self.FULLSIZE_PATTERN.search(src)
            if match:
                image_id = match.group(1)
                ext = match.group(2)

            # Try thumbnail pattern
            if not match:
                match = self.THUMBNAIL_PATTERN.search(src)
                if match:
                    image_id = match.group(1)
                    ext = match.group(2)

            if not image_id or image_id in seen_ids:
                continue

            seen_ids.add(image_id)

            # Get descriptive text from alt/title attributes
            alt_text = img.get("alt", "").strip()
            title_text = img.get("title", "").strip()
            image_title = title_text or alt_text or f"Medical illustration {image_id}"

            # Build full-size URL preserving the original file extension
            # (most are .jpg but some header images are .gif)
            fullsize_url = f"https://medlineplus.gov/ency/images/ency/fullsize/{image_id}.{ext}"
            thumbnail_url = f"https://medlineplus.gov/ency/images/ency/tnails/{image_id}t.{ext}"

            media_items.append(MediaItem(
                id=f"adam_{image_id}",
                title=image_title,
                source="medlineplus",
                url=article_url,
                download_url=fullsize_url,
                file_type=ext,
                thumbnail_url=thumbnail_url,
                description=(
                    f"A.D.A.M. medical illustration from MedlinePlus article: "
                    f"{article_title}"
                ),
                license=self.COPYRIGHT_NOTICE,
                attribution=(
                    f"A.D.A.M. Medical Encyclopedia, \"{article_title}\", "
                    f"via MedlinePlus (medlineplus.gov). "
                    f"© A.D.A.M., Inc. All rights reserved."
                ),
                metadata={
                    "copyright_warning": (
                        "This image is copyrighted by A.D.A.M., Inc. and "
                        "licensed to the U.S. National Library of Medicine for "
                        "display on MedlinePlus. It may NOT be freely "
                        "redistributed. Use for educational reference only."
                    ),
                    "image_id": image_id,
                    "article_id": article_id,
                    "article_title": article_title,
                    "article_url": article_url,
                },
            ))

        return media_items

    # ------------------------------------------------------------------
    # Article title index management
    # ------------------------------------------------------------------

    async def _ensure_index(self):
        """Build the article title index if it doesn't exist or is stale."""
        if self.INDEX_FILE.exists():
            try:
                with open(self.INDEX_FILE, "r", encoding="utf-8") as f:
                    index = json.load(f)
                built_date = index.get("built_date", "")
                if built_date:
                    built = datetime.fromisoformat(built_date)
                    age_days = (datetime.now() - built).days
                    if age_days < self.INDEX_MAX_AGE_DAYS:
                        return  # Index is fresh enough
            except (json.JSONDecodeError, ValueError, KeyError):
                pass  # Rebuild if corrupt

        await self._build_index()

    async def _build_index(self):
        """Build article title index from A-Z encyclopedia pages.

        Fetches all 26 encyclopedia index pages and extracts article
        titles and IDs. Takes ~15-30 seconds on first run.
        """
        articles = {}
        client = await self.get_client()

        letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        # Also include special pages: 0-9
        index_pages = [f"encyclopedia_{letter}.htm" for letter in letters]
        index_pages.append("encyclopedia_0-9.htm")

        for page in index_pages:
            url = f"{self.ENCY_URL}/{page}"

            try:
                # Use a shorter rate limit for index building (0.3s)
                await self._index_rate_wait()
                response = await client.get(url)

                if response.status_code != 200:
                    continue

                html = response.text

                # Extract article links: href="article/{ID}.htm">{Title}
                article_pattern = re.compile(
                    r'href="article/(\d+)\.htm"[^>]*>([^<]+)'
                )
                for match in article_pattern.finditer(html):
                    article_id = match.group(1)
                    title = match.group(2).strip()
                    if title:
                        articles[article_id] = title

            except Exception:
                continue

        # Save index
        index_data = {
            "built_date": datetime.now().isoformat(),
            "article_count": len(articles),
            "articles": articles,
        }

        self.INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(self.INDEX_FILE, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

    async def _index_rate_wait(self):
        """Shorter rate limit for index building (0.3s between requests)."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < 0.3:
            import asyncio
            await asyncio.sleep(0.3 - time_since_last)
        self.last_request_time = time.time()
