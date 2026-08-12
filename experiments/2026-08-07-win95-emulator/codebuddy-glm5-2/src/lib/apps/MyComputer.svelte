<script>
  import { windows } from '../stores.js'
  import { apps } from '../registry.js'

  const drives = [
    { id: 'a', name: '3½ 软盘 (A:)', icon: '💾', type: 'floppy' },
    { id: 'c', name: '本地磁盘 (C:)', icon: '💽', type: 'hdd', size: '2.0 GB', free: '1.2 GB' },
    { id: 'd', name: 'CD-ROM (D:)', icon: '💿', type: 'cd' }
  ]

  const folders = [
    { name: '控制面板', appId: 'settings', icon: apps.settings.icon },
    { name: '打印机', icon: null },
    { name: '拨号网络', icon: null }
  ]

  function openApp(appId) {
    const app = apps[appId]
    if (!app) return
    windows.open({
      app: appId,
      title: app.name,
      icon: app.icon,
      width: app.defaultSize.width,
      height: app.defaultSize.height,
      singleton: app.singleton,
      resizable: app.resizable !== false,
      maximizable: app.maximizable !== false
    })
  }

  function openDrive(drive) {
    windows.open({
      app: 'explorer',
      title: drive.name,
      icon: '',
      width: 560,
      height: 400,
      props: { path: drive.name }
    })
  }
</script>

<div class="my-computer">
  <!-- Menu Bar -->
  <div class="menubar">
    <div class="menubar-item"><u>文</u>件(F)</div>
    <div class="menubar-item"><u>编</u>辑(E)</div>
    <div class="menubar-item"><u>查</u>看(V)</div>
    <div class="menubar-item"><u>帮</u>助(H)</div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar bevel-out-thin">
    <span class="tb-item">📁 文件</span>
    <span class="tb-sep"></span>
    <span class="tb-item">✏ 编辑</span>
    <span class="tb-sep"></span>
    <span class="tb-item">🔍 查看</span>
  </div>

  <!-- Address Bar -->
  <div class="address-bar">
    <span class="addr-label">地址</span>
    <div class="addr-input bevel-in-thin">
      <span>💻 我的电脑</span>
    </div>
  </div>

  <!-- Content -->
  <div class="mc-content bevel-in">
    <div class="mc-section-label">驱动器</div>
    <div class="mc-grid">
      {#each drives as drive}
        <button class="mc-item" on:dblclick={() => openDrive(drive)}>
          <span class="mc-icon">{drive.icon}</span>
          <span class="mc-name">{drive.name}</span>
        </button>
      {/each}
    </div>

    <div class="mc-section-label">文件夹</div>
    <div class="mc-grid">
      {#each folders as folder}
        <button class="mc-item" on:dblclick={() => folder.appId && openApp(folder.appId)}>
          {#if folder.icon}
            <img class="mc-icon-img" src={folder.icon} alt="" />
          {:else}
            <span class="mc-icon">📂</span>
          {/if}
          <span class="mc-name">{folder.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Status Bar -->
  <div class="statusbar bevel-in-thin">
    <span>{$windows.length} 个对象</span>
  </div>
</div>

<style>
  .my-computer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-bg);
  }

  .toolbar {
    display: flex;
    align-items: center;
    padding: 2px 4px;
    gap: 4px;
    background: var(--win-bg);
  }

  .tb-item {
    padding: 2px 6px;
    font-size: 12px;
  }

  .tb-sep {
    width: 1px;
    height: 16px;
    background: var(--btn-shadow);
    border-right: 1px solid var(--btn-highlight);
  }

  .address-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
  }

  .addr-label {
    font-size: 12px;
  }

  .addr-input {
    flex: 1;
    background: white;
    padding: 2px 4px;
    font-size: 12px;
  }

  .mc-content {
    flex: 1;
    overflow: auto;
    background: white;
    padding: 8px;
  }

  .mc-section-label {
    font-size: 12px;
    color: var(--win-text);
    padding: 4px 0;
    border-bottom: 1px solid #c0c0c0;
    margin-bottom: 8px;
  }

  .mc-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0 12px;
  }

  .mc-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 80px;
    padding: 4px;
    background: transparent;
    border: 1px dotted transparent;
    cursor: default;
    text-align: center;
  }

  .mc-item:hover {
    background: rgba(0,0,128,0.1);
  }

  .mc-item:active {
    background: var(--win-blue);
    color: white;
  }

  .mc-icon {
    font-size: 32px;
  }

  .mc-icon-img {
    width: 32px;
    height: 32px;
  }

  .mc-name {
    font-size: 12px;
    word-break: break-all;
    line-height: 1.1;
  }

  .statusbar {
    padding: 2px 8px;
    font-size: 12px;
    background: var(--win-bg);
  }
</style>
