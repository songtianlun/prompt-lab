<script>
  import { onMount } from 'svelte';

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  let board = [];
  let revealed = [];
  let flagged = [];
  let gameOver = false;
  let won = false;
  let firstClick = true;
  let minesLeft = MINES;
  let time = 0;
  let timer = null;

  function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    gameOver = false;
    won = false;
    firstClick = true;
    minesLeft = MINES;
    time = 0;
    if (timer) clearInterval(timer);
    timer = null;
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (board[r][c] === -1) continue;
      if (r === safeR && c === safeC) continue;
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      board[r][c] = -1;
      placed++;
    }
    // 计算数字
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === -1) count++;
          }
        }
        board[r][c] = count;
      }
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      time++;
      if (time >= 999) clearInterval(timer);
    }, 1000);
  }

  function reveal(r, c) {
    if (gameOver || won) return;
    if (revealed[r][c] || flagged[r][c]) return;
    if (firstClick) {
      placeMines(r, c);
      firstClick = false;
      startTimer();
    }
    revealed[r][c] = true;
    if (board[r][c] === -1) {
      gameOver = true;
      if (timer) clearInterval(timer);
      revealAllMines();
      return;
    }
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !revealed[nr][nc] && !flagged[nr][nc]) {
            reveal(nr, nc);
          }
        }
      }
    }
    checkWin();
  }

  function toggleFlag(r, c) {
    if (gameOver || won) return;
    if (revealed[r][c]) return;
    if (firstClick) return;
    flagged[r][c] = !flagged[r][c];
    minesLeft = MINES - flagged.flat().filter(Boolean).length;
  }

  function revealAllMines() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === -1) revealed[r][c] = true;
      }
    }
  }

  function checkWin() {
    let count = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (revealed[r][c]) count++;
      }
    }
    if (count === ROWS * COLS - MINES) {
      won = true;
      if (timer) clearInterval(timer);
    }
  }

  function onRightClick(e, r, c) {
    e.preventDefault();
    toggleFlag(r, c);
  }

  function cellClass(r, c) {
    if (revealed[r][c]) return 'cell revealed';
    return 'cell';
  }

  function cellContent(r, c) {
    if (!revealed[r][c]) {
      return flagged[r][c] ? '🚩' : '';
    }
    if (board[r][c] === -1) return '💣';
    if (board[r][c] === 0) return '';
    return board[r][c];
  }

  function cellColor(r, c) {
    const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
    return colors[board[r][c]] || '';
  }

  onMount(init);
</script>

<div class="mine">
  <div class="header">
    <div class="counter">{String(minesLeft).padStart(3, '0')}</div>
    <button class="face" onclick={init}>{gameOver ? '😵' : won ? '😎' : '🙂'}</button>
    <div class="counter">{String(time).padStart(3, '0')}</div>
  </div>
  <div class="board">
    {#each board as row, r}
      <div class="row">
        {#each row as cell, c}
          <div
            class={cellClass(r, c)}
            style="color:{cellColor(r, c)};"
            on:click={() => reveal(r, c)}
            on:contextmenu={(e) => onRightClick(e, r, c)}
          >{cellContent(r, c)}</div>
        {/each}
      </div>
    {/each}
  </div>
  {#if gameOver}
    <div class="msg">游戏结束！点击笑脸重新开始</div>
  {:else if won}
    <div class="msg">恭喜你赢了！🎉</div>
  {/if}
</div>

<style>
  .mine {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 8px;
    background: var(--win-face);
    gap: 8px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--win-face);
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    padding: 4px 8px;
  }
  .counter {
    background: #000;
    color: #f00;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    padding: 2px 4px;
    min-width: 50px;
    text-align: center;
  }
  .face {
    font-size: 22px;
    width: 40px;
    height: 40px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    cursor: pointer;
  }
  .board {
    background: var(--win-face);
    border-top: 2px solid var(--win-dark);
    border-left: 2px solid var(--win-dark);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    padding: 4px;
  }
  .row {
    display: flex;
  }
  .cell {
    width: 24px;
    height: 24px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    cursor: default;
  }
  .cell.revealed {
    border: 1px solid var(--win-dark);
    background: #d4d0c8;
  }
  .msg {
    font-size: 12px;
    color: var(--win-navy);
  }
</style>
