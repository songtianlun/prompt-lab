<script>
  export let win;
  let text = '欢迎使用 Windows 95 记事本！\n\n这是一个简单的文本编辑器。\n你可以在这里输入任何内容。\n';
  let wordWrap = true;
  let status = '就绪';

  function newFile() {
    text = '';
    status = '新建文件';
  }

  function saveFile() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '未命名.txt';
    a.click();
    URL.revokeObjectURL(url);
    status = '已保存';
  }

  function onInput(e) {
    text = e.target.value;
    status = '已修改';
  }
</script>

<div class="notepad">
  <div class="menu">
    <span class="menu-item" onclick={newFile}>文件</span>
    <span class="menu-item" onclick={saveFile}>保存</span>
    <span class="menu-item" onclick={() => wordWrap = !wordWrap}>自动换行</span>
    <span class="menu-item" onclick={() => status = '帮助：暂无更多帮助'}>帮助</span>
  </div>
  <textarea
    class="editor"
    value={text}
    on:input={onInput}
    spellcheck="false"
    style="white-space:{wordWrap ? 'pre-wrap' : 'pre'};"
  ></textarea>
  <div class="statusbar">
    <span>{status}</span>
    <span class="spacer"></span>
    <span>行 {text.split('\n').length}</span>
  </div>
</div>

<style>
  .notepad {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
  }
  .menu {
    display: flex;
    gap: 2px;
    background: var(--win-face);
    padding: 2px 4px;
    border-bottom: 1px solid var(--win-dark);
  }
  .menu-item {
    padding: 2px 8px;
    cursor: default;
    font-size: 12px;
  }
  .menu-item:hover {
    background: var(--win-navy);
    color: #fff;
  }
  .editor {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 4px;
    background: #fff;
    color: #000;
    user-select: text;
  }
  .statusbar {
    display: flex;
    align-items: center;
    background: var(--win-face);
    border-top: 1px solid var(--win-dark);
    padding: 2px 6px;
    font-size: 12px;
    height: 22px;
  }
  .spacer {
    flex: 1;
  }
</style>
