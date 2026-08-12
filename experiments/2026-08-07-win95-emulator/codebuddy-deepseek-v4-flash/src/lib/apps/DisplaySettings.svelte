<script>
  import { settings, playSound } from '../settingsStore.js';

  let tab = 'background';

  const wallpapers = [
    { name: '青绿色', color: '#008080' },
    { name: '蓝色', color: '#000080' },
    { name: '深灰色', color: '#404040' },
    { name: '黑色', color: '#000000' },
    { name: '墨绿色', color: '#004000' },
    { name: '紫红色', color: '#800080' },
    { name: '棕色', color: '#804000' }
  ];

  const resolutions = ['640x480', '800x600', '1024x768', '1280x720'];

  function setWallpaper(w) {
    settings.update(s => ({ ...s, wallpaper: w.name, wallpaperColor: w.color }));
    playSound('click');
  }

  function setResolution(r) {
    settings.update(s => ({ ...s, screenResolution: r }));
    playSound('click');
  }
</script>

<div class="display-settings">
  <div class="tabs">
    <button class="tab" class:active={tab==='background'} onclick={() => tab='background'}>背景</button>
    <button class="tab" class:active={tab==='screen'} onclick={() => tab='screen'}>屏幕</button>
  </div>

  <div class="tab-content">
    {#if tab === 'background'}
      <div class="section">
        <div class="label">选择桌面背景颜色：</div>
        <div class="wallpapers">
          {#each wallpapers as w}
            <div
              class="wallpaper"
              class:selected={$settings.wallpaperColor === w.color}
              style="background:{w.color};"
              onclick={() => setWallpaper(w)}
              title={w.name}
            ></div>
          {/each}
        </div>
        <div class="preview" style="background:{$settings.wallpaperColor};">
          <span>桌面预览</span>
        </div>
      </div>
    {:else}
      <div class="section">
        <div class="label">屏幕分辨率：</div>
        <div class="res-list">
          {#each resolutions as r}
            <label class="res-option">
              <input
                type="radio"
                name="res"
                checked={$settings.screenResolution === r}
                on:change={() => setResolution(r)}
              />
              {r}
            </label>
          {/each}
        </div>
        <div class="hint">当前分辨率：{$settings.screenResolution}</div>
      </div>
    {/if}
  </div>

  <div class="footer">
    <button class="win-btn" onclick={() => playSound('beep')}>应用</button>
    <button class="win-btn" onclick={() => playSound('click')}>取消</button>
  </div>
</div>

<style>
  .display-settings {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-face);
    padding: 8px;
  }
  .tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid var(--win-dark);
    margin-bottom: 10px;
  }
  .tab {
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: none;
    padding: 4px 12px;
    cursor: pointer;
    font-family: var(--win-font);
    font-size: 12px;
    position: relative;
    top: 1px;
  }
  .tab.active {
    background: var(--win-face);
    border-bottom: 2px solid var(--win-face);
    font-weight: bold;
  }
  .tab-content {
    flex: 1;
    overflow-y: auto;
  }
  .label {
    margin-bottom: 8px;
    font-size: 12px;
  }
  .wallpapers {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .wallpaper {
    width: 48px;
    height: 36px;
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    cursor: pointer;
  }
  .wallpaper.selected {
    outline: 2px solid var(--win-navy);
    outline-offset: 2px;
  }
  .preview {
    height: 120px;
    border: 1px solid var(--win-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-shadow: 1px 1px 0 #000;
    font-size: 14px;
  }
  .res-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
  .res-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    cursor: pointer;
  }
  .hint {
    font-size: 12px;
    color: var(--win-dark);
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--win-dark);
  }
</style>
