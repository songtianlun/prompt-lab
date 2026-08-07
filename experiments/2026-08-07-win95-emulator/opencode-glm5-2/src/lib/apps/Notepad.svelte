<script>
  import { APPS } from '../stores.js'
  import { windows } from '../stores.js'

  export let win
  let text = win.payload?.text ?? ''
  let menuOpen = null

  $: windows.setTitle(win.id, (text.split('\n')[0] || '无标题').slice(0, 20) + ' - 记事本')

  function toggleMenu(name) {
    menuOpen = menuOpen === name ? null : name
  }
  function closeMenu() { menuOpen = null }

  function newFile() { text = ''; closeMenu() }
  function saveFile() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '无标题.txt'
    a.click()
    URL.revokeObjectURL(a.href)
    closeMenu()
  }
  function selectAll() {
    const ta = document.querySelector(`#np-${win.id}`)
    ta?.select()
    closeMenu()
  }
  function wrapChanged(e) { /* demo */ }
  function about() {
    windows.open('about')
    closeMenu()
  }
</script>

<div class="notepad" on:pointerdown={closeMenu}>
  <div class="menubar">
    {#each ['文件(F)', '编辑(E)', '搜索(S)', '帮助(H)'] as m, i}
      <button
        class="menu-item"
        class:open={menuOpen === i}
        on:pointerdown|stopPropagation={() => toggleMenu(i)}
      >{m}</button>
    {/each}
  </div>

  {#if menuOpen === 0}
    <div class="popup" style="left:0">
      <div class="item" on:click={newFile}>新建</div>
      <div class="item" on:click={saveFile}><span>保存</span><span class="key">Ctrl+S</span></div>
      <div class="sep"></div>
      <div class="item" on:click={() => windows.close(win.id)}>退出</div>
    </div>
  {/if}
  {#if menuOpen === 1}
    <div class="popup" style="left:42px">
      <div class="item" on:click={() => document.execCommand('undo')}>撤销</div>
      <div class="sep"></div>
      <div class="item" on:click={() => document.execCommand('copy')}><span>复制</span><span class="key">Ctrl+C</span></div>
      <div class="item" on:click={() => document.execCommand('paste')}><span>粘贴</span><span class="key">Ctrl+V</span></div>
      <div class="sep"></div>
      <div class="item" on:click={selectAll}><span>全选</span><span class="key">Ctrl+A</span></div>
    </div>
  {/if}
  {#if menuOpen === 3}
    <div class="popup" style="left:138px">
      <div class="item" on:click={about}>关于记事本</div>
    </div>
  {/if}

  <textarea
    id="np-{win.id}"
    class="w95-textarea np-text"
    bind:value={text}
    spellcheck="false"
    placeholder=""
  ></textarea>
</div>

<style>
  .notepad { display: flex; flex-direction: column; height: 100%; position: relative; }
  .menubar {
    display: flex;
    padding: 1px;
    flex-shrink: 0;
    border-bottom: 1px solid #808080;
  }
  .menu-item {
    background: transparent;
    border: none;
    padding: 2px 8px;
    font-family: var(--w95-font);
    font-size: 11px;
    cursor: default;
  }
  .menu-item.open { background: var(--w95-selected); color: #fff; }
  .menu-item:hover { background: var(--w95-selected); color: #fff; }
  .popup {
    position: absolute;
    top: 20px;
    background: var(--w95-surface);
    z-index: 50;
    min-width: 140px;
    padding: 2px;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
  }
  .item {
    padding: 3px 20px 3px 22px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    cursor: default;
  }
  .item:hover { background: var(--w95-selected); color: #fff; }
  .item .key { color: #808080; }
  .item:hover .key { color: #fff; }
  .sep { height: 2px; margin: 3px 2px; background: #808080; box-shadow: 0 1px 0 #fff; }
  .np-text {
    flex: 1;
    width: 100%;
    border: none;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-highlight),
      inset  1px  1px 0 0 var(--w95-button-shadow),
      inset -2px -2px 0 0 var(--w95-button-light),
      inset  2px  2px 0 0 var(--w95-button-dark);
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
  }
</style>
