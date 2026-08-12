<script>
  import { windows, openWindow } from './windowStore.js';
  import { settings } from './settingsStore.js';
  import { playSound } from './settingsStore.js';
  import Window from './Window.svelte';
  import Notepad from './apps/Notepad.svelte';
  import Paint from './apps/Paint.svelte';
  import Calculator from './apps/Calculator.svelte';
  import Minesweeper from './apps/Minesweeper.svelte';
  import Explorer from './apps/Explorer.svelte';
  import Solitaire from './apps/Solitaire.svelte';
  import Settings from './apps/Settings.svelte';
  import DisplaySettings from './apps/DisplaySettings.svelte';
  import SoundSettings from './apps/SoundSettings.svelte';
  import SystemSettings from './apps/SystemSettings.svelte';
  import About from './apps/About.svelte';
  import Help from './apps/Help.svelte';
  import Clock from './apps/Clock.svelte';
  import Cmd from './apps/Cmd.svelte';

  const componentMap = {
    notepad: Notepad,
    paint: Paint,
    calculator: Calculator,
    minesweeper: Minesweeper,
    explorer: Explorer,
    solitaire: Solitaire,
    settings: Settings,
    display: DisplaySettings,
    sound: SoundSettings,
    system: SystemSettings,
    about: About,
    help: Help,
    clock: Clock,
    cmd: Cmd
  };

  const desktopIcons = [
    { appId: 'explorer', label: '我的电脑', icon: '🖥️' },
    { appId: 'notepad', label: '记事本', icon: '📝' },
    { appId: 'paint', label: '画图', icon: '🎨' },
    { appId: 'calculator', label: '计算器', icon: '🧮' },
    { appId: 'minesweeper', label: '扫雷', icon: '💣' },
    { appId: 'solitaire', label: '纸牌', icon: '🃏' },
    { appId: 'settings', label: '设置', icon: '⚙️' },
    { appId: 'cmd', label: 'MS-DOS', icon: '💻' }
  ];

  let selectedIcon = null;

  function launch(appId) {
    playSound('click');
    const app = { id: appId, name: appId, icon: '📄' };
    const sizes = {
      notepad: { width: 480, height: 360 },
      paint: { width: 640, height: 480 },
      calculator: { width: 280, height: 360 },
      minesweeper: { width: 300, height: 400 },
      explorer: { width: 560, height: 420 },
      solitaire: { width: 640, height: 480 },
      settings: { width: 560, height: 440 },
      display: { width: 480, height: 420 },
      sound: { width: 420, height: 360 },
      system: { width: 480, height: 420 },
      about: { width: 400, height: 320 },
      help: { width: 480, height: 400 },
      clock: { width: 300, height: 220 },
      cmd: { width: 560, height: 400 }
    };
    const size = sizes[appId] || { width: 500, height: 400 };
    openWindow(appId, { title: app.name, width: size.width, height: size.height });
  }

  function onIconClick(e, icon) {
    e.stopPropagation();
    selectedIcon = icon.appId;
  }

  function onIconDblClick(icon) {
    launch(icon.appId);
  }

  function onDesktopClick() {
    selectedIcon = null;
  }
</script>

<div
  class="desktop"
  style="background-color:{$settings.wallpaperColor};"
  on:click={onDesktopClick}
>
  <div class="desktop-icons">
    {#each desktopIcons as icon}
      <div
        class="desktop-icon"
        class:selected={selectedIcon === icon.appId}
        on:click={(e) => onIconClick(e, icon)}
        on:dblclick={() => onIconDblClick(icon)}
      >
        <div class="icon-img">{icon.icon}</div>
        <div class="icon-label">{icon.label}</div>
      </div>
    {/each}
  </div>

  {#each $windows as win}
    {#if !win.minimized}
      <Window {win} component={componentMap[win.appId] || Notepad} />
    {/if}
  {/each}
</div>

<style>
  .desktop {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .desktop-icons {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 4px;
    height: calc(100% - 20px);
    align-content: flex-start;
  }
  .desktop-icon {
    width: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 2px;
    cursor: default;
    border: 1px solid transparent;
  }
  .desktop-icon.selected {
    background: rgba(0,0,128,0.4);
    border: 1px dotted #fff;
  }
  .icon-img {
    font-size: 34px;
    line-height: 1;
    filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.4));
  }
  .icon-label {
    margin-top: 4px;
    color: #fff;
    font-size: 12px;
    text-align: center;
    text-shadow: 1px 1px 0 #000;
    line-height: 1.2;
    word-break: break-all;
  }
</style>
