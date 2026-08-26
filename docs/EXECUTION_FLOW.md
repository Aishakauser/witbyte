# WitByte — Execution Flow Documentation

> Traces every execution path through the codebase.
> Last updated: 2026-08-26

---

## 1. Application Initialization

**Trigger:** Browser loads `deploy/index.html` (or `platform.html` directly)

```
Browser parses HTML document
  │
  ├── Line 2: Inline <script> executes BEFORE CSS
  │   └── document.documentElement.setAttribute('data-theme', 'dark')
  │       → Sets dark mode to prevent flash of unstyled light content
  │
  ├── Line 3: <link> loads Google Fonts (DM Sans + JetBrains Mono)
  │   └── display=swap ensures text renders with fallback immediately
  │
  ├── Lines 4–395: <style> block parsed
  │   └── CSS tokens resolve against data-theme="dark" (set by line 2)
  │   └── Three-state token system activates dark palette
  │
  ├── Lines 396–406: HTML shell rendered
  │   └── Topbar (logo SVG + search input + theme button)
  │   └── <nav class="sidebar" id="sidebar"> (empty, filled by JS)
  │   └── <div class="main" id="main"> (empty, filled by JS)
  │   └── <div class="kbd-hint" id="kbd-hint"> (empty, filled by JS)
  │
  ├── Line 408: <script src="mermaid@10"> loaded from CDN
  │   └── If CDN fails → line 411 creates stub: { initialize(){}, run(){return Promise.resolve()} }
  │
  ├── Lines 412–426: mermaid.initialize()
  │   └── startOnLoad: false (diagrams rendered manually later)
  │   └── theme: 'dark' (matches data-theme)
  │   └── themeVariables: WitByte brand colors
  │
  ├── Lines 428–6763: Data declarations (TRACKS, CONNECTIONS, *_MODULES, ALL_MODULES)
  │   └── Pure data, no side effects
  │
  ├── Lines 6764–6769: State variables initialized
  │   └── currentView = 'home', currentTrack = null, currentModule = null
  │
  ├── Lines 6770–7515: Function declarations
  │   └── No execution, just definitions
  │
  └── Lines 7517–7520: Init block executes
      ├── renderSidebar()
      │   └── Builds sidebar HTML with Home link + 4 track entries
      │   └── Each track shows progress (done/total from localStorage)
      │   └── Sets sidebar.innerHTML
      │
      └── renderHome()
          └── Builds home page with hero, stats, track cards, stack viz, connections
          └── Sets main.innerHTML
          └── Stack visualization defaults to layer index 2 (Bootloader)
```

**Final state:** Dark-themed home page with sidebar navigation, all 4 track cards visible, interactive stack diagram, and cross-track connections grid.

---

## 2. Navigation Flow: Home → Track

**Trigger:** User clicks a track card on the home page OR a track entry in the sidebar

```
onclick="showTrack('cs')"
  │
  └── showTrack(key)  [line 6882]
      ├── currentView = 'track'
      ├── currentTrack = key  (e.g., 'cs')
      ├── currentModule = null
      │
      ├── renderSidebar()
      │   └── Rebuilds sidebar
      │   └── Track 'cs' gets .active class
      │   └── Module list expands under active track
      │   └── Each module shows completion checkmark if done
      │
      ├── renderTrackOverview(key)  [line 7076]
      │   ├── Reads TRACKS[key] for track metadata
      │   ├── Reads ALL_MODULES[key] for module array
      │   ├── Groups modules by phase (track.phases array)
      │   ├── For each module:
      │   │   ├── Checks isCompleted(m.id) → checkmark or empty circle
      │   │   ├── Renders title, hours, topic tags
      │   │   └── onclick="showModule('cs', 'cs-01')"
      │   └── Sets main.innerHTML with the track overview
      │
      └── scrollMainTop()
          ├── main.scrollTo({top:0, behavior:'instant'})
          └── Closes mobile sidebar (removes .open class)
```

---

## 3. Navigation Flow: Track → Module

**Trigger:** User clicks a module entry in track overview or sidebar

