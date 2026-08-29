// Interactive REST API Request Flow — cs-04 API Design & Integration
import { registerVisual } from '../../js/visuals.js';

registerVisual('cs-04', function(container) {
  container.innerHTML = `
    <div class="vis-title">API Request/Response Explorer</div>
    <div class="vis-desc">Choose an HTTP method and endpoint to see the full request/response cycle animated step by step.</div>
    <div class="api-vis" id="api-vis">
      <div class="api-controls">
        <select id="api-method" class="api-select">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select id="api-endpoint" class="api-select">
          <option value="/users">/users</option>
          <option value="/users/42">/users/42</option>
          <option value="/posts">/posts</option>
        </select>
        <button id="api-send" class="api-send-btn">Send Request</button>
      </div>
      <div class="api-flow-area">
        <svg viewBox="0 0 600 220" class="api-svg">
          <!-- Client -->
          <rect x="20" y="60" width="120" height="100" rx="10" class="api-box client-box"/>
          <text x="80" y="105" text-anchor="middle" class="api-box-label">Client</text>
          <text x="80" y="125" text-anchor="middle" class="api-box-sub">Browser / App</text>

          <!-- Server -->
          <rect x="240" y="60" width="120" height="100" rx="10" class="api-box server-box"/>
          <text x="300" y="105" text-anchor="middle" class="api-box-label">Server</text>
          <text x="300" y="125" text-anchor="middle" class="api-box-sub">REST API</text>

          <!-- Database -->
          <rect x="460" y="60" width="120" height="100" rx="10" class="api-box db-box"/>
          <text x="520" y="105" text-anchor="middle" class="api-box-label">Database</text>
          <text x="520" y="125" text-anchor="middle" class="api-box-sub">PostgreSQL</text>

          <!-- Arrows (animated) -->
          <g id="api-arrows" style="opacity:0">
            <!-- Request arrow -->
            <line id="arrow-req" x1="140" y1="90" x2="240" y2="90" class="api-arrow req-arrow"/>
            <polygon id="arrow-req-head" points="235,85 245,90 235,95" class="api-arrowhead req-arrow"/>

            <!-- DB query arrow -->
            <line id="arrow-db" x1="360" y1="90" x2="460" y2="90" class="api-arrow db-arrow"/>
            <polygon id="arrow-db-head" points="455,85 465,90 455,95" class="api-arrowhead db-arrow"/>

            <!-- DB response arrow -->
            <line id="arrow-dbr" x1="460" y1="130" x2="360" y2="130" class="api-arrow dbr-arrow"/>
            <polygon id="arrow-dbr-head" points="365,125 355,130 365,135" class="api-arrowhead dbr-arrow"/>

            <!-- Response arrow -->
            <line id="arrow-res" x1="240" y1="130" x2="140" y2="130" class="api-arrow res-arrow"/>
            <polygon id="arrow-res-head" points="145,125 135,130 145,135" class="api-arrowhead res-arrow"/>
          </g>

          <!-- Step labels -->
          <text id="step-1" x="190" y="82" text-anchor="middle" class="step-label" style="opacity:0"></text>
          <text id="step-2" x="410" y="82" text-anchor="middle" class="step-label" style="opacity:0"></text>
          <text id="step-3" x="410" y="148" text-anchor="middle" class="step-label" style="opacity:0"></text>
          <text id="step-4" x="190" y="148" text-anchor="middle" class="step-label" style="opacity:0"></text>
        </svg>
      </div>
      <div class="api-detail" id="api-detail">
        <div class="api-req-panel" id="api-req-panel">
          <div class="panel-title">Request</div>
          <pre class="api-code" id="req-code"></pre>
        </div>
        <div class="api-res-panel" id="api-res-panel">
          <div class="panel-title">Response</div>
          <pre class="api-code" id="res-code"></pre>
        </div>
      </div>
    </div>
    <style>
      .api-vis { max-width: 620px; margin: 0 auto; }
      .api-controls { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
      .api-select {
        padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);
        background: var(--surface); color: var(--ink); font-size: 13px;
        font-family: 'JetBrains Mono', monospace;
      }
      .api-send-btn {
        padding: 8px 20px; border-radius: 8px; border: none;
        background: var(--cs); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px; transition: opacity .15s;
      }
      .api-send-btn:hover { opacity: .85; }
      .api-send-btn:disabled { opacity: .4; cursor: default; }
      .api-flow-area { background: var(--surface); border-radius: 12px; padding: 12px; border: 1px solid var(--border); margin-bottom: 12px; }
      .api-svg { width: 100%; height: auto; }
      .api-box { fill: var(--bg); stroke: var(--border); stroke-width: 1.5; }
      .api-box-label { font-size: 14px; font-weight: 700; fill: var(--ink); font-family: 'DM Sans', sans-serif; }
      .api-box-sub { font-size: 11px; fill: var(--ink2); font-family: 'DM Sans', sans-serif; }
      .api-arrow { stroke: var(--cs); stroke-width: 2; stroke-dasharray: 100; stroke-dashoffset: 100; }
      .api-arrowhead { fill: var(--cs); opacity: 0; }
      .api-arrow.animate { transition: stroke-dashoffset .5s ease-out; stroke-dashoffset: 0; }
      .api-arrowhead.animate { transition: opacity .2s; opacity: 1; }
      .step-label { font-size: 11px; fill: var(--cs); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
      .api-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 500px) { .api-detail { grid-template-columns: 1fr; } }
      .api-req-panel, .api-res-panel {
        background: var(--surface); border-radius: 10px; padding: 12px; border: 1px solid var(--border);
        min-height: 80px;
      }
      .panel-title { font-size: 11px; font-weight: 700; color: var(--ink2); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
      .api-code {
        font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink);
        white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.5;
      }
      .client-box.active { stroke: var(--cs); stroke-width: 2.5; }
      .server-box.active { stroke: var(--cs); stroke-width: 2.5; }
      .db-box.active { stroke: var(--cs); stroke-width: 2.5; }
    </style>
  `;

  const responses = {
    'GET /users': { status: 200, statusText: 'OK', body: '[\n  {"id":1,"name":"Ada"},\n  {"id":2,"name":"Grace"}\n]', dbQuery: 'SELECT * FROM users' },
    'GET /users/42': { status: 200, statusText: 'OK', body: '{"id":42,"name":"Linus","email":"l@kernel.org"}', dbQuery: 'SELECT * FROM users WHERE id=42' },
    'GET /posts': { status: 200, statusText: 'OK', body: '[\n  {"id":1,"title":"Hello World"}\n]', dbQuery: 'SELECT * FROM posts' },
    'POST /users': { status: 201, statusText: 'Created', body: '{"id":3,"name":"Alan"}', dbQuery: "INSERT INTO users (name) VALUES ('Alan')" },
    'POST /users/42': { status: 405, statusText: 'Method Not Allowed', body: '{"error":"Cannot POST to a specific user"}', dbQuery: null },
    'POST /posts': { status: 201, statusText: 'Created', body: '{"id":2,"title":"New Post"}', dbQuery: "INSERT INTO posts (title) VALUES ('New Post')" },
    'PUT /users': { status: 400, statusText: 'Bad Request', body: '{"error":"PUT requires a resource ID"}', dbQuery: null },
    'PUT /users/42': { status: 200, statusText: 'OK', body: '{"id":42,"name":"Linus T."}', dbQuery: "UPDATE users SET name='Linus T.' WHERE id=42" },
    'PUT /posts': { status: 400, statusText: 'Bad Request', body: '{"error":"PUT requires a resource ID"}', dbQuery: null },
    'DELETE /users': { status: 400, statusText: 'Bad Request', body: '{"error":"DELETE requires a resource ID"}', dbQuery: null },
    'DELETE /users/42': { status: 204, statusText: 'No Content', body: '', dbQuery: 'DELETE FROM users WHERE id=42' },
    'DELETE /posts': { status: 400, statusText: 'Bad Request', body: '{"error":"DELETE requires a resource ID"}', dbQuery: null },
  };

  const sendBtn = container.querySelector('#api-send');
  let animating = false;

  function resetArrows() {
    container.querySelectorAll('.api-arrow, .api-arrowhead').forEach(el => el.classList.remove('animate'));
    container.querySelectorAll('.api-arrow').forEach(el => { el.style.strokeDashoffset = '100'; });
    container.querySelectorAll('.api-arrowhead').forEach(el => { el.style.opacity = '0'; });
    container.querySelectorAll('.step-label').forEach(el => { el.style.opacity = '0'; });
    container.querySelectorAll('.api-box').forEach(el => el.classList.remove('active'));
    container.querySelector('#api-arrows').style.opacity = '1';
  }

  function animateStep(arrowId, headId, stepId, stepText, boxClass) {
    return new Promise(resolve => {
      const arrow = container.querySelector(`#${arrowId}`);
      const head = container.querySelector(`#${headId}`);
      const step = container.querySelector(`#${stepId}`);
      if (boxClass) container.querySelector(`.${boxClass}`).classList.add('active');
      step.textContent = stepText;
      step.style.opacity = '1';
      arrow.style.strokeDashoffset = '0';
      arrow.style.transition = 'stroke-dashoffset .4s ease-out';
      setTimeout(() => { head.style.opacity = '1'; head.style.transition = 'opacity .15s'; }, 350);
      setTimeout(resolve, 500);
    });
  }

  sendBtn.addEventListener('click', async () => {
    if (animating) return;
    animating = true;
    sendBtn.disabled = true;

    const method = container.querySelector('#api-method').value;
    const endpoint = container.querySelector('#api-endpoint').value;
    const key = `${method} ${endpoint}`;
    const resp = responses[key] || { status: 500, statusText: 'Error', body: '{}', dbQuery: null };

    container.querySelector('#req-code').textContent = `${method} ${endpoint} HTTP/1.1\nHost: api.example.com\nContent-Type: application/json`;
    container.querySelector('#res-code').textContent = '';

    resetArrows();

    // Step 1: Client -> Server
    await animateStep('arrow-req', 'arrow-req-head', 'step-1', `${method} ${endpoint}`, 'client-box');

    if (resp.dbQuery) {
      // Step 2: Server -> DB
      await animateStep('arrow-db', 'arrow-db-head', 'step-2', resp.dbQuery.substring(0, 25), 'server-box');

      // Step 3: DB -> Server
      await animateStep('arrow-dbr', 'arrow-dbr-head', 'step-3', 'rows', 'db-box');
    } else {
      container.querySelector('.server-box').classList.add('active');
      await new Promise(r => setTimeout(r, 300));
    }

    // Step 4: Server -> Client
    await animateStep('arrow-res', 'arrow-res-head', 'step-4', `${resp.status}`, 'server-box');

    container.querySelector('#res-code').textContent = `HTTP/1.1 ${resp.status} ${resp.statusText}\nContent-Type: application/json\n\n${resp.body}`;

    setTimeout(() => { animating = false; sendBtn.disabled = false; }, 200);
  });
});
