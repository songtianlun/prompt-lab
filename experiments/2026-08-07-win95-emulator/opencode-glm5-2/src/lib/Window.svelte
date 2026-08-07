<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import Icon from './Icon.svelte'
  import { activeId } from './stores.js'

  export let win // window state object
  export let desktopBounds = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight - 28 }

  const dispatch = createEventDispatcher()
  const TASKBAR = 28

  let dragging = false
  let dragOffset = { x: 0, y: 0 }
  let resizing = false
  let resizeStart = null

  $: isActive = $activeId === win.id
  $: rect = win.maximized
    ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight - TASKBAR }
    : { left: win.x, top: win.y, width: win.width, height: win.height }

  function focusSelf() {
    dispatch('focus', win.id)
  }

  function onTitlePointerDown(e) {
    if (e.button !== 0) return
    if (win.maximized) return
    focusSelf()
    dragging = true
    dragOffset = { x: e.clientX - win.x, y: e.clientY - win.y }
    e.target.setPointerCapture?.(e.pointerId)
  }

  function onPointerMove(e) {
    if (dragging) {
      let nx = e.clientX - dragOffset.x
      let ny = e.clientY - dragOffset.y
      const maxX = window.innerWidth - 40
      const maxY = window.innerHeight - TASKBAR - 20
      nx = Math.max(-win.width + 60, Math.min(nx, maxX))
      ny = Math.max(0, Math.min(ny, maxY))
      dispatch('move', { id: win.id, x: nx, y: ny })
    } else if (resizing) {
      const dw = e.clientX - resizeStart.x
      const dh = e.clientY - resizeStart.y
      const nw = Math.max(160, resizeStart.width + dw)
      const nh = Math.max(100, resizeStart.height + dh)
      dispatch('resize', { id: win.id, width: nw, height: nh })
    }
  }

  function onPointerUp() {
    dragging = false
    resizing = false
  }

  function onResizePointerDown(e) {
    if (e.button !== 0) return
    e.stopPropagation()
    focusSelf()
    resizing = true
    resizeStart = { x: e.clientX, y: e.clientY, width: win.width, height: win.height }
    e.target.setPointerCapture?.(e.pointerId)
  }

  function onTitleDouble() {
    if (win.resizable) dispatch('maximize', win.id)
  }
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={onPointerUp} />

<div
  class="w95-window"
  class:active={isActive}
  class:minimized={win.minimized}
  style="left:{rect.left}px; top:{rect.top}px; width:{rect.width}px; height:{rect.height}px; z-index:{win.zIndex};"
  on:pointerdown={focusSelf}
  role="window"
>
  <div
    class="title-bar"
    on:pointerdown={onTitlePointerDown}
    on:dblclick={onTitleDouble}
  >
    <span class="title-icon"><Icon name={win.icon} size={16} /></span>
    <span class="title-text">{win.title}</span>
    <span class="title-buttons">
      <button
        class="w95-titlebar-btn"
        title="最小化"
        on:pointerdown|stopPropagation
        on:click={(e) => { e.stopPropagation(); dispatch('minimize', win.id) }}
      >_</button>
      {#if win.resizable}
        <button
          class="w95-titlebar-btn"
          title="最大化"
          on:pointerdown|stopPropagation
          on:click={(e) => { e.stopPropagation(); dispatch('maximize', win.id) }}
        >{win.maximized ? '❐' : '□'}</button>
      {/if}
      <button
        class="w95-titlebar-btn close-btn"
        title="关闭"
        on:pointerdown|stopPropagation
        on:click={(e) => { e.stopPropagation(); dispatch('close', win.id) }}
      >✕</button>
    </span>
  </div>

  <div class="window-body w95-scroll">
    <slot {win} />
  </div>

  {#if win.resizable && !win.maximized}
    <div
      class="resize-handle"
      on:pointerdown={onResizePointerDown}
    ></div>
  {/if}
</div>

<style>
  .w95-window {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--w95-surface);
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
    padding: 2px;
  }
  .w95-window.minimized { display: none; }

  .title-bar {
    height: 18px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 2px 1px 3px;
    background: linear-gradient(90deg, var(--w95-titlebar-inactive) 0%, var(--w95-titlebar-inactive-end) 100%);
    color: #c0c0c0;
    cursor: default;
    flex-shrink: 0;
  }
  .w95-window.active .title-bar {
    background: linear-gradient(90deg, var(--w95-titlebar-active) 0%, var(--w95-titlebar-active-end) 100%);
    color: #ffffff;
  }
  .title-icon {
    display: flex;
    align-items: center;
    line-height: 0;
  }
  .title-text {
    flex: 1;
    font-weight: bold;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.2px;
  }
  .title-buttons {
    display: flex;
    gap: 2px;
  }
  .close-btn { font-weight: bold; }

  .window-body {
    flex: 1;
    overflow: auto;
    margin-top: 2px;
    position: relative;
  }

  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 14px;
    height: 14px;
    cursor: nwse-resize;
    background-image:
      linear-gradient(135deg, transparent 0 40%, #808080 40% 45%, transparent 45% 60%, #808080 60% 65%, transparent 65% 80%, #808080 80% 85%, transparent 85%);
  }
</style>
