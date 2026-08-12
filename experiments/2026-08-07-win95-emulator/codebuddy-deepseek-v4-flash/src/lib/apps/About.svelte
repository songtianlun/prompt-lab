<script>
  import { closeWindow } from '../windowStore.js';
  import { playSound } from '../settingsStore.js';

  export let win;
</script>

<div class="about">
  <div class="logo">🪟</div>
  <div class="title">Windows 95 模拟器</div>
  <div class="ver">版本 1.0.0</div>
  <div class="desc">
    这是一个使用 Svelte 构建的<br />
    Windows 95 桌面环境模拟器。<br /><br />
    包含记事本、画图、计算器、扫雷、<br />
    纸牌、资源管理器等经典应用，<br />
    以及显示、声音、系统等设置页面。
  </div>
  <div class="footer">
    <button class="win-btn" onclick={() => { playSound('click'); closeWindow(win.id); }}>确定</button>
  </div>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    background: var(--win-face);
    padding: 20px;
    text-align: center;
  }
  .logo {
    font-size: 56px;
    margin-bottom: 8px;
  }
  .title {
    font-size: 18px;
    font-weight: bold;
    color: var(--win-navy);
  }
  .ver {
    font-size: 12px;
    color: var(--win-dark);
    margin-bottom: 12px;
  }
  .desc {
    font-size: 12px;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .footer {
    margin-top: auto;
  }
</style>
