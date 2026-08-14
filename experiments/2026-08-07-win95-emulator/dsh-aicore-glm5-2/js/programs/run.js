/* ===== Run dialog ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  const RUN_COMMANDS = {
    'notepad': () => Programs.Notepad.open(),
    'calc': () => Programs.Calculator.open(),
    'mspaint': () => Programs.Paint.open(),
    'pbrush': () => Programs.Paint.open(),
    'winmine': () => Programs.Minesweeper.open(),
    'iexplore': () => Programs.IE.open(),
    'explorer': () => Programs.MyComputer.open(),
    'control': () => Programs.ControlPanel.open(),
    'cmd': () => Boot.msdosMode(),
    'command': () => Boot.msdosMode(),
    'help': () => Programs.Help.open(),
    'welcome': () => Programs.IE.open('about:home')
  };

  Programs.Run = {
    open() {
      const body = Util.el('div', { class: 'run-body' });
      const row = Util.el('div', { class: 'run-row' });
      row.appendChild(Util.el('div', { class: 'run-icon' }, '🏃'));
      row.appendChild(Util.el('div', { class: 'run-text' }, 'Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.'));
      body.appendChild(row);

      const openRow = Util.el('div', { class: 'run-open' });
      openRow.appendChild(Util.el('span', { class: 'run-open-label' }, 'Open:'));
      const input = Util.el('input', { class: 'text-input run-open-input' });
      openRow.appendChild(input);
      body.appendChild(openRow);

      const btns = Util.el('div', { class: 'run-buttons' });
      const okBtn = Util.el('button', { class: 'btn default' }, 'OK');
      const cancelBtn = Util.el('button', { class: 'btn' }, 'Cancel');
      const browseBtn = Util.el('button', { class: 'btn' }, 'Browse...');
      btns.appendChild(okBtn);
      btns.appendChild(cancelBtn);
      btns.appendChild(browseBtn);
      body.appendChild(btns);

      const win = WindowManager.create({
        title: 'Run',
        icon: '🏃',
        width: 320, height: 160,
        x: Math.max(40, (window.innerWidth - 320) / 2),
        y: Math.max(30, (window.innerHeight - 160) / 2 - 14),
        resizable: false,
        maximizable: false,
        content: body
      });

      function run() {
        const cmd = input.value.trim().toLowerCase().replace(/\.exe$/i, '').replace(/^.*\//, '').replace(/^.*\\/, '');
        if (RUN_COMMANDS[cmd]) {
          RUN_COMMANDS[cmd]();
          WindowManager.close(win.id);
        } else if (cmd === '' ) {
          // do nothing
        } else if (cmd.startsWith('http') || cmd.startsWith('www.')) {
          Programs.IE.open(cmd);
          WindowManager.close(win.id);
        } else {
          // Unknown - show error dialog
          WindowManager.close(win.id);
          setTimeout(() => Programs.Run.showError(cmd), 100);
        }
      }

      okBtn.addEventListener('click', run);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
      cancelBtn.addEventListener('click', () => WindowManager.close(win.id));
      browseBtn.addEventListener('click', () => {
        // Toggle a small dropdown of known commands
        const known = Object.keys(RUN_COMMANDS);
        const list = known[Math.floor(Math.random() * known.length)];
        input.value = list;
      });

      setTimeout(() => input.focus(), 50);
      return win;
    },

    showError(cmd) {
      const body = Util.el('div', { style: 'padding:20px;display:flex;gap:14px;align-items:flex-start;' });
      body.appendChild(Util.el('div', { style: 'font-size:32px;' }, '⚠️'));
      const text = Util.el('div');
      text.appendChild(Util.el('div', { style: 'font-weight:bold;margin-bottom:8px;' }, 'Windows cannot find "' + cmd + '".'));
      text.appendChild(Util.el('div', {}, 'Make sure you typed the name correctly, and then try again.'));
      body.appendChild(text);
      const btnRow = Util.el('div', { style: 'display:flex;justify-content:center;padding:10px;border-top:1px solid #c0c0c0;' });
      const okBtn = Util.el('button', { class: 'btn' }, 'OK');
      btnRow.appendChild(okBtn);
      body.appendChild(btnRow);

      const win = WindowManager.create({
        title: 'Run',
        icon: '⚠️',
        width: 340, height: 150,
        x: Math.max(40, (window.innerWidth - 340) / 2),
        y: Math.max(30, (window.innerHeight - 150) / 2 - 14),
        resizable: false,
        maximizable: false,
        minimizable: false,
        content: body
      });
      okBtn.addEventListener('click', () => WindowManager.close(win.id));
    }
  };
})();
