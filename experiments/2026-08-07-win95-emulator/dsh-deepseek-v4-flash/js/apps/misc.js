/* ============================================================
   杂项程序：回收站 / 查找 / 磁盘碎片整理 / 系统配置 / 注册表 / 系统编辑
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  /* ================= 回收站 ================= */
  W95.registerApp("recycle", {
    title: "回收站",
    icon: "recycle",
    width: 460,
    height: 320,
    minWidth: 340,
    minHeight: 240,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.display = "flex";
      body.style.flexDirection = "column";

      const listEl = W95.el("div", {
        style: { flex: "1", overflow: "auto", background: "#fff" },
      });
      body.appendChild(listEl);

      function refresh() {
        const rec = W95.vfsResolve("C:/Recycled");
        listEl.innerHTML = "";
        if (!rec || !rec.children.length) {
          listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#808080">回收站是空的。</div>';
          win.setStatus("0 个对象");
          return;
        }
        const items = rec.children.slice();
        win.setStatus(items.length + " 个对象");
        for (const it of items) {
          const row = W95.el("div", {
            style: {
              display: "flex", alignItems: "center", gap: "6px", padding: "2px 6px",
              cursor: "default", whiteSpace: "nowrap",
            },
          });
          row.innerHTML = '<span style="width:16px;height:16px">' + W95.icon(it.icon, 16) + "</span>";
          row.appendChild(W95.el("span", { text: it.name.replace(/\(\w+\)$/, "") }));
          row.appendChild(W95.el("span", { class: "w95muted", style: { marginLeft: "auto" }, text: it.type === "file" ? W95.formatBytes(it.size) : "文件夹" }));
          row.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (e.button === 2) {
              const full = "C:/Recycled/" + it.name;
              W95.popupMenu([
                { label: "还原(E)", action: () => { W95.vfsRestore(full); refresh(); } },
                { label: "删除(D)", action: async () => {
                  const r = await W95.msgbox({ title: "确认文件删除", icon: "warning", text: "确实要删除 \"" + it.name + "\" 吗？", buttons: ["是(Y)", "否(N)"] });
                  if (r === "是(Y)") { W95.vfsDelete(full); refresh(); }
                } },
                { sep: true },
                { label: "清空回收站(B)", action: emptyBin },
              ], { x: e.clientX, y: e.clientY });
              return;
            }
            listEl.querySelectorAll(".rb-sel").forEach((x) => { x.classList.remove("rb-sel"); x.style.background = ""; });
            row.classList.add("rb-sel");
            row.style.background = "#000080";
            row.style.color = "#fff";
          });
          row.addEventListener("dblclick", () => {
            const full = "C:/Recycled/" + it.name;
            W95.vfsRestore(full);
            refresh();
          });
          listEl.appendChild(row);
        }
      }

      async function emptyBin() {
        if (!W95.vfsRecycleCount()) return;
        const r = await W95.msgbox({
          title: "确认删除多个文件",
          icon: "warning",
          text: "确实要删除回收站中的全部内容吗？",
          buttons: ["是(Y)", "否(N)"],
        });
        if (r === "是(Y)") {
          W95.vfsEmptyRecycle();
          refresh();
        }
      }

      win.setMenuBar([
        {
          label: "文件(F)", onAction: (a) => {
            if (a === "empty") emptyBin();
            else if (a === "close") win.close();
          },
          items: [
            { label: "清空回收站(B)", action: "empty" },
            { sep: true },
            { label: "关闭(C)", action: "close" },
          ],
        },
        {
          label: "帮助(H)", onAction: (a) => {
            if (a === "about") W95.msgbox({ title: "关于回收站", icon: "recycle", text: "回收站\r\n\r\n被删除的项目暂存在这里，直到您将其清空。", buttons: ["确定"] });
          },
          items: [
            { label: "帮助主题(H)", action: "help" },
            { sep: true },
            { label: "关于回收站(A)", action: "about" },
          ],
        },
      ]);

      refresh();
    },
  });

  /* ================= 查找：文件或文件夹 ================= */
  W95.registerApp("find", {
    title: "查找: 所有文件",
    icon: "find",
    width: 480,
    height: 360,
    minWidth: 400,
    minHeight: 300,
    create(win) {
      const body = win.body;
      body.style.padding = "8px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";

      const row1 = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
      row1.appendChild(W95.el("span", { class: "w95label", text: "名称(N):" }));
      const nameInput = W95.el("input", { class: "w95input", type: "text", style: { flex: "1" } });
      row1.appendChild(nameInput);
      body.appendChild(row1);

      const row2 = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
      row2.appendChild(W95.el("span", { class: "w95label", text: "搜索范围(L):" }));
      const scope = W95.el("select", { class: "w95input", style: { flex: "1", fontFamily: "inherit" } });
      ["C:/", "A:/", "D:/"].forEach((d) => {
        const o = W95.el("option", { value: d, text: d === "C:/" ? "本地硬盘驱动器 (C:)" : d === "A:/" ? "3½ 软盘 (A:)" : "CD-ROM (D:)" });
        scope.appendChild(o);
      });
      row2.appendChild(scope);
      body.appendChild(row2);

      const btnRow2 = W95.el("div", { style: { display: "flex", gap: "8px" } });
      const startB = W95.el("button", { class: "w95btn default", type: "button", text: "开始查找(I)" });
      const stopB = W95.el("button", { class: "w95btn", type: "button", text: "停止(P)" });
      const newB = W95.el("button", { class: "w95btn", type: "button", text: "新搜索(W)" });
      btnRow2.appendChild(startB); btnRow2.appendChild(stopB); btnRow2.appendChild(newB);
      body.appendChild(btnRow2);

      const resultWrap = W95.el("div", {
        class: "w95field", style: {
          flex: "1", padding: "0", overflow: "auto", display: "block",
          background: "#fff", minHeight: "120px",
        },
      });
      body.appendChild(resultWrap);

      let searchTimer = null;

      function search() {
        if (searchTimer) clearTimeout(searchTimer);
        const q = nameInput.value.trim().toLowerCase();
        const root = scope.value;
        resultWrap.innerHTML = "";
        if (!q) {
          resultWrap.innerHTML = '<div style="padding:10px;color:#808080">请输入要查找的文件名。</div>';
          return;
        }
        resultWrap.innerHTML = '<div style="padding:10px;color:#808080">正在搜索...</div>';
        searchTimer = setTimeout(() => {
          const results = [];
          const walk = (node, path) => {
            if (node.children) {
              for (const c of node.children) {
                const p = path + "/" + c.name;
                if (c.name.toLowerCase().includes(q)) results.push({ node: c, path: p });
                if (c.children) walk(c, p);
              }
            }
          };
          walk(W95.vfsResolve(root), root.slice(0, -1));
          resultWrap.innerHTML = "";
          if (!results.length) {
            resultWrap.innerHTML = '<div style="padding:10px;color:#808080">没有找到匹配的项目。</div>';
            return;
          }
          for (const r of results) {
            const row = W95.el("div", {
              style: { display: "flex", alignItems: "center", gap: "6px", padding: "2px 6px", cursor: "default" },
            });
            row.innerHTML = '<span style="width:16px;height:16px">' + W95.icon(r.node.icon, 16) + "</span>";
            row.appendChild(W95.el("span", { text: r.node.name, style: { width: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }));
            row.appendChild(W95.el("span", { class: "w95muted", text: r.path, style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1" } }));
            row.appendChild(W95.el("span", { class: "w95muted", text: r.node.type === "file" ? W95.formatBytes(r.node.size) : "" }));
            row.addEventListener("dblclick", () => W95.openPath(r.path));
            resultWrap.appendChild(row);
          }
        }, 400);
      }

      startB.addEventListener("click", search);
      newB.addEventListener("click", () => { nameInput.value = ""; resultWrap.innerHTML = ""; nameInput.focus(); });
      stopB.addEventListener("click", () => { if (searchTimer) clearTimeout(searchTimer); });
      nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") search(); });

      win.beforeDestroy = () => { if (searchTimer) clearTimeout(searchTimer); };
    },
  });

  /* ================= 磁盘碎片整理 ================= */
  W95.registerApp("defrag", {
    title: "磁盘碎片整理程序",
    icon: "drive",
    width: 420,
    height: 300,
    resizable: false,
    statusbar: false,
    create(win) {
      const body = win.body;
      body.style.padding = "10px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";
      body.style.background = "#000040";

      const title = W95.el("div", { style: { color: "#c0c0c0", fontSize: "12px" }, text: "正在整理驱动器 C ..." });
      body.appendChild(title);

      const canvas = W95.el("canvas", { width: 380, height: 170 });
      canvas.style.cssText = "border:1px solid #404080;background:#000040;width:100%";
      const ctx = canvas.getContext("2d");
      body.appendChild(canvas);

      const pct = W95.el("div", { style: { color: "#ffffff", textAlign: "center", fontSize: "14px" }, text: "0%" });
      body.appendChild(pct);

      const cancelB = W95.el("button", {
        class: "w95btn", type: "button", text: "停止(S)",
        style: { alignSelf: "center", minWidth: "80px" },
      });
      body.appendChild(cancelB);

      // 彩色方块模拟
      const blocks = [];
      for (let i = 0; i < 60; i++) {
        blocks.push({
          x: Math.random() * 360, y: Math.random() * 150,
          w: 8 + Math.random() * 20, h: 6 + Math.random() * 14,
          c: ["#ff4040", "#40ff40", "#4080ff", "#ffff40", "#ff40ff"][Math.floor(Math.random() * 5)],
          vx: (Math.random() - 0.5) * 0.8,
        });
      }
      let progress = 0;
      let running = true;
      const iv = setInterval(() => {
        if (!running) return;
        progress += 0.5 + Math.random();
        ctx.clearRect(0, 0, 380, 170);
        for (const b of blocks) {
          b.x += b.vx;
          if (b.x < 0 || b.x > 360) b.vx *= -1;
          ctx.fillStyle = b.c;
          ctx.fillRect(b.x, b.y, b.w, b.h);
        }
        pct.textContent = Math.min(100, Math.floor(progress)) + "%";
        if (progress >= 100) {
          running = false;
          clearInterval(iv);
          ctx.clearRect(0, 0, 380, 170);
          ctx.fillStyle = "#40ff40";
          ctx.font = "16px 'Courier New',monospace";
          ctx.fillText("碎片整理完成!", 130, 90);
          setTimeout(() => {
            W95.msgbox({ title: "磁盘碎片整理程序", icon: "info", text: "驱动器 C 的碎片整理已完成。", buttons: ["确定"] });
            win.close();
          }, 400);
        }
      }, 60);

      cancelB.addEventListener("click", () => {
        running = false;
        clearInterval(iv);
        W95.msgbox({ title: "磁盘碎片整理程序", icon: "info", text: "磁盘碎片整理已停止。", buttons: ["确定"] });
        win.close();
      });
      win.beforeDestroy = () => clearInterval(iv);
    },
  });

  /* ================= 系统配置实用程序 ================= */
  W95.registerApp("msconfig", {
    title: "系统配置实用程序",
    icon: "system",
    width: 480,
    height: 340,
    create(win) {
      const body = win.body;
      body.style.padding = "10px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";

      const tabs = W95.el("div", { class: "w95tabs" });
      body.appendChild(tabs);
      const pages = {};
      ["常规", "启动"].forEach((t, i) => {
        const tab = W95.el("div", { class: "w95tab" + (i === 0 ? " active" : ""), text: t });
        tab.addEventListener("mousedown", (e) => {
          e.preventDefault();
          W95.$$(".w95tab", tabs).forEach((x, xi) => x.classList.toggle("active", xi === i));
          Object.values(pages).forEach((p, pi) => (p.style.display = pi === i ? "block" : "none"));
        });
        tabs.appendChild(tab);
      });
      const p1 = W95.el("div", { class: "w95tabpage" });
      p1.appendChild(W95.el("div", { class: "w95label", text: "启动选项:" }));
      p1.appendChild(checkbox("正常启动 - 加载所有设备驱动程序和软件", true));
      p1.appendChild(checkbox("诊断启动 - 仅加载基本设备驱动程序和服务"));
      p1.appendChild(checkbox("有选择的启动:"));
      p1.appendChild(checkbox("处理 SYSTEM.INI 文件", true, null, "margin-left:24px"));
      p1.appendChild(checkbox("处理 WIN.INI 文件", true, null, "margin-left:24px"));
      p1.appendChild(checkbox("加载启动组项目", true, null, "margin-left:24px"));
      body.appendChild(p1);

      const p2 = W95.el("div", { class: "w95tabpage", style: { display: "none" } });
      p2.appendChild(W95.el("div", { class: "w95label", text: "启动项目:" }));
      ["ScanRegistry", "TaskMonitor", "SystemTray", "LoadPowerProfile"].forEach((s) => {
        p2.appendChild(checkbox(s + ".exe", true, null, "margin-left:20px"));
      });
      body.appendChild(p2);

      const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
      const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
      ok.addEventListener("click", () => win.close());
      const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
      cancel.addEventListener("click", () => win.close());
      row.appendChild(ok); row.appendChild(cancel);
      body.appendChild(row);

      function checkbox(label, checked, onChange, margin) {
        const r = W95.el("label", { class: "w95check" });
        if (margin) r.style.marginLeft = margin;
        const cb = W95.el("input", { type: "checkbox" });
        cb.checked = !!checked;
        cb.addEventListener("change", () => onChange && onChange(cb.checked));
        r.appendChild(cb);
        r.appendChild(W95.el("span", { class: "w95label", text: label }));
        return r;
      }
    },
  });

  /* ================= 注册表编辑器 ================= */
  W95.registerApp("regedit", {
    title: "注册表编辑器",
    icon: "regedit",
    width: 520,
    height: 360,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.display = "flex";

      const tree = W95.el("div", {
        style: {
          width: "240px", overflow: "auto", background: "#fff",
          borderRight: "1px solid #808080", padding: "2px", flex: "0 0 auto",
        },
      });
      const keys = [
        ["HKEY_CLASSES_ROOT", ["\.txt", "\.bmp", "\.exe"]],
        ["HKEY_CURRENT_USER", ["Control Panel", "Software", "Environment"]],
        ["HKEY_LOCAL_MACHINE", ["Software", "Hardware", "System"]],
        ["HKEY_USERS", [".DEFAULT"]],
        ["HKEY_CURRENT_CONFIG", ["Software", "System"]],
        ["HKEY_DYN_DATA", ["Config Manager", "PerfStats"]],
      ];
      keys.forEach(([k, kids]) => {
        const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap", cursor: "default" } });
        row.innerHTML = '<span style="font-size:8px">▸</span><span style="width:16px;height:16px">' + W95.icon("folder", 16) + "</span><span style='font-size:11px'>" + k + "</span>";
        row.addEventListener("mousedown", (e) => {
          e.preventDefault();
          tree.querySelectorAll(".reg-sel").forEach((x) => { x.classList.remove("reg-sel"); x.style.background = ""; });
          row.classList.add("reg-sel");
          row.style.background = "#000080";
          row.style.color = "#fff";
          showValues(k);
        });
        tree.appendChild(row);
        kids.forEach((kid) => {
          const sub = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "3px", marginLeft: "20px", whiteSpace: "nowrap", cursor: "default" } });
          sub.innerHTML = '<span style="width:16px;height:16px">' + W95.icon("folder", 16) + "</span><span style='font-size:11px'>" + kid + "</span>";
          tree.appendChild(sub);
        });
      });
      body.appendChild(tree);

      const right = W95.el("div", {
        style: { flex: "1", overflow: "auto", background: "#fff", fontSize: "11px" },
      });
      body.appendChild(right);

      function showValues(key) {
        right.innerHTML = "";
        right.appendChild(W95.el("div", {
          style: { padding: "2px 6px", fontWeight: "bold", borderBottom: "1px solid #c0c0c0" },
          text: "名称                     数据",
        }));
        const sample = {
          "HKEY_CLASSES_ROOT": [["(默认)", '(值未设置)'], ["Content Type", "text/plain"]],
          "HKEY_CURRENT_USER": [["(默认)", '(值未设置)'], ["Wallpaper", "C:\\WINDOWS\\Clouds.bmp"]],
          "HKEY_LOCAL_MACHINE": [["(默认)", '(值未设置)'], ["Version", "4.00.950"]],
          "HKEY_USERS": [["(默认)", '(值未设置)']],
          "HKEY_CURRENT_CONFIG": [["(默认)", '(值未设置)']],
          "HKEY_DYN_DATA": [["(默认)", '(值未设置)']],
        }[key] || [["(默认)", '(值未设置)']];
        sample.forEach(([n, v]) => {
          right.appendChild(W95.el("div", {
            style: { padding: "1px 6px", whiteSpace: "nowrap" },
            html: '<span style="display:inline-block;width:120px">' + n + "</span>" + v,
          }));
        });
      }
      showValues("HKEY_CLASSES_ROOT");

      win.setMenuBar([
        {
          label: "注册表(R)", onAction: (a) => {
            if (a === "export") W95.msgbox({ title: "注册表编辑器", icon: "info", text: "（模拟）注册表已导出到 C:\\WINDOWS\\REGEDIT.TXT", buttons: ["确定"] });
            else if (a === "exit") win.close();
          },
          items: [
            { label: "导入注册表文件(I)...", disabled: true },
            { label: "导出注册表文件(E)...", action: "export" },
            { sep: true },
            { label: "退出(X)", action: "exit" },
          ],
        },
      ]);
    },
  });

  /* ================= 系统配置编辑器 ================= */
  W95.registerApp("sysedit", {
    title: "系统配置编辑器 - [WIN.INI]",
    icon: "txtfile",
    width: 520,
    height: 380,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.display = "flex";
      body.style.flexDirection = "column";

      const ta = W95.el("textarea", {
        style: {
          flex: "1", resize: "none", border: "0", outline: "none",
          fontFamily: "'Courier New',monospace", fontSize: "13px",
          padding: "4px", background: "#fff",
        },
      });
      ta.value =
        "; for 16-bit app support\r\n[fonts]\r\n[extensions]\r\n[mci extensions]\r\n[files]\r\n[Mail]\r\nMAPI=1\r\n\r\n; WIN.INI\r\n[windows]\r\nload=\r\nrun=\r\nBeep=Yes\r\n\r\n[Desktop]\r\nWallpaper=(None)\r\nTileWallpaper=0\r\n";
      body.appendChild(ta);

      const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", padding: "6px" } });
      const save = W95.el("button", { class: "w95btn default", type: "button", text: "保存" });
      save.addEventListener("click", () => W95.msgbox({ title: "系统配置编辑器", icon: "info", text: "（模拟）文件已保存。", buttons: ["确定"] }));
      const close = W95.el("button", { class: "w95btn", type: "button", text: "关闭" });
      close.addEventListener("click", () => win.close());
      row.appendChild(save); row.appendChild(close);
      body.appendChild(row);
    },
  });
})();
