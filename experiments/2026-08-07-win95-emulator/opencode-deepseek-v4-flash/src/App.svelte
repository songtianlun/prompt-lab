<script>
  import Desktop from './components/Desktop.svelte'
  import Taskbar from './components/Taskbar.svelte'
  import Window from './components/Window.svelte'

  import MyComputerIcon from './components/icons/MyComputer.svelte'
  import NotepadIcon from './components/icons/Notepad.svelte'
  import MinesweeperIcon from './components/icons/Minesweeper.svelte'

  import NotepadApp from './components/apps/NotepadApp.svelte'
  import ComputerApp from './components/apps/ComputerApp.svelte'
  import MinesweeperApp from './components/apps/MinesweeperApp.svelte'

  import { createWindowManager } from './lib/windowStore.svelte.js'
  import './win95.css'

  const manager = createWindowManager()

  const registry = {
    notepad: {
      title: '记事本',
      icon: NotepadIcon,
      app: NotepadApp,
      w: 460,
      h: 340,
    },
    computer: {
      title: '我的电脑',
      icon: MyComputerIcon,
      app: ComputerApp,
      w: 420,
      h: 340,
    },
    minesweeper: {
      title: '扫雷',
      icon: MinesweeperIcon,
      app: MinesweeperApp,
      w: 260,
      h: 330,
    },
  }

  function launch(name) {
    manager.setStartOpen(false)
    const r = registry[name]
    if (!r) return
    manager.open({
      title: r.title,
      app: r.app,
      icon: r.icon,
      width: r.w,
      height: r.h,
    })
  }

  // Provide registry access via manager for window icon rendering
  // (icons are already stored on each window at open time)
</script>

<div class="screen-root">
  <Desktop {manager} {launch} />
  {#each manager.windows as win (win.id)}
    <Window {win} {manager} />
  {/each}
  <Taskbar {manager} {launch} />
</div>

<style>
  .screen-root {
    width: 100vw;
    height: 100vh;
    position: relative;
    background: #008080;
    overflow: hidden;
  }
</style>
