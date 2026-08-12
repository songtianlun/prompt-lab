<script>
  import { openWindow } from '../windowStore.js';

  const items = [
    { appId: 'display', name: '显示', icon: '🖥️', desc: '更改桌面背景、屏幕分辨率' },
    { appId: 'sound', name: '声音', icon: '🔊', desc: '调整系统音量与音效' },
    { appId: 'system', name: '系统', icon: '💻', desc: '查看系统信息与计算机名称' },
    { appId: 'about', name: '关于', icon: 'ℹ️', desc: '关于本模拟器' }
  ];

  function open(item) {
    const sizes = {
      display: { width: 480, height: 420 },
      sound: { width: 420, height: 360 },
      system: { width: 480, height: 420 },
      about: { width: 400, height: 320 }
    };
    openWindow(item.appId, { title: item.name, ...(sizes[item.appId] || {}) });
  }
</script>

<div class="settings">
  <div class="header">控制面板</div>
  <div class="grid">
    {#each items as item}
      <div class="item" ondblclick={() => open(item)}>
        <div class="icon">{item.icon}</div>
        <div class="info">
          <div class="name">{item.name}</div>
          <div class="desc">{item.desc}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .settings {
    height: 100%;
    background: var(--win-face);
    padding: 8px;
    overflow-y: auto;
  }
  .header {
    font-size: 16px;
    font-weight: bold;
    color: var(--win-navy);
    margin-bottom: 12px;
    border-bottom: 1px solid var(--win-dark);
    padding-bottom: 6px;
  }
  .grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    cursor: default;
    border: 1px solid transparent;
  }
  .item:hover {
    background: var(--win-navy);
    color: #fff;
  }
  .icon {
    font-size: 32px;
  }
  .name {
    font-weight: bold;
    font-size: 13px;
  }
  .desc {
    font-size: 11px;
    opacity: 0.8;
  }
</style>
