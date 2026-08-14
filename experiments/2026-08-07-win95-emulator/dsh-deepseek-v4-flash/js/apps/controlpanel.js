/* ============================================================
   控制面板
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const APPLETS = [
    { id: "display", name: "显示", icon: "display", fn: () => W95.openApp("props", { page: "display" }) },
    { id: "mouse", name: "鼠标", icon: "mouse", fn: () => W95.openApp("props", { page: "mouse" }) },
    { id: "keyboard", name: "键盘", icon: "keyboard", fn: () => W95.openApp("props", { page: "keyboard" }) },
    { id: "datetime", name: "日期/时间", icon: "datetime", fn: () => W95.openApp("props", { page: "datetime" }) },
    { id: "sounds", name: "声音", icon: "speaker", fn: () => W95.openApp("props", { page: "sounds" }) },
    { id: "system", name: "系统", icon: "system", fn: () => W95.openApp("props", { page: "system" }) },
    { id: "addremove", name: "添加/删除程序", icon: "addremove", fn: () => W95.openApp("props", { page: "addremove" }) },
    { id: "fonts", name: "字体", icon: "fonts", fn: () => W95.openApp("props", { page: "fonts" }) },
    { id: "network", name: "网络", icon: "network", fn: () => W95.openApp("props", { page: "network" }) },
    { id: "printers", name: "打印机", icon: "printer", fn: () => W95.msgbox({ title: "打印机", icon: "info", text: "没有安装打印机。", buttons: ["确定"] }) },
    { id: "regional", name: "区域设置", icon: "regional", fn: () => W95.openApp("props", { page: "regional" }) },
    { id: "multimedia", name: "多媒体", icon: "multimedia", fn: () => W95.openApp("props", { page: "multimedia" }) },
  ];

  W95.registerApp("control", {
    title: "控制面板",
    icon: "cpl",
    width: 520,
    height: 380,
    minWidth: 360,
    minHeight: 280,
    create(win) {
      const body = win.body;
      body.style.padding = "10px";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.gap = "8px";

      const head = W95.el("div", { style: { display: "flex", alignItems: "center", gap: "8px" } });
      head.innerHTML = '<span style="width:32px;height:32px">' + W95.icon("cpl", 32) + "</span>";
      head.appendChild(W95.el("span", {
        class: "w95label",
        style: { fontSize: "12px", color: "#404040" },
        text: "使用“控制面板”设置 Windows 95 个性化选项。",
      }));
      body.appendChild(head);

      const grid = W95.el("div", {
        style: {
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: "6px", flex: "1", alignContent: "flex-start",
        },
      });
      APPLETS.forEach((a) => {
        const cell = W95.el("div", {
          style: {
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "3px", padding: "6px 2px", cursor: "default", textAlign: "center",
          },
        });
        cell.innerHTML = '<span style="width:32px;height:32px">' + W95.icon(a.icon, 32) + "</span>";
        cell.appendChild(W95.el("div", { text: a.name, style: { fontSize: "11px", lineHeight: "1.2" } }));
        cell.addEventListener("dblclick", a.fn);
        cell.addEventListener("mousedown", (e) => {
          e.preventDefault();
          grid.querySelectorAll(".cpl-sel").forEach((x) => {
            x.classList.remove("cpl-sel");
            x.style.background = "";
          });
          cell.classList.add("cpl-sel");
          cell.style.background = "#000080";
          cell.style.color = "#fff";
        });
        grid.appendChild(cell);
      });
      body.appendChild(grid);

      win.setMenuBar([
        {
          label: "文件(F)", onAction: (a) => { if (a === "close") win.close(); },
          items: [
            { label: "关闭(C)", action: "close" },
          ],
        },
        {
          label: "帮助(H)", onAction: (a) => {
            if (a === "about") W95.msgbox({ title: "关于控制面板", icon: "cpl", text: "Microsoft (R) Windows 95 控制面板\r\n版本 4.0", buttons: ["确定"] });
          },
          items: [
            { label: "帮助主题(H)", action: "help" },
            { sep: true },
            { label: "关于控制面板(A)", action: "about" },
          ],
        },
      ]);
    },
  });
})();
