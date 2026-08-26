# WitByte — File-Level Commentary and Annotations

> Every file in the repository, its purpose, dependencies, and role in the architecture.
> Last updated: 2026-08-26

---

## Repository Structure

```
witbyte/
├── platform.html              # Source file — ALL application code
├── deploy/
│   └── index.html             # Production build (wrapped platform.html)
├── docs/
│   ├── SESSION_CONTEXT.md     # Handoff context for new sessions
│   ├── FILE_COMMENTARY.md     # This file
│   ├── EXECUTION_FLOW.md      # Execution path documentation
│   ├── FEATURE_MAP.md         # Feature traceability map
│   ├── BUG_REGISTRY.md        # Bug registry and workaround log
│   └── ARCHITECTURE_DECISIONS.md  # Architectural decision record
├── README.md                  # Project README
├── WITBYTE-GAP-PLAN.md        # Original gap analysis (historical)
├── expand_bsp.py              # Content generation script (historical)
├── expand_cs.py               # Content generation script (historical)
├── expand_hw.py               # Content generation script (historical)
├── logo-exploration.html      # Logo design exploration (historical)
└── logo-octagon.html          # Final logo design exploration (historical)
```

---

## platform.html — The Core Application

**Purpose:** Self-contained single-page application serving the entire WitByte learning platform. Contains all CSS, HTML structure, JavaScript application logic, and curriculum content for 65 modules across 4 tracks.

**Why single file:** Enables zero-dependency deployment (drop one file anywhere), offline use, and eliminates build tooling complexity. The tradeoff is file size (~390KB) and the need for careful section management.

**Dependencies (external):**
- Google Fonts CDN — DM Sans (body) + JetBrains Mono (code)
- Mermaid.js v10 CDN — Diagram rendering engine

**Dependencies (internal):** None — this is the entire application.

**Who calls it:** Loaded directly by the browser. `deploy/index.html` wraps it in a proper HTML document for production deployment.

**Assumptions/Preconditions:**
- Browser supports ES6+ (template literals, async/await, arrow functions, `const`/`let`)
- Browser supports CSS Grid, Custom Properties, `clamp()`, `text-wrap: balance`
- Browser supports Clipboard API (with `execCommand` fallback for older browsers)
- CDN (jsdelivr.net, fonts.googleapis.com) is reachable
- localStorage is available for completion tracking (gracefully degrades if blocked)

**Environment variables:** None.

**Side effects:**
- Reads/writes `witbyte-completed` key in localStorage
- Modifies `document.documentElement` attributes (`data-theme`)
- Fetches external scripts (Mermaid.js) and stylesheets (Google Fonts)

**Failure modes:**
- If Mermaid CDN is unreachable: Stub object prevents errors, diagrams show as raw text
- If localStorage is blocked: Completion tracking silently fails, no crash
- If Google Fonts CDN is unreachable: Falls back to system-ui fonts
- If JS is disabled: Nothing renders (app is fully JS-driven)

### Internal Sections (as pseudo-modules)

#### 1. Theme Bootstrap (Line 2)
```html
<script>document.documentElement.setAttribute('data-theme','dark')</script>
```
**Purpose:** Set dark mode before CSS loads to prevent flash of light theme.
**Called by:** Browser, before any other script or stylesheet evaluation.
**Depends on:** CSS token system in the `<style>` block.

#### 2. CSS Token System (Lines 4–111)
**Purpose:** Define all design tokens as CSS custom properties for both themes.
**Structure:** Three blocks handle three theme states:
- `:root` — light palette (base)
- `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` — dark OS preference
- `:root[data-theme="dark"]` — explicit dark toggle

**Called by:** Every CSS rule in the file via `var(--token)`.
**Depends on:** Theme bootstrap script (line 2) for initial state.

#### 3. Component Styles (Lines 113–389)
**Purpose:** All UI component styling — layout grid, topbar, sidebar, reader, cards, search, code blocks, Mermaid wrappers, modals, responsive breakpoints, animations.
**Called by:** HTML elements rendered by JavaScript functions.
**Depends on:** CSS tokens from section 2.

