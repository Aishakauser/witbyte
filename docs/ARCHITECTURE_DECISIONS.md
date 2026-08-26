# WitByte — Architectural Decision Record

> Every significant technical, architectural, and design decision.
> Decisions are numbered, dated, and never deleted — only superseded.
> Last updated: 2026-08-26

---

## ADR-001: Single-File Architecture
- **Date:** 2026-08-23
- **Status:** Active
- **Context:** WitByte is an educational platform with 65 modules of curriculum content, interactive features, and a complete UI. The deployment target is Vercel (static hosting). The development workflow involves a single author (Ayesha) using Claude as the build tool.
- **Options considered:**
  1. **Multi-file SPA** with bundler (Vite/Webpack): Separate files for CSS, JS, data, components. Standard modern web practice.
  2. **Static site generator** (Astro, 11ty): Markdown files per module, templated pages, build step.
  3. **Single self-contained HTML file**: Everything in one file — styles, markup, scripts, data.
- **Decision:** Option 3 — single HTML file.
- **Reasoning:**
  - Zero build tooling: no npm, no bundler, no CI/CD pipeline. Drop the file anywhere and it works.
  - Offline capability: save the file locally and the entire platform works without internet (minus Mermaid CDN and fonts, which degrade gracefully).
  - Simplicity of deployment: one file to push, one file to host.
  - Single-author workflow: with Claude as the editor, having everything in one file means full context is always available.
  - Educational project: the audience learns from reading the source; a single file is more inspectable than a build artifact.
- **Tradeoffs:**
  - File size (~390KB) is large for a single file but well within browser limits.
  - No code splitting or lazy loading — full payload on first load.
  - IDE/editor performance can slow on a 7500+ line file.
  - No hot module replacement during development.
  - No TypeScript, no linting, no testing framework.
- **Revisit when:** The platform grows beyond ~1MB, multiple contributors need to work simultaneously, or a build pipeline is already in place for other reasons.

---

## ADR-002: CSS Custom Properties for Theming
- **Date:** 2026-08-23
- **Status:** Active
- **Context:** The platform needs dark and light modes. CSS must handle three states: explicit dark, explicit light, and system-preference-following (no stamp).
- **Options considered:**
  1. **CSS-in-JS**: Dynamic styles via JavaScript (incompatible with single-file no-build approach).
  2. **CSS classes on body**: `.theme-dark .component { ... }` — duplicates every color rule.
  3. **CSS Custom Properties (tokens)**: Define colors as `--token` variables, redefine them per theme.
- **Decision:** Option 3 — CSS custom properties with a three-block token architecture.
- **Reasoning:**
  - Token redefinition keeps component CSS theme-agnostic — each rule uses `var(--token)` once.
  - Three-block structure handles all three states correctly:
    - Bare `:root` for light (base)
    - `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])` for OS dark preference
    - `:root[data-theme="dark"]` for explicit toggle
  - No JavaScript needed for color switching — the `data-theme` attribute change cascades automatically.
  - Tokens are inspectable in DevTools.
- **Tradeoffs:**
  - Three blocks of token definitions (light, dark-media, dark-explicit) have some duplication.
  - No IE11 support (acceptable — the platform uses ES6+ anyway).
- **Revisit when:** Never — this is the correct approach for CSS theming.

---

## ADR-003: Dark Mode as Default
- **Date:** 2026-08-25
- **Status:** Active
- **Context:** The user explicitly requested dark mode as the default. Most developer/learning platforms use dark mode. Theme preference is not persisted across reloads.
- **Options considered:**
  1. **System preference only**: No default, follow `prefers-color-scheme`.
  2. **Dark default with localStorage persistence**: Default dark, save choice.
  3. **Dark default without persistence**: Always dark on load, toggle in session only.
- **Decision:** Option 3 — dark default, no persistence.
- **Reasoning:**
  - An inline `<script>` on line 2 sets `data-theme="dark"` synchronously before CSS loads, preventing any flash of light content.
  - Adding localStorage reading to the inline script adds complexity and a potential failure point.
  - Dark mode is the intended aesthetic — users who prefer light can toggle, and most sessions are single-use learning sessions.
- **Tradeoffs:**
  - Users who prefer light mode must toggle every visit.
  - The theme toggle is session-only — reloading resets to dark.
- **Revisit when:** User feedback indicates theme persistence is important. See OPEN-010 in BUG_REGISTRY.md for the minimal fix.

---

