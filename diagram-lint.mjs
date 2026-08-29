// Parses every Mermaid diagram in js/tracks/*.js against the SAME Mermaid major
// version the site loads from CDN (v10), and reports the ones that fail.
//
// Why this exists: the sandbox proxy blocks the Mermaid CDN, so app.js falls back
// to a no-op stub and NO diagram renders in-browser here. That makes in-browser
// checking useless for syntax — it cannot tell "CDN blocked" from "bad syntax".
// Parsing offline against the pinned version is the only sound check.
//
//   npm install mermaid@10 jsdom
//   node diagram-lint.mjs
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.DOMPurify = { sanitize: (s) => s, addHook: () => {} };

const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

const dir = path.join(process.cwd(), 'js', 'tracks');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

let total = 0;
const failures = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');

  // Track which module each diagram belongs to by scanning ids in document order.
  const idPositions = [...src.matchAll(/id:'([a-z]+-\d+)'/g)].map((m) => ({
    id: m[1],
    at: m.index,
  }));
  const moduleFor = (offset) => {
    let cur = '?';
    for (const { id, at } of idPositions) {
      if (at <= offset) cur = id;
      else break;
    }
    return cur;
  };

  // Content lives in template literals, so fences appear as \`\`\`mermaid.
  const blocks = [...src.matchAll(/\\`\\`\\`mermaid\n([\s\S]*?)\\`\\`\\`/g)];

  for (const m of blocks) {
    total++;
    // Reproduce exactly what reaches Mermaid at runtime, in two steps:
    //  1. undo the template-literal escaping in the source file
    //  2. HTML-decode — parseMarkdown writes the block via innerHTML and
    //     app.js reads it back with textContent, so `&lt;` arrives as `<`.
    // Skipping step 2 reports false positives on any diagram using entities.
    const raw = m[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
    const decoder = document.createElement('div');
    decoder.innerHTML = raw;
    const diagram = decoder.textContent;
    try {
      await mermaid.parse(diagram);
    } catch (e) {
      const firstLine = String(e.message).split('\n').find((l) => l.trim()) ?? '';
      // Surface the offending source line where we can identify it.
      const badLine =
        diagram.split('\n').find((l) => /\[[^\]"]*\([^)]*\)[^\]]*\]/.test(l)) ??
        diagram.split('\n')[1] ??
        '';
      failures.push({
        file,
        module: moduleFor(m.index),
        error: firstLine.slice(0, 80),
        line: badLine.trim().slice(0, 90),
      });
    }
  }
}

console.log(`Diagrams parsed: ${total}`);
console.log(`Failures:        ${failures.length}\n`);
for (const f of failures) {
  console.log(`  ${f.module}  (${f.file})`);
  console.log(`    ${f.error}`);
  console.log(`    → ${f.line}\n`);
}
process.exit(failures.length ? 1 : 0);
