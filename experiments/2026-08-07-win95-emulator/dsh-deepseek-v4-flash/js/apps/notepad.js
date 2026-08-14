/* ============================================================
   记事本
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  W95.registerApp("notepad", {
    title: "记事本 - 无标题",
    icon: "notepad",
    width: 480,
    height: 360,
    minWidth: 280,
    minHeight: 200,
    statusbar: false,
    create(win) {
      let currentPath = null;
      let dirty = false;
      let findText = "";

      win.setTitle("记事本 - " + (currentPath ? currentPath.split("/").pop() : "无标题"));

      const ta = W95.el("textarea", {
        class: "notepad-ta",
        spellcheck: "false",
        wrap: "off",
      });
      ta.style.cssText =
        "flex:1;resize:none;border:0;outline:none;background:#fff;color:#000;" +
        "font-family:'Courier New',monospace;font-size:13px;padding:4px;white-space:pre;";
      ta.spellcheck = false;
      win.body.appendChild(ta);

      // 打开传入文件
      if (win.opts && win.opts.path) {
        const node = W95.vfsResolve(win.opts.path);
        if (node && node.type === "file") {
          currentPath = win.opts.path;
          ta.value = node.content;
          win.setTitle("记事本 - " + node.name);
          W95.recent.add(win.opts.path, node.name);
        }
      }
      // 桌面新建的文本文档
      if (win.opts && win.opts.desktopFile) {
        const ic = W95.Shell.icons.find((i) => i.id === win.opts.desktopFile);
        if (ic) win.setTitle("记事本 - " + ic.name);
      }

      ta.addEventListener("input", () => {
        dirty = true;
        if (!win._titleDirty) {
          win._titleDirty = true;
          win.setTitle("记事本 - " + (currentPath ? currentPath.split("/").pop() : "无标题") + "*");
        }
      });

      const setContent = (text, name) => {
        ta.value = text;
        dirty = false;
        win._titleDirty = false;
        win.setTitle("记事本 - " + name);
      };

      const newFile = () => {
        if (dirty && !confirmDiscard()) return;
        currentPath = null;
        setContent("", "无标题");
      };

      const confirmDiscard = async () => {
        const r = await W95.msgbox({
          title: "记事本",
          icon: "warning",
          text: "文件的内容已经改变。\r\n想保存文件吗?",
          buttons: ["是(Y)", "否(N)", "取消"],
        });
        if (r === "是(Y)") { await saveFile(); return !dirty; }
        if (r === "否(N)") return true;
        return false;
      };

      const saveFile = async (saveAs) => {
        if (!currentPath || saveAs) {
          const res = await W95.fileDialog({
            title: "另存为",
            mode: "save",
            startPath: "C:/My Documents",
            defaultName: currentPath ? currentPath.split("/").pop() : "无标题.txt",
            filter: "文本文档 (*.txt)",
          });
          if (!res) return false;
          currentPath = res.path;
        }
        const name = currentPath.split("/").pop();
        W95.vfsWriteFile(
          currentPath.slice(0, currentPath.lastIndexOf("/")),
          name,
          ta.value,
          "txtfile",
          "text/plain"
        );
        dirty = false;
        win._titleDirty = false;
        win.setTitle("记事本 - " + name);
        W95.recent.add(currentPath, name);
        return true;
      };

      const openFile = async () => {
        if (dirty && !(await confirmDiscard())) return;
        const res = await W95.fileDialog({
          title: "打开",
          mode: "open",
          startPath: "C:/My Documents",
          filter: "文本文档 (*.txt)",
        });
        if (!res) return;
        const node = W95.vfsResolve(res.path);
        if (!node) {
          W95.msgbox({ title: "记事本", icon: "error", text: "无法打开文件。", buttons: ["确定"] });
          return;
        }
        currentPath = res.path;
        setContent(node.content, node.name);
        W95.recent.add(res.path, node.name);
      };

      const findDialog = async () => {
        const res = await W95.inputBox({
          title: "查找",
          text: "查找内容(N):",
          value: findText,
        });
        if (res === null) return;
        findText = res;
        doFind();
      };

      const doFind = () => {
        if (!findText) { findDialog(); return; }
        const idx = ta.value.indexOf(findText, ta.selectionStart + (ta.selectionStart ? 1 : 0));
        if (idx >= 0) {
          ta.focus();
          ta.setSelectionRange(idx, idx + findText.length);
          ta.scrollTop = Math.max(0, (idx / ta.value.length) * ta.scrollHeight - 50);
        } else {
          W95.msgbox({ title: "记事本", icon: "info", text: "找不到“" + findText + "”。", buttons: ["确定"] });
        }
      };

      const doFindNext = () => {
        if (!findText) { findDialog(); return; }
        const idx = ta.value.indexOf(findText, ta.selectionEnd);
        if (idx >= 0) {
          ta.focus();
          ta.setSelectionRange(idx, idx + findText.length);
        } else {
          ta.focus();
          ta.setSelectionRange(0, 0);
          const idx2 = ta.value.indexOf(findText);
          if (idx2 >= 0) ta.setSelectionRange(idx2, idx2 + findText.length);
          else W95.msgbox({ title: "记事本", icon: "info", text: "找不到“" + findText + "”。", buttons: ["确定"] });
        }
      };

      const cut = () => { document.execCommand("cut"); };
      const copy = () => { document.execCommand("copy"); };
      const paste = () => { document.execCommand("paste"); };

      win.setMenuBar({
        label: "文件(F)", onAction: (a) => {
          if (a === "new") newFile();
          else if (a === "open") openFile();
          else if (a === "save") saveFile(false);
          else if (a === "saveas") saveFile(true);
          else if (a === "exit") win.close();
        },
        items: [
          { label: "新建(N)", action: "new" },
          { label: "打开(O)...", action: "open" },
          { label: "保存(S)", action: "save" },
          { label: "另存为(A)...", action: "saveas" },
          { sep: true },
          { label: "页面设置(T)...", disabled: true },
          { label: "打印(P)...", disabled: true },
          { sep: true },
          { label: "退出(X)", action: "exit" },
        ],
      });

      win.setMenuBar2 = function (menus) {};
      // 追加其他菜单
      const addMenus = () => {
        const mb = win.menubar;
        const append = (label, items, onAction) => {
          const item = W95.el("div", { class: "win-menubar-item", text: label });
          mb.appendChild(item);
          item.addEventListener("mousedown", (e) => {
            e.preventDefault(); e.stopPropagation();
            if (item.classList.contains("active")) { W95.closeMenus(); item.classList.remove("active"); return; }
            W95.$$(".win-menubar-item.active").forEach((x) => x.classList.remove("active"));
            item.classList.add("active");
            W95.popupMenu(items, {
              x: item.getBoundingClientRect().left,
              y: item.getBoundingClientRect().bottom,
              onClose: () => item.classList.remove("active"),
              onAction: (a) => { onAction(a); W95.$$(".win-menubar-item.active").forEach((x) => x.classList.remove("active")); },
            });
          });
        };
        append("编辑(E)", [
          { label: "撤消(U)", action: "undo" },
          { sep: true },
          { label: "剪切(T)", action: "cut" },
          { label: "复制(C)", action: "copy" },
          { label: "粘贴(P)", action: "paste" },
          { sep: true },
          { label: "删除(L)", action: "del" },
          { label: "全选(A)", action: "all" },
          { label: "时间/日期(D)", action: "time" },
        ], (a) => {
          if (a === "undo") document.execCommand("undo");
          else if (a === "cut") cut();
          else if (a === "copy") copy();
          else if (a === "paste") paste();
          else if (a === "del") document.execCommand("delete");
          else if (a === "all") { ta.focus(); ta.select(); }
          else if (a === "time") {
            const d = new Date();
            const s = d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0") + " " + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear();
            document.execCommand("insertText", false, s);
          }
        });
        append("搜索(S)", [
          { label: "查找(F)...", action: "find" },
          { label: "查找下一个(N)", action: "findnext" },
        ], (a) => {
          if (a === "find") findDialog();
          else if (a === "findnext") doFindNext();
        });
        append("帮助(H)", [
          { label: "帮助主题(H)", action: "help" },
          { sep: true },
          { label: "关于记事本(A)", action: "about" },
        ], (a) => {
          if (a === "help") W95.openApp("help");
          else if (a === "about") {
            W95.msgbox({
              title: "关于记事本", icon: "notepad",
              text: "Microsoft (R) 记事本\r\n版本 4.0\r\n\r\n本程序由 Windows 95 网页模拟器提供。",
              buttons: ["确定"],
            });
          }
        });
        // 全选快捷键
        ta.addEventListener("keydown", (e) => {
          if (e.key === "F3") { e.preventDefault(); doFindNext(); }
          if (e.ctrlKey && e.key.toLowerCase() === "a") {
            setTimeout(() => ta.select(), 0);
          }
          if (e.ctrlKey && e.key.toLowerCase() === "s") { e.preventDefault(); saveFile(false); }
          if (e.ctrlKey && e.key.toLowerCase() === "o") { e.preventDefault(); openFile(); }
          if (e.ctrlKey && e.key.toLowerCase() === "n") { e.preventDefault(); newFile(); }
        });
      };
      addMenus();

      win.onClose = () => {
        if (dirty) confirmDiscard();
      };
    },
  });
})();
