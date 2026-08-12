<script>
  import { onMount } from 'svelte'

  const ROWS = 9
  const COLS = 9
  const MINES = 10

  let board = []
  let gameState = 'ready' // ready, playing, won, lost
  let mineCount = MINES
  let timer = 0
  let timerInterval = null
  let revealedCount = 0

  function initBoard() {
    board = []
    for (let r = 0; r < ROWS; r++) {
      const row = []
      for (let c = 0; c < COLS; c++) {
        row.push({
          mine: false,
          revealed: false,
          flagged: false,
          adjacent: 0
        })
      }
      board.push(row)
    }
  }

  function placeMines(excludeR, excludeC) {
    let placed = 0
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS)
      const c = Math.floor(Math.random() * COLS)
      // Don't place on first clicked cell
      if (r === excludeR && c === excludeC) continue
      if (board[r][c].mine) continue
      board[r][c].mine = true
      placed++
    }
    // Calculate adjacent counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].mine) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
              count++
            }
          }
        }
        board[r][c].adjacent = count
      }
    }
  }

  function reveal(r, c) {
    if (gameState === 'won' || gameState === 'lost') return
    if (board[r][c].revealed || board[r][c].flagged) return

    if (gameState === 'ready') {
      placeMines(r, c)
      gameState = 'playing'
      startTimer()
    }

    if (board[r][c].mine) {
      // Game over
      board[r][c].revealed = true
      gameState = 'lost'
      stopTimer()
      // Reveal all mines
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (board[i][j].mine) board[i][j].revealed = true
        }
      }
      board = board
      return
    }

    // Flood fill for empty cells
    const stack = [[r, c]]
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()
      if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue
      if (board[cr][cc].revealed || board[cr][cc].flagged || board[cr][cc].mine) continue
      board[cr][cc].revealed = true
      revealedCount++
      if (board[cr][cc].adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            stack.push([cr + dr, cc + dc])
          }
        }
      }
    }
    board = board

    // Check win
    if (revealedCount === ROWS * COLS - MINES) {
      gameState = 'won'
      stopTimer()
      // Flag all mines
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (board[i][j].mine) board[i][j].flagged = true
        }
      }
      board = board
    }
  }

  function toggleFlag(e, r, c) {
    e.preventDefault()
    if (gameState === 'won' || gameState === 'lost') return
    if (board[r][c].revealed) return
    board[r][c].flagged = !board[r][c].flagged
    mineCount += board[r][c].flagged ? -1 : 1
    board = board
  }

  function startTimer() {
    timer = 0
    timerInterval = setInterval(() => {
      timer = Math.min(999, timer + 1)
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function newGame() {
    stopTimer()
    initBoard()
    gameState = 'ready'
    mineCount = MINES
    timer = 0
    revealedCount = 0
  }

  $: face = gameState === 'lost' ? '😵' : gameState === 'won' ? '😎' : '🙂'

  function pad3(n) {
    return n.toString().padStart(3, '0')
  }

  onMount(() => {
    initBoard()
    return () => stopTimer()
  })
</script>

<div class="minesweeper">
  <!-- Header -->
  <div class="ms-header bevel-out">
    <div class="ms-counter bevel-in-thin">{pad3(mineCount)}</div>
    <button class="ms-face-btn btn95" on:click={newGame}>{face}</button>
    <div class="ms-counter bevel-in-thin">{pad3(timer)}</div>
  </div>

  <!-- Game Board -->
  <div class="ms-board bevel-in">
    {#each board as row, r}
      {#each row as cell, c}
        <button
          class="ms-cell"
          class:revealed={cell.revealed}
          class:mine={cell.revealed && cell.mine}
          class:exploded={gameState === 'lost' && cell.revealed && cell.mine}
          on:click={() => reveal(r, c)}
          on:contextmenu={(e) => toggleFlag(e, r, c)}
          disabled={gameState === 'won' || gameState === 'lost'}
        >
          {#if cell.revealed}
            {#if cell.mine}
              💣
            {:else if cell.adjacent > 0}
              <span class="adj-{cell.adjacent}">{cell.adjacent}</span>
            {/if}
          {:else if cell.flagged}
            🚩
          {/if}
        </button>
      {/each}
    {/each}
  </div>

  {#if gameState === 'won'}
    <div class="ms-status">恭喜！你赢了！用时 {timer} 秒</div>
  {:else if gameState === 'lost'}
    <div class="ms-status">游戏结束！点击表情重新开始</div>
  {/if}
</div>

<style>
  .minesweeper {
    display: flex;
    flex-direction: column;
    padding: 6px;
    gap: 6px;
    height: 100%;
    background: var(--win-bg);
    align-items: center;
  }

  .ms-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 6px;
    background: var(--win-bg);
  }

  .ms-counter {
    background: black;
    color: #ff0000;
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: bold;
    padding: 2px 4px;
    min-width: 48px;
    text-align: center;
    letter-spacing: 1px;
  }

  .ms-face-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
    padding: 2px;
    min-width: 32px;
  }

  .ms-board {
    display: grid;
    grid-template-columns: repeat(9, 22px);
    grid-template-rows: repeat(9, 22px);
    gap: 0;
    padding: 4px;
    background: var(--win-bg);
  }

  .ms-cell {
    width: 22px;
    height: 22px;
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    background: var(--btn-face);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    padding: 0;
    cursor: default;
    font-family: var(--font-ui);
    font-weight: bold;
  }

  .ms-cell.revealed {
    border: 1px solid var(--btn-shadow);
    background: var(--win-bg);
  }

  .ms-cell.exploded {
    background: #ff0000;
  }

  .ms-cell:disabled {
    cursor: default;
  }

  .adj-1 { color: #0000ff; }
  .adj-2 { color: #008000; }
  .adj-3 { color: #ff0000; }
  .adj-4 { color: #000080; }
  .adj-5 { color: #800000; }
  .adj-6 { color: #008080; }
  .adj-7 { color: #000000; }
  .adj-8 { color: #808080; }

  .ms-status {
    font-size: 12px;
    padding: 4px;
    text-align: center;
  }
</style>
