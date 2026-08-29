// Interactive Memory Hierarchy — hw-05 Memory Systems
import { registerVisual } from '../../js/visuals.js';

registerVisual('hw-05', function(container) {
  container.innerHTML = `
    <div class="vis-title">Memory Hierarchy</div>
    <div class="vis-desc">Click each level to see its characteristics. The pyramid shows the classic speed-vs-capacity tradeoff.</div>
    <div class="mem-vis">
      <div class="mem-pyramid" id="mem-pyramid">
        <div class="mem-level" data-level="0" style="--w:20%;--c:var(--hw)">
          <div class="mem-label">Registers</div>
        </div>
        <div class="mem-level" data-level="1" style="--w:35%;--c:var(--hw)">
          <div class="mem-label">L1 Cache</div>
        </div>
        <div class="mem-level" data-level="2" style="--w:50%;--c:var(--hw2,var(--hw))">
          <div class="mem-label">L2 Cache</div>
        </div>
        <div class="mem-level" data-level="3" style="--w:65%;--c:var(--cs)">
          <div class="mem-label">L3 Cache</div>
        </div>
        <div class="mem-level" data-level="4" style="--w:80%;--c:var(--bsp)">
          <div class="mem-label">Main Memory (DRAM)</div>
        </div>
        <div class="mem-level" data-level="5" style="--w:95%;--c:var(--ai)">
          <div class="mem-label">Storage (SSD/HDD)</div>
        </div>
      </div>
      <div class="mem-arrows">
        <span>← Faster, Smaller, Costlier</span>
        <span>Slower, Larger, Cheaper →</span>
      </div>
      <div class="mem-detail" id="mem-detail">
        <div class="mem-detail-title">Click a level</div>
        <div class="mem-detail-body">Explore the speed, size, and cost at each level of the memory hierarchy.</div>
      </div>
    </div>
    <style>
      .mem-vis { max-width: 500px; margin: 0 auto; }
      .mem-pyramid { display: flex; flex-direction: column; align-items: center; gap: 3px; margin-bottom: 8px; }
      .mem-level {
        width: var(--w); padding: 10px; text-align: center; border-radius: 6px;
        background: color-mix(in srgb, var(--c) 15%, transparent);
        border: 1.5px solid color-mix(in srgb, var(--c) 40%, transparent);
        cursor: pointer; transition: all .2s;
      }
      .mem-level:hover, .mem-level.active {
        border-color: var(--c);
        background: color-mix(in srgb, var(--c) 25%, transparent);
        transform: scale(1.02);
      }
      .mem-label { font-size: 12px; font-weight: 600; color: var(--ink); }
      .mem-arrows {
        display: flex; justify-content: space-between; font-size: 10px;
        color: var(--ink2); margin-bottom: 12px; padding: 0 8px;
      }
      .mem-detail {
        background: var(--surface); border-radius: 12px; padding: 14px;
        border: 1px solid var(--border); min-height: 80px;
      }
      .mem-detail-title { font-size: 14px; font-weight: 700; color: var(--hw); margin-bottom: 6px; }
      .mem-detail-body { font-size: 13px; color: var(--ink); line-height: 1.5; }
      .mem-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
      .mem-stat { text-align: center; padding: 8px; background: var(--bg); border-radius: 8px; }
      .mem-stat-val { font-size: 16px; font-weight: 700; color: var(--hw); font-family: 'JetBrains Mono', monospace; }
      .mem-stat-key { font-size: 10px; color: var(--ink2); margin-top: 2px; }
    </style>
  `;

  const levels = [
    { name: 'Registers', size: '~1 KB', speed: '< 1 ns', cost: '$$$$', desc: 'Fastest storage, directly in the CPU. Holds the values the ALU is currently operating on. A modern CPU has 32-128 general-purpose registers.' },
    { name: 'L1 Cache', size: '32-64 KB', speed: '~1 ns', cost: '$$$', desc: 'Per-core cache split into instruction (L1i) and data (L1d). A cache miss here costs ~4 cycles. Uses SRAM — 6 transistors per bit.' },
    { name: 'L2 Cache', size: '256 KB - 1 MB', speed: '~3-5 ns', cost: '$$', desc: 'Per-core unified cache. Larger than L1 but slower. Serves as a backstop for L1 misses. Typical line size: 64 bytes.' },
    { name: 'L3 Cache', size: '4-64 MB', speed: '~10-20 ns', cost: '$$', desc: 'Shared across all cores. Acts as a victim cache for L2. Critical for multi-threaded workloads — cache coherency protocols (MESI/MOESI) keep it consistent.' },
    { name: 'Main Memory (DRAM)', size: '4-128 GB', speed: '~50-100 ns', cost: '$', desc: 'Uses capacitors — 1 transistor + 1 capacitor per bit. Needs periodic refresh (every 64ms). DDR5 can sustain ~50 GB/s bandwidth but latency is the bottleneck.' },
    { name: 'Storage (SSD/HDD)', size: '256 GB - 8 TB', speed: '~100 μs (SSD)', cost: '¢', desc: 'Non-volatile. SSDs use NAND flash (~100μs read), HDDs use spinning platters (~10ms seek). The virtual memory system pages data between DRAM and storage.' },
  ];

  container.querySelectorAll('.mem-level').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.mem-level').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      const level = levels[parseInt(el.dataset.level)];
      container.querySelector('#mem-detail').innerHTML = `
        <div class="mem-detail-title">${level.name}</div>
        <div class="mem-detail-body">${level.desc}</div>
        <div class="mem-stats">
          <div class="mem-stat"><div class="mem-stat-val">${level.size}</div><div class="mem-stat-key">Typical Size</div></div>
          <div class="mem-stat"><div class="mem-stat-val">${level.speed}</div><div class="mem-stat-key">Latency</div></div>
          <div class="mem-stat"><div class="mem-stat-val">${level.cost}</div><div class="mem-stat-key">Cost/bit</div></div>
        </div>
      `;
    });
  });
});
