/* ============================================================
   计算器
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  W95.registerApp("calc", {
    title: "计算器",
    icon: "calc",
    width: 320,
    height: 250,
    minWidth: 240,
    minHeight: 200,
    resizable: false,
    statusbar: false,
    create(win) {
      const body = win.body;
      body.style.padding = "6px";
      body.style.gap = "6px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.overflow = "hidden";

      const display = W95.el("div", {
        class: "calc-display",
        style: {
          background: "#fff", color: "#000",
          border: "1px solid", borderColor: "#808080 #fff #fff #808080",
          boxShadow: "inset 1px 1px 0 #808080",
          textAlign: "right", padding: "2px 6px",
          fontSize: "16px", fontFamily: "'Courier New',monospace",
          overflow: "hidden", whiteSpace: "nowrap",
        },
      });
      display.textContent = "0.";
      body.appendChild(display);

      const wrap = W95.el("div", { style: { flex: "1", display: "flex", flexDirection: "column", gap: "2px" } });
      body.appendChild(wrap);

      let scientific = false;

      const state = {
        acc: null,
        pending: null,
        entry: "0",
        entryValid: true,
        memory: 0,
        base: 10,
        deg: true,
        inv: false,
      };

      function fmt(n) {
        if (!isFinite(n)) return "错误";
        if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-12 && n !== 0)) {
          return n.toExponential(10);
        }
        let s = String(Math.round(n * 1e12) / 1e12);
        if (s.length > 20) s = n.toPrecision(12);
        return s;
      }

      function render() {
        let s = state.entry;
        if (state.base === 16) {
          let n = parseInt(s, 10);
          if (isNaN(n)) n = 0;
          s = (n >>> 0).toString(16).toUpperCase();
        } else if (state.base === 8) {
          let n = parseInt(s, 10);
          if (isNaN(n)) n = 0;
          s = (n >>> 0).toString(8);
        } else if (state.base === 2) {
          let n = parseInt(s, 10);
          if (isNaN(n)) n = 0;
          s = (n >>> 0).toString(2);
        }
        display.textContent = s.length > 24 ? s.slice(0, 24) : s;
      }

      function digit(d) {
        if (state.base === 16 && /[a-f]/i.test(d)) d = d.toUpperCase();
        if (state.base === 10 && d === "." ) {
          if (!state.entryValid) { state.entry = "0."; state.entryValid = true; }
          else if (!state.entry.includes(".")) state.entry += ".";
          render(); return;
        }
        if (!state.entryValid) { state.entry = ""; state.entryValid = true; }
        if (state.entry.replace("-", "").replace(".", "").length >= 16) return;
        if (state.entry === "0") state.entry = d;
        else state.entry += d;
        render();
      }

      function currentNum() {
        return parseFloat(state.entry) || 0;
      }

      function applyPending() {
        if (state.pending === null || state.acc === null) {
          state.acc = currentNum();
          return;
        }
        const b = currentNum();
        const a = state.acc;
        let r;
        switch (state.pending) {
          case "+": r = a + b; break;
          case "-": r = a - b; break;
          case "*": r = a * b; break;
          case "/": r = b === 0 ? NaN : a / b; break;
          case "mod": r = a % b; break;
          case "and": r = (a | 0) & (b | 0); break;
          case "or": r = (a | 0) | (b | 0); break;
          case "xor": r = (a | 0) ^ (b | 0); break;
          case "lsh": r = (a | 0) << (b | 0); break;
          default: r = b;
        }
        if (isNaN(r)) { state.entry = "错误"; state.entryValid = false; state.acc = null; state.pending = null; render(); return; }
        state.acc = r;
        state.entry = fmt(r);
        state.entryValid = false;
        render();
      }

      function op(op) {
        applyPending();
        state.pending = op;
        state.acc = currentNum();
        state.entryValid = false;
      }

      function equals() {
        applyPending();
        state.pending = null;
      }

      function unary(fn, label) {
        const n = currentNum();
        let r = fn(n);
        if (isNaN(r)) { state.entry = "错误"; state.entryValid = false; }
        else {
          state.entry = fmt(r);
          state.entryValid = false;
        }
        render();
      }

      function clear() {
        state.acc = null; state.pending = null;
        state.entry = "0"; state.entryValid = true;
        render();
      }
      function clearEntry() {
        state.entry = "0"; state.entryValid = true;
        render();
      }
      function backspace() {
        if (!state.entryValid) return;
        if (state.entry.length > 1 && state.entry !== "-") state.entry = state.entry.slice(0, -1);
        else state.entry = "0";
        render();
      }
      function negate() {
        if (state.entry.startsWith("-")) state.entry = state.entry.slice(1);
        else if (state.entry !== "0") state.entry = "-" + state.entry;
        render();
      }
      function percent() {
        const n = currentNum();
        if (state.acc !== null && (state.pending === "+" || state.pending === "-")) {
          state.entry = fmt(state.acc * n / 100);
        } else {
          state.entry = fmt(n / 100);
        }
        state.entryValid = false;
        render();
      }
      function sqrt() { unary(Math.sqrt); }
      function inv() { unary((n) => 1 / n); }

      function sciFn(f) {
        const n = currentNum();
        const useInv = state.inv;
        let r;
        if (f === "sin") r = useInv ? Math.asin(n) : Math.sin(state.deg ? n * Math.PI / 180 : n);
        else if (f === "cos") r = useInv ? Math.acos(n) : Math.cos(state.deg ? n * Math.PI / 180 : n);
        else if (f === "tan") r = useInv ? Math.atan(n) : Math.tan(state.deg ? n * Math.PI / 180 : n);
        else if (f === "ln") r = useInv ? Math.exp(n) : Math.log(n);
        else if (f === "log") r = useInv ? Math.pow(10, n) : Math.log10(n);
        else if (f === "x2") r = Math.pow(n, 2);
        else if (f === "x3") r = Math.pow(n, 3);
        else if (f === "n!") { r = 1; for (let i = 2; i <= Math.floor(n); i++) r *= i; }
        else if (f === "pi") r = Math.PI;
        else if (f === "exp") r = useInv ? Math.log(n) / Math.LN10 : Math.pow(10, n);
        else if (f === "dms") { const d = Math.floor(n); const m = Math.floor((n - d) * 60); const s = (n - d - m / 60) * 3600; r = d + m / 100 + s / 10000; }
        else r = n;
        if (isNaN(r)) { state.entry = "错误"; state.entryValid = false; }
        else { state.entry = fmt(r); state.entryValid = false; }
        render();
      }

      function setBase(b) {
        state.base = b;
        // 转换当前值
        const n = currentNum();
        if (!isNaN(n)) state.entry = String(Math.floor(n));
        state.entryValid = false;
        render();
      }

      const stdLayout = [
        ["MC", "memc"], ["7", "d7"], ["8", "d8"], ["9", "d9"], ["/", "op/"], ["sqrt", "sqrt"],
        ["MR", "memr"], ["4", "d4"], ["5", "d5"], ["6", "d6"], ["*", "op*"], ["%", "pct"],
        ["MS", "mems"], ["1", "d1"], ["2", "d2"], ["3", "d3"], ["-", "op-"], ["1/x", "inv"],
        ["M+", "memplus"], ["0", "d0"], ["+/-", "neg"], [".", "d."], ["+", "op+"], ["=", "eq"],
      ];

      const sciLayout = [
        ["Sta", "nosta"], ["Ave", "nosta"], ["Sum", "nosta"], ["s", "nosta"], ["Dat", "nosta"], ["sin", "sci-sin"],
        ["cos", "sci-cos"], ["tan", "sci-tan"], ["(", "op-("], [")", "op-)"], ["ln", "sci-ln"], ["log", "sci-log"],
        ["x^y", "pow"], ["x^3", "sci-x3"], ["x^2", "sci-x2"], ["n!", "sci-fact"], ["pi", "sci-pi"], ["dms", "sci-dms"],
        ["Mod", "op-mod"], ["And", "op-and"], ["Or", "op-or"], ["Xor", "op-xor"], ["Lsh", "op-lsh"], ["Not", "not"],
        ["Int", "int"], ["F-E", "sci-fe"], ["A", "dA"], ["B", "dB"], ["C", "dC"], ["D", "dD"],
        ["E", "dE"], ["F", "dF"], ["MC", "memc"], ["7", "d7"], ["8", "d8"], ["9", "d9"],
        ["/", "op/"], ["sqrt", "sqrt"], ["MR", "memr"], ["4", "d4"], ["5", "d5"], ["6", "d6"],
        ["*", "op*"], ["%", "pct"], ["MS", "mems"], ["1", "d1"], ["2", "d2"], ["3", "d3"],
        ["-", "op-"], ["1/x", "inv"], ["M+", "memplus"], ["0", "d0"], ["+/-", "neg"], [".", "d."],
        ["+", "op+"], ["=", "eq"], ["Backspace", "bs"], ["CE", "ce"], ["C", "c"],
      ];

      function buildButtons() {
        wrap.innerHTML = "";
        const layout = scientific ? sciLayout : stdLayout;
        const grid = W95.el("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "3px",
            flex: "1",
          },
        });
        if (!scientific) grid.style.gridTemplateColumns = "repeat(6, 1fr)";
        for (const [label, act] of layout) {
          const b = W95.el("button", {
            class: "w95btn",
            type: "button",
            text: label,
            style: {
              minWidth: "0", padding: "2px 0", fontSize: "11px",
              fontFamily: "'Courier New',monospace",
            },
          });
          b.addEventListener("click", () => handle(act));
          grid.appendChild(b);
        }
        wrap.appendChild(grid);
        if (scientific) {
          // 进制与角度
          const optsRow = W95.el("div", { style: { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" } });
          const bases = [["Hex", 16], ["Dec", 10], ["Oct", 8], ["Bin", 2]];
          const group = W95.el("div", { class: "w95group", style: { marginTop: "4px", padding: "4px 6px", display: "flex", gap: "6px" } });
          group.appendChild(W95.el("legend", { text: "进制" }));
          bases.forEach(([label, b]) => {
            const lab = W95.el("label", { style: { display: "flex", alignItems: "center", gap: "3px" } });
            const rb = W95.el("input", { type: "radio", name: "calcbase" });
            if (state.base === b) rb.checked = true;
            rb.addEventListener("change", () => setBase(b));
            lab.appendChild(rb);
            lab.appendChild(W95.el("span", { text: label }));
            group.appendChild(lab);
          });
          const degGroup = W95.el("div", { style: { display: "flex", gap: "6px" } });
          [["Deg", true], ["Rad", false]].forEach(([label, d]) => {
            const lab = W95.el("label", { style: { display: "flex", alignItems: "center", gap: "3px" } });
            const rb = W95.el("input", { type: "radio", name: "calcangle" });
            if (state.deg === d) rb.checked = true;
            rb.addEventListener("change", () => (state.deg = d));
            lab.appendChild(rb);
            lab.appendChild(W95.el("span", { text: label }));
            degGroup.appendChild(lab);
          });
          const invLab = W95.el("label", { style: { display: "flex", alignItems: "center", gap: "3px" } });
          const invRb = W95.el("input", { type: "checkbox" });
          invRb.addEventListener("change", () => (state.inv = invRb.checked));
          invLab.appendChild(invRb);
          invLab.appendChild(W95.el("span", { text: "Inv" }));
          optsRow.appendChild(group);
          optsRow.appendChild(degGroup);
          optsRow.appendChild(invLab);
          wrap.appendChild(optsRow);
        }
        // 高度自适应
        const winH = scientific ? 420 : 250;
        if (scientific) {
          win.el.style.height = "440px";
          win.el.style.width = "560px";
        } else {
          win.el.style.height = "250px";
          win.el.style.width = "320px";
        }
      }

      function handle(act) {
        if (act.startsWith("d")) { digit(act.slice(1)); return; }
        if (act.startsWith("op")) {
          if (act === "op-(" || act === "op-)") return;
          op(act.slice(2)); return;
        }
        if (act.startsWith("sci-")) { sciFn(act.slice(4)); return; }
        switch (act) {
          case "eq": equals(); break;
          case "sqrt": sqrt(); break;
          case "pct": percent(); break;
          case "inv": inv(); break;
          case "neg": negate(); break;
          case "bs": backspace(); break;
          case "ce": clearEntry(); break;
          case "c": clear(); break;
          case "memc": state.memory = 0; break;
          case "memr": state.entry = fmt(state.memory); state.entryValid = false; render(); break;
          case "mems": state.memory = currentNum(); break;
          case "memplus": state.memory += currentNum(); break;
          case "pow": {
            const n = currentNum();
            if (state.inv) {
              // x 的 1/y 次方 —— 简化：直接求根
              const y = n; 
              // 先求当前 acc^entry
            }
            // 使用二元方式处理 x^y：保存 acc 和 pending
            applyPending();
            state.pending = "pow";
            state.acc = currentNum();
            state.entryValid = false;
            break;
          }
          case "int": {
            const n = currentNum();
            state.entry = fmt(state.inv ? Math.round(n) : Math.trunc(n));
            state.entryValid = false; render(); break;
          }
          case "not": {
            const n = currentNum();
            state.entry = fmt(~(n | 0));
            state.entryValid = false; render(); break;
          }
          case "sci-fe": {
            const n = currentNum();
            state.entry = n.toExponential(8);
            state.entryValid = false; render(); break;
          }
          case "nosta": break;
        }
        if (act.startsWith("d") || act.startsWith("op") || act.startsWith("sci-")) {
          if (state.pending === "pow" && act.startsWith("d")) {
            // 输入 y 后直接计算 x^y
            equals();
            state.pending = null;
            applyPending();
          }
        }
      }

      // pow 支持
      const origApplyPending = applyPending;
      applyPending = function () {
        if (state.pending === "pow") {
          const b = currentNum();
          const a = state.acc;
          const r = Math.pow(a, b);
          if (isNaN(r)) { state.entry = "错误"; state.entryValid = false; state.acc = null; state.pending = null; render(); return; }
          state.acc = r;
          state.entry = fmt(r);
          state.entryValid = false;
          state.pending = null;
          render();
          return;
        }
        origApplyPending();
      };

      // 菜单
      win.setMenuBar({
        label: "编辑(E)", onAction: (a) => {
          if (a === "copy") {
            navigator.clipboard && navigator.clipboard.writeText(state.entry);
          } else if (a === "paste") {
            navigator.clipboard && navigator.clipboard.readText().then((t) => {
              const n = parseFloat(t);
              if (!isNaN(n)) { state.entry = String(n); state.entryValid = true; render(); }
            }).catch(() => {});
          }
        },
        items: [
          { label: "复制(C)", action: "copy" },
          { label: "粘贴(P)", action: "paste" },
        ],
      });

      const mb = win.menubar;
      const viewItem = W95.el("div", { class: "win-menubar-item", text: "查看(V)" });
      mb.appendChild(viewItem);
      viewItem.addEventListener("mousedown", (e) => {
        e.preventDefault(); e.stopPropagation();
        W95.popupMenu([
          { label: "标准型(T)", checked: !scientific, action: () => { scientific = false; buildButtons(); } },
          { label: "科学型(S)", checked: scientific, action: () => { scientific = true; buildButtons(); } },
        ], { x: viewItem.getBoundingClientRect().left, y: viewItem.getBoundingClientRect().bottom });
      });

      // 键盘
      document.addEventListener("keydown", function kd(e) {
        if (W95.WM.active !== win) return;
        const k = e.key;
        if (/^[0-9]$/.test(k)) { digit(k); e.preventDefault(); }
        else if (k === ".") { digit("."); e.preventDefault(); }
        else if (k === "+") { op("+"); e.preventDefault(); }
        else if (k === "-") { op("-"); e.preventDefault(); }
        else if (k === "*") { op("*"); e.preventDefault(); }
        else if (k === "/") { op("/"); e.preventDefault(); }
        else if (k === "Enter" || k === "=") { equals(); e.preventDefault(); }
        else if (k === "Backspace") { backspace(); e.preventDefault(); }
        else if (k === "Escape") { clear(); e.preventDefault(); }
        else if (k === "%") { percent(); e.preventDefault(); }
      });
      win.beforeDestroy = () => {
        document.removeEventListener("keydown", kd);
      };

      buildButtons();
      render();
    },
  });
})();