#### 4. App Shell HTML (Lines 396–406)
**Purpose:** The static DOM skeleton — topbar with logo/search/theme-toggle, sidebar nav, main content area, keyboard shortcut hint.
**Called by:** Browser renders on load; JavaScript populates dynamically.
**Depends on:** CSS from sections 2–3.

#### 5. Mermaid Initialization (Lines 407–426)
**Purpose:** Load Mermaid.js from CDN and configure it with dark theme, WitByte brand colors, and `startOnLoad: false` (diagrams rendered manually after module content loads).
**Called by:** Browser on script load.
**Depends on:** CDN availability; theme state from line 2.
**Failure mode:** Guard on line 411 creates a stub if CDN fails.

#### 6. Curriculum Data (Lines 428–6763)
**Purpose:** All course content — track definitions (`TRACKS`), cross-track connections (`CONNECTIONS`), and four module arrays (`CS_MODULES`, `HW_MODULES`, `BSP_MODULES`, `AI_MODULES`) consolidated into `ALL_MODULES`.
**Called by:** Every render function, search, navigation, progress tracking.
**Depends on:** Nothing — pure data declarations.
**Note:** Two content formats coexist (see SESSION_CONTEXT.md). Module content strings contain markdown parsed by `parseMarkdown()`.

#### 7. Application State (Lines 6764–6769)
**Purpose:** Three mutable state variables controlling the current view:
- `currentView` — 'home' | 'track' | 'module'
- `currentTrack` — null | track key string
- `currentModule` — null | module id string

**Called by:** All navigation functions read/write these.
**Side effects:** Drive what renderSidebar() and the main content area display.

#### 8. Completion Persistence (Lines 6770–6794)
**Purpose:** Read/write module completion timestamps to localStorage under the key `witbyte-completed`. Provides `getCompleted()`, `setCompleted()`, `isCompleted()`, `getTrackProgress()`, `getOverallProgress()`.
**Called by:** renderSidebar (progress bars), renderHome (stats), renderTrackOverview (checkmarks), toggleComplete.
**Depends on:** localStorage availability.
**Side effects:** localStorage reads and writes.
**Failure mode:** try/catch around all localStorage access; returns empty object on failure.

#### 9. Navigation Functions (Lines 6797–6910)
**Purpose:** `showHome()`, `showTrack()`, `showModule()` manage state transitions, trigger renders, scroll to top, and close mobile sidebar.
**Called by:** Sidebar onclick handlers, track card clicks, module item clicks, keyboard shortcuts, search result clicks.
**Depends on:** State variables (section 7), render functions (sections 11–13), scrollMainTop.

#### 10. Stack Visualization (Lines 6912–6949)
**Purpose:** Interactive 7-layer technology stack diagram on the home page. `STACK_LAYERS` defines each layer with track associations; `renderStackDetail()` renders the detail panel; `selectStackLayer()` handles clicks.
**Called by:** renderHome() generates the stack HTML; onclick handlers call selectStackLayer.
**Depends on:** TRACKS data, showTrack() for "Open first lesson" button.

#### 11. Home Page Renderer (Lines 6951–7075)
**Purpose:** `renderHome()` builds the complete home page — hero section, stats row, track cards, stack visualization, and cross-track connections grid.
**Called by:** showHome(), init.
**Depends on:** TRACKS, ALL_MODULES, CONNECTIONS, STACK_LAYERS, getOverallProgress(), getTrackProgress().

#### 12. Track Overview Renderer (Lines 7076–7111)
**Purpose:** `renderTrackOverview()` renders a track's module list with phase grouping, completion checkmarks, topic tags, and hour estimates.
**Called by:** showTrack().
**Depends on:** TRACKS, ALL_MODULES, isCompleted().

#### 13. Module Renderer (Lines 7113–7219)
**Purpose:** `renderModule()` renders a single module in the reader view — breadcrumb, eyebrow, title, metadata, parsed content, completion toggle, prev/next navigation. Post-render: wraps code blocks with copy buttons (60ms timeout), renders Mermaid diagrams (50ms timeout).
**Called by:** showModule().
**Depends on:** parseMarkdown(), copyCode(), toggleComplete(), mermaid.run(), getAdjacentModules().
**Side effects:** DOM manipulation via setTimeout for code wraps and Mermaid rendering.

