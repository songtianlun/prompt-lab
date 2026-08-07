<script>
  import Icon from '../Icon.svelte'
  import { windows } from '../stores.js'
  export let win
</script>

<div class="about">
  <div class="left">
    <Icon name="info" size={48} />
  </div>
  <div class="right">
    <div class="title">Microsoft &reg; Windows 95</div>
    <div class="ver">版本 4.00.950</div>
    <div class="copy">版权 &copy; 1981-1995 Microsoft Corp.</div>
    <div class="desc">这是一台由 Svelte 复刻的 Windows 95 仿真机。</div>
    <div class="row"><span>注册给:</span><b>复刻爱好者</b></div>
    <div class="row"><span>物理内存:</span><b>16,384 KB</b></div>
    <div class="row"><span>可用内存:</span><b>8,192 KB</b></div>
  </div>
  <div class="btns">
    <button class="w95-btn" on:click={() => windows.close(win.id)}>确定</button>
  </div>
</div>

<style>
  .about { display: flex; flex-wrap: wrap; gap: 12px; padding: 14px; height: 100%; }
  .left { flex: 0 0 auto; }
  .right { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .title { font-weight: bold; font-size: 13px; }
  .ver, .copy { color: #000; }
  .desc { margin: 8px 0; color: #404040; }
  .row { display: flex; gap: 6px; }
  .row span { width: 70px; color: #404040; }
  .btns { flex-basis: 100%; display: flex; justify-content: center; align-self: flex-end; margin-top: 8px; }
</style>