```
onclick="showModule('cs', 'cs-03')"
  │
  └── showModule(trackKey, modId)  [line 6891]
      ├── currentView = 'module'
      ├── currentTrack = 'cs'
      ├── currentModule = 'cs-03'
      │
      ├── renderSidebar()
      │   └── Track expanded, cs-03 gets .active class
      │
      ├── Find module: ALL_MODULES['cs'].find(m => m.id === 'cs-03')
      │
      └── renderModule('cs', mod)  [line 7113]
          ├── Get adjacent modules for prev/next nav
          ├── Check completion state: isCompleted('cs-03')
          │
          ├── Build nav HTML (← Previous / Next →)
          ├── Build completion bar HTML
          │
          ├── If mod.content is empty:
          │   └── Render "Content coming soon" placeholder
          │   └── RETURN EARLY
          │
          ├── Parse content: parseMarkdown(mod.content)  [line 7222]
          │   └── (See Flow #7 — Markdown Parsing)
          │
          ├── Calculate reading time: wordCount / 200 wpm
          │
          ├── Set main.innerHTML with:
          │   └── Back button, eyebrow badge, h1 title, meta (hours, read time, topics)
          │   └── Parsed content HTML
          │   └── Completion toggle bar
          │   └── Prev/Next navigation
          │
          ├── setTimeout(60ms): Wrap code blocks with copy buttons
          │   └── Find all .reader pre (excluding .mermaid-wrap and pre.mermaid)
          │   └── Skip if already wrapped (.code-wrap parent)
          │   └── Create .code-wrap div, move pre inside
          │   └── Add copy button + "Copied!" toast
          │
          └── setTimeout(50ms): Render Mermaid diagrams
              ├── Find all .mermaid-source elements
              │   └── (Created by parseMarkdown for ```mermaid blocks)
              ├── For each:
              │   ├── Read source text from element.textContent
              │   ├── Create .mermaid-wrap > pre.mermaid structure
              │   ├── Set data-source attribute (preserves source for re-rendering)
              │   ├── Set pre.textContent to diagram source
              │   └── Replace .mermaid-source element with new structure
              └── await mermaid.run({ nodes: document.querySelectorAll('.mermaid') })
                  └── Mermaid parses and renders SVG into each pre.mermaid
                  └── On error: console.warn (non-fatal)
