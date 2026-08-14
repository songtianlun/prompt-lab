/* ============================================================
   Windows 95 模拟器 — 入口
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  window.addEventListener("load", () => {
    W95.initSystem();
    W95.initScreensaver();
    // 欢迎画面（触发时再检查设置）
    if (W95.store.get("show-welcome", true)) {
      setTimeout(() => {
        if (W95.store.get("show-welcome", true)) W95.openApp("welcome");
      }, 2600);
    }
    // F1 帮助
    document.addEventListener("keydown", (e) => {
      if (e.key === "F1" && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        W95.openApp("help");
      }
      if (e.altKey && e.key === "F4" && !W95.WM.active) {
        e.preventDefault();
        W95.openShutdown();
      }
    });
    // 开机后默认打开我的电脑?（不，保持简洁桌面）
    console.log("Windows 95 模拟器已启动 — 单击任意键或点击可跳过开机画面");
  });
})();
