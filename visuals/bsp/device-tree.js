// Interactive Device Tree Explorer — bsp-04 Device Trees
import { registerVisual } from '../../js/visuals.js';

registerVisual('bsp-04', function(container) {
  container.innerHTML = `
    <div class="vis-title">Device Tree Explorer</div>
    <div class="vis-desc">Click any node to see its properties. This represents a simplified SoC device tree.</div>
    <div class="dt-vis">
      <div class="dt-tree" id="dt-tree"></div>
      <div class="dt-props" id="dt-props">
        <div class="dt-props-title">Select a node</div>
        <div class="dt-props-body">Click any node in the tree to inspect its properties and see the DTS source.</div>
      </div>
    </div>
    <style>
      .dt-vis { max-width: 580px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 500px) { .dt-vis { grid-template-columns: 1fr; } }
      .dt-tree {
        background: var(--surface); border-radius: 12px; padding: 12px;
        border: 1px solid var(--border); font-family: 'JetBrains Mono', monospace;
        font-size: 12px; overflow-x: auto;
      }
      .dt-node {
        padding: 2px 0; cursor: pointer; user-select: none;
      }
      .dt-node-label {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 8px; border-radius: 6px; transition: all .15s;
      }
      .dt-node-label:hover { background: var(--bsp-soft); }
      .dt-node-label.selected { background: var(--bsp-soft); color: var(--bsp); font-weight: 600; }
      .dt-toggle { width: 14px; text-align: center; color: var(--ink2); font-size: 10px; }
      .dt-icon { font-size: 14px; }
      .dt-name { color: var(--ink); }
      .dt-children { padding-left: 20px; border-left: 1px solid var(--border); margin-left: 7px; }
      .dt-children.collapsed { display: none; }
      .dt-props {
        background: var(--surface); border-radius: 12px; padding: 14px;
        border: 1px solid var(--border);
      }
      .dt-props-title { font-size: 14px; font-weight: 700; color: var(--bsp); margin-bottom: 8px; }
      .dt-props-body { font-size: 13px; color: var(--ink); line-height: 1.5; }
      .dt-props pre {
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        background: var(--bg); padding: 10px; border-radius: 8px;
        overflow-x: auto; margin: 8px 0 0; line-height: 1.5; color: var(--ink);
      }
      .dt-prop-row { display: flex; gap: 8px; font-size: 12px; padding: 3px 0; border-bottom: 1px solid var(--border); }
      .dt-prop-key { color: var(--bsp); font-weight: 600; min-width: 100px; font-family: 'JetBrains Mono', monospace; }
      .dt-prop-val { color: var(--ink); font-family: 'JetBrains Mono', monospace; word-break: break-all; }
    </style>
  `;

  const tree = {
    name: '/', icon: '📁', children: [
      { name: 'cpus', icon: '🔲', children: [
        { name: 'cpu@0', icon: '⚡', props: { compatible: '"arm,cortex-a53"', 'device_type': '"cpu"', reg: '<0x0>', 'clock-frequency': '<1200000000>', 'enable-method': '"psci"' },
          dts: `cpu@0 {\n  compatible = "arm,cortex-a53";\n  device_type = "cpu";\n  reg = <0x0>;\n  clock-frequency = <1200000000>;\n  enable-method = "psci";\n};` },
        { name: 'cpu@1', icon: '⚡', props: { compatible: '"arm,cortex-a53"', reg: '<0x1>' },
          dts: `cpu@1 {\n  compatible = "arm,cortex-a53";\n  reg = <0x1>;\n};` },
      ]},
      { name: 'memory@40000000', icon: '💾', props: { 'device_type': '"memory"', reg: '<0x40000000 0x80000000>' },
        dts: `memory@40000000 {\n  device_type = "memory";\n  reg = <0x40000000 0x80000000>;\n  /* 2 GiB starting at 1 GiB */\n};` },
      { name: 'soc', icon: '🔲', children: [
        { name: 'uart@ff010000', icon: '📡', props: { compatible: '"ns16550a"', reg: '<0xff010000 0x1000>', interrupts: '<0 39 4>', 'clock-frequency': '<48000000>', status: '"okay"' },
          dts: `uart@ff010000 {\n  compatible = "ns16550a";\n  reg = <0xff010000 0x1000>;\n  interrupts = <0 39 4>;\n  clock-frequency = <48000000>;\n  status = "okay";\n};` },
        { name: 'i2c@ff030000', icon: '🔌', props: { compatible: '"snps,designware-i2c"', reg: '<0xff030000 0x1000>', '#address-cells': '<1>', '#size-cells': '<0>', status: '"okay"' },
          dts: `i2c@ff030000 {\n  compatible = "snps,designware-i2c";\n  reg = <0xff030000 0x1000>;\n  #address-cells = <1>;\n  #size-cells = <0>;\n  status = "okay";\n\n  sensor@48 {\n    compatible = "ti,tmp102";\n    reg = <0x48>;\n  };\n};`,
          children: [
            { name: 'sensor@48', icon: '🌡️', props: { compatible: '"ti,tmp102"', reg: '<0x48>' },
              dts: `sensor@48 {\n  compatible = "ti,tmp102";\n  reg = <0x48>;\n};` },
          ]
        },
        { name: 'mmc@ff0a0000', icon: '💿', props: { compatible: '"samsung,exynos-dw-mshc"', reg: '<0xff0a0000 0x1000>', 'bus-width': '<8>', 'non-removable': '', status: '"okay"' },
          dts: `mmc@ff0a0000 {\n  compatible = "samsung,exynos-dw-mshc";\n  reg = <0xff0a0000 0x1000>;\n  bus-width = <8>;\n  non-removable;\n  status = "okay";\n};` },
        { name: 'gpio@ff100000', icon: '📍', props: { compatible: '"snps,dw-apb-gpio"', reg: '<0xff100000 0x100>', '#gpio-cells': '<2>', 'gpio-controller': '' },
          dts: `gpio@ff100000 {\n  compatible = "snps,dw-apb-gpio";\n  reg = <0xff100000 0x100>;\n  #gpio-cells = <2>;\n  gpio-controller;\n};` },
      ]},
      { name: 'chosen', icon: '⚙️', props: { bootargs: '"console=ttyS0,115200 root=/dev/mmcblk0p2"', 'stdout-path': '"uart0:115200n8"' },
        dts: `chosen {\n  bootargs = "console=ttyS0,115200 root=/dev/mmcblk0p2";\n  stdout-path = "uart0:115200n8";\n};` },
    ]
  };

  function renderTree(node, depth) {
    const hasChildren = node.children && node.children.length;
    let html = `<div class="dt-node" data-name="${node.name}">`;
    html += `<div class="dt-node-label" data-node="${node.name}">`;
    html += `<span class="dt-toggle">${hasChildren ? '▼' : ''}</span>`;
    html += `<span class="dt-icon">${node.icon || '📄'}</span>`;
    html += `<span class="dt-name">${node.name}</span>`;
    html += '</div>';
    if (hasChildren) {
      html += '<div class="dt-children">';
      for (const child of node.children) {
        html += renderTree(child, depth + 1);
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  container.querySelector('#dt-tree').innerHTML = renderTree(tree, 0);

  function findNode(node, name) {
    if (node.name === name) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, name);
        if (found) return found;
      }
    }
    return null;
  }

  container.querySelector('#dt-tree').addEventListener('click', (e) => {
    const label = e.target.closest('.dt-node-label');
    if (!label) return;

    const name = label.dataset.node;
    const node = findNode(tree, name);
    if (!node) return;

    container.querySelectorAll('.dt-node-label').forEach(el => el.classList.remove('selected'));
    label.classList.add('selected');

    // Toggle children
    const childrenEl = label.nextElementSibling;
    if (childrenEl && childrenEl.classList.contains('dt-children')) {
      const toggle = label.querySelector('.dt-toggle');
      if (childrenEl.classList.contains('collapsed')) {
        childrenEl.classList.remove('collapsed');
        toggle.textContent = '▼';
      }
    }

    const propsEl = container.querySelector('#dt-props');
    if (node.props) {
      let html = `<div class="dt-props-title">${node.name}</div>`;
      html += '<div class="dt-props-body">';
      for (const [key, val] of Object.entries(node.props)) {
        html += `<div class="dt-prop-row"><span class="dt-prop-key">${key}</span><span class="dt-prop-val">${val || '(boolean)'}</span></div>`;
      }
      if (node.dts) {
        html += `<pre>${node.dts}</pre>`;
      }
      html += '</div>';
      propsEl.innerHTML = html;
    } else {
      propsEl.innerHTML = `<div class="dt-props-title">${node.name}</div><div class="dt-props-body">Container node — click a child to see properties.</div>`;
    }
  });
});
