<script>
  import { powerState, boot } from './systemStore.js';
  import { playSound } from './settingsStore.js';

  // BIOS 内存计数
  let mem = 0;
  let memTimer;
  let biosDone = false;

  // 启动画面滚动条
  let splashProgress = 0;
  let splashTimer;

  // 关机画面进度
  let shutdownProgress = 0;
  let shutdownTimer;

  // 生成云朵数组（蓝天白云启动画面）
  const clouds = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    scale: 0.6 + Math.random() * 1.4,
    speed: 0.5 + Math.random() * 1.5,
    delay: Math.random() * 20
  }));

  function onBoot() {
    boot();
    playSound('startup');
  }

  // 根据状态启动对应动画
  $: if ($powerState === 'bios') {
    startBios();
  } else if ($powerState === 'splash') {
    startSplash();
  } else if ($powerState === 'shuttingDown') {
    startShutdown();
  }

  function startBios() {
    biosDone = false;
    mem = 0;
    clearInterval(memTimer);
    memTimer = setInterval(() => {
      mem += Math.floor(Math.random() * 2000) + 500;
      if (mem >= 65536) {
        mem = 65536;
        biosDone = true;
        clearInterval(memTimer);
      }
    }, 30);
  }

  function startSplash() {
    splashProgress = 0;
    clearInterval(splashTimer);
    splashTimer = setInterval(() => {
      splashProgress += Math.random() * 6 + 2;
      if (splashProgress >= 100) {
        splashProgress = 100;
        clearInterval(splashTimer);
      }
    }, 60);
  }

  function startShutdown() {
    shutdownProgress = 0;
    clearInterval(shutdownTimer);
    shutdownTimer = setInterval(() => {
      shutdownProgress += Math.random() * 5 + 2;
      if (shutdownProgress >= 100) {
        shutdownProgress = 100;
        clearInterval(shutdownTimer);
      }
    }, 60);
  }
</script>

