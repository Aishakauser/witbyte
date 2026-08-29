// WitByte — Application Logic
import { TRACKS, CONNECTIONS } from './data.js';
import { CS_MODULES } from './tracks/cs.js';
import { HW_MODULES } from './tracks/hw.js';
import { BSP_MODULES } from './tracks/bsp.js';
import { AI_MODULES } from './tracks/ai.js';

// ── Global error handler ──
window.onerror = function(msg, src, line, col) { console.error('WitByte error:', msg, 'at', src, line + ':' + col); return false; };
window.addEventListener('unhandledrejection', function(e) { console.error('WitByte unhandled promise:', e.reason); });

// ── Mermaid init ──
if (typeof mermaid === 'undefined') { window.mermaid = { initialize(){}, run(){return Promise.resolve()} }; }
mermaid.initialize({
  startOnLoad: false,
  theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dark',
  themeVariables: {
    darkMode: document.documentElement.getAttribute('data-theme') !== 'light',
    primaryColor: '#7c3aed',
    primaryTextColor: '#e6e4ea',
    primaryBorderColor: '#3e3c44',
    lineColor: '#6b6873',
    secondaryColor: '#1e1833',
    tertiaryColor: '#18171b',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '13px'
  }
});

const ALL_MODULES = {cs: CS_MODULES, hw: HW_MODULES, bsp: BSP_MODULES, ai: AI_MODULES};

const SEARCH_INDEX = [];
for (const [trackKey, mods] of Object.entries(ALL_MODULES)) {
  const track = TRACKS[trackKey];
  for (const mod of mods) {
    SEARCH_INDEX.push({ trackKey, track, mod, haystack: (mod.title + ' ' + (mod.topics||[]).join(' ') + ' ' + (mod.content||'')).toLowerCase() });
  }
}

// ══════════════════════════════════════════
//  UI RENDERING
// ══════════════════════════════════════════

let currentView = 'home';
let currentTrack = null;
let currentModule = null;

// ── Completion persistence ──
function getCompleted() {
  try { return JSON.parse(localStorage.getItem('witbyte-completed') || '{}'); } catch(e) { return {}; }
}
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;background:var(--surface);color:var(--ink);border:1px solid var(--border);border-radius:8px;font-size:13px;z-index:200;box-shadow:0 4px 12px var(--shadow);opacity:0;transition:opacity .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.style.opacity = '1');
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}
function setCompleted(modId, done) {
  const c = getCompleted();
  if (done) c[modId] = Date.now(); else delete c[modId];
  try { localStorage.setItem('witbyte-completed', JSON.stringify(c)); return true; } catch(e) { showToast('Storage full — completion not saved'); return false; }
}
function isCompleted(modId) { return !!getCompleted()[modId]; }
function getTrackProgress(trackKey) {
  const mods = ALL_MODULES[trackKey] || [];
  const completed = getCompleted();
  const done = mods.filter(m => completed[m.id]).length;
  return { done, total: mods.length, pct: mods.length ? Math.round(done/mods.length*100) : 0 };
}
function getOverallProgress() {
  let done = 0, total = 0;
  const completed = getCompleted();
  for (const mods of Object.values(ALL_MODULES)) { total += mods.length; done += mods.filter(m => completed[m.id]).length; }
  return { done, total, pct: total ? Math.round(done/total*100) : 0 };
}

// ── Navigation helpers ──
function kbClick(e) { if(e.key==='Enter'||e.key===' '){e.preventDefault();e.currentTarget.click();} }

function getAdjacentModules(trackKey, modId) {
  const mods = ALL_MODULES[trackKey] || [];
  const idx = mods.findIndex(m => m.id === modId);
  return { prev: idx > 0 ? mods[idx-1] : null, next: idx < mods.length-1 ? mods[idx+1] : null };
}

// ── Copy code ──
function copyCode(btn) {
  const pre = btn.closest('.code-wrap').querySelector('pre');
  const text = pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const toast = btn.nextElementSibling;
    if (toast) toast.classList.add('show');
    setTimeout(() => { btn.classList.remove('copied'); if (toast) toast.classList.remove('show'); }, 1500);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); btn.classList.add('copied'); setTimeout(() => btn.classList.remove('copied'), 1500); } catch(e) {}
    document.body.removeChild(ta);
  });
}

