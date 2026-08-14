/* ============================================================
   帮助
   ============================================================ */
(function () {
  "use strict";
  const W95 = window.W95;

  const TOPICS = {
    "intro": {
      title: "欢迎使用 Windows 95",
      body: "<h1>欢迎使用 Windows 95 网页模拟器</h1>" +
        "<p>这是一个用 HTML/CSS/JavaScript 完整还原的 Windows 95 桌面环境。</p>" +
        "<ul><li>双击桌面图标打开程序</li><li>单击左下角“开始”打开开始菜单</li><li>窗口可以拖动、缩放、最小化和最大化</li><li>右键桌面可以排列图标或打开显示属性</li></ul>" +
        "<p>相关主题：<a href='topic:startmenu'>使用“开始”菜单</a>、<a href='topic:windows'>使用窗口</a>、<a href='topic:shutdown'>关闭计算机</a></p>",
    },
    "startmenu": {
      title: "使用“开始”菜单",
      body: "<h1>使用“开始”菜单</h1>" +
        "<p>单击任务栏上的“开始”按钮，即可打开“开始”菜单，从这里可以：</p>" +
        "<ul><li><b>程序</b>：启动已安装的程序</li><li><b>文档</b>：打开最近使用的文档</li><li><b>设置</b>：更改控制面板和任务栏设置</li><li><b>查找</b>：查找文件或文件夹</li><li><b>运行</b>：键入命令启动程序</li><li><b>关闭系统</b>：关机、重启或待机</li></ul>" +
        "<p>相关主题：<a href='topic:windows'>使用窗口</a>、<a href='topic:shutdown'>关闭计算机</a></p>",
    },
    "windows": {
      title: "使用窗口",
      body: "<h1>使用窗口</h1>" +
        "<ul><li>拖动<b>标题栏</b>可以移动窗口</li><li>拖动窗口<b>边框或角</b>可以调整大小</li><li>单击右上角按钮可<b>最小化</b>、<b>最大化</b>或<b>关闭</b>窗口</li><li>双击标题栏可在最大化与还原之间切换</li><li>最小化的窗口会出现在<b>任务栏</b>上，单击即可恢复</li><li>按 <b>Alt+F4</b> 可关闭活动窗口</li></ul>",
    },
    "shutdown": {
      title: "关闭计算机",
      body: "<h1>关闭计算机</h1>" +
        "<p>单击“开始”，再单击“关闭系统”，然后选择：</p>" +
        "<ul><li><b>待机</b>：低功耗状态，单击任意键唤醒</li><li><b>关闭计算机</b>：显示“现在可以安全地关闭计算机了”</li><li><b>重新启动</b>：重新开机</li><li><b>MS-DOS 方式</b>：进入命令行模式，键入 EXIT 返回</li></ul>" +
        "<p>在安全关机画面单击即可重新开机。</p>",
    },
    "desktop": {
      title: "桌面",
      body: "<h1>桌面</h1>" +
        "<p><b>我的电脑</b>：浏览磁盘和文件（打开资源管理器）。</p>" +
        "<p><b>网上邻居</b>：本模拟器为单机环境。</p>" +
        "<p><b>回收站</b>：查看被删除的项目，可以还原或清空。</p>" +
        "<p>右键桌面可排列图标、新建项目或打开显示属性。</p>",
    },
    "taskbar": {
      title: "任务栏",
      body: "<h1>任务栏</h1>" +
        "<p>任务栏位于屏幕底部，包括：</p>" +
        "<ul><li><b>开始按钮</b>：打开开始菜单</li><li><b>程序按钮</b>：每个打开的窗口对应一个按钮，单击可切换</li><li><b>时钟</b>：显示当前时间，双击打开“日期/时间 属性”</li></ul>" +
        "<p>右键单击任务栏空白处可层叠或平铺窗口、最小化所有窗口。</p>",
    },
    "notepad": {
      title: "使用记事本",
      body: "<h1>使用记事本</h1>" +
        "<p>记事本是一个简单的文本编辑器。</p>" +
        "<ul><li>在“文件”菜单中新建、打开或保存文件</li><li>按 Ctrl+S 快速保存</li><li>按 F3 查找下一个</li><li>在“编辑”菜单中可插入时间和日期</li></ul>",
    },
    "paint": {
      title: "使用画图",
      body: "<h1>使用画图</h1>" +
        "<p>画图是一个绘图程序。</p>" +
        "<ul><li>从左侧工具箱选择工具（铅笔、刷子、填充、直线、矩形等）</li><li>在底部调色板选择颜色，右键选择背景色</li><li>按住左键拖动绘制，按住 Shift 可画正圆/正方形</li><li>“图像”菜单可翻转、旋转或拉伸图像</li><li>用“编辑”→“粘贴”可粘贴剪贴板图像</li></ul>",
    },
    "calc": {
      title: "使用计算器",
      body: "<h1>使用计算器</h1>" +
        "<p>在“查看”菜单中选择“科学型”可获得更多功能。</p>" +
        "<ul><li>支持十六进制/十进制/八进制/二进制</li><li>支持三角、对数、幂运算</li><li>支持内存功能 MC/MR/MS/M+</li><li>可以直接用键盘输入数字和运算符</li></ul>",
    },
    "minesweeper": {
      title: "玩扫雷游戏",
      body: "<h1>玩扫雷游戏</h1>" +
        "<p>扫雷的目标是找出所有地雷，而不踩到它们。</p>" +
        "<ul><li>单击方块翻开它，数字表示周围的地雷数</li><li>右键单击可标记地雷（🚩）或标问号（?）</li><li>如果数字周围的地雷都已标记，可单击数字快速翻开其余方块</li><li>在“游戏”菜单中选择难度：初级 9×9、中级 16×16、高级 16×30</li></ul>",
    },
    "solitaire": {
      title: "玩纸牌游戏",
      body: "<h1>玩纸牌游戏</h1>" +
        "<p>纸牌（Klondike）的目标是把所有牌按花色、从 A 到 K 移到右上角的目标堆。</p>" +
        "<ul><li>左上角发牌堆：单击翻牌（可在“选项”中设置翻一张或三张）</li><li>牌列按红黑交替、从大到小排列</li><li>K 只能放在空列上</li><li>双击可把牌快速移到目标堆</li><li>所有牌都移上去后会自动完成动画</li></ul>",
    },
    "dos": {
      title: "使用 MS-DOS 方式",
      body: "<h1>使用 MS-DOS 方式</h1>" +
        "<p>MS-DOS 方式提供了一个命令行窗口。</p>" +
        "<ul><li>键入 <b>DIR</b> 列出文件，<b>CD</b> 切换目录，<b>CLS</b> 清屏</li><li>键入 <b>HELP</b> 查看所有命令</li><li>键入 <b>TYPE 文件名</b> 显示文本文件</li><li>按 ↑ ↓ 键浏览命令历史</li><li>键入 <b>EXIT</b> 返回 Windows</li></ul>",
    },
    "trouble": {
      title: "疑难解答",
      body: "<h1>疑难解答</h1>" +
        "<h3>程序打不开？</h3><p>尝试双击桌面图标或通过“开始”→“程序”启动。</p>" +
        "<h3>窗口找不到了？</h3><p>查看任务栏上的程序按钮，单击即可恢复。</p>" +
        "<h3>桌面背景变了？</h3><p>右键桌面 → “属性” → “背景”，重新选择墙纸。</p>" +
        "<h3>屏幕看起来不对？</h3><p>打开“显示属性”→“设置”，调整分辨率或颜色方案。</p>" +
        "<h3>想重新开始？</h3><p>“开始”→“关闭系统”→“重新启动计算机”。</p>",
    },
  };

  const TREE = [
    ["intro", "欢迎"],
    ["基本操作", [
      ["startmenu", "使用“开始”菜单"],
      ["windows", "使用窗口"],
      ["shutdown", "关闭计算机"],
    ]],
    ["桌面", [
      ["desktop", "桌面"],
      ["taskbar", "任务栏"],
    ]],
    ["程序", [
      ["notepad", "记事本"],
      ["paint", "画图"],
      ["calc", "计算器"],
      ["minesweeper", "扫雷"],
      ["solitaire", "纸牌"],
      ["dos", "MS-DOS 方式"],
    ]],
    ["trouble", "疑难解答"],
  ];

  W95.registerApp("help", {
    title: "Windows 帮助",
    icon: "help",
    width: 560,
    height: 420,
    minWidth: 420,
    minHeight: 300,
    create(win) {
      const body = win.body;
      body.style.padding = "0";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.overflow = "hidden";

      // 工具栏
      const toolbar = W95.el("div", {
        style: { display: "flex", gap: "4px", padding: "2px 4px", borderBottom: "1px solid #808080", flex: "0 0 auto" },
      });
      const btn = (label, fn) => {
        const b = W95.el("button", {
          class: "w95btn", type: "button", text: label,
          style: { minWidth: "50px", padding: "2px 8px", fontSize: "11px" },
        });
        b.addEventListener("click", fn);
        toolbar.appendChild(b);
        return b;
      };
      btn("目录(C)", () => showTopic("intro"));
      btn("索引(I)", () => {});
      const backBtn = btn("后退(B)", () => {
        if (history.length > 1) {
          history.pop();
          renderTopic(history[history.length - 1]);
        }
      });
      btn("选项(O)", () => {});
      body.appendChild(toolbar);

      const main = W95.el("div", { style: { flex: "1", display: "flex", minHeight: "0" } });
      body.appendChild(main);

      // 左侧树
      const treeEl = W95.el("div", {
        style: {
          width: "180px", overflow: "auto", background: "#fff",
          borderRight: "1px solid #808080", padding: "2px", flex: "0 0 auto",
        },
      });
      main.appendChild(treeEl);

      // 右侧内容
      const contentEl = W95.el("div", {
        style: { flex: "1", overflow: "auto", background: "#fff", padding: "10px 14px" },
      });
      main.appendChild(contentEl);

      const history = [];

      function renderTree() {
        treeEl.innerHTML = "";
        TREE.forEach(([key, label]) => {
          if (typeof label === "string") {
            treeEl.appendChild(treeItem(key, label, 0));
          } else {
            const head = W95.el("div", { style: { padding: "2px 6px", fontWeight: "bold", fontSize: "11px", marginTop: "4px" }, text: key });
            treeEl.appendChild(head);
            label.forEach(([k, l]) => treeEl.appendChild(treeItem(k, l, 12)));
          }
        });
      }
      function treeItem(key, label, indent) {
        const row = W95.el("div", {
          style: {
            display: "flex", alignItems: "center", gap: "3px",
            padding: "1px 4px", cursor: "default", marginLeft: indent + "px",
            whiteSpace: "nowrap",
          },
        });
        row.innerHTML = '<span style="width:16px;height:16px">' + W95.icon("help", 16) + "</span>";
        row.appendChild(W95.el("span", { text: label, style: { fontSize: "11px" } }));
        row.addEventListener("mousedown", (e) => {
          e.preventDefault();
          treeEl.querySelectorAll(".help-sel").forEach((x) => { x.classList.remove("help-sel"); x.style.background = ""; x.style.color = ""; });
          row.classList.add("help-sel");
          row.style.background = "#000080";
          row.style.color = "#fff";
          showTopic(key);
        });
        return row;
      }

      function renderTopic(key) {
        const t = TOPICS[key];
        if (!t) return;
        history.push(key);
        contentEl.innerHTML = "";
        const h = W95.el("div", { style: { fontSize: "16px", fontWeight: "bold", color: "#000080", marginBottom: "10px" }, text: t.title });
        contentEl.appendChild(h);
        const b = W95.el("div", {
          style: { fontSize: "12px", lineHeight: "1.7", color: "#000" },
          html: t.body.replace(/<a href='topic:([^']+)'>/g, (m, k) => `<a href="#" data-topic="${k}" style="color:#0000ff">`),
        });
        contentEl.appendChild(b);
        b.querySelectorAll("a[data-topic]").forEach((a) => {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            showTopic(a.dataset.topic);
          });
        });
        contentEl.querySelectorAll("h1").forEach((h1) => { h1.style.fontSize = "15px"; h1.style.margin = "8px 0 4px"; });
        contentEl.querySelectorAll("h3").forEach((h3) => { h3.style.margin = "6px 0 2px"; });
        contentEl.querySelectorAll("ul").forEach((ul) => { ul.style.margin = "4px 0 4px 20px"; });
        contentEl.querySelectorAll("p").forEach((p) => { p.style.margin = "4px 0"; });
      }

      function showTopic(key) {
        renderTopic(key);
      }

      renderTree();
      showTopic("intro");
    },
  });
})();
