<script>
  import { onMount } from 'svelte';

  export let win;

  let canvas;
  let ctx;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let color = '#000000';
  let brushSize = 3;
  let tool = 'pencil';

  const colors = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000', '#ffffff', '#c0c0c0'
  ];

  onMount(() => {
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function onDown(e) {
    drawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
    if (tool === 'fill') {
      floodFill(Math.floor(p.x), Math.floor(p.y), color);
    } else {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
  }

  function onMove(e) {
    if (!drawing) return;
    const p = getPos(e);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 3;
    }
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }

  function onUp() {
    drawing = false;
  }

  function floodFill(x, y, fillColor) {
    const w = canvas.width;
    const h = canvas.height;
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const targetIdx = (y * w + x) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];
    const [fr, fg, fb] = hexToRgb(fillColor);
    if (targetR === fr && targetG === fg && targetB === fb) return;

    const stack = [[x, y]];
    const visited = new Uint8Array(w * h);
    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
      const idx = cy * w + cx;
      if (visited[idx]) continue;
      const pi = idx * 4;
      if (data[pi] === targetR && data[pi+1] === targetG && data[pi+2] === targetB && data[pi+3] === targetA) {
        visited[idx] = 1;
        data[pi] = fr;
        data[pi+1] = fg;
        data[pi+2] = fb;
        data[pi+3] = 255;
        stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function saveImage() {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = '未命名.png';
    a.click();
  }
</script>

<div class="paint">
  <div class="toolbar">
    <button class="tool-btn" class:active={tool==='pencil'} onclick={() => tool='pencil'} title="铅笔">✏️</button>
    <button class="tool-btn" class:active={tool==='brush'} onclick={() => tool='brush'} title="画笔">🖌️</button>
    <button class="tool-btn" class:active={tool==='eraser'} onclick={() => tool='eraser'} title="橡皮">🧽</button>
    <button class="tool-btn" class:active={tool==='fill'} onclick={() => tool='fill'} title="填充">🪣</button>
    <span class="sep"></span>
    <button class="tool-btn" onclick={clearCanvas} title="清空">🗑️</button>
    <button class="tool-btn" onclick={saveImage} title="保存">💾</button>
  </div>
  <div class="main">
    <div class="palette">
      {#each colors as c}
        <div
          class="color-swatch"
          class:selected={color === c}
          style="background:{c};"
          onclick={() => color = c}
        ></div>
      {/each}
      <div class="brush-row">
        <span>粗细</span>
        {#each [1, 3, 6, 10] as s}
          <button class="brush-btn" class:active={brushSize===s} onclick={() => brushSize=s}>{s}</button>
        {/each}
      </div>
    </div>
    <div class="canvas-wrap">
      <canvas
        bind:this={canvas}
        width="600"
        height="400"
        on:mousedown={onDown}
        on:mousemove={onMove}
        on:mouseup={onUp}
        on:mouseleave={onUp}
      ></canvas>
    </div>
  </div>
</div>

<style>
  .paint {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-face);
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-bottom: 1px solid var(--win-dark);
  }
  .tool-btn {
    width: 28px;
    height: 28px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    cursor: pointer;
    font-size: 15px;
  }
  .tool-btn.active {
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    background: #d4d0c8;
  }
  .sep {
    width: 2px;
    height: 24px;
    background: var(--win-dark);
    margin: 0 4px;
  }
  .main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .palette {
    width: 60px;
    padding: 4px;
    border-right: 1px solid var(--win-dark);
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
  }
  .color-swatch {
    width: 24px;
    height: 24px;
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    cursor: pointer;
  }
  .color-swatch.selected {
    outline: 2px solid var(--win-navy);
    outline-offset: -2px;
  }
  .brush-row {
    margin-top: 8px;
    font-size: 11px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .brush-btn {
    width: 24px;
    background: var(--win-face);
    border: 1px solid var(--win-dark);
    cursor: pointer;
    font-size: 10px;
  }
  .brush-btn.active {
    background: var(--win-navy);
    color: #fff;
  }
  .canvas-wrap {
    flex: 1;
    overflow: auto;
    padding: 8px;
    background: var(--win-dark);
  }
  canvas {
    background: #fff;
    cursor: crosshair;
    box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
  }
</style>
