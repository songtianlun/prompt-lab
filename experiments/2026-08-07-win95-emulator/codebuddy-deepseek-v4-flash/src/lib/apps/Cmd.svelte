<script>
  import { onMount } from 'svelte';

  let history = ['Microsoft Windows 95 [版本 4.00.950]', '(C) Copyright Microsoft Corp 1981-1995.', '', 'C:\\>'];
  let input = '';
  let cwd = 'C:\\';
  let inputEl;

  const commands = {
    dir: () => {
      return [' 卷 C 的卷标是 WIN95', ' 卷序列号为 1234-5678', '', ' C:\\ 的目录', '', 'WINDOWS    <DIR>     95-08-24  9:00', 'PROGRAM FILES <DIR>  95-08-24  9:00', 'MY DOCUMENTS <DIR>   95-08-24  9:00', 'AUTOEXEC BAT        1,024  95-08-24  9:00', 'CONFIG    SYS        1,024  95-08-24  9:00', '              4 个文件', '              3 个目录'];
    },
    help: () => ['可用命令：', '  dir     - 列出目录', '  cls     - 清屏', '  ver     - 显示版本', '  echo    - 显示文本', '  time    - 显示时间', '  date    - 显示日期', '  help    - 显示帮助', '  exit    - 关闭窗口'],
    ver: () => ['Microsoft Windows 95 [版本 4.00.950]'],
    cls: () => { history = []; return []; },
    echo: (args) => [args.join(' ')],
    time: () => [new Date().toLocaleTimeString()],
    date: () => [new Date().toLocaleDateString()],
    exit: () => { import('../windowStore.js').then(m => m.closeWindow(win.id)); return []; }
  };

  export let win;

  function runCommand() {
    const trimmed = input.trim();
    if (trimmed) {
      history.push(`C:\\> ${trimmed}`);
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      if (commands[cmd]) {
        const output = commands[cmd](args);
        history.push(...output);
      } else {
        history.push(`'${cmd}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`);
      }
    }
    history.push('C:\\>');
    input = '';
    setTimeout(() => {
      if (inputEl) inputEl.scrollIntoView({ block: 'end' });
    }, 0);
  }

  function onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand();
    }
  }

  onMount(() => {
    if (inputEl) inputEl.focus();
  });
</script>

<div class="cmd" on:click={() => inputEl && inputEl.focus()}>
  <div class="output">
    {#each history as line}
      <div>{line}</div>
    {/each}
    <div class="input-line">
      <span>C:\></span>
      <input
        bind:this={inputEl}
        bind:value={input}
        on:keydown={onKeydown}
        spellcheck="false"
      />
    </div>
  </div>
</div>

<style>
  .cmd {
    height: 100%;
    background: #000;
    color: #c0c0c0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 6px;
    overflow-y: auto;
    cursor: text;
  }
  .output {
    white-space: pre-wrap;
    line-height: 1.4;
  }
  .input-line {
    display: flex;
  }
  .input-line span {
    color: #c0c0c0;
  }
  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #c0c0c0;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    caret-color: #c0c0c0;
  }
</style>