```

---

## 4. Theme Toggle Flow

**Trigger:** User clicks the moon/sun button in the topbar

```
onclick="toggleTheme()"
  │
  └── toggleTheme()  [line 7427]
      ├── Read current: root.getAttribute('data-theme')
      ├── isDark = (current !== 'light')  → true if dark or null
      │
      ├── Set new theme: root.setAttribute('data-theme', isDark ? 'light' : 'dark')
      │   └── CSS tokens immediately re-resolve to new palette
      │   └── All var(--token) references update visually
      │
      ├── Swap icon SVG:
      │   └── If was dark → show sun icon (switching to light)
      │   └── If was light → show moon icon (switching to dark)
      │
      ├── Re-initialize Mermaid:
      │   └── mermaid.initialize({ theme: isDark ? 'default' : 'dark', ... })
      │   └── 'default' = Mermaid's light theme, 'dark' = Mermaid's dark theme
      │   └── themeVariables only set for dark mode (WitByte brand colors)
      │
      └── Re-render visible Mermaid diagrams:
          ├── Find all .mermaid[data-source] elements
          ├── For each:
          │   ├── removeAttribute('data-processed') (Mermaid's internal flag)
          │   ├── Clear innerHTML
          │   └── Reset textContent from data-source attribute
          └── mermaid.run({ nodes: mermaidEls }).catch(() => {})
              └── Mermaid re-renders with new theme colors
```

**Important:** Theme preference is NOT persisted to localStorage. On reload, it always defaults to dark (from line 2's inline script). This is intentional — the inline script must execute before CSS to prevent flash.

---

## 5. Search Flow

**Trigger:** User types in the search input (topbar)

```
searchInput 'input' event
  │
  ├── clearTimeout(_searchTimer)  — cancel pending search
  └── _searchTimer = setTimeout(_doSearch, 150)  — debounce 150ms
      │
      └── _doSearch()  [line 7384]
          ├── Read query: searchInput.value.trim().toLowerCase()
          │
          ├── If query < 2 chars:
          │   └── Hide search results dropdown
          │   └── RETURN
          │
          ├── Search all modules:
          │   └── For each track in ALL_MODULES:
          │       └── For each module:
          │           ├── Build haystack: title + topics.join(' ') + content
          │           ├── Lowercase haystack
          │           ├── If haystack.includes(query):
          │           │   ├── Extract snippet (±40/60 chars around match)
          │           │   └── Push { trackKey, track, mod, snippet } to results
          │
          ├── If no results:
          │   └── Show "No results found" in dropdown
          │
          ├── If results found:
          │   └── Take first 8 results
          │   └── Render each as clickable item with:
          │       ├── Track name + module number (escaped via escapeHtml)
          │       ├── Module title (escaped)
          │       ├── Snippet (escaped)
          │       └── onclick: showModule(trackKey, modId) + close dropdown + clear input
          │
          └── Show search results dropdown (.show class)

Dismiss flow:
  document 'click' event  [line 7422]
  └── If click target is NOT inside .search-box → hide dropdown
```

---

## 6. Completion Tracking Flow

**Trigger:** User clicks "Mark as complete" button in module reader

```
onclick="toggleComplete('cs-03')"
  │
  └── toggleComplete(modId)  [line 6823]
      ├── done = !isCompleted(modId)
      │   └── isCompleted() → getCompleted() → localStorage.getItem('witbyte-completed')
      │   └── Parse JSON → check if modId key exists
      │
      ├── setCompleted(modId, done)
      │   ├── c = getCompleted()  — read current state
      │   ├── If done: c[modId] = Date.now()  — timestamp of completion
      │   ├── If !done: delete c[modId]  — remove completion
      │   └── localStorage.setItem('witbyte-completed', JSON.stringify(c))
      │       └── try/catch: silent failure on quota error
      │
      ├── Update button UI:
      │   ├── Toggle .done class on .complete-toggle button
      │   └── Update text: "Completed" or "Mark as complete"
      │
      └── renderSidebar()
          └── Sidebar refreshes with updated progress bars and checkmarks
```

**Data shape in localStorage:**
```json
{
  "cs-01": 1724619000000,
  "cs-03": 1724619100000,
  "ai-05": 1724619200000
}
```
Keys are module IDs, values are completion timestamps (Date.now()).

---

## 7. Markdown Parsing Flow

**Trigger:** Called by renderModule() for each module's content string

```
parseMarkdown(md)  [line 7222]
  │
  ├── Split input into lines: md.split('\n')
  ├── Initialize state: inCodeBlock, codeContent, codeLang, inTable, tableRows, inList, listItems, listType
  │
  └── For each line:
      │
      ├── Code fence (```):
      │   ├── If closing fence (inCodeBlock === true):
      │   │   ├── If codeLang === 'mermaid':
      │   │   │   └── Output: <div class="mermaid-source" style="display:none">{source}</div>
      │   │   │       → Hidden div; renderModule later replaces with .mermaid-wrap
      │   │   └── Else:
      │   │       └── Output: <pre><code>{escapeHtml(content)}</code></pre>
      │   └── If opening fence:
      │       ├── Flush any pending list/table
      │       ├── Set inCodeBlock = true
      │       └── Capture language from ```lang
      │
      ├── Inside code block:
      │   └── Accumulate line into codeContent
      │
      ├── Empty line:
      │   └── Flush pending list and table
      │
      ├── Table row (starts with |):
      │   ├── Flush pending list
      │   ├── Accumulate into tableRows array
      │   └── Skip separator row (row index 1 matching /^[\s|:-]+$/)
      │
      ├── Header (# ## ###):
      │   ├── Flush pending list
      │   └── Output: <h1|h2|h3>{inlineFormat(text)}</h1|h2|h3>
      │
      ├── List item (- * or 1.):
      │   ├── Detect ordered vs unordered
      │   └── Accumulate into listItems
      │
      ├── Blockquote (> ):
      │   └── Output: <blockquote>{inlineFormat(text)}</blockquote>
      │
      ├── Gotcha callout (⚠️ **Gotcha):
      │   └── Output: <div class="gotcha-box">...</div>
      │
      └── Paragraph (anything else):
          └── Output: <p>{inlineFormat(line)}</p>

  Post-loop:
  ├── If unclosed code block: emit remaining as <pre><code>
  ├── Flush remaining list
  └── Flush remaining table

  inlineFormat(text)  [line 7263]:
  ├── Replace \` with sentinel (preserve escaped backticks)
  ├── Replace `code` with <code>{escapeHtml}</code>
  ├── Replace **bold** with <strong>
  ├── Replace *italic* with <em>
  └── Restore sentinel → literal backtick

  flushTable()  [line 7247]:
  ├── Wrap in <div style="overflow-x:auto">
  ├── Row 0 → <th> cells
  ├── Row 1 (separator) → skip
  └── Rows 2+ → <td> cells

  flushList()  [line 7235]:
  ├── Detect checklist (- [ ] / - [x])
  ├── Strip list prefixes
  └── Wrap in <ul>/<ol> with <li> elements
```

---

## 8. Keyboard Shortcut Flow

**Trigger:** User presses a key (document 'keydown' listener)

```
document 'keydown' event  [line 7470]
  │
  ├── Guard: ignore if typing in INPUT, TEXTAREA, or contentEditable
  │
  ├── ArrowLeft (in module view):
  │   └── getAdjacentModules(currentTrack, currentModule)
  │   └── If prev exists → showModule(currentTrack, prev.id)
  │
  ├── ArrowRight (in module view):
  │   └── If next exists → showModule(currentTrack, next.id)
  │
  ├── Escape:
  │   ├── In module view → showTrack(currentTrack)
  │   └── In track view → showHome()
  │
  └── / or Cmd+K:
      ├── Focus search input and select text
      └── If not on home → showHome() first

Post-navigation: updateKbdHint()  [line 7498]
  └── Module view: show "←→ navigate  Esc back"
  └── Track view: show "Esc home"
  └── Home view: hide hint
```

---

## 9. Copy Code Flow

**Trigger:** User clicks copy button on a code block

```
onclick="copyCode(this)"
  │
  └── copyCode(btn)  [line 6804]
      ├── Find pre element: btn.closest('.code-wrap').querySelector('pre')
      ├── Get text: pre.textContent
      │
      ├── Try: navigator.clipboard.writeText(text)
      │   ├── On success:
      │   │   ├── btn.classList.add('copied') → green checkmark icon
      │   │   ├── Show .copy-toast "Copied!"
      │   │   └── setTimeout(1500ms): remove .copied, hide toast
      │   │
      │   └── On failure (catch): Fallback path
      │       ├── Create hidden textarea
      │       ├── textarea.value = text
      │       ├── document.body.appendChild(ta)
      │       ├── ta.select()
      │       ├── document.execCommand('copy')
      │       ├── btn.classList.add('copied')
      │       ├── setTimeout(1500ms): remove .copied
      │       └── document.body.removeChild(ta)
```

---

## 10. Mobile Sidebar Flow

**Trigger:** User clicks hamburger menu button (visible at ≤768px breakpoint)

```
onclick (hamburger button in topbar):
  └── document.querySelector('.sidebar').classList.toggle('open')
  └── document.querySelector('.sidebar-backdrop').classList.toggle('open')
      └── Sidebar slides in from left (CSS transition)
      └── Backdrop overlay appears

Dismiss:
  ├── onclick on .sidebar-backdrop:
  │   └── Remove .open from both sidebar and backdrop
  │
  └── scrollMainTop() (called by every navigation):
      └── Remove .open from sidebar and backdrop
```

---

## 11. Stack Visualization Interaction Flow

**Trigger:** User clicks a layer in the technology stack diagram on the home page

```
onclick on .stack-layer element (index i):
  │
  └── selectStackLayer(i)  [line 6942]
      ├── activeStackLayer = i
      ├── Update all .stack-layer elements:
      │   └── Toggle .active class (only clicked layer active)
      └── Update #stack-detail innerHTML:
          └── renderStackDetail(i)  [line 6924]
              ├── Read STACK_LAYERS[i]
              ├── Render badge (track color + name)
              ├── Render layer ID + lesson count
              ├── Render layer name + description
              ├── Render outcomes list
              └── Render action buttons:
                  ├── "Open first lesson" → showTrack(layer.track)
                  └── "Browse the track" → showTrack(layer.track)
```
