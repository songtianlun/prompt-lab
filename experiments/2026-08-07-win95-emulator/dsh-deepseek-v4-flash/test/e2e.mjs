/* Windows 95 模拟器 E2E 冒烟测试驱动（CDP, 无外部依赖）
   用法: node test/e2e.mjs <chrome-binary> <page-url> <out-dir>
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const [chromeBin, pageUrl, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const chrome = spawn(chromeBin, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--remote-debugging-port=9333",
  "--user-data-dir=" + outDir + "/chrome-profile",
  "--window-size=1024,768",
  "about:blank",
], { stdio: "ignore" });

async function getJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch (e) {}
    await sleep(250);
  }
  throw new Error("CDP 端点不可用: " + url);
}

let nextId = 1;
const pending = new Map();
const errors = [];
let ws;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error("CDP 超时: " + method)); } }, 15000);
  });
}

async function evalJS(expr) {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error("eval 异常: " + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result?.value;
}

async function waitFor(expr, timeout = 8000, label = expr) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    try {
      if (await evalJS(expr)) return true;
    } catch (e) {}
    await sleep(120);
  }
  throw new Error("等待超时: " + label);
}

async function shot(name) {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(r.data, "base64"));
  console.log("截图:", name + ".png");
}

async function click(x, y) {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function dblclick(x, y) {
  for (let i = 0; i < 2; i++) {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: i + 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: i + 1 });
    await sleep(60);
  }
}
async function key(k, code, vk) {
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
}
async function typeText(t) {
  await send("Input.insertText", { text: t });
}
async function boxCenter(expr) {
  const box = await evalJS(`(() => { const el = ${expr}; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: r.left, top: r.top, w: r.width, h: r.height }; })()`);
  return box;
}

try {
  const tabs = await getJson("http://127.0.0.1:9333/json/list");
  // 使用已有 tab 导航
  const tab = tabs.find((t) => t.type === "page");
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id).resolve(msg.result || {});
      pending.delete(msg.id);
    } else if (msg.method === "Runtime.exceptionThrown") {
      errors.push("EXCEPTION: " + (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text));
    } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      errors.push("LOGERROR: " + msg.params.entry.text);
    } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      errors.push("CONSOLE: " + (msg.params.args || []).map((a) => a.value || a.description).join(" "));
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.navigate", { url: pageUrl });

  // 等系统完全初始化（load 事件后 initSystem 已运行）
  await waitFor("typeof window.W95 !== 'undefined' && !!W95.BOOT && !!W95.Shell && W95.Shell.icons.length > 0", 12000, "系统就绪");
  await waitFor("!!document.querySelector('#start-button')", 5000, "开始按钮出现");
  await evalJS("W95.store.set('show-welcome', true); true");
  await sleep(700);
  await shot("01-desktop-boot");

  // 跳过开机画面
  await evalJS("W95.BOOT.finish(); W95.closeStartMenu(); true");
  await sleep(600);
  await shot("02-desktop");

  // 欢迎窗口应在 2.6s 后出现
  await sleep(2600);
  const welcomeShown = await evalJS("W95.WM.windows.some(w => w.opts.title === '欢迎')");
  console.log("欢迎窗口出现:", welcomeShown ? "是 ✓" : "否 ✗");
  if (welcomeShown) {
    await evalJS("(() => { const w = W95.WM.windows.find(x => x.opts.title === '欢迎'); w && w.close(); })()");
    await sleep(200);
  }

  // 打开开始菜单
  const sb = await boxCenter("document.querySelector('#start-button')");
  await click(sb.x, sb.y);
  await sleep(300);
  await shot("03-startmenu");
  const menuShown = await evalJS("!document.querySelector('#start-menu').classList.contains('hidden')");
  console.log("开始菜单打开:", menuShown ? "是 ✓" : "否 ✗");

  // 关闭开始菜单，双击打开记事本（第5个图标 记事本）
  await evalJS("W95.closeStartMenu(); true");
  await sleep(200);
  const np = await boxCenter("Array.from(document.querySelectorAll('.desk-icon')).find(e => e._icon && e._icon.name === '记事本')");
  if (np) { await dblclick(np.x, np.y); await sleep(500); }
  const notepadShown = await evalJS("W95.WM.windows.some(w => w.opts.title.startsWith('记事本'))");
  console.log("双击桌面图标打开记事本:", notepadShown ? "是 ✓" : "否 ✗");
  await shot("04-notepad");

  // 计算器
  await evalJS("W95.openApp('calc'); true");
  await sleep(400);
  await shot("05-calc");

  // 画图
  await evalJS("W95.openApp('paint'); true");
  await sleep(500);
  await shot("06-paint");

  // 扫雷
  await evalJS("W95.openApp('minesweeper'); true");
  await sleep(400);
  await shot("07-minesweeper");

  // 纸牌
  await evalJS("W95.openApp('solitaire'); true");
  await sleep(600);
  await shot("08-solitaire");

  // 资源管理器
  await evalJS("W95.openApp('explorer', { path: 'C:/' }); true");
  await sleep(500);
  await shot("09-explorer");

  // MS-DOS：打开并输入命令
  await evalJS("W95.openApp('msdos'); true");
  await sleep(400);
  await evalJS("(() => { const s = document.querySelector('.msdos-screen, .w95win .win-body > div[tabindex]'); return true; })()");
  const dosScreen = await evalJS("(() => { const el = Array.from(document.querySelectorAll('.w95win')).filter(w => w.querySelector('.win-title-text') && w.querySelector('.win-title-text').textContent === 'MS-DOS 方式').pop(); const b = el && el.querySelector('.win-body'); if (b) { b.focus(); const r = b.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; } return null; })()");
  if (dosScreen) {
    await click(dosScreen.x, dosScreen.y);
    await sleep(200);
    await typeText("dir");
    await key("Enter", "Enter", 13);
    await sleep(400);
    await shot("10-msdos-dir");
    await typeText("cls");
    await key("Enter", "Enter", 13);
    await sleep(200);
    await typeText("ver");
    await key("Enter", "Enter", 13);
    await sleep(300);
  }

  // 控制面板
  await evalJS("W95.openApp('control'); true");
  await sleep(400);
  await shot("11-controlpanel");

  // 显示属性
  await evalJS("W95.openApp('props', { page: 'display' }); true");
  await sleep(400);
  await shot("12-display-props");

  // 任务栏属性
  await evalJS("W95.openApp('props', { page: 'taskbar' }); true");
  await sleep(300);
  await shot("13-taskbar-props");

  // 系统属性
  await evalJS("W95.openApp('props', { page: 'system' }); true");
  await sleep(300);
  await shot("14-system-props");

  // 日期时间
  await evalJS("W95.openApp('props', { page: 'datetime' }); true");
  await sleep(500);
  await shot("15-datetime");

  // 关机对话框
  await evalJS("W95.openShutdown(); true");
  await sleep(300);
  await shot("16-shutdown");

  // 帮助
  await evalJS("W95.openApp('help'); true");
  await sleep(400);
  await shot("17-help");

  // 纸牌自动点击发牌堆测试（可选）
  // 收尾：错误汇总
  await sleep(300);
  console.log("\n===== 控制台错误 (" + errors.length + ") =====");
  errors.forEach((e) => console.log(e));
  if (!errors.length) console.log("无错误 ✓");
} catch (e) {
  console.error("测试失败:", e.message);
  process.exitCode = 1;
} finally {
  ws?.close();
  chrome.kill();
}
