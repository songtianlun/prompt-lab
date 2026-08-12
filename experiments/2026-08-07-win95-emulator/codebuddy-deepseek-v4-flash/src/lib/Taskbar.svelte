<script>
  import { onMount, onDestroy } from 'svelte';
  import { windows, activeWindowId, focusWindow, openWindow } from './windowStore.js';
  import { settings, playSound } from './settingsStore.js';
  import { shutdown } from './systemStore.js';

  let startOpen = false;
  let time = new Date();
  let timer;

  onMount(() => {
    timer = setInterval(() => {
      time = new Date();
    }, 1000);
  });

  onDestroy(() => clearInterval(timer));

  function toggleStart() {
    playSound('click');
    startOpen = !startOpen;
  }

  function launch(appId, name, size) {
    startOpen = false;
    playSound('click');
    openWindow(appId, { title: name, width: size.width, height: size.height });
  }

  function taskClick(win) {
    if ($activeWindowId === win.id && !win.minimized) {
      // 已激活则最小化
      import('./windowStore.js').then((m) => m.minimizeWindow(win.id));
    } else {
      focusWindow(win.id);
    }
  }

  const startMenu = [
    {
      label: '程序',
      icon: '📂',
      submenu: [
        { label: '记事本', appId: 'notepad', size: { width: 480, height: 360 } },
        { label: '画图', appId: 'paint', size: { width: 640, height: 480 } },
        { label: '计算器', appId: 'calculator', size: { width: 280, height: 360 } },
        { label: '扫雷', appId: 'minesweeper', size: { width: 300, height: 400 } },
        { label: '纸牌', appId: 'solitaire', size: { width: 640, height: 480 } },
        { label: '资源管理器', appId: 'explorer', size: { width: 560, height: 420 } },
        { label: 'MS-DOS 提示符', appId: 'cmd', size: { width: 560, height: 400 } }
      ]
    },
    { label: '设置', icon: '⚙️', submenu: [
      { label: '显示属性', appId: 'display', size: { width: 480, height: 420 } },
      { label: '声音', appId: 'sound', size: { width: 420, height: 360 } },
      { label: '系统属性', appId: 'system', size: { width: 480, height: 420 } }
    ]},
    { label: '帮助', icon: '❓', appId: 'help', size: { width: 480, height: 400 } },
    { label: '运行...', icon: '🏃', action: 'run' },
    { label: '关于', icon: 'ℹ️', appId: 'about', size: { width: 400, height: 320 } },
    { label: '关机...', icon: '⏻', action: 'shutdown' }
  ];

  let openSubmenu = null;

  function onMenuClick(item) {
    if (item.submenu) {
      openSubmenu = openSubmenu === item.label ? null : item.label;
      return;
    }
    if (item.appId) {
      launch(item.appId, item.label, item.size);
    } else if (item.action === 'run') {
      startOpen = false;
      openWindow('cmd', { title: '运行', width: 400, height: 200 });
    } else if (item.action === 'shutdown') {
      startOpen = false;
      playSound('error');
      shutdown();
    }
  }

  function formatTime() {
    const h = time.getHours().toString().padStart(2, '0');
    const m = time.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  const appIcons = {
    notepad: '📝', paint: '🎨', calculator: '🧮', minesweeper: '💣',
    explorer: '📁', solitaire: '🃏', settings: '⚙️', display: '🖥️',
    sound: '🔊', system: '💻', about: 'ℹ️', help: '❓', clock: '🕐', cmd: '💻'
  };

  function iconFor(win) {
    return appIcons[win.appId] || '📄';
  }
</script>

<div class="taskbar">
  <div class="start-btn-wrap">
    <button class="start-btn" class:active={startOpen} on:click={toggleStart}>
      <span class="start-logo">🪟</span>
      <span>开始</span>
    </button>
  </div>

  <div class="task-buttons">
    {#each $windows as win}
      <button
        class="task-btn"
        class:active={$activeWindowId === win.id && !win.minimized}
        on:click={() => taskClick(win)}
      >
        <span class="task-icon">{iconFor(win)}</span>
        <span class="task-label">{win.title}</span>
      </button>
    {/each}
  </div>

  <div class="tray">
    {#if $settings.showTray}
      <span class="tray-icon" title="音量">🔊</span>
    {/if}
    {#if $settings.showClock}
      <span class="clock">{formatTime()}</span>
    {/if}
  </div>
</div>

{#if startOpen}
  <div class="start-menu" on:click={(e) => e.stopPropagation()}>
    <div class="start-banner">
      <span>Windows</span>
      <span class="banner-95">95</span>
    </div>
    <div class="menu-items">
      {#each startMenu as item}
        <div class="menu-item" on:click={() => onMenuClick(item)}>
          <span class="menu-icon">{item.icon}</span>
          <span class="menu-label">{item.label}</span>
          {#if item.submenu}
            <span class="menu-arrow">▶</span>
          {/if}
          {#if openSubmenu === item.label && item.submenu}
            <div class="submenu">
              {#each item.submenu as sub}
                <div class="menu-item" on:click={(e) => { e.stopPropagation(); launch(sub.appId, sub.label, sub.size); }}>
                  <span class="menu-icon">{sub.icon || '📄'}</span>
                  <span class="menu-label">{sub.label}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 34px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    display: flex;
    align-items: center;
    padding: 2px 3px;
    z-index: 1000;
  }
  .start-btn-wrap {
    flex-shrink: 0;
  }
  .start-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    font-family: var(--win-font);
    font-size: 13px;
    font-weight: bold;
    padding: 3px 8px;
    cursor: pointer;
  }
  .start-btn:active, .start-btn.active {
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
  }
  .start-logo {
    font-size: 15px;
  }
  .task-buttons {
    flex: 1;
    display: flex;
    gap: 3px;
    overflow-x: auto;
    padding: 0 4px;
  }
  .task-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 120px;
    max-width: 180px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    font-family: var(--win-font);
    font-size: 12px;
    padding: 3px 6px;
    cursor: pointer;
    overflow: hidden;
  }
  .task-btn.active {
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    background: #d4d0c8;
    font-weight: bold;
  }
  .task-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tray {
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    padding: 2px 8px;
    height: 26px;
    flex-shrink: 0;
  }
  .clock {
    font-size: 12px;
  }
  .tray-icon {
    font-size: 13px;
  }

  .start-menu {
    position: absolute;
    bottom: 36px;
    left: 3px;
    width: 200px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
    z-index: 2000;
    display: flex;
  }
  .start-banner {
    width: 26px;
    background: linear-gradient(180deg, var(--win-navy), #1084d0);
    color: #fff;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 2px;
    padding: 6px 0;
  }
  .banner-95 {
    font-size: 20px;
  }
  .menu-items {
    flex: 1;
    padding: 3px;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    cursor: default;
    position: relative;
  }
  .menu-item:hover {
    background: var(--win-navy);
    color: #fff;
  }
  .menu-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }
  .menu-label {
    flex: 1;
    font-size: 12px;
  }
  .menu-arrow {
    font-size: 9px;
  }
  .submenu {
    position: absolute;
    left: 100%;
    top: -3px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
    min-width: 180px;
    padding: 3px;
    z-index: 3000;
  }
  .submenu .menu-item:hover {
    background: var(--win-navy);
    color: #fff;
  }
</style>
