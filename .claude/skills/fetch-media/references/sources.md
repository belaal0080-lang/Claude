# Media Sources

Complete reference for all supported media sources.

---

## 🚨 CRITICAL: Always Use Python Script via Bash

**NEVER** use WebFetch or WebSearch to access these sources directly. **ALWAYS** use the Python script:

```bash
python3 .claude/skills/fetch-media/scripts/search_media.py [options]
```

**Why this is mandatory**:
- ✅ BioArt: Uses pre-built local index (fast, no web crawling)
- ✅ Wikimedia: Uses proper MediaWiki API with correct rate limiting
- ✅ Unsplash: Uses official API with authentication
- ✅ Pixabay: Uses official API with authentication and rate limiting
- ✅ NASA: Uses official API with proper metadata handling
- ✅ All sources: Proper attribution, file naming, and download management
- ❌ WebFetch/WebSearch: Bypasses indexes, violates rate limits, incomplete results

---

## Wikimedia Commons

**URL**: [commons.wikimedia.org](https://commons.wikimedia.org)

### Overview
- **Type**: General-purpose media repository
- **Content**: 100M+ files including photos, illustrations, diagrams, 3D models, audio, video
- **License**: Varies (CC0, CC-BY, CC-BY-SA, Public Domain, etc.)
- **API**: Yes (MediaWiki API)
- **Authentication**: None required

### File Types
- Images: JPEG, PNG, GIF, SVG, TIFF, WebP
- 3D Models: STL, OBJ, PLY
- Documents: PDF, DJVU
- Video: OGG, WebM, MP4
- Audio: OGG, FLAC, WAV, MP3

### Best For
- General images and illustrations
- Historical photographs
- Scientific diagrams
- SVG vector graphics
- Public domain content
- Well-documented media with complete metadata

### Search Tips
- ✅ Use descriptive multi-word terms: "electron microscopy virus"
- ✅ Filter by file type: `--file-types svg,png`
- ✅ Results are well-categorized and tagged
- ✅ Most items have comprehensive metadata
- ℹ️ Wikimedia can handle complex queries well

### Attribution Requirements
Varies by license. Always check individual item license. The fetcher automatically provides proper attribution text.

### Example Usage
```bash
# Search for SVG diagrams
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source wikimedia \
  --query "cell membrane diagram" \
  --file-types svg \
  --limit 5
```

---

## NIH BioArt Source

**URL**: [bioart.niaid.nih.gov](https://bioart.niaid.nih.gov)

### Overview
- **Type**: Scientific illustration repository
- **Content**: Professional medical and biological illustrations
- **License**: Public Domain and CC-BY
- **API**: No (requires index-based search)
- **Authentication**: None required

### ⚠️ IMPORTANT: Search Strategy
**BioArt uses OR logic** - multi-word queries return results matching ANY word.

**Best practices**:
- ✅ Use **single focused keywords**: `--query "virus"`
- ✅ Do multiple single-keyword searches if needed
- ❌ Avoid multi-word queries: `--query "virus electron microscopy"`

**Why**: Multi-word queries return too many irrelevant results. `"virus electron microscopy"` returns anything with "virus" OR "electron" OR "microscopy".

### File Types
- PNG (prioritized, universally compatible)
- AI (Adobe Illustrator)
- SVG (Scalable Vector Graphics)
- EPS (Encapsulated PostScript)
- PPTX (PowerPoint)

### Best For
- Scientific presentations
- Anatomical diagrams
- Pathogen illustrations
- Professional medical imagery
- Educational materials
- Publication-quality graphics

### Categories
- Viruses
- Bacteria
- Cells
- Proteins
- Anatomy
- Animals
- Plants
- Arthropods
- Equipment
- And more...

### Search Tips
- ✅ **Single focused keywords only**: "virus", "bacteria", "lymphocyte"
- ❌ **Avoid multi-word queries**: "virus electron microscopy" (returns OR logic results)
- ✅ Do separate searches for different concepts
- ✅ Use specific terms: "coronavirus" instead of "virus structure"
- ℹ️ Index searches title, description, and keywords fields

### Index Management
BioArt requires a local search index. Build it with:

```bash
# First-time build (takes ~15 minutes)
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py --mode full

# Update with new items only
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py --mode incremental

# Search the index directly
python3 .claude/skills/fetch-media/scripts/bioart_crawler.py \
  --mode search \
  --search "coronavirus"
```

### Attribution Requirements
**Required format**:
- Publication: `NIAID Visual & Medical Arts. [date]. [Title]. NIAID BioArt Source. bioart.niaid.nih.gov/bioart/[ID]`
- Web/Print: `Illustration from NIAID NIH BioArt Source (bioart.niaid.nih.gov/bioart/[ID])`

The fetcher automatically generates proper attribution.

### Example Usage
```bash
# ✅ CORRECT - Single focused keyword
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "virus" \
  --mode download \
  --limit 5

# ❌ AVOID - Multi-word query (returns OR logic results)
# python3 .claude/skills/fetch-media/scripts/search_media.py \
#   --source bioart \
#   --query "virus structure" \
#   --mode download

# ✅ If you need multiple concepts, do separate searches
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "coronavirus" \
  --limit 3

python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source bioart \
  --query "influenza" \
  --limit 3
```

---

## NASA Images

**URL**: [images.nasa.gov](https://images.nasa.gov)

### Overview
- **Type**: Space and astronomy image library
- **Content**: 140,000+ images from space missions, telescopes, and Earth observations
- **License**: Public Domain (unless otherwise noted)
- **API**: Yes (REST API)
- **Authentication**: None required

### File Types
- JPEG (primary format)
- TIFF (high-resolution originals)
- PNG (some images)
- Multiple resolutions available (thumb, small, medium, large, original)

### Best For
- Space photography and astronomy
- Planetary imagery (Mars, Jupiter, Saturn, etc.)
- Telescope imagery (Hubble, James Webb, etc.)
- Earth observations and satellite imagery
- NASA mission photos (Apollo, Mars rovers, ISS)
- Educational and scientific presentations
- Public domain space content

### Categories
- Planets and Solar System
- Stars, Galaxies, and Deep Space
- Earth from Space
- Spacecraft and Missions
- Astronauts and ISS
- Historical missions (Apollo, Shuttle, etc.)
- Mars rovers (Curiosity, Perseverance, etc.)
- And more...

### Search Tips
- ✅ Supports multi-word queries: "Mars rover Curiosity"
- ✅ Use mission names: "Hubble telescope", "Apollo 11"
- ✅ Use planetary names: "Jupiter", "Saturn rings"
- ✅ Results include metadata: center, photographer, location, keywords
- ℹ️ NASA Images API provides excellent relevance ranking

### Attribution Requirements
**Public Domain** - No attribution legally required, but recommended:
- Format: "[Photographer/Center], NASA Image Library, [URL]"
- Example: "JPL, NASA Image Library, https://images.nasa.gov/details/PIA05982"
- The fetcher automatically generates proper attribution

### Example Usage
```bash
# ✅ Search for Mars rover images
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Mars rover" \
  --mode download \
  --limit 5

# ✅ Search for Hubble telescope imagery
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "Hubble telescope nebula" \
  --limit 10

# ✅ Multi-word queries work well
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source nasa \
  --query "International Space Station Earth" \
  --mode download
```

---

## Unsplash

**URL**: [unsplash.com](https://unsplash.com)

### Overview
- **Type**: High-quality photography platform
- **Content**: Professional photographs
- **License**: Unsplash License (free to use)
- **API**: Yes (REST API)
- **Authentication**: Required (API key)

### File Types
- JPEG only (photography platform)
- Multiple resolutions available
- High-quality downloads (up to full resolution)

### Best For
- General photography
- Modern aesthetic images
- Backgrounds and textures
- Professional quality photos
- Contemporary imagery
- Color-coordinated images

### API Setup
See [api-setup.md](api-setup.md) for detailed configuration instructions.

### Attribution Requirements
**Not required** by license, but appreciated:
- Format: "Photo by [Author Name] on Unsplash"
- The fetcher automatically provides attribution

### License Details
Unsplash License allows:
- Commercial and non-commercial use
- No permission needed
- Modification allowed

Not allowed:
- Creating competing services
- Selling unmodified photos

Full license: [unsplash.com/license](https://unsplash.com/license)

### Search Features
- Keyword search
- Color filtering (via API, not yet exposed in CLI)
- Orientation filtering
- High relevance ranking

### Example Usage
```bash
# Search Unsplash (requires API key)
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source unsplash \
  --query "mountain landscape" \
  --limit 10
```

---

## Pixabay

**URL**: [pixabay.com](https://pixabay.com)

### Overview
- **Type**: Stock photos, illustrations, and vectors
- **Content**: 2.9M+ free images, illustrations, and vector graphics
- **License**: Pixabay License (free for commercial use)
- **API**: Yes (REST API)
- **Authentication**: Required (API key)

### File Types
- JPEG (photos)
- PNG (illustrations)
- SVG (vectors)
- Multiple resolutions available (preview, web format, large)

### Best For
- Stock photography for commercial projects
- Illustrations and digital artwork
- Vector graphics (SVG)
- Business presentations
- Marketing materials
- Website backgrounds and headers
- Social media content

### API Setup
See [api-setup.md](api-setup.md) for detailed configuration instructions.

### Attribution Requirements
**Not required** by license, but appreciated:
- Format: "Image by [Author Name] from Pixabay"
- The fetcher automatically provides attribution

### License Details
Pixabay License allows:
- Commercial and non-commercial use
- No permission needed
- Modification allowed
- No attribution required

Not allowed:
- Selling unmodified images
- Creating competing image banks
- Implying endorsement by people depicted

Full license: [pixabay.com/service/license/](https://pixabay.com/service/license/)

### Content Types
The API supports filtering by image type:
- **Photos**: High-quality stock photography
- **Illustrations**: Digital artwork and illustrations
- **Vectors**: Scalable vector graphics (SVG)

Use `--file-types` parameter to filter:
```bash
# Photos only
--file-types photo

# Illustrations only
--file-types illustration

# Vectors only
--file-types svg
```

### Search Features
- Keyword search with multi-word support
- Category filtering (backgrounds, fashion, nature, etc.)
- Color filtering
- Orientation filtering (horizontal, vertical)
- Minimum size requirements
- SafeSearch enabled by default
- Order by popularity or latest

### Rate Limits
- **100 requests per minute**
- **5,000 requests per hour** (free accounts)
- The fetcher implements automatic rate limiting (0.6s between requests)

### Example Usage
```bash
# Search for stock photos
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "business meeting teamwork" \
  --file-types photo \
  --limit 10

# Search for vector graphics
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "nature tree" \
  --file-types svg \
  --mode download \
  --limit 5

# Search for illustrations
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source pixabay \
  --query "technology digital" \
  --file-types illustration \
  --limit 10
```

---

## MedlinePlus (ADAM Medical Diagrams)

**URL**: [medlineplus.gov](https://medlineplus.gov)

### Overview
- **Type**: Professional anatomical and medical illustration library
- **Content**: 3,500+ articles with A.D.A.M. medical diagrams
- **License**: ⚠️ **Copyrighted by A.D.A.M., Inc.** — NOT open-access
- **API**: No (uses auto-built article title index from A-Z encyclopedia pages)
- **Authentication**: None required

### ⚠️ IMPORTANT: Copyright Notice
**ADAM illustrations are copyrighted** by A.D.A.M., Inc. (Ebix/Stelvio Group).
They are licensed to the U.S. National Library of Medicine for display on
MedlinePlus only. Unlike BioArt (Public Domain) and NASA (Public Domain),
these images may NOT be freely redistributed.

**Permitted uses**:
- ✅ Educational reference and personal study
- ✅ Viewing and citing in academic work with proper attribution
- ✅ Linking to MedlinePlus pages

**Not permitted without license**:
- ❌ Redistribution in publications, apps, or websites
- ❌ Commercial use
- ❌ Modification and derivative works

### File Types
- JPEG (full-size anatomical illustrations)
- GIF (some thumbnails and animated diagrams)

### Best For
- Anatomical diagrams (heart, lungs, kidneys, etc.)
- Medical condition illustrations (fractures, tumors, infections)
- Surgical procedure visuals
- Patient education materials (with proper licensing)
- Medical presentations (educational reference)
- Clinical teaching aids

### Categories
- Anatomy (skeletal, muscular, cardiovascular, nervous, etc.)
- Conditions and diseases
- Diagnostic procedures
- Surgical procedures
- Laboratory tests
- First aid and emergency care

### Search Tips
- ✅ Use medical/anatomical terms: "heart", "kidney", "fracture"
- ✅ Multi-word queries work: "heart anatomy", "lung cancer"
- ✅ Use body part names for best results
- ✅ Searches match article titles in the encyclopedia
- ℹ️ First search auto-builds the article index (~15 seconds)
- ℹ️ Index auto-refreshes every 30 days

### Index Management
MedlinePlus uses a lightweight article-title index that auto-builds on first use:

```bash
# Index is auto-built — no manual action needed
# To force rebuild:
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source medlineplus \
  --query "test" \
  --limit 1
# (delete medlineplus_index.json first to force rebuild)
```

### Attribution Requirements
**Required format**:
- `A.D.A.M. Medical Encyclopedia, "[Article Title]", via MedlinePlus (medlineplus.gov). © A.D.A.M., Inc. All rights reserved.`

The fetcher automatically generates proper attribution with copyright notice.

### Example Usage
```bash
# ✅ Search for anatomical diagrams
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source medlineplus \
  --query "heart" \
  --mode download \
  --limit 5

# ✅ Search for specific conditions
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source medlineplus \
  --query "diabetes" \
  --mode url \
  --limit 10

# ✅ Multi-word medical queries
python3 .claude/skills/fetch-media/scripts/search_media.py \
  --source medlineplus \
  --query "bone fracture" \
  --limit 5
```

---

## Comparison Matrix

| Feature | Wikimedia | BioArt | NASA | Unsplash | Pixabay | MedlinePlus |
|---------|-----------|---------|------|----------|---------|-------------|
| **API** | Yes | No (Index) | Yes | Yes | Yes | No (Auto-Index) |
| **Auth Required** | No | No | No | Yes | Yes | No |
| **File Types** | Many | Many | JPEG/TIFF/PNG | JPEG only | JPEG/PNG/SVG | JPEG/GIF |
| **Content Type** | General | Scientific | Space/Astronomy | Photography | Stock photos/vectors | Medical diagrams |
| **Index Required** | No | Yes (manual) | No | No | No | Yes (auto-built) |
| **Attribution** | Varies | Required | Public Domain | Optional | Optional | **Required** |
| **Search Strategy** | Multi-word OK | Single keyword | Multi-word OK | Multi-word OK | Multi-word OK | Multi-word OK |
| **Search Logic** | AND/relevance | OR (any term) | Relevance | Relevance | Relevance | Title match |
| **Best For** | Diagrams, SVGs | Scientific illust. | Space imagery | Pro photos | Stock photos | Medical/anatomy |
| **Setup Complexity** | Easy | Medium | Easy | Easy | Easy | Easy (auto) |
| **Rate Limit** | Generous | N/A (Local) | Generous | 50/hour | 100/min | 1.5s/request |
| **Commercial Use** | Varies | Public Domain | Public Domain | Free | Free | **⚠️ Copyrighted** |

### Key Differences in Search Behavior

**Wikimedia**:
- ✅ Handles multi-word queries well: "electron microscopy virus"
- Uses relevance-based ranking
- Can use complex search syntax

**BioArt**:
- ⚠️ Uses OR logic - only use single keywords
- Multi-word queries return results matching ANY term
- Best practice: Separate single-keyword searches

**NASA**:
- ✅ Excellent multi-word query support: "Mars rover Curiosity"
- Relevance-based ranking optimized for space/astronomy
- Rich metadata including mission names, centers, photographers

**Unsplash**:
- ✅ Handles natural language queries well
- Uses AI-powered relevance ranking
- Can use descriptive phrases

**Pixabay**:
- ✅ Excellent multi-word query support: "business meeting teamwork"
- Supports filtering by image type (photo, illustration, vector)
- Relevance-based ranking
- Rich filtering options (category, color, orientation, size)

**MedlinePlus**:
- ✅ Multi-word queries work: "heart anatomy", "bone fracture"
- Searches encyclopedia article titles (3,500+ articles)
- ⚠️ Results are copyrighted by A.D.A.M., Inc.
- Best with medical/anatomical terminology

---

## Adding New Sources

To add a new media source:

1. **Create fetcher** in `scripts/fetchers/new_source.py`
2. **Implement BaseFetcher** interface:
   - `async def search(query, file_types, limit)`
   - `async def get_details(item_id)`
   - Optionally override `async def download()`
3. **Register in main script** (`scripts/search_media.py`):
   ```python
   FETCHERS = {
       'wikimedia': WikimediaFetcher,
       'bioart': BioArtFetcher,
       'unsplash': UnsplashFetcher,
       'nasa': NASAFetcher,
       'pixabay': PixabayFetcher,
       'medlineplus': MedlinePlusFetcher,
       'newsource': NewSourceFetcher  # Add here
   }
   ```
4. **Update documentation**
5. **Test thoroughly**

See `scripts/fetchers/base.py` for the complete interface.
