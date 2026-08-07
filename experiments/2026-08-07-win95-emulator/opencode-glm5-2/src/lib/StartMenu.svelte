<script>
  import Icon from './Icon.svelte'
  import { windows, startMenuOpen } from './stores.js'
  import { fade } from 'svelte/transition'

  let showPrograms = false
  let showShutdown = false

  const items = [
    { icon: 'programs', label: '程序(P)', submenu: true, sep: false },
    { icon: 'documents', label: '文档(D)', action: () => windows.open('explorer') },
    { icon: 'settings', label: '设置(S)', action: () => windows.open('mycomputer') },
    { icon: 'find', label: '查找(F)', action: () => windows.open('explorer', { title: '查找' }) },
    { icon: 'help', label: '帮助(H)', action: () => windows.open('about') },
    { icon: 'run', label: '运行(R)...', sepBefore: true, action: () => windows.open('notepad') }
  ]

  const programs = [
    { icon: 'notepad', label: '记事本', action: () => windows.open('notepad') },
    { icon: 'mine', label: '扫雷', action: () => windows.open('minesweeper') },
    { icon: 'msdos', label: 'MS-DOS 方式', action: () => windows.open('notepad') },
    { icon: 'explorer', label: 'Internet Explorer', action: () => windows.open('explorer') },
    { icon: 'computer', label: 'Windows 资源管理器', action: () => windows.open('mycomputer') }
  ]

  function run(item) {
    if (item.submenu) return
    item.action?.()
    close()
  }
  function close() {
    startMenuOpen.set(false)
    showPrograms = false
  }
  function shutdownConfirm() {
    showShutdown = false
    startMenuOpen.set(false)
    document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:14px;flex-direction:column;gap:16px;"><div>现在可以安全地关闭计算机了。</div><button onclick="location.reload()" style="padding:6px 16px;">重新启动</button></div>'
  }
</script>

{#if $startMenuOpen}
  <div class="start-overlay" on:pointerdown={close}>
    <div class="start-menu w95-raised" on:pointerdown|stopPropagation transition:fade={{ duration: 80 }}>
      <div class="banner">
        <span class="b1">Windows</span><span class="b2">95</span>
      </div>
      <div class="menu">
        {#each items as item}
          {#if item.sepBefore}<div class="sep"></div>{/if}
          <div
            class="menu-item"
            on:pointerenter={() => (showPrograms = item.submenu)}
            on:pointerdown={() => run(item)}
          >
            <Icon name={item.icon} size={24} />
            <span class="mi-label">{item.label}</span>
            {#if item.submenu}<span class="arrow">▶</span>{/if}
          </div>
        {/each}
        <div class="sep"></div>
        <div class="menu-item" on:pointerdown={() => (showShutdown = true)}>
          <Icon name="shutdown" size={24} />
          <span class="mi-label">关闭系统(U)...</span>
        </div>

        {#if showPrograms}
          <div class="submenu w95-raised" on:pointerdown|stopPropagation>
            {#each programs as p}
              <div class="menu-item" on:pointerdown={() => run(p)}>
                <Icon name={p.icon} size={24} />
                <span class="mi-label">{p.label}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if showShutdown}
    <div class="shutdown-overlay" on:pointerdown|stopPropagation>
      <div class="shutdown-dialog w95-raised">
        <div class="sd-title">
          <Icon name="shutdown" size={16} />
          <span>关闭 Windows</span>
        </div>
        <div class="sd-body">
          <Icon name="info" size={40} />
          <div class="sd-text">
            <p>您希望计算机做什么？</p>
            <label><input type="radio" name="sd" checked /> 关闭计算机(S)</label>
            <label><input type="radio" name="sd" /> 重新启动(R)</label>
          </div>
        </div>
        <div class="sd-btns">
          <button class="w95-btn" on:click={shutdownConfirm}>是(Y)</button>
          <button class="w95-btn" on:click={() => (showShutdown = false)}>否(N)</button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .start-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
  }
  .start-menu {
    position: absolute;
    left: 2px;
    bottom: 28px;
    display: flex;
    background: var(--w95-surface);
    padding: 2px;
  }
  .banner {
    width: 24px;
    background: linear-gradient(180deg, #000080, #1084d0);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 2px;
    gap: 2px;
  }
  .b1 {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 1px;
  }
  .b2 {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: bold;
    font-size: 18px;
    color: #c0c0c0;
  }
  .menu {
    position: relative;
    min-width: 180px;
    padding: 2px;
  }
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 20px 4px 4px;
    cursor: default;
    position: relative;
  }
  .menu-item:hover { background: var(--w95-selected); color: #fff; }
  .mi-label { font-size: 11px; }
  .arrow { margin-left: auto; font-size: 8px; }
  .sep { height: 2px; margin: 3px 4px; background: #808080; box-shadow: 0 1px 0 #fff; }

  .submenu {
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 200px;
    background: var(--w95-surface);
    padding: 2px;
  }

  .shutdown-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .shutdown-dialog {
    width: 320px;
    background: var(--w95-surface);
    padding: 2px;
  }
  .sd-title {
    background: linear-gradient(90deg, #000080, #1084d0);
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 6px;
    font-weight: bold;
  }
  .sd-body {
    display: flex;
    gap: 14px;
    padding: 16px;
    align-items: center;
  }
  .sd-text { display: flex; flex-direction: column; gap: 6px; font-size: 11px; }
  .sd-text p { margin-bottom: 4px; }
  .sd-text label { display: flex; align-items: center; gap: 4px; }
  .sd-btns { display: flex; justify-content: center; gap: 8px; padding: 0 12px 12px; }
</style>
