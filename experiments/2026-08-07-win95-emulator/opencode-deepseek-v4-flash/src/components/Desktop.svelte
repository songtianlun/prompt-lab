<script>
  import MyComputerIcon from './icons/MyComputer.svelte'
  import RecycleBinIcon from './icons/RecycleBin.svelte'
  import NotepadIcon from './icons/Notepad.svelte'
  import FolderIcon from './icons/Folder.svelte'
  import MinesweeperIcon from './icons/Minesweeper.svelte'

  let { manager, launch } = $props()

  const icons = [
    { label: '我的电脑', icon: MyComputerIcon, app: 'computer' },
    { label: '记事本', icon: NotepadIcon, app: 'notepad' },
    { label: '我的文档', icon: FolderIcon, app: 'computer' },
    { label: '扫雷', icon: MinesweeperIcon, app: 'minesweeper' },
    { label: '回收站', icon: RecycleBinIcon, app: null },
  ]

  let selected = $state(null)
  let dragged = $state(null)
  let startMouse = $state({ x: 0, y: 0 })

  function onIconDown(e, icon) {
    if (e.button !== 0) return
    selected = icon.label
    manager.setStartOpen(false)
    // deferred selection change handled by click
  }

  function onIconClick(e, icon) {
    selected = icon.label
  }

  function onDouble(e, icon) {
    if (e.type === 'keydown' && e.key !== 'Enter') return
    if (icon.app) launch(icon.app)
  }
</script>

<div class="desktop" role="presentation" onmousedown={() => (selected = null, manager.setStartOpen(false))}>
  <div class="icons-row">
    {#each icons as icon (icon.label)}
      <div
        class="desktop-icon"
        class:selected={selected === icon.label}
        role="button"
        tabindex="0"
        onmousedown={(e) => onIconDown(e, icon)}
        onclick={(e) => onIconClick(e, icon)}
        ondblclick={(e) => onDouble(e, icon)}
        onkeydown={(e) => onDouble(e, icon)}
      >
        <icon.icon />
        <span>{icon.label}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .desktop {
    position: relative;
  }
  .icons-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 6px;
  }
</style>
