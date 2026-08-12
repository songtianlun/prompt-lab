<script>
  import Desktop from './lib/Desktop.svelte';
  import Taskbar from './lib/Taskbar.svelte';
  import PowerScreen from './lib/PowerScreen.svelte';
  import { playSound } from './lib/settingsStore.js';
  import { powerState } from './lib/systemStore.js';
  import { onMount } from 'svelte';

  onMount(() => {
    // 启动音效
    setTimeout(() => playSound('startup'), 300);
  });
</script>

<div class="os">
  {#if $powerState === 'on'}
    <Desktop />
    <Taskbar />
  {/if}
  <PowerScreen />
</div>

<style>
  .os {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #008080;
  }
</style>
