<script>
  let props = $props()

  const ROWS = 9
  const COLS = 9
  const MINES = 10

  let grid = $state([])
  let over = $state(false)
  let won = $state(false)
  let first = $state(true)
  let mineCount = $state(MINES)
  let time = $state(0)
  let timer = null

  function newGrid(withMines = true) {
    grid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        mine: false, revealed: false, flag: false, adjacent: 0,
      }))
    )
  }

  function reset(withMines = true) {
    newGrid()
    over = false
    won = false
    first = true
    mineCount = MINES
    time = 0
    if (timer) clearInterval(timer)
    timer = null
  }

  function placeMines(sx, sy) {
    let placed = 0
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS)
      const c = Math.floor(Math.random() * COLS)
      if ((r === sx && c === sy) || grid[r][c].mine) continue
      grid[r][c].mine = true
      placed++
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        grid[r][c].adjacent = countAdj(r, c)
      }
    }
  }

  function countAdj(r, c) {
    let n = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].mine) n++
      }
    }
    return n
  }

  function startTimer() {
    if (timer) return
    timer = setInterval(() => {
      time++
      if (time >= 999) clearInterval(timer)
    }, 1000)
  }

  function reveal(r, c) {
    if (over || won) return
    const cell = grid[r][c]
    if (cell.revealed || cell.flag) return
    if (first) {
      placeMines(r, c)
      first = false
    }
    startTimer()
    if (cell.mine) {
      cell.revealed = true
      over = true
      if (timer) clearInterval(timer)
      revealAllMines()
      return
    }
    flood(r, c)
    checkWin()
  }

  function flood(r, c) {
    const cell = grid[r][c]
    if (cell.revealed || cell.flag) return
    cell.revealed = true
    if (cell.adjacent > 0) return
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) flood(nr, nc)
      }
    }
  }

  function revealAllMines() {
    for (const row of grid) for (const cell of row) if (cell.mine) cell.revealed = true
  }

  function checkWin() {
    let count = 0
    for (const row of grid) for (const cell of row) if (cell.revealed) count++
    if (count === ROWS * COLS - MINES) {
      won = true
      if (timer) clearInterval(timer)
    }
  }

  function toggleFlag(e, r, c) {
    e.preventDefault()
    if (over || won) return
    const cell = grid[r][c]
    if (cell.revealed) return
    cell.flag = !cell.flag
    mineCount = MINES - grid.flat().filter((x) => x.flag).length
  }

  reset()
</script>

<div class="minesweeper">
  <div class="ms-top">
    <div class="counter"><span>{String(Math.max(0, mineCount)).padStart(3, '0')}</span></div>
    <button class="face" class:sad={over} onclick={reset}>🙂</button>
    <div class="counter"><span>{String(time).padStart(3, '0')}</span></div>
  </div>
  <div class="ms-grid" style="--cols:{COLS}">
    {#each Array.from({ length: ROWS * COLS }) as _, i}
      {@const r = Math.floor(i / COLS)}
      {@const c = i % COLS}
      {@const cell = grid[r][c]}
      <button
        class="cell"
        class:revealed={cell.revealed}
        class:mine={cell.revealed && cell.mine}
        class:wrongflag={over && !cell.mine && cell.flag}
        onclick={() => reveal(r, c)}
        oncontextmenu={(e) => toggleFlag(e, r, c)}
      >
        {#if cell.revealed}
          {#if cell.mine}💣{:else if cell.adjacent > 0}<span class="n{cell.adjacent}">{cell.adjacent}</span>{/if}
        {:else if cell.flag}🚩{/if}
      </button>
    {/each}
  </div>
  <div class="ms-info">
    <span>左键挖开，右键插旗</span>
    {#if over}<span style="color:#ff0000;font-weight:bold">游戏结束！{won ? '你赢了！' : '踩雷了'}</span>
    {:else if won}<span style="color:#008000;font-weight:bold">你赢了！</span>{/if}
    <button class="w95-btn" onclick={reset}>新游戏</button>
  </div>
</div>

<style>
  .minesweeper {
    flex: 1;
    background: var(--w95-face);
    border: 2px solid;
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: 'MS Sans Serif', sans-serif;
  }
  .ms-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border: 2px solid;
    border-color: var(--w95-white) var(--w95-dkgray) var(--w95-dkgray) var(--w95-white);
    padding: 4px;
    background: var(--w95-face);
    box-sizing: border-box;
  }
  .counter {
    background: black;
    padding: 2px 4px;
    border: 2px solid;
    border-color: var(--w95-dkgray) var(--w95-dkgray) var(--w95-dkgray) var(--w95-dkgray);
  }
  .counter span {
    color: #ff0000;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 22px;
    letter-spacing: 2px;
    user-select: none;
  }
  .face {
    width: 30px;
    height: 30px;
    font-size: 17px;
    background: var(--w95-face);
    border: 2px solid;
    border-color: var(--w95-white) var(--w95-dkgray) var(--w95-dkgray) var(--w95-white);
    cursor: pointer;
  }
  .face:active {
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
  }
  .ms-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols), 24px);
    gap: 0;
    border: 3px solid;
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
    background: var(--w95-face);
  }
  .cell {
    width: 24px;
    height: 24px;
    background: var(--w95-face);
    border: 2px solid;
    border-color: var(--w95-white) var(--w95-dkgray) var(--w95-dkgray) var(--w95-white);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    line-height: 1;
  }
  .cell:active {
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
  }
  .cell.revealed {
    border: 1px solid var(--w95-dkgray);
    background: #c0c0c0;
    cursor: default;
  }
  .cell.mine {
    background: #ff0000;
  }
  .cell.wrongflag {
    background: #ff8080;
  }
  .n1 { color: #0000ff; font-weight: bold; }
  .n2 { color: #008000; font-weight: bold; }
  .n3 { color: #ff0000; font-weight: bold; }
  .n4 { color: #000080; font-weight: bold; }
  .n5 { color: #800000; font-weight: bold; }
  .n6 { color: #008080; font-weight: bold; }
  .n7 { color: #000000; font-weight: bold; }
  .n8 { color: #808080; font-weight: bold; }
  .ms-info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
  }
</style>
