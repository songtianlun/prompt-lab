<script>
  import { onMount, onDestroy } from 'svelte'

  let canvas
  let ctx
  let currentTool = 'pencil'
  let currentColor = '#000000'
  let isDrawing = false
  let startX = 0
  let startY = 0
  let snapshot = null
  let brushSize = 1

  const colors = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#808040', '#004040', '#0080ff', '#004080', '#4000ff', '#804000',
    '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
  ]

  const tools = [
    { id: 'pencil', label: '✏', title: '铅笔' },
    { id: 'eraser', label: '⬜', title: '橡皮' },
    { id: 'fill', label: '🪣', title: '填充' },
    { id: 'line', label: '╱', title: '直线' },
    { id: 'rect', label: '▭', title: '矩形' },
    { id: 'ellipse', label: '◯', title: '椭圆' }
  ]

  onMount(() => {
    ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  })

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    }
  }

  function onMouseDown(e) {
    const pos = getMousePos(e)
    startX = pos.x
    startY = pos.y
    isDrawing = true

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      drawLine(startX, startY, startX, startY)
    } else if (currentTool === 'fill') {
      floodFill(startX, startY, currentColor)
      isDrawing = false
    } else {
      // Save snapshot for shape preview
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }
  }

  function onMouseMove(e) {
    if (!isDrawing) return
    const pos = getMousePos(e)

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      drawLine(startX, startY, pos.x, pos.y)
      startX = pos.x
      startY = pos.y
    } else if (snapshot) {
      // Restore and draw shape preview
      ctx.putImageData(snapshot, 0, 0)
      drawShape(startX, startY, pos.x, pos.y)
    }
  }

  function onMouseUp(e) {
    if (!isDrawing) return
    isDrawing = false
    snapshot = null
  }

  function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor
    ctx.lineWidth = currentTool === 'eraser' ? brushSize * 3 : brushSize
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  function drawShape(x1, y1, x2, y2) {
    ctx.strokeStyle = currentColor
    ctx.lineWidth = brushSize
    ctx.beginPath()
    if (currentTool === 'line') {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    } else if (currentTool === 'rect') {
      ctx.strokeRect(
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
      )
    } else if (currentTool === 'ellipse') {
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const rx = Math.abs(x2 - x1) / 2
      const ry = Math.abs(y2 - y1) / 2
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  function floodFill(x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const w = canvas.width
    const h = canvas.height

    const idx = (y * w + x) * 4
    const targetR = data[idx]
    const targetG = data[idx + 1]
    const targetB = data[idx + 2]

    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16)
    const fillG = parseInt(fillColor.slice(3, 5), 16)
    const fillB = parseInt(fillColor.slice(5, 7), 16)

    if (targetR === fillR && targetG === fillG && targetB === fillB) return

    const stack = [[x, y]]
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue
      const i = (cy * w + cx) * 4
      if (data[i] !== targetR || data[i + 1] !== targetG || data[i + 2] !== targetB) continue
      data[i] = fillR
      data[i + 1] = fillG
      data[i + 2] = fillB
      data[i + 3] = 255
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    }
    ctx.putImageData(imageData, 0, 0)
  }

  function clearCanvas() {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function saveImage() {
    const link = document.createElement('a')
    link.download = 'paint.png'
    link.href = canvas.toDataURL()
    link.click()
  }
</script>

<div class="paint">
  <!-- Toolbar -->
  <div class="paint-toolbar">
    <div class="tool-group">
      {#each tools as tool}
        <button
          class="tool-btn"
          class:active={currentTool === tool.id}
          on:click={() => currentTool = tool.id}
          title={tool.title}
        >{tool.label}</button>
      {/each}
    </div>
    <div class="size-group">
      <button class="size-btn" class:active={brushSize === 1} on:click={() => brushSize = 1} title="细">
        <div class="size-dot" style="width:2px;height:2px"></div>
      </button>
      <button class="size-btn" class:active={brushSize === 3} on:click={() => brushSize = 3} title="中">
        <div class="size-dot" style="width:5px;height:5px"></div>
      </button>
      <button class="size-btn" class:active={brushSize === 6} on:click={() => brushSize = 6} title="粗">
        <div class="size-dot" style="width:9px;height:9px"></div>
      </button>
    </div>
    <div class="action-group">
      <button class="btn95" on:click={clearCanvas}>清除</button>
      <button class="btn95" on:click={saveImage}>保存</button>
    </div>
  </div>

  <!-- Canvas Area -->
  <div class="paint-canvas-area">
    <canvas
      bind:this={canvas}
      width="540"
      height="340"
      on:mousedown={onMouseDown}
      on:mousemove={onMouseMove}
      on:mouseup={onMouseUp}
      on:mouseleave={onMouseUp}
      class="paint-canvas"
    ></canvas>
  </div>

  <!-- Color Palette -->
  <div class="paint-colors">
    <div class="current-colors">
      <div class="color-swatch current" style="background: {currentColor}"></div>
    </div>
    <div class="color-palette">
      {#each colors as color}
        <button
          class="color-swatch"
          class:selected={currentColor === color}
          style="background: {color}"
          on:click={() => currentColor = color}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .paint {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-bg);
    padding: 4px;
    gap: 4px;
  }

  .paint-toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 2px 4px;
    background: var(--win-bg);
    border-bottom: 1px solid var(--btn-shadow);
    padding-bottom: 4px;
  }

  .tool-group {
    display: flex;
    gap: 2px;
  }

  .tool-btn {
    width: 26px;
    height: 26px;
    background: var(--btn-face);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: default;
    padding: 0;
  }

  .tool-btn.active {
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
    background: #d4d0c8;
  }

  .size-group {
    display: flex;
    gap: 2px;
  }

  .size-btn {
    width: 26px;
    height: 26px;
    background: var(--btn-face);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    padding: 0;
  }

  .size-btn.active {
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
  }

  .size-dot {
    background: #000;
    border-radius: 50%;
  }

  .action-group {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  .action-group .btn95 {
    padding: 2px 8px;
    min-width: 50px;
  }

  .paint-canvas-area {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #808080;
    padding: 4px;
  }

  .paint-canvas {
    background: white;
    cursor: crosshair;
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
  }

  .paint-colors {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px;
    background: var(--win-bg);
    border-top: 1px solid var(--btn-highlight);
  }

  .current-colors {
    display: flex;
    gap: 2px;
  }

  .color-swatch {
    width: 16px;
    height: 16px;
    border-top: 1px solid var(--btn-darkshadow);
    border-left: 1px solid var(--btn-shadow);
    border-right: 1px solid var(--btn-highlight);
    border-bottom: 1px solid var(--btn-light);
    cursor: default;
    padding: 0;
  }

  .color-swatch.current {
    width: 28px;
    height: 28px;
  }

  .color-palette {
    display: grid;
    grid-template-columns: repeat(14, 16px);
    grid-template-rows: repeat(2, 16px);
    gap: 1px;
  }

  .color-swatch.selected {
    outline: 1px solid var(--win-white);
    outline-offset: 1px;
  }
</style>
