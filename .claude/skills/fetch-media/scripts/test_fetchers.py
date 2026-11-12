#!/usr/bin/env python3
"""Test script to validate all media fetchers."""

import asyncio
import sys
from pathlib import Path
import tempfile
import os

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

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


async def test_wikimedia():
    """Test Wikimedia Commons fetcher."""
    print("\n" + "=" * 70)
    print("Testing Wikimedia Commons Fetcher")
    print("=" * 70)

    config = {"rate_limit": 1.0}
    fetcher = WikimediaFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'virus electron microscopy'...")
        results = await fetcher.search("virus electron microscopy", limit=3)

        if not results:
            print("✗ No results found")
            return False

        print(f"✓ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  Format: {item.file_type}")
        print(f"  License: {item.license}")
        print(f"  URL: {item.url}")

        # Test 2: Get Details
        print(f"\n[TEST 2] Getting details for: {item.id}")
        details = await fetcher.get_details(item.id)
        print(f"✓ Retrieved details")
        print(f"  Attribution: {details.attribution[:80]}...")

        # Test 3: Download (to temp)
        print(f"\n[TEST 3] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"✓ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")

            # Verify file exists
            if Path(result.local_path).exists():
                print(f"✓ File verified on disk")
            else:
                print(f"✗ File not found!")
                return False
        else:
            print(f"✗ Download failed: {result.error}")
            return False

        print("\n✓ Wikimedia tests passed!")
        return True

    except Exception as e:
        print(f"\n✗ Wikimedia test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_bioart():
    """Test BioArt fetcher."""
    print("\n" + "=" * 70)
    print("Testing BioArt Fetcher")
    print("=" * 70)

    # Check if index exists
    index_file = Path(__file__).parent.parent / "bioart_index.json"
    if not index_file.exists():
        print("\n⚠️  BioArt index not found")
        print("   Run: python3 bioart_crawler.py --mode full")
        print("   Skipping BioArt tests")
        return True  # Not a failure, just skip

    config = {"rate_limit": 1.0}
    fetcher = BioArtFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'virus'...")
        results = await fetcher.search("virus", limit=3)

        if not results:
            print("✗ No results found")
            return False

        print(f"✓ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  URL: {item.url}")

        # Test 2: Get Details
        print(f"\n[TEST 2] Getting details for item ID 560...")
        details = await fetcher.get_details("560")
        print(f"✓ Retrieved details")
        print(f"  Title: {details.title}")
        print(f"  Files: {len(details.metadata.get('file_endpoints', []))}")

        # Test 3: Download
        if details.download_url:
            print(f"\n[TEST 3] Testing download...")
            temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
            temp_dir.mkdir(exist_ok=True)

            result = await fetcher.download(details, temp_dir)

            if result.success:
                print(f"✓ Download successful")
                print(f"  Path: {result.local_path}")
            else:
                print(f"✗ Download failed: {result.error}")
                return False
        else:
            print(f"\n[TEST 3] No download URL available (skipped)")

        print("\n✓ BioArt tests passed!")
        return True

    except Exception as e:
        print(f"\n✗ BioArt test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_unsplash():
    """Test Unsplash fetcher."""
    print("\n" + "=" * 70)
    print("Testing Unsplash Fetcher")
    print("=" * 70)

    # Check for API key
    api_key = os.getenv("UNSPLASH_API_KEY")
    if not api_key or api_key.startswith("your_"):
        print("\n!! Unsplash API key not configured")
        print("   Set UNSPLASH_API_KEY in .env file")
        print("   Skipping Unsplash tests")
        return True  # Not a failure, just skip

    config = {"rate_limit": 1.0, "api_key": api_key}
    fetcher = UnsplashFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'laboratory'...")
        results = await fetcher.search("laboratory", limit=3)

        if not results:
            print("✗ No results found")
            return False

        print(f"✓ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  Author: {item.author}")
        print(f"  License: {item.license}")

        # Test 2: Get Details
        print(f"\n[TEST 2] Getting details for: {item.id}")
        details = await fetcher.get_details(item.id)
        print(f"✓ Retrieved details")
        print(f"  Attribution: {details.attribution}")

        # Test 3: Download
        print(f"\n[TEST 3] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"✓ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")
        else:
            print(f"✗ Download failed: {result.error}")
            return False

        print("\n✓ Unsplash tests passed!")
        return True

    except Exception as e:
        print(f"\n✗ Unsplash test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_nasa():
    """Test NASA Images fetcher."""
    print("\n" + "=" * 70)
    print("Testing NASA Images Fetcher")
    print("=" * 70)

    config = {"rate_limit": 1.0}
    fetcher = NASAFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'Mars rover'...")
        results = await fetcher.search("Mars rover", limit=3)

        if not results:
            print("x No results found")
            return False

        print(f"+ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  Source: {item.source}")
        print(f"  License: {item.license}")

        # Verify source is correct
        assert item.source == "nasa", f"Expected source 'nasa', got '{item.source}'"
        print(f"+ Source verified: nasa")

        # Test 2: Download
        print(f"\n[TEST 2] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"+ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")
        else:
            print(f"x Download failed: {result.error}")
            return False

        print("\n+ NASA tests passed!")
        return True

    except Exception as e:
        print(f"\nx NASA test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_pixabay():
    """Test Pixabay fetcher."""
    print("\n" + "=" * 70)
    print("Testing Pixabay Fetcher")
    print("=" * 70)

    # Check for API key
    api_key = os.getenv("PIXABAY_API_KEY")
    if not api_key:
        print("\n!! Pixabay API key not found")
        print("   Set PIXABAY_API_KEY in .env file")
        print("   Skipping Pixabay tests")
        return True  # Not a failure, just skip

    config = {"rate_limit": 0.6, "api_key": api_key}
    fetcher = PixabayFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'nature landscape'...")
        results = await fetcher.search("nature landscape", limit=3)

        if not results:
            print("x No results found")
            return False

        print(f"+ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  Source: {item.source}")
        print(f"  Author: {item.author}")

        # Verify source is correct
        assert item.source == "pixabay", f"Expected source 'pixabay', got '{item.source}'"
        print(f"+ Source verified: pixabay")

        # Test 2: Download
        print(f"\n[TEST 2] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"+ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")
        else:
            print(f"x Download failed: {result.error}")
            return False

        print("\n+ Pixabay tests passed!")
        return True

    except Exception as e:
        print(f"\nx Pixabay test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_pexels():
    """Test Pexels fetcher."""
    print("\n" + "=" * 70)
    print("Testing Pexels Fetcher")
    print("=" * 70)

    # Check for API key
    api_key = os.getenv("PEXELS_API_KEY")
    if not api_key or api_key.startswith("your_"):
        print("\n!! Pexels API key not configured")
        print("   Set PEXELS_API_KEY in .env file")
        print("   Skipping Pexels tests")
        return True  # Not a failure, just skip

    config = {"rate_limit": 0.6, "api_key": api_key}
    fetcher = PexelsFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'ocean sunset'...")
        results = await fetcher.search("ocean sunset", limit=3)

        if not results:
            print("x No results found")
            return False

        print(f"+ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title[:80]}...")
        print(f"  ID: {item.id}")
        print(f"  Source: {item.source}")
        print(f"  Author: {item.author}")

        # Verify source is correct
        assert item.source == "pexels", f"Expected source 'pexels', got '{item.source}'"
        print(f"+ Source verified: pexels")

        # Verify attribution
        assert "Pexels" in item.attribution, f"Attribution should mention Pexels: {item.attribution}"
        print(f"+ Attribution verified")

        # Test 2: Get Details
        print(f"\n[TEST 2] Getting details for: {item.id}")
        details = await fetcher.get_details(item.id)
        print(f"+ Retrieved details")
        print(f"  Width: {details.width}, Height: {details.height}")

        # Test 3: Download
        print(f"\n[TEST 3] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"+ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")
        else:
            print(f"x Download failed: {result.error}")
            return False

        print("\n+ Pexels tests passed!")
        return True

    except Exception as e:
        print(f"\nx Pexels test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def test_medlineplus():
    """Test MedlinePlus ADAM fetcher."""
    print("\n" + "=" * 70)
    print("Testing MedlinePlus ADAM Fetcher")
    print("=" * 70)

    config = {"rate_limit": 1.5}
    fetcher = MedlinePlusFetcher(config)

    try:
        # Test 1: Search
        print("\n[TEST 1] Searching for 'heart'...")
        results = await fetcher.search("heart", limit=3)

        if not results:
            print("x No results found")
            return False

        print(f"+ Found {len(results)} results")

        # Display first result
        item = results[0]
        print(f"\n[RESULT] First result:")
        print(f"  Title: {item.title}")
        print(f"  ID: {item.id}")
        print(f"  Source: {item.source}")
        print(f"  License: {item.license}")
        print(f"  Attribution: {item.attribution[:80]}...")

        # Verify source
        assert item.source == "medlineplus", f"Expected source 'medlineplus', got '{item.source}'"
        print(f"+ Source verified: medlineplus")

        # Verify copyright is flagged
        assert "A.D.A.M." in item.license, f"License should mention A.D.A.M., got: {item.license}"
        print(f"+ Copyright notice verified in license field")

        assert "copyright_warning" in item.metadata, "Metadata should contain copyright_warning"
        print(f"+ Copyright warning present in metadata")

        # Verify download URL pattern
        assert "fullsize" in item.download_url, f"Download URL should use fullsize path: {item.download_url}"
        print(f"+ Full-size image URL verified")

        # Test 2: Get Details by image ID
        image_id = item.metadata.get("image_id", "17004")
        print(f"\n[TEST 2] Getting details for image ID: {image_id}")
        details = await fetcher.get_details(image_id)
        print(f"+ Retrieved details")
        print(f"  Title: {details.title}")
        print(f"  Download URL: {details.download_url}")

        # Test 3: Download
        print(f"\n[TEST 3] Testing download...")
        temp_dir = Path(tempfile.gettempdir()) / "fetch-media-test"
        temp_dir.mkdir(exist_ok=True)

        result = await fetcher.download(item, temp_dir)

        if result.success:
            print(f"+ Download successful")
            print(f"  Path: {result.local_path}")
            print(f"  Size: {result.file_size:,} bytes")

            # Verify file exists
            if Path(result.local_path).exists():
                print(f"+ File verified on disk")
            else:
                print(f"x File not found!")
                return False
        else:
            print(f"x Download failed: {result.error}")
            return False

        print("\n+ MedlinePlus tests passed!")
        return True

    except Exception as e:
        print(f"\nx MedlinePlus test error: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        await fetcher.close()


async def main():
    """Run all tests."""
    print("\n" + "=" * 70)
    print("FETCH-MEDIA SKILL TEST SUITE")
    print("=" * 70)

    results = {
        "wikimedia": await test_wikimedia(),
        "bioart": await test_bioart(),
        "unsplash": await test_unsplash(),
        "nasa": await test_nasa(),
        "pixabay": await test_pixabay(),
        "pexels": await test_pexels(),
        "medlineplus": await test_medlineplus(),
    }

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    for source, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{source.upper()}: {status}")

    all_passed = all(results.values())
    print("\n" + "=" * 70)
    if all_passed:
        print("✓ ALL TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 70)

    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
