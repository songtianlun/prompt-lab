<script>
  import Icon from '../Icon.svelte'
  import { windows } from '../stores.js'
  export let win

  const drives = [
    { icon: 'floppy', label: '3½ 软盘 (A:)' },
    { icon: 'drive-c', label: '硬盘 (C:)' },
    { icon: 'cd', label: 'CD-ROM (D:)' },
    { icon: 'control', label: '控制面板' },
    { icon: 'defrag', label: '磁盘碎片整理' }
  ]

  let selected = -1
  function openDrive(d) {
    windows.open('explorer', { title: d.label })
  }
</script>

<div class="mc">
  <div class="menubar">
    {#each ['文件(F)', '编辑(E)', '查看(V)', '帮助(H)'] as m}<span class="m">{m}</span>{/each}
  </div>
  <div class="toolbar w95-sunken">
    <span class="addr-label">地址</span>
    <div class="addr w95-sunken"><Icon name="computer" size={16} /> <span>我的电脑</span></div>
  </div>
  <div class="files w95-sunken">
    {#each drives as d, i}
      <button
        class="file"
        class:sel={selected === i}
        on:dblclick={() => openDrive(d)}
        on:click={() => selected = i}
      >
        <Icon name={d.icon} size={32} />
        <span>{d.label}</span>
      </button>
    {/each}
  </div>
  <div class="statusbar w95-statusbar">
    <div>{drives.length} 个对象</div>
    <div>磁盘可用空间: 12,288 KB</div>
  </div>
</div>

<style>
  .mc { display: flex; flex-direction: column; height: 100%; gap: 2px; }
  .menubar { display: flex; gap: 2px; padding: 1px 2px; }
  .m { padding: 1px 6px; cursor: default; }
  .m:hover { background: var(--w95-selected); color: #fff; }
  .toolbar { display: flex; align-items: center; gap: 6px; padding: 4px; margin: 2px 0; background: var(--w95-surface); }
  .addr-label { font-size: 11px; }
  .addr { display: flex; align-items: center; gap: 6px; flex: 1; background: #fff; padding: 2px 6px; font-size: 11px; }
  .files {
    flex: 1;
    background: #fff;
    padding: 12px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 16px 8px;
    overflow: auto;
  }
  .file {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 84px;
    gap: 4px;
    background: transparent;
    border: 1px dotted transparent;
    padding: 4px 2px;
    cursor: default;
    text-align: center;
  }
  .file span { font-size: 11px; word-break: break-all; }
  .file.sel { background: var(--w95-selected); color: #fff; border: 1px dotted #fff; }
  .file.sel :global(svg) { filter: none; }
  .statusbar { margin-top: 2px; }
</style>
