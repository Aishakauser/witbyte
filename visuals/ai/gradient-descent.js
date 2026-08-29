// Interactive Gradient Descent Visualizer — ai-15 Math & ML Foundations
import { registerVisual } from '../../js/visuals.js';

registerVisual('ai-15', function(container) {
  container.innerHTML = `
    <div class="vis-title">Gradient Descent Explorer</div>
    <div class="vis-desc">Watch gradient descent find the minimum of a loss function. Adjust the learning rate and see how it affects convergence.</div>
    <div class="gd-vis">
      <div class="gd-controls">
        <label>Learning rate: <input type="range" id="gd-lr" min="0.01" max="0.5" step="0.01" value="0.1"><span id="gd-lr-val">0.10</span></label>
        <label>Start X: <input type="range" id="gd-start" min="-4" max="4" step="0.5" value="3.5"><span id="gd-start-val">3.5</span></label>
        <div class="gd-btn-group">
          <button id="gd-run" class="gd-btn">Run Descent</button>
          <button id="gd-step" class="gd-btn secondary">Step</button>
          <button id="gd-reset" class="gd-btn secondary">Reset</button>
        </div>
      </div>
      <div class="gd-canvas-wrap">
        <canvas id="gd-canvas" width="560" height="280"></canvas>
      </div>
      <div class="gd-info" id="gd-info">Step: 0 | x = 3.50 | Loss = —</div>
    </div>
    <style>
      .gd-vis { max-width: 580px; margin: 0 auto; }
      .gd-controls { margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
      .gd-controls label {
        font-size: 12px; color: var(--ink); display: flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', monospace;
      }
      .gd-controls input[type=range] { width: 90px; accent-color: var(--ai); }
      .gd-controls span { width: 32px; font-weight: 600; color: var(--ai); }
      .gd-btn-group { display: flex; gap: 6px; }
      .gd-btn {
        padding: 6px 14px; border-radius: 8px; border: none;
        background: var(--ai); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 12px;
      }
      .gd-btn:hover { opacity: .85; }
      .gd-btn:disabled { opacity: .4; }
      .gd-btn.secondary { background: var(--surface); color: var(--ink); border: 1px solid var(--border); }
      .gd-canvas-wrap {
        background: var(--surface); border-radius: 12px; padding: 12px;
        border: 1px solid var(--border); margin-bottom: 8px; overflow-x: auto;
      }
      #gd-canvas { width: 100%; height: auto; display: block; }
      .gd-info {
        font-size: 12px; color: var(--ink2); font-family: 'JetBrains Mono', monospace;
      }
    </style>
  `;

  const canvas = container.querySelector('#gd-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function loss(x) { return 0.1 * x * x * x * x - 0.5 * x * x + 0.3 * x + 2; }
  function dLoss(x) { return 0.4 * x * x * x - x + 0.3; }

  const xMin = -4.5, xMax = 4.5;
  const yMin = -1, yMax = 8;

  function toCanvas(x, y) {
    return [
      40 + (x - xMin) / (xMax - xMin) * (W - 60),
      H - 30 - (y - yMin) / (yMax - yMin) * (H - 50)
    ];
  }

  let path = [];
  let currentX;
  let step = 0;
  let running = false;
  let runInterval = null;

  function resetState() {
    clearInterval(runInterval);
    running = false;
    container.querySelector('#gd-run').textContent = 'Run Descent';
    currentX = parseFloat(container.querySelector('#gd-start').value);
    path = [currentX];
    step = 0;
    draw();
  }

  function draw() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const ink = isDark ? '#e6e4ea' : '#1c1b22';
    const ink2 = isDark ? '#8b8894' : '#6b6873';
    const aiColor = '#a78bfa';

    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = ink2;
    ctx.lineWidth = 1;
    const [axX0] = toCanvas(xMin, 0);
    const [axX1] = toCanvas(xMax, 0);
    const [, axY0] = toCanvas(0, yMin);
    const [, axY1] = toCanvas(0, yMax);

    ctx.beginPath();
    ctx.moveTo(40, axY0);
    ctx.lineTo(40, axY1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(axX0, H - 30);
    ctx.lineTo(axX1, H - 30);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = ink2;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let x = -4; x <= 4; x += 2) {
      const [cx] = toCanvas(x, 0);
      ctx.fillText(x.toString(), cx, H - 16);
    }
    ctx.textAlign = 'right';
    for (let y = 0; y <= 7; y += 2) {
      const [, cy] = toCanvas(0, y);
      ctx.fillText(y.toString(), 34, cy + 4);
    }

    // Loss curve
    ctx.beginPath();
    ctx.strokeStyle = ink2;
    ctx.lineWidth = 2;
    for (let px = 40; px < W - 20; px++) {
      const x = xMin + (px - 40) / (W - 60) * (xMax - xMin);
      const y = loss(x);
      const [cx, cy] = toCanvas(x, y);
      if (px === 40) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = ink2;
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('L(x) = 0.1x⁴ - 0.5x² + 0.3x + 2', 50, 20);

    // Path
    if (path.length > 1) {
      ctx.strokeStyle = aiColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const [cx, cy] = toCanvas(path[i], loss(path[i]));
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw all visited points
    for (let i = 0; i < path.length; i++) {
      const [cx, cy] = toCanvas(path[i], loss(path[i]));
      ctx.beginPath();
      ctx.arc(cx, cy, i === path.length - 1 ? 7 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === path.length - 1 ? aiColor : `rgba(167,139,250,0.4)`;
      ctx.fill();
    }

    // Current point label
    const [cx, cy] = toCanvas(currentX, loss(currentX));
    ctx.fillStyle = ink;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`(${currentX.toFixed(2)}, ${loss(currentX).toFixed(2)})`, cx, cy - 14);

    // Gradient arrow
    if (step > 0) {
      const grad = dLoss(currentX);
      const arrowLen = Math.min(Math.abs(grad) * 30, 60);
      const dir = grad > 0 ? -1 : 1;
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dir * arrowLen, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = '#ef4444';
      ctx.moveTo(cx + dir * arrowLen, cy - 4);
      ctx.lineTo(cx + dir * (arrowLen + 6), cy);
      ctx.lineTo(cx + dir * arrowLen, cy + 4);
      ctx.fill();
    }

    container.querySelector('#gd-info').textContent = `Step: ${step} | x = ${currentX.toFixed(3)} | Loss = ${loss(currentX).toFixed(4)} | Gradient = ${dLoss(currentX).toFixed(4)}`;
    container.querySelector('#gd-lr-val').textContent = parseFloat(container.querySelector('#gd-lr').value).toFixed(2);
    container.querySelector('#gd-start-val').textContent = parseFloat(container.querySelector('#gd-start').value).toFixed(1);
  }

  function doStep() {
    const lr = parseFloat(container.querySelector('#gd-lr').value);
    const grad = dLoss(currentX);
    currentX = currentX - lr * grad;
    currentX = Math.max(xMin + 0.5, Math.min(xMax - 0.5, currentX));
    path.push(currentX);
    step++;
    draw();
  }

  container.querySelector('#gd-step').addEventListener('click', doStep);

  container.querySelector('#gd-run').addEventListener('click', () => {
    if (running) {
      clearInterval(runInterval);
      running = false;
      container.querySelector('#gd-run').textContent = 'Run Descent';
      return;
    }
    running = true;
    container.querySelector('#gd-run').textContent = 'Pause';
    runInterval = setInterval(() => {
      if (step >= 50 || Math.abs(dLoss(currentX)) < 0.001) {
        clearInterval(runInterval);
        running = false;
        container.querySelector('#gd-run').textContent = 'Run Descent';
        return;
      }
      doStep();
    }, 200);
  });

  container.querySelector('#gd-reset').addEventListener('click', resetState);
  container.querySelector('#gd-start').addEventListener('input', resetState);

  resetState();
});
