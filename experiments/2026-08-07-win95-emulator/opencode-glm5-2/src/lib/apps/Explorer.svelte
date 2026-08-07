<script>
  import Icon from '../Icon.svelte'
  import { windows } from '../stores.js'
  export let win

  const tips = [
    { icon: 'explorer', title: '浏览我的电脑', desc: '双击「我的电脑」查看驱动器与文件。', action: () => windows.open('mycomputer') },
    { icon: 'notepad', title: '使用记事本', desc: '随手记下文字，可保存为 txt 文件。', action: () => windows.open('notepad') },
    { icon: 'mine', title: '玩一局扫雷', desc: '经典 Windows 游戏，小心地雷！', action: () => windows.open('minesweeper') },
    { icon: 'info', title: '关于本系统', desc: '查看这台仿真机的版本信息。', action: () => windows.open('about') }
  ]
</script>

<div class="welcome w95-scroll">
  <div class="hero">
    <Icon name="explorer" size={48} />
    <div>
      <h1>欢迎使用 Windows 95</h1>
      <p>一台由 Svelte 复刻的仿真桌面。点击开始菜单或桌面图标开始探索。</p>
    </div>
  </div>
  <div class="grid">
    {#each tips as t}
      <button class="card" on:dblclick={t.action} on:click={t.action}>
        <Icon name={t.icon} size={36} />
        <div>
          <div class="card-title">{t.title}</div>
          <div class="card-desc">{t.desc}</div>
        </div>
      </button>
    {/each}
  </div>
  <p class="hint">提示：拖动窗口标题栏可移动窗口，双击标题栏可最大化。</p>
</div>

<style>
  .welcome { padding: 18px; height: 100%; background: #fff; }
  .hero { display: flex; gap: 14px; align-items: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #c0c0c0; }
  .hero h1 { font-size: 18px; color: #000080; margin-bottom: 4px; }
  .hero p { font-size: 11px; color: #404040; max-width: 360px; }
  .grid { display: flex; flex-direction: column; gap: 10px; }
  .card {
    display: flex; gap: 12px; align-items: center;
    text-align: left;
    background: var(--w95-surface);
    border: none;
    padding: 10px 12px;
    cursor: default;
    box-shadow:
      inset -1px -1px 0 0 var(--w95-button-dark),
      inset  1px  1px 0 0 var(--w95-button-highlight),
      inset -2px -2px 0 0 var(--w95-button-shadow),
      inset  2px  2px 0 0 var(--w95-button-light);
  }
  .card:active { box-shadow: var(--w95-button-dark) inset 1px 1px, var(--w95-button-highlight) inset -1px -1px; }
  .card-title { font-weight: bold; margin-bottom: 3px; }
  .card-desc { font-size: 11px; color: #303030; }
  .hint { margin-top: 18px; font-size: 11px; color: #606060; font-style: italic; }
</style>
