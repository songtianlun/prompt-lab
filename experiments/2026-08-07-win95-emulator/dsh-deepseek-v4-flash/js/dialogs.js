/* ============================================================
   Windows 95 模拟器 — 对话框与菜单
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  /* ================= 弹出菜单（支持级联） ================= */
  let openMenus = [];

  function closeMenus() {
    openMenus.forEach((m) => m.remove());
    openMenus = [];
  }
  W95.closeMenus = closeMenus;

  function buildMenu(items, opts) {
    const menu = W95.el("div", { class: "w95menu" });
    for (const it of items) {
      if (it.sep) {
        menu.appendChild(W95.el("div", { class: "w95menu-sep" }));
        continue;
      }
      const item = W95.el("div", {
        class: "w95menu-item" + (it.disabled ? " disabled" : ""),
      });
      if (it.icon) {
        item.appendChild(W95.el("span", { class: "mi-icon", html: W95.icon(it.icon, 16) }));
      } else {
        item.appendChild(W95.el("span", { class: "mi-icon" }));
      }
      item.appendChild(W95.el("span", { text: it.label }));
      if (it.checked) {
        item.appendChild(W95.el("span", { style: { position: "absolute", left: "4px" }, text: "✓" }));
      }
      if (it.submenu && it.submenu.length) {
        item.appendChild(W95.el("span", { class: "mi-arrow", text: "▶" }));
      }
      if (!it.disabled) {
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (it.submenu && it.submenu.length) return;
          closeMenus();
          if (opts.onClose) opts.onClose();
          if (typeof it.action === "function") it.action();
          else if (it.action !== undefined && opts.onAction) opts.onAction(it.action);
        });
        item.addEventListener("mouseenter", () => {
          // 关闭兄弟子菜单
          menu.querySelectorAll(".w95menu-item.hover").forEach((x) => x.classList.remove("hover"));
          item.classList.add("hover");
          closeSubmenus(menu);
          if (it.submenu && it.submenu.length) {
            const r = item.getBoundingClientRect();
            const sub = buildMenu(it.submenu, opts);
            sub.classList.add("w95menu-sub");
            document.body.appendChild(sub);
            openMenus.push(sub);
            let sx = r.right - 2;
            let sy = r.top - 2;
            const sr = sub.getBoundingClientRect();
            if (sx + sr.width > window.innerWidth - 4) sx = r.left - sr.width + 2;
            if (sy + sr.height > window.innerHeight - 4) sy = window.innerHeight - sr.height - 4;
            sub.style.left = sx + "px";
            sub.style.top = sy + "px";
            sub._parentMenu = menu;
          }
        });
      } else {
        item.addEventListener("mouseenter", () => {
          menu.querySelectorAll(".w95menu-item.hover").forEach((x) => x.classList.remove("hover"));
          closeSubmenus(menu);
        });
      }
    }
    return menu;
  }

  function closeSubmenus(menu) {
    // 关闭所有以该菜单为祖先的子菜单
    for (let i = openMenus.length - 1; i >= 0; i--) {
      let m = openMenus[i];
      let p = m._parentMenu;
      let isDescendant = false;
      while (p) {
        if (p === menu) { isDescendant = true; break; }
        p = p._parentMenu;
      }
      if (isDescendant) {
        m.remove();
        openMenus.splice(i, 1);
      }
    }
  }

  function popupMenu(items, opts) {
    opts = opts || {};
    closeMenus();
    const menu = buildMenu(items, opts);
    document.body.appendChild(menu);
    openMenus.push(menu);
    let x = opts.x, y = opts.y;
    if (x === undefined && opts.event) {
      x = opts.event.clientX; y = opts.event.clientY;
    }
    const r = menu.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 2) x = Math.max(2, window.innerWidth - r.width - 2);
    if (y + r.height > window.innerHeight - 2) y = Math.max(2, window.innerHeight - r.height - 2);
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    const onDown = (e) => {
      if (!menu.contains(e.target)) {
        closeMenus();
        if (opts.onClose) opts.onClose();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeMenus();
        if (opts.onClose) opts.onClose();
      }
    };
    setTimeout(() => {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
    }, 0);
    menu._cleanup = () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    return menu;
  }
  W95.popupMenu = popupMenu;

  /* ================= 对话框窗口 ================= */
  let dialogZ = 8000;

  function dlgWindow(opts) {
    const layer = W95.$("#dialog-layer");
    const win = W95.el("div", {
      class: "w95win dlgwin",
      style: { position: "fixed", left: "50%", top: "40%", transform: "translate(-50%,-50%)", zIndex: dialogZ++ },
    });
    const tb = W95.el("div", { class: "win-titlebar" });
    tb.appendChild(W95.el("span", { class: "win-title-icon", html: W95.icon(opts.icon || "appfile", 16) }));
    const titleSpan = W95.el("span", { class: "win-title-text", text: opts.title || "" });
    tb.appendChild(titleSpan);
    const closeBtn = W95.el("button", {
      class: "win-title-btn", type: "button", title: "关闭",
      html: '<span class="tb-glyph tb-close">✕</span>',
    });
    closeBtn.addEventListener("mousedown", (e) => e.stopPropagation());
    closeBtn.addEventListener("click", () => { if (opts.onClose) opts.onClose(); });
    tb.appendChild(closeBtn);
    win.appendChild(tb);
    const body = W95.el("div", { class: "win-body", style: { padding: "14px" } });
    win.appendChild(body);
    layer.appendChild(win);

    // 置顶
    win.addEventListener("mousedown", () => {
      dialogZ++;
      win.style.zIndex = dialogZ;
    });
    // 拖动
    tb.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win-title-btn")) return;
      e.preventDefault();
      const rect = win.getBoundingClientRect();
      const ox = e.clientX - rect.left, oy = e.clientY - rect.top;
      const move = (ev) => {
        win.style.left = (ev.clientX - ox) + "px";
        win.style.top = (ev.clientY - oy) + "px";
        win.style.transform = "none";
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    win.body = body;
    win.close = () => {
      win.remove();
      if (W95.dlgCloseAll) {
        // no-op
      }
    };
    return win;
  }
  W95.dlgWindow = dlgWindow;

  /* ================= 消息框 ================= */
  const MSG_ICONS = {
    error: (s) =>
      `<svg width="${s||32}" height="${s||32}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#ff0000" stroke="#000000" stroke-width="1"/>
        <path d="M10,10 L22,22 M22,10 L10,22" stroke="#ffffff" stroke-width="4"/>
      </svg>`,
    warning: (s) =>
      `<svg width="${s||32}" height="${s||32}" viewBox="0 0 32 32">
        <path d="M16,2 L31,29 L1,29 Z" fill="#ffff00" stroke="#000000" stroke-width="1"/>
        <rect x="14.5" y="11" width="3" height="10" fill="#000000"/>
        <rect x="14.5" y="23" width="3" height="3" fill="#000000"/>
      </svg>`,
    info: (s) =>
      `<svg width="${s||32}" height="${s||32}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#0000c0" stroke="#000000" stroke-width="1"/>
        <path d="M16,8 h3 v3 h-3 z" fill="#ffffff"/>
        <rect x="14.5" y="13" width="3" height="10" fill="#ffffff"/>
      </svg>`,
    question: (s) =>
      `<svg width="${s||32}" height="${s||32}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="15" fill="#0000c0" stroke="#000000" stroke-width="1"/>
        <path d="M12,11 a4,4 0 0 1 8,0 c0,3 -4,2.5 -4,6" fill="none" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="16" cy="22" r="1.8" fill="#ffffff"/>
      </svg>`,
    computer: (s) =>
      `<svg width="${s||32}" height="${s||32}" viewBox="0 0 32 32">
        <rect x="3" y="2" width="26" height="19" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
        <rect x="6" y="5" width="20" height="13" fill="#008080"/>
        <rect x="12" y="21" width="8" height="3" fill="#808080" stroke="#000"/>
        <rect x="6" y="24" width="20" height="4" fill="#c0c0c0" stroke="#000"/>
      </svg>`,
  };

  function msgbox(opts) {
    return new Promise((resolve) => {
      const buttons = opts.buttons || ["确定"];
      const win = dlgWindow({
        title: opts.title || "Windows 95",
        icon: "msg-" + (opts.icon || "info"),
        onClose: () => { cleanup(); resolve(null); },
      });
      const body = win.body;
      body.style.display = "flex";
      body.style.alignItems = "flex-start";
      body.style.gap = "14px";
      body.style.width = opts.width ? opts.width + "px" : "auto";
      body.style.minWidth = "300px";
      body.style.maxWidth = "460px";

      const iconEl = W95.el("div", { class: "mb-icon" });
      iconEl.innerHTML = (MSG_ICONS[opts.icon] || MSG_ICONS.info)(32);
      body.appendChild(iconEl);

      const textEl = W95.el("div", {
        class: "w95label",
        style: { flex: "1", whiteSpace: "pre-wrap", lineHeight: "1.5", paddingTop: "6px" },
        text: opts.text || "",
      });
      body.appendChild(textEl);

      const btnRow = W95.el("div", {
        style: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" },
      });
      // Win95 布局：按钮在窗口底部居中（模拟真实对话框）
      body.appendChild(btnRow);
      body.style.flexDirection = "column";
      btnRow.style.width = "100%";
      textEl.style.paddingTop = "2px";

      let result = null;
      const btns = [];
      buttons.forEach((label, i) => {
        const b = W95.el("button", {
          class: "w95btn" + (i === 0 ? " default" : ""),
          type: "button", text: label,
        });
        b.addEventListener("click", () => {
          result = label;
          cleanup();
          resolve(label);
        });
        btnRow.appendChild(b);
        btns.push(b);
      });

      // 居中排版
      const pad = W95.el("div", { style: { flex: "1" } });
      body.insertBefore(pad, btnRow);
      body.appendChild(W95.el("div", { style: { flex: "1" } }));

      function cleanup() {
        win.close();
        document.removeEventListener("keydown", onKey);
      }
      function onKey(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          cleanup(); resolve(null);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (btns[0]) btns[0].click();
        }
      }
      setTimeout(() => {
        document.addEventListener("keydown", onKey);
        if (btns[0]) btns[0].focus();
      }, 30);
    });
  }
  W95.msgbox = msgbox;

  /* ================= 输入对话框 ================= */
  function inputBox(opts) {
    return new Promise((resolve) => {
      const win = dlgWindow({
        title: opts.title || "输入",
        icon: "msg-info",
        onClose: () => { cleanup(); resolve(null); },
      });
      const body = win.body;
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "10px";
      body.style.minWidth = "320px";

      if (opts.text) body.appendChild(W95.el("div", { class: "w95label", text: opts.text }));
      const input = W95.el("input", { class: "w95input", type: "text", value: opts.value || "" });
      input.style.width = "100%";
      body.appendChild(input);

      const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" } });
      const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
      const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
      ok.addEventListener("click", () => { cleanup(); resolve(input.value); });
      cancel.addEventListener("click", () => { cleanup(); resolve(null); });
      row.appendChild(ok); row.appendChild(cancel);
      body.appendChild(row);

      function cleanup() {
        win.close();
        document.removeEventListener("keydown", onKey);
      }
      function onKey(e) {
        if (e.key === "Enter") { e.preventDefault(); ok.click(); }
        if (e.key === "Escape") { e.preventDefault(); cancel.click(); }
      }
      setTimeout(() => {
        document.addEventListener("keydown", onKey);
        input.focus();
        input.select();
      }, 30);
    });
  }
  W95.inputBox = inputBox;

  /* ================= 运行对话框 ================= */
  const COMMAND_ALIASES = {
    notepad: "notepad", "notepad.exe": "notepad",
    calc: "calc", "calc.exe": "calc",
    mspaint: "paint", pbrush: "paint", "pbrush.exe": "paint", "mspaint.exe": "paint",
    winmine: "minesweeper", "winmine.exe": "minesweeper",
    sol: "solitaire", "sol.exe": "solitaire",
    explorer: "explorer", "explorer.exe": "explorer",
    cmd: "msdos", command: "msdos", "command.com": "msdos", dos: "msdos",
    control: "control", "control.exe": "control",
    "control panel": "control",
    win: "win", "win.com": "win",
    help: "help", "winhelp": "help",
    defrag: "defrag", "defrag.exe": "defrag",
    "msconfig": "msconfig",
    regedit: "regedit", "regedit.exe": "regedit",
    welcome: "welcome", "welcome.exe": "welcome",
    "sysedit": "sysedit",
  };

  W95.openCommand = function (cmdline) {
    const cmd = String(cmdline || "").trim().replace(/"/g, "");
    if (!cmd) return false;
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const alias = COMMAND_ALIASES[name];
    if (alias && W95.apps[alias]) {
      const args = parts.slice(1);
      if (alias === "win") {
        W95.msgbox({ title: "Windows", text: "Windows 已经在运行中。", icon: "info" });
        return true;
      }
      if (alias === "defrag") { W95.openApp("defrag"); return true; }
      if (alias === "msconfig") { W95.openApp("msconfig"); return true; }
      if (alias === "sysedit") { W95.openApp("sysedit"); return true; }
      if (alias === "regedit") { W95.openApp("regedit"); return true; }
      W95.openApp(alias, args.length ? { args } : undefined);
      return true;
    }
    // 尝试作为文件路径
    if (cmd.includes("\\") || cmd.includes("/")) {
      if (W95.openPath(cmd)) return true;
    }
    W95.msgbox({
      title: "运行",
      icon: "error",
      text: "无法找到文件“" + cmd + "”（或它的组件之一）。\r\n请确定文件名和路径是否正确，而且所有的库文件均可用。",
      buttons: ["确定"],
    });
    return false;
  };

  function runDialog() {
    const known = [
      "notepad", "calc", "pbrush", "winmine", "sol", "explorer",
      "command.com", "control", "win", "defrag", "welcome",
    ];
    return new Promise((resolve) => {
      const win = dlgWindow({
        title: "运行",
        icon: "msg-run",
        onClose: () => { cleanup(); resolve(null); },
      });
      const body = win.body;
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "10px";
      body.style.minWidth = "360px";

      body.appendChild(W95.el("div", {
        class: "w95label",
        html: '在下面的框中输入程序名、文件夹、文档或 Internet 资源名称，Windows 将为您打开它。',
      }));
      const field = W95.el("div", { class: "w95field" });
      const label = W95.el("span", { class: "w95label", text: "打开(O):" });
      const input = W95.el("input", { class: "w95input", type: "text", list: "w95-runlist" });
      input.style.flex = "1";
      const dl = W95.el("datalist", { id: "w95-runlist" });
      known.forEach((k) => dl.appendChild(W95.el("option", { value: k })));
      field.appendChild(label); field.appendChild(input); field.appendChild(dl);
      body.appendChild(field);

      const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
      const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
      const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
      const help = W95.el("button", { class: "w95btn", type: "button", text: "帮助(B)" });
      ok.addEventListener("click", () => {
        const v = input.value.trim();
        cleanup();
        W95.openCommand(v);
        resolve(v);
      });
      cancel.addEventListener("click", () => { cleanup(); resolve(null); });
      help.addEventListener("click", () => {
        W95.msgbox({ title: "运行帮助", icon: "info", text: "输入程序文件名（例如 notepad）或完整路径后单击“确定”。", buttons: ["确定"] });
      });
      row.appendChild(ok); row.appendChild(cancel); row.appendChild(help);
      body.appendChild(row);

      function cleanup() {
        win.close();
        document.removeEventListener("keydown", onKey);
      }
      function onKey(e) {
        if (e.key === "Enter") { e.preventDefault(); ok.click(); }
        if (e.key === "Escape") { e.preventDefault(); cancel.click(); }
      }
      setTimeout(() => {
        document.addEventListener("keydown", onKey);
        input.focus();
      }, 30);
    });
  }
  W95.runDialog = runDialog;

  /* ================= 文件打开/保存对话框 ================= */
  function fileDialog(opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      let cwd = opts.startPath || "C:/My Documents";
      let selectedName = opts.defaultName || "";

      const win = dlgWindow({
        title: opts.title || "打开",
        icon: "msg-folder",
        onClose: () => { cleanup(); resolve(null); },
      });
      const body = win.body;
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";
      body.style.padding = "10px";
      body.style.width = "460px";
      body.style.height = "360px";
      body.style.overflow = "hidden";

      // 顶部：查找范围
      const lookRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
      lookRow.appendChild(W95.el("span", { class: "w95label", text: "查找范围(I):" }));
      const lookBox = W95.el("div", {
        class: "w95input",
        style: { flex: "1", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" },
      });
      const lookText = W95.el("span", {});
      lookBox.appendChild(lookText);
      lookBox.appendChild(W95.el("span", { text: "▼", style: { fontSize: "8px" } }));
      lookRow.appendChild(lookBox);
      body.appendChild(lookRow);

      // 工具栏
      const toolRow = W95.el("div", { style: { display: "flex", gap: "4px" } });
      const mkBtn = (label, title) =>
        W95.el("button", {
          class: "w95btn", type: "button", text: label, title,
          style: { minWidth: "28px", padding: "2px 6px" },
        });
      const upBtn = mkBtn("↑", "向上一级");
      const newBtn = mkBtn("+", "新建文件夹");
      const listBtn = mkBtn("▦", "列表");
      toolRow.appendChild(upBtn); toolRow.appendChild(newBtn); toolRow.appendChild(listBtn);
      body.appendChild(toolRow);

      // 文件列表
      const listWrap = W95.el("div", {
        class: "w95field",
        style: { flex: "1", padding: "0", overflow: "auto", display: "block" },
      });
      const listEl = W95.el("div", { style: { minHeight: "100%" } });
      listWrap.appendChild(listEl);
      body.appendChild(listWrap);

      // 底部
      const fileRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
      fileRow.appendChild(W95.el("span", { class: "w95label", text: opts.mode === "save" ? "文件名(N):" : "文件名(N):" }));
      const nameInput = W95.el("input", { class: "w95input", type: "text", value: selectedName, style: { flex: "1" } });
      fileRow.appendChild(nameInput);
      body.appendChild(fileRow);

      const typeRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
      typeRow.appendChild(W95.el("span", { class: "w95label", text: "文件类型(T):" }));
      const typeBox = W95.el("div", {
        class: "w95input",
        style: { flex: "1", display: "flex", alignItems: "center", justifyContent: "space-between" },
      });
      typeBox.appendChild(W95.el("span", { text: opts.filter || "所有文件 (*.*)" }));
      typeBox.appendChild(W95.el("span", { text: "▼", style: { fontSize: "8px" } }));
      typeRow.appendChild(typeBox);
      body.appendChild(typeRow);

      const btnRow = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
      const ok = W95.el("button", { class: "w95btn default", type: "button", text: opts.mode === "save" ? "保存(S)" : "打开(O)" });
      const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
      btnRow.appendChild(ok); btnRow.appendChild(cancel);
      body.appendChild(btnRow);

      function refresh() {
        const node = W95.vfsResolve(cwd);
        if (!node || node.type !== "folder") { cwd = "C:/"; node = W95.vfsResolve(cwd); }
        lookText.textContent = cwd;
        listEl.innerHTML = "";
        const items = node.children.slice().sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        for (const it of items) {
          const row = W95.el("div", {
            class: "filedlg-item",
            style: {
              display: "flex", alignItems: "center", gap: "6px",
              padding: "2px 4px", cursor: "default", whiteSpace: "nowrap",
            },
          });
          row.appendChild(W95.el("span", { html: W95.icon(it.icon, 16) }));
          row.appendChild(W95.el("span", { text: it.name }));
          if (it.type === "file") {
            row.appendChild(W95.el("span", { class: "w95muted", style: { marginLeft: "auto", marginRight: "4px" }, text: W95.formatBytes(it.size) }));
          }
          row.addEventListener("mousedown", (e) => {
            e.preventDefault();
            listEl.querySelectorAll(".filedlg-sel").forEach((x) => x.classList.remove("filedlg-sel"));
            row.classList.add("filedlg-sel");
            row.style.background = "#000080";
            row.style.color = "#fff";
            if (it.type === "file") nameInput.value = it.name;
          });
          row.addEventListener("dblclick", () => {
            if (it.type === "folder") {
              cwd += "/" + it.name;
              selectedName = "";
              refresh();
            } else {
              ok.click();
            }
          });
          listEl.appendChild(row);
        }
      }

      upBtn.addEventListener("click", () => {
        const parts = cwd.split("/").filter(Boolean);
        parts.pop();
        cwd = "/" + parts.join("/") || "/C:";
        refresh();
      });
      newBtn.addEventListener("click", async () => {
        const name = await W95.inputBox({ title: "新建文件夹", text: "请输入新文件夹名称:", value: "新建文件夹" });
        if (name) { W95.vfsMkdir(cwd, name); refresh(); }
      });
      lookBox.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const items = [
          { label: "桌面", action: () => { cwd = "C:/My Documents"; refresh(); } },
          { label: "我的电脑", action: () => { cwd = "C:/"; refresh(); } },
          { sep: true },
          { label: "3½ 软盘 (A:)", action: () => { cwd = "A:/"; refresh(); } },
          { label: "(C:)", action: () => { cwd = "C:/"; refresh(); } },
          { label: "(D:)", action: () => { cwd = "D:/"; refresh(); } },
        ];
        popupMenu(items, { x: lookBox.getBoundingClientRect().left, y: lookBox.getBoundingClientRect().bottom });
      });

      ok.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) { cleanup(); resolve(null); return; }
        const full = cwd + "/" + name;
        if (opts.mode === "save") {
          cleanup();
          resolve({ path: full, name });
          return;
        }
        const node = W95.vfsResolve(full);
        if (!node) {
          W95.msgbox({ title: "打开", icon: "error", text: "找不到文件“" + name + "”。请检查文件名是否正确。", buttons: ["确定"] });
          return;
        }
        cleanup();
        resolve({ path: full, name });
      });
      cancel.addEventListener("click", () => { cleanup(); resolve(null); });

      function cleanup() {
        win.close();
        document.removeEventListener("keydown", onKey);
      }
      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); cancel.click(); }
        if (e.key === "Enter") { e.preventDefault(); ok.click(); }
      }

      refresh();
      setTimeout(() => {
        document.addEventListener("keydown", onKey);
        nameInput.focus();
        if (selectedName) nameInput.select();
      }, 30);
    });
  }
  W95.fileDialog = fileDialog;

})();
