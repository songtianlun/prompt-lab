/* ===== Notepad ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  window.Programs.Notepad = {
  open(content) {
    const body = Util.el('div', { class: 'notepad-body' });
    const ta = Util.el('textarea', { class: 'notepad-textarea', spellcheck: 'false' });
    ta.value = content || '';
    body.appendChild(ta);

    const win = WindowManager.create({
      title: 'Untitled - Notepad',
      icon: '📝',
      width: 480, height: 360,
      x: 120, y: 60,
      menu: [
        { label: '<u>F</u>ile', items: [
          { label: 'New', shortcut: 'Ctrl+N', onClick: () => { ta.value = ''; win.title = 'Untitled - Notepad'; Taskbar.setTitle(win.id, win.title); } },
          { label: 'Open...', shortcut: 'Ctrl+O', onClick: () => this.openFile(ta, win) },
          { label: 'Save', shortcut: 'Ctrl+S', onClick: () => this.save(ta) },
          { label: 'Save As...', onClick: () => this.save(ta) },
          { separator: true },
          { label: 'Page Setup...' },
          { label: 'Print', shortcut: 'Ctrl+P' },
          { separator: true },
          { label: 'Exit', onClick: () => WindowManager.close(win.id) }
        ]},
        { label: '<u>E</u>dit', items: [
          { label: 'Undo', shortcut: 'Ctrl+Z' },
          { separator: true },
          { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => document.execCommand('cut') },
          { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => document.execCommand('copy') },
          { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => { ta.focus(); document.execCommand('paste'); } },
          { label: 'Delete', shortcut: 'Del' },
          { separator: true },
          { label: 'Select All', shortcut: 'Ctrl+A', onClick: () => ta.select() },
          { label: 'Time/Date', shortcut: 'F5', onClick: () => { ta.value += new Date().toLocaleString(); } }
        ]},
        { label: '<u>S</u>earch', items: [
          { label: 'Find...', shortcut: 'Ctrl+F' },
          { label: 'Find Next', shortcut: 'F3' }
        ]},
        { label: '<u>H</u>elp', items: [
          { label: 'Help Topics', onClick: () => Programs.Help.open('notepad') },
          { separator: true },
          { label: 'About Notepad', onClick: () => Programs.About.open('notepad') }
        ]}
      ],
      content: body
    });
    ta.addEventListener('input', () => {
      const name = win.title.startsWith('*') ? win.title : '*' + win.title;
      win.title = name;
      Taskbar.setTitle(win.id, name);
    });
    setTimeout(() => ta.focus(), 50);
    return win;
  },

  openFile(ta, win) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/*';
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        ta.value = reader.result;
        win.title = file.name + ' - Notepad';
        Taskbar.setTitle(win.id, win.title);
      };
      reader.readAsText(file);
    });
    input.click();
  },

  save(ta) {
    const blob = new Blob([ta.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Untitled.txt';
    a.click();
  }
};
})();
