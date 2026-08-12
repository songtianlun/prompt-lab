<script>
  import { settings, playSound } from '../settingsStore.js';

  function toggleSound() {
    settings.update(s => ({ ...s, soundEnabled: !s.soundEnabled }));
  }

  function setVolume(e) {
    settings.update(s => ({ ...s, volume: parseInt(e.target.value) }));
  }

  function testSound() {
    playSound('beep');
  }
</script>

<div class="sound-settings">
  <div class="section">
    <div class="label">系统声音</div>
    <label class="option">
      <input type="checkbox" checked={$settings.soundEnabled} on:change={toggleSound} />
      启用系统声音
    </label>
  </div>

  <div class="section">
    <div class="label">音量：{$settings.volume}%</div>
    <input
      type="range"
      min="0"
      max="100"
      value={$settings.volume}
      on:input={setVolume}
      disabled={!$settings.soundEnabled}
    />
  </div>

  <div class="section">
    <div class="label">测试音效</div>
    <div class="sound-buttons">
      <button class="win-btn" onclick={() => playSound('startup')} disabled={!$settings.soundEnabled}>启动</button>
      <button class="win-btn" onclick={() => playSound('click')} disabled={!$settings.soundEnabled}>点击</button>
      <button class="win-btn" onclick={() => playSound('error')} disabled={!$settings.soundEnabled}>错误</button>
      <button class="win-btn" onclick={testSound} disabled={!$settings.soundEnabled}>提示音</button>
    </div>
  </div>

  <div class="footer">
    <button class="win-btn" onclick={() => playSound('click')}>确定</button>
  </div>
</div>

<style>
  .sound-settings {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-face);
    padding: 12px;
    gap: 16px;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .label {
    font-weight: bold;
    font-size: 12px;
  }
  .option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    cursor: pointer;
  }
  input[type="range"] {
    width: 100%;
  }
  .sound-buttons {
    display: flex;
    gap: 6px;
  }
  .footer {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
  }
</style>
