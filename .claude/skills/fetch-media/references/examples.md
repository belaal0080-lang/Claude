# Usage Examples

Comprehensive examples for different use cases.

---

## 🚨 CRITICAL: Always Use Python Script via Bash

**NEVER** use WebFetch or WebSearch to access these sources directly. **ALWAYS** use the Python script:

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py [options]
```

**Why this matters**:
- ✅ BioArt: Uses pre-built local index (fast, no web crawling)
- ✅ Wikimedia: Uses proper MediaWiki API with rate limiting
- ✅ Unsplash: Uses official API with authentication
- ✅ Pixabay: Uses official API with authentication and rate limiting
- ✅ NASA: Uses official API with proper metadata handling
- ❌ WebFetch: Bypasses indexes, slow, incomplete results

---

## Basic Search Examples

### Quick URL Search
Get URLs without downloading files (fastest):

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "microscopy" \
  --mode url \
  --limit 5
```

**Use when**: You want to preview what's available before downloading.

### Download Images
Download files to temp directory:

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "cell division" \
  --mode download \
  --limit 3
```

**Use when**: You need immediate access to files.

### Specific Output Directory
Download to a custom location:

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "virus" \
  --mode download \
  --output ~/Documents/presentation-images \
  --limit 10
```

**Use when**: Organizing files for a specific project.

---

## Source-Specific Examples

### Wikimedia Commons

#### Search for SVG Diagrams
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "DNA structure" \
  --file-types svg \
  --mode download
```

**Why**: SVG files are scalable and perfect for presentations.

#### High-Resolution Photos
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "mitochondria electron microscopy" \
  --file-types jpg,png \
  --limit 5
```

**Why**: Wikimedia has excellent scientific photography.

### NIH BioArt

**⚠️ BioArt Search Strategy**: Use **single focused keywords** only. BioArt uses OR logic, so multi-word queries return results matching ANY word.

#### First-Time Setup
```bash
# Build the index (only needed once, takes ~15 minutes)
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py --mode full

# After building, search works normally
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "coronavirus" \
  --mode download
```

#### Update Index
```bash
# Get new items added since last crawl
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py --mode incremental
```

#### Scientific Presentations - Single Keyword Search
```bash
# ✅ CORRECT - Single focused keyword
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "bacteria" \
  --mode download \
  --output ~/presentation/images

# ❌ AVOID - Multi-word query returns anything with "bacterial" OR "cell" OR "structure"
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "bacterial cell structure" \
  --mode download
```

**Why**:
- BioArt illustrations are publication-quality and scientifically accurate
- Single keywords ensure precise, relevant results

### Unsplash

#### Setup
```bash
# First, configure API key (one-time)
cd .claude/skills/fetch-media
cp .env.example .env
nano .env  # Add your UNSPLASH_API_KEY
```

#### Search Photos
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "laboratory research" \
  --limit 10
```

#### High-Quality Backgrounds
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "abstract science" \
  --mode download \
  --output ~/backgrounds
```

**Why**: Unsplash photos are high-quality and professionally composed.

### NASA Images

#### Space Photography
```bash
# Search for Mars rover images
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Mars rover" \
  --mode download \
  --limit 5
```

**Why**: NASA Images provides authentic space mission photography with rich metadata.

#### Telescope Imagery
```bash
# Get Hubble telescope images
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Hubble telescope nebula" \
  --mode download \
  --output ~/astronomy/hubble
```

**Why**: High-resolution telescope imagery perfect for astronomy presentations.

#### Planetary Images
```bash
# Multi-word queries work well with NASA
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Saturn rings Cassini" \
  --limit 10
```

**Why**: NASA supports natural multi-word queries for precise results.

#### Earth from Space
```bash
# Earth observation imagery
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Earth from ISS" \
  --mode download \
  --output ~/earth-images
```

**Why**: Stunning Earth photography from the International Space Station.

### Pixabay

#### Setup
```bash
# First, configure API key (one-time)
cd .claude/skills/fetch-media
nano .env  # Add your PIXABAY_API_KEY
```

#### Stock Photos for Business
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "business meeting teamwork" \
  --file-types photo \
  --mode download \
  --limit 10
```

**Why**: Pixabay provides high-quality stock photography free for commercial use without attribution requirements.

#### Vector Graphics (SVG)
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "nature tree forest" \
  --file-types svg \
  --mode download \
  --output ~/vectors
```

**Why**: Scalable vector graphics perfect for logos, icons, and designs.

#### Illustrations
```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "technology digital innovation" \
  --file-types illustration \
  --limit 5
```

**Why**: Professional digital illustrations ideal for presentations and marketing materials.

#### Marketing and Social Media
```bash
# Get images for social media posts
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "lifestyle wellness health" \
  --file-types photo \
  --mode download \
  --output ~/social-media/health \
  --limit 15
```

**Why**: Free commercial use with no attribution required makes Pixabay perfect for social media and marketing.

---

## Use Case Examples

### 1. Creating a Virology Presentation

**Goal**: Get diverse images about viruses

