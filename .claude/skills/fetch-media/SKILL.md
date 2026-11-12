---
name: fetch-media
description: Search, fetch, and download open-access images, scientific illustrations, and media from Wikimedia Commons, NIH BioArt, NASA Images, Unsplash, Pixabay, Pexels, and MedlinePlus ADAM medical diagrams. Returns URLs or downloads files with full citations. Use when user needs to search for images, fetch images, download images, or find images for presentations, documents, research, or when user mentions needing photos, scientific illustrations, space imagery, astronomy, microscopy, medical imagery, anatomical diagrams, ADAM illustrations, stock photos, or any visual media.
---

# IMMEDIATE ACTIONS WHEN THIS SKILL LOADS

**CRITICAL**: When this skill is invoked, you MUST immediately follow these steps. Do NOT just describe what the skill does - EXECUTE IT.

## Step 1: Determine Search Query

If the user hasn't provided a search query, ask them:
- What type of images do they need?
- What search terms should be used?
- How many results do they want? (default: 5)
- Do they want URLs only or downloaded files? (default: download)

If the user HAS provided search terms in their message, proceed directly to Step 2.

## Step 2: Execute the Search

### Platform Detection

**On Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "USER_SEARCH_TERM" --mode download --limit 5
```

**On Linux/macOS (Bash):**
```bash
bash ".claude/skills/fetch-media/scripts/fetch_media.sh" --query "USER_SEARCH_TERM" --mode download --limit 5
```

Replace `USER_SEARCH_TERM` with the actual search query from the user.

### Mode Options:
- `--mode url` - Returns URLs only (fast, no downloads)
- `--mode download` - Downloads files to temp directory (recommended)

### Source Options (optional):
- `--source wikimedia` - Search only Wikimedia Commons
- `--source bioart` - Search only NIH BioArt (scientific illustrations)
- `--source nasa` - Search only NASA Images
- `--source pixabay` - Search only Pixabay
- `--source pexels` - Search only Pexels (high-quality stock photography)
- `--source medlineplus` - Search only MedlinePlus ADAM medical diagrams (copyrighted)
- Omit `--source` to search ALL sources automatically

### Examples of Correct Commands:

**Download virus images (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "virus" --source bioart --mode download --limit 5
```

**Download virus images (Linux/macOS):**
```bash
bash ".claude/skills/fetch-media/scripts/fetch_media.sh" --query "virus" --source bioart --mode download --limit 5
```

