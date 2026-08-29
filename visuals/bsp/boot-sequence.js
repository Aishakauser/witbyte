// Interactive Boot Sequence Visualizer — bsp-02 Boot Sequence
import { registerVisual } from '../../js/visuals.js';

registerVisual('bsp-02', function(container) {
  container.innerHTML = `
    <div class="vis-title">Boot Sequence Visualizer</div>
    <div class="vis-desc">Watch the boot process unfold from power-on to userspace. Click each stage to learn what happens.</div>
    <div class="boot-vis" id="boot-vis">
      <div class="boot-timeline">
        <div class="boot-progress-track">
          <div class="boot-progress-fill" id="boot-fill"></div>
        </div>
        <div class="boot-stages" id="boot-stages"></div>
      </div>
      <div class="boot-detail" id="boot-detail">
        <div class="boot-detail-title" id="boot-detail-title">Click "Power On" to start</div>
        <div class="boot-detail-body" id="boot-detail-body">The boot visualizer shows the complete sequence from applying power to reaching a login prompt.</div>
        <div class="boot-log" id="boot-log"></div>
      </div>
      <div class="boot-controls">
        <button id="boot-start" class="boot-btn">Power On</button>
        <button id="boot-reset" class="boot-btn secondary">Reset</button>
      </div>
    </div>
    <style>
      .boot-vis { max-width: 580px; margin: 0 auto; }
      .boot-timeline { margin-bottom: 16px; }
      .boot-progress-track {
        height: 6px; background: var(--border); border-radius: 3px;
        margin-bottom: 12px; overflow: hidden;
      }
      .boot-progress-fill {
        height: 100%; width: 0%; background: linear-gradient(90deg, var(--bsp), var(--bsp2, var(--bsp)));
        border-radius: 3px; transition: width .5s ease-out;
      }
      .boot-stages { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
      .boot-stage {
        flex: 1; min-width: 60px; padding: 8px 6px; text-align: center;
        border-radius: 8px; border: 1px solid var(--border); background: var(--surface);
        cursor: pointer; transition: all .2s; position: relative;
      }
      .boot-stage:hover { border-color: var(--bsp); }
      .boot-stage.active { border-color: var(--bsp); background: var(--bsp-soft); }
      .boot-stage.done { border-color: var(--bsp); }
      .boot-stage.done::after {
        content: ''; position: absolute; top: 4px; right: 4px;
        width: 8px; height: 8px; border-radius: 50%; background: var(--bsp);
      }
      .boot-stage-name { font-size: 11px; font-weight: 700; color: var(--ink); }
      .boot-stage-time { font-size: 10px; color: var(--ink2); margin-top: 2px; }
      .boot-detail {
        background: var(--surface); border-radius: 12px; padding: 16px;
        border: 1px solid var(--border); margin-bottom: 12px; min-height: 120px;
      }
      .boot-detail-title { font-size: 15px; font-weight: 700; color: var(--bsp); margin-bottom: 8px; }
      .boot-detail-body { font-size: 13px; color: var(--ink); line-height: 1.5; }
      .boot-log {
        margin-top: 12px; padding: 10px; background: var(--bg);
        border-radius: 8px; font-family: 'JetBrains Mono', monospace;
        font-size: 11px; color: var(--ink2); max-height: 120px;
        overflow-y: auto; display: none; line-height: 1.6;
      }
      .boot-log.visible { display: block; }
      .boot-log .log-line { opacity: 0; animation: logFade .3s forwards; }
      @keyframes logFade { to { opacity: 1; } }
      .boot-controls { display: flex; gap: 8px; }
      .boot-btn {
        padding: 8px 20px; border-radius: 8px; border: none;
        background: var(--bsp); color: #fff; font-weight: 600;
        cursor: pointer; font-size: 13px; transition: opacity .15s;
      }
      .boot-btn:hover { opacity: .85; }
      .boot-btn:disabled { opacity: .4; cursor: default; }
      .boot-btn.secondary { background: var(--surface); color: var(--ink); border: 1px solid var(--border); }
    </style>
  `;

  const stages = [
    {
      name: 'ROM', time: '~0ms',
      title: '1. Boot ROM (BROM)',
      body: 'The SoC\'s built-in ROM code runs first. It\'s burned into silicon — you can\'t change it. It initializes the CPU, checks boot pins/fuses to determine boot source (eMMC, SD, USB), loads the next stage into SRAM, and verifies its signature if secure boot is enabled.',
      logs: ['[0.000] CPU reset vector @ 0xFFFF0000', '[0.001] Boot ROM v2.1 — checking boot pins', '[0.003] Boot source: eMMC (boot0)', '[0.005] Loading SPL to SRAM @ 0x00010000', '[0.012] Signature OK — jumping to SPL']
    },
    {
      name: 'SPL', time: '~10ms',
      title: '2. Secondary Program Loader (SPL)',
      body: 'SPL (or TPL/BL2 in ARM Trusted Firmware) runs from SRAM with minimal resources. Its primary job: initialize DRAM, since the SoC can\'t access it yet. It also sets up clocks, PLLs, and power rails. Once DRAM is ready, it loads U-Boot proper.',
      logs: ['[0.015] SPL: Initializing PLL0 @ 1.2GHz', '[0.020] SPL: DDR4 training... rank0 OK', '[0.045] SPL: DRAM: 2048 MiB @ 0x40000000', '[0.048] SPL: Loading U-Boot to DRAM', '[0.060] SPL: Jumping to U-Boot @ 0x4FF00000']
    },
    {
      name: 'U-Boot', time: '~100ms',
      title: '3. U-Boot (Bootloader)',
      body: 'U-Boot is the full-featured bootloader. It initializes remaining hardware (USB, Ethernet, display), provides a command-line for debugging, loads the device tree (DTB), kernel image, and optional initramfs into memory, then transfers control to Linux.',
      logs: ['[0.065] U-Boot 2024.04 (Apr 01 2024)', '[0.070] DRAM: 2 GiB', '[0.085] MMC: mmc@ff0a0000: 0 (eMMC)', '[0.100] Loading kernel from mmc 0:1', '[0.150] Loading DTB: board-v2.dtb', '[0.160] Starting kernel ...']
    },
    {
      name: 'Kernel', time: '~1s',
      title: '4. Linux Kernel',
      body: 'The kernel decompresses itself, sets up memory management (MMU/page tables), initializes the scheduler, parses the device tree to discover hardware, probes drivers for each device node, mounts the root filesystem, and launches PID 1.',
      logs: ['[0.170] Booting Linux on CPU 0x0', '[0.175] Machine model: WitByte Dev Board', '[0.200] Memory: 2048MB available', '[0.350] DMA: preallocated 256 KiB', '[0.500] i2c-core: driver registered', '[0.600] mmc0: new HS400 card @ 200MHz', '[0.800] EXT4-fs: mounted root (ro)', '[1.000] Run /sbin/init as init process']
    },
    {
      name: 'Init', time: '~2s',
      title: '5. Init System (systemd/SysVinit)',
      body: 'PID 1 (systemd or init) starts services in dependency order: mount remaining filesystems, start networking, bring up display manager, launch daemons. systemd uses unit files with dependency graphs for parallel startup.',
      logs: ['[1.100] systemd[1]: Detected architecture arm64', '[1.200] systemd[1]: Starting Journal Service...', '[1.400] systemd[1]: Started udev (Device Manager)', '[1.800] systemd[1]: Starting Network Service...', '[2.000] systemd[1]: Reached target Multi-User System']
    },
    {
      name: 'User', time: '~3s',
      title: '6. Userspace Ready',
      body: 'The system reaches the login target. All services are running, the network is up, and the device is ready for use. On embedded systems, this might launch a custom application instead of a login prompt.',
      logs: ['[2.200] Starting SSH server...', '[2.500] Starting application service...', '[2.800] WitByte Board v2 ready', '[3.000] Login: _']
    }
  ];

  const stagesEl = container.querySelector('#boot-stages');
  stages.forEach((s, i) => {
    stagesEl.innerHTML += `<div class="boot-stage" data-idx="${i}">
      <div class="boot-stage-name">${s.name}</div>
      <div class="boot-stage-time">${s.time}</div>
    </div>`;
  });

  function showStage(idx) {
    const s = stages[idx];
    container.querySelector('#boot-detail-title').textContent = s.title;
    container.querySelector('#boot-detail-body').textContent = s.body;
    const logEl = container.querySelector('#boot-log');
    logEl.innerHTML = s.logs.map((l, i) => `<div class="log-line" style="animation-delay:${i*0.08}s">${l}</div>`).join('');
    logEl.classList.add('visible');

    container.querySelectorAll('.boot-stage').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  }

  container.querySelectorAll('.boot-stage').forEach(el => {
    el.addEventListener('click', () => showStage(parseInt(el.dataset.idx)));
  });

  let bootTimer = null;

  container.querySelector('#boot-start').addEventListener('click', async () => {
    const startBtn = container.querySelector('#boot-start');
    startBtn.disabled = true;

    container.querySelectorAll('.boot-stage').forEach(el => el.classList.remove('done', 'active'));
    container.querySelector('#boot-fill').style.width = '0%';

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      showStage(i);
      container.querySelectorAll('.boot-stage').forEach((el, j) => {
        if (j <= i) el.classList.add('done');
      });
      container.querySelector('#boot-fill').style.width = `${((i + 1) / stages.length) * 100}%`;
    }

    startBtn.disabled = false;
  });

  container.querySelector('#boot-reset').addEventListener('click', () => {
    container.querySelectorAll('.boot-stage').forEach(el => el.classList.remove('done', 'active'));
    container.querySelector('#boot-fill').style.width = '0%';
    container.querySelector('#boot-detail-title').textContent = 'Click "Power On" to start';
    container.querySelector('#boot-detail-body').textContent = 'The boot visualizer shows the complete sequence from applying power to reaching a login prompt.';
    container.querySelector('#boot-log').classList.remove('visible');
    container.querySelector('#boot-start').disabled = false;
  });
});
