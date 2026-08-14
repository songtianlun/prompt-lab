/* ===== Window Manager ===== */
const WindowManager = {
  windows: [],
  zIndex: 10,
  activeWin: null,
  taskbarCallbacks: [],

  create(opts) {
    opts = opts || {};
    const id = 'win-' + (this.windows.length + 1) + '-' + Date.now();
    const container = document.getElementById('windows-container');

    const win = Util.el('div', { class: 'window', id: id });
    win.style.width = (opts.width || 320) + 'px';
    win.style.height = (opts.height || 240) + 'px';
    win.style.left = (opts.x != null ? opts.x : (80 + this.windows.length * 24)) + 'px';
    win.style.top = (opts.y != null ? opts.y : (40 + this.windows.length * 20)) + 'px';
    if (opts.maximized) {
      win.style.left = '0px';
      win.style.top = '0px';
      win.style.width = window.innerWidth + 'px';
      win.style.height = (window.innerHeight - 28) + 'px';
    }

    // Title bar
    const titleBar = Util.el('div', { class: 'title-bar' });
    if (opts.icon) {
      titleBar.appendChild(Util.el('span', { class: 'title-bar-icon' }, opts.icon));
    }
    titleBar.appendChild(Util.el('span', { class: 'title-bar-text' }, opts.title || 'Window'));
    const btns = Util.el('div', { class: 'title-bar-buttons' });
    if (opts.minimizable !== false) {
      const minBtn = Util.el('button', { class: 'title-bar-btn tb-min', title: 'Minimize', 'aria-label': 'Minimize' });
      minBtn.addEventListener('mousedown', e => e.stopPropagation());
      minBtn.addEventListener('click', e => { e.stopPropagation(); this.minimize(id); });
      btns.appendChild(minBtn);
    }
    if (opts.maximizable !== false) {
      const maxBtn = Util.el('button', { class: 'title-bar-btn tb-max', title: 'Maximize', 'aria-label': 'Maximize' });
      maxBtn.addEventListener('mousedown', e => e.stopPropagation());
      maxBtn.addEventListener('click', e => { e.stopPropagation(); this.toggleMaximize(id); });
      btns.appendChild(maxBtn);
    }
    const closeBtn = Util.el('button', { class: 'title-bar-btn tb-close', title: 'Close', 'aria-label': 'Close' });
    closeBtn.addEventListener('mousedown', e => e.stopPropagation());
    closeBtn.addEventListener('click', e => { e.stopPropagation(); this.close(id); });
    btns.appendChild(closeBtn);
    titleBar.appendChild(btns);
    win.appendChild(titleBar);

    // Menu bar (optional)
    if (opts.menu) {
      const menuBar = Util.el('div', { class: 'menu-bar' });
      opts.menu.forEach(m => {
        const item = Util.el('div', { class: 'menu-item' + (m.disabled ? ' disabled' : '') }, m.label);
        if (m.items) {
          item.addEventListener('mousedown', e => {
            e.stopPropagation();
            this.openMenu(item, m.items, win);
          });
        } else if (m.onClick) {
          item.addEventListener('click', e => { e.stopPropagation(); m.onClick(); });
        }
        menuBar.appendChild(item);
      });
      win.appendChild(menuBar);
    }

    // Body
    const body = Util.el('div', { class: 'window-body' });
    if (opts.content) {
      if (typeof opts.content === 'string') body.innerHTML = opts.content;
      else body.appendChild(opts.content);
    }
    win.appendChild(body);

    // Status bar (optional)
    if (opts.statusBar) {
      const sb = Util.el('div', { class: 'status-bar' });
      opts.statusBar.forEach(f => {
        sb.appendChild(Util.el('div', { class: 'status-bar-field' }, f));
      });
      win.appendChild(sb);
    }

    // Resize handles (only if resizable)
    if (opts.resizable !== false && !opts.maximized) {
      ['se', 's', 'e', 'sw', 'w', 'nw', 'ne', 'n'].forEach(dir => {
        win.appendChild(Util.el('div', { class: 'resize-handle ' + dir, 'data-dir': dir }));
      });
    }

    container.appendChild(win);

    // Window record
    const record = {
      id, el: win, title: opts.title || 'Window', icon: opts.icon || '',
      minimized: false, maximized: !!opts.maximizable && opts.maximized,
      prevRect: null, program: opts.program || null,
      onClose: opts.onClose, taskbarId: null,
      body: body
    };
    this.windows.push(record);

    // Events
    this.attachDrag(win, titleBar);
    this.attachResize(win);
    win.addEventListener('mousedown', () => this.focus(id));

    // Notify taskbar
    Taskbar.addTask(record);

    this.focus(id);
    return record;
  },

  attachDrag(win, handle) {
    let dragging = false, sx, sy, ox, oy;
    handle.addEventListener('mousedown', e => {
      if (e.target.closest('.title-bar-buttons')) return;
      if (win.dataset.maximized === 'true') return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(win.style.left); oy = parseInt(win.style.top);
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      ny = Math.max(0, ny);
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  },

  attachResize(win) {
    win.querySelectorAll('.resize-handle').forEach(h => {
      h.addEventListener('mousedown', e => {
        if (win.dataset.maximized === 'true') return;
        e.stopPropagation();
        e.preventDefault();
        const dir = h.dataset.dir;
        const sx = e.clientX, sy = e.clientY;
        const ow = parseInt(win.style.width), oh = parseInt(win.style.height);
        const ol = parseInt(win.style.left), ot = parseInt(win.style.top);
        let resizing = true;
        const move = (ev) => {
          if (!resizing) return;
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (dir.includes('e')) win.style.width = Math.max(120, ow + dx) + 'px';
          if (dir.includes('s')) win.style.height = Math.max(80, oh + dy) + 'px';
          if (dir.includes('w')) {
            const nw = Math.max(120, ow - dx);
            win.style.width = nw + 'px';
            win.style.left = (ol + (ow - nw)) + 'px';
          }
          if (dir.includes('n')) {
            const nh = Math.max(80, oh - dy);
            win.style.height = nh + 'px';
            win.style.top = (ot + (oh - nh)) + 'px';
          }
        };
        const up = () => { resizing = false; document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    });
  },

  focus(id) {
    this.windows.forEach(w => {
      w.el.classList.remove('active');
      w.el.classList.add('inactive');
    });
    const w = this.windows.find(x => x.id === id);
    if (!w) return;
    w.el.classList.remove('inactive');
    w.el.classList.add('active');
    w.el.style.zIndex = ++this.zIndex;
    this.activeWin = w;
    Taskbar.setActive(id);
  },

  close(id) {
    const idx = this.windows.findIndex(w => w.id === id);
    if (idx < 0) return;
    const w = this.windows[idx];
    if (w.onClose) w.onClose();
    w.el.remove();
    this.windows.splice(idx, 1);
    Taskbar.removeTask(id);
    if (this.activeWin && this.activeWin.id === id) {
      this.activeWin = null;
      const top = this.windows.filter(x => !x.minimized).sort((a, b) => parseInt(b.el.style.zIndex) - parseInt(a.el.style.zIndex))[0];
      if (top) this.focus(top.id);
    }
  },

  minimize(id) {
    const w = this.windows.find(x => x.id === id);
    if (!w) return;
    w.minimized = true;
    w.el.style.display = 'none';
    Taskbar.setInactive(id);
    if (this.activeWin && this.activeWin.id === id) {
      this.activeWin = null;
      const top = this.windows.filter(x => !x.minimized).sort((a, b) => parseInt(b.el.style.zIndex) - parseInt(a.el.style.zIndex))[0];
      if (top) this.focus(top.id);
    }
  },

  restore(id) {
    const w = this.windows.find(x => x.id === id);
    if (!w) return;
    w.minimized = false;
    w.el.style.display = 'flex';
    this.focus(id);
  },

  toggleTask(id) {
    const w = this.windows.find(x => x.id === id);
    if (!w) return;
    if (w.minimized) this.restore(id);
    else if (this.activeWin && this.activeWin.id === id) this.minimize(id);
    else this.focus(id);
  },

  toggleMaximize(id) {
    const w = this.windows.find(x => x.id === id);
    if (!w) return;
    if (w.el.dataset.maximized === 'true') {
      w.el.dataset.maximized = 'false';
      if (w.prevRect) {
        w.el.style.left = w.prevRect.left;
        w.el.style.top = w.prevRect.top;
        w.el.style.width = w.prevRect.width;
        w.el.style.height = w.prevRect.height;
      }
    } else {
      w.prevRect = {
        left: w.el.style.left, top: w.el.style.top,
        width: w.el.style.width, height: w.el.style.height
      };
      w.el.dataset.maximized = 'true';
      w.el.style.left = '0px';
      w.el.style.top = '0px';
      w.el.style.width = window.innerWidth + 'px';
      w.el.style.height = (window.innerHeight - 28) + 'px';
    }
    this.focus(id);
  },

  openMenu(anchor, items, win) {
    this.closeAllMenus();
    const menu = Util.el('div', { class: 'submenu visible' });
    items.forEach(it => {
      if (it.separator) {
        menu.appendChild(Util.el('div', { class: 'context-menu-separator' }));
      } else {
        const item = Util.el('div', { class: 'context-menu-item' + (it.disabled ? ' disabled' : '') });
        if (it.icon) item.appendChild(Util.el('span', { style: 'margin-right:6px;' }, it.icon));
        item.appendChild(document.createTextNode(it.label));
        if (it.shortcut) {
          item.appendChild(Util.el('span', { style: 'float:right;margin-left:20px;color:#808080;' }, it.shortcut));
        }
        if (!it.disabled && it.onClick) {
          item.addEventListener('click', () => { it.onClick(); this.closeAllMenus(); });
        }
        menu.appendChild(item);
      }
    });
    const rect = anchor.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom) + 'px';
    document.body.appendChild(menu);
    this._currentMenu = menu;
    setTimeout(() => {
      const handler = (e) => {
        if (!menu.contains(e.target)) { this.closeAllMenus(); document.removeEventListener('mousedown', handler, true); }
      };
      document.addEventListener('mousedown', handler, true);
    }, 0);
  },

  closeAllMenus() {
    if (this._currentMenu) { this._currentMenu.remove(); this._currentMenu = null; }
  }
};
