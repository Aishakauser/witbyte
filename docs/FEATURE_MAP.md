# WitByte — Feature Traceability Map

> Maps every implemented feature to its complete code path.
> Last updated: 2026-08-26

---

## F01: Dark/Light Theme Toggle

**Entry point:** Theme button click → `toggleTheme()` (line 7427)
**Layers touched:** CSS tokens (lines 4–111), Mermaid config, DOM attribute

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Bootstrap | platform.html | 2 | Inline script sets `data-theme="dark"` before CSS |
| CSS tokens | platform.html | 4–111 | Three-block token system resolves colors per theme |
| Toggle click | platform.html | 7427–7467 | Reads current theme, flips attribute, swaps icon SVG |
| Mermaid re-init | platform.html | 7442–7456 | Re-initializes Mermaid with matching theme |
| Diagram re-render | platform.html | 7458–7466 | Clears and re-renders all visible Mermaid diagrams |

**Data model:** `data-theme` attribute on `document.documentElement` ("dark" or "light")
**Configuration:** None
**Permissions:** None
**Feature flags:** None
**Dependencies:** Mermaid.js for diagram re-rendering
**Blast radius:** Visual change to entire UI; Mermaid diagrams re-render

---

## F02: Module Completion Tracking

**Entry point:** "Mark as complete" button → `toggleComplete(modId)` (line 6823)
**Layers touched:** localStorage, sidebar progress bars, home page stats, module reader button

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Read state | platform.html | 6774–6776 | `getCompleted()` reads `witbyte-completed` from localStorage |
| Write state | platform.html | 6777–6781 | `setCompleted()` writes timestamp or deletes key |
| Check state | platform.html | 6782 | `isCompleted()` returns boolean |
| Track progress | platform.html | 6783–6788 | `getTrackProgress()` counts completed modules per track |
| Overall progress | platform.html | 6789–6794 | `getOverallProgress()` counts across all tracks |
| Toggle UI | platform.html | 6823–6829 | Updates button class and text, re-renders sidebar |
| Sidebar display | platform.html | 6831–6870 | Shows done/total count and progress bar per track |
| Home stats | platform.html | 6951+ | Shows overall completion percentage |
| Track overview | platform.html | 7076+ | Shows checkmark per completed module |
| Module reader | platform.html | 7140–7147 | Shows completion toggle button with current state |

**Data model:** `{ "module-id": timestamp, ... }` in localStorage key `witbyte-completed`
**Configuration:** None
**Permissions:** localStorage access
**Feature flags:** None
**Dependencies:** localStorage availability
**Known issue:** Quota errors silently swallowed (no user feedback)
**Blast radius:** Sidebar progress bars, home page stats, module reader button, track overview checkmarks

---

## F03: Full-Text Search

**Entry point:** Search input `input` event → debounce → `_doSearch()` (line 7384)
**Layers touched:** DOM (search results dropdown), all module data

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Input event | platform.html | 7380–7383 | Debounce with 150ms timer |
| Query prep | platform.html | 7385–7386 | Trim, lowercase, min 2 chars |
| Search loop | platform.html | 7388–7406 | Iterate ALL_MODULES, build haystack per module, substring match |
| Snippet extraction | platform.html | 7395–7401 | ±40/60 chars around first match in content |
| Result render | platform.html | 7408–7418 | Max 8 results, each with track/title/snippet (HTML-escaped) |
| Click handler | platform.html | 7412 | `showModule()` + close dropdown + clear input |
| Dismiss | platform.html | 7422–7424 | Click outside closes dropdown |

**Data model:** In-memory search over `ALL_MODULES` object
**Configuration:** Debounce: 150ms, max results: 8, min query: 2 chars
**Permissions:** None
**Feature flags:** None
**Dependencies:** ALL_MODULES data, escapeHtml()
**Known issue:** Search index rebuilt on every keystroke (lowercased per call); could pre-build at init
**Blast radius:** Search results dropdown only

---

## F04: Mermaid Diagram Rendering

