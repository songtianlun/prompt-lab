/* ===== Minesweeper ===== */
(function() {
  if (!window.Programs) window.Programs = {};

  Programs.Minesweeper = {
    open() {
      const ROWS = 9, COLS = 9, MINES = 10;
      const state = {
        grid: [], revealed: [], flagged: [],
        gameOver: false, won: false, started: false,
        minesLeft: MINES, time: 0, timer: null
      };

      const body = Util.el('div', { class: 'mine-body' });
      const frame = Util.el('div', { class: 'mine-frame' });
      const header = Util.el('div', { class: 'mine-header' });
      const counter = Util.el('div', { class: 'mine-counter' }, '010');
      const face = Util.el('div', { class: 'mine-face' }, '🙂');
      const timerEl = Util.el('div', { class: 'mine-counter' }, '000');
      header.appendChild(counter);
      header.appendChild(face);
      header.appendChild(timerEl);
      frame.appendChild(header);

      const grid = Util.el('div', { class: 'mine-grid' });
      grid.style.gridTemplateColumns = 'repeat(' + COLS + ', 16px)';

      function initGrid() {
        state.grid = []; state.revealed = []; state.flagged = [];
        state.gameOver = false; state.won = false; state.started = false;
        state.minesLeft = MINES; state.time = 0;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }
        counter.textContent = String(MINES).padStart(3, '0');
        timerEl.textContent = '000';
        face.textContent = '🙂';
        grid.innerHTML = '';
        for (let r = 0; r < ROWS; r++) {
          state.grid[r] = []; state.revealed[r] = []; state.flagged[r] = [];
          for (let c = 0; c < COLS; c++) {
            state.grid[r][c] = 0;
            state.revealed[r][c] = false;
            state.flagged[r][c] = false;
            const cell = Util.el('div', { class: 'mine-cell', 'data-r': r, 'data-c': c });
            cell.addEventListener('mousedown', e => {
              if (state.gameOver) return;
              if (e.button === 0 && !state.flagged[r][c]) face.textContent = '😮';
            });
            cell.addEventListener('mouseup', () => {
              if (state.gameOver) return;
              face.textContent = '🙂';
            });
            cell.addEventListener('click', e => {
              if (state.gameOver) return;
              reveal(r, c);
            });
            cell.addEventListener('contextmenu', e => {
              e.preventDefault();
              if (state.gameOver || state.revealed[r][c]) return;
              toggleFlag(r, c);
            });
            grid.appendChild(cell);
          }
        }
      }

      function placeMines(excludeR, excludeC) {
        let placed = 0;
        while (placed < MINES) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          if (state.grid[r][c] === -1) continue;
          if (Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1) continue;
          state.grid[r][c] = -1;
          placed++;
        }
        // Calculate numbers
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (state.grid[r][c] === -1) continue;
            let n = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && state.grid[nr][nc] === -1) n++;
              }
            }
            state.grid[r][c] = n;
          }
        }
      }

      function reveal(r, c) {
        if (state.revealed[r][c] || state.flagged[r][c]) return;
        if (!state.started) {
          placeMines(r, c);
          state.started = true;
          state.timer = setInterval(() => {
            state.time++;
            if (state.time > 999) state.time = 999;
            timerEl.textContent = String(state.time).padStart(3, '0');
          }, 1000);
        }
        state.revealed[r][c] = true;
        const cell = grid.children[r * COLS + c];
        cell.classList.add('revealed');
        if (state.grid[r][c] === -1) {
          cell.classList.add('mine');
          cell.textContent = '💣';
          gameOver(false);
          return;
        }
        if (state.grid[r][c] > 0) {
          cell.textContent = state.grid[r][c];
          cell.classList.add('n' + state.grid[r][c]);
        } else {
          // Flood fill
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !state.revealed[nr][nc]) {
                reveal(nr, nc);
              }
            }
          }
        }
        checkWin();
      }

      function toggleFlag(r, c) {
        if (state.revealed[r][c]) return;
        state.flagged[r][c] = !state.flagged[r][c];
        const cell = grid.children[r * COLS + c];
        cell.textContent = state.flagged[r][c] ? '🚩' : '';
        state.minesLeft += state.flagged[r][c] ? -1 : 1;
        counter.textContent = String(Math.max(-99, state.minesLeft)).padStart(3, '0');
      }

      function checkWin() {
        let unrevealed = 0;
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (!state.revealed[r][c]) unrevealed++;
        if (unrevealed === MINES) gameOver(true);
      }

      function gameOver(won) {
        state.gameOver = true; state.won = won;
        if (state.timer) { clearInterval(state.timer); state.timer = null; }
        face.textContent = won ? '😎' : '😵';
        // Reveal all mines
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (state.grid[r][c] === -1 && !state.revealed[r][c]) {
              const cell = grid.children[r * COLS + c];
              cell.classList.add('revealed');
              if (!state.flagged[r][c]) {
                cell.classList.add('mine');
                cell.textContent = '💣';
              }
            }
            if (state.flagged[r][c] && state.grid[r][c] !== -1) {
              const cell = grid.children[r * COLS + c];
              cell.textContent = '❌';
            }
          }
        }
      }

      face.addEventListener('click', initGrid);

      frame.appendChild(grid);
      body.appendChild(frame);

      initGrid();

      const win = WindowManager.create({
        title: 'Minesweeper',
        icon: '💣',
        width: 168, height: 250,
        x: 250, y: 100,
        resizable: false,
        maximizable: false,
        menu: [
          { label: '<u>G</u>ame', items: [
            { label: 'New', shortcut: 'F2', onClick: initGrid },
            { separator: true },
            { label: 'Beginner', onClick: () => {} },
            { label: 'Intermediate' },
            { label: 'Expert' },
            { separator: true },
            { label: 'Exit', onClick: () => WindowManager.close(win.id) }
          ]},
          { label: '<u>H</u>elp', items: [
            { label: 'About Minesweeper', onClick: () => Programs.About.open('minesweeper') }
          ]}
        ],
        content: body,
        onClose: () => { if (state.timer) clearInterval(state.timer); }
      });
      return win;
    }
  };
})();
