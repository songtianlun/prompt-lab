/* ============================================================
   属性对话框：显示 / 任务栏 / 日期时间 / 系统 / 鼠标 / 键盘 / 声音 等
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  /* ---------- 小控件辅助 ---------- */
  function checkbox(label, checked, onChange) {
    const row = W95.el("label", { class: "w95check" });
    const cb = W95.el("input", { type: "checkbox" });
    cb.checked = !!checked;
    cb.addEventListener("change", () => onChange && onChange(cb.checked));
    row.appendChild(cb);
    row.appendChild(W95.el("span", { class: "w95label", text: label }));
    return row;
  }
  function combo(options, value, onChange, width) {
    const sel = W95.el("select", {
      class: "w95input",
      style: { minWidth: (width || 120) + "px", fontFamily: "inherit", fontSize: "11px" },
    });
    options.forEach((o) => {
      const opt = W95.el("option", { value: o[0], text: o[1] });
      sel.appendChild(opt);
    });
    if (value !== undefined) sel.value = value;
    sel.addEventListener("change", () => onChange && onChange(sel.value));
    return sel;
  }
  function slider(min, max, value, onChange) {
    const s = W95.el("input", { type: "range", min: String(min), max: String(max), value: String(value) });
    s.style.width = "120px";
    s.addEventListener("input", () => onChange && onChange(parseInt(s.value)));
    return s;
  }
  function btnRow(buttons) {
    const row = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" } });
    buttons.forEach(([label, fn, def]) => {
      const b = W95.el("button", { class: "w95btn" + (def ? " default" : ""), type: "button", text: label });
      b.addEventListener("click", fn);
      row.appendChild(b);
    });
    return row;
  }

  /* ---------- 选项卡对话框 ---------- */
  function tabDialog(opts, pages) {
    const win = W95.dlgWindow({ title: opts.title, icon: opts.icon });
    const body = win.body;
    body.style.padding = "10px";
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.minWidth = opts.width || 400;
    body.style.maxWidth = "520px";

    const tabs = W95.el("div", { class: "w95tabs" });
    const pageEls = [];
    pages.forEach((p, i) => {
      const tab = W95.el("div", { class: "w95tab" + (i === 0 ? " active" : ""), text: p.label });
      tab.addEventListener("mousedown", (e) => {
        e.preventDefault();
        showPage(i);
      });
      tabs.appendChild(tab);
      const pageEl = W95.el("div", { class: "w95tabpage" + (i === 0 ? "" : " hidden") });
      pageEl.style.display = i === 0 ? "block" : "none";
      p.build(pageEl, win);
      pageEls.push(pageEl);
      body.appendChild(pageEl);
    });
    body.insertBefore(tabs, body.firstChild);

    function showPage(i) {
      W95.$$(".w95tab", tabs).forEach((t, ti) => t.classList.toggle("active", ti === i));
      pageEls.forEach((pe, pi) => {
        pe.style.display = pi === i ? "block" : "none";
      });
    }
    return win;
  }
  W95.tabDialog = tabDialog;

  /* ================= 显示属性 ================= */
  function displayProps() {
    const pages = [];
    const wallpapers = [
      ["none", "无"], ["clouds", "蓝天白云"], ["bubbles", "气泡"], ["setup", "安装程序"],
      ["tiles", "平铺图案"], ["stitched", "针线"],
    ];
    const tiles = [["center", "居中"], ["tile", "平铺"], ["stretch", "拉伸"]];

    // 背景
    pages.push({
      label: "背景", build(page) {
        const row = W95.el("div", { style: { display: "flex", gap: "12px" } });
        // 预览
        const preview = W95.el("div", {
          style: {
            width: "130px", height: "100px", border: "1px solid #000",
            background: "#008080", position: "relative", flex: "0 0 auto",
          },
        });
        const scr = W95.el("div", {
          style: { position: "absolute", inset: "4px", border: "2px solid #c0c0c0", overflow: "hidden" },
        });
        preview.appendChild(scr);
        row.appendChild(preview);
        // 选择区
        const selCol = W95.el("div", { style: { flex: "1", display: "flex", flexDirection: "column", gap: "6px" } });
        selCol.appendChild(W95.el("div", { class: "w95label", text: "墙纸(W):" }));
        const wpList = W95.el("div", {
          class: "w95field", style: { padding: "0", overflow: "auto", height: "70px", display: "block" },
        });
        wallpapers.forEach(([id, name]) => {
          const item = W95.el("div", {
            style: { padding: "2px 6px", cursor: "default" },
            text: name,
          });
          if (id === W95.appearance.wallpaper) {
            item.style.background = "#000080";
            item.style.color = "#fff";
          }
          item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            Array.from(wpList.children).forEach((x) => { x.style.background = ""; x.style.color = ""; });
            item.style.background = "#000080";
            item.style.color = "#fff";
            W95.appearance.wallpaper = id;
            renderPreview();
          });
          wpList.appendChild(item);
        });
        selCol.appendChild(wpList);
        const tileRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px" } });
        tileRow.appendChild(W95.el("span", { class: "w95label", text: "显示方式:" }));
        const tileSel = combo(tiles, W95.appearance.tile, (v) => {
          W95.appearance.tile = v;
          renderPreview();
        });
        tileRow.appendChild(tileSel);
        selCol.appendChild(tileRow);
        row.appendChild(selCol);
        page.appendChild(row);
        function renderPreview() {
          scr.innerHTML = "";
          const name = W95.appearance.wallpaper;
          const def = W95.WALLPAPERS[name];
          if (!def) { scr.style.background = "#008080"; return; }
          const cv = W95.el("canvas", { width: 120, height: 80 });
          const ctx = cv.getContext("2d");
          def.draw(ctx, 120, 80);
          scr.appendChild(cv);
          scr.style.background = "#008080";
        }
        renderPreview();
        page.appendChild(btnRow([
          ["确定", () => { W95.applyWallpaper(); closeAll(); }, true],
          ["取消", closeAll],
          ["应用(A)", () => W95.applyWallpaper()],
        ]));
        function closeAll() { W95.$$(".dlgwin").forEach((w) => w.remove()); }
      },
    });

    // 屏幕保护程序
    pages.push({
      label: "屏幕保护程序", build(page) {
        const savers = [["none", "无"], ["lines", "变幻线"], ["stars", "星空"], ["marquee", "字幕"]];
        const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
        row.appendChild(W95.el("span", { class: "w95label", text: "屏幕保护程序(S):" }));
        const sel = combo(savers, W95.appearance.screenSaver, (v) => { W95.appearance.screenSaver = v; });
        row.appendChild(sel);
        row.appendChild(W95.el("button", {
          class: "w95btn", type: "button", text: "设置(T)...",
          style: { minWidth: "70px" },
        }));
        page.appendChild(row);
        const waitRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" } });
        waitRow.appendChild(W95.el("span", { class: "w95label", text: "等待(W):" }));
        const waitInput = W95.el("input", { class: "w95input", type: "text", value: String(W95.appearance.saverWait || 10), style: { width: "40px" } });
        waitRow.appendChild(waitInput);
        waitRow.appendChild(W95.el("span", { class: "w95label", text: "分钟" }));
        page.appendChild(waitRow);
        const prevRow = W95.el("div", { style: { display: "flex", gap: "8px", marginTop: "10px" } });
        const previewBtn = W95.el("button", { class: "w95btn", type: "button", text: "预览(V)" });
        previewBtn.addEventListener("click", () => {
          W95.appearance.saverWait = parseInt(waitInput.value) || 10;
          W95.appearance.screenSaver = sel.value;
          W95.activateScreensaver(true);
        });
        prevRow.appendChild(previewBtn);
        page.appendChild(prevRow);
        page.appendChild(btnRow([
          ["确定", () => {
            W95.appearance.saverWait = parseInt(waitInput.value) || 10;
            W95.appearance.screenSaver = sel.value;
            W95.$$(".dlgwin").forEach((w) => w.remove());
          }, true],
          ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
        ]));
      },
    });

    // 外观
    pages.push({
      label: "外观", build(page) {
        const schemes = [
          ["standard", "Windows 标准"], ["standard-large", "Windows 标准(大)"],
          ["high-contrast-black", "高对比度 黑"], ["high-contrast-white", "高对比度 白"],
          ["high-contrast-green", "高对比度 绿"], ["plum", "梅紫色"],
          ["rose", "玫瑰红"], ["storm", "暴风雨"],
        ];
        const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
        row.appendChild(W95.el("span", { class: "w95label", text: "方案(S):" }));
        const sel = combo(schemes, W95.appearance.scheme, () => {
          // 预览不立即应用，仅示例
        });
        row.appendChild(sel);
        page.appendChild(row);

        // 预览窗口
        const prev = W95.el("div", {
          style: {
            marginTop: "10px", border: "1px solid #000", background: "#008080",
            padding: "16px", display: "flex", justifyContent: "center",
          },
        });
        const sample = W95.el("div", { style: { width: "260px" } });
        sample.innerHTML =
          '<div style="background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:bold;padding:3px 6px;font-size:11px">活动窗口</div>' +
          '<div style="background:#c0c0c0;border:1px solid #808080;padding:8px;font-size:11px">' +
          '<div style="color:#000">窗口文字</div>' +
          '<button style="background:#c0c0c0;box-shadow:inset -1px -1px 0 #0a0a0a,inset 1px 1px 0 #fff;border:0;padding:2px 10px;margin-top:6px">确定</button>' +
          "</div>";
        prev.appendChild(sample);
        page.appendChild(prev);

        sel.addEventListener("change", () => {
          const s = sel.value;
          const vars = {
            "high-contrast-black": ["#000000", "#ffffff"],
            "high-contrast-white": ["#ffffff", "#000000"],
            "high-contrast-green": ["#008000", "#ffffff"],
            plum: ["#800080", "#ffffff"], rose: ["#800000", "#ffffff"],
            storm: ["#404040", "#ffffff"],
          }[s] || ["#000080", "#1084d0"];
          sample.querySelector("div").style.background = "linear-gradient(90deg," + vars[0] + "," + vars[1] + ")";
        });

        page.appendChild(btnRow([
          ["确定", () => { W95.appearance.scheme = sel.value; W95.$$(".dlgwin").forEach((w) => w.remove()); }, true],
          ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ["应用(A)", () => { W95.appearance.scheme = sel.value; }],
        ]));
      },
    });

    // 设置
    pages.push({
      label: "设置", build(page) {
        const resRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" } });
        resRow.appendChild(W95.el("span", { class: "w95label", text: "桌面区域(D):" }));
        const resSel = combo([
          ["640x480", "640 × 480 像素"], ["800x600", "800 × 600 像素"], ["1024x768", "1024 × 768 像素"],
        ], W95.appearance.resolution);
        resRow.appendChild(resSel);
        resRow.appendChild(W95.el("span", { class: "w95label", text: "（缩放模拟）" }));
        page.appendChild(resRow);
        const colRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" } });
        colRow.appendChild(W95.el("span", { class: "w95label", text: "调色板(C):" }));
        const colSel = combo([["256", "256 色"]], "256");
        colRow.appendChild(colSel);
        page.appendChild(colRow);
        page.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "12px", color: "#404040" }, text: "更改分辨率后，屏幕将缩放模拟（缩放不影响窗口逻辑坐标）。" }));
        page.appendChild(btnRow([
          ["确定", () => {
            W95.appearance.resolution = resSel.value;
            W95.applyResolution();
            W95.$$(".dlgwin").forEach((w) => w.remove());
          }, true],
          ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
        ]));
      },
    });

    tabDialog({ title: "显示器 属性", icon: "msg-display" }, pages);
  }

  /* ================= 任务栏属性 ================= */
  function taskbarProps() {
    tabDialog({ title: "任务栏 属性", icon: "msg-taskbar" }, [
      {
        label: "任务栏选项", build(page) {
          page.appendChild(checkbox("总在最前(T)", true, (v) => {
            W95.store.set("taskbar-top", v);
            const tb = W95.$("#taskbar");
            if (tb) tb.style.zIndex = v ? "2000" : "1500";
          }));
          page.appendChild(checkbox("自动隐藏(U)", W95.store.get("taskbar-hide", false), (v) => {
            W95.store.set("taskbar-hide", v);
            const tb = W95.$("#taskbar");
            if (tb) tb.classList.toggle("taskbar-hidden", v);
          }));
          page.appendChild(checkbox("在“开始”菜单中显示小图标(S)", false));
          page.appendChild(checkbox("显示时钟(C)", true, (v) => {
            W95.store.set("taskbar-clock", v);
            const c = W95.$("#tray-clock");
            if (c) c.style.display = v ? "" : "none";
          }));
          // 预览
          const prev = W95.el("div", {
            style: { marginTop: "12px", border: "1px solid #000", padding: "8px", background: "#008080" },
          });
          prev.innerHTML =
            '<div style="background:#c0c0c0;border:1px solid #000;display:flex;align-items:center;gap:4px;padding:2px">' +
            '<span style="background:#c0c0c0;box-shadow:inset -1px -1px 0 #0a0a0a,inset 1px 1px 0 #fff;font-weight:bold;font-size:10px;padding:2px 6px">开始</span>' +
            '<span style="background:#c0c0c0;box-shadow:inset -1px -1px 0 #0a0a0a,inset 1px 1px 0 #fff;font-size:10px;padding:2px 8px;flex:1">文档 - 记事本</span>' +
            '<span style="font-size:9px;padding-right:4px">14:28</span>' +
            "</div>";
          page.appendChild(prev);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "开始菜单程序", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "自定义开始菜单:" }));
          const row = W95.el("div", { style: { display: "flex", gap: "6px", margin: "6px 0" } });
          const addB = W95.el("button", { class: "w95btn", type: "button", text: "添加(A)..." });
          addB.addEventListener("click", () => W95.runDialog());
          const delB = W95.el("button", { class: "w95btn", type: "button", text: "删除(R)..." });
          delB.addEventListener("click", () => W95.msgbox({ title: "任务栏属性", icon: "info", text: "（模拟）请从开始菜单中删除项目。", buttons: ["确定"] }));
          const advB = W95.el("button", { class: "w95btn", type: "button", text: "高级(D)..." });
          advB.addEventListener("click", () => W95.openApp("explorer", { path: "C:/Program Files" }));
          row.appendChild(addB); row.appendChild(delB); row.appendChild(advB);
          page.appendChild(row);
          page.appendChild(W95.el("div", { class: "w95label", text: "文档菜单:" }));
          const clearB = W95.el("button", {
            class: "w95btn", type: "button", text: "清除(C)",
            style: { marginTop: "6px" },
          });
          clearB.addEventListener("click", () => {
            W95.recent.clear();
            W95.msgbox({ title: "任务栏属性", icon: "info", text: "文档菜单已清空。", buttons: ["确定"] });
          });
          page.appendChild(clearB);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 日期/时间 ================= */
  function datetimeProps() {
    const now = new Date();
    let view = new Date(now.getFullYear(), now.getMonth(), 1);
    let selDate = now.getDate();

    const win = tabDialog({ title: "日期/时间 属性", icon: "msg-datetime" }, [
      {
        label: "日期和时间", build(page) {
          const row = W95.el("div", { style: { display: "flex", gap: "16px" } });
          // 日历
          const calCol = W95.el("div", { style: { flex: "1" } });
          const calHead = W95.el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } });
          const monthLabel = W95.el("span", { class: "w95label", style: { fontWeight: "bold", fontSize: "12px" } });
          const prevB = W95.el("button", { class: "w95btn", type: "button", text: "◀", style: { minWidth: "24px", padding: "0 4px" } });
          const nextB = W95.el("button", { class: "w95btn", type: "button", text: "▶", style: { minWidth: "24px", padding: "0 4px" } });
          calHead.appendChild(prevB);
          calHead.appendChild(monthLabel);
          calHead.appendChild(nextB);
          calCol.appendChild(calHead);
          const grid = W95.el("div", {
            style: {
              display: "grid", gridTemplateColumns: "repeat(7, 24px)", gap: "1px",
              marginTop: "4px",
            },
          });
          ["日", "一", "二", "三", "四", "五", "六"].forEach((d) => {
            grid.appendChild(W95.el("div", { text: d, style: { textAlign: "center", fontSize: "10px", color: "#404040" } }));
          });
          calCol.appendChild(grid);
          page.appendChild(calCol);

          // 时钟
          const clockCol = W95.el("div", { style: { flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" } });
          const clockSvg = W95.el("div", { style: { width: "110px", height: "110px" } });
          clockCol.appendChild(clockSvg);
          const timeLabel = W95.el("div", { class: "w95label" });
          clockCol.appendChild(timeLabel);
          page.appendChild(clockCol);
          page.appendChild(row);

          function renderCalendar() {
            grid.querySelectorAll(".cal-day").forEach((x) => x.remove());
            monthLabel.textContent = view.getFullYear() + "年" + (view.getMonth() + 1) + "月";
            const first = new Date(view.getFullYear(), view.getMonth(), 1);
            const startDow = (first.getDay() + 6) % 7; // 周一开头
            const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
            for (let i = 0; i < startDow; i++) {
              grid.appendChild(W95.el("div", { class: "cal-day" }));
            }
            for (let d = 1; d <= days; d++) {
              const cell = W95.el("div", {
                class: "cal-day",
                text: String(d),
                style: {
                  textAlign: "center", fontSize: "11px", padding: "2px 0",
                  cursor: "default", border: "1px solid transparent",
                },
              });
              if (d === selDate && view.getMonth() === now.getMonth() && view.getFullYear() === now.getFullYear()) {
                cell.style.background = "#000080";
                cell.style.color = "#fff";
              }
              cell.addEventListener("mousedown", (e) => {
                e.preventDefault();
                selDate = d;
                renderCalendar();
              });
              grid.appendChild(cell);
            }
          }
          function renderClock() {
            const d = new Date();
            const h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
            const ha = (h * 30 + m * 0.5 - 90) * Math.PI / 180;
            const ma = (m * 6 + s * 0.1 - 90) * Math.PI / 180;
            const sa = (s * 6 - 90) * Math.PI / 180;
            const hx = 55 + 26 * Math.cos(ha), hy = 55 + 26 * Math.sin(ha);
            const mx = 55 + 38 * Math.cos(ma), my = 55 + 38 * Math.sin(ma);
            const sx = 55 + 42 * Math.cos(sa), sy = 55 + 42 * Math.sin(sa);
            clockSvg.innerHTML =
              '<svg width="110" height="110" viewBox="0 0 110 110">' +
              '<circle cx="55" cy="55" r="50" fill="#fff" stroke="#000" stroke-width="2"/>' +
              [0, 90, 180, 270].map((a) => {
                const r = a * Math.PI / 180;
                return '<line x1="' + (55 + 46 * Math.cos(r)) + '" y1="' + (55 + 46 * Math.sin(r)) + '" x2="' + (55 + 42 * Math.cos(r)) + '" y2="' + (55 + 42 * Math.sin(r)) + '" stroke="#000" stroke-width="2"/>';
              }).join("") +
              '<line x1="55" y1="55" x2="' + hx + '" y2="' + hy + '" stroke="#000" stroke-width="4" stroke-linecap="round"/>' +
              '<line x1="55" y1="55" x2="' + mx + '" y2="' + my + '" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>' +
              '<line x1="55" y1="55" x2="' + sx + '" y2="' + sy + '" stroke="#ff0000" stroke-width="1" stroke-linecap="round"/>' +
              '<circle cx="55" cy="55" r="2" fill="#000"/>' +
              "</svg>";
            timeLabel.textContent = d.toLocaleTimeString("zh-CN", { hour12: false });
          }
          prevB.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCalendar(); });
          nextB.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCalendar(); });
          renderCalendar();
          renderClock();
          setInterval(renderClock, 1000);

          const tzRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" } });
          tzRow.appendChild(W95.el("span", { class: "w95label", text: "时区:" }));
          tzRow.appendChild(combo([["china", "(GMT+08:00) 北京，重庆，香港特别行政区，乌鲁木齐"]], "china", null, 260));
          page.appendChild(tzRow);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 系统属性 ================= */
  function systemProps() {
    tabDialog({ title: "系统 属性", icon: "msg-system" }, [
      {
        label: "常规", build(page) {
          const box = W95.el("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" } });
          box.innerHTML =
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
            '<span style="width:32px;height:32px">' + W95.icon("computer", 32) + "</span>" +
            '<span style="font-size:20px;font-weight:bold">Microsoft Windows 95</span>' +
            "</div>";
          box.appendChild(W95.el("div", { class: "w95label", text: "4.00.950" }));
          box.appendChild(W95.el("div", { class: "w95label", text: "Copyright © Microsoft Corporation 1981-1995" }));
          box.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "10px" }, text: "注册为:" }));
          box.appendChild(W95.el("div", { class: "w95label", text: "用户" }));
          box.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "10px" }, text: "计算机:" }));
          box.appendChild(W95.el("div", { class: "w95label", text: "Pentium(r) 133MHz" }));
          box.appendChild(W95.el("div", { class: "w95label", text: "16.0MB RAM" }));
          page.appendChild(box);
          page.appendChild(btnRow([["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true]]));
        },
      },
      {
        label: "设备管理器", build(page) {
          const tree = W95.el("div", {
            class: "w95field", style: {
              padding: "6px", overflow: "auto", height: "170px",
              background: "#fff", display: "block",
            },
          });
          const devs = [
            ["计算机", "computer", ["ACPI BIOS", "高级电源管理"]],
            ["键盘", "keyboard", ["标准 101/102 键或 Microsoft 自然键盘"]],
            ["鼠标", "mouse", ["标准 PS/2 鼠标"]],
            ["磁盘驱动器", "drive", ["GENERIC IDE DISK TYPE47"]],
            ["显示适配器", "display", ["标准 PCI 显示适配器(VGA)"]],
            ["监视器", "display", ["即插即用监视器"]],
            ["硬盘控制器", "drive", ["Intel 82371AB PCI Bus Master IDE Controller"]],
            ["软盘控制器", "floppy", ["标准软盘控制器"]],
            ["端口", "computer", ["通讯端口 (COM1)", "打印机端口 (LPT1)"]],
            ["声音、视频和游戏控制器", "speaker", ["ESS AudioDrive ES1868"]],
            ["系统设备", "computer", ["Direct Memory Access Controller", "即插即用 BIOS", "系统计时器"]],
          ];
          devs.forEach(([name, icon, kids]) => {
            const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" } });
            row.innerHTML = '<span style="font-size:8px">▸</span><span style="width:16px;height:16px">' + W95.icon(icon, 16) + "</span><span>" + name + "</span>";
            tree.appendChild(row);
            kids.forEach((k) => {
              const sub = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "4px", marginLeft: "22px", whiteSpace: "nowrap" } });
              sub.innerHTML = '<span style="width:12px"></span><span style="font-size:10px">' + k + "</span>";
              tree.appendChild(sub);
            });
          });
          page.appendChild(tree);
          const btnCol = W95.el("div", { style: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" } });
          btnCol.appendChild(W95.el("button", {
            class: "w95btn", type: "button", text: "属性(R)",
            style: { alignSelf: "flex-start" },
          }));
          page.appendChild(btnCol);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "性能", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", style: { fontWeight: "bold" }, text: "性能状态:" }));
          page.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "6px" }, text: "内存:  16.0 MB RAM" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "系统资源:  89% 可用" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "文件系统:  32 位" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "虚拟内存:  32 位" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "磁盘压缩:  未安装" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "PC 卡 (PCMCIA):  未安装 PCMCIA 插槽" }));
          const row = W95.el("div", { style: { display: "flex", gap: "6px", marginTop: "10px" } });
          [["文件系统(F)...", "文件系统属性（模拟）"], ["图形(G)...", "图形属性（模拟）"], ["虚拟内存(V)...", "虚拟内存（模拟）"]].forEach(([label, msg]) => {
            const b = W95.el("button", { class: "w95btn", type: "button", text: label });
            b.addEventListener("click", () => W95.msgbox({ title: "系统属性", icon: "info", text: msg, buttons: ["确定"] }));
            row.appendChild(b);
          });
          page.appendChild(row);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 鼠标属性 ================= */
  function mouseProps() {
    tabDialog({ title: "鼠标 属性", icon: "msg-mouse" }, [
      {
        label: "按钮", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "按钮配置(S):" }));
          const row = W95.el("label", { class: "w95radio" });
          const rb = W95.el("input", { type: "radio", name: "mousebtn", checked: true });
          row.appendChild(rb);
          row.appendChild(W95.el("span", { class: "w95label", text: "右手习惯" }));
          page.appendChild(row);
          page.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "10px" }, text: "双击速度(D):" }));
          const spd = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
          spd.appendChild(W95.el("span", { class: "w95label", text: "慢" }));
          spd.appendChild(slider(0, 100, 60));
          spd.appendChild(W95.el("span", { class: "w95label", text: "快" }));
          page.appendChild(spd);
          const test = W95.el("div", {
            style: {
              marginTop: "10px", width: "70px", height: "50px",
              border: "2px solid #808080", background: "#c0c0c0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Wingdings','Courier New',serif", fontSize: "20px",
            },
            text: "🏠",
          });
          test.addEventListener("dblclick", () => {
            test.style.background = "#000080";
            setTimeout(() => (test.style.background = "#c0c0c0"), 300);
          });
          page.appendChild(test);
          page.appendChild(W95.el("div", { class: "w95label", style: { marginTop: "6px" }, text: "双击此处测试:" }));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "指针", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "方案(S):" }));
          page.appendChild(combo([["win", "Windows 标准"], ["none", "无"]], "win", null, 200));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "移动", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "指针速度(P):" }));
          const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
          row.appendChild(W95.el("span", { class: "w95label", text: "慢" }));
          row.appendChild(slider(0, 100, 50, (v) => {
            // 指针加速（模拟）
            document.body.style.cursor = v > 70 ? "crosshair" : "default";
            setTimeout(() => (document.body.style.cursor = ""), 800);
          }));
          row.appendChild(W95.el("span", { class: "w95label", text: "快" }));
          page.appendChild(row);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 键盘属性 ================= */
  function keyboardProps() {
    tabDialog({ title: "键盘 属性", icon: "msg-keyboard" }, [
      {
        label: "速度", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "字符重复:" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "重复延迟(D):", style: { marginTop: "6px" } }));
          const r1 = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
          r1.appendChild(W95.el("span", { class: "w95label", text: "长" }));
          r1.appendChild(slider(0, 100, 30));
          r1.appendChild(W95.el("span", { class: "w95label", text: "短" }));
          page.appendChild(r1);
          page.appendChild(W95.el("div", { class: "w95label", text: "重复率(R):", style: { marginTop: "6px" } }));
          const r2 = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
          r2.appendChild(W95.el("span", { class: "w95label", text: "慢" }));
          r2.appendChild(slider(0, 100, 60));
          r2.appendChild(W95.el("span", { class: "w95label", text: "快" }));
          page.appendChild(r2);
          page.appendChild(W95.el("div", { class: "w95label", text: "请在此处测试:", style: { marginTop: "10px" } }));
          const test = W95.el("input", { class: "w95input", type: "text", style: { width: "100%", marginTop: "4px" } });
          page.appendChild(test);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "语言", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "语言(L):" }));
          page.appendChild(W95.el("div", {
            class: "w95field", style: { marginTop: "4px", display: "flex", justifyContent: "space-between" },
            html: '<span>中文(中国)</span><span>▼</span>',
          }));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 声音属性 ================= */
  function soundsProps() {
    tabDialog({ title: "声音 属性", icon: "msg-speaker" }, [
      {
        label: "声音", build(page) {
          const en = checkbox("启用系统声音", W95.sound.enabled, (v) => {
            W95.appearance.soundEnabled = v;
          });
          page.appendChild(en);
          page.appendChild(W95.el("div", { class: "w95label", text: "事件(E):", style: { marginTop: "8px" } }));
          const list = W95.el("div", {
            class: "w95field", style: { padding: "0", overflow: "auto", height: "140px", display: "block", marginTop: "4px" },
          });
          const events = [
            ["startup", "启动 Windows"], ["shutdown", "退出 Windows"], ["error", "错误"],
            ["warning", "警告"], ["info", "信息"], ["question", "问题"],
          ];
          events.forEach(([id, name]) => {
            const item = W95.el("div", { style: { padding: "2px 8px", cursor: "default" }, text: name });
            item.addEventListener("mousedown", (e) => {
              e.preventDefault();
              W95.$$("div", list).forEach((x) => { x.style.background = ""; x.style.color = ""; });
              item.style.background = "#000080";
              item.style.color = "#fff";
            });
            item.addEventListener("dblclick", () => W95.sound.play(id));
            list.appendChild(item);
          });
          page.appendChild(list);
          const row = W95.el("div", { style: { display: "flex", gap: "6px", marginTop: "8px" } });
          const prev = W95.el("button", { class: "w95btn", type: "button", text: "预览(P)" });
          prev.addEventListener("click", () => W95.sound.play("ding"));
          row.appendChild(prev);
          page.appendChild(row);
          page.appendChild(btnRow([
            ["确定", () => { W95.applyDesktopSettings(); W95.$$(".dlgwin").forEach((w) => w.remove()); }, true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 添加/删除程序 ================= */
  function addRemoveProps() {
    tabDialog({ title: "添加/删除程序 属性", icon: "msg-addremove" }, [
      {
        label: "安装/卸载", build(page) {
          const list = W95.el("div", {
            class: "w95field", style: { padding: "0", overflow: "auto", height: "150px", display: "block" },
          });
          const progs = ["记事本 4.0", "画图 4.0", "计算器 4.0", "扫雷 3.1", "纸牌 4.0"];
          progs.forEach((p) => {
            const item = W95.el("div", { style: { padding: "3px 8px", cursor: "default" }, text: p });
            item.addEventListener("mousedown", (e) => {
              e.preventDefault();
              W95.$$("div", list).forEach((x) => { x.style.background = ""; x.style.color = ""; });
              item.style.background = "#000080";
              item.style.color = "#fff";
            });
            list.appendChild(item);
          });
          page.appendChild(list);
          const rm = W95.el("button", { class: "w95btn", type: "button", text: "添加/删除(R)...", style: { marginTop: "8px" } });
          rm.addEventListener("click", async () => {
            const r = await W95.msgbox({
              title: "添加/删除程序", icon: "question",
              text: "确实要卸载选定的程序吗？",
              buttons: ["是(Y)", "否(N)"],
            });
            if (r === "是(Y)") W95.msgbox({ title: "添加/删除程序", icon: "info", text: "（模拟）卸载完成。", buttons: ["确定"] });
          });
          page.appendChild(rm);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "安装 Windows", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "要添加或删除组件，请单击复选框。" }));
          const comps = [
            ["附件", "6.0 MB"], ["通讯", "0.7 MB"], ["磁盘工具", "0.3 MB"],
            ["多媒体", "1.2 MB"], ["游戏", "0.4 MB"], ["辅助选项", "0.4 MB"],
          ];
          comps.forEach(([name, size]) => {
            page.appendChild(checkbox(name + " (" + size + ")", name === "附件" || name === "游戏"));
          });
          const install = W95.el("button", { class: "w95btn", type: "button", text: "从磁盘安装(H)...", style: { marginTop: "8px" } });
          install.addEventListener("click", () => W95.msgbox({ title: "添加/删除程序", icon: "info", text: "请插入安装盘。", buttons: ["确定"] }));
          page.appendChild(install);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 字体 / 网络 / 区域 / 多媒体 ================= */
  function fontsProps() {
    const win = W95.dlgWindow({ title: "字体", icon: "msg-fonts" });
    const b = win.body;
    b.style.display = "flex"; b.style.flexDirection = "column"; b.style.gap = "8px";
    b.style.minWidth = "320px";
    const list = W95.el("div", {
      class: "w95field", style: { padding: "0", overflow: "auto", height: "160px", display: "block" },
    });
    ["Arial", "Courier New", "MS Sans Serif", "Times New Roman", "宋体", "黑体", "楷体"].forEach((f) => {
      const item = W95.el("div", { style: { padding: "3px 8px" }, text: f });
      list.appendChild(item);
    });
    b.appendChild(list);
    const row = W95.el("div", { style: { display: "flex", gap: "6px" } });
    const add = W95.el("button", { class: "w95btn", type: "button", text: "添加(A)..." });
    add.addEventListener("click", () => W95.msgbox({ title: "字体", icon: "info", text: "（模拟）请插入字体盘。", buttons: ["确定"] }));
    const del = W95.el("button", { class: "w95btn", type: "button", text: "删除(R)" });
    del.addEventListener("click", () => W95.msgbox({ title: "字体", icon: "warning", text: "删除字体可能影响显示。", buttons: ["确定"] }));
    row.appendChild(add); row.appendChild(del);
    b.appendChild(row);
    b.appendChild(btnRow([["确定", () => win.close(), true]]));
  }

  function networkProps() {
    tabDialog({ title: "网络", icon: "msg-network" }, [
      {
        label: "标识", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "Windows 使用以下信息在网络上标识您的计算机。请输入计算机名称、工作组和说明。" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "计算机名称(C):", style: { marginTop: "10px" } }));
          page.appendChild(W95.el("input", { class: "w95input", type: "text", value: "USER", style: { width: "100%" } }));
          page.appendChild(W95.el("div", { class: "w95label", text: "工作组(W):", style: { marginTop: "8px" } }));
          page.appendChild(W95.el("input", { class: "w95input", type: "text", value: "WORKGROUP", style: { width: "100%" } }));
          page.appendChild(W95.el("div", { class: "w95label", text: "计算机说明(D):", style: { marginTop: "8px" } }));
          page.appendChild(W95.el("input", { class: "w95input", type: "text", value: "Windows 95 网页模拟器", style: { width: "100%" } }));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "配置", build(page) {
          const list = W95.el("div", {
            class: "w95field", style: { padding: "0", overflow: "auto", height: "120px", display: "block" },
          });
          ["Client for Microsoft Networks", "Dial-Up Adapter", "IPX/SPX 兼容协议", "NetBEUI", "TCP/IP"].forEach((c) => {
            const item = W95.el("div", { style: { padding: "3px 8px" }, text: c });
            list.appendChild(item);
          });
          page.appendChild(list);
          const row = W95.el("div", { style: { display: "flex", gap: "6px", marginTop: "8px" } });
          const add = W95.el("button", { class: "w95btn", type: "button", text: "添加(A)..." });
          add.addEventListener("click", () => W95.msgbox({ title: "网络", icon: "info", text: "（模拟）请选择网络组件类型。", buttons: ["确定"] }));
          const del = W95.el("button", { class: "w95btn", type: "button", text: "删除(R)" });
          del.addEventListener("click", () => W95.msgbox({ title: "网络", icon: "info", text: "（模拟）已删除所选组件。", buttons: ["确定"] }));
          row.appendChild(add); row.appendChild(del);
          page.appendChild(row);
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  function regionalProps() {
    tabDialog({ title: "区域设置 属性", icon: "msg-regional" }, [
      {
        label: "区域设置", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "很多程序支持多种语言的字符集和排序规则。更改系统区域设置会影响这些程序。" }));
          page.appendChild(W95.el("div", { class: "w95label", text: "区域设置(L):", style: { marginTop: "10px" } }));
          page.appendChild(combo([["zh", "中文（中国）"]], "zh", null, 240));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "数字", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "外观示例:" }));
          page.appendChild(W95.el("div", {
            class: "w95field", style: { marginTop: "4px", justifyContent: "center" }, text: "123,456,789.00",
          }));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "货币", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "外观示例:" }));
          page.appendChild(W95.el("div", { class: "w95field", style: { marginTop: "4px", justifyContent: "center" }, text: "¥123,456,789.00" }));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "时间", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "时间样式(T):" }));
          page.appendChild(combo([["HH:mm:ss", "13:30:45"], ["H:mm:ss", "1:30:45"]], "HH:mm:ss", null, 200));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "日期", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "短日期样式(S):" }));
          page.appendChild(combo([["yy-M-d", "95-8-24"], ["yyyy-M-d", "1995-8-24"]], "yy-M-d", null, 200));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  function multimediaProps() {
    tabDialog({ title: "多媒体 属性", icon: "msg-multimedia" }, [
      {
        label: "音频", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "音量(V):" }));
          const row = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
          row.appendChild(W95.el("span", { text: "🔇" }));
          row.appendChild(slider(0, 100, 70, (v) => { W95.sound.volume = v / 100; }));
          row.appendChild(W95.el("span", { text: "🔊" }));
          page.appendChild(row);
          page.appendChild(W95.el("div", { class: "w95label", text: "首选设备(P):", style: { marginTop: "10px" } }));
          page.appendChild(combo([["sb", "ESS AudioDrive (SB16 compatible)"]], "sb", null, 240));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "视频", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "显示视频窗口方式:" }));
          page.appendChild(combo([["full", "全屏"], ["window", "窗口"], ["max", "最大化"]], "window", null, 200));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
      {
        label: "MIDI", build(page) {
          page.appendChild(W95.el("div", { class: "w95label", text: "MIDI 乐器(E):" }));
          page.appendChild(combo([["gm", "General MIDI"]], "gm", null, 200));
          page.appendChild(btnRow([
            ["确定", () => W95.$$(".dlgwin").forEach((w) => w.remove()), true],
            ["取消", () => W95.$$(".dlgwin").forEach((w) => w.remove())],
          ]));
        },
      },
    ]);
  }

  /* ================= 屏幕保护程序 ================= */
  W95.activateScreensaver = function (force) {
    const saver = W95.appearance.screenSaver;
    if (saver === "none" || W95.screensaverActive) return;
    if (!force && (W95.WM.windows.length || W95.$$(".dlgwin").length)) return;
    W95.screensaverActive = true;
    const ov = W95.el("div", {
      style: {
        position: "fixed", inset: "0", zIndex: "9700", background: "#000",
        cursor: "none", overflow: "hidden",
      },
    });
    document.body.appendChild(ov);
    if (saver === "lines") {
      const ctx = W95.el("canvas", { width: window.innerWidth, height: window.innerHeight });
      ctx.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      ov.appendChild(ctx);
      const c2 = ctx.getContext("2d");
      let pts = [];
      for (let i = 0; i < 30; i++) pts.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, c: `hsl(${Math.floor(Math.random() * 360)},100%,60%)` });
      const iv = setInterval(() => {
        c2.fillStyle = "rgba(0,0,0,0.15)";
        c2.fillRect(0, 0, window.innerWidth, window.innerHeight);
        c2.lineWidth = 1.5;
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
          if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
          c2.strokeStyle = p.c;
          c2.beginPath();
          c2.moveTo(p.x, p.y);
          c2.lineTo(p.x - p.vx * 8, p.y - p.vy * 8);
          c2.stroke();
        }
      }, 40);
      ov._iv = iv;
    } else if (saver === "stars") {
      const ctx = W95.el("canvas", { width: window.innerWidth, height: window.innerHeight });
      ctx.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      ov.appendChild(ctx);
      const c2 = ctx.getContext("2d");
      const stars = [];
      for (let i = 0; i < 200; i++) stars.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, z: Math.random() });
      const iv = setInterval(() => {
        c2.fillStyle = "#000";
        c2.fillRect(0, 0, window.innerWidth, window.innerHeight);
        for (const s of stars) {
          s.z -= 0.005;
          if (s.z <= 0) { s.z = 1; s.x = Math.random() * window.innerWidth; s.y = Math.random() * window.innerHeight; }
          const size = (1 - s.z) * 3;
          c2.fillStyle = "#fff";
          c2.fillRect(s.x, s.y, size, size);
        }
      }, 40);
      ov._iv = iv;
    } else if (saver === "marquee") {
      const text = W95.store.get("marquee-text", "欢迎使用 Windows 95 屏幕保护程序");
      const t = W95.el("div", {
        style: {
          position: "absolute", whiteSpace: "nowrap", fontSize: "48px",
          color: "#00ff00", fontFamily: "'Courier New',monospace",
          top: "50%",
        },
        text: text,
      });
      ov.appendChild(t);
      let x = window.innerWidth;
      const iv = setInterval(() => {
        x -= 3;
        if (x < -600) x = window.innerWidth;
        t.style.left = x + "px";
      }, 20);
      ov._iv = iv;
    }
    const wake = () => {
      if (ov._iv) clearInterval(ov._iv);
      ov.remove();
      W95.screensaverActive = false;
      document.removeEventListener("mousedown", wake);
      document.removeEventListener("mousemove", wake);
      document.removeEventListener("keydown", wake);
    };
    setTimeout(() => {
      document.addEventListener("mousedown", wake);
      document.addEventListener("mousemove", wake);
      document.addEventListener("keydown", wake);
    }, 300);
  };

  // 空闲检测
  let idleTimer = null;
  function resetIdle() {
    clearTimeout(idleTimer);
    const wait = (W95.appearance.saverWait || 10) * 60 * 1000;
    idleTimer = setTimeout(() => W95.activateScreensaver(false), wait);
  }
  W95.initScreensaver = function () {
    ["mousemove", "mousedown", "keydown"].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();
  };

  /* ================= 注册 ================= */
  W95.registerApp("props", {
    title: "属性",
    icon: "cpl",
    width: 480,
    height: 380,
    create(win) {
      const page = (win.opts && win.opts.page) || "display";
      const fns = {
        display: displayProps,
        taskbar: taskbarProps,
        datetime: datetimeProps,
        system: systemProps,
        mouse: mouseProps,
        keyboard: keyboardProps,
        sounds: soundsProps,
        addremove: addRemoveProps,
        fonts: fontsProps,
        network: networkProps,
        regional: regionalProps,
        multimedia: multimediaProps,
      };
      (fns[page] || displayProps)();
      // props 直接打开对话框，不保留空窗口（同步关闭避免闪烁）
      win.close();
    },
  });
})();
