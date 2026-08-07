<script>
  import StartMenu from './StartMenu.svelte'

  let { manager } = $props()

  let clock = $state('')
  function updateClock() {
    const d = new Date()
    let h = d.getHours()
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    let m = String(d.getMinutes()).padStart(2, '0')
    clock = `${h}:${m} ${ampm}`
  }
  $effect(() => {
    updateClock()
    const t = setInterval(updateClock, 1000)
    return () => clearInterval(t)
  })
</script>

<div class="taskbar">
  <button
    class="w95-btn start-btn"
    class:active={manager.getStartOpen()}
    onclick={() => manager.setStartOpen(!manager.getStartOpen())}
  >
    <svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges">
      <rect width="16" height="16" fill="#008080"/>
      <g>
        <rect x="0.5" y="0.5" width="7.4" height="7.4" fill="#ff3f2e"/>  <!-- red -->
        <rect x="8.2" y="0.5" width="7.4" height="7.4" fill="#24a024"/>  <!-- green -->
        <rect x="0.5" y="8.2" width="7.4" height="7.4" fill="#1f36d0"/>  <!-- blue -->
        <rect x="8.2" y="8.2" width="7.4" height="7.4" fill="#f7d900"/>  <!-- yellow -->
        <rect x="0.5" y="0.5" width="7.4" height="1"  fill="#f0b0a8" opacity="0.7"/>
        <rect x="0.5" y="0.5" width="1"  height="7.4" fill="#f0b0a8" opacity="0.7"/>
        <rect x="7.5" y="0.5" width="0.4" height="7.4" fill="#ffffff" opacity="0.35"/>
        <rect x="8.2" y="0.5" width="0.4" height="7.4" fill="#ffffff" opacity="0.35"/>
        <rect x="0.5" y="7.2" width="7.4" height="0.4" fill="#ffffff" opacity="0.35"/>
        <rect x="8.2" y="7.2" width="7.4" height="0.4" fill="#ffffff" opacity="0.35"/>
        <rect x="0.5" y="8.2" width="7.4" height="0.4" fill="#ffffff" opacity="0.25"/>
        <rect x="0.5" y="8.2" width="0.4" height="7.4" fill="#ffffff" opacity="0.25"/>
        <rect x="7.5" y="8.2" width="0.4" height="7.4" fill="#ffffff" opacity="0.25"/>
      </g>
      <rect width="16" height="1" fill="#ffffff" opacity="0.25"/>
    </svg>
    <span>开始</span>
  </button>

  {#each manager.windows as win (win.id)}
    <button
      class="task-btn"
      class:minimized={win.minimized}
      onclick={() => manager.toggleTask(win.id)}
    >
      {#if win.icon}
        <span><win.icon width={16} height={16} /></span>
      {/if}
      <span>{win.title}</span>
    </button>
  {/each}

  <div class="tray">
    <svg viewBox="0 0 16 14" width="16" height="14" shape-rendering="crispEdges">
      <rect x="0" y="0" width="16" height="4" fill="#000000"/>
      <rect x="3" y="4" width="3" height="10" fill="#ff0000"/>
      <rect x="6" y="4" width="3" height="10" fill="#ffff00"/>
      <rect x="9" y="4" width="3" height="10" fill="#00a800"/>
      <rect x="12" y="4" width="3" height="10" fill="#0000ff"/>
    </svg>
    <span>{clock}</span>
  </div>
</div>

{#if manager.getStartOpen()}
  <StartMenu {manager} />
{/if}
