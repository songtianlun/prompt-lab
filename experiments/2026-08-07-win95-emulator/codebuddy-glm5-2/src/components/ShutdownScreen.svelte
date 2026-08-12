<script>
  import { powerState, restartRequested } from '../lib/stores.js'
  import { onMount } from 'svelte'

  let showSafeMessage = false

  onMount(() => {
    // Phase 1: fade to black (1.4s)
    const t1 = setTimeout(() => {
      showSafeMessage = true
    }, 1400)

    // Phase 2: show "safe to turn off" for 1.8s, then go to off or boot
    const t2 = setTimeout(() => {
      if ($restartRequested) {
        restartRequested.set(false)
        powerState.set('booting')
      } else {
        powerState.set('off')
      }
    }, 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  })
</script>

<div class="shutdown-overlay">
  {#if showSafeMessage}
    <div class="safe-message">
      <div class="safe-text">现在可以安全地关闭计算机了</div>
    </div>
  {/if}
</div>

<style>
  .shutdown-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 500000;
    animation: fade-to-black 1.4s ease-in forwards;
  }

  @keyframes fade-to-black {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .safe-message {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    animation: safe-fade-in 0.5s ease-out;
  }

  @keyframes safe-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .safe-text {
    color: #ffcc00;
    font-size: 20px;
    font-family: var(--font-ui, sans-serif);
    font-weight: bold;
    text-align: center;
    text-shadow: 0 0 4px rgba(255, 204, 0, 0.5);
  }
</style>
