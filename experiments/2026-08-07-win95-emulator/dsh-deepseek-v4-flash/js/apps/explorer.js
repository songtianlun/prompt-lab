/* ============================================================
   Windows 资源管理器
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const VIEWS = { large: "大图标", small: "小图标", list: "列表", details: "详细资料" };

  W95.registerApp("explorer", {
    title: "浏览 - C:\\",
    icon: "explorer",
    width: 620,
    height: 420,
    minWidth: 420,
    minHeight: 280,
    create(win) {
      let cwd = (win.opts && win.opts.path) || "C:/";
      let view = W95.store.get("explorer-view", "large");
      let treeState = {}; // path -> expanded

      const body = win.body;
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.padding = "0";
      body.style.overflow = "hidden";

      // 工具栏
      const toolbar = W95.el("div", {
        style: {
          display: "flex", alignItems: "center", gap: "2px",
          padding: "2px", borderBottom: "1px solid #808080",
          flex: "0 0 auto",
        },
      });
      const tbBtn = (label, title, fn) => {
        const b = W95.el("button", {
          type: "button", title,
          style: {
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "1px", padding: "2px 6px", background: "transparent",
            border: "0", fontFamily: "inherit", fontSize: "10px",
          },
        });
        b.innerHTML = label;
        b.addEventListener("click", fn);
        toolbar.appendChild(b);
        return b;
      };
      const upBtn = tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="8" fill="#ffff00" stroke="#000"/><path d="M4,5 L4,2 L14,2 L14,5" fill="#ffff00" stroke="#000"/><path d="M3,9 L13,9 L13,11 L3,11 Z" fill="#0000c0"/><path d="M8,7 L5,9.5 L8,12" fill="#0000c0"/></svg><span>上一级</span>', "向上一级", () => goUp());
      tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="9" height="11" fill="#fff" stroke="#000"/><path d="M3,5 L2,5 L2,15 L11,15 L11,14" fill="#fff" stroke="#000"/><path d="M12,2 L13,2 L13,12 L12,12 Z" fill="#c0c0c0" stroke="#000"/></svg><span>剪切</span>', "剪切", () => { W95.msgbox({ title: "资源管理器", icon: "info", text: "已复制选定项目到剪贴板（模拟）。", buttons: ["确定"] }); });
      tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="9" height="11" fill="#fff" stroke="#000"/><rect x="6" y="5" width="9" height="11" fill="#fff" stroke="#000"/></svg><span>复制</span>', "复制", () => { W95.msgbox({ title: "资源管理器", icon: "info", text: "已复制选定项目到剪贴板（模拟）。", buttons: ["确定"] }); });
      tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="6" width="10" height="8" fill="#ffffe0" stroke="#000"/><rect x="5" y="3" width="10" height="8" fill="#fff" stroke="#000"/><path d="M6,8 L8,6 L11,6 L9,8" fill="#00a000"/></svg><span>粘贴</span>', "粘贴", () => { W95.msgbox({ title: "资源管理器", icon: "info", text: "剪贴板为空（模拟）。", buttons: ["确定"] }); });
      tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" fill="#c0c0c0" stroke="#000"/><path d="M7,5 L7,11 M4,8 L10,8" stroke="#ff0000" stroke-width="2"/></svg><span>删除</span>', "删除", () => deleteSelected());
      tbBtn('<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="10" fill="#c0c0c0" stroke="#000"/><circle cx="8" cy="9" r="2.5" fill="#008080"/><path d="M4,4 h4 v1 h-4 z" fill="#008080"/><path d="M8,12 v2 M5,14 h6" stroke="#000"/></svg><span>属性</span>', "属性", () => showProperties());
      const viewBtn = tbBtn("", "查看", () => {});
      viewBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="8" fill="#fff" stroke="#000"/><rect x="2" y="6" width="10" height="8" fill="#fff" stroke="#000"/></svg><span>查看</span>';
      viewBtn.addEventListener("click", (e) => {
        W95.popupMenu([
          { label: "大图标(G)", checked: view === "large", action: () => { view = "large"; refresh(); } },
          { label: "小图标(I)", checked: view === "small", action: () => { view = "small"; refresh(); } },
          { label: "列表(L)", checked: view === "list", action: () => { view = "list"; refresh(); } },
          { label: "详细资料(D)", checked: view === "details", action: () => { view = "details"; refresh(); } },
        ], { x: e.clientX, y: e.clientY + 10 });
      });
      body.appendChild(toolbar);

      // 地址栏
      const addrRow = W95.el("div", {
        style: {
          display: "flex", alignItems: "center", gap: "4px",
          padding: "2px 4px", flex: "0 0 auto",
        },
      });
      addrRow.appendChild(W95.el("span", { class: "w95label", text: "地址:" }));
      const addrInput = W95.el("input", {
        class: "w95input", type: "text", value: cwd, style: { flex: "1" },
      });
      addrRow.appendChild(addrInput);
      body.appendChild(addrRow);
      addrInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const p = addrInput.value.trim();
          if (W95.vfsResolve(p)) { cwd = p; refresh(); }
          else W95.msgbox({ title: "资源管理器", icon: "error", text: "找不到路径“" + p + "”。", buttons: ["确定"] });
        }
      });

      // 主区域
      const main = W95.el("div", { style: { flex: "1", display: "flex", minHeight: "0" } });
      body.appendChild(main);

      // 树
      const treeEl = W95.el("div", {
        style: {
          width: "180px", overflow: "auto", background: "#fff",
          borderRight: "1px solid #808080", padding: "2px",
          flex: "0 0 auto",
        },
      });
      main.appendChild(treeEl);

      // 内容
      const contentEl = W95.el("div", {
        style: { flex: "1", overflow: "auto", background: "#fff", position: "relative" },
      });
      main.appendChild(contentEl);

      // 状态栏
      win.setStatus("");

      // ------- 树 -------
      function treeChildren(path) {
        const node = W95.vfsResolve(path);
        return node && node.children ? node.children.filter((c) => c.type === "folder") : [];
      }

      function renderTree() {
        treeEl.innerHTML = "";
        // 桌面根
        const rootNode = makeTreeNode("桌面", "computer", "desktop", true);
        treeEl.appendChild(rootNode);
        // 我的电脑
        const mc = makeTreeNode("我的电脑", "computer", "mc", true);
        rootNode.appendChild(mc);
        const drivesWrap = W95.el("div", { style: { marginLeft: "16px" } });
        mc.appendChild(drivesWrap);
        for (const key in W95.vfs().drives) {
          const drive = W95.vfs().drives[key];
          const icon = key === "A:" ? "floppy" : key === "D:" ? "cdrom" : "drive";
          const dn = makeTreeNode(drive.name, icon, key, true);
          dn._path = key + "/";
          drivesWrap.appendChild(dn);
          const dWrap = W95.el("div", { style: { marginLeft: "16px" } });
          dn.appendChild(dWrap);
          if (treeState[key + "/"]) {
            dWrap.style.display = "block";
            for (const f of treeChildren(key + "/")) {
              const sub = makeTreeNode(f.name, f.icon, key + "/" + f.name, false);
              sub._path = key + "/" + f.name;
              dWrap.appendChild(sub);
              const subWrap = W95.el("div", { style: { marginLeft: "16px" } });
              sub.appendChild(subWrap);
              if (treeState[key + "/" + f.name]) {
                subWrap.style.display = "block";
                for (const g of treeChildren(key + "/" + f.name)) {
                  const sub2 = makeTreeNode(g.name, g.icon, key + "/" + f.name + "/" + g.name, false);
                  sub2._path = key + "/" + f.name + "/" + g.name;
                  subWrap.appendChild(sub2);
                }
              }
            }
          } else {
            dWrap.style.display = "none";
          }
        }
      }

      function makeTreeNode(label, icon, key, hasKids) {
        const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "2px", whiteSpace: "nowrap", cursor: "default" } });
        const exp = W95.el("span", {
          style: { width: "12px", display: "inline-block", textAlign: "center", fontSize: "8px" },
          text: hasKids ? (treeState[key] ? "−" : "+") : " ",
        });
        row.appendChild(exp);
        const ic = W95.el("span", { html: W95.icon(icon, 16), style: { flex: "0 0 auto" } });
        row.appendChild(ic);
        const lbl = W95.el("span", { text: label, style: { padding: "1px 2px" } });
        row.appendChild(lbl);
        row._key = key;
        row._path = null;

        row.addEventListener("mousedown", (e) => {
          e.preventDefault();
          if (e.button === 2) return;
          if (hasKids) {
            treeState[key] = !treeState[key];
            renderTree();
            if (treeState[key] && row._path) { cwd = row._path; refresh(); }
          } else {
            if (row._path) { cwd = row._path; refresh(); }
          }
        });
        // 选择高亮
        row.addEventListener("mousedown", (e) => {
          treeEl.querySelectorAll(".tree-sel").forEach((x) => x.classList.remove("tree-sel"));
          row.classList.add("tree-sel");
        });
        return row;
      }

      // ------- 内容 -------
      function refresh() {
        const node = W95.vfsResolve(cwd);
        if (!node || node.type !== "folder") {
          cwd = "C:/";
        }
        const n = W95.vfsResolve(cwd);
        win.setTitle("浏览 - " + cwd);
        addrInput.value = cwd;
        contentEl.innerHTML = "";
        const items = n.children.slice().sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name, "zh");
        });

        // 计算统计
        let sizeSum = 0, folders = 0, files = 0;
        for (const it of items) {
          if (it.type === "folder") folders++;
          else { files++; sizeSum += it.size || 0; }
        }
        win.setStatus(items.length + " 个对象 (" + folders + " 个文件夹, " + files + " 个文件, " + W95.formatBytes(sizeSum) + ")");

        const sel = new Set();

        if (view === "large") {
          contentEl.style.display = "flex";
          contentEl.style.flexWrap = "wrap";
          contentEl.style.alignContent = "flex-start";
          contentEl.style.gap = "6px";
          for (const it of items) {
            const cell = makeIconCell(it, true);
            contentEl.appendChild(cell);
          }
        } else if (view === "small") {
          contentEl.style.display = "flex";
          contentEl.style.flexWrap = "wrap";
          contentEl.style.alignContent = "flex-start";
          contentEl.style.gap = "2px";
          for (const it of items) {
            contentEl.appendChild(makeIconCell(it, false));
          }
        } else if (view === "list") {
          contentEl.style.display = "block";
          for (const it of items) {
            contentEl.appendChild(makeListRow(it));
          }
        } else {
          contentEl.style.display = "block";
          const head = W95.el("div", {
            style: {
              display: "flex", fontWeight: "bold", padding: "2px 4px",
              borderBottom: "1px solid #808080", background: "#c0c0c0",
              position: "sticky", top: "0",
            },
          });
          const h1 = W95.el("span", { text: "名称", style: { width: "45%", overflow: "hidden" } });
          const h2 = W95.el("span", { text: "大小", style: { width: "15%" } });
          const h3 = W95.el("span", { text: "类型", style: { width: "25%" } });
          const h4 = W95.el("span", { text: "修改时间", style: { width: "15%" } });
          head.appendChild(h1); head.appendChild(h2); head.appendChild(h3); head.appendChild(h4);
          contentEl.appendChild(head);
          for (const it of items) {
            contentEl.appendChild(makeDetailsRow(it));
          }
        }

        function makeIconCell(it, big) {
          const cell = W95.el("div", {
            style: {
              display: "flex", flexDirection: "column", alignItems: "center",
              width: big ? "76px" : "auto", padding: "4px", cursor: "default",
              textAlign: "center",
            },
          });
          const ic = W95.el("span", { html: W95.icon(it.icon, big ? 32 : 16) });
          cell.appendChild(ic);
          const lbl = W95.el("div", {
            text: it.name,
            style: {
              fontSize: "11px", padding: "1px 2px", maxWidth: big ? "72px" : "120px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            },
          });
          cell.appendChild(lbl);
          wireItem(cell, it);
          return cell;
        }

        function makeListRow(it) {
          const row = W95.el("div", {
            style: {
              display: "flex", alignItems: "center", gap: "4px", padding: "1px 4px",
              cursor: "default", whiteSpace: "nowrap",
            },
          });
          row.appendChild(W95.el("span", { html: W95.icon(it.icon, 16) }));
          row.appendChild(W95.el("span", { text: it.name, style: { overflow: "hidden", textOverflow: "ellipsis" } }));
          wireItem(row, it);
          return row;
        }

        function makeDetailsRow(it) {
          const row = W95.el("div", {
            style: {
              display: "flex", padding: "1px 4px", cursor: "default",
              borderBottom: "1px solid #e0e0e0",
            },
          });
          const c1 = W95.el("span", { style: { width: "45%", display: "flex", alignItems: "center", gap: "4px", overflow: "hidden" } });
          c1.appendChild(W95.el("span", { html: W95.icon(it.icon, 16) }));
          c1.appendChild(W95.el("span", { text: it.name, style: { overflow: "hidden", textOverflow: "ellipsis" } }));
          const c2 = W95.el("span", { text: it.type === "file" ? W95.formatBytes(it.size) : "", style: { width: "15%" } });
          const typeName = it.type === "folder" ? "文件夹" : fileTypeName(it.name);
          const c3 = W95.el("span", { text: typeName, style: { width: "25%", overflow: "hidden", whiteSpace: "nowrap" } });
          const c4 = W95.el("span", { text: "95-04-24 10:00", style: { width: "15%" } });
          row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); row.appendChild(c4);
          wireItem(row, it);
          return row;
        }

        function wireItem(el, it) {
          el.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (e.button === 2) {
              itemContextMenu(e, it);
              return;
            }
            clearSel();
            el.classList.add("item-sel");
            el.style.background = "#000080";
            el.style.color = "#fff";
            sel.add(it);
          });
          el.addEventListener("dblclick", () => {
            if (it.type === "folder") {
              cwd = cwd + "/" + it.name;
              refresh();
            } else {
              W95.openPath(cwd + "/" + it.name);
            }
          });
        }
        function clearSel() {
          contentEl.querySelectorAll(".item-sel").forEach((x) => {
            x.classList.remove("item-sel");
            x.style.background = "";
            x.style.color = "";
          });
          sel.clear();
        }
      }

      function fileTypeName(name) {
        const n = name.toLowerCase();
        if (n.endsWith(".exe")) return "应用程序";
        if (n.endsWith(".txt")) return "文本文档";
        if (n.endsWith(".bmp")) return "BMP 图像";
        if (n.endsWith(".bat")) return "MS-DOS 批处理文件";
        if (n.endsWith(".com")) return "MS-DOS 应用程序";
        return "文件";
      }

      function goUp() {
        const parts = cwd.split("/").filter(Boolean);
        if (parts.length <= 1) return;
        parts.pop();
        cwd = "/" + parts.join("/");
        refresh();
      }

      // 右键菜单
      function itemContextMenu(e, it) {
        const path = cwd + "/" + it.name;
        const items = [
          { label: "打开(O)", action: () => W95.openPath(path) },
          { sep: true },
          { label: "删除(D)", action: () => deleteItem(path, it.name) },
          { label: "重命名(M)", action: () => renameItem(path, it.name) },
          { label: "属性(R)", action: () => showProps(path, it) },
        ];
        W95.popupMenu(items, { x: e.clientX, y: e.clientY });
      }

      function deleteSelected() {
        const selItems = [];
        contentEl.querySelectorAll(".item-sel").forEach((x) => {
          const name = x.textContent.trim();
          const node = W95.vfsResolve(cwd + "/" + name);
          if (node) selItems.push(node.name);
        });
        if (!selItems.length) {
          W95.msgbox({ title: "资源管理器", icon: "info", text: "请先选定要删除的项目。", buttons: ["确定"] });
          return;
        }
        selItems.forEach((n) => deleteItem(cwd + "/" + n, n));
      }

      async function deleteItem(path, name) {
        const r = await W95.msgbox({
          title: "确认文件删除",
          icon: "warning",
          text: "确实要把 \"" + name + "\" 放入回收站吗？",
          buttons: ["是(Y)", "否(N)"],
        });
        if (r !== "是(Y)") return;
        if (W95.vfsDelete(path)) refresh();
      }

      async function renameItem(path, name) {
        const newName = await W95.inputBox({ title: "重命名", text: "请输入新名称:", value: name });
        if (newName && newName !== name) {
          if (W95.vfsRename(path, newName)) refresh();
        }
      }

      function showProperties() {
        const node = W95.vfsResolve(cwd);
        if (node) showProps(cwd, node);
      }

      function showProps(path, node) {
        const win2 = W95.dlgWindow({ title: node.name + " 属性", icon: "msg-folder" });
        const b2 = win2.body;
        b2.style.display = "flex";
        b2.style.flexDirection = "column";
        b2.style.gap = "8px";
        b2.style.minWidth = "320px";

        const head = W95.el("div", { style: { display: "flex", gap: "10px", alignItems: "center" } });
        head.innerHTML = '<span style="width:32px;height:32px">' + W95.icon(node.type === "folder" ? "folder" : node.icon, 32) + "</span>";
        head.appendChild(W95.el("div", { class: "w95label", style: { fontWeight: "bold" }, text: node.name }));
        b2.appendChild(head);

        if (node.type === "folder") {
          b2.appendChild(W95.el("div", { class: "w95label", text: "类型:  文件夹" }));
          b2.appendChild(W95.el("div", { class: "w95label", text: "位置:  " + path }));
          b2.appendChild(W95.el("div", { class: "w95label", text: "包含:  " + (node.children ? node.children.length : 0) + " 个项目" }));
        } else {
          b2.appendChild(W95.el("div", { class: "w95label", text: "类型:  " + fileTypeName(node.name) }));
          b2.appendChild(W95.el("div", { class: "w95label", text: "位置:  " + path }));
          b2.appendChild(W95.el("div", { class: "w95label", text: "大小:  " + W95.formatBytes(node.size || 0) }));
        }
        b2.appendChild(W95.el("div", { class: "w95label", text: "创建时间:  1995-08-24 08:00" }));
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
        const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
        ok.addEventListener("click", () => win2.close());
        row.appendChild(ok);
        b2.appendChild(row);
      }

      // 内容空白处右键
      contentEl.addEventListener("contextmenu", (e) => {
        if (e.target.closest(".item-sel") || e.target.closest("[data-item]")) return;
        e.preventDefault();
        W95.popupMenu([
          {
            label: "新建(W)", submenu: [
              { label: "文件夹(F)", action: async () => {
                const name = await W95.inputBox({ title: "新建文件夹", text: "请输入文件夹名称:", value: "新建文件夹" });
                if (name && W95.vfsMkdir(cwd, name)) refresh();
              } },
              { label: "文本文档", action: async () => {
                const name = await W95.inputBox({ title: "新建文本文档", text: "请输入文件名:", value: "新建 文本文档.txt" });
                if (name) {
                  W95.vfsWriteFile(cwd, name, "", "txtfile", "text/plain");
                  refresh();
                }
              } },
            ],
          },
          { label: "刷新(R)", action: () => refresh() },
          { label: "属性(R)", action: () => showProperties() },
        ], { x: e.clientX, y: e.clientY });
      });

      // 快捷键
      contentEl.tabIndex = 0;
      contentEl.addEventListener("keydown", (e) => {
        if (e.key === "F5") { e.preventDefault(); refresh(); }
      });

      refresh();
      renderTree();
    },
  });
})();
