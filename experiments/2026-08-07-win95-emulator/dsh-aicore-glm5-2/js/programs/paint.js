/* ===== Paint ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  Programs.Paint = {
    open() {
      const state = {
        tool: 'pencil', fg: '#000000', bg: '#ffffff',
        drawing: false, lastX: 0, lastY: 0,
        history: null
      };

      const body = Util.el('div', { class: 'paint-body' });

      // Toolbar with tools
      const toolbar = Util.el('div', { class: 'paint-toolbar' });
      const tools = Util.el('div', { class: 'paint-tools' });
      const toolDefs = [
        { id: 'select', icon: '⬚', label: 'Select' },
        { id: 'eraser', icon: '◻', label: 'Eraser' },
        { id: 'fill', icon: '🪣', label: 'Fill' },
        { id: 'picker', icon: '💧', label: 'Pick Color' },
        { id: 'pencil', icon: '✏️', label: 'Pencil' },
        { id: 'brush', icon: '🖌️', label: 'Brush' },
        { id: 'spray', icon: '💨', label: 'Airbrush' },
        { id: 'text', icon: 'A', label: 'Text' },
        { id: 'line', icon: '╱', label: 'Line' },
        { id: 'curve', icon: '⌒', label: 'Curve' },
        { id: 'rect', icon: '▭', label: 'Rectangle' },
        { id: 'polygon', icon: '⬠', label: 'Polygon' },
        { id: 'ellipse', icon: '◯', label: 'Ellipse' },
        { id: 'roundrect', icon: '▢', label: 'Rounded Rect' }
      ];
      toolDefs.forEach((t, i) => {
        const btn = Util.el('div', { class: 'paint-tool' + (t.id === 'pencil' ? ' active' : ''), 'data-tool': t.id, title: t.label }, t.icon);
        btn.addEventListener('click', () => {
          tools.querySelectorAll('.paint-tool').forEach(x => x.classList.remove('active'));
          btn.classList.add('active');
          state.tool = t.id;
        });
        tools.appendChild(btn);
      });
      toolbar.appendChild(tools);
      body.appendChild(toolbar);

      // Main area
      const main = Util.el('div', { class: 'paint-main' });
      const canvasArea = Util.el('div', { class: 'paint-canvas-area' });
      const canvas = Util.el('canvas', { class: 'paint-canvas', width: 400, height: 300 });
      canvasArea.appendChild(canvas);
      main.appendChild(canvasArea);

      // Palette
      const palette = Util.el('div', { class: 'paint-palette' });
      const currentColors = Util.el('div', { class: 'paint-current-colors' });
      const fgEl = Util.el('div', { class: 'paint-color-fg', style: 'background:' + state.fg });
      const bgEl = Util.el('div', { class: 'paint-color-bg', style: 'background:' + state.bg });
      currentColors.appendChild(bgEl);
      currentColors.appendChild(fgEl);
      palette.appendChild(currentColors);

      const colorGrid = Util.el('div', { class: 'paint-color-grid' });
      const colors = [
        '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
        '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
        '#808040','#004040','#0080ff','#004080','#400080','#804000','#000000','#404040'
      ];
      // Use 28 standard
      const stdColors = [
        '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
        '#808040','#004040','#0080ff','#004080','#400080','#804000','#000000','#404040',
        '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
        '#ffff80','#80ffff','#80ff80','#ff80c0','#ffc0ff','#ff8000','#8080ff','#404080'
      ];
      stdColors.forEach(c => {
        const sw = Util.el('div', { class: 'paint-color', style: 'background:' + c, 'data-color': c });
        sw.addEventListener('click', () => {
          state.fg = c;
          fgEl.style.background = c;
        });
        sw.addEventListener('contextmenu', e => {
          e.preventDefault();
          state.bg = c;
          bgEl.style.background = c;
        });
        colorGrid.appendChild(sw);
      });
      palette.appendChild(colorGrid);
      main.appendChild(palette);
      body.appendChild(main);

      // Canvas drawing
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      let shapeStart = null;
      let snapshot = null;

      canvas.addEventListener('mousedown', e => {
        if (e.button === 2) return;
        state.drawing = true;
        const p = getPos(e);
        state.lastX = p.x; state.lastY = p.y;
        shapeStart = p;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (state.tool === 'pencil' || state.tool === 'brush') {
          ctx.strokeStyle = state.fg;
          ctx.lineWidth = state.tool === 'brush' ? 4 : 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 0.1, p.y + 0.1);
          ctx.stroke();
        } else if (state.tool === 'eraser') {
          ctx.strokeStyle = state.bg;
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 0.1, p.y + 0.1);
          ctx.stroke();
        } else if (state.tool === 'fill') {
          floodFill(p.x | 0, p.y | 0, state.fg);
          state.drawing = false;
        } else if (state.tool === 'spray') {
          spray(p.x, p.y);
        }
      });

      canvas.addEventListener('mousemove', e => {
        if (!state.drawing) return;
        const p = getPos(e);
        if (state.tool === 'pencil' || state.tool === 'brush' || state.tool === 'eraser') {
          ctx.beginPath();
          ctx.moveTo(state.lastX, state.lastY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          state.lastX = p.x; state.lastY = p.y;
        } else if (state.tool === 'spray') {
          spray(p.x, p.y);
        } else if (['line','rect','ellipse','roundrect'].includes(state.tool)) {
          ctx.putImageData(snapshot, 0, 0);
          ctx.strokeStyle = state.fg;
          ctx.lineWidth = 1;
          ctx.fillStyle = 'transparent';
          if (state.tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(shapeStart.x, shapeStart.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          } else if (state.tool === 'rect') {
            ctx.strokeRect(Math.min(shapeStart.x, p.x), Math.min(shapeStart.y, p.y),
              Math.abs(p.x - shapeStart.x), Math.abs(p.y - shapeStart.y));
          } else if (state.tool === 'ellipse') {
            ctx.beginPath();
            ctx.ellipse(
              (shapeStart.x + p.x) / 2, (shapeStart.y + p.y) / 2,
              Math.abs(p.x - shapeStart.x) / 2, Math.abs(p.y - shapeStart.y) / 2,
              0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (state.tool === 'roundrect') {
            const x = Math.min(shapeStart.x, p.x), y = Math.min(shapeStart.y, p.y);
            const w = Math.abs(p.x - shapeStart.x), h = Math.abs(p.y - shapeStart.y);
            const r = Math.min(8, w / 4, h / 4);
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.stroke();
          }
        }
      });

      canvas.addEventListener('mouseup', () => { state.drawing = false; });
      canvas.addEventListener('mouseleave', () => { state.drawing = false; });
      canvas.addEventListener('contextmenu', e => e.preventDefault());

      function spray(x, y) {
        ctx.fillStyle = state.fg;
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 8;
          ctx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 1, 1);
        }
      }

      function floodFill(x, y, fillColor) {
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = img.data;
        const w = canvas.width, h = canvas.height;
        const idx = (y * w + x) * 4;
        const target = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
        const fill = hexToRgba(fillColor);
        if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2]) return;
        const stack = [[x, y]];
        while (stack.length) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
          const i = (cy * w + cx) * 4;
          if (data[i] !== target[0] || data[i+1] !== target[1] || data[i+2] !== target[2]) continue;
          data[i] = fill[0]; data[i+1] = fill[1]; data[i+2] = fill[2]; data[i+3] = 255;
          stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
        }
        ctx.putImageData(img, 0, 0);
      }

      function hexToRgba(hex) {
        const n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
      }

      const win = WindowManager.create({
        title: 'untitled - Paint',
        icon: '🎨',
        width: 540, height: 420,
        x: 100, y: 50,
        menu: [
          { label: '<u>F</u>ile', items: [
            { label: 'New', onClick: () => {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              win.title = 'untitled - Paint'; Taskbar.setTitle(win.id, win.title);
            }},
            { label: 'Open...', onClick: () => {
              const input = document.createElement('input');
              input.type = 'file'; input.accept = 'image/*';
              input.addEventListener('change', e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    win.title = file.name + ' - Paint'; Taskbar.setTitle(win.id, win.title);
                  };
                  img.src = reader.result;
                };
                reader.readAsDataURL(file);
              });
              input.click();
            }},
            { label: 'Save', onClick: () => {
              const a = document.createElement('a');
              a.href = canvas.toDataURL('image/png');
              a.download = 'untitled.png';
              a.click();
            }},
            { separator: true },
            { label: 'Exit', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>E</u>dit', items: [
            { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => {
              if (snapshot) ctx.putImageData(snapshot, 0, 0);
            }},
            { separator: true },
            { label: 'Clear Image', onClick: () => {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }}
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Paint', onClick: () => Programs.About.open('paint') }
          ]}
        ],
        content: body
      });
      return win;
    }
  };
})();
