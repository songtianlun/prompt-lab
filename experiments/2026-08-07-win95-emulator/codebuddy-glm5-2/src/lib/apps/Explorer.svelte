<script>
  export let path = 'C:\\'

  // Simulated file system
  const fileSystem = {
    'C:\\': [
      { name: 'Windows', type: 'folder', size: '---' },
      { name: 'Program Files', type: 'folder', size: '---' },
      { name: 'My Documents', type: 'folder', size: '---' },
      { name: 'AUTOEXEC.BAT', type: 'file', size: '1 KB', ext: 'BAT' },
      { name: 'CONFIG.SYS', type: 'file', size: '1 KB', ext: 'SYS' },
      { name: 'README.TXT', type: 'file', size: '4 KB', ext: 'TXT' }
    ],
    'C:\\Windows\\': [
      { name: 'System', type: 'folder', size: '---' },
      { name: 'System32', type: 'folder', size: '---' },
      { name: 'Command', type: 'folder', size: '---' },
      { name: 'NOTEPAD.EXE', type: 'file', size: '52 KB', ext: 'EXE' },
      { name: 'CALC.EXE', type: 'file', size: '36 KB', ext: 'EXE' },
      { name: 'WINFILE.EXE', type: 'file', size: '146 KB', ext: 'EXE' }
    ],
    'C:\\Program Files\\': [
      { name: 'Accessories', type: 'folder', size: '---' },
      { name: 'Internet Explorer', type: 'folder', size: '---' }
    ],
    'C:\\My Documents\\': [
      { name: '文档.txt', type: 'file', size: '2 KB', ext: 'TXT' },
      { name: '笔记.txt', type: 'file', size: '1 KB', ext: 'TXT' },
      { name: '图片.bmp', type: 'file', size: '120 KB', ext: 'BMP' }
    ]
  }

  let currentPath = path
  let history = [path]
  let historyIndex = 0
  let selected = null

  $: items = fileSystem[currentPath] || fileSystem['C:\\'] || []

  function navigate(newPath) {
    currentPath = newPath
    history = history.slice(0, historyIndex + 1)
    history.push(newPath)
    historyIndex = history.length - 1
    selected = null
  }

  function goBack() {
    if (historyIndex > 0) {
      historyIndex--
      currentPath = history[historyIndex]
      selected = null
    }
  }

  function goForward() {
    if (historyIndex < history.length - 1) {
      historyIndex++
      currentPath = history[historyIndex]
      selected = null
    }
  }

  function goUp() {
    if (currentPath === 'C:\\') return
    const parts = currentPath.split('\\').filter(Boolean)
    parts.pop()
    navigate(parts.length > 0 ? parts.join('\\') + '\\' : 'C:\\')
  }

  function onItemClick(item) {
    selected = item.name
  }

  function onItemDoubleClick(item) {
    if (item.type === 'folder') {
      navigate(currentPath + item.name + '\\')
    } else {
      alert('无法打开 ' + item.name + '\n没有关联的程序')
    }
  }

  function fileIcon(item) {
    if (item.type === 'folder') return '📁'
    if (item.ext === 'TXT') return '📄'
    if (item.ext === 'EXE') return '⚙'
    if (item.ext === 'BMP') return '🖼'
    if (item.ext === 'BAT' || item.ext === 'SYS') return '📜'
    return '📄'
  }
</script>

<div class="explorer">
  <!-- Menu Bar -->
  <div class="menubar">
    <div class="menubar-item"><u>文</u>件(F)</div>
    <div class="menubar-item"><u>编</u>辑(E)</div>
    <div class="menubar-item"><u>查</u>看(V)</div>
    <div class="menubar-item"><u>帮</u>助(H)</div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar bevel-out-thin">
    <button class="tb-btn" on:click={goBack} disabled={historyIndex === 0}>⬅ 后退</button>
    <button class="tb-btn" on:click={goForward} disabled={historyIndex >= history.length - 1}>➡ 前进</button>
    <button class="tb-btn" on:click={goUp} disabled={currentPath === 'C:\\'}>⬆ 上一级</button>
  </div>

  <!-- Address Bar -->
  <div class="address-bar">
    <span class="addr-label">地址</span>
    <div class="addr-input bevel-in-thin">
      <span>💻 {currentPath}</span>
    </div>
  </div>

  <!-- File List -->
  <div class="file-list bevel-in">
    <div class="file-header">
      <span class="col-name">名称</span>
      <span class="col-size">大小</span>
      <span class="col-type">类型</span>
    </div>
    <div class="file-items">
      {#each items as item}
        <div
          class="file-row"
          class:selected={selected === item.name}
          on:click={() => onItemClick(item)}
          on:dblclick={() => onItemDoubleClick(item)}
        >
          <span class="col-name">{fileIcon(item)} {item.name}</span>
          <span class="col-size">{item.size}</span>
          <span class="col-type">{item.type === 'folder' ? '文件夹' : item.ext + ' 文件'}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Status Bar -->
  <div class="statusbar bevel-in-thin">
    <span>{items.length} 个对象</span>
    {#if selected}
      <span class="status-sep">|</span>
      <span>已选中: {selected}</span>
    {/if}
  </div>
</div>

<style>
  .explorer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-bg);
  }

  .toolbar {
    display: flex;
    gap: 4px;
    padding: 2px 4px;
  }

  .tb-btn {
    background: var(--btn-face);
    border-top: 1px solid var(--btn-highlight);
    border-left: 1px solid var(--btn-light);
    border-right: 1px solid var(--btn-darkshadow);
    border-bottom: 1px solid var(--btn-shadow);
    padding: 2px 8px;
    font-size: 12px;
    cursor: default;
  }

  .tb-btn:disabled {
    color: var(--win-text-disabled);
  }

  .address-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
  }

  .addr-label { font-size: 12px; }

  .addr-input {
    flex: 1;
    background: white;
    padding: 2px 4px;
    font-size: 12px;
  }

  .file-list {
    flex: 1;
    background: white;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  .file-header {
    display: grid;
    grid-template-columns: 1fr 80px 100px;
    padding: 2px 4px;
    background: var(--win-bg);
    border-bottom: 1px solid var(--btn-shadow);
    font-size: 12px;
    font-weight: normal;
  }

  .file-items {
    flex: 1;
    overflow: auto;
  }

  .file-row {
    display: grid;
    grid-template-columns: 1fr 80px 100px;
    padding: 2px 4px;
    font-size: 12px;
    cursor: default;
  }

  .file-row:hover {
    background: rgba(0,0,128,0.1);
  }

  .file-row.selected {
    background: var(--win-blue);
    color: white;
  }

  .col-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .col-size { text-align: right; }
  .col-type { padding-left: 8px; }

  .statusbar {
    display: flex;
    gap: 8px;
    padding: 2px 8px;
    font-size: 12px;
    background: var(--win-bg);
  }

  .status-sep { color: var(--win-text-disabled); }
</style>
