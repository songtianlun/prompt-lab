<script>
  import { windows } from '../stores.js'

  export let winId

  let text = ''
  let wordWrap = true
  let dirty = false
  let menuOpen = null

  $: windows.setTitle(winId, dirty ? '*无标题 - 记事本' : '无标题 - 记事本')

  function toggleMenu(name) {
    menuOpen = menuOpen === name ? null : name
  }

  function newFile() {
    if (dirty && !confirm('文本已更改，是否保存？')) return
    text = ''
    dirty = false
    menuOpen = null
  }

  function saveFile() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '无标题.txt'
    a.click()
    URL.revokeObjectURL(url)
    dirty = false
    menuOpen = null
  }

  function selectAll() {
    const ta = document.getElementById('notepad-text-' + winId)
    ta.select()
    menuOpen = null
  }

  function toggleWordWrap() {
    wordWrap = !wordWrap
    menuOpen = null
  }

  function closeMenu() {
    menuOpen = null
  }
</script>

<svelte:window on:click={closeMenu} />

<div class="notepad">
  <!-- Menu Bar -->
  <div class="menubar">
    <div class="menubar-item" class:open={menuOpen === 'file'} on:click|stopPropagation={() => toggleMenu('file')}>
      <u>文</u>件(F)
      {#if menuOpen === 'file'}
        <div class="dropdown">
          <div class="dd-item" on:click={newFile}>新建 <span class="shortcut">Ctrl+N</span></div>
          <div class="dd-item" on:click={saveFile}>保存 <span class="shortcut">Ctrl+S</span></div>
          <div class="dd-sep"></div>
          <div class="dd-item" on:click={() => windows.close(winId)}>退出</div>
        </div>
      {/if}
    </div>
    <div class="menubar-item" class:open={menuOpen === 'edit'} on:click|stopPropagation={() => toggleMenu('edit')}>
      <u>编</u>辑(E)
      {#if menuOpen === 'edit'}
        <div class="dropdown">
          <div class="dd-item" on:click={() => document.execCommand('undo')}>撤销 <span class="shortcut">Ctrl+Z</span></div>
          <div class="dd-sep"></div>
          <div class="dd-item" on:click={() => document.execCommand('copy')}>复制 <span class="shortcut">Ctrl+C</span></div>
          <div class="dd-item" on:click={() => document.execCommand('paste')}>粘贴 <span class="shortcut">Ctrl+V</span></div>
          <div class="dd-sep"></div>
          <div class="dd-item" on:click={selectAll}>全选 <span class="shortcut">Ctrl+A</span></div>
        </div>
      {/if}
    </div>
    <div class="menubar-item" class:open={menuOpen === 'format'} on:click|stopPropagation={() => toggleMenu('format')}>
      <u>格</u>式(O)
      {#if menuOpen === 'format'}
        <div class="dropdown">
          <div class="dd-item" on:click={toggleWordWrap}>
            {#if wordWrap}<span class="check">✓</span>{/if} 自动换行
          </div>
        </div>
      {/if}
    </div>
    <div class="menubar-item" class:open={menuOpen === 'help'} on:click|stopPropagation={() => toggleMenu('help')}>
      <u>帮</u>助(H)
      {#if menuOpen === 'help'}
        <div class="dropdown">
          <div class="dd-item" on:click={() => alert('Windows 95 记事本\nSvelte 实现')}>关于记事本</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Text Area -->
  <textarea
    id="notepad-text-{winId}"
    bind:value={text}
    on:input={() => dirty = true}
    class="notepad-text"
    class:wrap={wordWrap}
    spellcheck="false"
    placeholder="在此输入文本..."
  ></textarea>
</div>

<style>
  .notepad {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-bg);
  }

  .menubar {
    position: relative;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    min-width: 180px;
    padding: 2px;
    z-index: 100;
  }

  .dd-item {
    padding: 3px 20px 3px 22px;
    cursor: default;
    position: relative;
    font-size: 12px;
  }

  .dd-item:hover {
    background: var(--win-blue);
    color: white;
  }

  .dd-sep {
    height: 1px;
    background: var(--btn-shadow);
    border-bottom: 1px solid var(--btn-highlight);
    margin: 2px 2px;
  }

  .shortcut {
    float: right;
    color: var(--win-text-disabled);
    margin-left: 20px;
  }

  .dd-item:hover .shortcut {
    color: #c0c0ff;
  }

  .check {
    position: absolute;
    left: 6px;
  }

  .notepad-text {
    flex: 1;
    width: 100%;
    border: none;
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
    background: white;
    font-family: var(--font-mono);
    font-size: 13px;
    padding: 4px;
    resize: none;
    outline: none;
    white-space: pre;
    overflow: auto;
  }

  .notepad-text.wrap {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