// ── Toggle complete ──
function toggleComplete(modId) {
  const done = !isCompleted(modId);
  if (!setCompleted(modId, done)) return;
  const btn = document.querySelector('.complete-toggle');
  if (btn) { btn.classList.toggle('done', done); btn.querySelector('.complete-text').textContent = done ? 'Completed' : 'Mark as complete'; }
  renderSidebar();
  // Pulse progress bar fills on completion
  if (done) {
    setTimeout(() => {
      document.querySelectorAll('.bar-fill').forEach(el => {
        el.classList.add('pulse');
        el.addEventListener('animationend', () => el.classList.remove('pulse'), { once: true });
      });
    }, 50);
  }
}

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  let html = `<div class="sidebar-section">
    <div class="sidebar-section-title">Navigate</div>
    <div class="nav-item ${currentView==='home'?'active':''}" role="button" tabindex="0" onclick="showHome()" onkeydown="kbClick(event)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      Home
    </div>
  </div>
  <div class="sidebar-section">
    <div class="sidebar-section-title">Tracks</div>`;

  for (const [key, track] of Object.entries(TRACKS)) {
    const isActive = currentTrack === key;
    const mods = ALL_MODULES[key] || [];
    const prog = getTrackProgress(key);
    html += `<div class="nav-item ${isActive?'active':''}" role="button" tabindex="0" onclick="showTrack('${key}')" onkeydown="kbClick(event)">
      <span class="pip" style="background:var(--${track.color})"></span>
      ${track.name}
      <span class="count">${prog.done}/${prog.total}</span>
    </div>`;
    if (!isActive && prog.total > 0) {
      html += `<div class="progress-mini">
        <div class="bar"><div class="bar-fill" style="width:${prog.pct}%;background:var(--${track.color})"></div></div>
      </div>`;
    }
    if (isActive) {
      html += '<div class="module-list">';
      mods.forEach(m => {
        const done = isCompleted(m.id);
        html += `<div class="mod-item ${currentModule===m.id?'active':''}" role="button" tabindex="0" onclick="showModule('${key}','${m.id}')" onkeydown="kbClick(event)">
          <span class="mod-check ${done?'done':''}">${done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
          <span class="mod-title">${m.title}</span>
        </div>`;
      });
      html += '</div>';
    }
  }
  html += '</div>';
  sb.innerHTML = html;
}

function showHome() {
  currentView = 'home';
  currentTrack = null;
  currentModule = null;
  renderSidebar();
  renderHome();
  scrollMainTop();
}

function showTrack(key) {
  currentView = 'track';
  currentTrack = key;
  currentModule = null;
  renderSidebar();
  renderTrackOverview(key);
  scrollMainTop();
}

function showModule(trackKey, modId) {
  currentView = 'module';
  currentTrack = trackKey;
  currentModule = modId;
  renderSidebar();
  const mods = ALL_MODULES[trackKey];
  const mod = mods.find(m => m.id === modId);
  if (mod) renderModule(trackKey, mod);
  scrollMainTop();
}

function scrollMainTop() {
  const main = document.getElementById('main');
  if (main) main.scrollTo({top:0,behavior:'instant'});
  const sb = document.querySelector('.sidebar');
  const bd = document.querySelector('.sidebar-backdrop');
  if (sb) sb.classList.remove('open');
  if (bd) bd.classList.remove('open');
  if (main) { const h = main.querySelector('h1'); if (h) { h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); } }
}

// Stack layers for the visualization
const STACK_LAYERS = [
  {id:'L6',name:'AI apps & agents',lessons:9,track:'ai',color:'ai',desc:'Agents, RAG pipelines, tool use, and production AI systems',outcomes:['Build an agent that calls real tools','Deploy a RAG pipeline end to end','Monitor AI systems in production']},
  {id:'L5',name:'Model internals & serving',lessons:11,track:'ai',color:'ai',desc:'Math foundations, transformers, fine-tuning, quantization, eval benchmarks — understand, measure, and serve the models you build with',outcomes:['Quantize a model and benchmark quality vs speed tradeoff','Fine-tune a model for a domain task','Size GPU requirements and serve with vLLM in production']},
  {id:'L4',name:'OS & userspace',lessons:14,track:'cs',color:'cs',desc:'SDLC, architecture, databases, APIs, security, testing, DevOps, cloud — production software engineering',outcomes:['Design an API that other teams actually want to use','Set up CI/CD that catches bugs before production','Debug a production incident across the full stack']},
  {id:'L3',name:'Kernel & drivers',lessons:12,track:'bsp',color:'bsp',desc:'Kernel modules, device drivers, subsystem internals — the OS layer',outcomes:['Write a character device driver','Trace a kernel panic to its root cause','Navigate the kernel source tree']},
  {id:'L2',name:'Bootloader & device tree',lessons:10,track:'bsp',color:'bsp',desc:'U-Boot, DTS, and the four lines that fix everything at 1am',outcomes:['Follow the U-Boot to kernel handoff','Write a device tree that probes first try','Build an image with Yocto or Buildroot']},
  {id:'L1',name:'Board: buses, power, memory',lessons:8,track:'hw',color:'hw',desc:'Datasheets, schematics, buses, power rails — where the abstraction leaks',outcomes:['Read a schematic and find the I²C address','Debug a power rail that browns out under load','Choose the right bus protocol for your peripheral']},
  {id:'L0',name:'Silicon: SoC, cores, NPU',lessons:7,track:'hw',color:'hw',desc:'What a chip actually is — cores, caches, interconnects, and the NPU block',outcomes:['Map an SoC block diagram to real hardware','Explain why cache matters for your code','Identify the NPU in a datasheet']}
];
let activeStackLayer = 2; // Default to L2 (Bootloader & device tree)

