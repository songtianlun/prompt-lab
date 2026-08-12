<script>
  // About dialog - no interactive logic needed
</script>

<div class="about">
  <div class="about-content">
    <div class="about-logo">
      <div class="win-logo">
        <div class="logo-tile red"></div>
        <div class="logo-tile green"></div>
        <div class="logo-tile blue"></div>
        <div class="logo-tile yellow"></div>
      </div>
    </div>
    <div class="about-text">
      <h2>Windows 95</h2>
      <p class="subtitle">Svelte 实现版本</p>
      <div class="info-section">
        <p><strong>版本:</strong> 1.0 (Build 95)</p>
        <p><strong>技术:</strong> Svelte 4 + Vite 5</p>
        <p><strong>许可:</strong> 仅供学习娱乐</p>
      </div>
      <p class="copyright">本产品采用 Svelte 框架构建，<br />还原经典 Windows 95 体验。</p>
      <p class="copyright-small">© 1995-2026 保留所有权利</p>
    </div>
  </div>
  <div class="about-buttons">
    <button class="btn95">确定</button>
  </div>
</div>

<style>
  .about { display: flex; flex-direction: column; height: 100%; padding: 12px; gap: 12px; background: var(--win-bg); }
  .about-content { display: flex; gap: 16px; flex: 1; align-items: center; }
  .about-logo { flex-shrink: 0; }
  .win-logo { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; width: 80px; height: 80px; }
  .logo-tile { border-radius: 2px; }
  .logo-tile.red { background: #ff0000; }
  .logo-tile.green { background: #00ff00; }
  .logo-tile.blue { background: #0000ff; }
  .logo-tile.yellow { background: #ffff00; }
  .about-text h2 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #404040; margin-bottom: 12px; }
  .info-section { margin-bottom: 12px; font-size: 12px; line-height: 1.6; }
  .copyright { font-size: 11px; color: #404040; line-height: 1.5; margin-bottom: 4px; }
  .copyright-small { font-size: 10px; color: #808080; }
  .about-buttons { display: flex; justify-content: center; }
</style>
