// Interactive CPU Pipeline Visualizer — hw-02 Computer Architecture
import { registerVisual } from '../../js/visuals.js';

registerVisual('hw-02', function(container) {
  container.innerHTML = `
    <div class="vis-title">5-Stage CPU Pipeline</div>
    <div class="vis-desc">Watch instructions flow through the pipeline. Click "Step" to advance one clock cycle, or "Run" for continuous execution.</div>
    <div class="pipe-vis">
      <div class="pipe-grid" id="pipe-grid"></div>
      <div class="pipe-legend">
        <span class="pipe-legend-item"><span class="pipe-dot" style="background:var(--hw)"></span> Active</span>
        <span class="pipe-legend-item"><span class="pipe-dot" style="background:var(--border)"></span> Empty</span>
        <span class="pipe-legend-item"><span class="pipe-dot" style="background:#ef4444"></span> Stall</span>
      </div>
      <div class="pipe-controls">
        <button id="pipe-step" class="pipe-btn">Step</button>
        <button id="pipe-run" class="pipe-btn">Run</button>
        <button id="pipe-reset" class="pipe-btn secondary">Reset</button>
        <label class="pipe-check"><input type="checkbox" id="pipe-hazard"> Enable data hazard (stall)</label>
      </div>
      <div class="pipe-stats" id="pipe-stats">Cycle: 0 | Instructions completed: 0 | IPC: —</div>
    </div>
    <style>
      .pipe-vis { max-width: 580px; margin: 0 auto; }
      .pipe-grid {
        display: grid; gap: 2px; margin-bottom: 12px;
        background: var(--surface); border-radius: 12px; padding: 12px;
        border: 1px solid var(--border); overflow-x: auto;
      }
      .pipe-header { font-size: 11px; font-weight: 700; color: var(--ink2); text-align: center; padding: 6px 4px; }
      .pipe-cell {
        padding: 8px 6px; text-align: center; border-radius: 6px;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        transition: all .2s; min-width: 50px;
      }
      .pipe-cell.active { background: var(--hw-soft); color: var(--hw); font-weight: 600; }
      .pipe-cell.stall { background: rgba(239,68,68,0.15); color: #ef4444; font-weight: 600; }
      .pipe-cell.empty { background: var(--bg); color: var(--ink2); }
      .pipe-instr { font-size: 11px; font-weight: 600; color: var(--ink); text-align: left; padding: 8px 6px; white-space: nowrap; }
      .pipe-legend { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
      .pipe-legend-item { font-size: 12px; color: var(--ink2); display: flex; align-items: center; gap: 4px; }
      .pipe-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
      .pipe-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
      .pipe-btn {
        padding: 6px 16px; border-radius: 8px; border: none;
        background: var(--hw); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px;
      }
      .pipe-btn:hover { opacity: .85; }
      .pipe-btn.secondary { background: var(--surface); color: var(--ink); border: 1px solid var(--border); }
      .pipe-check { font-size: 12px; color: var(--ink2); display: flex; align-items: center; gap: 4px; cursor: pointer; }
      .pipe-check input { accent-color: var(--hw); }
      .pipe-stats { font-size: 12px; color: var(--ink2); font-family: 'JetBrains Mono', monospace; }
    </style>
  `;

  const stageNames = ['IF', 'ID', 'EX', 'MEM', 'WB'];
  const instructions = [
    'ADD R1, R2, R3',
    'SUB R4, R1, R5',
    'LDR R6, [R4]',
    'AND R7, R6, R8',
    'STR R7, [R9]',
    'ORR R10, R2, R3',
    'MUL R11, R10, R1',
    'CMP R11, R4',
  ];

  let cycle = 0;
  let completed = 0;
  let running = false;
  let runInterval = null;

  function getGrid(hazardEnabled) {
    const grid = [];
    const maxCycles = cycle + 1;
    let stallOffset = 0;

    for (let i = 0; i < Math.min(instructions.length, cycle + 1); i++) {
      const row = [];
      let localStall = 0;

      if (hazardEnabled && i === 1) {
        localStall = 2;
      }

      for (let c = 0; c < maxCycles; c++) {
        const stageIdx = c - i - stallOffset;
        if (hazardEnabled && i >= 1 && i === 1) {
          const adjustedStage = c - i;
          if (adjustedStage >= 0 && adjustedStage < localStall) {
            row.push({ stage: 'STALL', stall: true });
            continue;
          }
          const finalStage = adjustedStage - localStall;
          if (finalStage >= 0 && finalStage < 5) {
            row.push({ stage: stageNames[finalStage], active: true });
          } else {
            row.push({ stage: '', empty: true });
          }
        } else {
          const offset = hazardEnabled && i > 1 ? 2 : 0;
          const adjustedStage = c - i - offset;
          if (adjustedStage >= 0 && adjustedStage < 5) {
            row.push({ stage: stageNames[adjustedStage], active: true });
          } else {
            row.push({ stage: '', empty: true });
          }
        }
      }
      grid.push({ instr: instructions[i], cells: row });
    }
    return grid;
  }

  function render() {
    const hazardEnabled = container.querySelector('#pipe-hazard').checked;
    const gridEl = container.querySelector('#pipe-grid');
    const maxCols = Math.min(cycle + 1, 12);
    const startCol = Math.max(0, cycle + 1 - 12);

    let html = `<div style="display:grid;grid-template-columns:120px repeat(${maxCols}, 1fr);gap:2px">`;
    html += '<div class="pipe-header"></div>';
    for (let c = startCol; c < startCol + maxCols; c++) {
      html += `<div class="pipe-header">C${c}</div>`;
    }

    const grid = getGrid(hazardEnabled);
    completed = 0;
    for (const row of grid) {
      html += `<div class="pipe-instr">${row.instr}</div>`;
      const visibleCells = row.cells.slice(startCol, startCol + maxCols);
      for (const cell of visibleCells) {
        if (cell.stall) {
          html += '<div class="pipe-cell stall">STALL</div>';
        } else if (cell.active) {
          html += `<div class="pipe-cell active">${cell.stage}</div>`;
          if (cell.stage === 'WB') completed++;
        } else {
          html += '<div class="pipe-cell empty">—</div>';
        }
      }
      for (let pad = visibleCells.length; pad < maxCols; pad++) {
        html += '<div class="pipe-cell empty">—</div>';
      }
    }
    html += '</div>';
    gridEl.innerHTML = html;

    const ipc = cycle > 0 ? (completed / (cycle)).toFixed(2) : '—';
    container.querySelector('#pipe-stats').textContent = `Cycle: ${cycle} | Instructions completed: ${completed} | IPC: ${ipc}`;
  }

  container.querySelector('#pipe-step').addEventListener('click', () => {
    if (cycle < 20) { cycle++; render(); }
  });

  container.querySelector('#pipe-run').addEventListener('click', () => {
    if (running) {
      clearInterval(runInterval);
      running = false;
      container.querySelector('#pipe-run').textContent = 'Run';
      return;
    }
    running = true;
    container.querySelector('#pipe-run').textContent = 'Pause';
    runInterval = setInterval(() => {
      if (cycle >= 20) { clearInterval(runInterval); running = false; container.querySelector('#pipe-run').textContent = 'Run'; return; }
      cycle++;
      render();
    }, 400);
  });

  container.querySelector('#pipe-reset').addEventListener('click', () => {
    clearInterval(runInterval);
    running = false;
    cycle = 0;
    container.querySelector('#pipe-run').textContent = 'Run';
    render();
  });

  container.querySelector('#pipe-hazard').addEventListener('change', render);

  render();
});
