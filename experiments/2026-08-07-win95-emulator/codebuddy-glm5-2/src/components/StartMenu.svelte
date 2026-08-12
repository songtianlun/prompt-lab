<script context="module">
  // Programs folder icon
  const programsIcon = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
      <rect x="3" y="8" width="26" height="20" fill="#ffcc00" stroke="#000" stroke-width="1"/>
      <rect x="3" y="8" width="26" height="3" fill="#ffaa00"/>
      <rect x="6" y="4" width="20" height="6" fill="#ffdd44" stroke="#000" stroke-width="1"/>
      <rect x="8" y="14" width="16" height="10" fill="#fff" stroke="#806020" stroke-width="1"/>
      <rect x="10" y="16" width="12" height="1" fill="#000080"/>
      <rect x="10" y="18" width="12" height="1" fill="#000080"/>
      <rect x="10" y="20" width="8" height="1" fill="#000080"/>
    </svg>`
  )}`
</script>

<script>
  import { startMenuOpen, windows, powerState } from '../lib/stores.js'
  import { apps, startMenuPrograms } from '../lib/registry.js'

  let programsOpen = false

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
    closeMenu()
  }

  function closeMenu() {
    startMenuOpen.set(false)
    programsOpen = false
  }

  function openShutdownDialog() {
    closeMenu()
    powerState.set('shutdown-dialog')
  }

  // Group programs for the cascading submenu
  $: groups = startMenuPrograms.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = []
    acc[p.group].push(p)
    return acc
  }, {})
</script>

{#if $startMenuOpen}
  <div class="start-menu" on:click|stopPropagation on:mouseleave={() => programsOpen = false}>
    <!-- Left vertical banner -->
    <div class="menu-banner">
      <span class="banner-text">Windows<span class="banner-95">95</span></span>
    </div>

    <!-- Menu items column -->
    <div class="menu-items">
      <!-- Programs with cascading submenu -->
      <div class="menu-item-wrapper">
        <button
          class="menu-item"
          class:hovered={programsOpen}
          on:click={() => programsOpen = !programsOpen}
          on:mouseenter={() => programsOpen = true}
        >
          <img src={programsIcon} alt="" class="menu-icon" />
          <span class="menu-label">程序(<u>P</u>)</span>
          <span class="submenu-arrow">▶</span>
        </button>

        {#if programsOpen}
          <div class="submenu" on:mouseleave={() => programsOpen = false}>
            {#each Object.entries(groups) as [groupName, items], i}
              {#if i > 0}
                <div class="submenu-sep"></div>
              {/if}
              <div class="submenu-group-label">{groupName}</div>
              {#each items as item}
                <button class="menu-item submenu-item" on:click={() => openApp(item.appId)}>
                  <img src={apps[item.appId].icon} alt="" class="menu-icon" />
                  <span class="menu-label">{item.label}</span>
                </button>
              {/each}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Settings -->
      <button class="menu-item" on:click={() => openApp('settings')}>
        <img src={apps.settings.icon} alt="" class="menu-icon" />
        <span class="menu-label">设置(<u>S</u>)</span>
      </button>

      <!-- Help -->
      <button class="menu-item" on:click={() => openApp('about')}>
        <img src={apps.about.icon} alt="" class="menu-icon" />
        <span class="menu-label">帮助(<u>H</u>)</span>
      </button>

      <!-- Separator -->
      <div class="menu-sep"></div>

      <!-- Shut Down -->
      <button class="menu-item" on:click={openShutdownDialog}>
        <span class="menu-icon shutdown-icon">⏻</span>
        <span class="menu-label">关闭系统(<u>U</u>)...</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .start-menu {
    position: absolute;
    bottom: var(--taskbar-h);
    left: 2px;
    width: 200px;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
    display: flex;
    z-index: 100000;
    padding: 2px;
  }

  /* ===== Left vertical banner ===== */
  .menu-banner {
    width: 24px;
    background: linear-gradient(180deg, #000080, #1084d0);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 6px;
    flex-shrink: 0;
  }

  .banner-text {
    color: white;
    font-size: 18px;
    font-weight: bold;
    font-style: italic;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    letter-spacing: -1px;
    white-space: nowrap;
    line-height: 1;
  }

  .banner-95 {
    font-size: 20px;
  }

  /* ===== Menu items column ===== */
  .menu-items {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2px 0;
  }

  .menu-item-wrapper {
    position: relative;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: none;
    padding: 4px 20px 4px 4px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--win-text);
    cursor: default;
    text-align: left;
    position: relative;
  }

  .menu-item:hover,
  .menu-item.hovered {
    background: var(--win-blue);
    color: white;
  }

  .menu-item:hover .menu-icon,
  .menu-item.hovered .menu-icon {
    filter: brightness(0.85);
  }

  .menu-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .shutdown-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #c00;
  }

  .menu-item:hover .shutdown-icon,
  .menu-item.hovered .shutdown-icon {
    color: #ff6b6b;
  }

  .menu-label {
    flex: 1;
    white-space: nowrap;
  }

  .menu-label u {
    text-decoration: underline;
  }

  .submenu-arrow {
    font-size: 7px;
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
  }

  /* ===== Separator ===== */
  .menu-sep {
    height: 0;
    border-top: 1px solid var(--btn-shadow);
    border-bottom: 1px solid var(--btn-highlight);
    margin: 3px 2px;
  }

  /* ===== Cascading submenu ===== */
  .submenu {
    position: absolute;
    left: 100%;
    top: -3px;
    min-width: 160px;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
    padding: 2px;
    z-index: 100001;
  }

  .submenu-group-label {
    font-size: 9px;
    color: var(--win-text-disabled);
    padding: 2px 6px 1px;
    font-style: italic;
  }

  .submenu-sep {
    height: 0;
    border-top: 1px solid var(--btn-shadow);
    border-bottom: 1px solid var(--btn-highlight);
    margin: 2px 2px;
  }

  .submenu-item {
    padding-right: 16px;
  }
</style>
