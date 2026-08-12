<script>
  import { settings } from '../stores.js'

  const wallpaperOptions = [
    { id: 'teal', name: '青色', preview: '#008080' },
    { id: 'blue', name: '深蓝', preview: '#000080' },
    { id: 'forest', name: '森林', preview: '#004000' },
    { id: 'pattern', name: '图案', preview: 'repeating-linear-gradient(45deg, #008080 0, #008080 4px, #006060 4px, #006060 8px)' },
    { id: 'clouds', name: '云彩', preview: 'linear-gradient(180deg, #80c0ff, #008080)' }
  ]

  const accentOptions = [
    { name: '经典蓝', value: '#000080' },
    { name: '深红', value: '#800000' },
    { name: '森林绿', value: '#004000' },
    { name: '深紫', value: '#400080' }
  ]

  let activeTab = 'display'

  function setWallpaper(id) {
    settings.update(s => ({ ...s, wallpaper: id }))
  }

  function setAccent(value) {
    settings.update(s => ({ ...s, accent: value }))
    document.documentElement.style.setProperty('--win-blue', value)
  }
</script>

<div class="settings">
  <div class="tabs">
    <button class="tab" class:active={activeTab === 'display'} on:click={() => activeTab = 'display'}>显示</button>
    <button class="tab" class:active={activeTab === 'appearance'} on:click={() => activeTab = 'appearance'}>外观</button>
    <button class="tab" class:active={activeTab === 'about'} on:click={() => activeTab = 'about'}>关于</button>
  </div>

  <div class="tab-content bevel-in">
    {#if activeTab === 'display'}
      <div class="panel">
        <h3>桌面壁纸</h3>
        <p class="hint">选择桌面背景：</p>
        <div class="wallpaper-grid">
          {#each wallpaperOptions as wp}
            <button class="wallpaper-option" class:selected={$settings.wallpaper === wp.id} on:click={() => setWallpaper(wp.id)}>
              <div class="wp-preview" style="background: {wp.preview};"></div>
              <span>{wp.name}</span>
            </button>
          {/each}
        </div>
      </div>
    {:else if activeTab === 'appearance'}
      <div class="panel">
        <h3>主题颜色</h3>
        <p class="hint">选择标题栏强调色：</p>
        <div class="accent-grid">
          {#each accentOptions as acc}
            <button class="accent-option" class:selected={$settings.accent === acc.value} on:click={() => setAccent(acc.value)}>
              <div class="accent-preview" style="background: {acc.value};"></div>
              <span>{acc.name}</span>
            </button>
          {/each}
        </div>
        <div class="preview-box bevel-in-thin">
          <div class="titlebar" style="background: linear-gradient(90deg, {$settings.accent}, #1084d0);">
            <span class="titlebar-text">预览窗口</span>
          </div>
          <div class="preview-body">
            <button class="btn95">确定</button>
            <button class="btn95">取消</button>
          </div>
        </div>
      </div>
    {:else if activeTab === 'about'}
      <div class="panel about-panel">
        <div class="win-logo">
          <div class="logo-tile red"></div>
          <div class="logo-tile green"></div>
          <div class="logo-tile blue"></div>
          <div class="logo-tile yellow"></div>
        </div>
        <h3>Windows 95</h3>
        <p>Svelte 实现版本</p>
        <p class="version">版本 1.0 (Build 95)</p>
        <p class="copyright">© 1995-2026 保留所有权利</p>
      </div>
    {/if}
  </div>

  <div class="settings-buttons">
    <button class="btn95">确定</button>
    <button class="btn95">取消</button>
    <button class="btn95">应用</button>
  </div>
</div>

<style>
  .settings { display: flex; flex-direction: column; height: 100%; padding: 4px; gap: 4px; background: var(--win-bg); }
  .tabs { display: flex; gap: 2px; padding-left: 4px; }
  .tab { background: var(--win-bg); border-top: 2px solid var(--btn-highlight); border-left: 2px solid var(--btn-light); border-right: 2px solid var(--btn-darkshadow); border-bottom: none; padding: 4px 12px; font-size: 12px; cursor: default; position: relative; top: 2px; z-index: 1; }
  .tab.active { z-index: 2; padding-bottom: 6px; }
  .tab-content { flex: 1; background: var(--win-bg); padding: 12px; overflow: auto; z-index: 1; border-top: 2px solid var(--btn-darkshadow); border-left: 2px solid var(--btn-shadow); border-right: 2px solid var(--btn-highlight); border-bottom: 2px solid var(--btn-light); }
  .panel h3 { font-size: 14px; margin-bottom: 8px; }
  .hint { font-size: 12px; margin-bottom: 12px; color: #404040; }
  .wallpaper-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .wallpaper-option { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px; background: var(--win-bg); border: 2px solid transparent; cursor: default; }
  .wallpaper-option.selected { border: 2px solid var(--win-blue); }
  .wp-preview { width: 100%; height: 60px; border-top: 1px solid var(--btn-darkshadow); border-left: 1px solid var(--btn-shadow); border-right: 1px solid var(--btn-highlight); border-bottom: 1px solid var(--btn-light); }
  .accent-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
  .accent-option { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px; background: var(--win-bg); border: 2px solid transparent; cursor: default; }
  .accent-option.selected { border: 2px solid var(--win-blue); }
  .accent-preview { width: 100%; height: 30px; border-top: 1px solid var(--btn-darkshadow); border-left: 1px solid var(--btn-shadow); border-right: 1px solid var(--btn-highlight); border-bottom: 1px solid var(--btn-light); }
  .preview-box { margin-top: 12px; background: var(--win-bg); padding: 4px; }
  .preview-body { padding: 16px; display: flex; gap: 8px; justify-content: center; }
  .about-panel { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
  .win-logo { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 80px; height: 80px; margin-bottom: 12px; }
  .logo-tile { border-radius: 2px; }
  .logo-tile.red { background: #ff0000; }
  .logo-tile.green { background: #00ff00; }
  .logo-tile.blue { background: #0000ff; }
  .logo-tile.yellow { background: #ffff00; }
  .version, .copyright { font-size: 11px; color: #404040; }
  .settings-buttons { display: flex; gap: 6px; justify-content: flex-end; padding: 4px 0; }
</style>
