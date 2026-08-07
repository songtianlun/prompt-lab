<script>
  let { win, manager } = $props()

  let dragOff = $state({ x: 0, y: 0 })
  let startPos = $state(null)

  function onTitleMouseDown(e) {
    if (e.button !== 0 || win.maximized) return
    if (e.target.closest('button')) return
    manager.moveToFront(win.id)
    dragOff = { x: e.clientX - win.x, y: e.clientY - win.y }
    const onMove = (ev) => {
      let nx = ev.clientX - dragOff.x
      let ny = ev.clientY - dragOff.y
      nx = Math.max(0, Math.min(nx, window.innerWidth - 120))
      ny = Math.max(0, Math.min(ny, window.innerHeight - 60))
      manager.focus(win.id)
      manager.updatePos(win.id, nx, ny, win.width, win.height)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function onResizeStart(e, dir) {
    if (win.maximized) return
    e.preventDefault()
    e.stopPropagation()
    manager.moveToFront(win.id)
    startPos = { cx: e.clientX, cy: e.clientY, x: win.x, y: win.y, w: win.width, h: win.height }
    const onMove = (ev) => {
      let dx = ev.clientX - startPos.cx
      let dy = ev.clientY - startPos.cy
      let { x, y, w, h } = startPos
      if (dir.includes('e')) w = Math.max(150, startPos.w + dx)
      if (dir.includes('s')) h = Math.max(80, startPos.h + dy)
      if (dir.includes('w')) {
        x = startPos.x + dx
        w = startPos.w - dx
      }
      if (dir.includes('n')) {
        y = startPos.y + dy
        h = startPos.h - dy
      }
      manager.updatePos(win.id, x, y, w, h)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function onTopClick() {
    manager.moveToFront(win.id)
  }
</script>

{#if win.minimized}
  <!-- minimized windows hidden -->
{:else}
  <div
    class="w95-window"
    class:maximized={win.maximized}
    style="left:{win.maximized ? 0 : win.x}px; top:{win.maximized ? 0 : win.y}px; width:{win.maximized ? '100%' : win.width + 'px'}; height:{win.maximized ? '100%' : win.height + 'px'}; z-index:{win.z};"
    onmousedown={onTopClick}
  >
    <div
      class="w95-titlebar {manager.focusId && manager.focusId() !== win.id ? 'inactive' : ''}"
      onmousedown={onTitleMouseDown} ondblclick={() => manager.toggleMaximize(win.id)}
    >
      {#if win.icon}
        <span class="icon"><win.icon width={14} height={14} /></span>
      {/if}
      <span class="title">{win.title}</span>
      <button class="w95-titlebtn" onclick={() => manager.minimize(win.id)}>─</button>
      <button class="w95-titlebtn" onclick={() => manager.toggleMaximize(win.id)}>□</button>
      <button class="w95-titlebtn" onclick={() => manager.close(win.id)}>✕</button>
    </div>
    <div class="w95-window-content" onmousedown={() => manager.moveToFront(win.id)}>
      <win.app props={win.props} />
    </div>
    {#if !win.maximized}
      <div class="resize s" onmousedown={(e) => onResizeStart(e, 's')}></div>
      <div class="resize e" onmousedown={(e) => onResizeStart(e, 'e')}></div>
      <div class="resize se" onmousedown={(e) => onResizeStart(e, 'se')}></div>
      <div class="resize sw" onmousedown={(e) => onResizeStart(e, 'sw')}></div>
      <div class="resize n" onmousedown={(e) => onResizeStart(e, 'n')}></div>
      <div class="resize w" onmousedown={(e) => onResizeStart(e, 'w')}></div>
      <div class="resize ne" onmousedown={(e) => onResizeStart(e, 'ne')}></div>
      <div class="resize nw" onmousedown={(e) => onResizeStart(e, 'nw')}></div>
    {/if}
  </div>
{/if}

<style>
  .w95-window-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
  .w95-window.maximized {
    border: none;
    box-shadow: none;
  }
  .resize {
    position: absolute;
    z-index: 5;
  }
  .resize.s, .resize.n { left: 3px; right: 3px; height: 4px; cursor: ns-resize; }
  .resize.s { bottom: 0; }
  .resize.n { top: 0; cursor: ns-resize; }
  .resize.e, .resize.w { top: 3px; bottom: 3px; width: 4px; cursor: ew-resize; }
  .resize.e { right: 0; }
  .resize.w { left: 0; }
  .resize.se { right: 0; bottom: 0; width: 8px; height: 8px; cursor: nwse-resize; }
  .resize.sw { left: 0; bottom: 0; width: 8px; height: 8px; cursor: nesw-resize; }
  .resize.ne { right: 0; top: 0; width: 8px; height: 8px; cursor: nesw-resize; }
  .resize.nw { left: 0; top: 0; width: 8px; height: 8px; cursor: nwse-resize; }
</style>
