/* ===== Desktop ===== */
const Desktop = {
  icons: [
    { id: 'mycomputer', label: 'My Computer', icon: 'mycomputer', action: () => Programs.MyComputer.open() },
    { id: 'recycle',    label: 'Recycle Bin', icon: 'recycle',    action: () => Programs.MyComputer.open('recycle') },
    { id: 'network',    label: 'Network Neighborhood', icon: 'network', action: () => Programs.MyComputer.open('network') },
    { id: 'ie',         label: 'The Internet', icon: 'ie',        action: () => Programs.IE.open() },
    { id: 'notepad',    label: 'Notepad', icon: 'notepad',        action: () => Programs.Notepad.open() },
    { id: 'mine',       label: 'Minesweeper', icon: 'mine',       action: () => Programs.Minesweeper.open() },
    { id: 'paint',      label: 'Paint', icon: 'paint',            action: () => Programs.Paint.open() }
  ],

  selectedIcon: null,

  init() {
    const container = document.getElementById('desktop-icons');
    container.innerHTML = '';
    this.icons.forEach(ic => {
      const el = Util.el('div', { class: 'desktop-icon', 'data-id': ic.id });
      el.appendChild(Util.el('div', { class: 'icon-img' }, Util.icon(ic.icon)));
      const label = Util.el('div', { class: 'icon-label' }, ic.label);
      el.appendChild(label);
      el.addEventListener('mousedown', e => {
        e.stopPropagation();
        this.selectIcon(el);
      });
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        ic.action();
      });
      container.appendChild(el);
    });

    // Desktop click: deselect
    document.getElementById('desktop').addEventListener('mousedown', e => {
      if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons') || e.target.id === 'windows-container') {
        this.clearSelection();
        ContextMenu.hide();
        StartMenu.hide();
      }
    });

    // Right click context menu
    document.getElementById('desktop').addEventListener('contextmenu', e => {
      if (e.target.id === 'desktop' || e.target.classList.contains('desktop-icons') || e.target.id === 'windows-container') {
        e.preventDefault();
        ContextMenu.show(e.clientX, e.clientY, [
          { label: 'Arrange Icons' },
          { label: 'Line up Icons' },
          { separator: true },
          { label: 'Paste' },
          { label: 'Paste Shortcut' },
          { separator: true },
          { label: 'New', items: [
            { label: 'Folder' },
            { label: 'Text Document', onClick: () => Programs.Notepad.open() },
            { separator: true },
            { label: 'Briefcase' }
          ]},
          { separator: true },
          { label: 'Properties', onClick: () => Programs.ControlPanel.openDisplay() }
        ]);
      }
    });
  },

  selectIcon(el) {
    this.clearSelection();
    el.classList.add('selected');
    this.selectedIcon = el;
  },

  clearSelection() {
    document.querySelectorAll('.desktop-icon.selected').forEach(e => e.classList.remove('selected'));
    this.selectedIcon = null;
  }
};

/* ===== Context Menu ===== */
const ContextMenu = {
  current: null,
  show(x, y, items) {
    this.hide();
    const menu = Util.el('div', { class: 'context-menu' });
    items.forEach(it => {
      if (it.separator) {
        menu.appendChild(Util.el('div', { class: 'context-menu-separator' }));
        return;
      }
      const item = Util.el('div', { class: 'context-menu-item' + (it.disabled ? ' disabled' : '') }, it.label);
      if (it.items) {
        item.appendChild(Util.el('span', { style: 'float:right;margin-left:16px;' }, '▶'));
        item.addEventListener('mouseenter', () => this.showSub(item, it.items));
      } else if (!it.disabled && it.onClick) {
        item.addEventListener('click', () => { it.onClick(); this.hide(); });
      }
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    // Position
    const rect = menu.getBoundingClientRect();
    let nx = x, ny = y;
    if (nx + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 4;
    if (ny + rect.height > window.innerHeight - 28) ny = window.innerHeight - 28 - rect.height - 4;
    menu.style.left = nx + 'px';
    menu.style.top = ny + 'px';
    this.current = menu;
    setTimeout(() => {
      const handler = (e) => {
        if (!menu.contains(e.target)) { this.hide(); document.removeEventListener('mousedown', handler, true); }
      };
      document.addEventListener('mousedown', handler, true);
    }, 0);
  },

  showSub(anchor, items) {
    // For simplicity, basic submenu
    const old = anchor.querySelector('.context-menu');
    if (old) old.remove();
    const sub = Util.el('div', { class: 'context-menu', style: 'position:absolute;' });
    items.forEach(it => {
      if (it.separator) { sub.appendChild(Util.el('div', { class: 'context-menu-separator' })); return; }
      const item = Util.el('div', { class: 'context-menu-item' + (it.disabled ? ' disabled' : '') }, it.label);
      if (!it.disabled && it.onClick) item.addEventListener('click', () => { it.onClick(); this.hide(); });
      sub.appendChild(item);
    });
    const rect = anchor.getBoundingClientRect();
    sub.style.left = rect.right + 'px';
    sub.style.top = rect.top + 'px';
    document.body.appendChild(sub);
    anchor._sub = sub;
  },

  hide() {
    if (this.current) { this.current.remove(); this.current = null; }
  }
};
