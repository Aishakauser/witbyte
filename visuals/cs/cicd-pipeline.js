// Interactive CI/CD Pipeline Visualizer — cs-09 DevOps & CI/CD
import { registerVisual } from '../../js/visuals.js';

registerVisual('cs-09', function(container) {
  container.innerHTML = `
    <div class="vis-title">CI/CD Pipeline Simulator</div>
    <div class="vis-desc">Push a commit and watch it flow through the pipeline stages. Toggle failures to see how the pipeline handles them.</div>
    <div class="cicd-vis">
      <div class="cicd-controls">
        <button id="cicd-push" class="cicd-btn">git push</button>
        <label class="cicd-toggle"><input type="checkbox" id="cicd-fail-test"> Fail tests</label>
        <label class="cicd-toggle"><input type="checkbox" id="cicd-fail-build"> Fail build</label>
      </div>
      <div class="cicd-stages" id="cicd-stages">
        <div class="cicd-stage" id="cicd-checkout" data-stage="checkout">
          <div class="cicd-icon">📥</div>
          <div class="cicd-stage-name">Checkout</div>
          <div class="cicd-status" id="cicd-checkout-status">waiting</div>
        </div>
        <div class="cicd-arrow">→</div>
        <div class="cicd-stage" id="cicd-build" data-stage="build">
          <div class="cicd-icon">🔨</div>
          <div class="cicd-stage-name">Build</div>
          <div class="cicd-status" id="cicd-build-status">waiting</div>
        </div>
        <div class="cicd-arrow">→</div>
        <div class="cicd-stage" id="cicd-test" data-stage="test">
          <div class="cicd-icon">🧪</div>
          <div class="cicd-stage-name">Test</div>
          <div class="cicd-status" id="cicd-test-status">waiting</div>
        </div>
        <div class="cicd-arrow">→</div>
        <div class="cicd-stage" id="cicd-deploy" data-stage="deploy">
          <div class="cicd-icon">🚀</div>
          <div class="cicd-stage-name">Deploy</div>
          <div class="cicd-status" id="cicd-deploy-status">waiting</div>
        </div>
      </div>
      <div class="cicd-log" id="cicd-log"></div>
    </div>
    <style>
      .cicd-vis { max-width: 580px; margin: 0 auto; }
      .cicd-controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
      .cicd-btn {
        padding: 8px 20px; border-radius: 8px; border: none;
        background: var(--cs); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px; font-family: 'JetBrains Mono', monospace;
      }
      .cicd-btn:hover { opacity: .85; }
      .cicd-btn:disabled { opacity: .4; cursor: default; }
      .cicd-toggle { font-size: 12px; color: var(--ink2); display: flex; align-items: center; gap: 4px; cursor: pointer; }
      .cicd-toggle input { accent-color: #ef4444; }
      .cicd-stages {
        display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        background: var(--surface); border-radius: 12px; padding: 16px;
        border: 1px solid var(--border); flex-wrap: wrap; justify-content: center;
      }
      .cicd-arrow { color: var(--ink2); font-size: 18px; }
      .cicd-stage {
        text-align: center; padding: 12px 16px; border-radius: 10px;
        border: 2px solid var(--border); min-width: 80px; transition: all .3s;
      }
      .cicd-stage.running { border-color: var(--cs); animation: cicdPulse 1s infinite; }
      .cicd-stage.pass { border-color: #22c55e; background: rgba(34,197,94,0.1); }
      .cicd-stage.fail { border-color: #ef4444; background: rgba(239,68,68,0.1); }
      .cicd-stage.skip { opacity: .4; }
      @keyframes cicdPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 0 6px rgba(99,102,241,0); } }
      .cicd-icon { font-size: 24px; margin-bottom: 4px; }
      .cicd-stage-name { font-size: 12px; font-weight: 700; color: var(--ink); }
      .cicd-status { font-size: 10px; color: var(--ink2); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
      .cicd-log {
        background: var(--bg); border-radius: 10px; padding: 12px;
        border: 1px solid var(--border); font-family: 'JetBrains Mono', monospace;
        font-size: 11px; max-height: 180px; overflow-y: auto; line-height: 1.7;
      }
      .cicd-log .log-ok { color: #22c55e; }
      .cicd-log .log-err { color: #ef4444; }
      .cicd-log .log-info { color: var(--cs); }
      .cicd-log .log-dim { color: var(--ink2); }
    </style>
  `;

  const stages = ['checkout', 'build', 'test', 'deploy'];
  let animating = false;

  function log(msg, cls) {
    const logEl = container.querySelector('#cicd-log');
    logEl.innerHTML += `<div class="${cls || 'log-dim'}">${msg}</div>`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function resetStages() {
    for (const s of stages) {
      const el = container.querySelector(`#cicd-${s}`);
      el.className = 'cicd-stage';
      container.querySelector(`#cicd-${s}-status`).textContent = 'waiting';
    }
    container.querySelector('#cicd-log').innerHTML = '';
  }

  async function runStage(name, duration, shouldFail) {
    const el = container.querySelector(`#cicd-${name}`);
    const statusEl = container.querySelector(`#cicd-${name}-status`);
    el.className = 'cicd-stage running';
    statusEl.textContent = 'running...';
    log(`▶ ${name} starting...`, 'log-info');

    await new Promise(r => setTimeout(r, duration));

    if (shouldFail) {
      el.className = 'cicd-stage fail';
      statusEl.textContent = 'FAILED';
      return false;
    }
    el.className = 'cicd-stage pass';
    statusEl.textContent = 'passed';
    return true;
  }

  container.querySelector('#cicd-push').addEventListener('click', async () => {
    if (animating) return;
    animating = true;
    container.querySelector('#cicd-push').disabled = true;
    resetStages();

    const failBuild = container.querySelector('#cicd-fail-build').checked;
    const failTest = container.querySelector('#cicd-fail-test').checked;

    log('$ git push origin main', 'log-info');
    log('remote: Resolving deltas: 100% (3/3), done.', 'log-dim');
    log('Pipeline triggered by push to main', 'log-info');

    // Checkout
    if (!await runStage('checkout', 800, false)) { animating = false; return; }
    log('  Cloned repo @ abc1234', 'log-ok');

    // Build
    if (!await runStage('build', 1200, failBuild)) {
      log('  ERROR: Build failed — missing dependency', 'log-err');
      log('Pipeline FAILED at build stage', 'log-err');
      for (const s of stages.slice(2)) {
        container.querySelector(`#cicd-${s}`).className = 'cicd-stage skip';
        container.querySelector(`#cicd-${s}-status`).textContent = 'skipped';
      }
      animating = false; container.querySelector('#cicd-push').disabled = false; return;
    }
    log('  Build succeeded — 2.3s', 'log-ok');

    // Test
    if (!await runStage('test', 1500, failTest)) {
      log('  FAIL: 2 of 47 tests failed', 'log-err');
      log('  ✗ test_user_auth — expected 200, got 401', 'log-err');
      log('  ✗ test_api_rate_limit — timeout after 5s', 'log-err');
      log('Pipeline FAILED at test stage', 'log-err');
      container.querySelector('#cicd-deploy').className = 'cicd-stage skip';
      container.querySelector('#cicd-deploy-status').textContent = 'skipped';
      animating = false; container.querySelector('#cicd-push').disabled = false; return;
    }
    log('  47/47 tests passed — 4.1s', 'log-ok');

    // Deploy
    if (!await runStage('deploy', 1000, false)) { animating = false; return; }
    log('  Deployed to production — v1.2.4', 'log-ok');
    log('Pipeline PASSED ✓', 'log-ok');

    animating = false;
    container.querySelector('#cicd-push').disabled = false;
  });
});
