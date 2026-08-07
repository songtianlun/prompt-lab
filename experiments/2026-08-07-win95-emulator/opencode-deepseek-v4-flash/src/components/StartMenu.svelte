<script>
  import MyComputerIcon from './icons/MyComputer.svelte'
  import NotepadIcon from './icons/Notepad.svelte'
  import FolderIcon from './icons/Folder.svelte'
  import MinesweeperIcon from './icons/Minesweeper.svelte'

  let { manager, launch } = $props()

  const items = [
    { label: '我的电脑', icon: MyComputerIcon, app: 'computer' },
    { label: '记事本', icon: NotepadIcon, app: 'notepad' },
    { label: '扫雷', icon: MinesweeperIcon, app: 'minesweeper' },
    { label: '我的文档', icon: FolderIcon, app: 'computer' },
  ]
</script>

<div class="start-menu" onmousedown={(e) => e.stopPropagation()}>
  <div class="banner">开始</div>
  <div class="items">
    {#each items as item (item.label)}
      <div class="start-item" role="button" tabindex="0" onclick={() => launch(item.app)}>
        <span class="icon"><item.icon width={22} height={22} /></span>
        <span>{item.label}</span>
      </div>
    {/each}
  </div>
</div>
