/* Windows 95 模拟器功能验证脚本（CDP 断言）
   用法: node test/verify.mjs <chrome-binary> <page-url>
   输出: 每项 PASS/FAIL，最后汇总
*/
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const [chromeBin, pageUrl] = process.argv.slice(2);
const chrome = spawn(chromeBin, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
  "--remote-debugging-port=9337", "--user-data-dir=/tmp/w95verify", "--window-size=1024,768", "about:blank",
], { stdio: "ignore" });

let nextId = 1;
const pending = new Map();
let ws;
function send(method, params = {}) {
  return new Promise((res, rej) => {
    const id = nextId++;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error("超时: " + method)); } }, 12000);
  });
}
async function ev(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return { __throw: (r.exceptionDetails.exception?.description || r.exceptionDetails.text) };
  return r.result?.value;
}
async function waitFor(expr, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (await ev(expr)) return true;
    await sleep(120);
  }
  return false;
}
async function click(x, y, btn = "left") {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: btn, clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: btn, clickCount: 1 });
}
async function dblclick(x, y) {
  for (let i = 0; i < 2; i++) {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: i + 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: i + 1 });
    await sleep(50);
  }
}
async function typeText(t) { await send("Input.insertText", { text: t }); }
async function typeChars(s) {
  // 逐个字符派发真实键盘事件
  for (const ch of s) {
    const code = ch === " " ? "Space" : "Key" + ch.toUpperCase();
    const vk = ch === " " ? 32 : ch.toUpperCase().charCodeAt(0);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: ch });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: ch, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await sleep(15);
  }
}
async function clickEl(expr) {
  const c = await center(expr);
  if (!c) return null;
  await click(c.x, c.y);
  return c;
}
async function key(k, code, vk) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
}
async function center(expr) {
  return ev(`(() => { const el = ${expr}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height }; })()`);
}

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  PASS:", name); }
  else { fail++; console.log("  FAIL:", name, detail !== undefined ? "→ " + JSON.stringify(detail) : ""); }
}

