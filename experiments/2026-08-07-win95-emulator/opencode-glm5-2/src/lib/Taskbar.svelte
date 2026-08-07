<script>
  import Icon from './Icon.svelte'
  import { windows, activeId, startMenuOpen } from './stores.js'

  const TASKBAR = 28
  let now = new Date()
  $: clock = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  let interval
  import { onMount } from 'svelte'
  onMount(() => {
    interval = setInterval(() => (now = new Date()), 1000)
    return () => clearInterval(interval)
  })

  function startToggle(e) {
    e.stopPropagation()
    startMenuOpen.update((v) => !v)
  }

  function taskClick(w) {
    if (w.minimized) {
      windows.toggleMinimize(w.id)
      windows.focus(w.id)
    } else if ($activeId === w.id) {
      windows.toggleMinimize(w.id)
    } else {
      windows.focus(w.id)
    }
  }
</script>

<div class="taskbar w95-raised">
  <button
    class="start-btn"
    class:active={$startMenuOpen}
    on:click={startToggle}
  >
    <span class="win-logo">
      <span class="flag red"></span><span class="flag green"></span>
      <span class="flag blue"></span><span class="flag yellow"></span>
    </span>
    <span class="start-label">开始</span>
  </button>

  <div class="divider"></div>

  <div class="tasks">
    {#each $windows as w (w.id)}
      <button
        class="task"
        class:active={$activeId === w.id && !w.minimized}
        on:click={() => taskClick(w)}
      >
        <Icon name={w.icon} size={16} />
        <span class="task-label">{w.title}</span>
      </button>
    {/each}
  </div>

  <div class="tray w95-sunken">
    <span class="clock">{clock}</span>
  </div>
</div>

<style>
  .taskbar {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 28px;
    display: flex;
    align-items: center;
    padding: 2px;
    gap: 4px;
    background: var(--w95-surface);
    z-index: 10000;
  }
  .start-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 6px 0 4px;
    background: var(--w95-surface);
    border: none;
    font-family: var(--w95-font);
    font-size: 11px;
    font-weight: bold;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
  }
  .start-btn.active {
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-light),
      inset  1px  1px 0 0 var(--w95-button-shadow),
      inset -2px -2px 0 0 var(--w95-button-highlight),
      inset  2px  2px 0 0 var(--w95-button-dark);
  }
  .win-logo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    width: 16px;
    height: 14px;
    gap: 1px;
    transform: skewY(-4deg);
  }
  .flag { display: block; }
  .flag.red { background: #ff3030; }
  .flag.green { background: #30c030; }
  .flag.blue { background: #3060ff; }
  .flag.yellow { background: #ffcc00; }
  .start-label { line-height: 1; }

  .divider {
    width: 2px;
    height: 22px;
    margin: 0 2px;
    box-shadow: inset -1px 0 0 #808080, inset 1px 0 0 #ffffff;
  }

  .tasks {
    flex: 1;
    display: flex;
    gap: 3px;
    align-items: center;
    overflow: hidden;
  }
  .task {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 22px;
    min-width: 0;
    flex: 0 1 160px;
    padding: 0 6px;
    background: var(--w95-surface);
    border: none;
    font-family: var(--w95-font);
    font-size: 11px;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
  }
  .task.active {
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-light),
      inset  1px  1px 0 0 var(--w95-button-shadow),
      inset -2px -2px 0 0 var(--w95-button-highlight),
      inset  2px  2px 0 0 var(--w95-button-dark);
    background-image: radial-gradient(circle at 2px 2px, #c0c0c0 1px, transparent 1px);
    background-size: 3px 3px;
  }
  .task-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tray {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    background: var(--w95-surface);
  }
  .clock { font-size: 11px; }
</style>
