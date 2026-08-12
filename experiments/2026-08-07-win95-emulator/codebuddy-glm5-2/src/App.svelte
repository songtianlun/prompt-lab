<script>
  import Desktop from './components/Desktop.svelte'
  import Taskbar from './components/Taskbar.svelte'
  import StartMenu from './components/StartMenu.svelte'
  import Window from './components/Window.svelte'
  import ShutdownDialog from './components/ShutdownDialog.svelte'
  import BootScreen from './components/BootScreen.svelte'
  import ShutdownScreen from './components/ShutdownScreen.svelte'
  import { windows, powerState } from './lib/stores.js'
  import { apps } from './lib/registry.js'

  let activeId = null

  // Track the active (top) window
  $: if ($windows.length > 0) {
    const visible = $windows.filter(w => !w.minimized)
    if (visible.length > 0) {
      activeId = visible.reduce((a, b) => (a.z > b.z ? a : b)).id
    } else {
      activeId = null
    }
  } else {
    activeId = null
  }

  function onFocus(id) {
    windows.focus(id)
  }

  function onClose(id) {
    windows.close(id)
  }

  function powerOn() {
    powerState.set('booting')
  }
</script>

{#if $powerState === 'on' || $powerState === 'shutdown-dialog'}
  <Desktop>
    <!-- Render all open windows -->
    {#each $windows as win (win.id)}
      <Window {win} active={win.id === activeId} on:focus={(e) => onFocus(e.detail)} on:close={(e) => onClose(e.detail)}>
        <svelte:component this={apps[win.app].component} {...win.props} winId={win.id} />
      </Window>
    {/each}

    <StartMenu />
    <Taskbar />
  </Desktop>

  {#if $powerState === 'shutdown-dialog'}
    <ShutdownDialog />
  {/if}
{:else if $powerState === 'shutting-down'}
  <ShutdownScreen />
{:else if $powerState === 'off'}
  <!-- Power-off screen with power-on button -->
  <div class="power-off-screen">
    <button class="power-on-button" on:click={powerOn} title="开机">
      <span class="power-icon">⏻</span>
      <span class="power-label">开机</span>
    </button>
  </div>
{:else if $powerState === 'booting'}
  <BootScreen />
{/if}

<style>
  :global(body) {
    overflow: hidden;
  }

  /* ===== Power-off screen ===== */
  .power-off-screen {
    position: absolute;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .power-on-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: transparent;
    border: 2px solid #444;
    border-radius: 8px;
    padding: 24px 32px;
    color: #ddd;
    font-family: var(--font-ui, sans-serif);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }

  .power-on-button:hover {
    border-color: #80c0ff;
    color: #fff;
    background: rgba(0, 120, 200, 0.15);
  }

  .power-icon {
    font-size: 48px;
    line-height: 1;
  }

  .power-label {
    font-size: 14px;
    letter-spacing: 2px;
  }
</style>