## ADR-004: Custom Markdown Parser Instead of Library
- **Date:** 2026-08-23
- **Status:** Active
- **Context:** Module content is stored as markdown strings and needs to be rendered to HTML. A markdown parsing library (marked, markdown-it) could be loaded from CDN.
- **Options considered:**
  1. **External library** (marked.js, ~28KB gzipped): Full CommonMark support, battle-tested.
  2. **Custom minimal parser**: Handle only the markdown features actually used in the curriculum.
- **Decision:** Option 2 — custom `parseMarkdown()` function.
- **Reasoning:**
  - The curriculum uses a limited subset of markdown: headers, code blocks, tables, lists, bold, italic, inline code, blockquotes, and a custom "Gotcha" callout. No images, links, nested lists, footnotes, or other advanced features.
  - Custom parser adds zero bytes of external dependency.
  - Special handling for Mermaid blocks (output as `.mermaid-source` instead of `<pre><code>`) would require hooks into any library anyway.
  - Custom gotcha callout (`⚠️ **Gotcha`) is non-standard markdown.
  - The parser is ~150 lines — small enough to reason about and modify.
- **Tradeoffs:**
  - No CommonMark compliance — edge cases may render differently.
  - Raw HTML blocks in content get wrapped in `<p>` tags (see OPEN-003).
  - Consecutive blockquotes aren't grouped (see OPEN-004).
  - No nested list support.
  - Maintenance burden if more markdown features are needed.
- **Revisit when:** Content requires features the custom parser can't handle (images, links, nested structures), or parser bugs become frequent.

---

## ADR-005: Mermaid.js via CDN with Manual Rendering
- **Date:** 2026-08-25
- **Status:** Active
- **Context:** 95+ diagrams across the curriculum use Mermaid syntax. These need to render as interactive SVGs.
- **Options considered:**
  1. **Pre-render to SVG at build time**: Generate SVGs offline, embed as static images.
  2. **CDN load with startOnLoad: true**: Let Mermaid find and render all elements on page load.
  3. **CDN load with startOnLoad: false, manual mermaid.run()**: Load library, render diagrams after content is injected.
- **Decision:** Option 3 — CDN load with manual rendering.
- **Reasoning:**
  - Content is injected dynamically (SPA pattern) — `startOnLoad: true` only runs on initial page load, not after navigation.
  - Manual `mermaid.run()` lets us target exactly the elements just rendered, avoiding re-processing.
  - CDN load keeps the library out of the source file (~1.5MB unminified).
  - A stub guard (`if (typeof mermaid === 'undefined')`) ensures the app works even if CDN is unreachable — diagrams degrade to raw text.
  - `data-source` attribute preserves original source for theme-switch re-rendering.
- **Tradeoffs:**
  - External CDN dependency — offline use shows raw diagram source.
  - 50ms setTimeout before rendering is a heuristic — may need adjustment.
  - Mermaid v10 is strict about syntax (see BUG-005).
- **Revisit when:** Mermaid v11+ changes the API, or offline support becomes critical (would require inlining or pre-rendering).

---

## ADR-006: localStorage for Completion Tracking
- **Date:** 2026-08-23
- **Status:** Active
- **Context:** Users need to track which modules they've completed. No backend server exists.
- **Options considered:**
  1. **Backend database**: Requires server, authentication, hosting costs.
  2. **localStorage**: Browser-local, zero infrastructure, works offline.
  3. **URL hash state**: Encode completion state in the URL. Shareable but ugly.
- **Decision:** Option 2 — localStorage.
- **Reasoning:**
  - Zero infrastructure: no server, no database, no authentication.
  - Instant read/write: no network latency.
  - Works offline.
  - Good enough for single-user learning tracking.
  - Data stored under key `witbyte-completed` as JSON object mapping module IDs to timestamps.
- **Tradeoffs:**
  - Data is per-browser, per-device — doesn't sync across devices.
  - Clearing browser data erases progress.
  - ~5MB localStorage limit is more than enough (~2KB for 65 modules).
  - No backup or export mechanism.
  - Quota errors are currently silently swallowed (see OPEN-006).
- **Revisit when:** Multi-device sync is needed, or a backend is added for other reasons.

---