#### 14. Markdown Parser (Lines 7222–7368)
**Purpose:** `parseMarkdown()` converts module content strings into HTML. Handles: code fences (with language detection), Mermaid blocks (output as hidden `.mermaid-source`), tables, ordered/unordered lists, headers (h1–h3), blockquotes, gotcha callouts, inline formatting (code, bold, italic, escaped backticks).
**Called by:** renderModule().
**Depends on:** inlineFormat(), escapeHtml(), flushTable(), flushList().
**Known limitations:** Wraps raw HTML in `<p>` tags; consecutive blockquotes aren't grouped; no nested lists.

#### 15. Search Engine (Lines 7375–7423)
**Purpose:** Full-text search across all module titles, topics, and content. 150ms debounce, max 8 results, with snippet extraction.
**Called by:** searchInput 'input' event listener.
**Depends on:** ALL_MODULES, TRACKS, showModule(), escapeHtml().
**Side effects:** Manipulates searchResults DOM.

#### 16. Theme Toggle (Lines 7427–7467)
**Purpose:** `toggleTheme()` switches between dark and light mode — updates `data-theme` attribute, swaps sun/moon icon, re-initializes Mermaid with appropriate theme, re-renders visible diagrams.
**Called by:** Theme button onclick.
**Depends on:** Mermaid.js, DOM state.
**Side effects:** Modifies `document.documentElement`, re-renders all Mermaid diagrams on page.

#### 17. Keyboard Shortcuts (Lines 7469–7515)
**Purpose:** Global keyboard handler — Left/Right arrows (prev/next module), Escape (navigate up), Cmd/Ctrl+K or `/` (focus search).
**Called by:** document 'keydown' event listener.
**Depends on:** currentView, currentTrack, currentModule, navigation functions.
**Note:** Functions are monkey-patched at lines 7512–7515 to also call `updateKbdHint()`.

#### 18. Initialization (Lines 7517–7520)
**Purpose:** Bootstrap the application — render sidebar and home page.
**Called by:** Script execution on page load.
**Depends on:** renderSidebar(), renderHome().

---

## deploy/index.html — Production Build

**Purpose:** Full HTML document wrapping `platform.html` content. Adds DOCTYPE, `<html lang="en">`, `<head>` with charset/viewport meta, favicon (brain emoji SVG), `<body>`.

**Why separate:** `platform.html` is an HTML fragment (no DOCTYPE/html/body) designed for direct embedding and for the Artifact tool which adds its own skeleton. Production deployment needs a proper document.

**Generated by:** Python script (see deployment workflow in SESSION_CONTEXT.md).

**Called by:** Vercel serves this as the site root.

**Depends on:** `platform.html` content.

**Must be regenerated** after every edit to `platform.html`.

---

## WITBYTE-GAP-PLAN.md — Historical Planning Document

**Purpose:** Original gap analysis identifying what needed to be built to complete the platform. Historical reference — all identified gaps have been addressed.

**Called by:** Nothing — reference only.

---

## expand_bsp.py, expand_cs.py, expand_hw.py — Content Generation Scripts

**Purpose:** Python scripts used during development to generate and expand module content for BSP, CS, and HW tracks. They produce the content strings that were then integrated into `platform.html`.

**Called by:** Run manually during content authoring (historical).

**Depends on:** Nothing runtime; they output strings to be copy-pasted into platform.html.

**Note:** These are build-time tools, not runtime dependencies. AI track content was authored directly.

---

## logo-exploration.html, logo-octagon.html — Logo Design Explorations

**Purpose:** Standalone HTML files used to explore and finalize the WitByte constellation logo design. `logo-octagon.html` contains the final octagon mark with 8 track-colored nodes + rose center.

**Called by:** Nothing — design reference only. The final logo SVG is inlined in `platform.html` within the topbar.

---

## docs/ — Documentation Suite

**Purpose:** Living documentation that must be kept in sync with every code change.

**Files:** SESSION_CONTEXT.md, FILE_COMMENTARY.md (this file), EXECUTION_FLOW.md, FEATURE_MAP.md, BUG_REGISTRY.md, ARCHITECTURE_DECISIONS.md.

**Called by:** New development sessions reference these for context.

**Update rule:** Any code modification to `platform.html` must trigger corresponding updates to all relevant documentation files.
