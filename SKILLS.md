# Installed Claude Code skills

Project skills live in `.claude/skills/` and load automatically when Claude Code runs in this repo.
Each folder keeps its upstream LICENSE terms (all MIT / Apache-2.0).

| Area | Skills | Source |
|---|---|---|
| UI/UX design | ui-ux-pro-max, design, design-system, ui-styling, brand, banner-design, slides | nextlevelbuilder/ui-ux-pro-max-skill |
| UI/UX design (official) | frontend-design, canvas-design, brand-guidelines, theme-factory, web-artifacts-builder, algorithmic-art | anthropics/skills |
| Anti-"AI look" design | hallmark, unslop | Nutlope/hallmark, heydamir/unslop |
| Writing / docs (official) | doc-coauthoring, internal-comms | anthropics/skills |
| Copywriting, content, SEO, marketing | copywriting, copy-editing, content-strategy, social, emails, cold-email, seo-audit, ai-seo, programmatic-seo, schema, site-architecture, link-building, cro, ads, ad-creative, launch, pricing, video, image … (54 skills) | coreyhaines31/marketingskills |
| Human-sounding writing | avoid-ai-writing, ai-writing-detector, voice-preserving-rewriter, + helpers | conorbronsdon/avoid-ai-writing |
| GEO / AI-search SEO | geo, geo-audit, geo-content, geo-citability, geo-schema, geo-llmstxt, … | zubair-trabzada/geo-seo-claude |

## Plugin suites (install once)

`plugins/claude-seo` (26 SEO skills, 19 agents) and `plugins/claude-blog` (32 blog-writing skills, 5 agents)
need their own scripts, so they ship as plugins through the local marketplace in `.claude-plugin/marketplace.json`:

```
/plugin marketplace add ./
/plugin install claude-seo@local-skills
/plugin install claude-blog@local-skills
```

Note: claude-seo adds a PostToolUse hook that validates JSON-LD schema after Edit/Write.
Some scripts need Python packages from each plugin's `requirements.txt`.

## Free images (stock photos and AI generation)

| Skill | What it does | Keys needed | Source |
|---|---|---|---|
| fetch-media | Search and download from Wikimedia Commons, NASA, NIH BioArt, MedlinePlus, Unsplash, Pixabay, Pexels, with citations | None for Wikimedia, NASA, BioArt; free keys for Unsplash, Pixabay, Pexels | TriasJ/fetch-media |
| photo-forager | Stock photos that need no attribution (Wikimedia CC0, Rawpixel CC0, Pexels, Unsplash labelled); writes a credits file | None for Wikimedia and Rawpixel; free keys for Pexels, Unsplash | fiehrfly/photo-forager |
| stock-images | Search and download from Pexels, Unsplash, Pixabay | At least one free key (see its SETUP.md) | jeanpfs/stock-images |
| zimage | AI image generation with Z-Image-Turbo | Free ModelScope API key (`MODELSCOPE_API_KEY`) | FuturizeRush/zimage-skill |

Put API keys in each skill's `.env` (copy `.env.example`); `.env` files are gitignored. Never commit keys.
