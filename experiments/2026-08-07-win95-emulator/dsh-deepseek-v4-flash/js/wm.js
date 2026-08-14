/* ============================================================
   Windows 95 模拟器 — 窗口管理器
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const WM = {
    windows: [],
    zCounter: 100,
    cascadeIndex: 0,
    active: null,
    container: null,
    scale: 1,
  };
  W95.WM = WM;

  function init() {
    WM.container = W95.$("#desktop");
  }

  function getScale() {
    return window.__w95ResolutionScale || 1;
  }

  function focusWin(win) {
    if (WM.active === win) {
      win.el.classList.add("focused");
      return;
    }
    if (WM.active) WM.active.el.classList.remove("focused");
    WM.active = win;
    win.el.classList.add("focused");
    WM.zCounter += 1;
    win.el.style.zIndex = WM.zCounter;
    if (W95.Taskbar) W95.Taskbar.syncButtons();
  }

  function open(opts) {
    init();
    const win = {
      opts: opts || {},
      minimized: false,
      maximized: false,
      prevRect: null,
      el: null,
      titlebar: null,
      titleText: null,
      body: null,
      menubar: null,
      statusbar: null,
      onClose: opts.onClose || null,
      _closing: false,
    };

    const el = W95.el("div", { class: "w95win" });
    win.el = el;

    const tb = W95.el("div", { class: "win-titlebar" });
    win.titlebar = tb;
    tb.appendChild(
      W95.el("span", { class: "win-title-icon", html: W95.icon(opts.icon || "appfile", 16) })
    );
    const titleSpan = W95.el("span", { class: "win-title-text", text: opts.title || "" });
    win.titleText = titleSpan;
    tb.appendChild(titleSpan);

    const minBtn = W95.el("button", {
      class: "win-title-btn", type: "button", title: "最小化",
      html: '<span class="tb-glyph"></span>',
    });
    const maxBtn = W95.el("button", {
      class: "win-title-btn", type: "button", title: "最大化",
      html: '<span class="tb-glyph" style="box-shadow:inset 1px 1px 0 #fff, inset -1px -1px 0 #000, inset 0 0 0 1px #000;"></span>',
    });
    const closeBtn = W95.el("button", {
      class: "win-title-btn", type: "button", title: "关闭",
      html: '<span class="tb-glyph tb-close">✕</span>',
    });
    minBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    maxBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    closeBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    minBtn.addEventListener("click", (e) => { e.stopPropagation(); win.minimize(); });
    maxBtn.addEventListener("click", (e) => { e.stopPropagation(); win.toggleMaximize(); });
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); win.close(); });

    if (opts.minimizable !== false) tb.appendChild(minBtn);
    if (opts.maximizable !== false) tb.appendChild(maxBtn);
    tb.appendChild(closeBtn);
    el.appendChild(tb);

    const body = W95.el("div", { class: "win-body" });
    win.body = body;
    el.appendChild(body);

    // 窗口对象公开方法（须在 menubar/statusbar 处理前定义）
    win.minimize = () => minimize(win);
    win.restore = () => restore(win);
    win.toggleMaximize = () => toggleMaximize(win);
    win.close = () => close(win);
    win.focus = () => focusWin(win);
    win.setTitle = (t) => { win.titleText.textContent = t; if (W95.Taskbar) W95.Taskbar.syncButtons(); };
    win.setStatus = (text) => {
      if (!win.statusbar) return;
      let f = win.statusbar.querySelector(".sb-field");
      if (!f) {
        f = W95.el("div", { class: "sb-field" });
        win.statusbar.insertBefore(f, win.statusbar.querySelector(".sb-grip"));
      }
      f.textContent = text;
    };
    win.clearStatus = () => {
      if (!win.statusbar) return;
      const f = win.statusbar.querySelector(".sb-field");
      if (f) f.remove();
    };
    win.setMenuBar = (menus) => {
      WM.setMenuBar(win, Array.isArray(menus) ? menus : [menus]);
    };

    if (opts.menubar) {
      const mb = W95.el("div", { class: "win-menubar" });
      win.menubar = mb;
      el.insertBefore(mb, body);
      win.setMenuBar(opts.menubar);
    }

    if (opts.statusbar !== false) {
      const sb = W95.el("div", { class: "win-statusbar" });
      win.statusbar = sb;
      sb.appendChild(W95.el("div", { class: "sb-grip" }));
      el.appendChild(sb);
      if (opts.statusText) win.setStatus(opts.statusText);
    }

    // 尺寸
    const w = opts.width || 400;
    const h = opts.height || 300;
    const s = getScale();
    let x = opts.x, y = opts.y;
    if (x === undefined || y === undefined) {
      const vw = window.innerWidth / s;
      const vh = window.innerHeight / s;
      const cw = Math.min(w, vw - 40);
      const ch = Math.min(h, vh - 60);
      x = 40 + ((WM.cascadeIndex * 24) % Math.max(1, vw - cw - 80));
      y = 30 + ((WM.cascadeIndex * 24) % Math.max(1, vh - ch - 100));
      WM.cascadeIndex = (WM.cascadeIndex + 1) % 8;
    }
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = Math.min(w, window.innerWidth / s - 8) + "px";
    el.style.height = Math.min(h, window.innerHeight / s - 60) + "px";

    el.addEventListener("mousedown", () => focusWin(win));

    // 标题栏拖动
    tb.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win-title-btn")) return;
      if (win.maximized) return;
      e.preventDefault();
      focusWin(win);
      startDrag(e);
    });
    // 双击标题栏切换最大化
    tb.addEventListener("dblclick", () => win.toggleMaximize());

    function startDrag(e) {
      const rect = el.getBoundingClientRect();
      const s2 = getScale();
      const offX = (e.clientX - rect.left) / s2;
      const offY = (e.clientY - rect.top) / s2;
      const move = (ev) => {
        const s3 = getScale();
        let nx = ev.clientX / s3 - offX;
        let ny = ev.clientY / s3 - offY;
        // 顶部吸附
        if (ny < 2) ny = 0;
        nx = Math.max(-rect.width / s3 + 60, Math.min(nx, window.innerWidth / s3 - 40));
        ny = Math.max(0, Math.min(ny, window.innerHeight / s3 - 24));
        el.style.left = nx + "px";
        el.style.top = ny + "px";
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }

    // 缩放
    if (opts.resizable !== false) {
      const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
      for (const d of dirs) {
        const hdl = W95.el("div", { class: "win-resize-" + d });
        el.appendChild(hdl);
        hdl.addEventListener("mousedown", (e) => {
          if (win.maximized) return;
          e.preventDefault(); e.stopPropagation();
          startResize(d, e);
        });
      }
    }

    function startResize(dir, e) {
      const r = el.getBoundingClientRect();
      const minW = opts.minWidth || 160;
      const minH = opts.minHeight || 90;
      const s2 = getScale();
      const startX = e.clientX, startY = e.clientY;
      const startW = r.width, startH = r.height;
      const startL = r.left, startT = r.top;
      const move = (ev) => {
        const s3 = getScale();
        const dx = (ev.clientX - startX) / s3;
        const dy = (ev.clientY - startY) / s3;
        let w = startW, h = startH, l = startL, t = startT;
        if (dir.includes("e")) w = startW + dx;
        if (dir.includes("s")) h = startH + dy;
        if (dir.includes("w")) { w = startW - dx; l = startL + dx; }
        if (dir.includes("n")) { h = startH - dy; t = startT + dy; }
        if (w < minW) { if (dir.includes("w")) l -= minW - w; w = minW; }
        if (h < minH) { if (dir.includes("n")) t -= minH - h; h = minH; }
        el.style.left = l + "px";
        el.style.top = t + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";
        if (win.onResize) win.onResize();
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }

    // 键盘
    el.addEventListener("keydown", (e) => {
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
        win.close();
      }
    });

    WM.container.appendChild(el);
    WM.windows.push(win);
    focusWin(win);
    if (W95.Taskbar) W95.Taskbar.addButton(win);
    return win;
  }

  function close(win) {
    if (win._closing) return;
    if (win.onClose && win.onClose() === false) return;
    win._closing = true;
    if (win.beforeDestroy) {
      try { win.beforeDestroy(); } catch (e) {}
    }
    win.el.remove();
    const i = WM.windows.indexOf(win);
    if (i >= 0) WM.windows.splice(i, 1);
    if (WM.active === win) WM.active = null;
    if (W95.Taskbar) W95.Taskbar.removeButton(win);
    const top = WM.windows[WM.windows.length - 1];
    if (top) focusWin(top);
  }

  function minimize(win) {
    win.minimized = true;
    win.el.style.display = "none";
    if (WM.active === win) WM.active = null;
    if (W95.Taskbar) W95.Taskbar.syncButtons();
  }

  function restore(win) {
    win.minimized = false;
    win.el.style.display = "flex";
    focusWin(win);
    if (W95.Taskbar) W95.Taskbar.syncButtons();
  }

  function toggleMaximize(win) {
    if (win.maximized) {
      win.maximized = false;
      const r = win.prevRect;
      if (r) {
        win.el.style.left = r.left + "px";
        win.el.style.top = r.top + "px";
        win.el.style.width = r.width + "px";
        win.el.style.height = r.height + "px";
      }
      win.el.classList.remove("maximized");
      if (win.onResize) win.onResize();
    } else {
      win.prevRect = win.el.getBoundingClientRect();
      win.maximized = true;
      win.el.classList.add("maximized");
      win.el.style.left = "0px";
      win.el.style.top = "0px";
      win.el.style.width = "100%";
      win.el.style.height = "100%";
      if (win.onResize) win.onResize();
    }
    if (W95.Taskbar) W95.Taskbar.syncButtons();
  }

  function layoutMaximized() {
    for (const win of WM.windows) {
      if (win.maximized) {
        win.el.style.width = "100%";
        win.el.style.height = "100%";
        win.el.style.left = "0px";
        win.el.style.top = "0px";
      }
    }
  }

  // 菜单栏支持（若窗口未预设菜单栏则自动创建）
  function setMenuBar(win, menus) {
    let mb = win.menubar;
    if (!mb) {
      mb = W95.el("div", { class: "win-menubar" });
      win.menubar = mb;
      win.el.insertBefore(mb, win.body);
    }
    mb.innerHTML = "";
    for (const m of menus) {
      const item = W95.el("div", { class: "win-menubar-item", text: m.label });
      mb.appendChild(item);
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.classList.contains("active")) {
          closeMenuBar();
          return;
        }
        closeMenuBar();
        item.classList.add("active");
        W95.popupMenu(m.items || [], {
          x: item.getBoundingClientRect().left,
          y: item.getBoundingClientRect().bottom,
          onClose: () => item.classList.remove("active"),
          onAction: (a) => { closeMenuBar(); if (m.onAction) m.onAction(a); },
        });
      });
    }
    function closeMenuBar() {
      W95.$$(".win-menubar-item.active").forEach((x) => x.classList.remove("active"));
      if (W95.closeMenus) W95.closeMenus();
    }
  }

  // 工具：状态栏
  function setStatus(win, text) { win.setStatus(text); }

  // 窗口内容区的标题/尺寸快捷访问
  function getTitle(win) { return win.titleText.textContent; }
  function setTitle(win, t) { win.titleText.textContent = t; if (W95.Taskbar) W95.Taskbar.syncButtons(); }

  // 全部最小化
  function minimizeAll() {
    for (const w of WM.windows.slice()) minimize(w);
  }

  // 关闭所有（用于关机前）
  function closeAll() {
    for (const w of WM.windows.slice()) close(w);
  }

  Object.assign(WM, {
    open,
    close,
    minimize,
    restore,
    toggleMaximize,
    focusWin,
    layoutMaximized,
    setMenuBar,
    setStatus,
    setTitle,
    getTitle,
    minimizeAll,
    closeAll,
  });

  W95.WM = WM;

  window.addEventListener("resize", () => {
    if (W95.Taskbar) W95.Taskbar.layoutButtons();
    layoutMaximized();
  });
})();
