<script>
  import { onMount, onDestroy } from 'svelte';

  let now = new Date();
  let timer;

  onMount(() => {
    timer = setInterval(() => { now = new Date(); }, 1000);
  });
  onDestroy(() => clearInterval(timer));

  function pad(n) { return String(n).padStart(2, '0'); }

  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
</script>

<div class="clock">
  <div class="time">{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</div>
  <div class="date">{now.getFullYear()}年{now.getMonth()+1}月{now.getDate()}日 {days[now.getDay()]}</div>
</div>

<style>
  .clock {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: var(--win-face);
    gap: 12px;
  }
  .time {
    font-family: 'Courier New', monospace;
    font-size: 40px;
    font-weight: bold;
    color: var(--win-navy);
  }
  .date {
    font-size: 14px;
    color: var(--win-dark);
  }
</style>