<!-- 开机：BIOS 自检 -->
{#if $powerState === 'bios'}
  <div class="bios-screen">
    <div class="bios-text">
      <div>Phoenix BIOS 4.0 Release 6.0</div>
      <div>Copyright 1985-1995 Phoenix Technologies Ltd.</div>
      <div>All Rights Reserved</div>
      <div class="bios-spacer"></div>
      <div>CPU : Pentium 133 MHz</div>
      <div>Memory Test : {mem.toLocaleString()} KB {biosDone ? 'OK' : ''}</div>
      <div class="bios-spacer"></div>
      <div>Detecting IDE Primary Master ... WDC AC21000H</div>
      <div>Detecting IDE Primary Slave  ... None</div>
      <div>Detecting IDE Secondary Master ... None</div>
      <div>Detecting IDE Secondary Slave  ... None</div>
      <div class="bios-spacer"></div>
      <div>Press DEL to enter SETUP</div>
      <div>Press F1 to continue</div>
    </div>
  </div>
{:else if $powerState === 'starting'}
  <!-- 开机：Starting Windows 95 -->
  <div class="starting-screen">
    <div class="starting-text">Starting Windows 95...</div>
  </div>
{:else if $powerState === 'splash'}
  <!-- 开机：蓝天白云启动画面 -->
  <div class="splash-screen">
    <div class="splash-sky">
      {#each clouds as c}
        <div
          class="splash-cloud"
          style="top:{c.top}%; left:{c.left}%; transform:scale({c.scale}); animation-duration:{c.speed * 20}s; animation-delay:-{c.delay}s;"
        ></div>
      {/each}
      <div class="splash-logo">
        <div class="logo-windows">🪟</div>
        <div class="logo-text">
          <span class="logo-w">Microsoft</span>
          <span class="logo-win">Windows<span class="logo-95">95</span></span>
        </div>
      </div>
      <div class="splash-bar">
        <div class="splash-bar-fill" style="width:{splashProgress}%"></div>
      </div>
      <div class="splash-copyright">Copyright © Microsoft Corporation 1981-1995</div>
    </div>
  </div>
{:else if $powerState === 'shuttingDown'}
  <!-- 关机：正在关机画面 -->
  <div class="shutdown-screen">
    <div class="shutdown-sky">
      <div class="shutdown-clouds">
        {#each clouds.slice(0, 20) as c}
          <div
            class="splash-cloud"
            style="top:{c.top}%; left:{c.left}%; transform:scale({c.scale}); animation-duration:{c.speed * 20}s; animation-delay:-{c.delay}s;"
          ></div>
        {/each}
      </div>
      <div class="shutdown-logo">
        <div class="logo-windows">🪟</div>
        <div class="logo-text">
          <span class="logo-w">Microsoft</span>
          <span class="logo-win">Windows<span class="logo-95">95</span></span>
        </div>
      </div>
      <div class="shutdown-text">正在关机，请稍候...</div>
      <div class="splash-bar">
        <div class="splash-bar-fill" style="width:{shutdownProgress}%"></div>
      </div>
    </div>
  </div>
{:else if $powerState === 'off'}
  <!-- 已关机 -->
  <div class="power-off">
    <div class="off-box">
      <div class="off-text">现在可以安全地关闭计算机了。</div>
      <button class="win-btn power-btn" on:click={onBoot}>🔌 开机</button>
    </div>
  </div>
{/if}

<style>
  /* ===== 通用 ===== */
  .bios-screen, .starting-screen, .splash-screen, .shutdown-screen, .power-off {
    position: absolute;
    inset: 0;
    z-index: 5000;
    overflow: hidden;
  }

  /* ===== BIOS 自检 ===== */
  .bios-screen {
    background: #000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 40px;
  }
  .bios-text {
    color: #c0c0c0;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre;
  }
  .bios-spacer { height: 12px; }

  /* ===== Starting Windows 95 ===== */
  .starting-screen {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .starting-text {
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    letter-spacing: 1px;
  }

  /* ===== 蓝天白云 ===== */
  .splash-screen, .shutdown-screen {
    background: linear-gradient(180deg, #0000a8 0%, #1084d0 100%);
  }
  .splash-sky, .shutdown-sky {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .splash-cloud {
    position: absolute;
    width: 120px;
    height: 40px;
    background: #fff;
    border-radius: 20px;
    opacity: 0.9;
    animation: cloud-drift linear infinite;
  }
  .splash-cloud::before {
    content: '';
    position: absolute;
    top: -18px;
    left: 20px;
    width: 50px;
    height: 50px;
    background: #fff;
    border-radius: 50%;
  }
  .splash-cloud::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 55px;
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
  }
  @keyframes cloud-drift {
    from { margin-left: -150px; }
    to { margin-left: 110vw; }
  }

  /* ===== 启动 Logo ===== */
  .splash-logo, .shutdown-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .logo-windows {
    font-size: 90px;
    filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.3));
  }
  .logo-text {
    display: flex;
    flex-direction: column;
    color: #fff;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.4);
  }
  .logo-w {
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .logo-win {
    font-size: 60px;
    font-weight: bold;
    line-height: 1;
  }
  .logo-95 {
    color: #ffd700;
  }

  /* ===== 启动进度条 ===== */
  .splash-bar {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 16px;
    border: 2px solid #fff;
    padding: 2px;
    background: rgba(0,0,0,0.2);
  }
  .splash-bar-fill {
    height: 100%;
    width: 0;
    background: linear-gradient(90deg, #0000a8, #1084d0);
    transition: width 0.1s linear;
  }
  .splash-copyright {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 12px;
    opacity: 0.9;
  }

  /* ===== 关机画面 ===== */
  .shutdown-text {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 18px;
    text-shadow: 2px 2px 0 rgba(0,0,0,0.4);
  }
  .shutdown-screen .splash-bar {
    bottom: 60px;
  }

  /* ===== 已关机 ===== */
  .power-off {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .off-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .off-text {
    color: #ffa500;
    font-size: 18px;
    text-align: center;
  }
  .power-btn {
    font-size: 14px;
    padding: 8px 20px;
  }
</style>
