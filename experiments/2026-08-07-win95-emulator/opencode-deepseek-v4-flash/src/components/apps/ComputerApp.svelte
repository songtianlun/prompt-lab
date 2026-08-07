<script>
  import FolderIcon from '../icons/Folder.svelte'

  const drives = [
    { name: '本地磁盘 (C:)', icon: FolderIcon },
    { name: '文档', icon: FolderIcon },
    { name: '图片', icon: FolderIcon },
    { name: '下载', icon: FolderIcon },
    { name: '音乐', icon: FolderIcon },
  ]
</script>

<div class="computer">
  <div class="menubar">
    <span>文件</span>
    <span>编辑</span>
    <span>查看</span>
    <span>帮助</span>
  </div>
  <div class="addressbar"><span>地址</span><input value="C:\" readonly /></div>
  <div class="content">
    {#each drives as d (d.name)}
      <div class="drive" title={d.name}>
        <FolderIcon width={32} height={32} />
        <span>{d.name}</span>
      </div>
    {/each}
  </div>
  <div class="statusbar"><span>5 个对象</span></div>
</div>

<style>
  .computer {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--w95-face);
  }
  .menubar {
    display: flex;
    gap: 2px;
    padding: 1px 2px;
  }
  .menubar span {
    padding: 1px 6px;
  }
  .menubar span:hover {
    background: var(--w95-select);
    color: white;
  }
  .addressbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
  }
  .addressbar input {
    flex: 1;
    border: 2px solid;
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
    font-family: inherit;
    font-size: 12px;
    padding: 2px 4px;
    user-select: text;
  }
  .content {
    flex: 1;
    background: white;
    border: 2px solid;
    border-color: var(--w95-dkgray) var(--w95-white) var(--w95-white) var(--w95-dkgray);
    margin: 0 4px 4px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 6px;
    gap: 6px;
    overflow: auto;
  }
  .drive {
    width: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4px;
  }
  .drive:hover {
    background: var(--w95-select);
    color: white;
  }
  .drive span {
    font-size: 11px;
    word-break: break-word;
  }
  .statusbar {
    background: var(--w95-face);
    border-top: 1px solid var(--w95-dkgray);
    padding: 2px 6px;
    font-size: 11px;
  }
</style>
