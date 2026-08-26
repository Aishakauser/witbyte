# WitByte — Bug Registry and Workaround Log

> All known bugs, fixes applied, remaining issues, and workarounds.
> Last updated: 2026-08-26

---

## Fixed Bugs

### BUG-001: SyntaxError — Unexpected identifier 'resources'
- **Severity:** Critical (app crash)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Page loads
- **Environment:** All browsers
- **Root cause:** Unescaped backticks inside JavaScript template literal strings. In cs-09 (DevOps module, ~line 1606), the content string contained `` `resources.limits` `` which broke out of the template literal. Same issue in cs-13 (Cloud module, ~line 1974) with `` `*` permissions on `*` resources ``.
- **Fix:** Escaped the backticks with backslashes: `` \`resources.limits\` `` and `` \`*\` permissions on \`*\` resources ``
- **Files modified:** `platform.html` lines ~1606, ~1974
- **Workaround before fix:** None (app was broken)
- **Affects features:** All (app wouldn't load)
- **Verification:** Page loads without console errors

### BUG-002: Mermaid Diagrams Show as Raw Text
- **Severity:** High (95+ diagrams broken)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Opening any module with Mermaid diagrams
- **Environment:** All browsers
- **Root cause:** Three issues combined: (1) Mermaid.js CDN script was not loaded, (2) `parseMarkdown` did not handle ` ```mermaid ` code blocks differently from regular code, (3) No `mermaid.run()` call after content render.
- **Fix:** (1) Added CDN script tag on line 408, (2) Added mermaid stub guard on line 411, (3) Added Mermaid initialization with dark theme config lines 412–426, (4) Modified `parseMarkdown` to output `.mermaid-source` divs for mermaid blocks, (5) Added post-render mermaid.run() in renderModule with 50ms setTimeout.
- **Files modified:** `platform.html` lines 408–426, 7278–7279, 7201–7218
- **Workaround before fix:** None
- **Affects features:** F04 (Mermaid Rendering)
- **Verification:** Diagrams render as interactive SVGs in both dark and light modes

### BUG-003: Code Block Text Invisible in Light Mode
- **Severity:** High (content unreadable)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Switching to light mode, viewing inline code
- **Environment:** All browsers
- **Root cause:** `.reader code` CSS rule didn't specify `color`, inheriting from parent which was near-white in dark mode context but the background was also light in light mode. The inline code was white-on-white.
- **Fix:** Added `color:var(--ink)` to `.reader code` rule (line ~203).
- **Files modified:** `platform.html` line ~203
- **Workaround before fix:** None
- **Affects features:** F05 (Markdown Rendering)
- **Verification:** Inline code visible in both themes

### BUG-004: Light Mode Flash on Load
- **Severity:** Medium (visual glitch)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Page load in any browser
- **Environment:** All browsers
- **Root cause:** No theme was set before CSS loaded, so light mode (the CSS default) briefly flashed before JavaScript could set dark mode.
- **Fix:** Added inline `<script>` on line 2 that sets `data-theme="dark"` synchronously before the stylesheet is parsed: `<script>document.documentElement.setAttribute('data-theme','dark')</script>`
- **Files modified:** `platform.html` line 2
- **Workaround before fix:** None
- **Affects features:** F01 (Theme Toggle)
- **Verification:** Page loads directly into dark mode with no flash

### BUG-005: CS-03 Mermaid Diagram Syntax Error
- **Severity:** Medium (one diagram broken)
- **Date discovered:** 2026-08-26
- **Date fixed:** 2026-08-26
- **Manifests when:** Opening CS-03 "Indexing" module
- **Environment:** All browsers with Mermaid v10
- **Root cause:** Mermaid v10 is strict about special characters in flowchart node text within square brackets. The node `Q[SELECT * FROM users WHERE email = 'x']` contained unescaped single quotes, causing Mermaid to fail with a syntax error bomb icon. Also, `<br/>` tags in other node texts caused issues.
- **Fix:** Wrapped node text in double quotes: `Q["SELECT * FROM users WHERE email = 'x'"]`. Removed `<br/>` tags from other node texts: `FS["Full table scan O(n) — checks every row"]`.
- **Files modified:** `platform.html` line ~805
- **Workaround before fix:** None (diagram showed error icon)
- **Affects features:** F04 (Mermaid Rendering)
- **Verification:** CS-03 indexing diagram renders correctly in both themes