**Entry point:** Module content containing ` ```mermaid ` code blocks
**Layers touched:** parseMarkdown, renderModule post-processing, Mermaid.js

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Parse | platform.html | 7276–7283 | parseMarkdown detects `mermaid` language, outputs hidden `.mermaid-source` div |
| Replace | platform.html | 7201–7214 | setTimeout(50ms) replaces `.mermaid-source` with `.mermaid-wrap > pre.mermaid` |
| Store source | platform.html | 7210 | `data-source` attribute preserves original for re-rendering |
| Render | platform.html | 7215–7217 | `mermaid.run({ nodes })` processes all `.mermaid` elements to SVG |
| Theme switch | platform.html | 7442–7466 | `toggleTheme()` re-initializes Mermaid and re-renders all diagrams |
| CSS styling | platform.html | ~210 | `.mermaid-wrap pre.mermaid` gets transparent bg, no border |
| SVG sizing | platform.html | ~211 | `.mermaid-wrap svg` gets `max-width:100%; height:auto` |

**Data model:** Diagram source as markdown string in module content
**Configuration:** Mermaid v10 config (startOnLoad: false, theme, themeVariables)
**Permissions:** CDN access (jsdelivr.net)
**Feature flags:** None
**Dependencies:** Mermaid.js CDN, parseMarkdown(), renderModule()
**Known issue:** Mermaid v10 strict about special chars in node text (single quotes, `<br/>`)
**Blast radius:** All 95+ diagrams across all modules

---

## F05: Markdown Content Rendering

**Entry point:** `renderModule()` calls `parseMarkdown(mod.content)` (line 7165)
**Layers touched:** parseMarkdown function, inlineFormat, escapeHtml

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Split | platform.html | 7224 | Split content string into lines |
| Code blocks | platform.html | 7276–7298 | Fenced code blocks → `<pre><code>` (or Mermaid) |
| Tables | platform.html | 7309–7318 | Pipe-delimited rows → `<table>` with overflow wrapper |
| Headers | platform.html | 7320–7328 | `# ## ###` → `<h1> <h2> <h3>` |
| Lists | platform.html | 7331–7342 | `- * 1.` → `<ul>/<ol>` with `<li>` |
| Blockquotes | platform.html | 7344–7348 | `> text` → `<blockquote>` |
| Gotcha callout | platform.html | 7351–7356 | `⚠️ **Gotcha` → styled callout box |
| Paragraphs | platform.html | 7359–7360 | Everything else → `<p>` |
| Inline | platform.html | 7263–7270 | Backticks, bold, italic, escaped backticks |
| Unclosed fence | platform.html | 7363–7364 | Safety net for unterminated code blocks |

**Data model:** Module content as markdown string
**Configuration:** None
**Permissions:** None
**Feature flags:** None
**Dependencies:** escapeHtml(), inlineFormat()
**Known issues:** Raw HTML gets wrapped in extra `<p>` tags; consecutive blockquotes aren't grouped; no nested list support
**Blast radius:** All 65 module content renderings

---

## F06: Code Block Copy

**Entry point:** Copy button click → `copyCode(btn)` (line 6804)
**Layers touched:** Clipboard API, DOM

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Button injection | platform.html | 7183–7198 | setTimeout(60ms) after renderModule wraps `<pre>` in `.code-wrap` |
| Copy attempt | platform.html | 6805–6809 | `navigator.clipboard.writeText()` |
| Success feedback | platform.html | 6808–6811 | Green checkmark + "Copied!" toast for 1500ms |
| Fallback | platform.html | 6812–6819 | Hidden textarea + `execCommand('copy')` for older browsers |

**Data model:** None
**Configuration:** Toast duration: 1500ms
**Permissions:** Clipboard API access
**Feature flags:** None
**Dependencies:** None
**Blast radius:** Individual code block

---

## F07: Keyboard Navigation

**Entry point:** Document `keydown` event listener (line 7470)
**Layers touched:** Navigation functions, search input, keyboard hint

| Shortcut | Context | Action |
|----------|---------|--------|
| ← Arrow | Module view | Navigate to previous module |
| → Arrow | Module view | Navigate to next module |
| Escape | Module view | Go to track overview |
| Escape | Track view | Go to home |
| / or Cmd+K | Any view | Focus search input (navigate to home if not there) |

**Data model:** currentView, currentTrack, currentModule state
**Configuration:** None
**Permissions:** None
**Feature flags:** None
**Dependencies:** getAdjacentModules(), navigation functions
**Blast radius:** Navigation state and rendered view

