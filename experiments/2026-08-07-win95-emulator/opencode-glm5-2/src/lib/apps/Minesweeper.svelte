<script>
  import { onMount } from 'svelte'

  export let win

  const ROWS = 9
  const COLS = 9
  const MINES = 10

  let board = []
  let state = 'ready' // ready | playing | won | lost
  let flags = 0
  let time = 0
  let timer = null
  let face = 'smile' // smile | oh | cool | dead
  let pressedCell = null

  const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080']

  function makeBoard() {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flag: 0, count: 0 }))
    )
  }

  function plantMines(safeR, safeC) {
    let placed = 0
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS)
      const c = Math.floor(Math.random() * COLS)
      if (board[r][c].mine) continue
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
      board[r][c].mine = true
      placed++
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let n = 0
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) n++
          }
        board[r][c].count = n
      }
    }
  }

  function reset() {
    board = makeBoard()
    state = 'ready'
    flags = 0
    time = 0
    face = 'smile'
    clearInterval(timer)
    timer = null
  }

  function startTimer() {
    if (timer) return
    timer = setInterval(() => {
      if (state === 'playing') {
        time = Math.min(time + 1, 999)
      }
    }, 1000)
  }

  function reveal(r, c) {
    if (state === 'won' || state === 'lost') return
    if (board[r][c].revealed || board[r][c].flag) return
    if (state === 'ready') {
      plantMines(r, c)
      state = 'playing'
      startTimer()
    }
    floodReveal(r, c)
    checkWin()
  }

  function floodReveal(r, c) {
    const stack = [[r, c]]
    while (stack.length) {
      const [cr, cc] = stack.pop()
      const cell = board[cr][cc]
      if (cell.revealed || cell.flag) continue
      cell.revealed = true
      if (cell.count === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr, nc = cc + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !board[nr][nc].revealed) {
              stack.push([nr, nc])
            }
          }
      }
    }
    board = board
  }

  function toggleFlag(e, r, c) {
    e.preventDefault()
    if (state === 'won' || state === 'lost') return
    if (board[r][c].revealed) return
    if (state === 'ready') { state = 'playing'; startTimer() }
    board[r][c].flag = (board[r][c].flag + 1) % 3
    if (board[r][c].flag === 1) flags++
    else if (board[r][c].flag === 2) flags--
    board = board
  }

  function checkWin() {
    let unrevealed = 0
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!board[r][c].revealed && !board[r][c].mine) unrevealed++
    if (unrevealed === 0) {
      state = 'won'
      face = 'cool'
      clearInterval(timer)
      // flag remaining mines
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (board[r][c].mine) board[r][c].flag = 1
      flags = MINES
      board = board
    }
  }

  function lose() {
    state = 'lost'
    face = 'dead'
    clearInterval(timer)
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].mine) board[r][c].revealed = true
        if (board[r][c].flag === 1 && !board[r][c].mine) board[r][c].wrong = true
      }
    board = board
  }

  function onCellDown(r, c) {
    if (state === 'won' || state === 'lost') return
    if (!board[r][c].revealed && !board[r][c].flag) face = 'oh'
    pressedCell = [r, c]
  }
  function onCellUp(r, c) {
    face = state === 'lost' ? 'dead' : state === 'won' ? 'cool' : 'smile'
    if (state === 'won' || state === 'lost') return
    if (!board[r][c].revealed && !board[r][c].flag) {
      if (board[r][c].mine) {
        lose()
      } else {
        reveal(r, c)
      }
    }
    pressedCell = null
  }
  function onCellLeave() {
    if (face === 'oh') face = 'smile'
  }

  function pad(n) { return String(Math.max(0, n)).padStart(3, '0') }

  onMount(reset)
</script>

<div class="ms w95-sunken">
  <div class="head w95-sunken">
    <div class="lcd mine-count">{pad(MINES - flags)}</div>
    <button class="face-btn w95-raised" on:click={reset} on:pointerdown={() => face = 'oh'} on:pointerup={() => face = state === 'lost' ? 'dead' : state === 'won' ? 'cool' : 'smile'}>
      {#if face === 'smile'}😊{:else if face === 'oh'}😮{:else if face === 'cool'}😎{:else}😵{/if}
    </button>
    <div class="lcd timer">{pad(time)}</div>
  </div>
  <div class="grid w95-sunken">
    {#each board as row, r}
      {#each row as cell, c}
        <button
          class="cell"
          class:revealed={cell.revealed}
          class:exploded={cell.revealed && cell.mine && state === 'lost'}
          class:wrong={cell.wrong}
          on:pointerdown={() => onCellDown(r, c)}
          on:pointerup={() => onCellUp(r, c)}
          on:pointerleave={onCellLeave}
          on:contextmenu={(e) => toggleFlag(e, r, c)}
          style="color:{NUM_COLORS[cell.count]}"
        >
          {#if cell.revealed}
            {#if cell.mine}💣{:else if cell.count > 0}{cell.count}{/if}
          {:else if cell.flag === 1}🚩{:else if cell.flag === 2}?{/if}
        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .ms {
    padding: 6px;
    display: inline-flex;
    flex-direction: column;
    gap: 6px;
    background: var(--w95-surface);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px;
    background: var(--w95-surface);
  }
  .lcd {
    background: #000;
    color: #ff0000;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 22px;
    line-height: 1;
    padding: 2px 4px;
    letter-spacing: 2px;
    min-width: 52px;
    text-align: center;
    text-shadow: 0 0 4px #ff0000;
  }
  .face-btn {
    width: 30px;
    height: 30px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--w95-surface);
    border: none;
  }
  .face-btn:active {
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-light),
      inset  1px  1px 0 0 var(--w95-button-shadow),
      inset -2px -2px 0 0 var(--w95-button-highlight),
      inset  2px  2px 0 0 var(--w95-button-dark);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(9, 20px);
    grid-template-rows: repeat(9, 20px);
    padding: 4px;
    background: var(--w95-surface);
  }
  .cell {
    width: 20px;
    height: 20px;
    font-size: 13px;
    font-weight: bold;
    line-height: 20px;
    padding: 0;
    text-align: center;
    background: var(--w95-surface);
    border: none;
    cursor: default;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
  }
  .cell.revealed {
    box-shadow: inset 1px 1px 0 0 var(--w95-button-shadow);
    background: var(--w95-surface);
  }
  .cell.exploded { background: #ff0000; }
  .cell.wrong { background: #c0c0c0; }
  .cell.revealed :global(*) { user-select: none; }
</style>