function renderStackDetail(idx) {
  const layer = STACK_LAYERS[idx];
  const trackNames = {ai:'AI Engineering',cs:'Software & Systems',bsp:'Board Support Package',hw:'Silicon & Boards'};
  return `
    <div class="sd-badge" style="background:var(--${layer.color}-soft);color:var(--${layer.color})">${trackNames[layer.track]}</div>
    <div class="sd-meta">${layer.id} · ${layer.lessons} lessons</div>
    <h3>${layer.name}</h3>
    <div class="sd-desc">${layer.desc}</div>
    <div class="sd-outcomes">You'll walk out able to</div>
    <div class="sd-list">
      ${layer.outcomes.map(o=>`<div class="sd-list-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>${o}</span></div>`).join('')}
    </div>
    <div class="sd-actions">
      <button class="btn-primary" onclick="showTrack('${layer.track}')">Open first lesson</button>
      <button class="btn-outline" onclick="showTrack('${layer.track}')">Browse the track</button>
    </div>`;
}

function selectStackLayer(idx) {
  activeStackLayer = idx;
  document.querySelectorAll('.stack-layer').forEach((el,i) => {
    el.classList.toggle('active', i === idx);
  });
  const detail = document.getElementById('stack-detail');
  if (detail) detail.innerHTML = renderStackDetail(idx);
}

function renderHome() {
  const main = document.getElementById('main');
  const overall = getOverallProgress();
  const trackDescs = {
    hw: {badge:'HW',subtitle:'Silicon & Boards',desc:'Datasheets, schematics, buses, power. Where the abstraction leaks.',pre:'no prior EE',role:'Hardware Engineer'},
    bsp: {badge:'BSP',subtitle:'Board Support Package',desc:'U-Boot, device trees, kernel config, drivers, Yocto. Board bring-up.',pre:'needs a board',role:'BSP Engineer'},
    cs: {badge:'SW',subtitle:'Software & Systems',desc:'SDLC, databases, APIs, security, CI/CD, cloud — production engineering end to end.',pre:'some coding',role:'Software Engineer'},
    ai: {badge:'AI',subtitle:'AI Engineering',desc:'Agents, RAG, eval harnesses, GPU sizing, quantization — build, measure, and ship production AI.',pre:'after SW',role:'AI Engineer'}
  };

  main.innerHTML = `<div class="home">
    <div class="hero-path">
      <span>Silicon</span><span class="sep">→</span>
      <span>Board</span><span class="sep">→</span>
      <span>BSP</span><span class="sep">→</span>
      <span>Kernel</span><span class="sep">→</span>
      <span>Userspace</span><span class="sep">→</span>
      <span>AI</span>
    </div>
    <h1>Learn the <span class="gradient">whole stack</span>.<br>Not just the bit that runs in a browser.</h1>
    <p class="subtitle">Most courses hand you an API key and call it AI. We start at the pin and climb to the model — schematics, device trees, kernel drivers, runtimes, NPUs. Four tracks, run them in parallel, quit any time you get bored (you won't).</p>
    <div class="hero-ctas">
      <button class="btn-primary" onclick="showTrack('hw')" style="font-size:15px;padding:12px 24px">Start climbing</button>
      <button class="btn-outline" onclick="document.getElementById('tracks-section').scrollIntoView({behavior:'smooth'})">See all four tracks</button>
      <span class="note">No signup for the first 6 lessons</span>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${Object.values(ALL_MODULES).reduce((s,m)=>s+m.length,0)}</div><div class="stat-label">Modules</div></div>
      <div class="stat-card"><div class="stat-num">${Object.keys(TRACKS).length}</div><div class="stat-label">Tracks</div></div>
      <div class="stat-card"><div class="stat-num">95+</div><div class="stat-label">Diagrams</div></div>
      <div class="stat-card"><div class="stat-num">${Object.values(TRACKS).reduce((s,t)=>s+t.hours,0)}</div><div class="stat-label">Hours</div></div>
    </div>

    <!-- THE STACK -->
    <div class="stack-section">
      <h2>The Stack <span style="float:right;font-weight:400;letter-spacing:0;text-transform:none;font-size:12px;color:var(--ink3)">click a layer ↓</span></h2>
      <div class="stack-wrap">
        <div>
          <div class="stack-layers">
            ${STACK_LAYERS.map((layer,i)=>`
              <div class="stack-layer ${i===activeStackLayer?'active':''}" role="button" tabindex="0" onclick="selectStackLayer(${i})" onkeydown="kbClick(event)">
                <span class="sl-num">${layer.id}</span>
                <span class="sl-dot" style="background:var(--${layer.color})"></span>
                <span class="sl-name">${layer.name}</span>
                <span class="sl-count">${layer.lessons} · lessons</span>
              </div>
            `).join('')}
          </div>
          <div class="stack-arrow"><span>↑ abstraction</span><span>↓ physics</span></div>
        </div>
        <div class="stack-detail" id="stack-detail">
          ${renderStackDetail(activeStackLayer)}
        </div>
      </div>
    </div>

    <!-- FOUR TRACKS -->
    <div id="tracks-section" style="margin-top:56px">
      <h2 style="font-size:28px;font-weight:700;letter-spacing:-0.5px">Four tracks. Take them in parallel.</h2>
      <p style="font-size:15px;color:var(--ink2);margin-bottom:24px">Nobody learns in a straight line, so we stopped pretending.</p>
      <div class="track-cards">
        ${Object.entries(TRACKS).map(([k,t])=>{
          const p = getTrackProgress(k);
          const td = trackDescs[k];
          return `
          <div class="track-hero ${t.color}" role="button" tabindex="0" onclick="showTrack('${k}')" onkeydown="kbClick(event)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span class="track-badge ${t.color}">${td.badge}</span>
              <span style="font-size:12px;color:var(--ink3);font-variant-numeric:tabular-nums">${p.total} lessons</span>
            </div>
            <div class="th-name">${td.subtitle}</div>
            <div class="th-desc">${td.desc}</div>
            <div style="font-size:12px;font-weight:600;color:var(--${t.color});margin-top:6px">→ ${td.role}</div>
            <div class="th-meta" style="margin-top:10px"><span>~${t.hours}h</span><span style="font-family:var(--mono);font-size:11px">${td.pre}</span></div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <div class="how-section">
      <div class="how-grid">
        <div class="how-card">
          <div class="how-num">01</div>
          <h3>Read something honest</h3>
          <p>Every lesson pairs a diagram with the actual commands. No "left as an exercise to the reader."</p>
        </div>
        <div class="how-card">
          <div class="how-num">02</div>
          <h3>Break it on purpose</h3>
          <p>Checkpoints ask the question you'd fail in a code review, then explain why you failed it.</p>
        </div>
        <div class="how-card">
          <div class="how-num">03</div>
          <h3>Watch the climb</h3>
          <p>Your dashboard shows the stack filling in layer by layer. Weirdly motivating.</p>
        </div>
      </div>
    </div>

    <!-- CONNECTIONS -->
    <div class="connections">
      <h2>Cross-Track Connections</h2>
      <p class="conn-desc">These tracks aren't silos — knowledge transfers at specific points</p>
      <div class="conn-grid">
        ${CONNECTIONS.map(c=>`
          <div class="conn-card">
            <div class="conn-name">${c.name}</div>
            <div class="conn-route"><span style="color:var(--${c.c1})">${c.from}</span> → <span style="color:var(--${c.c2})">${c.to}</span></div>
            <div class="conn-what">${c.what}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="site-footer">
      <div class="footer-left">
        <div class="mark" style="width:20px;height:20px"><svg viewBox="0 0 100 100" fill="none" style="width:100%;height:100%;display:block"><line x1="50" y1="50" x2="50" y2="12" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="76.87" y2="19.13" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="88" y2="50" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="76.87" y2="80.87" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="50" y2="88" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="23.13" y2="80.87" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="12" y2="50" style="stroke:var(--spoke)" stroke-width="1.2"/><line x1="50" y1="50" x2="23.13" y2="19.13" style="stroke:var(--spoke)" stroke-width="1.2"/><polygon points="50,12 76.87,19.13 88,50 76.87,80.87 50,88 23.13,80.87 12,50 23.13,19.13" style="stroke:var(--ring)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="12" r="5" style="fill:var(--ai)"/><circle cx="76.87" cy="19.13" r="5" style="fill:var(--ai2)"/><circle cx="88" cy="50" r="5" style="fill:var(--cs)"/><circle cx="76.87" cy="80.87" r="5" style="fill:var(--bsp2)"/><circle cx="50" cy="88" r="5" style="fill:var(--bsp)"/><circle cx="23.13" cy="80.87" r="5" style="fill:var(--hw)"/><circle cx="12" cy="50" r="5" style="fill:var(--hw2)"/><circle cx="23.13" cy="19.13" r="5" style="fill:var(--cs2)"/><circle cx="50" cy="50" r="9" style="fill:var(--rose-glow)"/><circle cx="50" cy="50" r="6" style="fill:var(--rose)"/></svg></div>
        <span><strong>WitByte</strong></span>
        <span>Made by people who have soldered a jumper wire at 1am.</span>
      </div>
      <div class="footer-links">
        <a href="#" onclick="event.preventDefault()">Curriculum</a>
        <a href="#" onclick="event.preventDefault()">Cheat sheets</a>
        <a href="#" onclick="event.preventDefault()">Contribute</a>
      </div>
    </div>
  </div>`;
  main.scrollTop = 0;

  // Scroll-triggered entrance animations
  setTimeout(() => {
    const sections = main.querySelectorAll('.stack-section, .track-cards, .how-section, .connections');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('appear'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    sections.forEach(s => obs.observe(s));
  }, 100);
}

function renderTrackOverview(key) {
  const track = TRACKS[key];
  const mods = ALL_MODULES[key];
  const main = document.getElementById('main');
  const prog = getTrackProgress(key);
  let html = `<div class="reader">
    <div class="back-btn" role="button" tabindex="0" onclick="showHome()" onkeydown="kbClick(event)">← All tracks</div>
    <div class="mod-eyebrow" style="color:var(--${track.color})">${track.name}</div>
    <h1>${track.name}${track.subtitle ? `<span style="display:block;font-size:16px;font-weight:400;color:var(--ink2);margin-top:4px">${track.subtitle}</span>` : ''}</h1>
    <p>${track.tagline}</p>
    <div style="margin:12px 0 16px;padding:12px 16px;border-radius:8px;background:var(--${track.color}-soft)">
      <div style="font-weight:700;font-size:14px;color:var(--${track.color});margin-bottom:4px">Target role: ${track.targetRole}</div>
      <div style="font-size:14px;color:var(--ink2)">${track.whyCare}</div>
    </div>
    <div class="mod-meta"><span>${prog.done}/${prog.total} modules complete</span><span>~${track.hours} hours</span></div>
    <div class="progress-track">
      <div class="bar"><div class="bar-fill" style="width:${prog.pct}%;background:var(--${track.color})"></div></div>
      <span class="prog-text">${prog.pct}%</span>
    </div>`;

  track.phases.forEach((phase, pi) => {
    html += `<h2>${phase}</h2>`;
    const phaseMods = mods.filter(m => m.phase === pi);
    phaseMods.forEach(m => {
      const done = isCompleted(m.id);
      html += `<div class="track-mod-row" role="button" tabindex="0" onclick="showModule('${key}','${m.id}')" onkeydown="kbClick(event)">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="mod-check ${done?'done':''}" style="width:20px;height:20px">${done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--ink3);width:28px">${m.num}</span>
          <span style="font-weight:600;font-size:15px;${done?'color:var(--ink2)':''}">${m.title}</span>
          <span style="margin-left:auto;font-size:12px;color:var(--ink3);font-variant-numeric:tabular-nums">~${m.hours} hrs</span>
        </div>
        ${m.topics ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;padding-left:62px">${m.topics.map(t=>`<span style="font-size:11px;padding:2px 7px;border-radius:4px;background:var(--${track.color}-soft);color:var(--${track.color});font-weight:500">${t}</span>`).join('')}</div>` : ''}
      </div>`;
    });
  });
  html += '</div>';
  main.innerHTML = html;
  main.scrollTop = 0;
}

function renderModule(trackKey, mod) {
  const track = TRACKS[trackKey];
  const main = document.getElementById('main');
  const adj = getAdjacentModules(trackKey, mod.id);
  const done = isCompleted(mod.id);

  // Build prev/next nav
  let navHtml = '<div class="mod-nav">';
  if (adj.prev) {
    navHtml += `<div class="mod-nav-btn" role="button" tabindex="0" onclick="showModule('${trackKey}','${adj.prev.id}')" onkeydown="kbClick(event)">
      <span class="nav-dir">← Previous</span>
      <span class="nav-title">${adj.prev.title}</span>
    </div>`;
  }
  if (adj.next) {
    navHtml += `<div class="mod-nav-btn next" role="button" tabindex="0" onclick="showModule('${trackKey}','${adj.next.id}')" onkeydown="kbClick(event)">
      <span class="nav-dir">Next →</span>
      <span class="nav-title">${adj.next.title}</span>
    </div>`;
  } else {
    navHtml += `<div class="mod-nav-btn next track-done">
      <span class="nav-dir">Track complete</span>
      <span class="nav-title">You've finished ${track.name}</span>
    </div>`;
  }
  navHtml += '</div>';

  // Build complete bar
  const completeHtml = `<div class="complete-bar">
    <button class="complete-toggle ${done?'done':''}" onclick="toggleComplete('${mod.id}')">
      <span class="check-icon">${done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
      <span class="complete-text">${done ? 'Completed' : 'Mark as complete'}</span>
    </button>
    <span class="complete-label">${done ? 'Nice work!' : 'Finished this module? Track your progress.'}</span>
  </div>`;

  if (!mod.content) {
    main.innerHTML = `<div class="reader">
      <div class="back-btn" role="button" tabindex="0" onclick="showTrack('${trackKey}')" onkeydown="kbClick(event)">← ${track.name}</div>
      <div class="mod-eyebrow" style="color:var(--${track.color})"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--${track.color})"></span> ${track.name} · Module ${mod.num}</div>
      <h1>${mod.title}</h1>
      <div class="mod-meta"><span>~${mod.hours} hours</span></div>
      <p style="margin-top:32px;color:var(--ink2)">Content coming soon — this module is being ported from the existing curriculum.</p>
      ${mod.topics ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:16px">${mod.topics.map(t=>`<span style="font-size:12px;padding:3px 10px;border-radius:6px;background:var(--${track.color}-soft);color:var(--${track.color});font-weight:500">${t}</span>`).join('')}</div>` : ''}
      ${completeHtml}
      ${navHtml}
    </div>`;
    main.scrollTop = 0;
    return;
  }

  // Parse markdown content
  const content = parseMarkdown(mod.content);

  // Word count and reading time
  const wordCount = mod.content.replace(/[#*`\n|>-]/g,' ').split(/\s+/).filter(w=>w).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  main.innerHTML = `<div class="reader">
    <div class="back-btn" role="button" tabindex="0" onclick="showTrack('${trackKey}')" onkeydown="kbClick(event)">← ${track.name}</div>
    <div class="mod-eyebrow" style="color:var(--${track.color})"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--${track.color})"></span> ${track.name} · Module ${mod.num}</div>
    <h1>${mod.title}</h1>
    <div class="mod-meta"><span>~${mod.hours} hours</span><span>${readTime} min read</span>${mod.topics ? `<span>${mod.topics.length} topics</span>` : ''}</div>
    <div class="module-content">${content}</div>
    ${completeHtml}
    ${navHtml}
  </div>`;
  main.scrollTop = 0;

  // Wrap code blocks with copy button
  setTimeout(() => {
    document.querySelectorAll('.reader pre').forEach(pre => {
      if (pre.closest('.mermaid-wrap') || pre.classList.contains('mermaid')) return;
      if (pre.parentElement.classList.contains('code-wrap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      wrap.insertAdjacentHTML('beforeend', `
        <button class="copy-btn" onclick="copyCode(this)" aria-label="Copy code">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <span class="copy-toast">Copied!</span>
      `);
    });
  }, 60);

  // Render mermaid diagrams
  setTimeout(async () => {
    const sources = document.querySelectorAll('.mermaid-source');
    if (!sources.length) return;
    sources.forEach(el => {
      const src = el.textContent;
      const div = document.createElement('div');
      div.className = 'mermaid-wrap';
      const pre = document.createElement('pre');
      pre.className = 'mermaid';
      pre.setAttribute('data-source', src);
      pre.textContent = src;
      div.appendChild(pre);
      el.replaceWith(div);
    });
    try {
      await mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
    } catch(e) { console.warn('Mermaid render error:', e); }
  }, 50);
}

// ── Simple Markdown Parser ──
function parseMarkdown(md) {
  let html = '';
  const lines = md.split('\n');
  let i = 0;
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';
  let inTable = false;
  let tableRows = [];
  let inList = false;
  let listItems = [];
  let listType = 'ul';
  let inBlockquote = false;
  let blockquoteLines = [];

  function flushBlockquote() {
    if (inBlockquote && blockquoteLines.length) {
      html += `<blockquote>${blockquoteLines.map(l => inlineFormat(l)).join('<br>')}</blockquote>`;
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  function flushList() {
    if (inList && listItems.length) {
      const cls = listItems[0].startsWith('- [ ]') || listItems[0].startsWith('- [x]') ? ' class="checklist"' : '';
      html += `<${listType}${cls}>${listItems.map(li => {
        let text = li.replace(/^[-*]\s*(\[.\]\s*)?/, '').replace(/^\d+\.\s*/, '');
        return `<li>${inlineFormat(text)}</li>`;
      }).join('')}</${listType}>`;
      listItems = [];
      inList = false;
    }
  }

  function flushTable() {
    if (inTable && tableRows.length) {
      let t = '<div style="overflow-x:auto"><table>';
      tableRows.forEach((row, ri) => {
        if (ri === 1 && row.match(/^[\s|:-]+$/)) return;
        const tag = ri === 0 ? 'th' : 'td';
        const cells = row.split('|').filter(c => c.trim() !== '');
        t += '<tr>' + cells.map(c => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('') + '</tr>';
      });
      t += '</table></div>';
      html += t;
      tableRows = [];
      inTable = false;
    }
  }

  function inlineFormat(text) {
    return text
      .replace(/\\`/g, '\x00BT\x00')
      .replace(/`([^`]+)`/g, (_, c) => '<code>' + escapeHtml(c) + '</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\x00BT\x00/g, '`');
  }

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.match(/^```/)) {
      if (inCodeBlock) {
        if (codeLang === 'mermaid') {
          html += `<div class="mermaid-source" style="display:none">${codeContent}</div>`;
        } else {
          html += `<pre><code>${escapeHtml(codeContent)}</code></pre>`;
        }
        inCodeBlock = false;
        codeContent = '';
        codeLang = '';
      } else {
        flushList();
        flushTable();
        flushBlockquote();
        inCodeBlock = true;
        codeLang = line.replace(/^```/, '').trim();
      }
      i++;
      continue;
    }
    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      flushTable();
      flushBlockquote();
      i++;
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList();
      flushBlockquote();
      if (!inTable) inTable = true;
      tableRows.push(line);
      i++;
      continue;
    } else {
      flushTable();
    }

    // Headers
    const hMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (hMatch) {
      flushList();
      flushBlockquote();
      const level = hMatch[1].length;
      const tag = `h${level}`;
      html += `<${tag}>${inlineFormat(hMatch[2])}</${tag}>`;
      i++;
      continue;
    }

    // Lists
    if (line.match(/^\s*[-*]\s/) || line.match(/^\s*\d+\.\s/)) {
      if (!inList) {
        inList = true;
        listType = line.match(/^\s*\d+\./) ? 'ol' : 'ul';
      }
      listItems.push(line.trim());
      i++;
      continue;
    } else {
      flushList();
    }

    // Blockquote (accumulate consecutive lines)
    if (line.startsWith('>')) {
      flushList();
      if (!inBlockquote) inBlockquote = true;
      blockquoteLines.push(line.replace(/^>\s*/, ''));
      i++;
      continue;
    } else {
      flushBlockquote();
    }

    // Gotcha callout
    if (line.match(/^⚠️\s*\*\*Gotcha/)) {
      const gotchaText = line.replace(/^⚠️\s*\*\*Gotcha:?\*\*\s*/, '');
      html += `<div class="gotcha-box"><div class="gotcha-title">⚠ Gotcha</div><div class="gotcha-body">${inlineFormat(gotchaText)}</div></div>`;
      i++;
      continue;
    }

    // HTML pass-through: don't wrap raw HTML tags in <p>
    if (line.match(/^\s*<\/?[a-zA-Z][^>]*>/)) {
      html += line + '\n';
      i++;
      continue;
    }

    // Paragraph
    html += `<p>${inlineFormat(line)}</p>`;
    i++;
  }
  if (inCodeBlock) {
    html += `<pre><code>${escapeHtml(codeContent)}</code></pre>`;
  }
  flushList();
  flushTable();
  flushBlockquote();
  return html;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Search ──
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let _searchTimer;

searchInput.addEventListener('input', () => {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(_doSearch, 150);
});
function _doSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 2) { searchResults.classList.remove('show'); searchInput.setAttribute('aria-expanded','false'); return; }

  const results = [];
  for (const entry of SEARCH_INDEX) {
    if (entry.haystack.includes(q)) {
      let snippet = '';
      if (entry.mod.content) {
        const idx = entry.mod.content.toLowerCase().indexOf(q);
        if (idx > -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(entry.mod.content.length, idx + q.length + 60);
          snippet = '...' + entry.mod.content.substring(start, end).replace(/[#*`\n]/g,' ').trim() + '...';
        }
      }
      results.push({ trackKey: entry.trackKey, track: entry.track, mod: entry.mod, snippet });
    }
  }

  if (results.length === 0) {
    searchResults.innerHTML = '<div style="padding:14px;color:var(--ink3);font-size:13px">No results found</div>';
  } else {
    searchResults.innerHTML = results.slice(0,8).map(r => `
      <div class="sr-item" role="option" onclick="showModule('${r.trackKey}','${r.mod.id}');searchResults.classList.remove('show');searchInput.value='';">
        <div class="sr-track" style="color:var(--${r.track.color})">${escapeHtml(r.track.name)} · ${r.mod.num}</div>
        <div class="sr-title">${escapeHtml(r.mod.title)}</div>
        ${r.snippet ? `<div class="sr-snippet">${escapeHtml(r.snippet)}</div>` : ''}
      </div>
    `).join('');
  }
  searchResults.classList.add('show');
  searchInput.setAttribute('aria-expanded','true');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-box')) { searchResults.classList.remove('show'); searchInput.setAttribute('aria-expanded','false'); }
});

// ── Theme toggle ──
function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const isDark = current !== 'light';
  const newTheme = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', newTheme);
  try { localStorage.setItem('witbyte-theme', newTheme); } catch(e) {}

  // Swap icon: moon (dark mode) ↔ sun (light mode)
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }

  // Re-initialize mermaid for new theme
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'default' : 'dark',
    themeVariables: isDark ? {} : {
      darkMode: true,
      primaryColor: '#7c3aed',
      primaryTextColor: '#e6e4ea',
      primaryBorderColor: '#3e3c44',
      lineColor: '#6b6873',
      secondaryColor: '#1e1833',
      tertiaryColor: '#18171b',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '13px'
    }
  });
  // Re-render any visible mermaid diagrams with new theme
  const mermaidEls = document.querySelectorAll('.mermaid[data-source]');
  if (mermaidEls.length) {
    mermaidEls.forEach(el => {
      el.removeAttribute('data-processed');
      el.innerHTML = '';
      el.textContent = el.getAttribute('data-source');
    });
    mermaid.run({ nodes: mermaidEls }).catch(() => {});
  }
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', e => {
  // Ignore when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

  // Left/Right arrows: prev/next module navigation
  if (currentView === 'module' && currentTrack && currentModule) {
    const adj = getAdjacentModules(currentTrack, currentModule);
    if (e.key === 'ArrowLeft' && adj.prev) { e.preventDefault(); showModule(currentTrack, adj.prev.id); return; }
    if (e.key === 'ArrowRight' && adj.next) { e.preventDefault(); showModule(currentTrack, adj.next.id); return; }
  }

  // Escape: go up one level (module → track overview → home)
  if (e.key === 'Escape') {
    if (currentView === 'module' && currentTrack) { e.preventDefault(); showTrack(currentTrack); return; }
    if (currentView === 'track') { e.preventDefault(); showHome(); return; }
  }

  // Cmd/Ctrl+K or /: focus search
  if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
    e.preventDefault();
    const si = document.getElementById('searchInput');
    if (si) { si.focus(); si.select(); }
    if (currentView !== 'home') showHome();
    return;
  }
});

