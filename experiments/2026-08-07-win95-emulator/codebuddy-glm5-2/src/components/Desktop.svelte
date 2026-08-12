<script>
  import { desktopIcons, apps } from '../lib/registry.js'
  import { windows, settings, startMenuOpen } from '../lib/stores.js'

  let selectedIcon = null
  let contextMenu = null

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
    startMenuOpen.set(false)
  }

  function onIconDoubleClick(appId) {
    openApp(appId)
  }

  function onIconClick(e, index) {
    e.stopPropagation()
    selectedIcon = index
  }

  function onDesktopClick() {
    selectedIcon = null
    contextMenu = null
    startMenuOpen.update(v => false)
  }

  function onContextMenu(e) {
    e.preventDefault()
    contextMenu = { x: e.clientX, y: e.clientY }
  }

  function closeContextMenu() {
    contextMenu = null
  }

  const wallpapers = {
    teal: '#008080',
    blue: '#000080',
    forest: '#004000',
    pattern: `
      repeating-linear-gradient(45deg, #008080 0, #008080 2px, #006060 2px, #006060 4px)
    `,
    clouds: `
      radial-gradient(ellipse at 20% 30%, #80c0ff 0%, transparent 40%),
      radial-gradient(ellipse at 70% 60%, #a0d0ff 0%, transparent 35%),
      radial-gradient(ellipse at 50% 80%, #c0e0ff 0%, transparent 30%),
      linear-gradient(180deg, #008080, #006060)
    `
  }

  $: wallpaper = wallpapers[$settings.wallpaper] || wallpapers.teal
</script>

<svelte:window on:click={closeContextMenu} />

<!-- Desktop background -->
<div
  class="desktop"
  style="background: {wallpaper};"
  on:click={onDesktopClick}
  on:contextmenu={onContextMenu}
>
  <!-- Desktop Icons -->
  <div class="icons-container">
    {#each desktopIcons as icon, i}
      <button
        class="desktop-icon"
        class:selected={selectedIcon === i}
        on:click={(e) => onIconClick(e, i)}
        on:dblclick={() => onIconDoubleClick(icon.appId)}
      >
        <img class="icon-img" src={apps[icon.appId].icon} alt={icon.label} />
        <span class="icon-label">{icon.label}</span>
      </button>
    {/each}
  </div>

  <!-- Slot for windows and taskbar -->
  <slot />

  <!-- Context Menu -->
  {#if contextMenu}
    <div
      class="context-menu"
      style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
      on:click|stopPropagation
    >
      <div class="menu-item" on:click={() => { openApp('settings'); closeContextMenu(); }}>
        <span class="menu-icon">⚙</span> 属性
      </div>
      <div class="menu-sep"></div>
      <div class="menu-item" on:click={() => { openApp('explorer'); closeContextMenu(); }}>
        <span class="menu-icon">📁</span> 打开文件管理器
      </div>
      <div class="menu-item" on:click={() => { openApp('notepad'); closeContextMenu(); }}>
        <span class="menu-icon">📝</span> 新建记事本
      </div>
      <div class="menu-sep"></div>
      <div class="menu-item disabled">
        <span class="menu-icon">🔄</span> 刷新
      </div>
    </div>
  {/if}
</div>

<style>
  .desktop {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .icons-container {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .desktop-icon {
    width: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: transparent;
    border: 1px dotted transparent;
    cursor: default;
    text-align: center;
  }

  .desktop-icon.selected {
    background: rgba(0, 0, 128, 0.3);
    border: 1px dotted #ffff80;
  }

  .icon-img {
    width: 32px;
    height: 32px;
    image-rendering: pixelated;
  }

  .icon-label {
    color: white;
    font-size: 11px;
    text-shadow: 1px 1px 1px #000;
    word-break: break-all;
    line-height: 1.1;
  }

  .desktop-icon.selected .icon-label {
    background: var(--win-blue);
    padding: 0 2px;
  }

  .context-menu {
    position: absolute;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    min-width: 160px;
    padding: 2px;
    z-index: 10000;
  }

  .menu-item {
    padding: 3px 20px 3px 22px;
    font-size: 12px;
    cursor: default;
    position: relative;
  }

  .menu-item:hover {
    background: var(--win-blue);
    color: white;
  }

  .menu-item.disabled {
    color: var(--win-text-disabled);
  }

  .menu-item.disabled:hover {
    background: transparent;
    color: var(--win-text-disabled);
  }

  .menu-icon {
    position: absolute;
    left: 4px;
  }

  .menu-sep {
    height: 1px;
    background: var(--btn-shadow);
    border-bottom: 1px solid var(--btn-highlight);
    margin: 2px 2px;
  }
</style>