## ADR-007: Content Storage Format — Template Literals vs Escaped Strings
- **Date:** 2026-08-24
- **Status:** Active (legacy coexistence)
- **Context:** Module content is markdown stored as JavaScript strings. During development, two formats emerged depending on which generation scripts were used.
- **Formats:**
  1. **Template literals** (CS, HW hw-01–hw-04, AI): Content uses backtick strings with real newlines. Requires escaping any backticks in the content itself (e.g., `` \`code\` ``).
  2. **Single-line escaped strings** (BSP, HW hw-05–hw-14): Content uses regular quote strings with `\n` for newlines. Generated by `expand_bsp.py` and `expand_hw.py`.
- **Decision:** Both formats coexist. No migration planned.
- **Reasoning:**
  - `parseMarkdown()` handles both transparently — `split('\n')` works on real newlines and `\n` escape sequences alike.
  - Migrating 30 modules from one format to another risks introducing bugs with no functional benefit.
  - The format difference is invisible to users and to the parser.
- **Tradeoffs:**
  - Editing backtick-format modules requires care with backtick escaping (source of BUG-001).
  - Two conventions in one file is mildly confusing for maintainers.
- **Revisit when:** A major content rewrite or automated formatting pass happens anyway.

---

## ADR-008: Deployment via GitHub + Vercel Auto-Deploy
- **Date:** 2026-08-25
- **Status:** Active
- **Context:** The platform needs to be publicly accessible. The user has a Vercel account and a GitHub account.
- **Options considered:**
  1. **Manual upload**: Upload `deploy/index.html` directly to Vercel or another host.
  2. **GitHub Pages**: Host from the repo directly.
  3. **GitHub + Vercel auto-deploy**: Push to GitHub, Vercel detects and deploys.
- **Decision:** Option 3 — GitHub + Vercel.
- **Reasoning:**
  - Vercel auto-deploys on push to `main` — no manual steps after git push.
  - Free hobby tier is sufficient.
  - GitHub provides version history and collaboration support.
  - Deploy previews available for branches (not currently used but available).
- **Tradeoffs:**
  - Two-step deployment: must regenerate `deploy/index.html` from `platform.html` before pushing.
  - git push from programmatic environments (like device_bash) doesn't have GitHub credentials — requires osascript workaround on Mac.
- **Revisit when:** Custom domain is added (witbyte.dev), or CI/CD pipeline is needed for testing.

---

## ADR-009: No Build Step or Framework
- **Date:** 2026-08-23
- **Status:** Active
- **Context:** Modern web development typically uses frameworks (React, Vue, Svelte) with build tooling (Vite, Webpack). WitByte is a content-heavy platform with minimal interactivity.
- **Options considered:**
  1. **React/Next.js**: Component-based, great ecosystem, SSR possible.
  2. **Svelte/SvelteKit**: Compiled, small runtime, good DX.
  3. **Vanilla HTML/CSS/JS**: No framework, no build step.
- **Decision:** Option 3 — vanilla.
- **Reasoning:**
  - The application state is trivial (3 variables: view, track, module).
  - Interactivity is limited to navigation, search, and toggles — no complex state management.
  - Content is static data, not user-generated — no need for reactivity.
  - innerHTML is acceptable because all data is author-controlled (with escapeHtml on search).
  - Zero dependency surface = zero CVE exposure from framework dependencies.
  - Single-file architecture (ADR-001) is incompatible with frameworks requiring build steps.
- **Tradeoffs:**
  - No virtual DOM — full innerHTML replacement on navigation (acceptable for this scale).
  - No component encapsulation — all styles are global.
  - No TypeScript — runtime errors only caught by testing.
  - Manual DOM manipulation is more error-prone than declarative frameworks.
- **Revisit when:** The platform adds user-generated content, real-time features, or complex state.

---

## ADR-010: Semantic HTML Migration (Partial)
- **Date:** 2026-08-25
- **Status:** Active (in progress)
- **Context:** Initial implementation used generic `<div>` elements for the sidebar and interactive elements. An accessibility audit identified improvements.
- **Decision:** Migrate to semantic HTML incrementally:
  - Sidebar: `<div class="sidebar">` → `<nav class="sidebar" aria-label="Course navigation">`
  - Search input: added `aria-label="Search modules"`
  - Theme button: already a `<button>` with `aria-label`
- **Reasoning:** Semantic elements improve screen reader navigation and are zero-cost. Incremental migration avoids breaking changes.
- **Tradeoffs:** Partial — interactive divs with `onclick` still need `role`/`tabindex`/keyboard handlers (see OPEN-001).
- **Revisit when:** The remaining accessibility items (OPEN-001, OPEN-002) are implemented.