// Show/hide keyboard hint based on view
function updateKbdHint() {
  const hint = document.getElementById('kbd-hint');
  if (!hint) return;
  if (currentView === 'module') {
    hint.style.display = 'block';
    hint.innerHTML = '<kbd>←</kbd><kbd>→</kbd> navigate &nbsp; <kbd>Esc</kbd> back';
  } else if (currentView === 'track') {
    hint.style.display = 'block';
    hint.innerHTML = '<kbd>Esc</kbd> home';
  } else {
    hint.style.display = 'none';
  }
}
// Patch show functions to update hint
const _origShowHome = showHome, _origShowTrack = showTrack, _origShowModule = showModule;
showHome = function() { _origShowHome(); updateKbdHint(); };
showTrack = function(k) { _origShowTrack(k); updateKbdHint(); };
showModule = function(tk, mi) { _origShowModule(tk, mi); updateKbdHint(); };

// ── Expose functions to global scope for inline onclick handlers ──
window.showHome = showHome;
window.showTrack = showTrack;
window.showModule = showModule;
window.toggleComplete = toggleComplete;
window.copyCode = copyCode;
window.selectStackLayer = selectStackLayer;
window.kbClick = kbClick;
window.toggleTheme = toggleTheme;

// ── Init ──
renderSidebar();
renderHome();
