/* ============================================================
   画图 (Paint)
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const PALETTE = [
    "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080",
    "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
    "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff",
    "#ffff80", "#00ff80", "#80ffff", "#ff0080", "#ff8000",
  ];

  const TOOLS = [
    ["select", "选择"], ["eraser", "橡皮"], ["fill", "用颜色填充"], ["pick", "取色"],
    ["magnifier", "放大镜"], ["pencil", "铅笔"], ["brush", "刷子"], ["airbrush", "喷枪"],
    ["text", "文字"], ["line", "直线"], ["rect", "矩形"], ["polygon", "多边形"],
    ["ellipse", "椭圆"], ["roundrect", "圆角矩形"],
  ];

  W95.registerApp("paint", {
    title: "画图 - 未命名",
    icon: "paint",
    width: 640,
    height: 440,
    minWidth: 420,
    minHeight: 300,
    create(win) {
      const body = win.body;
      body.style.display = "flex";
      body.style.flexDirection = "row";
      body.style.padding = "0";
      body.style.overflow = "hidden";
      body.style.gap = "0";

      const imgW = 640, imgH = 480;
      let zoom = 1;
      let tool = "pencil";
      let lineWidth = 1;
      let brushShape = 0; // 0 圆形 1 方形 2 横线 3 竖线
      let fgColor = "#000000", bgColor = "#ffffff";
      let opaque = true;
      let currentPath = null;
      let clipboard = null; // {canvas, hasTransparent}

      // ------- canvas -------
      const canvas = W95.el("canvas", { width: imgW, height: imgH });
      canvas.style.background = "#fff";
      canvas.style.boxShadow = "inset -1px -1px 0 #808080, inset 1px 1px 0 #fff";
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, imgW, imgH);

      const canvasWrap = W95.el("div", {
        style: { flex: "1", overflow: "auto", background: "#808080", padding: "6px" },
      });
      const canvasHolder = W95.el("div", { style: { display: "inline-block", position: "relative" } });
      canvasHolder.appendChild(canvas);
      canvasWrap.appendChild(canvasHolder);
      body.appendChild(canvasWrap);

      function applyZoom() {
        canvas.style.width = imgW * zoom + "px";
        canvas.style.height = imgH * zoom + "px";
        canvas.width = imgW;
        canvas.height = imgH;
        ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
      }
      applyZoom();

      // ------- undo -------
      const undoStack = [];
      function pushUndo() {
        undoStack.push(ctx.getImageData(0, 0, imgW, imgH));
        if (undoStack.length > 10) undoStack.shift();
      }
      function undo() {
        if (!undoStack.length) return;
        const d = undoStack.pop();
        ctx.putImageData(d, 0, 0);
      }

      // ------- toolbar -------
      const toolCol = W95.el("div", {
        style: {
          width: "58px", display: "flex", flexDirection: "column",
          borderRight: "1px solid #808080", background: "#c0c0c0",
        },
      });
      const toolsEl = W95.el("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 26px)", gap: "2px", padding: "4px" } });
      const toolBtns = {};
      TOOLS.forEach(([id, name]) => {
        const b = W95.el("button", {
          type: "button", title: name,
          style: {
            width: "26px", height: "26px", padding: "0",
            background: "#c0c0c0", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff",
          },
          html: toolIcon(id, 20),
        });
        b.addEventListener("click", () => { setTool(id); });
        toolBtns[id] = b;
        toolsEl.appendChild(b);
      });
      toolCol.appendChild(toolsEl);

      // 选项框
      const optBox = W95.el("div", {
        style: {
          height: "120px", margin: "0 4px", border: "1px solid",
          borderColor: "#808080 #fff #fff #808080", display: "flex",
          justifyContent: "center", padding: "4px",
        },
      });
      toolCol.appendChild(optBox);

      // 调色板
      const palBox = W95.el("div", {
        style: {
          margin: "4px", border: "1px solid", borderColor: "#808080 #fff #fff #808080",
          padding: "3px", display: "flex", flexWrap: "wrap", gap: "1px",
        },
      });
      const fgSwatch = W95.el("div", {
        style: {
          width: "14px", height: "14px", border: "1px solid #000",
          background: fgColor, position: "absolute",
        },
      });
      const bgSwatch = W95.el("div", {
        style: {
          width: "14px", height: "14px", border: "1px solid #000",
          background: bgColor, position: "absolute", left: "7px", top: "7px",
        },
      });
      const swatchBox = W95.el("div", {
        style: { position: "relative", width: "24px", height: "24px", flex: "0 0 auto", marginRight: "4px" },
      });
      swatchBox.appendChild(bgSwatch);
      swatchBox.appendChild(fgSwatch);
      palBox.appendChild(swatchBox);
      const palGrid = W95.el("div", { style: { display: "grid", gridTemplateColumns: "repeat(14, 12px)", gap: "1px", flex: "1" } });
      PALETTE.forEach((c) => {
        const cell = W95.el("div", {
          style: { width: "12px", height: "12px", background: c, border: "1px solid #808080" },
        });
        cell.addEventListener("click", (e) => {
          if (e.button === 0 || (e.shiftKey)) {
            fgColor = c;
            fgSwatch.style.background = c;
            if (tool === "pick") { setTool("pencil"); }
          }
        });
        cell.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          bgColor = c;
          bgSwatch.style.background = c;
        });
        palGrid.appendChild(cell);
      });
      palBox.appendChild(palGrid);
      toolCol.appendChild(palBox);
      body.insertBefore(toolCol, canvasWrap);

      function setTool(t) {
        tool = t;
        Object.values(toolBtns).forEach((b) => (b.style.boxShadow = "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff"));
        const b = toolBtns[t];
        if (b) b.style.boxShadow = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff";
        drawOptions();
        if (t === "magnifier") {
          zoom = zoom === 1 ? 4 : 1;
          applyZoom();
          W95.msgbox({ title: "画图", icon: "info", text: zoom === 1 ? "已恢复 100% 视图。" : "已放大到 400%。", buttons: ["确定"] });
          setTool("pencil");
        }
      }

      function drawOptions() {
        optBox.innerHTML = "";
        if (["line", "rect", "polygon", "ellipse", "roundrect"].includes(tool)) {
          for (let i = 1; i <= 5; i++) {
            const b = W95.el("button", {
              type: "button",
              style: {
                width: "40px", height: "16px", margin: "2px", padding: "0",
                background: "#c0c0c0", display: "block",
                boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff",
              },
              html: `<svg width="38" height="14" viewBox="0 0 38 14"><line x1="2" y1="${7 + (i - 3)}" x2="36" y2="${7 + (i - 3)}" stroke="#000" stroke-width="${i}"${i > 1 ? ' stroke-linecap="round"' : ""}/></svg>`,
            });
            if (i === lineWidth) b.style.boxShadow = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff";
            b.addEventListener("click", () => { lineWidth = i; drawOptions(); });
            optBox.appendChild(b);
          }
        } else if (tool === "brush") {
          const shapes = [
            '<svg width="18" height="18"><circle cx="9" cy="9" r="5" fill="#000"/></svg>',
            '<svg width="18" height="18"><rect x="3" y="3" width="12" height="12" fill="#000"/></svg>',
            '<svg width="18" height="18"><rect x="2" y="8" width="14" height="4" fill="#000"/></svg>',
            '<svg width="18" height="18"><rect x="8" y="2" width="4" height="14" fill="#000"/></svg>',
          ];
          shapes.forEach((s, i) => {
            const b = W95.el("button", {
              type: "button", html: s,
              style: {
                width: "24px", height: "24px", margin: "2px", padding: "0",
                background: "#c0c0c0", display: "block",
                boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff",
              },
            });
            if (i === brushShape) b.style.boxShadow = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff";
            b.addEventListener("click", () => { brushShape = i; drawOptions(); });
            optBox.appendChild(b);
          });
        } else if (tool === "eraser") {
          for (let i = 1; i <= 3; i++) {
            const b = W95.el("button", {
              type: "button",
              style: {
                width: "40px", height: "20px", margin: "2px", padding: "0",
                background: "#c0c0c0", display: "block",
                boxShadow: "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff",
              },
              html: `<svg width="36" height="18"><rect x="${8 + (i - 1) * 5}" y="${6}" width="${8 + (i - 1) * 5}" height="${8 + (i - 1) * 5}" fill="#fff" stroke="#000"/></svg>`,
            });
            if (i === (lineWidth === 1 ? 1 : lineWidth - 1)) b.style.boxShadow = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff";
            b.addEventListener("click", () => { lineWidth = i + 1; drawOptions(); });
            optBox.appendChild(b);
          }
        }
      }
      drawOptions();

      // ------- 工具图标 -------
      function toolIcon(id, s) {
        const c = (x, y, w, h, col) =>
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col || "#000"}"/>`;
        switch (id) {
          case "select": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="none" stroke="#000" stroke-dasharray="2 2"/><rect x="2" y="2" width="6" height="6" fill="#000"/></svg>`;
          case "eraser": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20">${c(3, 6, 14, 6, "#f0a0c0")}<path d="M4,10 L8,14 L16,6 L12,2 Z" fill="#000"/></svg>`;
          case "fill": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><path d="M3,6 L13,16 L18,11 L8,1 Z" fill="#808080"/><path d="M10,3 L15,8" stroke="#000"/><path d="M2,12 h16 v4 h-16 z" fill="#0000c0"/></svg>`;
          case "pick": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><path d="M4,16 L7,7 L12,12 L3,15 Z" fill="#0000c0"/><rect x="11" y="11" width="7" height="7" fill="#c0c0c0" stroke="#000"/></svg>`;
          case "magnifier": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><circle cx="8" cy="8" r="5" fill="none" stroke="#000" stroke-width="2"/><line x1="12" y1="12" x2="17" y2="17" stroke="#000" stroke-width="2"/><rect x="12" y="12" width="5" height="5" fill="#c0c0c0" stroke="#000"/></svg>`;
          case "pencil": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><path d="M2,18 L5,7 L13,15 Z" fill="#c0c000"/><path d="M5,7 L13,15 L15,13 L7,5 Z" fill="#000"/></svg>`;
          case "brush": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><rect x="8" y="1" width="4" height="9" fill="#804000"/><path d="M4,8 h12 l-2,8 h-8 z" fill="#000"/><circle cx="8" cy="13" r="1" fill="#fff"/></svg>`;
          case "airbrush": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><rect x="2" y="2" width="4" height="8" fill="#808080"/><circle cx="12" cy="12" r="6" fill="none" stroke="#000"/><circle cx="10" cy="10" r="2" fill="#000"/></svg>`;
          case "text": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20">${c(3, 4, 2, 12, "#0000c0")}${c(5, 6, 10, 2, "#0000c0")}${c(13, 6, 2, 10, "#0000c0")}${c(5, 12, 6, 2, "#0000c0")}</svg>`;
          case "line": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><line x1="3" y1="17" x2="17" y2="3" stroke="#000" stroke-width="2"/></svg>`;
          case "rect": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" fill="none" stroke="#000" stroke-width="2"/></svg>`;
          case "polygon": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><path d="M10,3 L17,8 L14,16 L6,16 L3,8 Z" fill="none" stroke="#000" stroke-width="2"/></svg>`;
          case "ellipse": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="7" ry="6" fill="none" stroke="#000" stroke-width="2"/></svg>`;
          case "roundrect": return `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" rx="3" fill="none" stroke="#000" stroke-width="2"/></svg>`;
        }
        return "";
      }

      // ------- 绘图交互 -------
      let drawing = false;
      let baseSnapshot = null;
      let start = null, last = null;
      let shape = null; // 临时形状参数
      let polyPoints = [];
      let selection = null; // {x,y,w,h}
      let selectionData = null;
      let textMode = null;

      function toImg(e) {
        const r = canvas.getBoundingClientRect();
        return {
          x: Math.floor((e.clientX - r.left) / zoom),
          y: Math.floor((e.clientY - r.top) / zoom),
        };
      }

      function clearSelection() {
        if (selection) {
          // 恢复原位
          if (selectionData) {
            ctx.putImageData(selectionData, selection.x, selection.y);
            selectionData = null;
          }
          redrawMarquee();
          selection = null;
        }
      }

      let marqueeEl = null;
      function redrawMarquee() {
        if (marqueeEl) marqueeEl.remove();
        marqueeEl = null;
        if (!selection) return;
        const m = W95.el("div", {
          style: {
            position: "absolute",
            left: selection.x * zoom + "px", top: selection.y * zoom + "px",
            width: selection.w * zoom + "px", height: selection.h * zoom + "px",
            border: "1px dashed #000", pointerEvents: "none", zIndex: "5",
          },
        });
        canvasHolder.appendChild(m);
        marqueeEl = m;
      }

      canvas.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        const p = toImg(e);
        if (e.button === 2) return;
        if (tool === "magnifier") { setTool("magnifier"); return; }
        if (tool === "text") {
          startText(p);
          return;
        }
        if (tool === "select") {
          start = p; drawing = true;
          if (selection) { clearSelection(); }
          return;
        }
        if (tool === "pick") {
          const d = ctx.getImageData(p.x, p.y, 1, 1).data;
          fgColor = "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
          fgSwatch.style.background = fgColor;
          setTool("pencil");
          return;
        }
        if (tool === "fill") {
          pushUndo();
          floodFill(p.x, p.y, fgColor);
          return;
        }
        if (tool === "polygon") {
          polyPoints.push(p);
          return;
        }
        pushUndo();
        baseSnapshot = ctx.getImageData(0, 0, imgW, imgH);
        drawing = true;
        start = p; last = p;
        ctx.fillStyle = fgColor;
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = lineWidth;
        if (tool === "pencil") {
          ctx.fillRect(p.x, p.y, 1, 1);
        } else if (tool === "brush") {
          paintBrush(p);
        } else if (tool === "eraser") {
          ctx.fillStyle = bgColor;
          const s = (lineWidth || 2) * 6;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          ctx.fillStyle = fgColor;
        }
      });

      canvas.addEventListener("pointermove", (e) => {
        const p = toImg(e);
        if (W95.WM.active === win) {
          win.setStatus("光标位置: (" + Math.max(0, p.x) + ", " + Math.max(0, p.y) + ")    图像大小: " + imgW + " x " + imgH);
        }
        if (!drawing) return;
        if (tool === "select") {
          selection = normRect(start, p);
          redrawMarquee();
          return;
        }
        if (tool === "eraser") {
          ctx.fillStyle = bgColor;
          const s = (lineWidth || 2) * 6;
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth = s;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.fillStyle = fgColor;
          last = p;
          return;
        }
        if (tool === "pencil" || tool === "brush" || tool === "airbrush") {
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth = tool === "pencil" ? 1 : lineWidth;
          ctx.lineCap = "round";
          ctx.strokeStyle = fgColor;
          ctx.stroke();
          last = p;
          return;
        }
        // 形状预览
        shape = { tool, start, end: p };
        renderShapePreview();
      });

      canvas.addEventListener("pointerup", (e) => {
        if (!drawing) return;
        drawing = false;
        const p = toImg(e);
        if (tool === "select") {
          selection = normRect(start, p);
          redrawMarquee();
          if (selection.w > 0 && selection.h > 0) {
            selectionData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
          }
          return;
        }
        if (["line", "rect", "ellipse", "roundrect"].includes(tool)) {
          shape = { tool, start, end: p };
          // 先恢复快照再提交最终形状
          if (baseSnapshot) ctx.putImageData(baseSnapshot, 0, 0);
          renderShape(true);
          shape = null;
          baseSnapshot = null;
        }
      });

      function normRect(a, b) {
        const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
        return { x, y, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
      }

      function renderShapePreview() {
        if (!shape) return;
        // 从快照恢复再画预览，避免残留
        if (baseSnapshot) ctx.putImageData(baseSnapshot, 0, 0);
        ctx.save();
        ctx.strokeStyle = "#808080";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        const { tool: t, start: a, end: b } = shape;
        if (t === "line") {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        } else if (t === "rect") {
          const r = normRect(a, b);
          ctx.strokeRect(r.x, r.y, r.w, r.h);
        } else if (t === "ellipse") {
          const r = normRect(a, b);
          ctx.beginPath();
          ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, 7);
          ctx.stroke();
        } else if (t === "roundrect") {
          const r = normRect(a, b);
          const rad = Math.min(8, r.w / 3, r.h / 3);
          roundRectPath(ctx, r.x, r.y, r.w, r.h, rad);
          ctx.stroke();
        }
        ctx.restore();
      }

      function renderShape(commit) {
        if (!shape) return;
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = lineWidth;
        const { tool: t, start: a, end: b } = shape;
        if (t === "line") {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        } else if (t === "rect") {
          const r = normRect(a, b);
          ctx.strokeRect(r.x, r.y, r.w, r.h);
        } else if (t === "ellipse") {
          const r = normRect(a, b);
          ctx.beginPath();
          ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, 7);
          ctx.stroke();
        } else if (t === "roundrect") {
          const r = normRect(a, b);
          const rad = Math.min(8, r.w / 3, r.h / 3);
          roundRectPath(ctx, r.x, r.y, r.w, r.h, rad);
          ctx.stroke();
        }
      }

      function roundRectPath(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
      }

      function paintBrush(p) {
        const s = lineWidth * 3;
        ctx.fillStyle = fgColor;
        if (brushShape === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, s / 2, 0, 7); ctx.fill(); }
        else if (brushShape === 1) ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        else if (brushShape === 2) ctx.fillRect(p.x - s, p.y - 1, s * 2, 2);
        else ctx.fillRect(p.x - 1, p.y - s, 2, s * 2);
      }

      function floodFill(x, y, color) {
        const w = imgW, h = imgH;
        const img = ctx.getImageData(0, 0, w, h);
        const data = img.data;
        const target = [data[(y * w + x) * 4], data[(y * w + x) * 4 + 1], data[(y * w + x) * 4 + 2], data[(y * w + x) * 4 + 3]];
        const col = hexToRgb(color);
        const tr = target[0], tg = target[1], tb = target[2];
        if (tr === col[0] && tg === col[1] && tb === col[2]) return;
        const stack = [[x, y]];
        const seen = new Uint8Array(w * h);
        while (stack.length) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
          const idx = cy * w + cx;
          if (seen[idx]) continue;
          seen[idx] = 1;
          const i = idx * 4;
          if (data[i] === tr && data[i + 1] === tg && data[i + 2] === tb) {
            data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2];
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
          }
        }
        ctx.putImageData(img, 0, 0);
      }

      function hexToRgb(h) {
        const n = parseInt(h.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }

      // 文字工具
      function startText(p) {
        textMode = { x: p.x, y: p.y, value: "", font: "12px 'MS Sans Serif',sans-serif" };
        // 显示输入框
        const inp = W95.el("textarea", {
          style: {
            position: "absolute", left: p.x * zoom + "px", top: p.y * zoom + "px",
            width: "140px", height: "60px", zIndex: "6",
            font: textMode.font, border: "1px dashed #000", resize: "none",
            background: "transparent", color: fgColor, outline: "none",
          },
        });
        canvasHolder.appendChild(inp);
        inp.focus();
        const commit = () => {
          const lines = inp.value.split("\n");
          ctx.fillStyle = fgColor;
          ctx.font = textMode.font;
          ctx.textBaseline = "top";
          lines.forEach((ln, i) => ctx.fillText(ln, textMode.x, textMode.y + i * 16));
          inp.remove();
          textMode = null;
          pushUndo();
        };
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Escape") { inp.remove(); textMode = null; }
          e.stopPropagation();
        });
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && e.ctrlKey) commit();
        });
      }

      // 选择移动
      canvasHolder.addEventListener("pointerdown", (e) => {
        if (tool !== "select" || !selection || e.button !== 0) return;
        const p = toImg(e);
        const inSel = p.x >= selection.x && p.x <= selection.x + selection.w && p.y >= selection.y && p.y <= selection.y + selection.h;
        if (!inSel) return;
        e.stopPropagation();
        // 切出选择区域
        ctx.save();
        ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
        ctx.restore();
        const img = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
        const startPos = { x: p.x, y: p.y };
        const origSel = { ...selection };
        selectionData = null;
        const move = (ev) => {
          const q = toImg(ev);
          const dx = q.x - startPos.x, dy = q.y - startPos.y;
          redrawMarquee();
          ctx.putImageData(img, origSel.x + dx, origSel.y + dy);
          selection.x = origSel.x + dx;
          selection.y = origSel.y + dy;
        };
        const up = () => {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          selectionData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
          redrawMarquee();
        };
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      });

      // 多边形
      canvas.addEventListener("dblclick", (e) => {
        if (tool !== "polygon" || !polyPoints.length) return;
        const p = toImg(e);
        polyPoints.push(p);
        pushUndo();
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        polyPoints.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
        ctx.closePath();
        ctx.stroke();
        polyPoints = [];
      });

      // 喷枪简单实现：用抖动点
      let airbrushTimer = null;

      // ------- 菜单 -------
      const menuDefs = [
        {
          label: "文件(F)", onAction: (a) => {
            if (a === "new") { pushUndo(); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, imgW, imgH); }
            else if (a === "open") openImage();
            else if (a === "save") saveImage(false);
            else if (a === "saveas") saveImage(true);
            else if (a === "exit") win.close();
          },
          items: [
            { label: "新建(N)", action: "new" },
            { label: "打开(O)...", action: "open" },
            { label: "保存(S)", action: "save" },
            { label: "另存为(A)...", action: "saveas" },
            { sep: true },
            { label: "退出(X)", action: "exit" },
          ],
        },
        {
          label: "编辑(E)", onAction: (a) => {
            if (a === "undo") undo();
            else if (a === "cut") clip("cut");
            else if (a === "copy") clip("copy");
            else if (a === "paste") pasteClip();
            else if (a === "clear") { if (selection) { ctx.clearRect(selection.x, selection.y, selection.w, selection.h); selection = null; redrawMarquee(); } }
            else if (a === "all") { selection = { x: 0, y: 0, w: imgW, h: imgH }; selectionData = ctx.getImageData(0, 0, imgW, imgH); redrawMarquee(); }
          },
          items: [
            { label: "撤消(U)", action: "undo" },
            { sep: true },
            { label: "剪切(T)", action: "cut" },
            { label: "复制(C)", action: "copy" },
            { label: "粘贴(P)", action: "paste" },
            { sep: true },
            { label: "清除选定区域(L)", action: "clear" },
            { label: "全选(A)", action: "all" },
          ],
        },
        {
          label: "查看(V)", onAction: (a) => {
            if (a === "zoomin") { zoom = Math.min(8, zoom * 2); applyZoom(); }
            else if (a === "zoomout") { zoom = Math.max(1, zoom / 2); applyZoom(); }
          },
          items: [
            { label: "放大(I)", action: "zoomin" },
            { label: "缩小(O)", action: "zoomout" },
            { sep: true },
            { label: "全图(V)", action: "full" },
          ],
        },
        {
          label: "图像(I)", onAction: (a) => {
            if (a === "flip") flipRotateDialog();
            else if (a === "stretch") stretchSkewDialog();
            else if (a === "attr") attributesDialog();
            else if (a === "clearimg") { pushUndo(); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, imgW, imgH); }
            else if (a === "opaque") { opaque = !opaque; }
          },
          items: [
            { label: "翻转/旋转(F)...", action: "flip" },
            { label: "拉伸/扭曲(S)...", action: "stretch" },
            { sep: true },
            { label: "属性(A)...", action: "attr" },
            { label: "清除图像(C)", action: "clearimg" },
            { sep: true },
            { label: "不透明处理(O)", checked: opaque, action: "opaque" },
          ],
        },
        {
          label: "帮助(H)", onAction: (a) => {
            if (a === "about") W95.msgbox({ title: "关于画图", icon: "paint", text: "Microsoft (R) 画图\r\n版本 4.0\r\n\r\n由 Windows 95 网页模拟器提供。", buttons: ["确定"] });
          },
          items: [
            { label: "帮助主题(H)", action: "help" },
            { sep: true },
            { label: "关于画图(A)", action: "about" },
          ],
        },
      ];
      win.setMenuBar(menuDefs[0]);
      menuDefs.slice(1).forEach((m) => {
        const item = W95.el("div", { class: "win-menubar-item", text: m.label });
        win.menubar.appendChild(item);
        item.addEventListener("mousedown", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (item.classList.contains("active")) { W95.closeMenus(); item.classList.remove("active"); return; }
          W95.$$(".win-menubar-item.active").forEach((x) => x.classList.remove("active"));
          item.classList.add("active");
          W95.popupMenu(m.items, {
            x: item.getBoundingClientRect().left,
            y: item.getBoundingClientRect().bottom,
            onClose: () => item.classList.remove("active"),
            onAction: (a) => { m.onAction(a); item.classList.remove("active"); W95.closeMenus(); },
          });
        });
      });

      function clip(mode) {
        if (!selection) return;
        const c = document.createElement("canvas");
        c.width = selection.w; c.height = selection.h;
        c.getContext("2d").putImageData(ctx.getImageData(selection.x, selection.y, selection.w, selection.h), 0, 0);
        clipboard = c;
        if (mode === "cut") {
          ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
          selectionData = null;
        }
      }
      function pasteClip() {
        if (!clipboard) return;
        pushUndo();
        clearSelection();
        selection = { x: 20, y: 20, w: clipboard.width, h: clipboard.height };
        ctx.putImageData(clipboard.getContext("2d").getImageData(0, 0, clipboard.width, clipboard.height), selection.x, selection.y);
        selectionData = ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
        redrawMarquee();
      }

      function flipRotateDialog() {
        const win2 = W95.dlgWindow({ title: "翻转和旋转", icon: "msg-paint" });
        const b2 = win2.body;
        b2.style.display = "flex"; b2.style.flexDirection = "column"; b2.style.gap = "8px";
        b2.style.minWidth = "280px";
        b2.appendChild(W95.el("div", { class: "w95label", text: "翻转或旋转" }));
        const opts = [
          ["水平翻转", "h"], ["垂直翻转", "v"], ["按一定角度旋转", null],
        ];
        let sel = "h";
        opts.forEach(([label, v]) => {
          const row = W95.el("label", { class: "w95radio" });
          const rb = W95.el("input", { type: "radio", name: "fr" });
          if (v === "h") rb.checked = true;
          rb.addEventListener("change", () => (sel = v || "r90"));
          row.appendChild(rb);
          row.appendChild(W95.el("span", { class: "w95label", text: label }));
          b2.appendChild(row);
          if (v === null) {
            ["90 度", "180 度", "270 度"].forEach((a, i) => {
              const r2 = W95.el("label", { class: "w95radio", style: { marginLeft: "20px" } });
              const rb2 = W95.el("input", { type: "radio", name: "fr2" });
              rb2.addEventListener("change", () => (sel = "r" + [90, 180, 270][i]));
              r2.appendChild(rb2);
              r2.appendChild(W95.el("span", { class: "w95label", text: a }));
              b2.appendChild(r2);
            });
          }
        });
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" } });
        const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
        const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
        ok.addEventListener("click", () => {
          pushUndo();
          const c2 = document.createElement("canvas");
          c2.width = imgW; c2.height = imgH;
          const c = c2.getContext("2d");
          const region = selection ? selection : { x: 0, y: 0, w: imgW, h: imgH };
          const img = ctx.getImageData(region.x, region.y, region.w, region.h);
          if (sel === "h") { c.translate(region.x * 2 + region.w, 0); c.scale(-1, 1); }
          else if (sel === "v") { c.translate(0, region.y * 2 + region.h); c.scale(1, -1); }
          else if (sel === "r90") { c.translate(region.x + region.w, region.y); c.rotate(Math.PI / 2); c.translate(0, -region.h); }
          else if (sel === "r180") { c.translate(region.x * 2 + region.w, region.y * 2 + region.h); c.rotate(Math.PI); }
          else if (sel === "r270") { c.translate(region.x, region.y + region.h); c.rotate(-Math.PI / 2); c.translate(-region.w, 0); }
          c.putImageData(img, region.x, region.y);
          ctx.clearRect(region.x, region.y, region.w, region.h);
          ctx.drawImage(c2, 0, 0);
          selection = null; redrawMarquee();
          win2.close();
        });
        cancel.addEventListener("click", () => win2.close());
        row.appendChild(ok); row.appendChild(cancel);
        b2.appendChild(row);
      }

      function stretchSkewDialog() {
        const win2 = W95.dlgWindow({ title: "拉伸和扭曲", icon: "msg-paint" });
        const b2 = win2.body;
        b2.style.display = "flex"; b2.style.flexDirection = "column"; b2.style.gap = "6px";
        b2.style.minWidth = "300px";
        let hs = 100, vs = 100, hk = 0, vk = 0;
        const mk = (label, val) => {
          const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
          row.appendChild(W95.el("span", { class: "w95label", text: label, style: { width: "110px" } }));
          const inp = W95.el("input", { class: "w95input", type: "text", value: val, style: { width: "50px" } });
          row.appendChild(inp);
          row.appendChild(W95.el("span", { class: "w95label", text: "%" }));
          return { row, inp };
        };
        const g1 = W95.el("div", { class: "w95group", style: { marginTop: "4px" } });
        g1.appendChild(W95.el("legend", { text: "拉伸" }));
        const h = mk("水平:", 100), v = mk("垂直:", 100);
        g1.appendChild(h.row); g1.appendChild(v.row);
        const g2 = W95.el("div", { class: "w95group", style: { marginTop: "4px" } });
        g2.appendChild(W95.el("legend", { text: "扭曲" }));
        const hk2 = mk("水平:", 0), vk2 = mk("垂直:", 0);
        hk2.row.querySelectorAll("span")[1].textContent = "度";
        vk2.row.querySelectorAll("span")[1].textContent = "度";
        g2.appendChild(hk2.row); g2.appendChild(vk2.row);
        b2.appendChild(g1); b2.appendChild(g2);
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" } });
        const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
        const cancel = W95.el("button", { class: "w95btn", type: "button", text: "取消" });
        ok.addEventListener("click", () => {
          hs = parseFloat(h.inp.value) || 100;
          vs = parseFloat(v.inp.value) || 100;
          hk = parseFloat(hk2.inp.value) || 0;
          vk = parseFloat(vk2.inp.value) || 0;
          pushUndo();
          const c2 = document.createElement("canvas");
          c2.width = Math.max(1, Math.round(imgW * hs / 100));
          c2.height = Math.max(1, Math.round(imgH * vs / 100));
          const c = c2.getContext("2d");
          c.drawImage(canvas, 0, 0, c2.width, c2.height);
          c.transform(1, Math.tan(vk * Math.PI / 180), Math.tan(hk * Math.PI / 180), 1, 0, 0);
          c.drawImage(c2, 0, 0);
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, imgW, imgH);
          ctx.drawImage(c2, 0, 0);
          win2.close();
        });
        cancel.addEventListener("click", () => win2.close());
        row.appendChild(ok); row.appendChild(cancel);
        b2.appendChild(row);
      }

      function attributesDialog() {
        const win2 = W95.dlgWindow({ title: "属性", icon: "msg-paint" });
        const b2 = win2.body;
        b2.style.display = "flex"; b2.style.flexDirection = "column"; b2.style.gap = "6px";
        b2.style.minWidth = "300px";
        b2.appendChild(W95.el("div", { class: "w95label", text: "宽度: " + imgW + " 像素    高度: " + imgH + " 像素" }));
        const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" } });
        const ok = W95.el("button", { class: "w95btn default", type: "button", text: "确定" });
        ok.addEventListener("click", () => win2.close());
        row.appendChild(ok);
        b2.appendChild(row);
      }

      function openImage() {
        W95.fileDialog({ title: "打开", mode: "open", startPath: "C:/My Documents" }).then((res) => {
          if (!res) return;
          const node = W95.vfsResolve(res.path);
          if (!node) return;
          if (node.content.startsWith("data:image")) {
            const img = new Image();
            img.onload = () => {
              pushUndo();
              ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, imgW, imgH);
              ctx.drawImage(img, 0, 0);
              currentPath = res.path;
              win.setTitle("画图 - " + node.name);
            };
            img.src = node.content;
          } else if (node.content.startsWith("bmp:scenery")) {
            pushUndo();
            drawScenery();
            currentPath = res.path;
            win.setTitle("画图 - " + node.name);
          } else {
            W95.msgbox({ title: "画图", icon: "error", text: "无法打开此文件。", buttons: ["确定"] });
          }
        });
      }

      function saveImage(saveAs) {
        const doSave = (path) => {
          const dataUrl = canvas.toDataURL("image/png");
          const name = path.split("/").pop();
          W95.vfsWriteFile(path.slice(0, path.lastIndexOf("/")), name, dataUrl, "bmpfile", "image/png");
          currentPath = path;
          win.setTitle("画图 - " + name);
        };
        if (!currentPath || saveAs) {
          W95.fileDialog({
            title: "保存为", mode: "save", startPath: "C:/My Documents",
            defaultName: currentPath ? currentPath.split("/").pop() : "未命名.bmp",
          }).then((res) => {
            if (res) doSave(res.path);
          });
        } else {
          doSave(currentPath);
        }
      }

      function drawScenery() {
        // 简单风景画
        ctx.fillStyle = "#87ceeb"; ctx.fillRect(0, 0, imgW, imgH);
        ctx.fillStyle = "#228b22"; ctx.fillRect(0, imgH * 0.6, imgW, imgH * 0.4);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(480, 90, 40, 0, 7); ctx.fill();
        ctx.fillStyle = "#006400";
        for (let i = 0; i < 6; i++) {
          const x = 80 + i * 110;
          ctx.beginPath();
          ctx.moveTo(x, imgH * 0.6);
          ctx.lineTo(x + 40, imgH * 0.35);
          ctx.lineTo(x + 80, imgH * 0.6);
          ctx.fill();
        }
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(300, imgH * 0.5, 14, imgH * 0.1);
        ctx.fillStyle = "#008000";
        ctx.beginPath(); ctx.arc(307, imgH * 0.48, 30, 0, 7); ctx.fill();
      }

      win.setStatus("就绪");
      if (win.opts && win.opts.path) {
        const node = W95.vfsResolve(win.opts.path);
        if (node) {
          if (node.content.startsWith("bmp:")) drawScenery();
          else if (node.content.startsWith("data:image")) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = node.content;
          }
          win.setTitle("画图 - " + node.name);
          currentPath = win.opts.path;
        }
      }
      W95.recent.add(win.opts && win.opts.path ? win.opts.path : "C:/My Documents/未命名.bmp", win.opts && win.opts.path ? win.opts.path.split("/").pop() : "未命名.bmp");
    },
  });
})();
