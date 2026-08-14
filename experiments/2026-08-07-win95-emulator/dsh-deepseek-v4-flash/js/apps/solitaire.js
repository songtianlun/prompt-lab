/* ============================================================
   纸牌 (Solitaire / Klondike)
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const CARD_W = 71, CARD_H = 96;
  const SUITS = [
    { name: "spade", sym: "♠", color: "#000000" },
    { name: "heart", sym: "♥", color: "#ff0000" },
    { name: "diamond", sym: "♦", color: "#ff0000" },
    { name: "club", sym: "♣", color: "#000000" },
  ];
  const RANK_LABEL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  // 花色 SVG（矢量绘制，避免字体依赖）
  function suitSVG(suitIdx, size) {
    const s = size || 14;
    const c = SUITS[suitIdx].color;
    switch (suitIdx) {
      case 0: // spade
        return `<svg width="${s}" height="${s}" viewBox="0 0 14 14"><path d="M7,1 C10,4 12,6 12,8.5 A3,3 0 0 1 8.5,10.5 L8,11 L6,11 L5.5,10.5 A3,3 0 0 1 2,8.5 C2,6 4,4 7,1 Z" fill="${c}"/><path d="M6,11.5 L8,11.5 L8.5,13 L5.5,13 Z" fill="${c}"/></svg>`;
      case 1: // heart
        return `<svg width="${s}" height="${s}" viewBox="0 0 14 14"><path d="M7,12 C5,10 1,7.5 1,4.5 A3,3 0 0 1 7,3 A3,3 0 0 1 13,4.5 C13,7.5 9,10 7,12 Z" fill="${c}"/></svg>`;
      case 2: // diamond
        return `<svg width="${s}" height="${s}" viewBox="0 0 14 14"><path d="M7,1 L12.5,7 L7,13 L1.5,7 Z" fill="${c}"/></svg>`;
      case 3: // club
        return `<svg width="${s}" height="${s}" viewBox="0 0 14 14"><circle cx="7" cy="3.5" r="2.6" fill="${c}"/><circle cx="3.5" cy="7" r="2.6" fill="${c}"/><circle cx="10.5" cy="7" r="2.6" fill="${c}"/><path d="M6.2,8 L7.8,8 L7,13 Z" fill="${c}"/></svg>`;
    }
  }

  // 点数布局（标准 10 点阵坐标）
  const PIP_LAYOUT = {
    1: [[0.5, 0.5]],
    2: [[0.5, 0.18], [0.5, 0.82]],
    3: [[0.5, 0.18], [0.5, 0.5], [0.5, 0.82]],
    4: [[0.3, 0.25], [0.7, 0.25], [0.3, 0.75], [0.7, 0.75]],
    5: [[0.3, 0.25], [0.7, 0.25], [0.5, 0.5], [0.3, 0.75], [0.7, 0.75]],
    6: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.5], [0.7, 0.5], [0.3, 0.82], [0.7, 0.82]],
    7: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.5], [0.7, 0.5], [0.3, 0.82], [0.7, 0.82], [0.5, 0.34]],
    8: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.42], [0.7, 0.42], [0.3, 0.66], [0.7, 0.66], [0.3, 0.9], [0.7, 0.9]],
    9: [[0.3, 0.18], [0.7, 0.18], [0.3, 0.42], [0.7, 0.42], [0.5, 0.5], [0.3, 0.66], [0.7, 0.66], [0.3, 0.9], [0.7, 0.9]],
    10: [[0.3, 0.14], [0.7, 0.14], [0.3, 0.36], [0.7, 0.36], [0.3, 0.58], [0.7, 0.58], [0.3, 0.8], [0.7, 0.8], [0.3, 0.92], [0.7, 0.92]],
  };

  const BACKS = ["robot", "angler", "beach", "castle"];
  const BACK_NAMES = { robot: "机器人", angler: "渔夫", beach: "海滩", castle: "城堡" };

  function backSVG(kind) {
    const w = 60, h = 84;
    let inner = "";
    if (kind === "robot") {
      inner = `<rect x="6" y="6" width="48" height="72" fill="#000080"/><g stroke="#1084d0" stroke-width="2"><path d="M6,12 L54,12"/><path d="M6,24 L54,24"/><path d="M6,36 L54,36"/><path d="M6,48 L54,48"/><path d="M6,60 L54,60"/><path d="M6,72 L54,72"/><path d="M12,6 L12,78"/><path d="M24,6 L24,78"/><path d="M36,6 L36,78"/><path d="M48,6 L48,78"/></g><circle cx="18" cy="18" r="4" fill="#ff0000"/><circle cx="42" cy="18" r="4" fill="#ffff00"/>`;
    } else if (kind === "angler") {
      inner = `<rect x="6" y="6" width="48" height="72" fill="#008000"/><path d="M6,78 L54,78 L54,66 L6,66 Z" fill="#004000"/><circle cx="30" cy="30" r="12" fill="#40c0ff"/><rect x="14" y="20" width="8" height="4" fill="#fff"/><rect x="40" y="40" width="8" height="4" fill="#fff"/>`;
    } else if (kind === "beach") {
      inner = `<rect x="6" y="6" width="48" height="72" fill="#e0c060"/><rect x="6" y="58" width="48" height="20" fill="#c0a040"/><circle cx="42" cy="22" r="9" fill="#ffd000"/><path d="M6,40 Q30,28 54,40" stroke="#40a0ff" stroke-width="6" fill="none"/>`;
    } else {
      inner = `<rect x="6" y="6" width="48" height="72" fill="#800080"/><g fill="none" stroke="#c0a0ff" stroke-width="2"><path d="M6,78 L30,6"/><path d="M30,78 L54,6"/><path d="M6,54 L54,54"/><path d="M6,30 L54,30"/></g><circle cx="30" cy="42" r="8" fill="#ffd000"/>`;
    }
    return `<svg width="60" height="84" viewBox="0 0 60 84"><rect x="0" y="0" width="60" height="84" fill="#ffffff" stroke="#000" stroke-width="1"/><rect x="2" y="2" width="56" height="80" fill="#fff"/>${inner}</svg>`;
  }

  W95.registerApp("solitaire", {
    title: "纸牌",
    icon: "solitaire",
    width: 660,
    height: 460,
    minWidth: 500,
    minHeight: 400,
    create(win) {
      const body = win.body;
      body.style.padding = "6px";
      body.style.overflow = "hidden";
      body.style.display = "flex";
      body.style.flexDirection = "column";

      // 状态
      let deck = [];            // 牌对象
      let stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
      let drawCount = W95.store.get("sol-draw", 3);
      let timed = W95.store.get("sol-timed", true);
      let outlineDrag = W95.store.get("sol-outline", false);
      let dblClickMove = W95.store.get("sol-dbl", true);
      let backKind = W95.store.get("sol-back", "robot");
      let time = 0, moves = 0;
      let timer = null;
      let won = false;
      let dragging = null;

      // 菜单
      win.setMenuBar([
        {
          label: "游戏(G)", onAction: (a) => {
            if (a === "new") newGame(true);
            else if (a === "deck") deckDialog();
            else if (a === "options") optionsDialog();
            else if (a === "exit") win.close();
          },
          items: [
            { label: "新牌局(N)", action: "new" },
            { sep: true },
            { label: "背面图案(D)...", action: "deck" },
            { label: "选项(O)...", action: "options" },
            { sep: true },
            { label: "退出(X)", action: "exit" },
          ],
        },
        {
          label: "帮助(H)", onAction: (a) => {
            if (a === "about") W95.msgbox({ title: "关于纸牌", icon: "solitaire", text: "纸牌\r\n版本 4.0\r\n\r\n经典单人纸牌游戏。", buttons: ["确定"] });
            else if (a === "help") W95.openApp("help");
          },
          items: [
            { label: "帮助主题(H)", action: "help" },
            { sep: true },
            { label: "关于纸牌(A)", action: "about" },
          ],
        },
      ]);

      // 游戏区
      const area = W95.el("div", {
        style: {
          flex: "1", position: "relative", overflow: "hidden",
          background: "#008000", border: "1px solid #004000",
        },
      });
      body.appendChild(area);

      function makeDeck() {
        deck = [];
        let id = 0;
        for (let s = 0; s < 4; s++) {
          for (let r = 1; r <= 13; r++) {
            deck.push({ id: id++, suit: s, rank: r });
          }
        }
        // 洗牌
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
      }

      function newGame(confirm) {
        if (timer) { clearInterval(timer); timer = null; }
        time = 0; moves = 0; won = false;
        makeDeck();
        stock = [];
        waste = [];
        foundations = [[], [], [], []];
        tableau = [[], [], [], [], [], [], []];
        // 发牌：7 列
        let idx = 0;
        for (let c = 0; c < 7; c++) {
          for (let r = 0; r <= c; r++) {
            const card = deck[idx++];
            tableau[c].push(card);
          }
        }
        // 剩余进 stock
        stock = deck.slice(idx);
        render();
        updateStatus();
        if (timed) {
          timer = setInterval(() => {
            if (won) return;
            time++;
            updateStatus();
          }, 1000);
        }
      }

      // ------- 布局计算 -------
      const M = 8; // 边距
      const H_GAP = 12, V_GAP = 14;
      const DOWN_STEP = 20, UP_STEP = 30;

      function pilePos(index, top) {
        return M + index * (CARD_W + H_GAP);
      }
      function maxTableauHeight() {
        let h = 0;
        for (const col of tableau) {
          let ch = CARD_H;
          for (const card of col) ch += card.faceUp ? UP_STEP : DOWN_STEP;
          h = Math.max(h, ch);
        }
        return h;
      }

      function render() {
        area.innerHTML = "";
        const totalH = CARD_H + V_GAP + maxTableauHeight() + M * 2;
        area.style.height = Math.min(totalH, 460) + "px";
        area.scrollTop = 0;
        area.style.overflow = "auto";

        // 发牌堆
        const stockEl = makeDropZone("stock", pilePos(0, false), M);
        stockEl.innerHTML = stock.length
          ? cardBackEl()
          : `<div style="width:${CARD_W}px;height:${CARD_H}px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#004000">↻</div>`;
        area.appendChild(stockEl);

        // 翻牌堆
        const wasteEl = makeDropZone("waste", pilePos(1, false), M);
        if (waste.length) {
          const top = waste[waste.length - 1];
          wasteEl.appendChild(cardEl(top, "waste"));
        } else if (stock.length === 0) {
          wasteEl.innerHTML = `<div style="width:${CARD_W}px;height:${CARD_H}px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#004000">⇄</div>`;
        }
        area.appendChild(wasteEl);

        // 目标堆
        for (let i = 0; i < 4; i++) {
          const fEl = makeDropZone("foundation" + i, pilePos(3 + i, false), M);
          if (foundations[i].length) {
            fEl.appendChild(cardEl(foundations[i][foundations[i].length - 1], "foundation" + i));
          } else {
            fEl.innerHTML = `<div style="width:${CARD_W}px;height:${CARD_H}px;border:1px dashed #00a000;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#00a000">${suitSVG(i, 16).replace('fill="#000000"', 'fill="#00a000"').replace('fill="#ff0000"', 'fill="#00a000"')}</div>`;
          }
          area.appendChild(fEl);
        }

        // 牌列
        for (let c = 0; c < 7; c++) {
          const col = tableau[c];
          const x = pilePos(c, false);
          const y = CARD_H + V_GAP;
          let yy = y;
          for (let i = 0; i < col.length; i++) {
            const card = col[i];
            const cardDiv = cardEl(card, "tableau" + c);
            cardDiv.style.left = x + "px";
            cardDiv.style.top = yy + "px";
            area.appendChild(cardDiv);
            if (card.faceUp) makeDraggable(cardDiv, card, "tableau" + c, i);
            yy += card.faceUp ? UP_STEP : DOWN_STEP;
          }
          // 空列落点
          if (col.length === 0) {
            const empty = makeDropZone("tableau" + c, x, y);
            empty.style.top = y + "px";
            area.appendChild(empty);
          }
        }

        // 把落点放到最上层（半透明底）
        W95.$$(".drop-zone", area).forEach((z) => {
          z.style.zIndex = "1";
        });
        W95.$$(".card-el", area).forEach((c) => {
          c.style.zIndex = "2";
        });
      }

      function cardEl(card, pileKey) {
        const div = W95.el("div", {
          class: "card-el",
          style: {
            position: "absolute", width: CARD_W + "px", height: CARD_H + "px",
            background: "#fff", border: "1px solid #000", borderRadius: "5px",
            boxShadow: "1px 1px 2px rgba(0,0,0,.4)",
            cursor: "default",
          },
        });
        div.dataset.card = card.id;
        div.dataset.pile = pileKey;
        const suit = SUITS[card.suit];
        const rank = RANK_LABEL[card.rank];
        const corner = W95.el("div", {
          style: {
            position: "absolute", left: "3px", top: "2px",
            textAlign: "center", lineHeight: "1",
            fontFamily: "'Courier New',monospace",
          },
        });
        corner.innerHTML =
          `<div style="font-size:14px;font-weight:bold;color:${suit.color}">${rank}</div>` +
          `<div style="margin-top:1px">${suitSVG(card.suit, 12)}</div>`;
        const cornerBr = corner.cloneNode(true);
        cornerBr.style.left = "auto";
        cornerBr.style.right = "3px";
        cornerBr.style.top = "auto";
        cornerBr.style.bottom = "2px";
        cornerBr.style.transform = "rotate(180deg)";
        div.appendChild(corner);
        div.appendChild(cornerBr);

        // 中央图案
        const center = W95.el("div", {
          style: {
            position: "absolute", inset: "0",
            display: "flex", alignItems: "center", justifyContent: "center",
          },
        });
        if (card.rank <= 10) {
          const pips = PIP_LAYOUT[card.rank];
          const pw = 46, ph = 70;
          const pipWrap = W95.el("div", {
            style: {
              position: "relative", width: pw + "px", height: ph + "px",
              display: "flex", flexWrap: "wrap", alignContent: "space-between", justifyContent: "space-between",
            },
          });
          // 两列网格
          const cols = card.rank >= 6 ? 2 : card.rank >= 4 ? 2 : 1;
          const rows = Math.ceil(pips.length / Math.max(1, cols));
          const cellW = 100 / cols, cellH = 100 / rows;
          pips.forEach(([px, py]) => {
            const cell = W95.el("div", {
              style: {
                position: "absolute",
                left: (px * 100 - cellW / 2) + "%",
                top: (py * 100 - cellH / 2) + "%",
                width: cellW + "%", height: cellH + "%",
                display: "flex", alignItems: "center", justifyContent: "center",
              },
              html: suitSVG(card.suit, 15),
            });
            pipWrap.appendChild(cell);
          });
          center.appendChild(pipWrap);
        } else {
          // 人头牌
          const names = { 11: "J", 12: "Q", 13: "K" };
          const frame = W95.el("div", {
            style: {
              width: "52px", height: "72px",
              border: "1px solid " + suit.color, borderRadius: "3px",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "2px",
              background: "#f8f8f8",
            },
          });
          frame.innerHTML =
            `<div style="font-size:30px;font-weight:bold;color:${suit.color};font-family:Georgia,serif">${names[card.rank]}</div>` +
            `<div>${suitSVG(card.suit, 20)}</div>`;
          center.appendChild(frame);
        }
        div.appendChild(center);
        return div;
      }

      function cardBackEl() {
        const div = W95.el("div", {
          class: "card-el card-back",
          style: {
            position: "absolute", width: CARD_W + "px", height: CARD_H + "px",
            borderRadius: "5px", border: "1px solid #000",
            boxShadow: "1px 1px 2px rgba(0,0,0,.4)",
          },
          html: backSVG(backKind),
        });
        return div;
      }

      function makeDropZone(key, x, y) {
        const z = W95.el("div", {
          class: "drop-zone",
          style: {
            position: "absolute", left: x + "px", top: y + "px",
            width: CARD_W + "px", height: CARD_H + "px",
            borderRadius: "5px", zIndex: "0",
          },
        });
        z.dataset.pile = key;
        return z;
      }

      // ------- 拖动 -------
      function makeDraggable(cardDiv, card, pileKey, idx) {
        cardDiv.addEventListener("pointerdown", (e) => {
          if (e.button !== 0) return;
          if (won) return;
          e.preventDefault();
          const col = tableau[parseInt(pileKey.slice(7))];
          // 计算要拖动的牌堆
          const stack = col.slice(idx);
          if (!stack.every((c) => c.faceUp)) return;
          startDrag(e, card, stack, pileKey, idx, col);
        });
      }

      function startDrag(e, card, stack, pileKey, idx, col) {
        const areaRect = area.getBoundingClientRect();
        const ghost = W95.el("div", {
          style: {
            position: "fixed", zIndex: "500", pointerEvents: "none",
          },
        });
        const cards = [];
        stack.forEach((c, i) => {
          const el = cardEl(c, "drag");
          el.style.position = "static";
          el.style.marginTop = i > 0 ? "-" + (CARD_H - UP_STEP) + "px" : "0";
          el.style.boxShadow = "2px 2px 6px rgba(0,0,0,.5)";
          ghost.appendChild(el);
          cards.push(el);
        });
        document.body.appendChild(ghost);
        const startX = e.clientX, startY = e.clientY;
        // 原位置
        const cardRect = e.target.closest(".card-el").getBoundingClientRect();
        ghost.style.left = cardRect.left + "px";
        ghost.style.top = cardRect.top + "px";
        const offX = e.clientX - cardRect.left;
        const offY = e.clientY - cardRect.top;

        const move = (ev) => {
          ghost.style.left = (ev.clientX - offX) + "px";
          ghost.style.top = (ev.clientY - offY) + "px";
        };
        const up = (ev) => {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          ghost.remove();
          // 目标检测
          const target = findDropTarget(ev.clientX, ev.clientY);
          const fromWaste = pileKey === "waste";
          if (target && target.pile !== pileKey) {
            if (tryMoveWrap(stack, pileKey, target.pile, fromWaste, idx)) {
              moves++;
              updateStatus();
            }
          }
          render();
          checkAutoFinish();
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      }

      function findDropTarget(x, y) {
        // 依次检查：foundation 4, tableau 7, waste, stock
        const candidates = [];
        for (let i = 0; i < 4; i++) {
          if (foundations[i].length) {
            const el = lastElOf("foundation" + i);
            if (el) candidates.push({ pile: "foundation" + i, rect: el.getBoundingClientRect() });
          } else {
            const z = W95.$$(".drop-zone", area).find((d) => d.dataset.pile === "foundation" + i);
            if (z) candidates.push({ pile: "foundation" + i, rect: z.getBoundingClientRect() });
          }
        }
        for (let c = 0; c < 7; c++) {
          const col = tableau[c];
          if (col.length) {
            const el = W95.$$(".card-el", area).find((e2) => e2.dataset.card == col[col.length - 1].id);
            if (el) candidates.push({ pile: "tableau" + c, rect: el.getBoundingClientRect() });
          } else {
            const z = W95.$$(".drop-zone", area).find((d) => d.dataset.pile === "tableau" + c);
            if (z) candidates.push({ pile: "tableau" + c, rect: z.getBoundingClientRect() });
          }
        }
        // waste 顶
        if (waste.length) {
          const el = W95.$$(".card-el", area).find((e2) => e2.dataset.card == waste[waste.length - 1].id);
          if (el) candidates.push({ pile: "waste", rect: el.getBoundingClientRect() });
        }
        // 找包含指针的（从最上层）
        let best = null, bestArea = Infinity;
        for (const c of candidates) {
          const r = c.rect;
          if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            const a = r.width * r.height;
            if (a < bestArea) { bestArea = a; best = c; }
          }
        }
        return best;
      }

      function lastElOf(pileKey) {
        const els = W95.$$(".card-el", area).filter((e2) => e2.dataset.pile === pileKey);
        return els.length ? els[els.length - 1] : null;
      }

      function tryMove(stack, fromPile, toPile, fromWaste, fromIdx) {
        const card = stack[0];
        if (toPile.startsWith("foundation")) {
          if (stack.length > 1) return false;
          const fi = parseInt(toPile.slice(10));
          const f = foundations[fi];
          if (f.length === 0) return card.rank === 1;
          const top = f[f.length - 1];
          return top.suit === card.suit && card.rank === top.rank + 1;
        }
        if (toPile.startsWith("tableau")) {
          const ci = parseInt(toPile.slice(7));
          const col = tableau[ci];
          if (col.length === 0) return card.rank === 13;
          const top = col[col.length - 1];
          const colorDiff = (top.suit < 2) !== (card.suit < 2);
          return colorDiff && card.rank === top.rank - 1;
        }
        return false;
      }

      function doMove(stack, fromPile, toPile, fromIdx) {
        // 从来源移除
        if (fromPile === "waste") {
          waste.splice(waste.length - stack.length, stack.length);
        } else {
          const ci = parseInt(fromPile.slice(7));
          const col = tableau[ci];
          col.splice(fromIdx, stack.length);
          // 翻开新的顶牌
          if (col.length && !col[col.length - 1].faceUp) {
            col[col.length - 1].faceUp = true;
          }
        }
        if (toPile.startsWith("foundation")) {
          const fi = parseInt(toPile.slice(10));
          foundations[fi].push(stack[0]);
        } else if (toPile.startsWith("tableau")) {
          const ci = parseInt(toPile.slice(7));
          tableau[ci].push(...stack);
        }
      }

      function tryMoveWrap(stack, fromPile, toPile, fromWaste, fromIdx) {
        if (!tryMove(stack, fromPile, toPile, fromWaste, fromIdx)) return false;
        doMove(stack, fromPile, toPile, fromIdx);
        return true;
      }

      // 发牌堆点击
      area.addEventListener("pointerdown", (e) => {
        const stockEl = e.target.closest("[data-pile='stock']");
        const wasteEl = e.target.closest("[data-pile='waste']");
        if (won) return;
        if (stockEl && e.button === 0) {
          if (stock.length) {
            const n = Math.min(drawCount, stock.length);
            const drawn = stock.splice(stock.length - n, n);
            waste.push(...drawn.reverse());
            moves++;
            render();
            updateStatus();
          } else {
            // 回收
            if (waste.length) {
              stock = waste.slice().reverse();
              waste = [];
              moves++;
              render();
              updateStatus();
            }
          }
        } else if (wasteEl && e.button === 0) {
          // 双击翻牌堆顶到目标堆
          if (waste.length && dblClickMove) {
            const card = waste[waste.length - 1];
            for (let fi = 0; fi < 4; fi++) {
              const f = foundations[fi];
              const ok = f.length === 0 ? card.rank === 1 : (f[f.length - 1].suit === card.suit && card.rank === f[f.length - 1].rank + 1);
              if (ok) {
                waste.pop();
                f.push(card);
                moves++;
                render();
                updateStatus();
                checkAutoFinish();
                return;
              }
            }
          }
        }
      });

      // 双击自动到目标堆
      area.addEventListener("dblclick", (e) => {
        if (won) return;
        const cardDiv = e.target.closest(".card-el");
        if (!cardDiv) return;
        const id = parseInt(cardDiv.dataset.card);
        const card = deck[id];
        if (!card) return;
        // 只处理面朝上且是所在列/翻牌堆的顶牌
        let fromPile = null, fromIdx = -1;
        for (let c = 0; c < 7; c++) {
          const col = tableau[c];
          const i = col.findIndex((x) => x.id === id);
          if (i >= 0 && i === col.length - 1) { fromPile = "tableau" + c; fromIdx = i; break; }
        }
        if (!fromPile && waste.length && waste[waste.length - 1].id === id) fromPile = "waste";
        if (!fromPile) return;
        const stack = fromPile === "waste" ? [card] : tableau[parseInt(fromPile.slice(7))].slice(fromIdx);
        for (let fi = 0; fi < 4; fi++) {
          if (tryMoveWrap(stack, fromPile, "foundation" + fi, fromPile === "waste", fromIdx)) {
            moves++;
            render();
            updateStatus();
            checkAutoFinish();
            return;
          }
        }
      });

      // ------- 自动完成检查 -------
      function checkAutoFinish() {
        if (won) return;
        // 检查是否所有牌都在目标堆
        const total = foundations.reduce((a, f) => a + f.length, 0);
        if (total === 52) {
          gameWon();
          return;
        }
        // 自动完成：所有面朝上的牌都能连续移动到目标堆
        if (total === 48) {
          // 尝试模拟完成
          const movable = [];
          for (let c = 0; c < 7; c++) {
            const col = tableau[c];
            if (col.length && col[col.length - 1].faceUp) movable.push(col[col.length - 1]);
          }
          if (waste.length) movable.push(waste[waste.length - 1]);
          if (movable.length === 4) {
            // 检查 4 张顶牌是否各自能进目标堆
            let can = true;
            for (const card of movable) {
              let ok = false;
              for (let fi = 0; fi < 4; fi++) {
                const f = foundations[fi];
                ok = f.length === 0 ? card.rank === 1 : (f[f.length - 1].suit === card.suit && card.rank === f[f.length - 1].rank + 1);
                if (ok) break;
              }
              if (!ok) { can = false; break; }
            }
            if (can) autoFinish();
          }
        }
      }

      function autoFinish() {
        // 快速自动完成动画：把剩余顶牌逐张放入目标堆
        won = true;
        if (timer) { clearInterval(timer); timer = null; }
        const seq = [];
        for (let step = 0; step < 4; step++) {
          let placed = true;
          while (placed) {
            placed = false;
            for (let c = 0; c < 7 && !placed; c++) {
              const col = tableau[c];
              if (col.length && col[col.length - 1].faceUp) {
                const card = col[col.length - 1];
                for (let fi = 0; fi < 4; fi++) {
                  const f = foundations[fi];
                  const ok = f.length === 0 ? card.rank === 1 : (f[f.length - 1].suit === card.suit && card.rank === f[f.length - 1].rank + 1);
                  if (ok) { seq.push([card, fi]); col.pop(); f.push(card); placed = true; break; }
                }
              }
            }
          }
        }
        // 渲染动画
        let i = 0;
        const anim = setInterval(() => {
          if (i >= seq.length) {
            clearInterval(anim);
            render();
            finishWin();
            return;
          }
          render();
          i++;
        }, 220);
      }

      function gameWon() {
        won = true;
        if (timer) { clearInterval(timer); timer = null; }
        render();
        finishWin();
      }

      function finishWin() {
        W95.sound.play("ding");
        const s = timed ? "\r\n用时 " + time + " 秒，走了 " + moves + " 步。" : "\r\n共走了 " + moves + " 步。";
        W95.msgbox({
          title: "纸牌",
          icon: "solitaire",
          text: "恭喜！你赢了！" + s,
          buttons: ["确定"],
        }).then(() => {
          if (W95.store.get("sol-new-after-win", false)) newGame(false);
        });
      }

      // ------- 对话框 -------
      function deckDialog() {
        const win2 = W95.dlgWindow({ title: "选择纸牌背面图案", icon: "msg-solitaire" });
        const b2 = win2.body;
        b2.style.display = "flex"; b2.style.flexDirection = "column"; b2.style.gap = "8px";
        b2.style.minWidth = "300px";
        const grid = W95.el("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" } });
        BACKS.forEach((bk) => {
          const box = W95.el("div", {
            style: {
              border: "2px solid " + (backKind === bk ? "#000080" : "#808080"),
              padding: "6px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px", cursor: "pointer", background: "#fff",
            },
          });
          box.innerHTML = backSVG(bk) + `<div style="font-size:11px">${BACK_NAMES[bk]}</div>`;
          box.addEventListener("click", () => {
            backKind = bk;
            W95.store.set("sol-back", bk);
            win2.close();
            render();
          });
          grid.appendChild(box);
        });
        b2.appendChild(grid);
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end" } });
        const ok = W95.el("button", { class: "w95btn", type: "button", text: "确定" });
        ok.addEventListener("click", () => win2.close());
        row.appendChild(ok);
        b2.appendChild(row);
      }

      function optionsDialog() {
        const win2 = W95.dlgWindow({ title: "选项", icon: "msg-solitaire" });
        const b2 = win2.body;
        b2.style.display = "flex"; b2.style.flexDirection = "column"; b2.style.gap = "8px";
        b2.style.minWidth = "300px";
        const g1 = W95.el("div", { class: "w95group" });
        g1.appendChild(W95.el("legend", { text: "翻牌" }));
        [["翻一张牌", 1], ["翻三张牌", 3]].forEach(([label, v]) => {
          const row = W95.el("label", { class: "w95radio" });
          const rb = W95.el("input", { type: "radio", name: "sol-draw" });
          if (drawCount === v) rb.checked = true;
          rb.addEventListener("change", () => { drawCount = v; W95.store.set("sol-draw", v); });
          row.appendChild(rb);
          row.appendChild(W95.el("span", { class: "w95label", text: label }));
          g1.appendChild(row);
        });
        const g2 = W95.el("div", { class: "w95group" });
        g2.appendChild(W95.el("legend", { text: "选项" }));
        const c1 = W95.el("label", { class: "w95check" });
        const cb1 = W95.el("input", { type: "checkbox" });
        cb1.checked = timed;
        cb1.addEventListener("change", () => { timed = cb1.checked; W95.store.set("sol-timed", timed); });
        c1.appendChild(cb1);
        c1.appendChild(W95.el("span", { class: "w95label", text: "计分" }));
        const c2 = W95.el("label", { class: "w95check" });
        const cb2 = W95.el("input", { type: "checkbox" });
        cb2.checked = dblClickMove;
        cb2.addEventListener("change", () => { dblClickMove = cb2.checked; W95.store.set("sol-dbl", dblClickMove); });
        c2.appendChild(cb2);
        c2.appendChild(W95.el("span", { class: "w95label", text: "双击将牌移到目标堆" }));
        const c3 = W95.el("label", { class: "w95check" });
        const cb3 = W95.el("input", { type: "checkbox" });
        cb3.checked = outlineDrag;
        cb3.addEventListener("change", () => { outlineDrag = cb3.checked; W95.store.set("sol-outline", outlineDrag); });
        c3.appendChild(cb3);
        c3.appendChild(W95.el("span", { class: "w95label", text: "拖动时只显示外框" }));
        g2.appendChild(c1); g2.appendChild(c2); g2.appendChild(c3);
        b2.appendChild(g1); b2.appendChild(g2);
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
        const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
        ok.addEventListener("click", () => win2.close());
        row.appendChild(ok);
        b2.appendChild(row);
      }

      function updateStatus() {
        const s = (timed ? "时间: " + String(Math.floor(time / 60)).padStart(2, "0") + ":" + String(time % 60).padStart(2, "0") + "   " : "") + "步数: " + moves;
        win.setStatus(s);
      }

      newGame(false);
    },
  });
})();
