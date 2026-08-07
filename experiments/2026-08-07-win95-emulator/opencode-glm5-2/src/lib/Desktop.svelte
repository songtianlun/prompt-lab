<script>
  import Icon from './Icon.svelte'
  import { windows, startMenuOpen } from './stores.js'

  const icons = [
    { icon: 'computer', label: '我的电脑', app: 'mycomputer' },
    { icon: 'recycle', label: '回收站', app: 'explorer' },
    { icon: 'notepad', label: '记事本', app: 'notepad' },
    { icon: 'mine', label: '扫雷', app: 'minesweeper' },
    { icon: 'explorer', label: 'Internet Explorer', app: 'explorer' },
    { icon: 'info', label: '关于 Win95', app: 'about' }
  ]

  let selected = -1

  function open(app) {
    windows.open(app)
  }
  function clickAway() {
    selected = -1
    startMenuOpen.set(false)
  }
</script>

<div class="desktop" on:pointerdown={clickAway}>
  <div class="icons">
    {#each icons as ic, i}
      <button
        class="dicon"
        class:sel={selected === i}
        on:pointerdown|stopPropagation={() => (selected = i)}
        on:dblclick={() => open(ic.app)}
      >
        <Icon name={ic.icon} size={32} />
        <span class="label">{ic.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .desktop {
    position: absolute;
    inset: 0;
    bottom: 28px;
    background: var(--w95-desktop);
    overflow: hidden;
  }
  .icons {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 4px;
    height: 100%;
    align-content: flex-start;
  }
  .dicon {
    width: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px dotted transparent;
    padding: 4px 2px;
    cursor: default;
    text-align: center;
  }
  .dicon.sel {
    background: var(--w95-selected);
    border: 1px dotted #fff;
  }
  .dicon.sel .label { color: #fff; }
  .dicon .label {
    font-size: 11px;
    color: #fff;
    text-shadow: 1px 1px 0 #000;
    line-height: 1.2;
    word-break: break-all;
  }
</style>
