#!/usr/bin/env python3
"""BioArt web crawler to build a searchable index of all items.

This crawler:
- Iterates through BioArt item IDs (known range)
- Extracts metadata, keywords, and file endpoints
- Builds a searchable JSON index
- Supports incremental updates
- Respects rate limiting
"""

import asyncio
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Set
from datetime import datetime
import httpx
from bs4 import BeautifulSoup


class BioArtCrawler:
    """Crawler for BioArt website to build searchable index."""

    BASE_URL = "https://bioart.niaid.nih.gov"
    INDEX_FILE = Path(__file__).parent.parent / "bioart_index.json"
    PROGRESS_FILE = Path(__file__).parent.parent / "bioart_crawler_progress.json"

    # Known range (update as needed)
    MIN_ID = 2
    MAX_ID = 668  # Update this as BioArt adds more items

    def __init__(
        self,
        rate_limit: float = 2.0,  # seconds between requests
        max_retries: int = 3,
        timeout: float = 30.0,
    ):
        """Initialize the crawler."""
        self.rate_limit = rate_limit
        self.max_retries = max_retries
        self.timeout = timeout
        self.client: Optional[httpx.AsyncClient] = None
        self.index: Dict[str, Dict] = {}
        self.progress: Dict = {
            "last_crawled_id": 0,
            "last_run": None,
            "total_items": 0,
            "failed_ids": [],
            "deleted_ids": [],
        }

    async def __aenter__(self):
        """Async context manager entry."""
        self.client = httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers={
                "User-Agent": "BioArtIndexer/1.0 (Educational; Research; Respectful crawler)"
            },
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.client:
            await self.client.aclose()

    def load_existing_index(self) -> None:
        """Load existing index if available."""
        if self.INDEX_FILE.exists():
            try:
                with open(self.INDEX_FILE, "r", encoding="utf-8") as f:
                    self.index = json.load(f)
                print(f"✓ Loaded existing index with {len(self.index)} items")
            except Exception as e:
                print(f"⚠️  Could not load existing index: {e}")
                self.index = {}

    def load_progress(self) -> None:
        """Load crawler progress."""
        if self.PROGRESS_FILE.exists():
            try:
                with open(self.PROGRESS_FILE, "r", encoding="utf-8") as f:
                    self.progress = json.load(f)
                print(f"✓ Loaded progress: Last ID {self.progress['last_crawled_id']}")
            except Exception as e:
                print(f"⚠️  Could not load progress: {e}")

    def save_index(self) -> None:
        """Save index to disk."""
        try:
            with open(self.INDEX_FILE, "w", encoding="utf-8") as f:
                json.dump(self.index, f, indent=2, ensure_ascii=False)
            print(f"✓ Saved index with {len(self.index)} items")
        except Exception as e:
            print(f"✗ Error saving index: {e}")

    def save_progress(self) -> None:
        """Save crawler progress."""
        try:
            self.progress["last_run"] = datetime.now().isoformat()
            self.progress["total_items"] = len(self.index)
            with open(self.PROGRESS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.progress, f, indent=2)
        except Exception as e:
            print(f"✗ Error saving progress: {e}")

    async def fetch_page(self, item_id: int) -> Optional[str]:
        """Fetch a BioArt detail page."""
        url = f"{self.BASE_URL}/bioart/{item_id}"

        for attempt in range(self.max_retries):
            try:
                await asyncio.sleep(self.rate_limit)
                response = await self.client.get(url)

                if response.status_code == 200:
                    return response.text
                elif response.status_code == 404:
                    return None
                else:
                    print(
                        f"  ⚠️  Item {item_id}: HTTP {response.status_code} (attempt {attempt + 1})"
                    )

            except Exception as e:
                print(f"  ⚠️  Item {item_id}: Error {e} (attempt {attempt + 1})")

            if attempt < self.max_retries - 1:
                await asyncio.sleep(2**attempt)

        return None

    def parse_item(self, item_id: int, html: str) -> Optional[Dict]:
        """Parse a BioArt page and extract metadata."""
        try:
            soup = BeautifulSoup(html, "html.parser")

            # Extract title
            title = f"BioArt {item_id}"

            # Method 1: Parse Next.js data (most reliable)
            next_data = soup.find("script", id="__NEXT_DATA__")
            if next_data and next_data.string:
                try:
                    data = json.loads(next_data.string)
                    # Navigate through Next.js data structure
                    props = data.get("props", {})
                    page_props = props.get("pageProps", {})

                    # Try to get title from pageProps
                    if "bioart" in page_props:
                        bioart_data = page_props["bioart"]
                        if isinstance(bioart_data, dict) and "title" in bioart_data:
                            title = bioart_data["title"].strip()
                        elif isinstance(bioart_data, dict) and "name" in bioart_data:
                            title = bioart_data["name"].strip()

                    # Also try to extract from initialState or other common locations
                    if title == f"BioArt {item_id}" and "initialState" in page_props:
                        initial_state = page_props["initialState"]
                        if isinstance(initial_state, dict):
                            # Try various possible keys
                            for key in ["title", "name", "bioartTitle", "itemTitle"]:
                                if key in initial_state:
                                    title = str(initial_state[key]).strip()
                                    break
                except (json.JSONDecodeError, KeyError, TypeError) as e:
                    pass  # Fall through to other methods

            # Method 2: Check meta tags
            if title == f"BioArt {item_id}":
                og_title = soup.find("meta", property="og:title")
                if og_title and og_title.get("content"):
                    potential_title = og_title["content"].strip()
                    # Skip generic "BioArt" title
                    if potential_title and potential_title != "BioArt":
                        title = potential_title

            # Method 3: Look for title in Material-UI typography (h4, h6)
            if title == f"BioArt {item_id}":
                # BioArt uses Material-UI with specific class patterns
                # h4 typography is typically the main title
                for tag in soup.find_all(["h4", "h6", "h1", "h2"]):
                    # Check if it has MUI typography classes
                    classes = tag.get("class", [])
                    if any("MuiTypography" in cls for cls in classes):
                        text = tag.get_text().strip()
                        # Skip generic/nav titles and all-caps headers
                        if (text and
                            text.upper() != "BIOART" and
                            text != "BioArt" and
                            not text.isupper() and  # Skip all-caps headers like "BIOART"
                            len(text) > 2 and
                            len(text) < 200):
                            # This is likely the title
                            title = text
                            break

            # Method 4: Check img alt attributes (often contain the title)
            if title == f"BioArt {item_id}":
                for img in soup.find_all("img"):
                    alt = img.get("alt", "").strip()
                    if alt and alt != "BioArt" and len(alt) > 2 and len(alt) < 200:
                        # Check if img src is from bioarts API (actual content image, not logo)
                        src = img.get("src", "")
                        if "/api/bioarts/" in src:
                            title = alt
                            break

            # Method 5: Fallback to any h1-h6 tags
            if title == f"BioArt {item_id}":
                for tag in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
                    text = tag.get_text().strip()
                    # Skip generic titles and navigation
                    if text and text != "BioArt" and len(text) > 2 and len(text) < 200:
                        # Avoid navigation/menu items
                        if not any(skip in text.lower() for skip in ["discover", "about", "faq", "terms", "contact", "release", "sign in"]):
                            title = text
                            break

            # Extract description
            description = ""
            og_desc = soup.find("meta", property="og:description")
            if og_desc and og_desc.get("content"):
                description = og_desc["content"].strip()

            # Extract keywords
            keywords = set()
            text_content = soup.get_text().lower()

            # Common biology/medical terms
            common_terms = [
                "virus",
                "bacteria",
                "cell",
                "molecule",
                "protein",
                "anatomy",
                "organ",
                "tissue",
                "disease",
                "vaccine",
                "antibody",
                "pathogen",
                "microscopy",
            ]
            for term in common_terms:
                if term in text_content:
                    keywords.add(term)

            # Extract license
            license_text = "Unknown"
            if "Public Domain" in html:
                license_text = "Public Domain"
            elif "CC-BY" in html or "CC BY" in html:
                license_text = "CC-BY"

            # Extract file endpoints
            file_pattern = re.compile(r"/api/bioarts/(\d+)/files/(\d+)")
            file_matches = file_pattern.findall(html)

            file_endpoints = []
            seen_files = set()
            for bioart_id, file_id in file_matches:
                if file_id not in seen_files:
                    file_endpoints.append(
                        {
                            "file_id": file_id,
                            "url": f"{self.BASE_URL}/api/bioarts/{bioart_id}/files/{file_id}",
                        }
                    )
                    seen_files.add(file_id)

            # Build item data
            item_data = {
                "id": item_id,
                "bioart_id": f"BIOART-{str(item_id).zfill(6)}",
                "title": title,
                "description": description,
                "url": f"{self.BASE_URL}/bioart/{item_id}",
                "license": license_text,
                "keywords": sorted(list(keywords)),
                "file_endpoints": file_endpoints,
                "file_count": len(file_endpoints),
                "crawled_at": datetime.now().isoformat(),
                "has_files": len(file_endpoints) > 0,
            }

            return item_data

        except Exception as e:
            print(f"  ✗ Error parsing item {item_id}: {e}")
            return None

    async def crawl_range(
        self, start_id: int, end_id: int, incremental: bool = False
    ) -> None:
        """Crawl a range of BioArt items."""
        total = end_id - start_id + 1
        print(f"\n{'=' * 70}")
        print(f"Crawling BioArt items {start_id} to {end_id} ({total} items)")
        print(f"Rate limit: {self.rate_limit}s between requests")
        print(f"Incremental mode: {incremental}")
        print(f"{'=' * 70}\n")

        success_count = 0
        skip_count = 0
        not_found_count = 0
        error_count = 0

        for item_id in range(start_id, end_id + 1):
            # Skip if incremental and already indexed
            if incremental and str(item_id) in self.index:
                skip_count += 1
                if skip_count % 50 == 0:
                    print(f"  ⏭️  Skipped {skip_count} existing items...")
                continue

            # Progress indicator
            progress = ((item_id - start_id + 1) / total) * 100
            print(f"[{progress:5.1f}%] Crawling item {item_id}...", end="", flush=True)

            # Fetch page
            html = await self.fetch_page(item_id)

            if html is None:
                print(" ⚠️  Not found")
                not_found_count += 1
                if item_id not in self.progress["deleted_ids"]:
                    self.progress["deleted_ids"].append(item_id)
                continue

            # Parse item
            item_data = self.parse_item(item_id, html)

            if item_data:
                self.index[str(item_id)] = item_data
                success_count += 1
                file_info = (
                    f"{item_data['file_count']} files"
                    if item_data["has_files"]
                    else "no files"
                )
                print(f" ✓ {item_data['title'][:40]} ({file_info})")
            else:
                print(" ✗ Parse error")
                error_count += 1
                if item_id not in self.progress["failed_ids"]:
                    self.progress["failed_ids"].append(item_id)

            # Update progress
            self.progress["last_crawled_id"] = item_id

            # Save periodically (every 10 items)
            if (item_id - start_id) % 10 == 0:
                self.save_index()
                self.save_progress()

        # Final save
        self.save_index()
        self.save_progress()

        # Summary
        print(f"\n{'=' * 70}")
        print("Crawl Summary")
        print(f"{'=' * 70}")
        print(f"✓ Successful: {success_count}")
        print(f"⏭️  Skipped: {skip_count}")
        print(f"⚠️  Not found: {not_found_count}")
        print(f"✗ Errors: {error_count}")
        print(f"📊 Total in index: {len(self.index)}")
        print(f"{'=' * 70}")

    async def crawl_incremental(self) -> None:
        """Crawl only new items since last run."""
        self.load_existing_index()
        self.load_progress()

        start_id = self.progress.get("last_crawled_id", self.MIN_ID - 1) + 1

        if start_id > self.MAX_ID:
            print(
                f"✓ Index is up to date (last ID: {self.progress['last_crawled_id']})"
            )
            return

        await self.crawl_range(start_id, self.MAX_ID, incremental=True)

    async def crawl_full(self, force: bool = False) -> None:
        """Perform a full crawl of all items."""
        if not force:
            self.load_existing_index()

        self.load_progress()
        await self.crawl_range(self.MIN_ID, self.MAX_ID, incremental=not force)


