// Interactive Neural Network Visualizer — ai-16 Neural Networks & PyTorch
import { registerVisual } from '../../js/visuals.js';

registerVisual('ai-16', function(container) {
  container.innerHTML = `
    <div class="vis-title">Neural Network Forward Pass</div>
    <div class="vis-desc">Adjust the input values and watch activations propagate through the network. Weights are randomized — click "Randomize" to see different behaviors.</div>
    <div class="nn-vis" id="nn-vis">
      <div class="nn-controls">
        <div class="nn-input-group">
          <label>Input 1: <input type="range" id="nn-in1" min="0" max="1" step="0.1" value="0.5"><span id="nn-in1-val">0.5</span></label>
          <label>Input 2: <input type="range" id="nn-in2" min="0" max="1" step="0.1" value="0.8"><span id="nn-in2-val">0.8</span></label>
          <label>Input 3: <input type="range" id="nn-in3" min="0" max="1" step="0.1" value="0.2"><span id="nn-in3-val">0.2</span></label>
        </div>
        <div class="nn-btn-group">
          <button id="nn-randomize" class="nn-btn">Randomize Weights</button>
          <select id="nn-activation" class="nn-select">
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="tanh">Tanh</option>
          </select>
        </div>
      </div>
      <div class="nn-canvas-wrap">
        <canvas id="nn-canvas" width="560" height="300"></canvas>
      </div>
      <div class="nn-info" id="nn-info">
        <div class="nn-formula" id="nn-formula"></div>
      </div>
    </div>
    <style>
      .nn-vis { max-width: 580px; margin: 0 auto; }
      .nn-controls { margin-bottom: 12px; }
      .nn-input-group { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
      .nn-input-group label {
        font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', monospace;
      }
      .nn-input-group input[type=range] { width: 80px; accent-color: var(--ai); }
      .nn-input-group span { width: 28px; text-align: right; font-weight: 600; color: var(--ai); }
      .nn-btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
      .nn-btn {
        padding: 6px 16px; border-radius: 8px; border: none;
        background: var(--ai); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px;
      }
      .nn-btn:hover { opacity: .85; }
      .nn-select {
        padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);
        background: var(--surface); color: var(--ink); font-size: 13px;
      }
      .nn-canvas-wrap {
        background: var(--surface); border-radius: 12px; padding: 12px;
        border: 1px solid var(--border); margin-bottom: 12px; overflow-x: auto;
      }
      #nn-canvas { width: 100%; height: auto; display: block; }
      .nn-info { font-size: 12px; color: var(--ink2); }
      .nn-formula {
        font-family: 'JetBrains Mono', monospace; padding: 10px;
        background: var(--surface); border-radius: 8px; border: 1px solid var(--border);
        line-height: 1.6; overflow-x: auto;
      }
    </style>
  `;

  const canvas = container.querySelector('#nn-canvas');
  const ctx = canvas.getContext('2d');
  const layers = [3, 4, 4, 2];
  let weights = [];
  let biases = [];

  function randWeight() { return (Math.random() * 2 - 1) * 0.8; }

  function initWeights() {
    weights = [];
    biases = [];
    for (let l = 1; l < layers.length; l++) {
      const w = [];
      const b = [];
      for (let j = 0; j < layers[l]; j++) {
        const wj = [];
        for (let i = 0; i < layers[l-1]; i++) {
          wj.push(randWeight());
        }
        w.push(wj);
        b.push(randWeight() * 0.3);
      }
      weights.push(w);
      biases.push(b);
    }
  }

  function activate(x, fn) {
    switch(fn) {
      case 'relu': return Math.max(0, x);
      case 'sigmoid': return 1 / (1 + Math.exp(-x));
      case 'tanh': return Math.tanh(x);
      default: return Math.max(0, x);
    }
  }

  function forward(inputs, actFn) {
    const activations = [inputs];
    let current = inputs;
    for (let l = 0; l < weights.length; l++) {
      const next = [];
      for (let j = 0; j < weights[l].length; j++) {
        let sum = biases[l][j];
        for (let i = 0; i < current.length; i++) {
          sum += current[i] * weights[l][j][i];
        }
        next.push(l === weights.length - 1 ? activate(sum, 'sigmoid') : activate(sum, actFn));
      }
      activations.push(next);
      current = next;
    }
    return activations;
  }

  function getComputedStyle2(prop) {
    return getComputedStyle(container).getPropertyValue(prop).trim();
  }

  function draw() {
    const in1 = parseFloat(container.querySelector('#nn-in1').value);
    const in2 = parseFloat(container.querySelector('#nn-in2').value);
    const in3 = parseFloat(container.querySelector('#nn-in3').value);
    const actFn = container.querySelector('#nn-activation').value;

    container.querySelector('#nn-in1-val').textContent = in1.toFixed(1);
    container.querySelector('#nn-in2-val').textContent = in2.toFixed(1);
    container.querySelector('#nn-in3-val').textContent = in3.toFixed(1);

    const activations = forward([in1, in2, in3], actFn);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const inkColor = isDark ? '#e6e4ea' : '#1c1b22';
    const ink2Color = isDark ? '#8b8894' : '#6b6873';
    const aiColor = '#a78bfa';
    const surfaceColor = isDark ? '#24222a' : '#f5f4f8';

    const layerX = layers.map((_, i) => 60 + i * ((w - 120) / (layers.length - 1)));
    const positions = layers.map((n, l) => {
      const positions = [];
      const totalH = (n - 1) * 55;
      const startY = (h - totalH) / 2;
      for (let i = 0; i < n; i++) {
        positions.push({ x: layerX[l], y: startY + i * 55 });
      }
      return positions;
    });

    // Draw connections
    for (let l = 0; l < layers.length - 1; l++) {
      for (let j = 0; j < layers[l+1]; j++) {
        for (let i = 0; i < layers[l]; i++) {
          const from = positions[l][i];
          const to = positions[l+1][j];
          const w_val = weights[l][j][i];
          const strength = Math.abs(w_val);

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = w_val > 0 ? `rgba(167,139,250,${0.15 + strength * 0.6})` : `rgba(239,68,68,${0.15 + strength * 0.6})`;
          ctx.lineWidth = 0.5 + strength * 2;
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    const layerLabels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
    for (let l = 0; l < layers.length; l++) {
      ctx.fillStyle = ink2Color;
      ctx.font = '11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layerLabels[l], layerX[l], 20);

      for (let i = 0; i < layers[l]; i++) {
        const { x, y } = positions[l][i];
        const val = activations[l][i];
        const radius = 16;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        const alpha = 0.3 + Math.min(Math.abs(val), 1) * 0.7;
        ctx.fillStyle = `rgba(167,139,250,${alpha})`;
        ctx.fill();
        ctx.strokeStyle = aiColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = inkColor;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val.toFixed(2), x, y);
      }
    }

    // Update formula display
    const out = activations[activations.length - 1];
    const formulaEl = container.querySelector('#nn-formula');
    formulaEl.textContent = `Activation: ${actFn.toUpperCase()} | Output: [${out.map(v => v.toFixed(3)).join(', ')}]`;
  }

  initWeights();

  container.querySelectorAll('input[type=range]').forEach(el => {
    el.addEventListener('input', draw);
  });
  container.querySelector('#nn-activation').addEventListener('change', draw);
  container.querySelector('#nn-randomize').addEventListener('click', () => { initWeights(); draw(); });

  draw();
});
