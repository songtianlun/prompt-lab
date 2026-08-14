/* ===== My Computer / Windows Explorer ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  const VIEWS = {
    mycomputer: {
      title: 'My Computer',
      address: 'My Computer',
      files: [
        { name: '3½ Floppy (A:)', icon: 'floppy', type: 'drive' },
        { name: '(C:)', icon: 'hdd', type: 'drive', open: 'drivec' },
        { name: '(D:)', icon: 'cdrom', type: 'drive' },
        { name: 'Control Panel', icon: 'controlpanel', type: 'folder', open: 'controlpanel' },
        { name: 'Printers', icon: 'printer', type: 'folder' },
        { name: 'Dial-Up Networking', icon: 'network', type: 'folder' }
      ]
    },
    drivec: {
      title: '(C:)',
      address: 'C:\\',
      files: [
        { name: 'Windows', icon: 'folder', type: 'folder', open: 'windows' },
        { name: 'Program Files', icon: 'folder', type: 'folder' },
        { name: 'My Documents', icon: 'folder', type: 'folder', open: 'docs' },
        { name: 'DOS', icon: 'folder', type: 'folder' },
        { name: 'Games', icon: 'folder', type: 'folder' },
        { name: 'autoexec.bat', icon: 'textfile', type: 'file' },
        { name: 'config.sys', icon: 'textfile', type: 'file' },
        { name: 'command.com', icon: 'exe', type: 'file' }
      ]
    },
    windows: {
      title: 'Windows',
      address: 'C:\\Windows',
      files: [
        { name: 'System', icon: 'folder', type: 'folder' },
        { name: 'Command', icon: 'folder', type: 'folder' },
        { name: 'Notepad.exe', icon: 'exe', type: 'file', open: () => Programs.Notepad.open() },
        { name: 'Calc.exe', icon: 'exe', type: 'file', open: () => Programs.Calculator.open() },
        { name: 'Mspaint.exe', icon: 'exe', type: 'file', open: () => Programs.Paint.open() },
        { name: 'Winmine.exe', icon: 'exe', type: 'file', open: () => Programs.Minesweeper.open() },
        { name: 'Iexplore.exe', icon: 'exe', type: 'file', open: () => Programs.IE.open() },
        { name: 'win.ini', icon: 'textfile', type: 'file', open: () => Programs.Notepad.open('; for 16-bit app support\n[fonts]\n[extensions]\n[mci extensions]\n[files]\n') }
      ]
    },
    docs: {
      title: 'My Documents',
      address: 'C:\\My Documents',
      files: [
        { name: 'Readme.txt', icon: 'textfile', type: 'file', open: () => Programs.Notepad.open('Welcome to Windows 95!\n\nThis is a web-based simulation built with HTML, CSS, and JavaScript.\n\nFeatures:\n- Boot sequence (BIOS + splash)\n- Working Notepad, Calculator, Paint, Minesweeper\n- Internet Explorer mock\n- Start menu, taskbar, shutdown\n\nEnjoy!') },
        { name: 'Notes.txt', icon: 'textfile', type: 'file', open: () => Programs.Notepad.open('My notes go here...') },
        { name: 'Pictures', icon: 'folder', type: 'folder' },
        { name: 'Letter.doc', icon: 'doc', type: 'file' }
      ]
    },
    controlpanel: {
      title: 'Control Panel',
      address: 'Control Panel',
      files: [
        { name: 'Display', icon: 'controlpanel', type: 'app', open: () => Programs.ControlPanel.openDisplay() },
        { name: 'Keyboard', icon: 'controlpanel', type: 'app' },
        { name: 'Mouse', icon: 'controlpanel', type: 'app' },
        { name: 'Sounds', icon: 'volume', type: 'app' },
        { name: 'System', icon: 'computer', type: 'app' },
        { name: 'Add/Remove Programs', icon: 'programs', type: 'app' },
        { name: 'Date/Time', icon: 'clock', type: 'app' },
        { name: 'Network', icon: 'network', type: 'app' }
      ]
    },
    recycle: {
      title: 'Recycle Bin',
      address: 'Recycle Bin',
      files: [
        { name: '(Empty)', icon: 'recycle', type: 'empty' }
      ]
    },
    network: {
      title: 'Network Neighborhood',
      address: 'Network Neighborhood',
      files: [
        { name: 'Entire Network', icon: 'network', type: 'folder' },
        { name: 'Workgroup', icon: 'computer', type: 'computer' }
      ]
    }
  };

  Programs.MyComputer = {
    open(view) {
      view = view || 'mycomputer';
      this.openView(view);
    },

    openView(view) {
      const v = VIEWS[view] || VIEWS.mycomputer;
      const body = Util.el('div', { class: 'explorer-body' });

      // Toolbar
      const toolbar = Util.el('div', { class: 'explorer-toolbar' });
      const mkBtn = (label, icon, fn) => {
        const b = Util.el('div', { class: 'explorer-tb-btn' });
        b.appendChild(Util.el('span', {}, Util.icon(icon)));
        b.appendChild(Util.el('span', {}, label));
        if (fn) b.addEventListener('click', fn);
        return b;
      };
      toolbar.appendChild(mkBtn('Up', 'folder', () => {
        if (view === 'drivec' || view === 'controlpanel' || view === 'recycle' || view === 'network') this.open('mycomputer');
        else if (view === 'windows' || view === 'docs') this.open('drivec');
      }));
      toolbar.appendChild(mkBtn('Properties', 'settings'));
      body.appendChild(toolbar);

      // Address bar
      const addr = Util.el('div', { class: 'explorer-address' });
      addr.appendChild(Util.el('span', { class: 'explorer-address-label' }, 'Address'));
      const field = Util.el('div', { class: 'explorer-address-field' });
      field.appendChild(Util.el('span', {}, '📁'));
      field.appendChild(Util.el('span', {}, v.address));
      addr.appendChild(field);
      body.appendChild(addr);

      // Files
      const files = Util.el('div', { class: 'explorer-files' });
      v.files.forEach(f => {
        const item = Util.el('div', { class: 'file-icon' });
        item.appendChild(Util.el('div', { class: 'fi-img' }, Util.icon(f.icon)));
        item.appendChild(Util.el('div', { class: 'fi-label' }, f.name));
        item.addEventListener('mousedown', e => {
          e.stopPropagation();
          files.querySelectorAll('.file-icon.selected').forEach(x => x.classList.remove('selected'));
          item.classList.add('selected');
        });
        item.addEventListener('dblclick', e => {
          e.stopPropagation();
          if (typeof f.open === 'function') f.open();
          else if (typeof f.open === 'string') this.openView(f.open);
          else if (f.type === 'file' && f.icon === 'textfile') Programs.Notepad.open();
        });
        files.appendChild(item);
      });
      body.appendChild(files);

      const win = WindowManager.create({
        title: v.title,
        icon: '🖥️',
        width: 500, height: 360,
        x: 80 + Math.floor(Math.random() * 40),
        y: 40 + Math.floor(Math.random() * 30),
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'Open', onClick: () => {} },
            { label: 'Create Shortcut' },
            { label: 'Properties' },
            { separator: true },
            { label: 'Close', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>E</u>dit', items: [
            { label: 'Undo' },
            { label: 'Copy' },
            { label: 'Paste' },
            { separator: true },
            { label: 'Select All' }
          ]},
          { label: '<u>V</u>iew', items: [
            { label: 'Large Icons' },
            { label: 'Small Icons' },
            { label: 'List' },
            { label: 'Details' }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'Help Topics', onClick: () => Programs.Help.open() },
            { separator: true },
            { label: 'About Windows 95', onClick: () => Programs.About.open('windows') }
          ]}
        ],
        statusBar: [v.files.length + ' object(s)', ''],
        content: body
      });
      return win;
    }
  };

  // Alias
  Programs.Explorer = Programs.MyComputer;
})();
