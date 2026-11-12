---
name: photo-forager
description: Find and download a real, free-to-use stock photo (no attribution required) to drop into content — Instagram carousels, blog headers, long-form posts, slides, or anywhere an existing photo is needed. Searches Pexels, Wikimedia Commons (CC0/PD), Rawpixel (CC0), and Unsplash, filters to no-attribution licenses, and writes a credits manifest. Use when the user says "find a photo of X", "I need a free image/stock photo", "grab a CC0/public-domain photo", "photo for this carousel/post/header", "no-attribution image", or needs a real photograph (not a generated/AI design asset, not a logo/favicon/OG image). This SOURCES existing photos; it does NOT generate new design assets (use opendesign-router for that) or build favicons (use web-asset-generator).
---

# photo-forager

Sources real, free-to-use photos across four services and filters to images that
need **no attribution**. Backed by the CLI at `.claude/skills/photo-forager`.

## When this fires vs. neighbors

- **Need an existing real photo** to use in content → **this skill**.
- Need a *generated* / AI design asset, logo, hero mockup, banner → `opendesign-router`.
- Need a favicon / app icon / OG image from a logo or slogan → `web-asset-generator`.

## License model (the whole point)

- **Pexels, Wikimedia (CC0/PD only), Rawpixel (CC0)** → no credit required.
- **Unsplash** → its API Terms require a credit; results are **kept but labeled**, with
  a ready-to-paste credit string. Default ranking puts the no-attribution sources first.
- Wikimedia + Rawpixel need **no key**. Pexels/Unsplash activate when keys are in
  `.claude/skills/photo-forager/.env`. The CLI degrades gracefully without them.

## Workflow

1. **Pull project context first.** If a project/brand is active (e.g. a carousel build),
   infer the subject, mood, and orientation from it — don't ask for details already known.
   Carousels → `--orientation portrait` (or `square`); blog/slide headers → `landscape`.

2. **Search** (JSON for parsing):
   ```bash
   python3 .claude/skills/photo-forager/forage search "<subject>" --orientation <o> --limit 12 --json
   ```
   Add `--free-only` to exclude Unsplash entirely. Add `--sources wikimedia,rawpixel`
   to restrict. Rawpixel's archive skews to classic art / vintage; Wikimedia keyword
   search is the most literal.

3. **Present candidates** — list each with its index, source, license flag
   (`✓ free` vs `⚠ needs-credit`), dimensions, and thumb URL. Let the user pick, OR if
   they said "just grab a couple / the best one," auto-pick the top no-attribution results.

4. **Download the picks:**
   ```bash
   python3 .claude/skills/photo-forager/forage download --pick 1,3,5 --out <project>/images
   ```
   This writes full-res files + `manifest.json` + `CREDITS.md`.

5. **Report credits.** Read `<out>/CREDITS.md`. If anything is attribution-required
   (only Unsplash), surface the exact credit line and tell the user where to place it.
   If everything is attribution-free, say so plainly.

6. **Hand off to the build.** Pass the local file paths downstream:
   - **instagram-carousel-maker** base64-embeds local image files — give it the paths.
   - long-form / slides / blog — reference the saved file paths directly.

## Setup check

Run once if unsure things are wired:
```bash
python3 .claude/skills/photo-forager/forage sources
```
Shows which sources are ready and which need a key.
