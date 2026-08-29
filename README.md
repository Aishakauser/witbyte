# WitByte

**From bit to token** — an interactive learning platform covering the full silicon-to-AI stack.

🌐 **Live:** [witbyte.vercel.app](https://witbyte.vercel.app)

## What is this?

WitByte is a self-contained learning platform with 65 fully written modules across 4 tracks, totaling ~724 focused hours of curriculum. It covers everything from digital logic and SoC architecture through kernel drivers and BSP bring-up to AI agents and model fine-tuning.

### Tracks

| Track | Modules | Hours | Target role | Scope |
|-------|---------|-------|-------------|-------|
| **Computer Science** | 15 | ~180 | Software Engineer | SDLC, architecture, databases, APIs, security, DevOps, cloud |
| **Hardware** | 14 | ~142 | Hardware / Embedded Engineer | Digital logic, processors, memory, buses, SoC, firmware |
| **BSP** | 15 | ~156 | BSP / Systems Software Engineer | Boot sequences, kernel drivers, device trees, subsystem deep dives |
| **AI & ML** | 21 | ~246 | AI Engineer | Agents, RAG, tool use, fine-tuning, deployment, ML fundamentals |

Every module follows a consistent structure: Goal → Concept (with Mermaid diagrams) → Hands-on exercises → Gotchas → Mini-project → Mastery checklist.

## Architecture

Native ES modules, no build step, no framework, no bundler. `index.html` is a 68-line shell; everything else loads as a module.

```
index.html              # HTML shell — meta, fonts, app skeleton
styles.css              # All styles, CSS custom properties, light/dark themes
js/
  app.js                # Rendering, routing, search, markdown parser, navigation
  data.js               # Track metadata (TRACKS, CONNECTIONS)
  visuals.js            # Interactive-visual registry
  tracks/
    cs.js               # 15 Computer Science modules
    hw.js               # 14 Hardware modules
    bsp.js              # 15 BSP modules
    ai.js               # 21 AI & ML modules
visuals/                # Self-registering interactive visuals, one file each
  cs/  hw/  bsp/  ai/
```

Only two external dependencies: Google Fonts (DM Sans + JetBrains Mono) and Mermaid.js v10 from a CDN.

Key features: dark/light theme toggle, full-text search with debounce, module completion tracking (localStorage), 95+ Mermaid diagrams, 11 interactive visuals, keyboard navigation, responsive mobile layout, code block copy-to-clipboard.

See `docs/` for comprehensive documentation: file commentary, execution flows, feature maps, bug registry, and architecture decisions.

### Interactive visuals

Eleven hands-on visualizations built with plain CSS, Canvas, and SVG — no visualization library.

| Track | Module | Visual |
|-------|--------|--------|
| HW | hw-01 | Logic gate simulator — toggle inputs, switch gates, live truth table |
| HW | hw-02 | 5-stage CPU pipeline — step/run with data-hazard stalls |
| HW | hw-05 | Memory hierarchy — clickable pyramid with size/latency/cost |
| CS | cs-04 | REST request/response flow with animated arrows |
| CS | cs-06 | OAuth 2.0 authorization code flow, step by step |
| CS | cs-09 | CI/CD pipeline simulator with togglable failures |
| BSP | bsp-02 | Boot sequence — ROM to userspace with kernel logs |
| BSP | bsp-04 | Device tree explorer — clickable nodes with DTS source |
| AI | ai-15 | Gradient descent with adjustable learning rate |
| AI | ai-16 | Neural network forward pass, canvas-rendered |
| AI | ai-17 | Tokenization explorer with token IDs |

Visuals self-register against a module ID:

```javascript
import { registerVisual } from '../../js/visuals.js';

registerVisual('hw-01', function (container) {
  container.innerHTML = `...`;
});
```

Add the file, import it in `js/app.js`, and it renders under an "Interactive Exploration" heading at the bottom of that module.

## Setup

No build step. Serve the directory over HTTP — ES modules do not load from `file://`:

```bash
git clone https://github.com/Aishakauser/witbyte.git
cd witbyte

npx http-server -p 8080 -c-1
# open http://localhost:8080
```

Edit files directly, then commit and push — Vercel auto-deploys from `main`.

> **⚠️ Escape backticks in curriculum content.** Module content lives inside JavaScript template literals in `js/tracks/*.js`. An unescaped backtick terminates the string and breaks the entire app. Always write `` \` `` inside content strings. This has taken the site down before — see BUG-001 in `docs/BUG_REGISTRY.md`.

## Tech Stack

- **Language:** Vanilla HTML, CSS, JavaScript (ES modules)
- **Fonts:** DM Sans + JetBrains Mono (Google Fonts CDN)
- **Diagrams:** Mermaid.js v10 (jsdelivr CDN)
- **Interactive visuals:** Canvas 2D, inline SVG, CSS animation — no library
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

- Completion data is per-browser (localStorage) — no cross-device sync
- No backend — all content is static, no user accounts
- Custom markdown parser handles a limited subset (no images, links, nested lists)
- Mermaid diagrams depend on CDN availability
- Track content files are large (`ai.js` is ~4,500 lines); modules are not lazy-loaded

## License

All rights reserved. © 2026 Ayesha Kauser.
