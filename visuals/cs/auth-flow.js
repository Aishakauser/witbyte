// Interactive OAuth 2.0 Flow — cs-06 Authentication & Authorization
import { registerVisual } from '../../js/visuals.js';

registerVisual('cs-06', function(container) {
  container.innerHTML = `
    <div class="vis-title">OAuth 2.0 Authorization Code Flow</div>
    <div class="vis-desc">Click "Login" to watch the full OAuth handshake between your app, the auth provider, and the resource server.</div>
    <div class="auth-vis">
      <div class="auth-actors">
        <div class="auth-actor" id="auth-user"><div class="auth-actor-icon">👤</div><div class="auth-actor-name">User</div></div>
        <div class="auth-actor" id="auth-app"><div class="auth-actor-icon">📱</div><div class="auth-actor-name">Your App</div></div>
        <div class="auth-actor" id="auth-provider"><div class="auth-actor-icon">🔐</div><div class="auth-actor-name">Auth Provider</div></div>
        <div class="auth-actor" id="auth-api"><div class="auth-actor-icon">🗄️</div><div class="auth-actor-name">API Server</div></div>
      </div>
      <div class="auth-steps" id="auth-steps"></div>
      <div class="auth-controls">
        <button id="auth-login" class="auth-btn">Login with OAuth</button>
        <button id="auth-reset" class="auth-btn secondary">Reset</button>
      </div>
      <div class="auth-token" id="auth-token"></div>
    </div>
    <style>
      .auth-vis { max-width: 580px; margin: 0 auto; }
      .auth-actors {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;
      }
      .auth-actor {
        text-align: center; padding: 12px 8px; border-radius: 10px;
        border: 2px solid var(--border); transition: all .3s;
      }
      .auth-actor.active { border-color: var(--cs); background: var(--cs-soft); }
      .auth-actor-icon { font-size: 24px; margin-bottom: 4px; }
      .auth-actor-name { font-size: 11px; font-weight: 600; color: var(--ink); }
      .auth-steps {
        background: var(--surface); border-radius: 12px; padding: 12px;
        border: 1px solid var(--border); margin-bottom: 12px; min-height: 160px;
      }
      .auth-step {
        display: flex; align-items: flex-start; gap: 10px; padding: 8px 0;
        border-bottom: 1px solid var(--border); opacity: 0;
        animation: authStepIn .3s forwards;
      }
      .auth-step:last-child { border-bottom: none; }
      @keyframes authStepIn { to { opacity: 1; } }
      .auth-step-num {
        width: 22px; height: 22px; border-radius: 50%; background: var(--cs);
        color: #fff; font-size: 11px; font-weight: 700; display: flex;
        align-items: center; justify-content: center; flex-shrink: 0;
      }
      .auth-step-content { flex: 1; }
      .auth-step-label { font-size: 12px; font-weight: 600; color: var(--ink); }
      .auth-step-detail { font-size: 11px; color: var(--ink2); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
      .auth-controls { display: flex; gap: 8px; margin-bottom: 8px; }
      .auth-btn {
        padding: 8px 20px; border-radius: 8px; border: none;
        background: var(--cs); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px;
      }
      .auth-btn:hover { opacity: .85; }
      .auth-btn:disabled { opacity: .4; }
      .auth-btn.secondary { background: var(--surface); color: var(--ink); border: 1px solid var(--border); }
      .auth-token {
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        color: var(--ink2); padding: 8px; background: var(--bg);
        border-radius: 8px; display: none;
      }
      .auth-token.visible { display: block; }
    </style>
  `;

  const steps = [
    { num: 1, from: 'auth-user', to: 'auth-app', label: 'User clicks "Login with Google"', detail: 'GET /login → redirect to auth provider' },
    { num: 2, from: 'auth-app', to: 'auth-provider', label: 'App redirects to Auth Provider', detail: 'GET /authorize?client_id=abc&redirect_uri=/callback&scope=profile&response_type=code' },
    { num: 3, from: 'auth-user', to: 'auth-provider', label: 'User enters credentials & consents', detail: 'User authenticates directly with the auth provider — your app never sees the password' },
    { num: 4, from: 'auth-provider', to: 'auth-app', label: 'Auth Provider redirects with auth code', detail: 'GET /callback?code=SplxlOBeZQ&state=xyz' },
    { num: 5, from: 'auth-app', to: 'auth-provider', label: 'App exchanges code for tokens (server-side)', detail: 'POST /token { code, client_id, client_secret, redirect_uri }' },
    { num: 6, from: 'auth-provider', to: 'auth-app', label: 'Auth Provider returns access + refresh tokens', detail: '{ access_token: "eyJhbG...", refresh_token: "dGhpcw...", expires_in: 3600 }' },
    { num: 7, from: 'auth-app', to: 'auth-api', label: 'App calls API with access token', detail: 'GET /api/profile  Authorization: Bearer eyJhbG...' },
    { num: 8, from: 'auth-api', to: 'auth-app', label: 'API returns protected resource', detail: '{ name: "Ada Lovelace", email: "ada@example.com" }' },
  ];

  let animating = false;

  function reset() {
    container.querySelector('#auth-steps').innerHTML = '';
    container.querySelectorAll('.auth-actor').forEach(el => el.classList.remove('active'));
    container.querySelector('#auth-token').classList.remove('visible');
    container.querySelector('#auth-login').disabled = false;
  }

  async function runFlow() {
    if (animating) return;
    animating = true;
    container.querySelector('#auth-login').disabled = true;
    reset();

    const stepsEl = container.querySelector('#auth-steps');

    for (const step of steps) {
      container.querySelectorAll('.auth-actor').forEach(el => el.classList.remove('active'));
      if (step.from) container.querySelector(`#${step.from}`).classList.add('active');
      if (step.to) container.querySelector(`#${step.to}`).classList.add('active');

      stepsEl.innerHTML += `<div class="auth-step" style="animation-delay:0s">
        <div class="auth-step-num">${step.num}</div>
        <div class="auth-step-content">
          <div class="auth-step-label">${step.label}</div>
          <div class="auth-step-detail">${step.detail}</div>
        </div>
      </div>`;
      stepsEl.scrollTop = stepsEl.scrollHeight;

      await new Promise(r => setTimeout(r, 900));
    }

    const tokenEl = container.querySelector('#auth-token');
    tokenEl.textContent = 'JWT decoded: { sub: "12345", name: "Ada Lovelace", iat: 1716239022, exp: 1716242622 }';
    tokenEl.classList.add('visible');

    animating = false;
  }

  container.querySelector('#auth-login').addEventListener('click', runFlow);
  container.querySelector('#auth-reset').addEventListener('click', () => { animating = false; reset(); });
});