### BUG-006: Search XSS Vulnerability
- **Severity:** Medium (security)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Module content or titles containing HTML-like strings appear in search results
- **Environment:** All browsers
- **Root cause:** Search results rendered track names, module titles, and snippets directly into innerHTML without escaping, allowing potential injection.
- **Fix:** Added `escapeHtml()` calls around `r.track.name`, `r.mod.title`, and `r.snippet` in search result rendering (lines ~7413–7415).
- **Files modified:** `platform.html` lines ~7413–7415
- **Workaround before fix:** None
- **Affects features:** F03 (Search)
- **Verification:** HTML entities in search results are escaped

### BUG-007: Backtick Processing Order in inlineFormat
- **Severity:** Low (edge case)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Module content contains escaped backticks (`\``) — they would be consumed by the inline code regex before the escape could be processed.
- **Environment:** All browsers
- **Root cause:** `inlineFormat()` processed `` `code` `` before handling escaped backticks `\``.
- **Fix:** Reordered: (1) replace `\`` with sentinel `\x00BT\x00`, (2) process inline code, (3) restore sentinel to literal backtick.
- **Files modified:** `platform.html` lines 7264–7269
- **Workaround before fix:** None
- **Affects features:** F05 (Markdown Rendering)

### BUG-008: Unclosed Code Fence Crash
- **Severity:** Low (defensive fix)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Module content has an opening ` ``` ` without a closing one
- **Environment:** All browsers
- **Root cause:** `parseMarkdown` had no fallback for unterminated code fences, causing accumulated content to be lost.
- **Fix:** Added post-loop check: if `inCodeBlock` is still true, emit remaining `codeContent` as `<pre><code>` (lines 7363–7364).
- **Files modified:** `platform.html` lines 7363–7364
- **Workaround before fix:** None
- **Affects features:** F05 (Markdown Rendering)

### BUG-009: Table Overflow on Mobile
- **Severity:** Low (visual)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Viewing wide tables on narrow screens
- **Environment:** Mobile browsers
- **Root cause:** Tables weren't wrapped in an overflow container, causing horizontal page scroll.
- **Fix:** `flushTable()` now wraps output in `<div style="overflow-x:auto">` (line 7249).
- **Files modified:** `platform.html` line 7249
- **Workaround before fix:** None
- **Affects features:** F05 (Markdown Rendering), F09 (Mobile Layout)

### BUG-010: Copy Button Styling Inconsistent in Dark Mode
- **Severity:** Low (visual)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Hovering or using copy button on code blocks in dark mode
- **Environment:** All browsers
- **Root cause:** Copy button used theme-dependent colors that didn't look right in dark mode.
- **Fix:** Updated CSS to use consistent dark-on-dark styling with proper opacity transitions and hardcoded green (#34d399) for the copied state (lines ~331–338).
- **Files modified:** `platform.html` lines ~331–338
- **Affects features:** F06 (Code Block Copy)

### BUG-011: Track Hours Inaccuracy
- **Severity:** Low (data)
- **Date discovered:** 2026-08-25
- **Date fixed:** 2026-08-25
- **Manifests when:** Home page stats display
- **Root cause:** TRACKS metadata hours didn't match sum of individual module hours.
- **Fix:** Corrected to: CS: 180, HW: 142, BSP: 156, AI: 246 (total: 724).
- **Files modified:** `platform.html` lines 438, 443, 452, 462
- **Affects features:** F11 (Home page stats)

---

## Open Issues

### OPEN-001: Accessibility — Interactive Divs Missing Keyboard Support
- **Severity:** Medium (accessibility)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Manifests when:** Keyboard-only navigation; screen reader interaction
- **Description:** Multiple interactive elements use `<div onclick="...">` without `role="button"`, `tabindex="0"`, or keyboard event handlers (Enter/Space). Affects sidebar module items, track cards, back buttons, and search results.
- **Proposed fix:** Add `role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}"` to all interactive divs. Or refactor to use `<button>` elements.
- **Affected files:** `platform.html` — renderSidebar (~line 6847, 6861), renderHome (~line 6951+), renderTrackOverview (~line 7076+), renderModule (~line 7122, 7128)
- **Affects features:** F08 (Sidebar), F10 (Stack Viz), general navigation

### OPEN-002: Accessibility — Search Results Missing ARIA Pattern
- **Severity:** Medium (accessibility)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** Search results dropdown doesn't use ARIA listbox/combobox pattern. Missing `role="listbox"`, `aria-expanded`, `aria-activedescendant` on the search input, and `role="option"` on results.
- **Proposed fix:** Implement WAI-ARIA combobox pattern.
- **Affected files:** `platform.html` — search-related HTML/JS (~lines 7375–7423)
- **Affects features:** F03 (Search)

