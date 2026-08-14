/* ===== Calculator ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  Programs.Calculator = {
    open() {
      const state = {
        display: '0', prev: null, op: null, waiting: false,
        memory: '0'
      };

      const body = Util.el('div', { class: 'calc-body' });

      const display = Util.el('div', { class: 'calc-display' }, '0.');
      body.appendChild(display);

      // Memory row
      const memRow = Util.el('div', { class: 'calc-mem' });
      const memDisplay = Util.el('div', { class: 'calc-mem-display' }, ' ');
      memRow.appendChild(memDisplay);
      const mkBtn = (label, cls, fn, w) => {
        const b = Util.el('button', { class: 'calc-btn ' + (cls || ''), style: w ? 'min-width:' + w + 'px;flex:0 0 auto;' : '' }, label);
        b.addEventListener('click', fn);
        return b;
      };
      memRow.appendChild(mkBtn('MC', 'op', () => { state.memory = '0'; memDisplay.textContent = ' '; }));
      memRow.appendChild(mkBtn('MR', 'op', () => { state.display = state.memory; updateDisplay(); }));
      memRow.appendChild(mkBtn('MS', 'op', () => { state.memory = state.display; memDisplay.textContent = 'M'; }));
      memRow.appendChild(mkBtn('M+', 'op', () => { state.memory = String(parseFloat(state.memory) + parseFloat(state.display)); memDisplay.textContent = 'M'; }));
      body.appendChild(memRow);

      // Backspace / CE / C
      const topRow = Util.el('div', { class: 'calc-row' });
      topRow.appendChild(mkBtn('Backspace', 'op', () => {
        if (state.display.length > 1) state.display = state.display.slice(0, -1);
        else state.display = '0';
        updateDisplay();
      }, 60));
      topRow.appendChild(mkBtn('CE', 'op', () => { state.display = '0'; updateDisplay(); }));
      topRow.appendChild(mkBtn('C', 'op', () => {
        state.display = '0'; state.prev = null; state.op = null; state.waiting = false;
        updateDisplay();
      }));
      body.appendChild(topRow);

      // Number pad
      const rows = [
        ['7', '8', '9', '/', 'sqrt'],
        ['4', '5', '6', '*', '%'],
        ['1', '2', '3', '-', '1/x'],
        ['0', '+/-', '.', '+', '=']
      ];
      rows.forEach(row => {
        const r = Util.el('div', { class: 'calc-row' });
        row.forEach(k => {
          let cls = '';
          if ('/*-+'.includes(k)) cls = 'op';
          else if (k === '=') cls = 'eq';
          else if (['sqrt', '%', '1/x', '+/-'].includes(k)) cls = 'fn';
          const b = mkBtn(k, cls, () => handleKey(k));
          if (k === '0') b.style.flex = '2';
          r.appendChild(b);
        });
        body.appendChild(r);
      });

      function updateDisplay() {
        let d = state.display;
        if (d === 'Error') { display.textContent = d; return; }
        if (d.indexOf('.') === -1 && !state.waiting) d = d + '.';
        display.textContent = d;
      }

      function handleKey(k) {
        if (state.display === 'Error' && k !== 'C') {
          state.display = '0'; state.prev = null; state.op = null;
        }
        if (k >= '0' && k <= '9') {
          if (state.waiting || state.display === '0') {
            state.display = k; state.waiting = false;
          } else {
            if (state.display.length < 16) state.display += k;
          }
        } else if (k === '.') {
          if (state.waiting) { state.display = '0.'; state.waiting = false; }
          else if (state.display.indexOf('.') === -1) state.display += '.';
        } else if (k === '+/-') {
          if (state.display !== '0') state.display = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display;
        } else if (k === '/' || k === '*' || k === '-' || k === '+') {
          if (state.op && !state.waiting) compute();
          else state.prev = state.display;
          state.op = k; state.waiting = true;
        } else if (k === '=') {
          compute();
          state.op = null; state.waiting = true;
        } else if (k === 'sqrt') {
          const v = parseFloat(state.display);
          state.display = v < 0 ? 'Error' : String(Math.sqrt(v));
          state.waiting = true;
        } else if (k === '%') {
          if (state.prev != null) {
            state.display = String(parseFloat(state.prev) * parseFloat(state.display) / 100);
          }
        } else if (k === '1/x') {
          const v = parseFloat(state.display);
          state.display = v === 0 ? 'Error' : String(1 / v);
          state.waiting = true;
        }
        updateDisplay();
      }

      function compute() {
        if (state.prev == null || state.op == null) return;
        const a = parseFloat(state.prev), b = parseFloat(state.display);
        let r;
        switch (state.op) {
          case '+': r = a + b; break;
          case '-': r = a - b; break;
          case '*': r = a * b; break;
          case '/': r = b === 0 ? 'Error' : a / b; break;
        }
        if (r !== 'Error') {
          r = Math.round(r * 1e10) / 1e10;
          r = String(r);
        }
        state.display = r;
        state.prev = r;
      }

      const win = WindowManager.create({
        title: 'Calculator',
        icon: '🧮',
        width: 220, height: 270,
        x: 200, y: 80,
        resizable: false,
        maximizable: false,
        menu: [
          { label: '<u>E</u>dit', items: [
            { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => {
              navigator.clipboard && navigator.clipboard.writeText(state.display);
            }},
            { label: 'Paste', shortcut: 'Ctrl+V' }
          ]},
          { label: '<u>V</u>iew', items: [
            { label: 'Standard', onClick: () => {} },
            { label: 'Scientific' }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Calculator', onClick: () => Programs.About.open('calculator') }
          ]}
        ],
        content: body
      });
      return win;
    }
  };
})();