```bash
# Step 1: Get scientific illustrations from BioArt
# ⚠️ Use single keyword for BioArt to avoid OR logic issues
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "virus" \
  --mode download \
  --output ~/presentation/scientific \
  --limit 5

# Step 2: Get microscopy photos from Wikimedia
# ✅ Wikimedia can handle multi-word queries
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "virus electron microscopy" \
  --file-types jpg,png \
  --mode download \
  --output ~/presentation/photos \
  --limit 5

# Step 3: Get background images from Unsplash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "laboratory microscope" \
  --mode download \
  --output ~/presentation/backgrounds \
  --limit 3
```

**Result**: 13 diverse, high-quality images from different sources with proper attribution.

**Note**: BioArt uses single keyword ("virus") while Wikimedia and Unsplash can handle multi-word queries.

### 2. Research Paper Figures

**Goal**: Publication-quality diagrams with proper licensing

```bash
# Search all sources, get URLs first to review
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "protein structure diagram" \
  --file-types svg,png \
  --mode url \
  --limit 20

# After reviewing, download specific items
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "protein folding diagram" \
  --file-types svg \
  --mode download \
  --output ~/research/figures
```

**Why**: SVGs from Wikimedia are scalable and meet publication standards.

### 3. Educational Materials

**Goal**: Clear, accurate scientific illustrations

```bash
# ✅ CORRECT - BioArt with single keyword
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "lymphocyte" \
  --mode download \
  --output ~/teaching/immunology

# If you need multiple topics, do separate searches:
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "antibody" \
  --mode download \
  --output ~/teaching/immunology \
  --limit 3
```

**Why**: BioArt illustrations are designed for education and are free to use.

**⚠️ Avoid**: `--query "immune system cells"` - returns anything with "immune" OR "system" OR "cells"

### 4. Web Content

**Goal**: Modern, professional photography

```bash
# Unsplash for contemporary web aesthetics
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "medical technology" \
  --mode download \
  --output ~/website/images \
  --limit 15
```

**Why**: Unsplash photos have modern composition and don't require attribution.

### 5. Astronomy Presentation

**Goal**: Create a presentation about the solar system

```bash
# Step 1: Get planetary images from NASA
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Jupiter" \
  --mode download \
  --output ~/astronomy/planets \
  --limit 5

# Step 2: Get more planet images
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Saturn rings" \
  --mode download \
  --output ~/astronomy/planets \
  --limit 5

# Step 3: Get telescope imagery
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Hubble deep field" \
  --mode download \
  --output ~/astronomy/deep-space \
  --limit 5

# Step 4: Get diagrams from Wikimedia
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "solar system diagram" \
  --file-types svg \
  --mode download \
  --output ~/astronomy/diagrams
```

**Result**: Authentic NASA space photography combined with Wikimedia diagrams.

**Note**: NASA images are all public domain - perfect for educational use.

### 6. Business Presentation and Marketing Materials

**Goal**: Create professional marketing content with stock photos

```bash
# Step 1: Get business-themed stock photos from Pixabay
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "business success growth" \
  --file-types photo \
  --mode download \
  --output ~/marketing/business \
  --limit 10

# Step 2: Get technology-themed images
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "technology innovation digital" \
  --file-types photo \
  --mode download \
  --output ~/marketing/technology \
  --limit 10

# Step 3: Get vector graphics for infographics
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "business icons communication" \
  --file-types svg \
  --mode download \
  --output ~/marketing/vectors \
  --limit 5

# Step 4: Get illustrations for presentations
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "teamwork collaboration" \
  --file-types illustration \
  --mode download \
  --output ~/marketing/illustrations \
  --limit 5
```

**Result**: 30 professional images (photos, vectors, illustrations) ready for commercial use with no attribution required.

**Why Pixabay for business**:
- Free for commercial use
- No attribution required
- High-quality stock photography
- Diverse content types (photos, vectors, illustrations)
- Professional quality suitable for client presentations

### 7. Quick Exploration

**Goal**: See what's available across all sources

```bash
# Search all sources simultaneously
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "mitochondria" \
  --mode url \
  --limit 10 \
  --format pretty
```

**Result**: Formatted output showing top results from all sources.

---

## Advanced Workflows

### Batch Processing

Create a script to fetch multiple topics:

```bash
#!/bin/bash
# fetch_presentation_images.sh

# ⚠️ For BioArt: Use single keywords only
TOPICS=("virus" "bacteria" "cell" "protein" "DNA")
OUTPUT_BASE=~/presentation/images

for topic in "${TOPICS[@]}"; do
  echo "Fetching: $topic"
  # BioArt: Use single keyword
  python3 .claude/skills/fetch-media/scripts/search_media.py \
    --source bioart \
    --query "$topic" \
    --mode download \
    --output "$OUTPUT_BASE/$topic" \
    --limit 3

  # Wikimedia: Can use multi-word queries
  python3 .claude/skills/fetch-media/scripts/search_media.py \
    --source wikimedia \
    --query "$topic microscopy" \
    --mode download \
    --output "$OUTPUT_BASE/$topic-wiki" \
    --limit 3
done
```

