<script>
  import { onMount } from 'svelte'
  import { windows, startMenuOpen } from './lib/stores.js'
  import Desktop from './lib/Desktop.svelte'
  import Taskbar from './lib/Taskbar.svelte'
  import StartMenu from './lib/StartMenu.svelte'
  import Window from './lib/Window.svelte'

  import Notepad from './lib/apps/Notepad.svelte'
  import Minesweeper from './lib/apps/Minesweeper.svelte'
  import MyComputer from './lib/apps/MyComputer.svelte'
  import About from './lib/apps/About.svelte'
  import Explorer from './lib/apps/Explorer.svelte'

  let booted = false

  function handleFocus(e) { windows.focus(e.detail) }
  function handleMove(e) { windows.move(e.detail.id, e.detail.x, e.detail.y) }
  function handleResize(e) { windows.resize(e.detail.id, e.detail.width, e.detail.height) }
  function handleMinimize(e) { windows.toggleMinimize(e.detail) }
  function handleMaximize(e) { windows.toggleMaximize(e.detail) }
  function handleClose(e) { windows.close(e.detail) }

  onMount(() => {
    const t = setTimeout(() => (booted = true), 2200)
    setTimeout(() => windows.open('explorer'), 2400)
    return () => clearTimeout(t)
  })
</script>

{#if !booted}
  <div class="boot">
    <div class="boot-logo">
      <div class="boot-flag">
        <span class="r"></span><span class="g"></span><span class="b"></span><span class="y"></span>
      </div>
      <div class="boot-text">Microsoft<br /><b>Windows 95</b></div>
    </div>
    <div class="boot-loading">
      <div class="boot-bar"><div class="boot-bar-fill"></div></div>
    </div>
  </div>
{:else}
  <Desktop />

  {#each $windows as w (w.id)}
    <Window
      win={w}
      on:focus={handleFocus}
      on:move={handleMove}
      on:resize={handleResize}
      on:minimize={handleMinimize}
      on:maximize={handleMaximize}
      on:close={handleClose}
    >
      {#if w.appId === 'notepad'}
        <Notepad win={w} />
      {:else if w.appId === 'minesweeper'}
        <Minesweeper win={w} />
      {:else if w.appId === 'mycomputer'}
        <MyComputer win={w} />
      {:else if w.appId === 'about'}
        <About win={w} />
      {:else if w.appId === 'explorer'}
        <Explorer win={w} />
      {/if}
    </Window>
  {/each}

  <StartMenu />
  <Taskbar />
{/if}

<style>
  .boot {
    position: fixed;
    inset: 0;
    background: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    z-index: 100000;
    animation: bootOut 0.4s ease 1.8s forwards;
  }
  @keyframes bootOut {
    to { opacity: 0; visibility: hidden; }
  }
  .boot-logo {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .boot-flag {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    width: 80px;
    height: 70px;
    gap: 3px;
    transform: perspective(120px) rotateY(-12deg) skewY(-6deg);
  }
  .boot-flag .r { background: #ff3030; }
  .boot-flag .g { background: #30c030; }
  .boot-flag .b { background: #3060ff; }
  .boot-flag .y { background: #ffcc00; }
  .boot-text {
    font-size: 26px;
    line-height: 1.1;
  }
  .boot-text b {
    font-size: 40px;
    font-weight: 800;
  }
  .boot-loading { width: 220px; }
  .boot-bar {
    height: 14px;
    background: #202020;
    box-shadow: inset 1px 1px #000, inset -1px -1px #555;
    overflow: hidden;
    position: relative;
  }
  .boot-bar-fill {
    position: absolute;
    top: 0; left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, #1084d0, #00ffff);
    animation: bootSlide 1.6s ease-in-out infinite;
  }
  @keyframes bootSlide {
    0% { left: -40%; }
    100% { left: 100%; }
  }
</style>