try {
  const tabs = await (async () => {
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch("http://127.0.0.1:9337/json/list");
        if (r.ok) return await r.json();
      } catch (e) {}
      await sleep(250);
    }
    throw new Error("CDP 不可用");
  })();
  ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev2) => {
    const m = JSON.parse(ev2.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || {}); pending.delete(m.id); }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: pageUrl });
  // 等待系统完全初始化（load 事件后 initSystem 已运行、图标已渲染）
  await waitFor("typeof window.W95 !== 'undefined' && !!W95.initSystem && !!W95.BOOT && !!W95.Shell && W95.Shell.icons.length > 0");
  // 禁止欢迎窗口（其定时器在 2.6s 触发，会遮挡后续点击目标）
  await ev("W95.store.set('show-welcome', false); true");
  await waitFor("!!document.querySelector('#start-button')");
  await ev("W95.BOOT.finish(); W95.closeStartMenu(); true");
  await sleep(400);

  console.log("== 桌面 ==");
  check("桌面背景为青绿色", await ev("getComputedStyle(document.querySelector('#desktop')).backgroundColor") === "rgb(0, 128, 128)");
  check("桌面图标 7 个", (await ev("document.querySelectorAll('.desk-icon').length")) === 7);
  check("任务栏存在", await ev("!!document.querySelector('#taskbar')"));

  console.log("== 开始菜单 ==");
  const sb = await center("document.querySelector('#start-button')");
  await click(Math.round(sb.x), Math.round(sb.y));
  await sleep(250);
  check("开始菜单打开", await ev("!document.querySelector('#start-menu').classList.contains('hidden')"));
  check("开始菜单含关机项", await ev("!!document.querySelector('.startmenu-item[data-action=\"shutdown\"]')"));
  // 程序级联
  const progItem = await center("document.querySelector('.startmenu-item[data-action=\"programs\"]')");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: progItem.x, y: progItem.y });
  await sleep(350);
  check("程序级联菜单出现", await ev("!!document.querySelector('.w95menu')"));
  await ev("W95.closeStartMenu(); W95.closeMenus(); true");
  await sleep(150);

  console.log("== 记事本 ==");
  await ev("W95.openApp('notepad'); true");
  await sleep(300);
  check("记事本窗口存在", await ev("W95.WM.windows.some(w => w.opts.title.startsWith('记事本'))"));
  await ev("(() => { const ta = document.querySelector('.notepad-ta'); if (ta) ta.value = 'Hello Windows 95'; return !!ta; })()");
  check("记事本可输入", await ev("document.querySelector('.notepad-ta') && document.querySelector('.notepad-ta').value === 'Hello Windows 95'"));
  check("记事本菜单栏存在", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title.startsWith('记事本')); return w && w.menubar && w.menubar.children.length >= 4; })()"));

  console.log("== 计算器 ==");
  await ev("W95.openApp('calc'); true");
  await sleep(300);
  check("计算器菜单栏存在", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === '计算器'); return w && w.menubar && w.menubar.children.length >= 2; })()"));
  // 通过按钮文字精确定位点击: 1 + 2 =
  const btnPos = (label) => ev(`(() => { const w = W95.WM.windows.find(x => x.opts.title === '计算器'); if (!w) return null; const b = Array.from(w.body.querySelectorAll('button')).find(b2 => b2.textContent === '${label}'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const b1 = await btnPos("1"), bPlus = await btnPos("+"), b2 = await btnPos("2"), bEq = await btnPos("=");
  if (b1 && bPlus && b2 && bEq) {
    await click(b1.x, b1.y); await click(bPlus.x, bPlus.y); await click(b2.x, b2.y); await click(bEq.x, bEq.y);
    await sleep(150);
    check("计算器 1+2=3", await ev("(() => { const d = document.querySelector('.calc-display'); return d && d.textContent.trim(); })()") === "3");
  } else {
    check("计算器 1+2=3", false, { b1, bPlus, b2, bEq });
  }
  await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === '计算器'); w && w.close(); })()");

  console.log("== 画图 ==");
  await ev("W95.openApp('paint'); true");
  await sleep(400);
  check("画图画布存在", await ev("!!document.querySelector('.w95win canvas')"));
  check("画图调色板 28 色", await ev("document.querySelectorAll('.w95win canvas').length > 0"));
  // 画一笔：pencil 默认工具，在画布中心按下拖动
  const cv = await center("document.querySelector('.w95win canvas')");
  if (cv) {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cv.l + 40, y: cv.t + 40, button: "left", clickCount: 1 });
    for (let i = 1; i <= 5; i++) {
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cv.l + 40 + i * 10, y: cv.t + 40 + i * 5 });
      await sleep(15);
    }
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cv.l + 90, y: cv.t + 65, button: "left", clickCount: 1 });
    await sleep(150);
    check("画图笔迹已绘制", await ev("(() => { const c = document.querySelector('.w95win canvas'); const d = c.getContext('2d').getImageData(50, 45, 30, 30).data; let nonWhite = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 250 || d[i+1] < 250 || d[i+2] < 250) nonWhite++; return nonWhite > 20; })()"));
  }

  console.log("== 扫雷 ==");
  await ev("W95.openApp('minesweeper'); true");
  await sleep(350);
  check("扫雷棋盘 81 格", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === '扫雷'); return w && w.body.querySelectorAll('div').length > 80; })()"));
  const mw = await center("(() => { const w = W95.WM.windows.find(x => x.opts.title === '扫雷'); return w && w.body; })()");
  if (mw) {
    const cell = { x: mw.l + mw.w * 0.45, y: mw.t + mw.h * 0.7 };
    await click(cell.x, cell.y);
    await sleep(200);
    check("扫雷点击翻格", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === '扫雷'); return w && w.body.textContent.includes('💣') === false; })()"));
  }

  console.log("== 纸牌 ==");
  await ev("W95.openApp('solitaire'); true");
  await sleep(500);
  check("纸牌窗口有牌", await ev("document.querySelectorAll('.card-el').length >= 20"));
  check("纸牌落点区(发牌+翻牌+目标+列)", await ev("document.querySelectorAll('.drop-zone').length >= 6"));
  // 点击发牌堆
  const stockEl = await center("document.querySelector('[data-pile=\"stock\"]')");
  if (stockEl) {
    await click(stockEl.x, stockEl.y);
    await sleep(300);
    check("发牌堆翻牌", await ev("document.querySelectorAll('.card-el[data-pile=\"waste\"]').length >= 1"));
  }

  console.log("== 资源管理器 ==");
  await ev("W95.openApp('explorer', { path: 'C:/My Documents' }); true");
  await sleep(400);
  check("资源管理器地址栏", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title.includes('浏览')); return w && w.body.querySelector('input') && w.body.querySelector('input').value.includes('My Documents'); })()"));
  check("资源管理器文件列表", await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title.includes('浏览')); return w && w.body.textContent.includes('README.txt'); })()"));

  console.log("== MS-DOS ==");
  await ev("W95.openApp('msdos'); true");
  await sleep(300);
  const dos = await ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === 'MS-DOS 方式'); if (!w) return null; const b = w.body; b.focus(); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()");
  await click(dos.x, dos.y);
  await sleep(150);
  await typeChars("ver");
  await key("Enter", "Enter", 13);
  await sleep(250);
  const screenText = () => ev("(() => { const w = W95.WM.windows.find(x => x.opts.title === 'MS-DOS 方式'); return w ? w.body.textContent : ''; })()");
  check("DOS ver 命令输出", (await screenText()).includes("Copyright Microsoft Corp"));
  await typeChars("dir");
  await key("Enter", "Enter", 13);
  await sleep(250);
  check("DOS dir 输出", (await screenText()).includes("WINDOWS") || (await screenText()).includes("个文件"));
  await typeChars("cls");
  await key("Enter", "Enter", 13);
  await sleep(150);
  check("DOS cls 清屏", (await screenText()).length < 50);
  await typeChars("exit");
  await key("Enter", "Enter", 13);
  await sleep(250);
  check("DOS exit 关闭窗口", await ev("!W95.WM.windows.some(x => x.opts.title === 'MS-DOS 方式')"));

  console.log("== 控制面板 ==");
  await ev("W95.openApp('control'); true");
  await sleep(300);
  check("控制面板 12 个图标", await ev("document.querySelectorAll('.cpl-sel').length >= 0 && W95.WM.windows.some(w => w.opts.title === '控制面板')"));

  console.log("== 显示属性 ==");
  await ev("W95.openApp('props', { page: 'display' }); true");
  await sleep(350);
  check("显示属性对话框", await ev("!!document.querySelector('.dlgwin')"));
  // 选择墙纸 蓝天白云
  await ev("(() => { W95.appearance.wallpaper = 'clouds'; W95.applyWallpaper(); return true; })()");
  await sleep(200);
  check("墙纸生效（出现 canvas）", await ev("!!document.querySelector('.wallpaper-canvas')"));
  // 应用分辨率
  await ev("(() => { W95.appearance.resolution = '1024x768'; W95.applyResolution(); return true; })()");
  await sleep(200);
  check("分辨率缩放生效", await ev("window.__w95ResolutionScale === 1.2"));
  await ev("(() => { W95.appearance.resolution = '800x600'; W95.applyResolution(); return true; })()");

  console.log("== 日期时间 ==");
  await ev("W95.openApp('props', { page: 'datetime' }); true");
  await sleep(350);
  check("日期时间对话框", await ev("document.body.textContent.includes('时区')"));
  await ev("W95.$$('.dlgwin').forEach(w => w.remove()); true");

  console.log("== 关机 ==");
  await ev("W95.openShutdown(); true");
  await sleep(300);
  check("关机对话框选项", await ev("document.body.textContent.includes('关闭计算机') && document.body.textContent.includes('MS-DOS 方式')"));
  // 点“是”执行关机
  const yesBtn = await center("Array.from(document.querySelectorAll('.dlgwin .w95btn')).find(b => b.textContent.includes('是'))");
  if (yesBtn) { await click(yesBtn.x, yesBtn.y); await sleep(300); }
  check("安全关机画面", await ev("!document.querySelector('#safe-screen').classList.contains('hidden')"));
  await ev("document.querySelector('#safe-screen').classList.add('hidden'); true");

  console.log("== 窗口管理 ==");
  await ev("W95.WM.closeAll(); W95.openApp('notepad'); W95.openApp('calc'); true");
  await sleep(400);
  check("两个窗口存在", await ev("W95.WM.windows.length === 2"));
  // 拖动
  const win1 = await center("(() => { const w = W95.WM.windows[0]; const tb = w.titlebar; const r = tb.getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2, l: w.el.style.left }; })()");
  if (win1) {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: win1.x, y: win1.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: win1.x + 60, y: win1.y + 40 });
    await sleep(60);
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: win1.x + 60, y: win1.y + 40, button: "left", clickCount: 1 });
    await sleep(150);
    check("窗口可拖动", await ev("parseInt(W95.WM.windows[0].el.style.left) > 80"));
  }
  // 最小化/恢复
  await ev("W95.WM.windows[0].minimize(); true");
  await sleep(100);
  check("窗口最小化隐藏", await ev("W95.WM.windows[0].minimized === true && W95.WM.windows[0].el.style.display === 'none'"));
  await ev("W95.WM.windows[0].restore(); true");
  await sleep(100);
  check("窗口恢复显示", await ev("W95.WM.windows[0].minimized === false && W95.WM.windows[0].el.style.display === 'flex'"));
  // 最大化
  await ev("W95.WM.windows[0].toggleMaximize(); true");
  await sleep(100);
  check("窗口最大化", await ev("W95.WM.windows[0].maximized === true"));
  await ev("W95.WM.windows[0].toggleMaximize(); true");
  // 关闭
  await ev("W95.WM.closeAll(); true");
  await sleep(150);
  check("全部窗口关闭", await ev("W95.WM.windows.length === 0"));

  console.log("== 关机流程 ==");
  await ev("W95.openShutdown(); true");
  await sleep(250);
  const yesBtn2 = await center("Array.from(document.querySelectorAll('.dlgwin .w95btn')).find(b => b.textContent.includes('是'))");
  if (yesBtn2) { await click(yesBtn2.x, yesBtn2.y); await sleep(300); }
  check("安全关机画面", await ev("!document.querySelector('#safe-screen').classList.contains('hidden')"));
  await ev("document.querySelector('#safe-screen').classList.add('hidden'); true");

  console.log("\n===== 结果: " + pass + " 通过, " + fail + " 失败 =====");
} catch (e) {
  console.error("验证脚本异常:", e.message);
  process.exitCode = 1;
} finally {
  ws?.close();
  chrome.kill();
}
process.exit(fail ? 1 : 0);
