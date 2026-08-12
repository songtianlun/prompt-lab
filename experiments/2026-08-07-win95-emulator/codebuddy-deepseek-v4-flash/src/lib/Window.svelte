<script>
  import { onMount } from 'svelte';
  import { windows, activeWindowId, focusWindow, closeWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } from './windowStore.js';
  import { apps } from './apps.js';
  import { playSound } from './settingsStore.js';

  export let win;
  export let component;

  let isActive = false;
  let dragging = false;
  let resizing = false;
  let dragOffset = { x: 0, y: 0 };
  let resizeDir = '';
  let startSize = { w: 0, h: 0 };
  let startPos = { x: 0, y: 0 };

  $: isActive = $activeWindowId === win.id;

  function onTitleMouseDown(e) {
    if (e.target.closest('.win-controls')) return;
    if (win.maximized) return;
    dragging = true;
    dragOffset = { x: e.clientX - win.x, y: e.clientY - win.y };
    focusWindow(win.id);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (dragging) {
      const x = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 60));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 40));
      moveWindow(win.id, x, y);
    } else if (resizing) {
      let w = startSize.w + (e.clientX - startPos.x);
      let h = startSize.h + (e.clientY - startPos.y);
      w = Math.max(200, w);
      h = Math.max(120, h);
      resizeWindow(win.id, w, h);
    }
  }

  function onMouseUp() {
    dragging = false;
    resizing = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  function onResizeStart(e, dir) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    resizeDir = dir;
    startSize = { w: win.width, h: win.height };
    startPos = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onTitleDblClick() {
    toggleMaximize(win.id);
  }

  function handleClose() {
    console.log('handleClose called for window', win.id);
    playSound('click');
    closeWindow(win.id);
  }

  function handleMinimize() {
    playSound('click');
    minimizeWindow(win.id);
  }

  function handleMaximize() {
    playSound('click');
    toggleMaximize(win.id);
  }

  function onWindowMouseDown() {
    if (!isActive) focusWindow(win.id);
  }
</script>

<div
  class="win-window"
  class:active={isActive}
  class:maximized={win.maximized}
  class:minimized={win.minimized}
  style="left:{win.maximized ? 0 : win.x}px; top:{win.maximized ? 0 : win.y}px; width:{win.maximized ? '100%' : win.width + 'px'}; height:{win.maximized ? '100%' : win.height + 'px'}; z-index:{win.z};"
  on:mousedown={onWindowMouseDown}
>
  <div class="win-titlebar" on:mousedown={onTitleMouseDown} on:dblclick={onTitleDblClick}>
    <span class="win-title-icon">{apps[win.appId]?.icon || '📄'}</span>
    <span class="win-title-text">{win.title}</span>
    <div class="win-controls">
      <button class="win-ctrl" on:mousedown={(e) => e.stopPropagation()} onclick={handleMinimize} title="最小化">_</button>
      <button class="win-ctrl" on:mousedown={(e) => e.stopPropagation()} onclick={handleMaximize} title="最大化">□</button>
      <button class="win-ctrl win-close" on:mousedown={(e) => e.stopPropagation()} onclick={handleClose} title="关闭">✕</button>
    </div>
  </div>
  <div class="win-menubar" on:mousedown={(e) => e.stopPropagation()}>
    <slot name="menubar"></slot>
  </div>
  <div class="win-content" on:mousedown={(e) => e.stopPropagation()}>
    <svelte:component this={component} {win} />
  </div>
  <div class="win-resize se" on:mousedown={(e) => onResizeStart(e, 'se')}></div>
  <div class="win-resize e" on:mousedown={(e) => onResizeStart(e, 'e')}></div>
  <div class="win-resize s" on:mousedown={(e) => onResizeStart(e, 's')}></div>
</div>

<style>
  .win-window {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
    min-width: 200px;
    min-height: 120px;
  }
  .win-window.minimized {
    display: none;
  }
  .win-titlebar {
    display: flex;
    align-items: center;
    height: 22px;
    background: linear-gradient(90deg, var(--win-navy), #1084d0);
    color: #fff;
    padding: 0 2px 0 4px;
    cursor: default;
    flex-shrink: 0;
  }
  .win-window.active .win-titlebar {
    background: linear-gradient(90deg, var(--win-navy), #1084d0);
  }
  .win-window:not(.active) .win-titlebar {
    background: var(--win-dark);
  }
  .win-title-icon {
    font-size: 13px;
    margin-right: 4px;
  }
  .win-title-text {
    flex: 1;
    font-weight: bold;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .win-controls {
    display: flex;
    gap: 2px;
  }
  .win-ctrl {
    width: 18px;
    height: 16px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #000;
  }
  .win-ctrl:active {
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
  }
  .win-close {
    font-size: 9px;
  }
  .win-menubar {
    flex-shrink: 0;
    background: var(--win-face);
    border-bottom: 1px solid var(--win-dark);
    min-height: 20px;
  }
  .win-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: var(--win-face);
  }
  .win-resize {
    position: absolute;
    z-index: 10;
  }
  .win-resize.se {
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
  }
  .win-resize.e {
    right: 0;
    top: 0;
    width: 6px;
    height: 100%;
    cursor: ew-resize;
  }
  .win-resize.s {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 6px;
    cursor: ns-resize;
  }
</style>
