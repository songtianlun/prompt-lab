<script>
  import { openWindow } from '../windowStore.js';

  // 模拟文件系统
  const fileSystem = {
    '我的电脑': {
      type: 'folder',
      children: {
        'C盘': { type: 'folder', children: {
          'Windows': { type: 'folder', children: {
            'System': { type: 'folder', children: {} },
            'Notepad.exe': { type: 'app', appId: 'notepad', name: '记事本' },
            'Mspaint.exe': { type: 'app', appId: 'paint', name: '画图' },
            'Calc.exe': { type: 'app', appId: 'calculator', name: '计算器' },
            'Winmine.exe': { type: 'app', appId: 'minesweeper', name: '扫雷' }
          }},
          'Program Files': { type: 'folder', children: {
            'Internet Explorer': { type: 'folder', children: {} },
            'Accessories': { type: 'folder', children: {} }
          }},
          'My Documents': { type: 'folder', children: {
            'readme.txt': { type: 'file', size: '1 KB' },
            'notes.txt': { type: 'file', size: '2 KB' }
          }},
          'Autoexec.bat': { type: 'file', size: '1 KB' },
          'Config.sys': { type: 'file', size: '1 KB' }
        }},
        'D盘': { type: 'folder', children: {
          'Backup': { type: 'folder', children: {} },
          'Games': { type: 'folder', children: {
            'Solitaire.exe': { type: 'app', appId: 'solitaire', name: '纸牌' }
          }}
        }},
        '控制面板': { type: 'folder', children: {
          '显示': { type: 'app', appId: 'display', name: '显示属性' },
          '声音': { type: 'app', appId: 'sound', name: '声音' },
          '系统': { type: 'app', appId: 'system', name: '系统属性' }
        }}
      }
    }
  };

  let currentPath = ['我的电脑'];
  let selected = null;

  function getNode(path) {
    let node = fileSystem;
    for (const p of path) {
      node = node[p].children;
    }
    return node;
  }

  $: currentNode = getNode(currentPath);
  $: entries = Object.entries(currentNode);

  function openEntry(name, node) {
    if (node.type === 'folder') {
      currentPath = [...currentPath, name];
      selected = null;
    } else if (node.type === 'app') {
      const sizes = {
        notepad: { width: 480, height: 360 },
        paint: { width: 640, height: 480 },
        calculator: { width: 280, height: 360 },
        minesweeper: { width: 300, height: 400 },
        solitaire: { width: 640, height: 480 },
        display: { width: 480, height: 420 },
        sound: { width: 420, height: 360 },
        system: { width: 480, height: 420 }
      };
      openWindow(node.appId, { title: node.name, ...(sizes[node.appId] || {}) });
    }
  }

  function goUp() {
    if (currentPath.length > 1) {
      currentPath = currentPath.slice(0, -1);
    }
  }

  function goHome() {
    currentPath = ['我的电脑'];
  }

  function iconFor(name, node) {
    if (node.type === 'folder') return '📁';
    if (node.type === 'app') return '⚙️';
    if (name.endsWith('.txt')) return '📄';
    if (name.endsWith('.bat') || name.endsWith('.sys')) return '⚙️';
    return '📄';
  }
</script>

<div class="explorer">
  <div class="toolbar">
    <button class="tb-btn" onclick={goHome} title="上一级">🏠</button>
    <button class="tb-btn" onclick={goUp} title="向上">⬆️</button>
    <span class="path">{currentPath.join(' \\ ')}</span>
  </div>
  <div class="body">
    <div class="tree">
      <div class="tree-item" class:active={currentPath.length === 1} onclick={goHome}>🖥️ 我的电脑</div>
      <div class="tree-item" onclick={() => currentPath = ['我的电脑', 'C盘']}>📁 C盘</div>
      <div class="tree-item" onclick={() => currentPath = ['我的电脑', 'D盘']}>📁 D盘</div>
      <div class="tree-item" onclick={() => currentPath = ['我的电脑', '控制面板']}>⚙️ 控制面板</div>
    </div>
    <div class="content">
      {#each entries as [name, node]}
        <div
          class="file-item"
          class:selected={selected === name}
          onclick={() => selected = name}
          ondblclick={() => openEntry(name, node)}
        >
          <span class="file-icon">{iconFor(name, node)}</span>
          <span class="file-name">{name}</span>
        </div>
      {/each}
    </div>
  </div>
  <div class="statusbar">
    <span>{entries.length} 个对象</span>
  </div>
</div>

<style>
  .explorer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--win-face);
  }
  .toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px;
    border-bottom: 1px solid var(--win-dark);
  }
  .tb-btn {
    width: 26px;
    height: 24px;
    background: var(--win-face);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-dark);
    border-bottom: 2px solid var(--win-dark);
    cursor: pointer;
    font-size: 13px;
  }
  .path {
    flex: 1;
    background: #fff;
    border: 1px solid var(--win-dark);
    padding: 3px 6px;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .tree {
    width: 160px;
    border-right: 1px solid var(--win-dark);
    padding: 4px;
    overflow-y: auto;
    background: #fff;
  }
  .tree-item {
    padding: 3px 6px;
    cursor: default;
    font-size: 12px;
  }
  .tree-item:hover, .tree-item.active {
    background: var(--win-navy);
    color: #fff;
  }
  .content {
    flex: 1;
    padding: 4px;
    overflow-y: auto;
    background: #fff;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 2px;
  }
  .file-item {
    width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 6px 2px;
    cursor: default;
    border: 1px solid transparent;
  }
  .file-item.selected {
    background: var(--win-navy);
    color: #fff;
    border: 1px dotted #fff;
  }
  .file-icon {
    font-size: 28px;
  }
  .file-name {
    font-size: 11px;
    text-align: center;
    word-break: break-all;
    line-height: 1.2;
  }
  .statusbar {
    border-top: 1px solid var(--win-dark);
    padding: 2px 6px;
    font-size: 12px;
    height: 22px;
  }
</style>
