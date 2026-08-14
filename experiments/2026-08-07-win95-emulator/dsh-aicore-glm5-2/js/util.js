/* ===== Utilities ===== */
const Util = {
  $: (sel, root) => (root || document).querySelector(sel),
  $$: (sel, root) => Array.from((root || document).querySelectorAll(sel)),

  el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') e.className = attrs[k];
        else if (k === 'style') e.setAttribute('style', attrs[k]);
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (k === 'html') e.innerHTML = attrs[k];
        else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
      }
    }
    for (const c of children) {
      if (c == null) continue;
      if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(String(c)));
      else e.appendChild(c);
    }
    return e;
  },

  clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

  delay: (ms) => new Promise(r => setTimeout(r, ms)),

  // Simulate typewriter into an element
  async typewriter(el, text, perChar = 8) {
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      await Util.delay(perChar);
    }
  },

  pad2(n) { return n < 10 ? '0' + n : '' + n; },

  formatTime(d) {
    let h = d.getHours();
    const m = Util.pad2(d.getMinutes());
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + m + ' ' + ampm;
  },

  // Generate a simple emoji/CSS icon
  icon(name) {
    return ICONS[name] || '📄';
  },

  onDocClick(handler) {
    document.addEventListener('mousedown', handler, true);
  }
};

/* ===== Icon map (emoji-based pixel-ish icons) ===== */
const ICONS = {
  computer: '🖥️',
  mycomputer: '🖥️',
  recycle: '🗑️',
  network: '🌐',
  folder: '📁',
  folder_open: '📂',
  doc: '📄',
  notepad: '📝',
  calc: '🧮',
  paint: '🎨',
  mine: '💣',
  ie: '🌐',
  help: '❓',
  run: '🏃',
  find: '🔍',
  settings: '⚙️',
  controlpanel: '⚙️',
  programs: '📦',
  documents: '📜',
  shutdown: '⏻',
  msdos: '⬛',
  floppy: '💾',
  cdrom: '💿',
  hdd: '💽',
  printer: '🖨️',
  about: 'ℹ️',
  volume: '🔊',
  clock: '🕐',
  info: 'ℹ️',
  warning: '⚠️',
  error: '⛔',
  exe: '⚙️',
  textfile: '📄',
  imagefile: '🖼️',
  exe_app: '🎯'
};
