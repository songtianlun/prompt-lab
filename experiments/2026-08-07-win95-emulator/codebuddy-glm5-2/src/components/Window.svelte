<script>
  import { createEventDispatcher } from 'svelte'
  import { windows } from '../lib/stores.js'

  export let win // window object from store
  export let active = false

  const dispatch = createEventDispatcher()

  let dragging = false
  let dragOffsetX = 0
  let dragOffsetY = 0
  let resizing = false
  let resizeStartX = 0
  let resizeStartY = 0
  let resizeStartW = 0
  let resizeStartH = 0

  function onTitlebarMouseDown(e) {
    if (e.target.classList.contains('titlebar-btn')) return
    if (win.maximized) return
    dragging = true
    dragOffsetX = e.clientX - win.x
    dragOffsetY = e.clientY - win.y
    dispatch('focus', win.id)
    e.preventDefault()
  }

  function onResizeMouseDown(e) {
    if (win.maximized || !win.resizable) return
    resizing = true
    resizeStartX = e.clientX
    resizeStartY = e.clientY
    resizeStartW = win.width
    resizeStartH = win.height
    dispatch('focus', win.id)
    e.preventDefault()
    e.stopPropagation()
  }

  function handleMouseMove(e) {
    if (dragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffsetX))
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffsetY))
      windows.move(win.id, newX, newY)
    } else if (resizing) {
      const newW = Math.max(200, resizeStartW + (e.clientX - resizeStartX))
      const newH = Math.max(120, resizeStartH + (e.clientY - resizeStartY))
      windows.resize(win.id, newW, newH)
    }
  }

  function handleMouseUp() {
    dragging = false
    resizing = false
  }

  function onTitlebarDoubleClick() {
    if (win.maximizable) {
      windows.toggleMaximize(win.id)
      dispatch('focus', win.id)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

{#if !win.minimized}
  <div
    class="window"
    class:maximized={win.maximized}
    style="
      left: {win.x}px;
      top: {win.y}px;
      width: {win.width}px;
      height: {win.height}px;
      z-index: {win.z};
    "
    on:mousedown={() => dispatch('focus', win.id)}
  >
    <!-- Title Bar -->
    <div
      class="titlebar"
      class:inactive={!active}
      on:mousedown={onTitlebarMouseDown}
      on:dblclick={onTitlebarDoubleClick}
    >
      {#if win.icon}
        <img class="titlebar-icon" src={win.icon} alt="" />
      {/if}
      <span class="titlebar-text">{win.title}</span>
      <div class="titlebar-buttons">
        {#if win.maximizable}
          <button
            class="titlebar-btn"
            on:click|stopPropagation={() => windows.toggleMinimize(win.id)}
            title="最小化"
          >_</button>
          <button
            class="titlebar-btn"
            on:click|stopPropagation={() => windows.toggleMaximize(win.id)}
            title="最大化"
          >□</button>
        {/if}
        <button
          class="titlebar-btn close-btn"
          on:click|stopPropagation={() => dispatch('close', win.id)}
          title="关闭"
        >✕</button>
      </div>
    </div>

    <!-- Content -->
    <div class="window-content">
      <slot />
    </div>

    <!-- Resize handle -->
    {#if win.resizable && !win.maximized}
      <div class="resize-handle" on:mousedown={onResizeMouseDown}></div>
    {/if}
  </div>
{/if}

<style>
  .window {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 1px 1px 0 #000;
    min-width: 200px;
    min-height: 120px;
  }

  .window.maximized {
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: calc(100vh - var(--taskbar-h)) !important;
    border: none;
  }

  .window-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--win-bg);
  }

  .resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    z-index: 10;
  }

  .close-btn {
    font-weight: bold;
  }
</style>
