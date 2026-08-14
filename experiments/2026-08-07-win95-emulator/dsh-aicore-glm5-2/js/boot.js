/* ===== Boot sequence ===== */
const Boot = {
  async start() {
    // BIOS phase
    await this.biosPhase();
    // Windows 95 splash
    await this.splashPhase();
    // Desktop
    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('boot-splash').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    Desktop.init();
    Taskbar.init();
  },

  // Skip straight to the desktop (no BIOS / splash animation)
  skipToDesktop() {
    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('boot-splash').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    Desktop.init();
    Taskbar.init();
  },

  async biosPhase() {
    const mem = document.getElementById('bios-memory');
    const detect = document.getElementById('bios-detect');

    // Memory test animation
    let memK = 0;
    await new Promise(resolve => {
      const iv = setInterval(() => {
        memK += 2048;
        if (memK >= 65536) memK = 65536;
        mem.textContent = 'Memory Test : ' + memK + 'K OK';
        if (memK >= 65536) { clearInterval(iv); resolve(); }
      }, 40);
    });

    await Util.delay(300);

    // Hardware detect
    const lines = [
      'Primary Master    : QUANTUM FIREBALL 1080A',
      'Primary Slave     : None',
      'Secondary Master  : CD-ROM ASUS CD-S400/A',
      'Secondary Slave   : None',
      '',
      'Detecting IDE drives ...',
      '',
      'Floppy disk(s) fail (40)',
      'Press F1 to continue, DEL to enter SETUP'
    ];
    detect.textContent = '';
    for (const line of lines) {
      detect.textContent += line + '\n';
      await Util.delay(180);
    }
    await Util.delay(700);
  },

  async splashPhase() {
    document.getElementById('bios-screen').style.display = 'none';
    const splash = document.getElementById('boot-splash');
    splash.style.display = 'flex';

    // Animate loading bar
    const bar = document.getElementById('loading-bar-inner');
    await new Promise(resolve => {
      let w = 0;
      const iv = setInterval(() => {
        w += 4 + Math.random() * 6;
        if (w >= 100) { w = 100; bar.style.width = '100%'; clearInterval(iv); resolve(); }
        bar.style.width = w + '%';
      }, 60);
    });
    await Util.delay(500);
  },

  showSplash(callback) {
    const splash = document.getElementById('boot-splash');
    splash.style.display = 'flex';
    const bar = document.getElementById('loading-bar-inner');
    bar.style.width = '0';
    let w = 0;
    const iv = setInterval(() => {
      w += 4 + Math.random() * 6;
      if (w >= 100) { w = 100; bar.style.width = '100%'; clearInterval(iv); setTimeout(callback, 500); }
      bar.style.width = w + '%';
    }, 60);
  },

  shutdown() {
    document.getElementById('desktop').style.display = 'none';
    const shutdown = document.getElementById('shutdown-screen');
    shutdown.style.display = 'flex';
    document.getElementById('shutdown-message').textContent = 'Please wait while your computer shuts down...';
    setTimeout(() => {
      shutdown.style.display = 'none';
      document.getElementById('safe-off-screen').style.display = 'flex';
    }, 2800);
  },

  restart() {
    document.getElementById('desktop').style.display = 'none';
    const shutdown = document.getElementById('shutdown-screen');
    shutdown.style.display = 'flex';
    document.getElementById('shutdown-message').textContent = 'Please wait while your computer shuts down...';
    setTimeout(() => {
      shutdown.style.display = 'none';
      // Black screen briefly
      const black = document.createElement('div');
      black.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9998;';
      document.body.appendChild(black);
      setTimeout(() => {
        black.remove();
        // Re-run BIOS
        document.getElementById('bios-memory').textContent = 'Memory Test : 0K OK';
        document.getElementById('bios-detect').textContent = '';
        document.getElementById('bios-screen').style.display = 'block';
        this.start();
      }, 1200);
    }, 2000);
  },

  // Restart to DOS (mock)
  msdosMode() {
    document.getElementById('desktop').style.display = 'none';
    const dos = document.createElement('div');
    dos.style.cssText = 'position:fixed;inset:0;background:#000;color:#c0c0c0;font-family:"Courier New",monospace;font-size:16px;padding:16px;z-index:9999;white-space:pre;';
    dos.textContent = 'Microsoft(R) MS-DOS(R) Version 6.22\n         (C)Copyright Microsoft Corp 1981-1994.\n\nC:\\>_';
    document.body.appendChild(dos);
    const cursor = document.createElement('span');
    cursor.className = 'bios-cursor';
    dos.appendChild(cursor);
    // Click to return
    dos.addEventListener('click', () => {
      dos.remove();
      document.getElementById('desktop').style.display = 'block';
    });
    setTimeout(() => {
      const hint = document.createElement('div');
      hint.style.cssText = 'position:absolute;bottom:20px;left:20px;color:#888;font-size:12px;';
      hint.textContent = '(Click anywhere to return to Windows 95)';
      dos.appendChild(hint);
    }, 2000);
  }
};
