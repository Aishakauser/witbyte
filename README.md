# WitByte

**From bit to token** — an interactive learning platform covering the full silicon-to-AI stack.

🌐 **Live:** [witbyte.vercel.app](https://witbyte.vercel.app)

## What is this?

WitByte is a self-contained, single-file learning platform with 65 fully written modules across 4 tracks, totaling ~724 focused hours of curriculum. It covers everything from digital logic and SoC architecture through kernel drivers and BSP bring-up to AI agents and model fine-tuning.

### Tracks

| Track | Modules | Hours | Scope |
|-------|---------|-------|-------|
| **Computer Science** | 15 | ~180 | SDLC, architecture, databases, APIs, security, DevOps, cloud |
| **Hardware** | 14 | ~142 | Digital logic, processors, memory, buses, SoC, firmware |
| **BSP** | 15 | ~156 | Boot sequences, kernel drivers, device trees, subsystem deep dives |
| **AI & ML** | 21 | ~246 | Agents, RAG, tool use, fine-tuning, deployment, ML fundamentals |

Every module follows a consistent structure: Goal → Concept (with Mermaid diagrams) → Hands-on exercises → Gotchas → Mini-project → Mastery checklist.

## Architecture

The entire platform is a single HTML file (`platform.html`, ~390KB) containing all CSS, JavaScript, and curriculum content. No build step, no framework, no external dependencies beyond Google Fonts and Mermaid.js CDN.

Key features: dark/light theme toggle, full-text search with debounce, module completion tracking (localStorage), 95+ interactive Mermaid diagrams, keyboard navigation, responsive mobile layout, code block copy-to-clipboard.

See `docs/` for comprehensive documentation: file commentary, execution flows, feature maps, bug registry, and architecture decisions.

## Setup

No setup required. Open `deploy/index.html` in a browser, or visit the live site.

For development:

```bash
# Clone the repo
git clone https://github.com/Aishakauser/witbyte.git
cd witbyte

# Edit platform.html directly
# Then regenerate the deploy file:
python3 -c "
with open('platform.html') as f: content = f.read()
with open('deploy/index.html', 'w') as f:
    f.write('<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧠</text></svg>\">\n</head>\n<body>\n')
    f.write(content)
    f.write('\n</body>\n</html>')
"

# Commit and push — Vercel auto-deploys
git add index.html
git commit -m "Update platform"
git push origin main
```

## Tech Stack

- **Language:** Vanilla HTML, CSS, JavaScript (ES6+)
- **Fonts:** DM Sans + JetBrains Mono (Google Fonts CDN)
- **Diagrams:** Mermaid.js v10 (jsdelivr CDN)
- **Hosting:** Vercel (hobby plan, auto-deploy from GitHub)
- **Persistence:** localStorage for completion tracking
- **Theme system:** CSS custom properties with three-state dark/light support

## Documentation

Comprehensive documentation lives in `docs/`:

- `SESSION_CONTEXT.md` — Full context for continuing work in a new session
- `FILE_COMMENTARY.md` — Purpose and role of every file
- `EXECUTION_FLOW.md` — Every execution path traced step by step
- `FEATURE_MAP.md` — Feature traceability from entry point to output
- `BUG_REGISTRY.md` — Known bugs, fixes applied, open issues
- `ARCHITECTURE_DECISIONS.md` — All technical decisions with rationale

## Known Limitations

- Single-file architecture means no code splitting or lazy loading
- Completion data is per-browser (localStorage) — no cross-device sync
- No backend — all content is static, no user accounts
- Custom markdown parser handles a limited subset (no images, links, nested lists)
- 95+ Mermaid diagrams depend on CDN availability

## License

All rights reserved. © 2026 Ayesha Kauser.
