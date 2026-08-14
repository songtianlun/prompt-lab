/* ============================================================
   Windows 95 模拟器 — 开机 / 关机 / 重启
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const bootScreen = () => W95.$("#boot-screen");
  const safeScreen = () => W95.$("#safe-screen");
  const dosScreen = () => W95.$("#dos-screen");

  const BOOT = {
    started: false,
    done: false,
    start() {
      if (this.started) return;
      this.started = true;
      if (this.done) return; // 已被提前 finish，避免重新显示
      const bs = bootScreen();
      bs.classList.remove("hidden");
      const skip = () => this.finish();
      bs.addEventListener("click", skip, { once: true });
      setTimeout(skip, 5600); // 进度条动画完成后自动进入
    },
    finish() {
      if (this.done) return;
      this.done = true;
      const bs = bootScreen();
      bs.classList.add("hidden");
      W95.sound.play("startup");
      // 显示桌面
      const d = W95.$("#desktop");
      d.classList.remove("hidden");
    },
  };
  W95.BOOT = BOOT;

  /* ---------------- 关机对话框 ---------------- */
  function openShutdown() {
    const win = W95.dlgWindow({
      title: "关闭 Windows",
      icon: "msg-computer",
    });
    const body = win.body;
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "4px";
    body.style.minWidth = "340px";
    body.style.maxWidth = "420px";

    const head = W95.el("div", { style: { display: "flex", gap: "10px", alignItems: "center" } });
    head.innerHTML = '<span class="mb-icon">' + W95.icon("computer", 32) + "</span>";
    head.appendChild(W95.el("div", {
      class: "w95label",
      style: { fontWeight: "bold" },
      text: "确实要：",
    }));
    body.appendChild(head);

    const options = [
      { id: "standby", label: "将您的计算机转入待机状态。", disabled: false, tip: "（模拟）" },
      { id: "shutdown", label: "关闭计算机？" },
      { id: "restart", label: "重新启动计算机？" },
      { id: "dos", label: "重新启动计算机并切换到 MS-DOS 方式？" },
    ];
    let selected = "shutdown";
    options.forEach((o) => {
      const row = W95.el("label", {
        class: "w95radio",
        style: { marginLeft: "40px", marginTop: "10px" },
      });
      const rb = W95.el("input", { type: "radio", name: "shutopt" });
      if (o.id === selected) rb.checked = true;
      rb.addEventListener("change", () => (selected = o.id));
      const span = W95.el("span", { class: "w95label", text: o.label + (o.tip || "") });
      row.appendChild(rb);
      row.appendChild(span);
      body.appendChild(row);
    });

    const btnRow = W95.el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "18px" } });
    const ok = W95.el("button", { class: "w95btn default", type: "button", text: "是(Y)" });
    const no = W95.el("button", { class: "w95btn", type: "button", text: "否(N)" });
    const help = W95.el("button", { class: "w95btn", type: "button", text: "帮助(H)" });
    ok.addEventListener("click", () => {
      win.close();
      doShutdown(selected);
    });
    no.addEventListener("click", () => win.close());
    help.addEventListener("click", () => {
      W95.msgbox({ title: "关闭 Windows", icon: "info", text: "选择一种方式后单击“是”。\r\n\r\n- 待机：降低耗电，单击任意键恢复。\r\n- 关闭：显示安全关机画面。\r\n- 重新启动：重新开机。\r\n- MS-DOS：进入命令行模式。", buttons: ["确定"] });
    });
    btnRow.appendChild(ok); btnRow.appendChild(no); btnRow.appendChild(help);
    body.appendChild(btnRow);
  }
  W95.openShutdown = openShutdown;

  function doShutdown(mode) {
    if (mode === "standby") {
      const overlay = W95.el("div", {
        class: "standby-overlay",
        style: {
          position: "fixed", inset: "0", zIndex: "9600",
          background: "#000", color: "#c0c0c0",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "12px",
          cursor: "pointer", fontSize: "16px",
        },
      });
      overlay.innerHTML = "<div>计算机正在待机...</div><div style='font-size:12px;color:#606060'>单击任意位置唤醒</div>";
      document.body.appendChild(overlay);
      const wake = () => {
        overlay.remove();
        document.removeEventListener("mousedown", wake);
        document.removeEventListener("keydown", wake);
      };
      setTimeout(() => {
        document.addEventListener("mousedown", wake);
        document.addEventListener("keydown", wake);
      }, 400);
      return;
    }
    if (mode === "shutdown") {
      W95.sound.play("shutdown");
      showSafeScreen();
      return;
    }
    if (mode === "restart") {
      W95.sound.play("shutdown");
      showDosOrReboot(false);
      return;
    }
    if (mode === "dos") {
      showDosOrReboot(true);
    }
  }

  function showSafeScreen() {
    // 保存桌面状态，供再次开机恢复
    const sc = safeScreen();
    sc.classList.remove("hidden");
    const again = () => {
      sc.classList.add("hidden");
      reboot();
    };
    sc.addEventListener("click", again, { once: true });
    document.addEventListener("keydown", again, { once: true });
  }

  function showDosOrReboot(dos) {
    if (dos) {
      const dsc = dosScreen();
      dsc.classList.remove("hidden");
      const again = () => {
        dsc.classList.add("hidden");
        reboot();
      };
      dsc.addEventListener("click", again, { once: true });
      document.addEventListener("keydown", again, { once: true });
    } else {
      reboot();
    }
  }

  function reboot() {
    // 关闭所有窗口并重新开机
    W95.WM.closeAll();
    W95.closeMenus();
    W95.closeStartMenu();
    const bs = bootScreen();
    // 重置进度条
    const bar = bs.querySelector(".boot-progress-bar");
    const nb = bar.cloneNode(true);
    bar.parentNode.replaceChild(nb, bar);
    // 重新触发动画
    bs.style.display = "none";
    void bs.offsetHeight;
    bs.style.display = "";
    bs.classList.remove("hidden");
    const skip = () => {
      bs.classList.add("hidden");
      W95.sound.play("startup");
    };
    bs.addEventListener("click", skip, { once: true });
    setTimeout(skip, 5600);
  }

  /* ---------------- 开机流程 ---------------- */
  W95.initSystem = function () {
    W95.applyDesktopSettings();
    W95.initShell();
    BOOT.start();
  };

})();
