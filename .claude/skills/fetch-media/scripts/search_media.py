#!/usr/bin/env python3
"""Main search and download script for fetch-media skill."""

import asyncio
import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any
import tempfile
import time
import os

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from models import MediaItem, DownloadResult
from fetchers.wikimedia import WikimediaFetcher
from fetchers.bioart import BioArtFetcher
from fetchers.unsplash import UnsplashFetcher
from fetchers.nasa import NASAFetcher
from fetchers.pixabay import PixabayFetcher
from fetchers.pexels import PexelsFetcher
from fetchers.medlineplus import MedlinePlusFetcher

# Try to load environment variables
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent.parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)
except ImportError:
    pass


# Available fetchers
FETCHERS = {
    "wikimedia": WikimediaFetcher,
    "bioart": BioArtFetcher,
    "unsplash": UnsplashFetcher,
    "nasa": NASAFetcher,
    "pixabay": PixabayFetcher,
    "pexels": PexelsFetcher,
    "medlineplus": MedlinePlusFetcher,
}


async def search_media(
    query: str,
    source: Optional[str] = None,
    file_types: Optional[List[str]] = None,
    limit: int = 20,
    mode: str = "url",
    output_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """Search for media across sources.

    Args:
        query: Search query string
        source: Optional specific source ("wikimedia", "bioart", "unsplash", "nasa", "pixabay", "pexels", "medlineplus")
        file_types: Optional list of file types to filter
        limit: Maximum number of results per source
        mode: "url" for URLs only, "download" to download files
        output_dir: Output directory for downloads (uses temp if not specified)

    Returns:
        Dictionary with results, citations, warnings, and stats
    """
    results = []
    warnings = []
    sources_searched = []
    sources_failed = []

    # Determine which sources to search
    if source:
        sources_to_search = [source] if source in FETCHERS else []
        if not sources_to_search:
            return {
                "query": query,
                "mode": mode,
                "results": [],
                "citations": [],
                "warnings": [f"Unknown source: {source}"],
                "stats": {
                    "total_found": 0,
                    "sources_searched": [],
                    "sources_failed": [source],
                },
            }
    else:
        # Search all sources
        sources_to_search = list(FETCHERS.keys())

    # Configure each fetcher
    for source_name in sources_to_search:
        sources_searched.append(source_name)

        try:
            # Configure fetcher
            config = {"rate_limit": 1.0, "user_agent": "FetchMediaSkill/1.0"}

            # Handle Unsplash API key
            if source_name == "unsplash":
                api_key = os.getenv("UNSPLASH_API_KEY")
                if not api_key:
                    warnings.append(
                        "Unsplash API key not found. Set UNSPLASH_API_KEY in .env file."
                    )
                    sources_failed.append(source_name)
                    continue
                config["api_key"] = api_key

            # Handle Pixabay API key
            if source_name == "pixabay":
                api_key = os.getenv("PIXABAY_API_KEY")
                if not api_key:
                    warnings.append(
                        "Pixabay API key not found. Set PIXABAY_API_KEY in .env file."
                    )
                    sources_failed.append(source_name)
                    continue
                config["api_key"] = api_key

            # Handle Pexels API key
            if source_name == "pexels":
                api_key = os.getenv("PEXELS_API_KEY")
                if not api_key:
                    warnings.append(
                        "Pexels API key not found. Set PEXELS_API_KEY in .env file."
                    )
                    sources_failed.append(source_name)
                    continue
                config["api_key"] = api_key

            # Create fetcher
            fetcher_class = FETCHERS[source_name]
            fetcher = fetcher_class(config)

            try:
                # Search
                items = await fetcher.search(query, file_types, limit)

                # Download if requested
                if mode == "download":
                    download_dir = Path(output_dir) if output_dir else Path(tempfile.gettempdir()) / "fetch-media"
                    download_dir.mkdir(parents=True, exist_ok=True)

                    for item in items:
                        try:
                            result = await fetcher.download(item, download_dir)
                            if result.success:
                                item.local_path = result.local_path
                            else:
                                warnings.append(
                                    f"Failed to download {item.id}: {result.error}"
                                )
                        except Exception as e:
                            warnings.append(
                                f"Failed to download {item.id}: {str(e)}"
                            )

                # Add copyright warning for MedlinePlus ADAM images
                if source_name == "medlineplus" and items:
                    warnings.append(
                        "⚠️ MedlinePlus ADAM images are copyrighted by A.D.A.M., Inc. "
                        "They are NOT open-access. Use for educational reference only. "
                        "Do not redistribute without permission."
                    )

                results.extend(items)

            finally:
                await fetcher.close()

        except FileNotFoundError as e:
            # BioArt index missing
            warnings.append(str(e))
            sources_failed.append(source_name)
        except Exception as e:
            warnings.append(f"Error searching {source_name}: {str(e)}")
            sources_failed.append(source_name)

    # Build citations
    citations = [item.attribution for item in results if item.attribution]

    # Build response
    return {
        "query": query,
        "mode": mode,
        "results": [item.to_dict() for item in results],
        "citations": citations,
        "warnings": warnings,
        "stats": {
            "total_found": len(results),
            "sources_searched": sources_searched,
            "sources_failed": sources_failed,
        },
    }


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Search and download media from open-access sources"
    )
    parser.add_argument("--query", "-q", required=True, help="Search query")
    parser.add_argument(
        "--source",
        "-s",
        choices=list(FETCHERS.keys()),
        help="Specific source to search (default: all sources)",
    )
    parser.add_argument(
        "--file-types",
        "-t",
        help="Comma-separated list of file types (e.g., 'svg,png')",
    )
    parser.add_argument(
        "--limit", "-l", type=int, default=20, help="Maximum results per source"
    )
    parser.add_argument(
        "--mode",
        "-m",
        choices=["url", "download"],
        default="url",
        help="Mode: 'url' for URLs only, 'download' to download files",
    )
    parser.add_argument(
        "--output",
        "-o",
        help="Output directory for downloads (default: system temp directory)",
    )
    parser.add_argument(
        "--format",
        "-f",
        choices=["json", "pretty"],
        default="json",
        help="Output format",
    )

    args = parser.parse_args()

    # Parse file types
    file_types = None
    if args.file_types:
        file_types = [ft.strip() for ft in args.file_types.split(",")]

    # Run search
    result = asyncio.run(
        search_media(
            query=args.query,
            source=args.source,
            file_types=file_types,
            limit=args.limit,
            mode=args.mode,
            output_dir=args.output,
        )
    )

    # Output results
    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        # Pretty format
        print(f"\n{'='*70}")
        print(f"Search Results for: {result['query']}")
        print(f"{'='*70}\n")

        if result["warnings"]:
            print("⚠️  Warnings:")
            for warning in result["warnings"]:
                print(f"  - {warning}")
            print()

        print(f"Found {result['stats']['total_found']} results")
        print(f"Sources searched: {', '.join(result['stats']['sources_searched'])}")
        if result["stats"]["sources_failed"]:
            print(
                f"Sources failed: {', '.join(result['stats']['sources_failed'])}"
            )
        print()

        for i, item in enumerate(result["results"], 1):
            print(f"{i}. {item['title']}")
            print(f"   Source: {item['source']}")
            print(f"   URL: {item['url']}")
            if args.mode == "download" and item.get("local_path"):
                print(f"   Downloaded to: {item['local_path']}")
            print(f"   Attribution: {item['attribution']}")
            print()


if __name__ == "__main__":
    main()
