<script>
  import { powerState } from '../lib/stores.js'
  import { onMount } from 'svelte'

  let progress = 0
  let done = false

  onMount(() => {
    // Simulate boot progress bar
    const interval = setInterval(() => {
      progress += 2
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => {
          powerState.set('on')
        }, 600)
      }
    }, 50)
    return () => clearInterval(interval)
  })
</script>

<div class="boot-screen">
  <!-- Clouds background -->
  <div class="clouds-bg"></div>

  <!-- Center logo -->
  <div class="logo-area">
    <div class="logo-block">
      <div class="logo-flag">
        <div class="flag-red"></div>
        <div class="flag-green"></div>
        <div class="flag-blue"></div>
        <div class="flag-yellow"></div>
      </div>
      <div class="logo-text">
        <span class="logo-windows">Microsoft</span>
        <span class="logo-win95">Windows<span class="logo-95">95</span></span>
      </div>
    </div>
  </div>

  <!-- Bottom progress bar -->
  <div class="progress-area">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
  </div>
</div>

<style>
  .boot-screen {
    position: absolute;
    inset: 0;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    animation: fade-in 0.4s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ===== Clouds background ===== */
  .clouds-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 20% 30%, rgba(255, 255, 255, 0.5), transparent),
      radial-gradient(ellipse 50% 35% at 70% 25%, rgba(255, 255, 255, 0.4), transparent),
      radial-gradient(ellipse 55% 45% at 50% 70%, rgba(255, 255, 255, 0.35), transparent),
      radial-gradient(ellipse 40% 30% at 85% 65%, rgba(255, 255, 255, 0.3), transparent),
      linear-gradient(180deg, #5a8fd8 0%, #8fb8e8 40%, #c5ddf5 100%);
  }

  /* ===== Logo ===== */
  .logo-area {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 60px;
  }

  .logo-block {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.85);
    padding: 24px 36px;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  /* 4-color flag */
  .logo-flag {
    width: 56px;
    height: 56px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    transform: perspective(100px) rotateY(-8deg);
  }

  .flag-red {
    background: #e74c3c;
    border-radius: 2px 0 0 0;
  }
  .flag-green {
    background: #2ecc71;
    border-radius: 0 2px 0 0;
  }
  .flag-blue {
    background: #3498db;
    border-radius: 0 0 0 2px;
  }
  .flag-yellow {
    background: #f1c40f;
    border-radius: 0 0 2px 0;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .logo-windows {
    font-size: 16px;
    font-weight: normal;
    color: #333;
    font-family: var(--font-ui);
    margin-bottom: 4px;
  }

  .logo-win95 {
    font-size: 36px;
    font-weight: bold;
    font-style: italic;
    color: #000080;
    font-family: var(--font-ui);
    line-height: 1;
  }

  .logo-95 {
    font-size: 42px;
    color: #d04040;
  }

  /* ===== Progress bar ===== */
  .progress-area {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    width: 200px;
  }

  .progress-bar {
    width: 100%;
    height: 16px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.5);
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #000080, #1084d0);
    transition: width 0.05s linear;
  }
</style>
