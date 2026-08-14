/* ===== Main entry point ===== */
(function() {
  // Wait for DOM
  function start() {
    // Allow skipping the BIOS/boot intro via ?skipboot (handy for repeat visits)
    if (/[?&]skipboot\b/.test(location.search) || /skipboot/.test(location.hash)) {
      Boot.skipToDesktop();
    } else {
      Boot.start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Prevent default browser context menu globally (we have our own)
  document.addEventListener('contextmenu', e => {
    if (!e.target.closest('input, textarea')) e.preventDefault();
  });

  // Prevent text selection on UI chrome (but allow in textareas/inputs)
  document.addEventListener('selectstart', e => {
    if (!e.target.closest('input, textarea, .ie-content, .help-content')) e.preventDefault();
  });

  // Keyboard: Ctrl+Alt+Del shows close-program dialog
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && (e.key === 'Delete' || e.key === 'Del')) {
      e.preventDefault();
      showCloseProgram();
    }
  });

  function showCloseProgram() {
    const body = Util.el('div', { style: 'padding:12px;' });
    body.appendChild(Util.el('div', { style: 'font-weight:bold;margin-bottom:8px;' }, 'Close Program'));
    const list = Util.el('div', { class: 'listbox', style: 'height:140px;margin-bottom:10px;' });
    WindowManager.windows.forEach(w => {
      const item = Util.el('div', { class: 'listbox-item' }, w.title);
      list.appendChild(item);
    });
    if (WindowManager.windows.length === 0) {
      list.appendChild(Util.el('div', { class: 'listbox-item', style: 'color:#808080;' }, '(No programs running)'));
    }
    body.appendChild(list);
    const btnRow = Util.el('div', { style: 'display:flex;gap:8px;' });
    const endBtn = Util.el('button', { class: 'btn' }, 'End Task');
    const shutBtn = Util.el('button', { class: 'btn' }, 'Shut Down...');
    const cancelBtn = Util.el('button', { class: 'btn default' }, 'Cancel');
    btnRow.appendChild(endBtn);
    btnRow.appendChild(shutBtn);
    btnRow.appendChild(cancelBtn);
    body.appendChild(btnRow);

    const win = WindowManager.create({
      title: 'Close Program',
      icon: '⚠️',
      width: 280, height: 220,
      x: Math.max(40, (window.innerWidth - 280) / 2),
      y: Math.max(30, (window.innerHeight - 220) / 2 - 14),
      resizable: false,
      maximizable: false,
      minimizable: false,
      content: body
    });
    cancelBtn.addEventListener('click', () => WindowManager.close(win.id));
    shutBtn.addEventListener('click', () => { WindowManager.close(win.id); Programs.Shutdown.open(); });
    endBtn.addEventListener('click', () => {
      const selected = list.querySelector('.listbox-item.selected');
      if (selected) {
        const title = selected.textContent;
        const w = WindowManager.windows.find(x => x.title === title);
        if (w) WindowManager.close(w.id);
      }
      WindowManager.close(win.id);
    });
  }

  // Expose for debugging
  window.DSH = { Boot, WindowManager, Desktop, Taskbar, StartMenu, Programs };
})();
