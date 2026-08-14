/* ============================================================
   Windows 95 模拟器 — 桌面 / 任务栏 / 开始菜单
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const DESKTOP_ICONS_DEFAULT = [
    { id: "computer", name: "我的电脑", icon: "computer", action: () => W95.openApp("explorer", { path: "C:/" }) },
    { id: "network", name: "网上邻居", icon: "network", action: () => W95.msgbox({ title: "网上邻居", icon: "info", text: "无法浏览整个网络。\r\n（本模拟器为单机环境）", buttons: ["确定"] }) },
    { id: "recycle", name: "回收站", icon: "recycle", action: () => W95.openApp("recycle") },
    { id: "mydocs", name: "我的文档", icon: "mydocs", action: () => W95.openApp("explorer", { path: "C:/My Documents" }) },
    { id: "notepad", name: "记事本", icon: "notepad", action: () => W95.openApp("notepad") },
    { id: "minesweeper", name: "扫雷", icon: "mine", action: () => W95.openApp("minesweeper") },
    { id: "solitaire", name: "纸牌", icon: "solitaire", action: () => W95.openApp("solitaire") },
  ];

  const Shell = {
    startOpen: false,
    icons: [],
    selected: [],
  };
  W95.Shell = Shell;

  const desktopEl = () => W95.$("#desktop");
  const iconsEl = () => W95.$("#desktop-icons");
  const startMenuEl = () => W95.$("#start-menu");
  const startBtnEl = () => W95.$("#start-button");

  /* ---------------- desktop icons ---------------- */
  function loadIcons() {
    const saved = W95.store.get("desktop-icons", null);
    let defs = DESKTOP_ICONS_DEFAULT.slice();
    if (saved && Array.isArray(saved)) {
      const byId = {};
      defs.forEach((d) => (byId[d.id] = d));
      Shell.icons = saved.map((s) => Object.assign({}, byId[s.id] || { id: s.id }, s));
    } else {
      Shell.icons = defs.map((d, i) =>
        Object.assign({}, d, {
          x: 12 + (i % 4) * 82,
          y: 14 + Math.floor(i / 4) * 82,
        })
      );
    }
  }

  function saveIcons() {
    W95.store.set(
      "desktop-icons",
      Shell.icons.map((i) => ({ id: i.id, x: i.x, y: i.y }))
    );
  }

  function renderIcons() {
    const wrap = iconsEl();
    wrap.innerHTML = "";
    Shell.icons.forEach((ic) => {
      const el = W95.el("div", {
        class: "desk-icon",
        style: { left: ic.x + "px", top: ic.y + "px" },
      });
      el.appendChild(W95.el("span", { class: "icon-img", html: W95.icon(ic.icon, 32) }));
      const label = W95.el("span", { class: "icon-label", text: ic.name });
      el.appendChild(label);
      el._icon = ic;

      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (e.button === 2) {
          selectIcon(ic, e.ctrlKey);
          return;
        }
        const wasSelected = Shell.selected.includes(ic);
        if (!e.ctrlKey && !wasSelected) selectOnly(ic);
        else if (e.ctrlKey) toggleSelect(ic);
        startIconDrag(e, el);
      });
      el.addEventListener("dblclick", () => {
        try { ic.action(); } catch (err) { console.error(err); }
      });
      wrap.appendChild(el);
    });
  }

  function iconElFor(ic) {
    return W95.$$("#desktop-icons .desk-icon").find((x) => x._icon === ic) || null;
  }

  function selectOnly(ic) {
    Shell.selected = [ic];
    refreshSelection();
  }
  function toggleSelect(ic) {
    const i = Shell.selected.indexOf(ic);
    if (i >= 0) Shell.selected.splice(i, 1);
    else Shell.selected.push(ic);
    refreshSelection();
  }
  function selectIcon(ic, add) {
    if (add) toggleSelect(ic);
    else selectOnly(ic);
  }
  function clearSelection() {
    Shell.selected = [];
    refreshSelection();
  }
  function refreshSelection() {
    W95.$$("#desktop-icons .desk-icon").forEach((el) => {
      const sel = Shell.selected.includes(el._icon);
      el.classList.toggle("selected", sel);
    });
  }

  function startIconDrag(e, el) {
    const ic = el._icon;
    const startX = e.clientX, startY = e.clientY;
    const origX = ic.x, origY = ic.y;
    let moved = false;
    const s = () => window.__w95ResolutionScale || 1;
    const move = (ev) => {
      const dx = (ev.clientX - startX) / s();
      const dy = (ev.clientY - startY) / s();
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      ic.x = Math.max(0, Math.round(origX + dx));
      ic.y = Math.max(0, Math.round(origY + dy));
      el.style.left = ic.x + "px";
      el.style.top = ic.y + "px";
      el.classList.add("dragging");
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      el.classList.remove("dragging");
      if (moved) saveIcons();
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  // 桌面右键菜单
  function desktopContextMenu(e) {
    const items = [
      {
        label: "排列图标(I)", submenu: [
          { label: "按名称", action: () => arrangeIcons("name") },
          { label: "按类型", action: () => arrangeIcons("type") },
          { label: "按大小", action: () => arrangeIcons("size") },
          { label: "按日期", action: () => arrangeIcons("date") },
          { sep: true },
          { label: "自动排列", checked: Shell.autoArrange, action: () => { Shell.autoArrange = !Shell.autoArrange; if (Shell.autoArrange) arrangeIcons("name"); } },
        ],
      },
      { label: "对齐图标(L)", action: () => alignIcons() },
      { sep: true },
      { label: "刷新(R)", action: () => renderIcons() },
      { sep: true },
      {
        label: "新建(W)", submenu: [
          { label: "文件夹(F)", action: async () => {
            const name = await W95.inputBox({ title: "新建文件夹", text: "请输入文件夹名称:", value: "新建文件夹" });
            if (name) {
              const id = "folder-" + Date.now();
              Shell.icons.push({ id, name, icon: "folder", x: 20 + Math.random() * 200, y: 20 + Math.random() * 120, action: () => W95.msgbox({ title: name, icon: "info", text: "桌面文件夹（示例）。", buttons: ["确定"] }) });
              renderIcons(); saveIcons();
            }
          } },
          { label: "文本文档", action: async () => {
            const name = await W95.inputBox({ title: "新建文本文档", text: "请输入文件名:", value: "新建 文本文档.txt" });
            if (name) {
              const id = "txt-" + Date.now();
              Shell.icons.push({ id, name, icon: "txtfile", x: 20 + Math.random() * 200, y: 20 + Math.random() * 120, action: () => W95.openApp("notepad", { desktopFile: id }) });
              renderIcons(); saveIcons();
            }
          } },
          { label: "快捷方式(S)", action: () => {
            W95.runDialog();
          } },
        ],
      },
      { sep: true },
      { label: "属性(R)", action: () => W95.openApp("props", { page: "display" }) },
    ];
    if (Shell.selected.length) {
      items.unshift({
        label: Shell.selected.length === 1 ? "打开(O)" : "打开",
        action: () => Shell.selected[0].action(),
      });
      items.splice(1, 0, { sep: true });
    }
    W95.popupMenu(items, { x: e.clientX, y: e.clientY });
  }

  function arrangeIcons(by) {
    const sorted = Shell.icons.slice();
    if (by === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    else if (by === "type") sorted.sort((a, b) => (a.icon < b.icon ? -1 : 1));
    else if (by === "size") sorted.sort((a, b) => (a.id < b.id ? -1 : 1));
    else if (by === "date") sorted.sort((a, b) => (a.id > b.id ? -1 : 1));
    const cols = Math.max(1, Math.floor((window.innerWidth - 20) / 82));
    sorted.forEach((ic, i) => {
      ic.x = 12 + (i % cols) * 82;
      ic.y = 14 + Math.floor(i / cols) * 82;
    });
    Shell.icons = sorted;
    renderIcons();
    saveIcons();
  }
  function alignIcons() {
    const cols = Math.max(1, Math.floor((window.innerWidth - 20) / 82));
    Shell.icons.forEach((ic, i) => {
      ic.x = 12 + (i % cols) * 82;
      ic.y = 14 + Math.floor(i / cols) * 82;
    });
    renderIcons();
    saveIcons();
  }

  // 桌面橡皮筋选择 + 空白处右键
  function initDesktop() {
    const d = desktopEl();
    d.addEventListener("mousedown", (e) => {
      if (e.target !== d && !e.target.closest("#desktop-icons") && e.target.id !== "desktop-icons") {
        clearSelection();
        return;
      }
      if (e.button !== 0) return;
      // 点击桌面图标时不启动橡皮筋（避免遮挡图标事件）
      if (e.target.closest(".desk-icon")) return;
      // 橡皮筋
      const band = W95.$("#desktop-rubberband");
      const sx = e.clientX, sy = e.clientY;
      band.classList.remove("hidden");
      band.style.left = sx + "px"; band.style.top = sy + "px";
      band.style.width = "0px"; band.style.height = "0px";
      clearSelection();
      const move = (ev) => {
        const s = () => window.__w95ResolutionScale || 1;
        const x = Math.min(sx, ev.clientX) / s(), y = Math.min(sy, ev.clientY) / s();
        const w = Math.abs(ev.clientX - sx) / s(), h = Math.abs(ev.clientY - sy) / s();
        band.style.left = x + "px"; band.style.top = y + "px";
        band.style.width = w + "px"; band.style.height = h + "px";
        const bx = x, by = y, bw = w, bh = h;
        Shell.selected = Shell.icons.filter((ic) => {
          const ex = ic.x + 20, ey = ic.y + 20;
          return ex >= bx && ex <= bx + bw && ey >= by && ey <= by + bh;
        });
        refreshSelection();
      };
      const up = () => {
        band.classList.add("hidden");
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
    d.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const iconEl2 = e.target.closest(".desk-icon");
      if (!iconEl2) desktopContextMenu(e);
    });
  }

  /* ---------------- taskbar ---------------- */
  const Taskbar = {
    buttons: new Map(), // win -> button el
    addButton(win) {
      const wrap = W95.$("#taskbar-buttons");
      const b = W95.el("button", { class: "task-button", type: "button", title: win.opts.title });
      b.appendChild(W95.el("span", { class: "tb-icon", html: W95.icon(win.opts.icon || "appfile", 16) }));
      const label = W95.el("span", { class: "tb-label", text: win.opts.title });
      b.appendChild(label);
      b.addEventListener("click", () => {
        if (win.minimized) W95.WM.restore(win);
        else if (W95.WM.active === win) W95.WM.minimize(win);
        else W95.WM.restore(win);
      });
      wrap.appendChild(b);
      this.buttons.set(win, b);
      this.layoutButtons();
    },
    removeButton(win) {
      const b = this.buttons.get(win);
      if (b) b.remove();
      this.buttons.delete(win);
      this.layoutButtons();
    },
    syncButtons() {
      this.buttons.forEach((b, win) => {
        b.classList.toggle("active", W95.WM.active === win && !win.minimized);
        const label = b.querySelector(".tb-label");
        label.textContent = win.opts.title;
      });
    },
    layoutButtons() {
      // 已由 CSS flex 处理
    },
  };
  W95.Taskbar = Taskbar;

  function initTaskbar() {
    const startBtn = startBtnEl();
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStartMenu();
    });

    // 时钟
    const clock = W95.$("#tray-clock");
    function tick() {
      const d = new Date();
      let h = d.getHours();
      const ap = h >= 12 ? "下午" : "上午";
      h = h % 12; if (h === 0) h = 12;
      const m = String(d.getMinutes()).padStart(2, "0");
      clock.textContent = ap + " " + h + ":" + m;
    }
    tick();
    setInterval(tick, 10000);
    clock.addEventListener("dblclick", () => W95.openApp("props", { page: "datetime" }));
    clock.addEventListener("click", () => {
      W95.$("#tray-clock").title = new Date().toLocaleDateString("zh-CN");
    });

    // 任务栏右键菜单
    const tb = W95.$("#taskbar");
    tb.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const items = [
        { label: "层叠窗口(S)", action: () => cascadeWindows() },
        { label: "横向平铺窗口(H)", action: () => tileWindows("h") },
        { label: "纵向平铺窗口(V)", action: () => tileWindows("v") },
        { sep: true },
        { label: "最小化所有窗口(M)", action: () => W95.WM.minimizeAll() },
        { sep: true },
        { label: "属性(R)", action: () => W95.openApp("props", { page: "taskbar" }) },
      ];
      W95.popupMenu(items, { x: e.clientX, y: e.clientY });
    });

    // 窗口排列
    function cascadeWindows() {
      const wins = W95.WM.windows.filter((w) => !w.minimized);
      const n = Math.min(wins.length, 8);
      wins.forEach((w, i) => {
        w.restore();
        w.maximized = false;
        w.el.classList.remove("maximized");
        const s = () => window.__w95ResolutionScale || 1;
        const vw = window.innerWidth / s(), vh = window.innerHeight / s();
        const cw = Math.max(240, vw - 120), ch = Math.max(160, vh - 140);
        w.el.style.left = i * 20 + "px";
        w.el.style.top = i * 20 + "px";
        w.el.style.width = cw + "px";
        w.el.style.height = ch + "px";
        if (w.onResize) w.onResize();
      });
      W95.Taskbar.syncButtons();
    }
    function tileWindows(mode) {
      const wins = W95.WM.windows.filter((w) => !w.minimized);
      if (!wins.length) return;
      const s = () => window.__w95ResolutionScale || 1;
      const vw = window.innerWidth / s(), vh = window.innerHeight / s();
      const cols = mode === "v" ? Math.ceil(Math.sqrt(wins.length)) : 1;
      const rows = mode === "h" ? wins.length : Math.ceil(wins.length / cols);
      const ww = vw / cols, wh = vh / rows;
      wins.forEach((w, i) => {
        w.restore();
        w.maximized = false;
        w.el.classList.remove("maximized");
        const r = Math.floor(i / cols), c = i % cols;
        w.el.style.left = c * ww + "px";
        w.el.style.top = r * wh + "px";
        w.el.style.width = ww + "px";
        w.el.style.height = wh + "px";
        if (w.onResize) w.onResize();
      });
      W95.Taskbar.syncButtons();
    }
  }

  /* ---------------- start menu ---------------- */
  const START_CASCADES = {
    programs: [
      {
        label: "附件", icon: "folder", submenu: [
          { label: "画图", icon: "paint", action: () => W95.openApp("paint") },
          { label: "记事本", icon: "notepad", action: () => W95.openApp("notepad") },
          { label: "计算器", icon: "calc", action: () => W95.openApp("calc") },
          { label: "写字板", icon: "notepad", action: () => W95.msgbox({ title: "写字板", icon: "info", text: "请使用记事本代替。", buttons: ["确定"] }) },
          { sep: true },
          { label: "游戏", icon: "folder", submenu: [
            { label: "扫雷", icon: "mine", action: () => W95.openApp("minesweeper") },
            { label: "纸牌", icon: "solitaire", action: () => W95.openApp("solitaire") },
          ] },
          { sep: true },
          { label: "MS-DOS 方式", icon: "msdos", action: () => W95.openApp("msdos") },
        ],
      },
      { label: "Windows 资源管理器", icon: "explorer", action: () => W95.openApp("explorer", { path: "C:/" }) },
      { label: "欢迎使用 Windows 95", icon: "help", action: () => W95.openApp("welcome") },
    ],
    settings: [
      { label: "控制面板", icon: "cpl", action: () => W95.openApp("control") },
      { label: "打印机", icon: "printer", action: () => W95.msgbox({ title: "打印机", icon: "info", text: "未安装打印机。", buttons: ["确定"] }) },
      { sep: true },
      { label: "任务栏和开始菜单...", icon: "taskbar", action: () => W95.openApp("props", { page: "taskbar" }) },
    ],
    find: [
      { label: "文件或文件夹(F)...", icon: "find", action: () => W95.openApp("find") },
      { label: "计算机(C)...", icon: "computer", action: () => W95.msgbox({ title: "查找: 计算机", icon: "info", text: "未找到任何计算机。", buttons: ["确定"] }) },
    ],
  };

  function toggleStartMenu() {
    if (Shell.startOpen) closeStartMenu();
    else openStartMenu();
  }
  W95.toggleStartMenu = toggleStartMenu;

  function openStartMenu() {
    Shell.startOpen = true;
    const m = startMenuEl();
    m.classList.remove("hidden");
    startBtnEl().classList.add("open");
    focusStartMenu();
  }
  function closeStartMenu() {
    if (!Shell.startOpen) return;
    Shell.startOpen = false;
    startMenuEl().classList.add("hidden");
    startBtnEl().classList.remove("open");
    startMenuEl().querySelectorAll(".hover").forEach((x) => x.classList.remove("hover"));
    W95.closeMenus();
  }
  W95.closeStartMenu = closeStartMenu;

  function focusStartMenu() {
    const m = startMenuEl();
    const items = W95.$$(".startmenu-item", m);
    let activeItem = null;

    const closeCascade = () => {
      W95.closeMenus();
      if (activeItem) activeItem.classList.remove("hover");
      activeItem = null;
    };

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (activeItem && activeItem !== item) {
          activeItem.classList.remove("hover");
          activeItem = null;
        }
        item.classList.add("hover");
        const cascade = item.dataset.cascade;
        if (cascade) {
          W95.closeMenus();
          const items2 = START_CASCADES[cascade.replace(/^start-/, "")] || [];
          if (!items2.length) return;
          const r = item.getBoundingClientRect();
          const menu = W95.popupMenu(items2, {
            x: r.right - 4,
            y: r.top - 4,
            onClose: () => item.classList.remove("hover"),
          });
          // 点击菜单项后关闭开始菜单
          menu.addEventListener("mousedown", (e) => {
            if (e.target.closest(".w95menu-item")) {
              setTimeout(() => closeStartMenu(), 0);
            }
          });
          activeItem = item;
        }
      });
      item.addEventListener("click", () => {
        const action = item.dataset.action;
        const cascade = item.dataset.cascade;
        if (cascade) return;
        closeStartMenu();
        handleStartAction(action);
      });
      item.addEventListener("mousedown", (e) => e.preventDefault());
    });
  }

  function handleStartAction(action) {
    switch (action) {
      case "programs": case "documents": case "settings": case "find": break;
      case "help": W95.openApp("help"); break;
      case "run": W95.runDialog(); break;
      case "shutdown": W95.openShutdown(); break;
    }
  }

  // 最近文档
  const recent = {
    list() { return W95.store.get("recent-docs", []); },
    add(path, name) {
      let l = this.list();
      l = l.filter((x) => x.path !== path);
      l.unshift({ path, name });
      l = l.slice(0, 10);
      W95.store.set("recent-docs", l);
    },
    clear() { W95.store.set("recent-docs", []); },
  };
  W95.recent = recent;

  function initStartMenu() {
    const m = startMenuEl();
    // 填充开始菜单图标
    const iconMap = {
      folder: "folder", docfolder: "mydocs", settings: "cpl", find: "find",
      help: "help", run: "run", shutdown: "shutdown",
    };
    W95.$$(".startmenu-item .sm-icon[data-icon]", m).forEach((el) => {
      const name = iconMap[el.dataset.icon] || el.dataset.icon;
      el.innerHTML = W95.icon(name, 24);
    });
    document.addEventListener("mousedown", (e) => {
      if (Shell.startOpen && !m.contains(e.target) && !startBtnEl().contains(e.target)) {
        closeStartMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && Shell.startOpen) closeStartMenu();
      if ((e.ctrlKey && e.key.toLowerCase() === "escape") || (e.key === "Meta" && e.metaKey)) {
        e.preventDefault();
        toggleStartMenu();
      }
    });
  }

  /* ---------------- 开始菜单“文档”级联动态生成 ---------------- */
  // 覆盖 focusStartMenu 中 documents 的级联
  const origFocus = focusStartMenu;
  focusStartMenu = function () {
    origFocus();
    const m = startMenuEl();
    const docsItem = m.querySelector('[data-cascade="documents"]');
    if (docsItem) {
      docsItem.addEventListener("mouseenter", function handler() {
        const docs = recent.list();
        const items2 = docs.length
          ? docs.map((d) => ({
              label: d.name,
              icon: d.path.toLowerCase().endsWith(".bmp") ? "paint" : "txtfile",
              action: () => W95.openPath(d.path),
            })).concat([
              { sep: true },
              { label: "清除文档(C)", action: () => { recent.clear(); } },
            ])
          : [{ label: "(空)", disabled: true }];
        W95.closeMenus();
        const r = docsItem.getBoundingClientRect();
        const menu = W95.popupMenu(items2, { x: r.right - 4, y: r.top - 4 });
        menu.addEventListener("mousedown", (e) => {
          if (e.target.closest(".w95menu-item")) setTimeout(() => closeStartMenu(), 0);
        });
      });
    }
  };

  /* ---------------- “单击这里开始”提示 ---------------- */
  function showBeginHint() {
    if (W95.store.get("begin-hint-shown", false)) return;
    W95.store.set("begin-hint-shown", true);
    const tip = W95.el("div", { class: "w95tooltip" });
    tip.style.cssText =
      "left:4px;bottom:38px;z-index:6000;animation:blink 1.2s steps(1) 3;";
    tip.innerHTML =
      "<b>单击这里开始</b><br>" +
      '<svg width="14" height="10" viewBox="0 0 14 10"><path d="M7,9 L1,2 L13,2 Z" fill="#ffffe1" stroke="#000"/></svg>';
    document.body.appendChild(tip);
    setTimeout(() => tip.remove(), 4200);
  }

  /* ---------------- init ---------------- */
  W95.initShell = function () {
    loadIcons();
    renderIcons();
    initDesktop();
    initTaskbar();
    initStartMenu();
    // 阻止桌面文字选择
    desktopEl().addEventListener("selectstart", (e) => e.preventDefault());
    showBeginHint();
    W95.Taskbar.syncButtons();
  };

})();