**Get URLs for space images (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "mars rover" --source nasa --mode url --limit 10
```

**Download ADAM medical diagrams (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "heart anatomy" --source medlineplus --mode download --limit 5
```

**Search all sources for medical images (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "cell division microscopy" --mode download --limit 5
```

## Step 3: Parse and Present Results

After the command completes, you'll receive JSON output containing:
- `results`: Array of media items with URLs, titles, sources
- `citations`: Full attribution text for each item
- `local_paths`: File paths where images were downloaded (if mode=download)
- `warnings`: Any errors or issues (e.g., missing API keys)

Present the results to the user in a clear format:
1. Show how many images were found
2. List each image with its title, source, and location
3. Provide all citations for proper attribution
4. Note any warnings (especially missing API keys)

---

# CRITICAL RULES

## MUST DO:
- ALWAYS use the Bash tool with the wrapper script (PowerShell on Windows, Bash on Linux/macOS)
- ALWAYS use the wrapper script, NEVER call search_media.py directly
- The wrapper script works from ANY directory - no need to cd or construct paths
- Present downloaded image paths so the user can access them

## NEVER DO:
- NEVER use WebFetch to access bioart.niaid.nih.gov, wikimedia.org, nasa.gov, unsplash.com, or pixabay.com
- NEVER use WebSearch to find images
- NEVER manually construct URLs or download files with curl/wget
- NEVER call the Python script directly without the wrapper
- NEVER use relative paths - always use `$HOME` based paths

## Why This Matters:
- The wrapper script handles all environment setup, path resolution, and API authentication
- The Python script uses specialized APIs and local indexes (e.g., BioArt index)
- A PreToolUse hook enforces these rules and will block incorrect tool usage

---

# DETAILED INFORMATION

<sources>
## Available Sources

**Wikimedia Commons**
- 100M+ files - photos, illustrations, diagrams, 3D models
- Best for: General images, historical photos, diagrams, SVGs
- Authentication: None required

**NIH BioArt**
- Professional medical/biological illustrations
- Best for: Scientific presentations, anatomical diagrams, pathogen illustrations
- Formats: PNG (prioritized), AI, SVG, EPS, PPTX
- Search strategy: Use single keywords for best results (OR logic)
- Authentication: None required

**NASA Images**
- 140,000+ images from space missions, telescopes, Earth observations
- Best for: Space photography, astronomy, planetary imagery
- Formats: JPEG, TIFF, PNG (multiple resolutions)
- Authentication: None required

**Unsplash**
- High-quality professional photography
- Best for: General photography, backgrounds, modern aesthetics
- Authentication: Required (API key in .env file)

**Pixabay**
- 2.9M+ stock photos, illustrations, and vector graphics
- Best for: Stock photography, commercial use
- License: Free for commercial use, no attribution required
- Authentication: Required (API key in .env file)

**Pexels**
- High-quality stock photography with great alt-text descriptions
- Best for: Professional photography, backgrounds, modern aesthetics
- License: Pexels License (free for personal and commercial use)
- Authentication: Required (API key in .env file)

**MedlinePlus (ADAM Medical Diagrams)**
- 3,500+ professional anatomical and medical illustrations from A.D.A.M., Inc.
- Best for: Anatomical diagrams, medical condition illustrations, surgical visuals
- Formats: JPEG (full-size medical illustrations)
- ⚠️ IMPORTANT: Images are COPYRIGHTED by A.D.A.M., Inc. — NOT open-access
- Use for educational reference only. Do not redistribute without permission.
- Authentication: None required
- Auto-builds article index on first use (~15 seconds)
</sources>

<query_tips>
## Search Query Tips

**For BioArt (scientific illustrations):**
- Use single, focused keywords: "virus", "bacteria", "cell"
- Avoid multi-word queries (uses OR logic, returns too many results)
- Multiple single-word searches better than one multi-word search

**For General Searches:**
- Be specific: "electron microscopy cell division" better than "cell"
- Include context: "coronavirus illustration" or "mars rover photograph"
- Use descriptive terms that match image titles/descriptions

**File Type Filtering:**
Add `--file-types svg,png,jpg` to filter by format
Example: `--file-types svg` for vector graphics only
</query_tips>

<troubleshooting>
## Common Issues

**"Unsplash API key not found"**
- This is just a warning - other sources will still work
- To enable Unsplash: Add `UNSPLASH_API_KEY` to the `.env` file in the skill directory
- Get API key from: https://unsplash.com/oauth/applications

**"BioArt index not found"**
- First time using BioArt requires building the index
- Run the bioart_crawler.py script in the skill's scripts directory
- Takes ~15 minutes for full crawl, creates searchable local index

**No results found**
- Try broader search terms
- Try searching all sources (omit `--source` flag)
- Check that search terms match the type of content in that source

**PowerShell Execution Policy error (Windows)**
- Use `-ExecutionPolicy Bypass` flag as shown in examples
- Or run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
</troubleshooting>

<file_management>
## Downloaded Files

**Download Location (varies by OS):**
- **Windows**: `C:\Users\<username>\AppData\Local\Temp\fetch-media\`
- **Linux/macOS**: `/tmp/fetch-media/`

Files are saved in the system temp directory with naming: `{source}_{id}_{sanitized_title}.{ext}`
Example: `bioart_64_Bunyavirus.png`

**Cleanup**:
- System temp directory is cleaned automatically on reboot
- Manual cleanup:
  - Windows: `Remove-Item -Recurse "$env:TEMP\fetch-media"`
  - Linux/macOS: `rm -rf /tmp/fetch-media`

**Persistent Storage**:
Add `--output /path/to/directory` to save files permanently:

Windows:
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "virus" --mode download --output "$HOME\Downloads\virus-images" --limit 5
```

Linux/macOS:
```bash
bash ".claude/skills/fetch-media/scripts/fetch_media.sh" --query "virus" --mode download --output ~/Downloads/virus-images --limit 5
```
</file_management>

<advanced_usage>
## Advanced Options

**Limit Results**:
```
--limit 20  # Get up to 20 results per source
```

**Specific File Types**:
```
--file-types svg,png  # Only SVG and PNG files
```

**Output Format**:
```
--format pretty  # Human-readable output instead of JSON
```

**Combine Options (Windows example)**:
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "bacterial cell" --source bioart --file-types png,svg --mode download --limit 10 --output "$HOME\my-images"
```
</advanced_usage>

<examples>
## Common Use Cases

**Scientific Presentation - Need virus illustrations (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "coronavirus" --source bioart --mode download --limit 5
```

**Space Photography - URLs only for preview (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "mars surface" --source nasa --mode url --limit 10
```

**General Images - Search all sources (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "microscopy cells" --mode download --limit 5
```

**Stock Photos for Business (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "business meeting teamwork" --source pixabay --mode download --limit 5
```

**Vector Graphics for Design (Windows):**
```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" --query "nature tree" --source pixabay --file-types svg --mode download --limit 3
```
</examples>

---

# SUCCESS CRITERIA

A successful fetch operation has:
- At least one media item returned (unless legitimately no matches)
- Complete metadata: id, title, source, urls, attribution
- Valid URLs that are accessible
- Proper citations provided for each item
- Files downloaded to reported paths (download mode)
- Graceful handling of partial failures (some sources may fail)

---

# API KEYS SETUP

**Location**: `.env` file in the skill directory (`$HOME\.claude\skills\fetch-media\.env` on Windows)

**Current Status**:
- Pixabay API key: Configured and working
- Unsplash API key: Not configured (optional)

**To add Unsplash**:
1. Get API key from: https://unsplash.com/oauth/applications
2. Add to `.env` file: `UNSPLASH_API_KEY=your_key_here`
3. Restart Claude session

---

# REMEMBER

When this skill is invoked:
1. Ask user for search terms (if not provided)
2. Run the appropriate wrapper script:
   - **Windows**: `powershell -ExecutionPolicy Bypass -File "$HOME\.claude\skills\fetch-media\scripts\fetch_media.ps1" ...`
   - **Linux/macOS**: `bash ".claude/skills/fetch-media/scripts/fetch_media.sh" ...`
3. Parse JSON results and present them clearly
4. Include all citations for proper attribution

The wrapper script handles EVERYTHING - paths, environment, APIs. Just run it with the correct query!
