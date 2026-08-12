<script>
  let topic = 'welcome';

  const topics = {
    welcome: {
      title: '欢迎使用 Windows 95 模拟器',
      content: '这是一个用 Svelte 构建的 Windows 95 桌面环境模拟器。\n\n点击"开始"按钮可以打开开始菜单，启动各种应用程序。\n双击桌面图标也可以启动程序。'
    },
    windows: {
      title: '窗口操作',
      content: '• 拖动标题栏可以移动窗口\n• 双击标题栏可以最大化/还原\n• 点击右上角按钮可以最小化、最大化、关闭\n• 拖动窗口右下角可以调整大小'
    },
    apps: {
      title: '应用程序',
      content: '• 记事本：简单的文本编辑器\n• 画图：支持铅笔、画笔、橡皮、填充工具\n• 计算器：标准计算器\n• 扫雷：经典扫雷游戏\n• 纸牌：经典纸牌游戏\n• 资源管理器：浏览模拟文件系统'
    },
    settings: {
      title: '设置',
      content: '• 显示属性：更改桌面背景颜色和分辨率\n• 声音：调整系统音量，测试音效\n• 系统属性：查看系统信息，修改计算机名'
    }
  };
</script>

<div class="help">
  <div class="sidebar">
    {#each Object.keys(topics) as key}
      <div class="topic" class:active={topic === key} onclick={() => topic = key}>
        {topics[key].title}
      </div>
    {/each}
  </div>
  <div class="content">
    <div class="title">{topics[topic].title}</div>
    <pre class="body">{topics[topic].content}</pre>
  </div>
</div>

<style>
  .help {
    display: flex;
    height: 100%;
    background: var(--win-face);
  }
  .sidebar {
    width: 160px;
    border-right: 1px solid var(--win-dark);
    padding: 4px;
    overflow-y: auto;
    background: #fff;
  }
  .topic {
    padding: 4px 8px;
    font-size: 12px;
    cursor: default;
  }
  .topic:hover, .topic.active {
    background: var(--win-navy);
    color: #fff;
  }
  .content {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }
  .title {
    font-size: 16px;
    font-weight: bold;
    color: var(--win-navy);
    margin-bottom: 12px;
  }
  .body {
    font-family: var(--win-font);
    font-size: 12px;
    line-height: 1.8;
    white-space: pre-wrap;
  }
</style>
