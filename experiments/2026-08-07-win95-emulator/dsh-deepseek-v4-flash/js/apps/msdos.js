/* ============================================================
   MS-DOS 方式
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  W95.registerApp("msdos", {
    title: "MS-DOS 方式",
    icon: "msdos",
    width: 600,
    height: 380,
    minWidth: 380,
    minHeight: 240,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.background = "#000";
      body.style.overflow = "hidden";

      const screen = W95.el("div", {
        tabindex: "0",
        style: {
          flex: "1", overflow: "auto", background: "#000",
          color: "#c0c0c0", fontFamily: "'Courier New',monospace",
          fontSize: "13px", lineHeight: "1.35", padding: "4px 6px",
          outline: "none", whiteSpace: "pre-wrap", wordBreak: "break-all",
        },
      });
      body.appendChild(screen);

      let cwd = { drive: "C:", dir: "\\WINDOWS" };
      let history = [];
      let histIdx = -1;
      let currentLine = "";

      function dosPath() {
        return cwd.drive + (cwd.dir === "\\" ? "\\" : cwd.dir);
      }

      function out(text, color) {
        const line = W95.el("div", {
          style: {
            color: color || "#c0c0c0", whiteSpace: "pre-wrap",
            wordBreak: "break-all", minHeight: "1em",
          },
        });
        line.textContent = text;
        screen.appendChild(line);
        while (screen.children.length > 600) screen.removeChild(screen.firstChild);
        screen.scrollTop = screen.scrollHeight;
      }

      function printPrompt() {
        out(dosPath() + ">", "#c0c0c0");
      }

      // 转换 DOS 路径到 VFS 路径
      function toVFSPath(dos) {
        let p = String(dos || "").replace(/\//g, "\\");
        if (!p) p = cwd.dir;
        // 处理 ~ 简写
        p = p.replace(/^~/, cwd.dir);
        if (!/^[a-zA-Z]:/.test(p)) {
          // 相对路径
          if (p.startsWith("\\")) p = cwd.drive + p;
          else p = cwd.drive + (cwd.dir === "\\" ? "\\" : cwd.dir + "\\") + p;
        }
        // 规范化
        const drive = p.slice(0, 2).toUpperCase();
        const parts = p.slice(2).split("\\").filter((x) => x && x !== ".");
        const outParts = [];
        for (const part of parts) {
          if (part === "..") outParts.pop();
          else outParts.push(part);
        }
        return "/" + drive + "/" + outParts.join("/");
      }

      function dirDisplay() {
        return cwd.drive === "C:" ? "WINDOWS" : cwd.drive === "A:" ? "A" : cwd.drive === "D:" ? "D" : "";
      }

      // ------- 命令 -------
      const COMMANDS = {
        dir(args) {
          const path = args[0] && !args[0].startsWith("/") ? args[0] : ".";
          const wide = args.includes("/w") || args.includes("/W");
          const vfs = W95.vfsResolve(toVFSPath(path));
          if (!vfs || vfs.type !== "folder") {
            out("系统找不到指定的路径。");
            return;
          }
          const volName = dirDisplay() || "";
          out(" " + cwd.drive + " 驱动器中的卷是 " + (volName ? volName : "没有标签"));
          out(" 卷的序列号是 " + W95.randomSerial());
          out("");
          const items = vfs.children.slice().sort((a, b) => {
            if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          const folders = items.filter((x) => x.type === "folder");
          const files = items.filter((x) => x.type === "file");
          if (wide) {
            const names = folders.map((f) => "[" + f.name + "]").concat(files.map((f) => f.name));
            const cols = 4;
            for (let i = 0; i < names.length; i += cols) {
              out(names.slice(i, i + cols).map((n) => n.padEnd(18)).join("").trimEnd());
            }
          } else {
            const now = new Date();
            const dateStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
            const timeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
            for (const f of folders) {
              out(dateStr + "  " + timeStr + "    <DIR>          " + f.name);
            }
            for (const f of files) {
              out(dateStr + "  " + timeStr + "    " + String(f.size || 0).padStart(12) + " " + f.name);
            }
          }
          out("");
          out("        " + folders.length + " 个目录  " + files.length + " 个文件  " + W95.formatBytes(files.reduce((a, f) => a + (f.size || 0), 0)));
          out("        " + items.length + " 个文件（目录）");
        },
        cd(args) {
          const target = args[0] || "\\";
          const node = W95.vfsResolve(toVFSPath(target));
          if (!node || node.type !== "folder") {
            out("系统找不到指定的路径。");
            return;
          }
          // 更新 cwd
          let p = String(target).replace(/\//g, "\\");
          if (/^[a-zA-Z]:/.test(p)) {
            const drv = p.slice(0, 2).toUpperCase();
            const rest = p.slice(2) || "\\";
            cwd = { drive: drv, dir: normalizeDir(rest) };
          } else if (p === "..") {
            const parts = cwd.dir.split("\\").filter(Boolean);
            parts.pop();
            cwd.dir = parts.length ? "\\" + parts.join("\\") : "\\";
          } else if (p.startsWith("\\")) {
            cwd.dir = normalizeDir(p);
          } else if (p === "." || !p) {
            // 不变
          } else {
            cwd.dir = normalizeDir(cwd.dir + "\\" + p);
          }
          if (cwd.dir === "") cwd.dir = "\\";
        },
        cls() { screen.innerHTML = ""; },
        ver() {
          out("");
          out("Microsoft(R) Windows 95");
          out("   (C)Copyright Microsoft Corp 1981-1995.");
          out("");
        },
        date() {
          const d = new Date();
          out("当前日期: " + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"));
          out("输入新日期: (年-月-日) ");
        },
        time() {
          const d = new Date();
          out("当前时间: " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0") + "." + String(d.getMilliseconds()).padStart(3, "0"));
          out("输入新时间: ");
        },
        echo(args) {
          out(args.join(" "));
        },
        type(args) {
          if (!args[0]) { out("参数的格式不正确。"); return; }
          const node = W95.vfsResolve(toVFSPath(args[0]));
          if (!node) { out("系统找不到指定的文件。"); return; }
          if (node.type === "folder") { out("访问被拒绝。"); return; }
          const content = node.content || "";
          if (content.startsWith("exe:") || content.startsWith("bmp:")) {
            out("该文件是二进制文件，无法显示。");
            return;
          }
          out(content.replace(/\r\n/g, "\n"));
        },
        md(args) {
          if (!args[0]) { out("参数的格式不正确。"); return; }
          const p = toVFSPath(args[0]);
          const parts = p.split("/").filter(Boolean);
          const parent = W95.vfsResolve("/" + parts.slice(0, -1).join("/"));
          if (!parent) { out("系统找不到指定的路径。"); return; }
          if (W95.vfsMkdir("/" + parts.slice(0, -1).join("/"), parts[parts.length - 1])) return;
          out("无法创建目录 " + args[0]);
        },
        rd(args) {
          if (!args[0]) { out("参数的格式不正确。"); return; }
          const node = W95.vfsResolve(toVFSPath(args[0]));
          if (!node || node.type !== "folder") { out("系统找不到指定的路径。"); return; }
          if (node.children && node.children.length) { out("目录不是空的。"); return; }
          if (W95.vfsDelete(toVFSPath(args[0]))) return;
          out("无法删除目录。");
        },
        del(args) {
          if (!args[0]) { out("参数的格式不正确。"); return; }
          const p = toVFSPath(args[0]);
          const node = W95.vfsResolve(p);
          if (!node) { out("系统找不到指定的文件。"); return; }
          W95.vfsDelete(p);
          out("已删除 1 个文件。");
        },
        copy(args) {
          if (args.length < 2) { out("参数的格式不正确。"); return; }
          const src = W95.vfsResolve(toVFSPath(args[0]));
          if (!src || src.type !== "file") { out("系统找不到指定的文件。"); return; }
          const dstPath = toVFSPath(args[1]);
          const parts = dstPath.split("/").filter(Boolean);
          const parentPath = "/" + parts.slice(0, -1).join("/");
          const parent = W95.vfsResolve(parentPath);
          if (!parent) { out("系统找不到指定的路径。"); return; }
          const name = parts[parts.length - 1] || src.name;
          W95.vfsWriteFile(parentPath, name, src.content, src.icon, src.mime);
          out("已复制         1 个文件。");
        },
        ren(args) {
          if (args.length < 2) { out("参数的格式不正确。"); return; }
          const p = toVFSPath(args[0]);
          if (!W95.vfsRename(p, args[1])) out("系统找不到指定的文件。");
        },
        help(args) {
          if (args[0]) {
            const doc = HELP_TEXT[args[0].toLowerCase()];
            out(doc || "没有此命令的帮助。");
            return;
          }
          const names = Object.keys(COMMANDS).sort();
          out("有关某个命令的详细信息，请键入 HELP 命令名");
          out("");
          for (let i = 0; i < names.length; i += 3) {
            out(names.slice(i, i + 3).map((n) => n.padEnd(14)).join("").trimEnd());
          }
        },
        exit() {
          win.close();
        },
        win() {
          out("Microsoft Windows 95 已经在运行。");
        },
        format(args) {
          const target = (args[0] || "C:").toUpperCase();
          if (target === "C:") {
            out("驱动器 C 正在被其他进程使用，无法格式化。");
          } else {
            out("在驱动器 " + target + " 中插入新盘片");
            out("准备完成后按任意键... （本模拟器不支持格式化）");
          }
        },
        mem() {
          out("");
          out("  655360 字节常规内存");
          out("  655360 字节可用");
          out("");
          out("  15728640 字节扩展内存");
          out("  15728640 字节可用");
          out("");
        },
        path() {
          out("PATH=C:\\WINDOWS;C:\\WINDOWS\\COMMAND;C:\\");
        },
        set(args) {
          if (!args[0]) {
            out("COMSPEC=C:\\WINDOWS\\COMMAND.COM");
            out("PATH=C:\\WINDOWS;C:\\WINDOWS\\COMMAND;C:\\");
            out("TEMP=C:\\WINDOWS\\TEMP");
            out("TMP=C:\\WINDOWS\\TEMP");
            out("WINBOOTDIR=C:\\WINDOWS");
          } else {
            out(args.join(" "));
          }
        },
        prompt(args) {
          out("（提示符设置仅限当前会话）");
        },
        doskey() {
          out("DOSKEY 已安装。可用 ↑ ↓ 键浏览历史命令。");
        },
        vol(args) {
          const drv = (args[0] || cwd.drive).toUpperCase();
          out(" " + drv + " 驱动器中的卷是 " + (drv === "C:" ? "WINDOWS" : "没有标签"));
          out(" 卷的序列号是 " + W95.randomSerial());
        },
        label() {
          out(cwd.drive + " 驱动器中的卷是 " + (cwd.drive === "C:" ? "WINDOWS" : "没有标签"));
        },
        tree(args) {
          const path = args[0] || ".";
          const node = W95.vfsResolve(toVFSPath(path));
          if (!node || node.type !== "folder") { out("系统找不到指定的路径。"); return; }
          out("文件夹 PATH 列表");
          out("卷序列号为 " + W95.randomSerial());
          out(dosPath());
          const walk = (n, prefix, depth) => {
            if (depth > 2) return;
            const kids = n.children ? n.children.filter((c) => c.type === "folder") : [];
            kids.forEach((k, i) => {
              const last = i === kids.length - 1;
              out(prefix + (last ? "└──" : "├──") + k.name);
              walk(k, prefix + (last ? "    " : "│   "), depth + 1);
            });
          };
          walk(node, "│   ", 0);
        },
        start(args) {
          if (!args[0]) { out("语法: START [程序名]"); return; }
          const name = args[0].toLowerCase();
          const map = { notepad: "notepad", "notepad.exe": "notepad", calc: "calc", "calc.exe": "calc", pbrush: "paint", mspaint: "paint", winmine: "minesweeper", sol: "solitaire", explorer: "explorer", control: "control", command: "msdos" };
          if (map[name] && W95.apps[map[name]]) {
            W95.openApp(map[name]);
          } else {
            out("系统找不到文件 " + args[0] + "。");
          }
        },
        edit() {
          W95.openApp("notepad");
        },
      };

      const HELP_TEXT = {
        dir: "显示目录中的文件和子目录列表。\r\nDIR [drive:][path] [/w] [/p]",
        cd: "显示当前目录名或更改当前目录。\r\nCD [drive:][path]",
        cls: "清除屏幕。",
        ver: "显示 Windows 版本。",
        type: "显示文本文件的内容。\r\nTYPE [drive:][path]filename",
        md: "创建目录。\r\nMD [drive:]path",
        rd: "删除目录。\r\nRD [drive:]path",
        del: "删除文件。\r\nDEL [drive:][path]filename",
        copy: "复制文件。\r\nCOPY source destination",
        ren: "重命名文件。\r\nREN oldname newname",
        mem: "显示内存使用情况。",
        format: "格式化磁盘。\r\nFORMAT drive:",
        exit: "退出 MS-DOS 方式。",
        help: "显示命令帮助。",
      };

      function execute(line) {
        const trimmed = line.trim();
        if (!trimmed) return;
        history.push(trimmed);
        histIdx = history.length;
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        const fn = COMMANDS[cmd];
        if (fn) {
          fn(args);
        } else {
          out("'" + parts[0] + "' 不是内部或外部命令，也不是可运行的程序");
          out("或批处理文件。");
        }
        out("");
        printPrompt();
        currentLine = "";
        screen.scrollTop = screen.scrollHeight;
      }

      function normalizeDir(d) {
        let s = String(d).replace(/\//g, "\\");
        const parts = s.split("\\").filter((x) => x && x !== ".");
        const outParts = [];
        for (const p of parts) {
          if (p === "..") outParts.pop();
          else outParts.push(p);
        }
        return outParts.length ? "\\" + outParts.join("\\") : "\\";
      }

      // 输入处理
      let inputLine = null;

      function makeInput() {
        if (inputLine) inputLine.remove();
        inputLine = W95.el("div", {
          style: { color: "#c0c0c0", whiteSpace: "pre-wrap", wordBreak: "break-all" },
        });
        screen.appendChild(inputLine);
        renderInput();
        screen.scrollTop = screen.scrollHeight;
      }

      function renderInput() {
        if (!inputLine) return;
        inputLine.innerHTML = "";
        inputLine.appendChild(document.createTextNode(currentLine));
        const caret = W95.el("span", {
          style: { display: "inline-block", width: "8px", height: "14px", background: "#c0c0c0", verticalAlign: "bottom" },
        });
        inputLine.appendChild(caret);
      }

      function handleKey(e) {
        if (W95.WM.active !== win) return;
        if (e.ctrlKey && e.key.toLowerCase() === "l") { e.preventDefault(); screen.innerHTML = ""; return; }
        if (e.key.length === 1) {
          e.preventDefault();
          currentLine += e.key;
          renderInput();
          return;
        }
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            const line = currentLine;
            inputLine.remove();
            inputLine = null;
            out(dosPath() + ">" + line);
            execute(line);
            makeInput();
            break;
          case "Backspace":
            e.preventDefault();
            currentLine = currentLine.slice(0, -1);
            renderInput();
            break;
          case "ArrowUp":
            e.preventDefault();
            if (histIdx > 0) {
              histIdx--;
              currentLine = history[histIdx];
              renderInput();
            }
            break;
          case "ArrowDown":
            e.preventDefault();
            if (histIdx < history.length - 1) {
              histIdx++;
              currentLine = history[histIdx];
            } else {
              histIdx = history.length;
              currentLine = "";
            }
            renderInput();
            break;
          case "Escape":
            e.preventDefault();
            currentLine = "";
            renderInput();
            break;
        }
      }
      screen.addEventListener("keydown", handleKey);
      screen.addEventListener("click", () => screen.focus());
      win.beforeDestroy = () => {
        screen.removeEventListener("keydown", handleKey);
      };

      // 开场
      out("");
      out("Microsoft(R) Windows 95");
      out("   (C)Copyright Microsoft Corp 1981-1995.");
      out("");
      out("在 MS-DOS 方式下，键入 EXIT 可返回 Windows。");
      out("键入 HELP 可查看可用命令。");
      out("");
      printPrompt();
      makeInput();
      screen.focus();
    },
  });
})();