### OPEN-003: Parser — Raw HTML in AI Modules Wrapped in `<p>` Tags
- **Severity:** Low (visual)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Manifests when:** Viewing ai-11 through ai-20 modules
- **Description:** These modules use raw HTML blocks (e.g., `<pre><code>`) in their content strings. `parseMarkdown` treats unrecognized lines as paragraphs, wrapping them in `<p>` tags, which produces invalid HTML (`<p><pre>...`) and can cause visual issues.
- **Proposed fix:** Add HTML pass-through detection in parseMarkdown — skip `<p>` wrapping for lines that start with `<` and are valid HTML block elements.
- **Affected files:** `platform.html` — parseMarkdown (~line 7222), AI module content (~lines 2579–6762)
- **Affects features:** F05 (Markdown Rendering)

### OPEN-004: Parser — Blockquotes Not Grouped
- **Severity:** Low (visual)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** Consecutive `>` lines each produce a separate `<blockquote>` element instead of being grouped into one multi-line blockquote.
- **Proposed fix:** Accumulate consecutive blockquote lines and flush them as a single `<blockquote>` (similar to list flushing).
- **Affected files:** `platform.html` — parseMarkdown (~line 7344–7348)
- **Affects features:** F05 (Markdown Rendering)

### OPEN-005: Performance — Search Index Not Pre-Built
- **Severity:** Low (performance)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** `_doSearch()` lowercases the entire haystack (title + topics + content) for every module on every keystroke. With 65 modules and ~390KB of content, this is wasteful.
- **Proposed fix:** Pre-build a lowercased search index at init time: `const SEARCH_INDEX = Object.entries(ALL_MODULES).flatMap(...)`. Search against the pre-built index.
- **Affected files:** `platform.html` — _doSearch (~line 7384)
- **Affects features:** F03 (Search)

### OPEN-006: localStorage Quota Error Silent Failure
- **Severity:** Low (data integrity)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** `setCompleted()` catches localStorage quota errors silently — the user clicks "Mark as complete" and the button visually toggles, but the completion isn't actually persisted. On reload, the module appears uncompleted.
- **Proposed fix:** Show a transient toast notification on quota error: "Storage full — completion not saved."
- **Affected files:** `platform.html` — setCompleted (~line 6780)
- **Affects features:** F02 (Completion Tracking)

### OPEN-007: Reader Max-Width Too Wide
- **Severity:** Low (UX)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** `.reader` max-width is 780px. Optimal reading line length is 50–75 characters (~680px for 15px body text).
- **Proposed fix:** Change `.reader { max-width: 680px }` (line 190).
- **Affected files:** `platform.html` line 190
- **Affects features:** F05 (Markdown Rendering) visual layout

### OPEN-008: Search Input Too Narrow on Mobile
- **Severity:** Low (UX)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** Search input is 140px wide on mobile, making it hard to see the full query.
- **Proposed fix:** Increase to `width: 100%` or `min-width: 200px` in the mobile media query.
- **Affected files:** `platform.html` — CSS mobile breakpoint
- **Affects features:** F03 (Search)

### OPEN-009: Duplicate Vercel Project
- **Severity:** Trivial (cleanup)
- **Date discovered:** 2026-08-25
- **Status:** Open
- **Description:** An empty Vercel project named "witbyte-platform" exists alongside the correct "witbyte" project. It was created during initial setup and should be deleted.
- **Proposed fix:** Delete via Vercel dashboard or `vercel remove witbyte-platform`.
- **Affected files:** None (external service)
- **Affects features:** None

### OPEN-010: Theme Preference Not Persisted
- **Severity:** Trivial (UX)
- **Date discovered:** 2026-08-26
- **Status:** Open — by design, see ADR-003
- **Description:** When the user switches to light mode and reloads, the page returns to dark mode. The theme toggle state is not saved to localStorage.
- **Rationale for deferral:** The inline `<script>` on line 2 must set `data-theme` before CSS loads to prevent FOUC. If we also read from localStorage there, the script becomes more complex. Current behavior is acceptable — dark mode is the intended default.
- **Proposed fix (if desired):** Read localStorage in the inline script: `document.documentElement.setAttribute('data-theme', localStorage.getItem('witbyte-theme') || 'dark')`. Save in toggleTheme: `localStorage.setItem('witbyte-theme', newTheme)`.
- **Affected files:** `platform.html` lines 2, 7427–7467
- **Affects features:** F01 (Theme Toggle)
