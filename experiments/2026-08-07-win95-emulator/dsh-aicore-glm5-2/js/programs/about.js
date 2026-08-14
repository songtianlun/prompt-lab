/* ===== About dialogs ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  const ABOUT_INFO = {
    windows: {
      title: 'About Windows 95',
      icon: '🪟',
      html: `
        <div style="display:flex;gap:16px;padding:20px;">
          <div style="font-size:56px;line-height:1;">🪟</div>
          <div>
            <div style="font-size:20px;font-weight:bold;color:#000080;">Microsoft<sup style="font-size:10px;">®</sup> Windows<span style="font-size:14px;vertical-align:super;">95</span></div>
            <div style="margin-top:6px;">Version 4.00.950</div>
            <div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div>
            <hr style="margin:12px 0;border:none;border-top:1px solid #c0c0c0;">
            <div>This product is licensed to:</div>
            <div style="margin:4px 0 4px 20px;"><b>A Windows User</b><br>Home PC</div>
            <div style="margin-top:8px;">Physical memory available to Windows: 16,384 KB<br>System resources: 87% free</div>
            <div style="margin-top:12px;font-size:11px;">This is a web-based simulation of Windows 95, built with HTML, CSS, and JavaScript.</div>
          </div>
        </div>
      `
    },
    notepad: {
      title: 'About Notepad',
      icon: '📝',
      html: `
        <div style="display:flex;gap:16px;padding:20px;">
          <div style="font-size:40px;">📝</div>
          <div>
            <div style="font-weight:bold;font-size:13px;">Notepad</div>
            <div>Windows 95</div>
            <div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div>
            <hr style="margin:10px 0;border:none;border-top:1px solid #c0c0c0;">
            <div>This product is licensed to:<br><b>A Windows User</b></div>
            <div style="margin-top:8px;">Memory: 16,384 KB</div>
          </div>
        </div>
      `
    },
    calculator: {
      title: 'About Calculator',
      icon: '🧮',
      html: `<div style="padding:20px;"><div style="font-weight:bold;">Calculator</div><div>Windows 95</div><div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div></div>`
    },
    minesweeper: {
      title: 'About Minesweeper',
      icon: '💣',
      html: `<div style="padding:20px;"><div style="font-weight:bold;">Minesweeper</div><div>Windows 95</div><div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div><div style="margin-top:8px;font-size:11px;">Left-click to reveal, right-click to flag.</div></div>`
    },
    paint: {
      title: 'About Paint',
      icon: '🎨',
      html: `<div style="padding:20px;"><div style="font-weight:bold;">Paint</div><div>Windows 95</div><div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div></div>`
    },
    ie: {
      title: 'About Internet Explorer',
      icon: '🌐',
      html: `
        <div style="display:flex;gap:16px;padding:20px;">
          <div style="font-size:40px;">🌐</div>
          <div>
            <div style="font-weight:bold;font-size:13px;">Microsoft® Internet Explorer 3.0</div>
            <div>Windows 95</div>
            <div style="margin-top:6px;">Copyright © 1995-1996 Microsoft Corp.</div>
            <hr style="margin:10px 0;border:none;border-top:1px solid #c0c0c0;">
            <div style="font-size:11px;">Cipher strength: 40-bit</div>
            <div style="font-size:11px;margin-top:6px;">This is a mock browser with simulated retro web pages.</div>
          </div>
        </div>
      `
    },
    help: {
      title: 'About Help',
      icon: '❓',
      html: `<div style="padding:20px;"><div style="font-weight:bold;">Windows Help</div><div>Windows 95</div><div style="margin-top:6px;">Copyright © 1981-1995 Microsoft Corp.</div></div>`
    }
  };

  Programs.About = {
    open(type) {
      type = type || 'windows';
      const info = ABOUT_INFO[type] || ABOUT_INFO.windows;
      const win = WindowManager.create({
        title: info.title,
        icon: info.icon,
        width: 360, height: 220,
        x: Math.max(40, (window.innerWidth - 360) / 2),
        y: Math.max(30, (window.innerHeight - 220) / 2 - 14),
        resizable: false,
        maximizable: false,
        minimizable: false,
        content: info.html +
          `<div style="display:flex;justify-content:center;padding:12px;border-top:1px solid #c0c0c0;"><button class="btn" id="about-ok-btn">OK</button></div>`,
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'Exit', onClick: () => WindowManager.close(win.id) }
          ]}
        ]
      });
      // Wire OK button
      const okBtn = win.body.querySelector('#about-ok-btn');
      if (okBtn) okBtn.addEventListener('click', () => WindowManager.close(win.id));
      return win;
    }
  };
})();
