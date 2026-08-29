// Interactive Tokenizer Visualizer — ai-17 How LLMs Are Built
import { registerVisual } from '../../js/visuals.js';

registerVisual('ai-17', function(container) {
  container.innerHTML = `
    <div class="vis-title">Tokenization Explorer</div>
    <div class="vis-desc">Type text to see how an LLM would break it into tokens. Each color represents a different token. This uses a simplified BPE-like tokenization.</div>
    <div class="tok-vis">
      <div class="tok-input-wrap">
        <textarea id="tok-input" class="tok-textarea" rows="3" placeholder="Type something...">The quick brown fox jumps over the lazy dog.</textarea>
      </div>
      <div class="tok-output" id="tok-output"></div>
      <div class="tok-stats" id="tok-stats"></div>
      <div class="tok-ids" id="tok-ids"></div>
    </div>
    <style>
      .tok-vis { max-width: 580px; margin: 0 auto; }
      .tok-input-wrap { margin-bottom: 12px; }
      .tok-textarea {
        width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border);
        background: var(--surface); color: var(--ink); font-size: 14px;
        font-family: 'DM Sans', sans-serif; resize: vertical; box-sizing: border-box;
      }
      .tok-textarea:focus { outline: none; border-color: var(--ai); }
      .tok-output {
        background: var(--surface); border-radius: 12px; padding: 14px;
        border: 1px solid var(--border); margin-bottom: 10px;
        line-height: 2; min-height: 40px;
      }
      .tok-token {
        display: inline; padding: 2px 1px; border-radius: 3px;
        font-size: 14px; font-family: 'JetBrains Mono', monospace;
        border-bottom: 2px solid; cursor: default; position: relative;
      }
      .tok-token:hover { opacity: .8; }
      .tok-stats {
        font-size: 12px; color: var(--ink2); font-family: 'JetBrains Mono', monospace;
        margin-bottom: 8px;
      }
      .tok-ids {
        background: var(--bg); border-radius: 8px; padding: 10px;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        color: var(--ink2); line-height: 1.8; overflow-x: auto;
      }
      .tok-id { display: inline-block; padding: 2px 6px; margin: 2px; border-radius: 4px; background: var(--surface); }
    </style>
  `;

  const colors = [
    '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa',
    '#fb923c', '#4ade80', '#f87171', '#38bdf8', '#c084fc',
    '#a3e635', '#e879f9', '#22d3ee', '#facc15', '#818cf8',
  ];

  const vocab = {
    'the': 100, 'The': 101, ' the': 102, ' The': 103,
    ' quick': 200, ' brown': 201, ' fox': 202, ' jump': 203, 's': 204,
    ' over': 205, ' lazy': 206, ' dog': 207, '.': 208,
    ' a': 300, ' an': 301, ' is': 302, ' was': 303, ' are': 304,
    ' in': 305, ' on': 306, ' at': 307, ' to': 308, ' of': 309,
    ' and': 310, ' or': 311, ' not': 312, ' it': 313,
    ' Hello': 400, ' world': 401, ' AI': 402, ' learn': 403,
    'ing': 404, ' model': 405, ' token': 406, ' text': 407,
    ' data': 408, ' train': 409,
  };

  function tokenize(text) {
    const tokens = [];
    let i = 0;
    while (i < text.length) {
      let bestMatch = '';
      let bestId = -1;
      for (const [tok, id] of Object.entries(vocab)) {
        if (text.substring(i).startsWith(tok) && tok.length > bestMatch.length) {
          bestMatch = tok;
          bestId = id;
        }
      }
      if (bestMatch) {
        tokens.push({ text: bestMatch, id: bestId });
        i += bestMatch.length;
      } else {
        const char = text[i];
        tokens.push({ text: char, id: char.charCodeAt(0) + 1000 });
        i++;
      }
    }
    return tokens;
  }

  function render() {
    const text = container.querySelector('#tok-input').value;
    const tokens = tokenize(text);

    let outputHtml = '';
    let idsHtml = '';
    tokens.forEach((tok, i) => {
      const color = colors[i % colors.length];
      const displayText = tok.text.replace(/ /g, '·').replace(/\n/g, '↵');
      outputHtml += `<span class="tok-token" style="border-color:${color};background:${color}20" title="ID: ${tok.id}">${displayText}</span>`;
      idsHtml += `<span class="tok-id" style="border-left:3px solid ${color}">${tok.id}</span>`;
    });

    container.querySelector('#tok-output').innerHTML = outputHtml;
    container.querySelector('#tok-stats').textContent = `${tokens.length} tokens | ${text.length} characters | ratio: ${text.length ? (tokens.length / text.length * 100).toFixed(0) : 0}%`;
    container.querySelector('#tok-ids').innerHTML = 'Token IDs: ' + idsHtml;
  }

  container.querySelector('#tok-input').addEventListener('input', render);
  render();
});