---

## F08: Sidebar Navigation

**Entry point:** Sidebar rendered by `renderSidebar()` (line 6831)
**Layers touched:** Sidebar DOM, state variables, progress tracking

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Home link | platform.html | 6835–6838 | Click → showHome() |
| Track entries | platform.html | 6843–6868 | Show track name, color pip, progress count |
| Progress bar | platform.html | 6852–6856 | Mini progress bar when track not expanded |
| Module list | platform.html | 6857–6866 | Expanded when track is active; shows completion checks |
| Module click | platform.html | 6861 | Click → showModule(trackKey, modId) |

**Data model:** currentTrack determines which track is expanded
**Configuration:** None
**Permissions:** None
**Feature flags:** None
**Dependencies:** TRACKS, ALL_MODULES, isCompleted(), getTrackProgress()
**Blast radius:** Sidebar DOM only; called by every navigation function

---

## F09: Responsive Mobile Layout

**Entry point:** CSS `@media` queries at ≤768px breakpoint
**Layers touched:** CSS layout, sidebar, topbar, reader

| Breakpoint | What changes |
|------------|-------------|
| ≤768px | Grid becomes single-column; sidebar becomes off-canvas drawer |
| ≤768px | Hamburger menu button appears in topbar |
| ≤768px | Sidebar overlay with backdrop |
| ≤768px | Reader padding reduces |
| ≤768px | Home hero and cards stack vertically |

**Data model:** None (CSS-only)
**Configuration:** Breakpoint: 768px
**Dependencies:** Sidebar toggle via classList, scrollMainTop() closes sidebar on navigation
**Blast radius:** Entire layout

---

## F10: Interactive Stack Visualization

**Entry point:** Home page, stack diagram section
**Layers touched:** renderHome (generates HTML), selectStackLayer (interaction)

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Data definition | platform.html | 6913–6921 | STACK_LAYERS: 7 layers with track mappings |
| Initial render | platform.html | 6951+ (renderHome) | Generates stack layers + detail panel |
| Default selection | platform.html | 6922 | activeStackLayer = 2 (Bootloader) |
| Layer click | platform.html | 6942–6949 | selectStackLayer toggles .active, updates detail |
| Detail render | platform.html | 6924–6939 | renderStackDetail shows badge, outcomes, action buttons |
| Action buttons | platform.html | 6937–6938 | "Open first lesson" / "Browse the track" → showTrack() |

**Data model:** STACK_LAYERS array, activeStackLayer index
**Configuration:** Default layer: index 2
**Dependencies:** TRACKS data, showTrack()
**Blast radius:** Stack section of home page only

---

## F11: Cross-Track Connections Display

**Entry point:** Home page, connections grid section
**Layers touched:** renderHome (generates HTML from CONNECTIONS data)

| Stage | File | Lines | What happens |
|-------|------|-------|-------------|
| Data definition | platform.html | 468–480 | CONNECTIONS array: cross-track concept links |
| Render | platform.html | 6951+ (renderHome) | Grid of connection cards showing from/to/what |

**Data model:** `{ name, from, to, what, c1, c2 }` objects
**Configuration:** None
**Dependencies:** CONNECTIONS data
**Blast radius:** Connections section of home page only

---

## Feature Interdependency Map

```
F01 (Theme) ──────── affects ──────── F04 (Mermaid) — re-renders on toggle
F02 (Completion) ─── reads by ──────── F08 (Sidebar) — progress bars
F02 (Completion) ─── reads by ──────── F10 (Stack Viz) — indirect via track stats
F03 (Search) ─────── navigates via ─── F07 (Keyboard) — Cmd+K focuses search
F04 (Mermaid) ────── depends on ────── F05 (Markdown) — parseMarkdown creates mermaid-source
F05 (Markdown) ───── used by ──────── F06 (Copy) — code blocks come from parser
F07 (Keyboard) ───── calls ──────────── F08 (Sidebar) — via navigation functions
F08 (Sidebar) ────── calls ──────────── all navigation features
F09 (Mobile) ─────── affects ──────── F08 (Sidebar) — off-canvas behavior
```
