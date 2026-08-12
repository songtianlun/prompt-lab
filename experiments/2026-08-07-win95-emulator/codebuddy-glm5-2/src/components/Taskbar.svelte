<script>
  import { onMount, onDestroy } from 'svelte'
  import { windows, startMenuOpen } from '../lib/stores.js'
  import { apps } from '../lib/registry.js'

  let currentTime = new Date()
  let timeInterval

  onMount(() => {
    timeInterval = setInterval(() => {
      currentTime = new Date()
    }, 1000)
  })

  onDestroy(() => {
    clearInterval(timeInterval)
  })

  function toggleStartMenu() {
    startMenuOpen.update(v => !v)
  }

  function onTaskItemClick(id) {
    const win = $windows.find(w => w.id === id)
    if (!win) return
    // If it's the top window and not minimized, minimize it
    const topZ = Math.max(...$windows.filter(w => !w.minimized).map(w => w.z))
    if (win.z === topZ && !win.minimized) {
      windows.minimize(id)
    } else {
      windows.focus(id)
    }
  }

  $: topZ = $windows.length > 0 ? Math.max(...$windows.map(w => w.z)) : 0

  function formatTime(d) {
    let h = d.getHours()
    const m = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
  }
</script>

<div class="taskbar">
  <!-- Start Button -->
  <button
    class="start-button"
    class:active={$startMenuOpen}
    on:click|stopPropagation={toggleStartMenu}
  >
    <img src={apps.about.icon} alt="" class="start-logo" />
    <span>开始</span>
  </button>

  <!-- Task Items -->
  <div class="task-items">
    {#each $windows as win (win.id)}
      <button
        class="task-item"
        class:active={win.z === topZ && !win.minimized}
        on:click={() => onTaskItemClick(win.id)}
      >
        {#if win.icon}
          <img src={win.icon} alt="" class="task-icon" />
        {/if}
        <span class="task-label">{win.title}</span>
      </button>
    {/each}
  </div>

  <!-- System Tray -->
  <div class="system-tray">
    <span class="tray-icon" title="音量">🔊</span>
    <span class="tray-time">{formatTime(currentTime)}</span>
  </div>
</div>

<style>
  .taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--taskbar-h);
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    display: flex;
    align-items: center;
    padding: 2px 2px 2px 2px;
    gap: 2px;
    z-index: 99999;
  }

  .start-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--btn-face);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    padding: 2px 6px 2px 4px;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: bold;
    color: var(--win-text);
    cursor: default;
    height: 28px;
  }

  .start-button.active {
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
  }

  .start-logo {
    width: 18px;
    height: 18px;
  }

  .task-items {
    flex: 1;
    display: flex;
    gap: 2px;
    overflow: hidden;
    padding: 0 2px;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--btn-face);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    padding: 2px 6px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--win-text);
    cursor: default;
    height: 28px;
    min-width: 100px;
    max-width: 160px;
    overflow: hidden;
  }

  .task-item.active {
    border-top: 2px solid var(--btn-darkshadow);
    border-left: 2px solid var(--btn-shadow);
    border-right: 2px solid var(--btn-highlight);
    border-bottom: 2px solid var(--btn-light);
    background-image: repeating-linear-gradient(45deg, transparent 0, transparent 1px, rgba(255,255,255,0.4) 1px, rgba(255,255,255,0.4) 2px);
  }

  .task-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .task-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .system-tray {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--win-bg);
    border-top: 1px solid var(--btn-darkshadow);
    border-left: 1px solid var(--btn-shadow);
    border-right: 1px solid var(--btn-highlight);
    border-bottom: 1px solid var(--btn-light);
    padding: 0 8px;
    height: 28px;
  }

  .tray-icon {
    font-size: 14px;
  }

  .tray-time {
    font-size: 12px;
    min-width: 60px;
    text-align: center;
  }
</style>
