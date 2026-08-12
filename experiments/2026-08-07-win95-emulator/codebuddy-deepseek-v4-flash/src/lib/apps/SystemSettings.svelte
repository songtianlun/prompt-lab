<script>
  import { settings, playSound } from '../settingsStore.js';

  let tab = 'general';
  let newName = $settings.computerName;

  function saveName() {
    settings.update(s => ({ ...s, computerName: newName || 'WIN95-PC' }));
    playSound('click');
  }
</script>

<div class="system-settings">
  <div class="tabs">
    <button class="tab" class:active={tab==='general'} onclick={() => tab='general'}>常规</button>
    <button class="tab" class:active={tab==='computer'} onclick={() => tab='computer'}>计算机名</button>
  </div>

  <div class="tab-content">
    {#if tab === 'general'}
      <div class="sys-info">
        <div class="logo">🪟</div>
        <div class="info">
          <div class="title">Microsoft Windows 95</div>
          <div class="ver">版本 4.00.950</div>
          <div class="ver">Win95 模拟器</div>
          <div class="ver">基于 Svelte 构建</div>
        </div>
      </div>
      <div class="hardware">
        <div class="label">计算机：</div>
        <div>Intel Pentium 处理器</div>
        <div>32.0 MB 内存</div>
        <div>2.0 GB 硬盘空间</div>
      </div>
    {:else}
      <div class="computer-name">
        <div class="label">计算机名称：</div>
        <input class="win-inset name-input" bind:value={newName} />
        <div class="hint">此名称用于在网络上标识此计算机。</div>
        <button class="win-btn" onclick={saveName}>确定</button>
      </div>
    {/if}
  </div>

  <div class="footer">
    <button class="win-btn" onclick={() => playSound('click')}>确定</button>
    <button class="win-btn" onclick={() => playSound('click')}>取消</button>
  </div>
</div>

<style>
  .system-settings {
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
    border-bottom: 2px solid var(--win-face);
    font-weight: bold;
  }
  .tab-content {
    flex: 1;
    overflow-y: auto;
  }
  .sys-info {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--win-dark);
    margin-bottom: 12px;
  }
  .logo {
    font-size: 48px;
  }
  .title {
    font-size: 18px;
    font-weight: bold;
    color: var(--win-navy);
  }
  .ver {
    font-size: 12px;
    color: var(--win-dark);
  }
  .hardware {
    font-size: 12px;
    line-height: 1.8;
    padding: 0 12px;
  }
  .label {
    font-weight: bold;
    margin-bottom: 6px;
  }
  .computer-name {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }
  .name-input {
    width: 200px;
    padding: 4px 6px;
    font-family: var(--win-font);
    font-size: 12px;
    background: #fff;
  }
  .hint {
    font-size: 11px;
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
