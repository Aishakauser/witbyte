# WitByte — Session Context for Claude Code Handoff

> Paste this into your Claude Code session to give it full project context.
> Last updated: 2026-08-26

---

## What is WitByte?

WitByte ("from bit to token") is a self-contained, single-file interactive learning platform covering the full silicon-to-AI stack. It's a ~390KB HTML file (`platform.html`) containing 4 learning tracks, 65 fully written modules, and ~724 hours of curriculum. All content, styles, and application logic live in one file.

## Repository & Deployment

- **Live site:** https://witbyte.vercel.app
- **GitHub:** https://github.com/Aishakauser/witbyte (branch: `main`)
- **Local repo on Mac:** `/Users/ayeshakauser/Documents/Claude/Projects/Learning about AI, AI agents/witbyte/`
- **Source file:** `platform.html` (the content — no DOCTYPE/html/body wrapper)
- **Deploy file:** `deploy/index.html` (wrapped with DOCTYPE/head/body + favicon for production)
- **Vercel:** Auto-deploys on push to `main`. Team: WitByte / slug "wit-byte". Account: aimahscorporation@gmail.com
- **GitHub account:** Aishakauser
- **Artifact:** https://claude.ai/code/artifact/3de60992-8b5b-4492-ae52-c39fbd09b1f3

## Deployment Workflow

1. Edit `platform.html` (the source)
2. Regenerate `deploy/index.html` by wrapping platform.html in a full HTML document:
   ```python
   with open('platform.html') as f: content = f.read()
   with open('deploy/index.html', 'w') as f:
       f.write('<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧠</text></svg>">\n</head>\n<body>\n')
       f.write(content)
       f.write('\n</body>\n</html>')
   ```
3. Copy `deploy/index.html` to the local witbyte git repo
4. `git add index.html && git commit -m "..." && git push origin main`
5. Vercel auto-deploys

**Important:** `git push` from device_bash doesn't work (no GitHub credentials). Use `osascript` to run the push through the Mac's authenticated shell:
```
osascript -e 'do shell script "cd /Users/ayeshakauser/Documents/Claude/Projects/Learning\\ about\\ AI,\\ AI\\ agents/witbyte && git push origin main 2>&1"'
```

## Architecture (Single File)

`platform.html` is structured as sequential blocks:

| Lines | Section | Purpose |
|-------|---------|---------|
| 1 | `<title>` | Page title |
| 2 | `<script>` | Dark mode default (sets `data-theme="dark"` before CSS) |
| 3 | `<link>` | Google Fonts (DM Sans + JetBrains Mono) |
| 4–395 | `<style>` | All CSS — tokens, layout, components, responsive, animations |
| 396–406 | HTML | App shell: topbar, sidebar (`<nav>`), main content div, kbd hint |
| 407–408 | `<script>` | Mermaid.js CDN load + initialization |
| 409–427 | JS | Mermaid config with dark theme variables |
| 428–466 | JS | `TRACKS` object — 4 track definitions with metadata |
| 468–480 | JS | `CONNECTIONS` array — cross-track concept links |
| 481–2191 | JS | `CS_MODULES` — 15 Computer Science modules (full content) |
| 2192–2545 | JS | `HW_MODULES` — 14 Hardware modules (full content) |
| 2546–2578 | JS | `BSP_MODULES` — 15 BSP modules (full content) |
| 2579–6762 | JS | `AI_MODULES` — 21 AI modules (full content) |
| 6763 | JS | `ALL_MODULES` consolidation object |
| 6764–6769 | JS | State variables (`currentView`, `currentTrack`, `currentModule`) |
| 6770–6828 | JS | Completion persistence (localStorage) |
| 6831–6910 | JS | Navigation functions (showHome, showTrack, showModule, renderSidebar) |
| 6912–6949 | JS | Stack visualization (interactive layer diagram on home page) |
| 6951–7111 | JS | Render functions (renderHome, renderTrackOverview) |
| 7113–7219 | JS | renderModule + Mermaid rendering + copy button injection |
| 7222–7368 | JS | parseMarkdown — custom markdown-to-HTML parser |
| 7371–7373 | JS | escapeHtml utility |
| 7375–7423 | JS | Search with 150ms debounce |
| 7427–7467 | JS | Theme toggle with Mermaid re-render |
| 7469–7515 | JS | Keyboard shortcuts (arrows, Escape, Cmd+K) |
| 7517–7520 | JS | Init — renderSidebar() + renderHome() |

