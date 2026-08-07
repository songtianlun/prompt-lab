<script>
  let props = $props()
  const defaultText = `这是记事本示例。

欢迎使用 Win95 仿真系统！
- 支持双击桌面图标打开程序
- 窗口可以拖动、调整大小、最大化、最小化
- 试试扫雷游戏吧

可以在这里随意输入文字。`
  let text = $state(defaultText)
  let saved = $state(false)

  function save() {
    saved = true
    setTimeout(() => (saved = false), 1500)
  }
</script>

<div class="notepad">
  <div class="menubar">
    <span class="active" onclick={() => save()}>文件</span>
    <span>编辑</span>
    <span>搜索</span>
    <span>帮助</span>
  </div>
  <textarea bind:value={text} spellcheck="false"></textarea>
  <div class="status">
    <span>行 1</span>
    <span>{text.length} 字符</span>
    {#if saved}<span style="color:#008000">已保存</span>{/if}
  </div>
</div>

<style>
  .notepad {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
  }
  .menubar {
    display: flex;
    gap: 2px;
    background: var(--w95-face);
    padding: 1px 2px;
    border-bottom: 1px solid var(--w95-dkgray);
  }
  .menubar span {
    padding: 1px 6px;
    cursor: default;
  }
  .menubar span:hover {
    background: var(--w95-select);
    color: white;
  }
  textarea {
    flex: 1;
    border: 2px solid;
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
    background: white;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 4px;
    resize: none;
    user-select: text;
    outline: none;
  }
  .status {
    display: flex;
    gap: 16px;
    background: var(--w95-face);
    border-top: 1px solid var(--w95-dkgray);
    padding: 2px 6px;
    font-size: 11px;
  }
</style>