### Citation Management

Extract citations for attribution:

```bash
# Get results as JSON
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "virus" \
  --mode url \
  --format json > results.json

# Extract citations
python3 -c "
import json
data = json.load(open('results.json'))
for citation in data['citations']:
    print(citation)
" > citations.txt
```

### Filter by License

Use JSON output to filter by license type:

```bash
# Get results
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "cell" \
  --mode url \
  --format json > results.json

# Filter for Public Domain only
python3 -c "
import json
data = json.load(open('results.json'))
for item in data['results']:
    if 'public domain' in item['license'].lower():
        print(f\"{item['title']}: {item['url']}\")
"
```

---

## Troubleshooting Examples

### BioArt Index Missing

```bash
# Error: "BioArt index not found"
# Solution: Build the index
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py --mode full
```

### Unsplash Authentication

```bash
# Error: "Unsplash API key not found"
# Solution: Configure API key
cd .claude/skills/fetch-media
cp .env.example .env
# Edit .env and add UNSPLASH_API_KEY
nano .env
```

### Pixabay Authentication

```bash
# Error: "Pixabay API key not found"
# Solution: Configure API key
cd .claude/skills/fetch-media
nano .env
# Add PIXABAY_API_KEY=your_key_here
```

### No Results Found

```bash
# Try broader search terms
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "virus" \
  --limit 20

# Try different source
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "virus"
```

### BioArt Returns Too Many Irrelevant Results

```bash
# ❌ PROBLEM - Multi-word query uses OR logic
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "virus electron microscopy"
# Returns anything with "virus" OR "electron" OR "microscopy"

# ✅ SOLUTION - Use single focused keyword
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "virus"
# Returns only items about viruses

# If you need multiple concepts, do separate searches
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "coronavirus" \
  --limit 3

python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "influenza" \
  --limit 3
```

### Using WebFetch Instead of Python Script

```bash
# ❌ WRONG - Never do this
# WebFetch(url="https://bioart.niaid.nih.gov/search")
# WebSearch(query="bioart virus images")

# ✅ CORRECT - Always use Python script via Bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "virus" \
  --mode url
```

**Why Python script is required**:
- BioArt: Uses local index (bioart_index.json) for fast searching
- Wikimedia: Uses proper MediaWiki API with rate limiting
- Unsplash: Uses official API with authentication
- Pixabay: Uses official API with authentication and rate limiting
- NASA: Uses official API with proper metadata handling
- All: Proper file naming, attribution, and download management

### Rate Limiting

```bash
# If rate limited, wait and retry
# Or increase rate limit delay in fetcher config
# Default: 1 second between requests
```

---

## Integration Examples

### From Python Code

```python
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path.home() / ".claude/skills/fetch-media/scripts"))
from search_media import search_media

async def fetch_images():
    results = await search_media(
        query="virus microscopy",
        source="wikimedia",
        limit=5,
        mode="download",
        output_dir="/tmp/images"
    )

    print(f"Found {len(results['results'])} images")
    for item in results['results']:
        print(f"- {item['title']}: {item['local_path']}")

asyncio.run(fetch_images())
```

### From Other Skills

Other Claude Code Skills can invoke this skill:

```bash
# From another skill's workflow
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "$USER_TOPIC" \
  --mode download \
  --format json
```

### From Slash Commands

Create a custom slash command that uses this skill:

```yaml
---
description: Fetch scientific images for presentations
---
Use the fetch-media skill to get images for: $ARGUMENTS
```

---

## Output Format Examples

### JSON Output

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "virus" \
  --limit 2 \
  --format json
```

```json
{
  "query": "virus",
  "mode": "url",
  "results": [
    {
      "id": "File:Virus.jpg",
      "title": "Electron microscopy of virus",
      "source": "wikimedia",
      "url": "https://commons.wikimedia.org/wiki/File:Virus.jpg",
      "download_url": "https://upload.wikimedia.org/...",
      "file_type": "jpg",
      "license": "CC-BY 4.0",
      "attribution": "John Doe, via Wikimedia Commons, https://..."
    }
  ],
  "citations": [
    "John Doe, via Wikimedia Commons, https://..."
  ],
  "warnings": [],
  "stats": {
    "total_found": 1,
    "sources_searched": ["wikimedia"],
    "sources_failed": []
  }
}
```

### Pretty Output

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --query "virus" \
  --limit 2 \
  --format pretty
```

```
======================================================================
Search Results for: virus
======================================================================

Found 2 results
Sources searched: wikimedia, bioart

1. Electron microscopy of virus
   Source: wikimedia
   URL: https://commons.wikimedia.org/wiki/File:Virus.jpg
   Attribution: John Doe, via Wikimedia Commons, https://...

2. Coronavirus Structure
   Source: bioart
   URL: https://bioart.niaid.nih.gov/bioart/560
   Attribution: NIAID Visual & Medical Arts, BioArt Source, https://...
```
