/* ============================================================
   扫雷 (Minesweeper)
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  // 七段数码管
  const SEGS = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc",
    "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd",
    "-": "g", " ": "",
  };
  function ledDigit(ch) {
    const segs = SEGS[ch] || "";
    const parts = {
      a: '<rect x="2" y="1" width="10" height="2" fill="#ff0000"/>',
      b: '<rect x="12" y="3" width="2" height="8" fill="#ff0000"/>',
      c: '<rect x="12" y="13" width="2" height="8" fill="#ff0000"/>',
      d: '<rect x="2" y="21" width="10" height="2" fill="#ff0000"/>',
      e: '<rect x="0" y="13" width="2" height="8" fill="#ff0000"/>',
      f: '<rect x="0" y="3" width="2" height="8" fill="#ff0000"/>',
      g: '<rect x="2" y="11" width="10" height="2" fill="#ff0000"/>',
    };
    let html = "";
    for (const s of segs) html += parts[s];
    return `<svg width="16" height="24" viewBox="0 0 14 24" shape-rendering="crispEdges"><rect x="0" y="0" width="14" height="24" fill="#000"/>${html}</svg>`;
  }
  function ledNumber(n) {
    n = Math.max(-99, Math.min(999, Math.round(n)));
    const s = String(n).padStart(3, "0");
    if (n < 0) {
      const s2 = String(-n).padStart(2, "0");
      return ledDigit("-") + ledDigit(s2[0]) + ledDigit(s2[1]);
    }
    return ledDigit(s[0]) + ledDigit(s[1]) + ledDigit(s[2]);
  }

  const COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

  const DIFFS = {
    beginner: { name: "初级", rows: 9, cols: 9, mines: 10 },
    intermediate: { name: "中级", rows: 16, cols: 16, mines: 40 },
    expert: { name: "高级", rows: 16, cols: 30, mines: 99 },
  };

  W95.registerApp("minesweeper", {
    title: "扫雷",
    icon: "mine",
    width: 200,
    height: 260,
    resizable: false,
    statusbar: false,
    create(win) {
      let diff = W95.store.get("mine-diff", "beginner");
      let board = [], rows, cols, mines;
      let started = false, over = false;
      let flags = 0, time = 0, timer = null;

      const body = win.body;
      body.style.padding = "8px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.alignItems = "center";
      body.style.gap = "6px";
      body.style.overflow = "hidden";

      // 菜单
      win.setMenuBar([
        {
          label: "游戏(G)", onAction: (a) => {
            if (a === "new") newGame();
            else if (a === "beginner") setDiff("beginner");
            else if (a === "intermediate") setDiff("intermediate");
            else if (a === "expert") setDiff("expert");
            else if (a === "exit") win.close();
          },
          items: [
            { label: "新局(N)", action: "new" },
            { sep: true },
            { label: "初级(B)", checked: diff === "beginner", action: "beginner" },
            { label: "中级(I)", checked: diff === "intermediate", action: "intermediate" },
            { label: "高级(E)", checked: diff === "expert", action: "expert" },
            { sep: true },
            { label: "退出(X)", action: "exit" },
          ],
        },
        {
          label: "帮助(H)", onAction: (a) => {
            if (a === "about") W95.msgbox({ title: "关于扫雷", icon: "mine", text: "扫雷\r\n版本 3.1\r\n\r\n在最短的时间内找出所有地雷。", buttons: ["确定"] });
            else if (a === "help") W95.openApp("help");
          },
          items: [
            { label: "帮助主题(H)", action: "help" },
            { sep: true },
            { label: "关于扫雷(A)", action: "about" },
          ],
        },
      ]);

      // 顶部计数区
      const topBar = W95.el("div", {
        style: {
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%",
          border: "2px solid", borderColor: "#808080 #fff #fff #808080",
          padding: "4px 6px",
        },
      });
      const mineCount = W95.el("div", { html: ledNumber(mines) });
      const faceBtn = W95.el("button", {
        type: "button",
        style: {
          width: "26px", height: "26px", padding: "0", fontSize: "16px", lineHeight: "26px",
          background: "#c0c0c0",
          boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf",
        },
        text: "🙂",
      });
      const timeCount = W95.el("div", { html: ledNumber(0) });
      topBar.appendChild(mineCount);
      topBar.appendChild(faceBtn);
      topBar.appendChild(timeCount);
      body.appendChild(topBar);

      faceBtn.addEventListener("mousedown", (e) => { e.preventDefault(); faceBtn.textContent = "😮"; });
      faceBtn.addEventListener("mouseup", () => { faceBtn.textContent = "🙂"; });
      faceBtn.addEventListener("click", () => newGame());

      // 棋盘
      const boardEl = W95.el("div", {
        style: {
          border: "3px solid", borderColor: "#808080 #fff #fff #808080",
          display: "grid", background: "#c0c0c0", padding: "1px",
        },
      });
      body.appendChild(boardEl);

      function setDiff(d) {
        diff = d;
        W95.store.set("mine-diff", d);
        newGame();
      }

      function newGame() {
        const d = DIFFS[diff];
        rows = d.rows; cols = d.cols; mines = d.mines;
        board = [];
        for (let r = 0; r < rows; r++) {
          board.push([]);
          for (let c = 0; c < cols; c++) {
            board[r].push({ mine: false, open: false, flag: 0, near: 0 });
          }
        }
        started = false; over = false; flags = 0; time = 0;
        if (timer) clearInterval(timer);
        timer = null;
        mineCount.innerHTML = ledNumber(mines);
        timeCount.innerHTML = ledNumber(0);
        faceBtn.textContent = "🙂";
        renderBoard();
        win.el.style.width = cols * 16 + 40 + "px";
        win.el.style.height = rows * 16 + 118 + "px";
      }

      function plantMines(safeR, safeC) {
        let placed = 0;
        while (placed < mines) {
          const r = Math.floor(Math.random() * rows);
          const c = Math.floor(Math.random() * cols);
          if (board[r][c].mine) continue;
          if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
          board[r][c].mine = true;
          placed++;
        }
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            board[r][c].near = countNear(r, c);
          }
        }
      }

      function countNear(r, c) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
            if (board[rr][cc].mine) n++;
          }
        }
        return n;
      }

      function renderBoard() {
        boardEl.style.gridTemplateColumns = "repeat(" + cols + ", 16px)";
        boardEl.innerHTML = "";
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cell = board[r][c];
            const el = W95.el("div", {
              style: {
                width: "16px", height: "16px", fontSize: "12px",
                fontFamily: "'Courier New',monospace", fontWeight: "bold",
                display: "flex", alignItems: "center", justifyContent: "center",
                lineHeight: "16px", userSelect: "none",
              },
            });
            renderCell(el, cell);
            el.addEventListener("mousedown", (e) => {
              e.preventDefault();
              if (over) return;
              if (e.button === 0 && !cell.open && cell.flag === 0) faceBtn.textContent = "😮";
            });
            el.addEventListener("mouseup", () => { if (!over) faceBtn.textContent = "🙂"; });
            el.addEventListener("click", () => {
              if (over) return;
              if (!started) { started = true; plantMines(r, c); startTimer(); }
              if (cell.open || cell.flag !== 0) return;
              reveal(r, c);
            });
            el.addEventListener("contextmenu", (e) => {
              e.preventDefault();
              if (over) return;
              if (cell.open) return;
              if (!started) { started = true; plantMines(r, c); startTimer(); }
              cell.flag = (cell.flag + 1) % 3;
              flags = board.flat().filter((x) => x.flag === 1).length;
              mineCount.innerHTML = ledNumber(mines - flags);
              renderCell(el, cell);
            });
            el._cell = cell;
            boardEl.appendChild(el);
          }
        }
      }

      function renderCell(el, cell) {
        let style = "width:16px;height:16px;display:flex;align-items:center;justify-content:center;line-height:16px;font-family:'Courier New',monospace;font-weight:bold;font-size:12px;";
        if (!cell.open) {
          style += "box-shadow: inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf;background:#c0c0c0;";
          el.style.cssText = style;
          if (cell.flag === 1) el.innerHTML = "🚩";
          else if (cell.flag === 2) el.innerHTML = '<span style="font-size:11px;color:#000">?</span>';
          else el.innerHTML = "";
          return;
        }
        style += "background:#c0c0c0;border:1px solid #808080;";
        el.style.cssText = style;
        if (cell.mine) {
          el.innerHTML = "💣";
        } else if (cell.near > 0) {
          el.innerHTML = '<span style="color:' + COLORS[cell.near] + '">' + cell.near + "</span>";
        } else {
          el.innerHTML = "";
        }
      }

      function reveal(r, c) {
        if (r < 0 || c < 0 || r >= rows || c >= cols) return;
        const cell = board[r][c];
        if (cell.open || cell.flag === 1) return;
        cell.open = true;
        const el = boardEl.children[r * cols + c];
        renderCell(el, cell);
        if (cell.mine) {
          lose(r, c);
          return;
        }
        if (cell.near === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const rr = r + dr, cc = c + dc;
              if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
              if (!board[rr][cc].open && board[rr][cc].flag === 0) reveal(rr, cc);
            }
          }
        }
        checkWin();
      }

      function checkWin() {
        const total = rows * cols;
        let opened = 0;
        for (const row of board) for (const cell of row) if (cell.open) opened++;
        if (opened === total - mines) {
          over = true;
          stopTimer();
          faceBtn.textContent = "😎";
          // 自动插旗
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (board[r][c].mine) {
                board[r][c].flag = 1;
                renderCell(boardEl.children[r * cols + c], board[r][c]);
              }
            }
          }
          mineCount.innerHTML = ledNumber(0);
          W95.sound.play("ding");
          W95.msgbox({ title: "扫雷", icon: "info", text: "你赢了！\r\n用时 " + time + " 秒。", buttons: ["确定"] });
        }
      }

      function lose(r, c) {
        over = true;
        stopTimer();
        faceBtn.textContent = "😵";
        for (let rr = 0; rr < rows; rr++) {
          for (let cc = 0; cc < cols; cc++) {
            const cell = board[rr][cc];
            const el = boardEl.children[rr * cols + cc];
            if (cell.mine && !cell.open) {
              cell.open = true;
              renderCell(el, cell);
            } else if (cell.flag === 1 && !cell.mine) {
              // 错误的旗
              el.innerHTML = '<span style="font-size:11px">❌</span>';
            }
          }
        }
        const el = boardEl.children[r * cols + c];
        if (el) {
          el.innerHTML = '<span style="background:#ff0000;display:block;width:16px;height:16px;display:flex;align-items:center;justify-content:center">💣</span>';
        }
        W95.sound.play("error");
        W95.msgbox({ title: "扫雷", icon: "error", text: "游戏结束！\r\n你踩到地雷了。", buttons: ["确定"] });
      }

      function startTimer() {
        if (timer) return;
        timer = setInterval(() => {
          time++;
          if (time > 999) time = 999;
          timeCount.innerHTML = ledNumber(time);
        }, 1000);
      }
      function stopTimer() {
        if (timer) clearInterval(timer);
        timer = null;
      }

      newGame();
    },
  });
})();
