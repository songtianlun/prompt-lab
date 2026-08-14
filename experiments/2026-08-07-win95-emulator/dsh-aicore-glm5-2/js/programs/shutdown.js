/* ===== Shutdown dialog ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  Programs.Shutdown = {
    open() {
      const body = Util.el('div', { style: 'display:flex;flex-direction:column;height:100%;' });

      const content = Util.el('div', { class: 'shutdown-dialog-body' });
      content.appendChild(Util.el('div', { class: 'shutdown-dialog-icon' }, '⏻'));
      const right = Util.el('div', { class: 'shutdown-dialog-content' });
      right.appendChild(Util.el('div', { class: 'shutdown-dialog-title' }, 'Are you sure you want to:' ));
      const options = Util.el('div', { class: 'shutdown-options' });
      const choices = [
        { id: 'shutdown', label: 'Shut down the computer?', checked: true },
        { id: 'restart', label: 'Restart the computer?' },
        { id: 'restart-dos', label: 'Restart the computer in MS-DOS mode?' },
        { id: 'logoff', label: 'Close all programs and log on as a different user?' }
      ];
      let selected = 'shutdown';
      choices.forEach((c, i) => {
        const row = Util.el('div', { class: 'radio-row' });
        const r = Util.el('div', { class: 'radio' + (c.checked ? ' checked' : '') });
        row.appendChild(r);
        row.appendChild(Util.el('span', {}, c.label));
        row.addEventListener('click', () => {
          options.querySelectorAll('.radio').forEach(x => x.classList.remove('checked'));
          r.classList.add('checked');
          selected = c.id;
        });
        options.appendChild(row);
      });
      right.appendChild(options);
      content.appendChild(right);
      body.appendChild(content);

      const btnRow = Util.el('div', { class: 'shutdown-dialog-buttons' });
      const yesBtn = Util.el('button', { class: 'btn default' }, 'Yes');
      const noBtn = Util.el('button', { class: 'btn' }, 'No');
      const helpBtn = Util.el('button', { class: 'btn' }, 'Help');
      btnRow.appendChild(yesBtn);
      btnRow.appendChild(noBtn);
      btnRow.appendChild(helpBtn);
      body.appendChild(btnRow);

      const win = WindowManager.create({
        title: 'Shut Down Windows',
        icon: '⏻',
        width: 340, height: 200,
        x: Math.max(40, (window.innerWidth - 340) / 2),
        y: Math.max(30, (window.innerHeight - 200) / 2 - 14),
        resizable: false,
        maximizable: false,
        content: body
      });

      yesBtn.addEventListener('click', () => {
        WindowManager.close(win.id);
        if (selected === 'shutdown') Boot.shutdown();
        else if (selected === 'restart') Boot.restart();
        else if (selected === 'restart-dos') Boot.msdosMode();
        else if (selected === 'logoff') Boot.restart();
      });
      noBtn.addEventListener('click', () => WindowManager.close(win.id));
      helpBtn.addEventListener('click', () => Programs.Help.open('shutdown'));

      return win;
    }
  };
})();