def search_index(query: str, index_file: str = None) -> List[Dict]:
    """Search the BioArt index by keywords."""
    if index_file is None:
        index_file = Path(__file__).parent.parent / "bioart_index.json"
    else:
        index_file = Path(index_file)

    if not index_file.exists():
        print(f"✗ Index file not found: {index_file}")
        return []

    with open(index_file, "r", encoding="utf-8") as f:
        index = json.load(f)

    query_terms = query.lower().split()
    results = []

    for item_id, item in index.items():
        score = 0

        # Search in bioart_id
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

        if score > 0:
            results.append({**item, "relevance_score": score})

    # Sort by relevance
    results.sort(key=lambda x: x["relevance_score"], reverse=True)

    return results


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="BioArt Index Crawler")
    parser.add_argument(
        "--mode",
        choices=["full", "incremental", "search"],
        default="incremental",
        help="Crawl mode",
    )
    parser.add_argument(
        "--force", action="store_true", help="Force re-crawl all items"
    )
    parser.add_argument(
        "--rate-limit", type=float, default=2.0, help="Seconds between requests"
    )
    parser.add_argument("--search", type=str, help="Search query (for search mode)")
    parser.add_argument("--start", type=int, help="Start ID for range crawl")
    parser.add_argument("--end", type=int, help="End ID for range crawl")

    args = parser.parse_args()

    if args.mode == "search":
        if not args.search:
            print("✗ Please provide --search query")
            return

        print(f"Searching for: {args.search}")
        print("=" * 70)

        results = search_index(args.search)

        if results:
            print(f"\n✓ Found {len(results)} results:\n")
            for i, item in enumerate(results[:20], 1):
                print(f"{i}. {item['title']}")
                print(f"   ID: {item['bioart_id']} | Files: {item['file_count']}")
                print(f"   URL: {item['url']}")
                print(f"   Keywords: {', '.join(item['keywords'][:5])}")
                print()
        else:
            print("No results found")

    else:
        async with BioArtCrawler(rate_limit=args.rate_limit) as crawler:
            if args.start and args.end:
                await crawler.crawl_range(args.start, args.end, incremental=not args.force)
            elif args.mode == "full":
                await crawler.crawl_full(force=args.force)
            else:  # incremental
                await crawler.crawl_incremental()


if __name__ == "__main__":
    asyncio.run(main())
