<script>
  import { powerState, windows, restartRequested } from '../lib/stores.js'

  let action = 'shutdown' // 'shutdown' | 'restart' | 'restart-dos' | 'logoff'

  function confirm() {
    if (action === 'shutdown') {
      restartRequested.set(false)
      powerState.set('shutting-down')
      windows.closeAll()
    } else if (action === 'restart') {
      restartRequested.set(true)
      powerState.set('shutting-down')
      windows.closeAll()
    } else if (action === 'restart-dos') {
      restartRequested.set(false)
      powerState.set('shutting-down')
      windows.closeAll()
    }
  }

  function cancel() {
    powerState.set('on')
  }
</script>

<!-- Modal backdrop -->
<div class="backdrop" on:click|self={cancel}>
  <div class="dialog" on:click|stopPropagation>
    <!-- Title bar -->
    <div class="title-bar">
      <div class="title-text">关闭 Windows</div>
      <div class="title-controls">
        <button class="title-btn" on:click={cancel}>?</button>
        <button class="title-btn" on:click={cancel}>×</button>
      </div>
    </div>

    <!-- Body -->
    <div class="dialog-body">
      <div class="banner">
        <div class="banner-text">
          <div class="banner-title">Windows<span class="banner-95">95</span></div>
          <div class="banner-sub">正在关闭...</div>
        </div>
      </div>

      <div class="content">
        <p class="question">您希望计算机做什么？</p>

        <div class="options">
          <label class="option">
            <input type="radio" name="action" value="shutdown" bind:group={action} />
            <span class="radio-mark"></span>
            <span>关闭计算机(<u>S</u>)</span>
          </label>
          <label class="option">
            <input type="radio" name="action" value="restart" bind:group={action} />
            <span class="radio-mark"></span>
            <span>重新启动计算机(<u>R</u>)</span>
          </label>
          <label class="option">
            <input type="radio" name="action" value="restart-dos" bind:group={action} />
            <span class="radio-mark"></span>
            <span>重新启动计算机并切换到 MS-DOS 方式(<u>M</u>)</span>
          </label>
          <label class="option">
            <input type="radio" name="action" value="logoff" bind:group={action} />
            <span class="radio-mark"></span>
            <span>关闭所有程序并以其他用户身份登录(<u>C</u>)</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="dialog-buttons">
      <button class="btn btn-default" on:click={confirm}>确定</button>
      <button class="btn" on:click={cancel}>取消</button>
      <button class="btn" on:click={confirm}>帮助</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200000;
  }

  .dialog {
    width: 380px;
    background: var(--win-bg);
    border-top: 2px solid var(--btn-highlight);
    border-left: 2px solid var(--btn-light);
    border-right: 2px solid var(--btn-darkshadow);
    border-bottom: 2px solid var(--btn-shadow);
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
  }

  /* ===== Title bar ===== */
  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, #000080, #1084d0);
    color: white;
    padding: 2px 2px 2px 4px;
    height: 20px;
  }

  .title-text {
    font-size: 12px;
    font-weight: bold;
    font-family: var(--font-ui);
  }

  .title-controls {
    display: flex;
    gap: 2px;
  }

  .title-btn {
    width: 16px;
    height: 14px;
    background: var(--win-bg);
    border-top: 1px solid var(--btn-highlight);
    border-left: 1px solid var(--btn-light);
    border-right: 1px solid var(--btn-darkshadow);
    border-bottom: 1px solid var(--btn-shadow);
    color: black;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    line-height: 1;
    padding: 0;
  }

  .title-btn:active {
    border-top: 1px solid var(--btn-darkshadow);
    border-left: 1px solid var(--btn-shadow);
    border-right: 1px solid var(--btn-light);
    border-bottom: 1px solid var(--btn-highlight);
  }

  /* ===== Body ===== */
  .dialog-body {
    display: flex;
    background: var(--win-bg);
  }

  .banner {
    width: 110px;
    background: linear-gradient(135deg, #000080, #1084d0);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 12px 8px;
    flex-shrink: 0;
  }

  .banner-text {
    text-align: center;
    color: white;
  }

  .banner-title {
    font-size: 22px;
    font-weight: bold;
    font-style: italic;
    line-height: 1;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .banner-95 {
    font-size: 26px;
  }

  .banner-sub {
    font-size: 11px;
    margin-top: 6px;
    opacity: 0.9;
  }

  .content {
    flex: 1;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .question {
    font-size: 12px;
    font-family: var(--font-ui);
    margin: 0;
    color: var(--win-text);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--font-ui);
    color: var(--win-text);
    cursor: default;
    padding: 1px 0;
  }

  .option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .radio-mark {
    width: 12px;
    height: 12px;
    border: 1px solid var(--btn-darkshadow);
    border-radius: 50%;
    background: var(--win-bg);
    box-shadow: inset 1px 1px 0 var(--btn-highlight);
    flex-shrink: 0;
    position: relative;
  }

  .option input:checked + .radio-mark::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--win-text);
  }

  .option input:focus + .radio-mark {
    border-color: var(--win-text);
  }

  /* ===== Buttons ===== */
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding: 8px 10px;
    background: var(--win-bg);
    border-top: 1px solid var(--btn-shadow);
  }

  .btn {
    min-width: 65px;
    height: 22px;
    background: var(--win-bg);
    border-top: 1px solid var(--btn-highlight);
    border-left: 1px solid var(--btn-light);
    border-right: 1px solid var(--btn-darkshadow);
    border-bottom: 1px solid var(--btn-shadow);
    font-size: 12px;
    font-family: var(--font-ui);
    color: var(--win-text);
    cursor: default;
    padding: 0 8px;
  }

  .btn:active {
    border-top: 1px solid var(--btn-darkshadow);
    border-left: 1px solid var(--btn-shadow);
    border-right: 1px solid var(--btn-light);
    border-bottom: 1px solid var(--btn-highlight);
  }

  .btn-default {
    box-shadow: 1px 1px 0 var(--btn-darker) inset;
  }
</style>