## Design System

- **Typography:** DM Sans (body) + JetBrains Mono (code), Google Fonts
- **Track colors:** CS blue (#2563eb/#60a5fa), HW amber (#b45309/#fbbf24), BSP emerald (#047857/#34d399), AI purple (#7c3aed/#a78bfa)
- **Accent:** Rose (#e11d48/#fb7185)
- **CSS token system:** Three-state theme support:
  - Bare `:root` — light palette (default tokens)
  - `@media (prefers-color-scheme: dark)` guarded with `:root:not([data-theme="light"])` — dark OS override
  - `:root[data-theme="dark"]` — explicit dark toggle override
- **Dark mode default:** Inline `<script>` on line 2 sets `data-theme="dark"` before CSS loads
- **Layout:** CSS Grid (280px sidebar + 1fr main), 56px topbar

## Module Content Formats

Two storage formats coexist in the codebase:

1. **Multiline template literals** (CS, HW hw-01–hw-04, AI): Content stored as JS template literal strings with real newlines
2. **Single-line escaped** (BSP, HW hw-05–hw-14): Content stored as regular strings with literal `\n` characters

Both are parsed by the same `parseMarkdown()` function. Each module has: `{id, num, title, hours, phase, topics, content}`.

Every module follows the section pattern:
- 🎯 Goal
- 🧠 Concept (with Mermaid diagrams)
- ⌨️ Do This
- ⚠️ Gotcha
- 🛠️ Mini-project
- ✅ Mastery checklist

## Key Functions

| Function | Line | Purpose |
|----------|------|---------|
| `getCompleted()` | 6774 | Read completion state from localStorage |
| `setCompleted(modId, done)` | 6777 | Write completion state |
| `getTrackProgress(trackKey)` | 6783 | Calculate track completion % |
| `getOverallProgress()` | 6789 | Calculate total platform completion % |
| `copyCode(btn)` | 6804 | Copy code block to clipboard with fallback |
| `toggleComplete(modId)` | 6823 | Toggle module completion state |
| `renderSidebar()` | 6831 | Build sidebar HTML with tracks, modules, progress |
| `showHome()` | 6873 | Navigate to home view |
| `showTrack(key)` | 6882 | Navigate to track overview |
| `showModule(trackKey, modId)` | 6891 | Navigate to module reader |
| `scrollMainTop()` | 6902 | Scroll main panel to top + close mobile sidebar |
| `renderHome()` | 6951 | Render home page (hero, stats, track cards, stack viz, connections) |
| `renderTrackOverview(key)` | 7076 | Render track module list with completion states |
| `renderModule(trackKey, mod)` | 7113 | Render module reader with content, nav, completion |
| `parseMarkdown(md)` | 7222 | Parse markdown to HTML (code blocks, Mermaid, tables, lists) |
| `inlineFormat(text)` | 7263 | Parse inline markdown (code, bold, italic, escaped backticks) |
| `flushTable()` | 7247 | Emit accumulated table rows as HTML |
| `flushList()` | 7235 | Emit accumulated list items as HTML |
| `escapeHtml(s)` | 7371 | Escape HTML special characters |
| `_doSearch()` | 7384 | Search across all module content |
| `toggleTheme()` | 7427 | Switch dark/light, re-render Mermaid diagrams |

## Bugs Fixed (Complete List)

1. `Uncaught SyntaxError: Unexpected identifier 'resources'` — Unescaped backticks in template literals at lines ~1606 (cs-09) and ~1974 (cs-13)
2. Mermaid diagrams showing as raw text — Added CDN script, `mermaid.run()` in renderModule, dark theme config
3. Code block text invisible in light mode — Added `color:var(--ink)` to `.reader code`
4. Dark mode not default — Added inline script setting `data-theme="dark"` before CSS
5. CS-03 indexing Mermaid diagram syntax error — Single quotes in `[node text]` needed double-quote wrapping
6. Search XSS — Added `escapeHtml()` to search result rendering
7. Backtick processing order — Escaped backticks (`\``) now handled before inline code parsing
8. Unclosed code fences — Added fallback render after parseMarkdown's while loop
9. Table overflow — Tables wrapped in `<div style="overflow-x:auto">`
10. Copy button dark mode styling — Hardcoded consistent styling
11. Track hours inaccuracy — Corrected CS:180, HW:142, BSP:156, AI:246

## Known Remaining Issues

### Accessibility
- Interactive divs with `onclick` need `role="button"`, `tabindex="0"`, keyboard handlers
- Search results need ARIA listbox pattern with `aria-expanded`

### UX Polish
- Reader max-width (currently 780px) could reduce to ~680px for better line length
- Search input too narrow on mobile (140px)
- Could add ~900px breakpoint for tablet-like widths

### Parser Limitations
- ai-11 through ai-20 use raw HTML blocks; `parseMarkdown` wraps them in extra `<p>` tags
- Consecutive blockquote lines produce separate `<blockquote>` elements instead of one grouped block
- Search index is lowercased per keystroke instead of pre-built at load time

### Technical Debt
- localStorage quota errors silently swallowed (no user feedback)
- Duplicate Vercel project "witbyte-platform" exists (empty, can be deleted)

## Mermaid Diagrams

95+ Mermaid diagrams across all 65 modules. Loaded from CDN (`mermaid@10`), initialized with `startOnLoad: false`. Key behaviors:
- Diagrams stored as ` ```mermaid ` fenced code blocks in module content
- `parseMarkdown` outputs them as hidden `.mermaid-source` divs
- After `renderModule`, a `setTimeout(50ms)` replaces them with `.mermaid-wrap > pre.mermaid` elements and calls `mermaid.run()`
- Theme toggle re-initializes Mermaid with appropriate theme and re-renders all visible diagrams
- `data-source` attribute preserves original diagram source for re-rendering on theme change

## Mermaid Syntax Gotchas

Mermaid v10 is strict about special characters inside node text:
- Single quotes inside `[]` node labels break parsing → wrap in double quotes: `Q["text with 'quotes'"]`
- `<br/>` tags inside node text can cause issues → remove or use `<br>` in labels
- Always test diagrams after editing

## Other Files in Repo

- `deploy/index.html` — Production build (platform.html wrapped in full HTML document)
- `WITBYTE-GAP-PLAN.md` — Original gap analysis/planning document
- `expand_bsp.py`, `expand_cs.py`, `expand_hw.py` — Python scripts used to generate module content
- `logo-exploration.html`, `logo-octagon.html` — Logo design explorations (standalone HTML)
- `docs/` — Documentation suite (this file + others)

## Documentation Suite

All documentation files live in `docs/`:
- `SESSION_CONTEXT.md` — This file (handoff context)
- `FILE_COMMENTARY.md` — File-level annotations and architecture role
- `EXECUTION_FLOW.md` — All execution paths traced step by step
- `FEATURE_MAP.md` — Feature traceability map
- `BUG_REGISTRY.md` — Known bugs, fixes, workarounds
- `ARCHITECTURE_DECISIONS.md` — ADR (architectural decision record)
- `README.md` — At repo root

These are living documents — update them with every code change.
