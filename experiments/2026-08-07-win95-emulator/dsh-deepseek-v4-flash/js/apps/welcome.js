/* ============================================================
   欢迎使用 Windows 95
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const TIPS = [
    "提示：双击桌面图标可以打开程序；单击一次可以选中它。",
    "提示：把鼠标移到窗口标题栏上按住左键，即可拖动窗口。",
    "提示：拖动窗口的边框或角落可以调整窗口大小。",
    "提示：右键单击桌面可以排列图标、新建文件或打开显示属性。",
    "提示：右键单击任务栏空白处可以层叠或平铺窗口。",
    "提示：在“开始”→“运行”中输入 notepad 可以快速启动记事本。",
    "提示：按 Alt+F4 可以关闭当前窗口。",
    "提示：双击任务栏上的时钟可以打开“日期/时间 属性”。",
    "提示：纸牌和扫雷可以在“开始”→“程序”→“附件”→“游戏”中找到。",
    "提示：在“显示属性”中可以更换墙纸、屏幕保护程序和颜色方案。",
    "提示：关闭系统时选择“重新启动”可以重新开机。",
  ];

  W95.registerApp("welcome", {
    title: "欢迎",
    icon: "help",
    width: 420,
    height: 320,
    resizable: false,
    statusbar: false,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.display = "flex";
      body.style.flexDirection = "column";

      // 顶部横幅
      const banner = W95.el("div", {
        style: {
          background: "linear-gradient(90deg,#000080,#1084d0)",
          color: "#fff", padding: "12px 14px", display: "flex",
          alignItems: "center", gap: "10px", flex: "0 0 auto",
        },
      });
      banner.innerHTML =
        '<span style="width:40px;height:40px">' +
        '<svg viewBox="0 0 40 40" width="40" height="40">' +
        '<path d="M2,4 C10,1 16,6 24,4 L24,12 C16,14 10,9 2,12 Z" fill="#df0000"/>' +
        '<path d="M24,4 C32,1 38,6 38,4 L38,12 C38,14 32,9 24,12 Z" fill="#00a000"/>' +
        '<path d="M2,16 C10,13 16,18 24,16 L24,24 C16,26 10,21 2,24 Z" fill="#0000c0"/>' +
        '<path d="M24,16 C32,13 38,18 38,16 L38,24 C38,26 32,21 24,24 Z" fill="#f0c000"/>' +
        "</svg></span>";
      const titleTxt = W95.el("div", { style: { fontSize: "18px", fontWeight: "bold" }, text: "欢迎使用 Windows 95" });
      banner.appendChild(titleTxt);
      body.appendChild(banner);

      const tipEl = W95.el("div", {
        style: {
          flex: "1", padding: "14px", fontSize: "12px", lineHeight: "1.6",
          background: "#fff", borderBottom: "1px solid #c0c0c0",
        },
      });
      body.appendChild(tipEl);

      let tipIdx = Math.floor(Math.random() * TIPS.length);
      function showTip() {
        tipEl.textContent = TIPS[tipIdx % TIPS.length];
      }
      showTip();

      const checkRow = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px" } });
      const cb = W95.el("input", { type: "checkbox" });
      cb.checked = true;
      checkRow.appendChild(cb);
      checkRow.appendChild(W95.el("span", { class: "w95label", text: "下次启动时显示此欢迎屏幕" }));
      body.appendChild(checkRow);

      const btnRow = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", padding: "8px 12px" } });
      const nextB = W95.el("button", { class: "w95btn", type: "button", text: "下一提示(N)" });
      nextB.addEventListener("click", () => { tipIdx++; showTip(); });
      const closeB = W95.el("button", { class: "w95btn default", type: "button", text: "开始使用 Windows 95" });
      closeB.addEventListener("click", () => {
        W95.store.set("show-welcome", cb.checked);
        win.close();
      });
      btnRow.appendChild(nextB); btnRow.appendChild(closeB);
      body.appendChild(btnRow);
    },
  });
})();
