/* ===== Taskbar ===== */
const Taskbar = {
  clockInterval: null,

  init() {
    const startBtn = document.getElementById('start-button');
    startBtn.addEventListener('click', e => {
      e.stopPropagation();
      StartMenu.toggle();
    });

    // Start button active state
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
        startBtn.classList.remove('active');
      }
    });

    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 10000);
  },

  updateClock() {
    const el = document.getElementById('tray-clock');
    el.textContent = Util.formatTime(new Date());
  },

  addTask(winRecord) {
    const tasks = document.getElementById('taskbar-tasks');
    const task = Util.el('div', { class: 'taskbar-task', 'data-win': winRecord.id });
    task.appendChild(Util.el('span', { class: 'task-icon' }, winRecord.icon || '📄'));
    task.appendChild(Util.el('span', { class: 'task-text' }, winRecord.title));
    task.addEventListener('click', () => WindowManager.toggleTask(winRecord.id));
    tasks.appendChild(task);
    winRecord.taskbarId = winRecord.id;
    this.setActive(winRecord.id);
  },

  removeTask(id) {
    const t = document.querySelector('.taskbar-task[data-win="' + id + '"]');
    if (t) t.remove();
  },

  setActive(id) {
    document.querySelectorAll('.taskbar-task').forEach(t => t.classList.remove('active'));
    const t = document.querySelector('.taskbar-task[data-win="' + id + '"]');
    if (t) t.classList.add('active');
  },

  setInactive(id) {
    const t = document.querySelector('.taskbar-task[data-win="' + id + '"]');
    if (t) t.classList.remove('active');
  },

  setTitle(id, title) {
    const t = document.querySelector('.taskbar-task[data-win="' + id + '"] .task-text');
    if (t) t.textContent = title;
  }
};

/* ===== Start Menu ===== */
const StartMenu = {
  visible: false,

  toggle() {
    if (this.visible) this.hide();
    else this.show();
  },

  show() {
    const menu = document.getElementById('start-menu');
    const items = document.getElementById('start-menu-items');
    const btn = document.getElementById('start-button');
    items.innerHTML = '';

    const addItem = (icon, label, opts) => {
      opts = opts || {};
      const item = Util.el('div', { class: 'start-menu-item' });
      item.appendChild(Util.el('div', { class: 'smi-icon' }, Util.icon(icon)));
      item.appendChild(Util.el('div', { class: 'smi-text' }, label));
      if (opts.arrow) item.appendChild(Util.el('div', { class: 'smi-arrow' }, '▶'));
      if (opts.onClick) item.addEventListener('click', () => { this.hide(); opts.onClick(); });
      if (opts.submenu) {
        item.addEventListener('mouseenter', () => this.showSub(item, opts.submenu));
      }
      items.appendChild(item);
      return item;
    };

    addItem('programs', 'Programs', {
      arrow: true,
      submenu: [
        { icon: 'notepad', label: 'Notepad', onClick: () => Programs.Notepad.open() },
        { icon: 'calc', label: 'Calculator', onClick: () => Programs.Calculator.open() },
        { icon: 'paint', label: 'Paint', onClick: () => Programs.Paint.open() },
        { icon: 'mine', label: 'Minesweeper', onClick: () => Programs.Minesweeper.open() },
        { separator: true },
        { icon: 'ie', label: 'Internet Explorer', onClick: () => Programs.IE.open() },
        { icon: 'exe', label: 'Windows Explorer', onClick: () => Programs.MyComputer.open() },
        { icon: 'msdos', label: 'MS-DOS Prompt', onClick: () => Boot.msdosMode() }
      ]
    });

    addItem('documents', 'Documents', {
      arrow: true,
      submenu: [
        { icon: 'doc', label: '(Empty)' }
      ]
    });

    addItem('settings', 'Settings', {
      arrow: true,
      submenu: [
        { icon: 'controlpanel', label: 'Control Panel', onClick: () => Programs.ControlPanel.open() },
        { icon: 'printer', label: 'Printers' },
        { icon: 'settings', label: 'Taskbar...' }
      ]
    });

    addItem('find', 'Find', {
      arrow: true,
      submenu: [
        { icon: 'find', label: 'Files or Folders...' },
        { icon: 'computer', label: 'Computer...' }
      ]
    });

    addItem('help', 'Help', { onClick: () => Programs.Help.open() });

    addItem('run', 'Run...', { onClick: () => Programs.Run.open() });

    items.appendChild(Util.el('div', { class: 'start-menu-separator' }));

    addItem('shutdown', 'Shut Down...', { onClick: () => Programs.Shutdown.open() });

    menu.style.display = 'flex';
    btn.classList.add('active');
    this.visible = true;

    // Position
    menu.style.bottom = '28px';
    menu.style.left = '2px';

    // Close on outside click
    setTimeout(() => {
      const handler = (e) => {
        if (!e.target.closest('#start-menu') && !e.target.closest('#start-button') && !e.target.closest('.start-submenu')) {
          this.hide();
          document.removeEventListener('mousedown', handler, true);
        }
      };
      document.addEventListener('mousedown', handler, true);
    }, 0);
  },

  showSub(anchor, items) {
    // Remove existing sub
    document.querySelectorAll('.start-submenu').forEach(s => s.remove());
    const sub = Util.el('div', { class: 'submenu visible start-submenu' });
    items.forEach(it => {
      if (it.separator) { sub.appendChild(Util.el('div', { class: 'context-menu-separator' })); return; }
      const item = Util.el('div', { class: 'context-menu-item' + (it.disabled ? ' disabled' : '') });
      if (it.icon) item.appendChild(Util.el('span', { style: 'margin-right:6px;' }, Util.icon(it.icon)));
      item.appendChild(document.createTextNode(it.label));
      if (it.items) {
        item.appendChild(Util.el('span', { style: 'float:right;margin-left:16px;' }, '▶'));
        item.addEventListener('mouseenter', () => this.showSub(item, it.items));
      } else if (!it.disabled && it.onClick) {
        item.addEventListener('click', () => { it.onClick(); this.hide(); });
      }
      sub.appendChild(item);
    });
    const rect = anchor.getBoundingClientRect();
    sub.style.left = rect.right + 'px';
    sub.style.top = rect.top + 'px';
    document.body.appendChild(sub);
    anchor._sub = sub;
  },

  hide() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('start-button').classList.remove('active');
    document.querySelectorAll('.start-submenu').forEach(s => s.remove());
    this.visible = false;
  }
};
