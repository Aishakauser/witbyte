// Interactive Logic Gate Simulator — hw-01 Digital Logic Fundamentals
import { registerVisual } from '../../js/visuals.js';

registerVisual('hw-01', function(container) {
  container.innerHTML = `
    <div class="vis-title">Logic Gate Simulator</div>
    <div class="vis-desc">Toggle inputs to see how each gate processes signals. Click the input circles to flip between 0 and 1.</div>
    <div class="gate-sim" id="gate-sim">
      <div class="gate-selector">
        <button class="gate-btn active" data-gate="AND">AND</button>
        <button class="gate-btn" data-gate="OR">OR</button>
        <button class="gate-btn" data-gate="XOR">XOR</button>
        <button class="gate-btn" data-gate="NAND">NAND</button>
        <button class="gate-btn" data-gate="NOR">NOR</button>
        <button class="gate-btn" data-gate="NOT">NOT</button>
      </div>
      <div class="gate-canvas">
        <svg viewBox="0 0 400 200" class="gate-svg">
          <!-- Input lines -->
          <line class="wire wire-a" x1="40" y1="70" x2="120" y2="70" />
          <line class="wire wire-b" x1="40" y1="130" x2="120" y2="130" />
          <!-- Output line -->
          <line class="wire wire-out" x1="280" y1="100" x2="360" y2="100" />

          <!-- Gate body (drawn by JS) -->
          <g id="gate-shape"></g>

          <!-- Input toggles -->
          <circle class="input-toggle" id="inputA" cx="40" cy="70" r="16" />
          <text class="input-label" id="labelA" x="40" y="75" text-anchor="middle">0</text>
          <circle class="input-toggle" id="inputB" cx="40" cy="130" r="16" />
          <text class="input-label" id="labelB" x="40" y="135" text-anchor="middle">0</text>

          <!-- Output display -->
          <circle class="output-display" id="outputCircle" cx="360" cy="100" r="16" />
          <text class="output-label" id="outputLabel" x="360" y="105" text-anchor="middle">0</text>

          <!-- Labels -->
          <text class="port-label" x="40" y="45">A</text>
          <text class="port-label" id="portB" x="40" y="160">B</text>
          <text class="port-label" x="360" y="80">Out</text>
        </svg>
      </div>
      <div class="truth-table" id="truth-table"></div>
    </div>
    <style>
      .gate-sim { max-width: 500px; margin: 0 auto; }
      .gate-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; justify-content: center; }
      .gate-btn {
        padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border);
        background: var(--surface); color: var(--ink); cursor: pointer;
        font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
        transition: all .15s;
      }
      .gate-btn:hover { border-color: var(--hw); }
      .gate-btn.active { background: var(--hw); color: #fff; border-color: var(--hw); }
      .gate-canvas { background: var(--surface); border-radius: 12px; padding: 16px; border: 1px solid var(--border); }
      .gate-svg { width: 100%; height: auto; }
      .wire { stroke: var(--ink2); stroke-width: 2; transition: stroke .2s; }
      .wire.on { stroke: var(--hw); stroke-width: 2.5; }
      .input-toggle { fill: var(--surface); stroke: var(--ink2); stroke-width: 2; cursor: pointer; transition: all .15s; }
      .input-toggle.on { fill: var(--hw); stroke: var(--hw); }
      .input-label, .output-label { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; fill: var(--ink); pointer-events: none; }
      .input-toggle.on + .input-label { fill: #fff; }
      .output-display { fill: var(--surface); stroke: var(--ink2); stroke-width: 2; transition: all .2s; }
      .output-display.on { fill: var(--hw); stroke: var(--hw); }
      .output-display.on + .output-label { fill: #fff; }
      .port-label { font-size: 12px; fill: var(--ink2); text-anchor: middle; font-family: 'DM Sans', sans-serif; }
      #gate-shape path, #gate-shape rect, #gate-shape circle, #gate-shape line {
        fill: none; stroke: var(--ink); stroke-width: 2; transition: stroke .2s;
      }
      .truth-table { margin-top: 16px; }
      .truth-table table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
      .truth-table th { padding: 6px 12px; background: var(--surface); color: var(--ink2); border-bottom: 1px solid var(--border); font-weight: 600; text-align: center; }
      .truth-table td { padding: 6px 12px; text-align: center; border-bottom: 1px solid var(--border); color: var(--ink); }
      .truth-table tr.active-row { background: var(--hw-soft); }
      .truth-table td.out-1 { color: var(--hw); font-weight: 700; }
    </style>
  `;

  let inputA = 0, inputB = 0, currentGate = 'AND';

  const gates = {
    AND:  (a,b) => a & b,
    OR:   (a,b) => a | b,
    XOR:  (a,b) => a ^ b,
    NAND: (a,b) => (a & b) ? 0 : 1,
    NOR:  (a,b) => (a | b) ? 0 : 1,
    NOT:  (a)   => a ? 0 : 1,
  };

  const shapes = {
    AND:  '<path d="M120,50 L180,50 Q250,50 250,100 Q250,150 180,150 L120,150 Z"/>',
    OR:   '<path d="M120,50 Q160,100 120,150 Q200,150 250,100 Q200,50 120,50 Z"/>',
    XOR:  '<path d="M120,50 Q160,100 120,150 Q200,150 250,100 Q200,50 120,50 Z"/><path d="M110,50 Q150,100 110,150" fill="none"/>',
    NAND: '<path d="M120,50 L180,50 Q240,50 240,100 Q240,150 180,150 L120,150 Z"/><circle cx="258" cy="100" r="10"/>',
    NOR:  '<path d="M120,50 Q160,100 120,150 Q200,150 240,100 Q200,50 120,50 Z"/><circle cx="258" cy="100" r="10"/>',
    NOT:  '<path d="M120,60 L230,100 L120,140 Z"/><circle cx="245" cy="100" r="10"/>',
  };

  function update() {
    const fn = gates[currentGate];
    const isNot = currentGate === 'NOT';
    const out = isNot ? fn(inputA) : fn(inputA, inputB);

    container.querySelector('#inputA').classList.toggle('on', !!inputA);
    container.querySelector('#labelA').textContent = inputA;
    container.querySelector('#inputB').classList.toggle('on', !!inputB);
    container.querySelector('#labelB').textContent = inputB;
    container.querySelector('#outputCircle').classList.toggle('on', !!out);
    container.querySelector('#outputLabel').textContent = out;
    container.querySelector('#gate-shape').innerHTML = shapes[currentGate];

    container.querySelector('.wire-a').classList.toggle('on', !!inputA);
    container.querySelector('.wire-b').classList.toggle('on', !!inputB);
    container.querySelector('.wire-out').classList.toggle('on', !!out);

    // Hide input B for NOT gate
    container.querySelector('#inputB').style.display = isNot ? 'none' : '';
    container.querySelector('#labelB').style.display = isNot ? 'none' : '';
    container.querySelector('.wire-b').style.display = isNot ? 'none' : '';
    container.querySelector('#portB').style.display = isNot ? 'none' : '';

    // Update truth table
    let html = '<table><tr><th>A</th>';
    if (!isNot) html += '<th>B</th>';
    html += '<th>Out</th></tr>';

    const rows = isNot ? [[0],[1]] : [[0,0],[0,1],[1,0],[1,1]];
    for (const row of rows) {
      const r = isNot ? fn(row[0]) : fn(row[0], row[1]);
      const active = isNot ? (row[0] === inputA) : (row[0] === inputA && row[1] === inputB);
      html += `<tr class="${active ? 'active-row' : ''}"><td>${row[0]}</td>`;
      if (!isNot) html += `<td>${row[1]}</td>`;
      html += `<td class="${r ? 'out-1' : ''}">${r}</td></tr>`;
    }
    html += '</table>';
    container.querySelector('#truth-table').innerHTML = html;
  }

  container.querySelector('#inputA').addEventListener('click', () => { inputA = inputA ? 0 : 1; update(); });
  container.querySelector('#inputB').addEventListener('click', () => { inputB = inputB ? 0 : 1; update(); });

  container.querySelectorAll('.gate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGate = btn.dataset.gate;
      update();
    });
  });

  update();
});
