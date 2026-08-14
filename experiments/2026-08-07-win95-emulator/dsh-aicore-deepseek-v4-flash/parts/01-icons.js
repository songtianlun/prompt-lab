/* ============================================================
   W95 ICON LIBRARY - 用内联 SVG 绘制经典 Win95 图标
   ============================================================ */
var T = { approved: 1, error: 2, warn: 3, info: 4 };

function svg(w,h,inner){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 32 32">'+inner+'</svg>');
}
/* 经典显示器+底座图标 (My Computer / MsDos 等) */
function iconMonitor(faceColor, innerColor, hasScreen){
  var crtShadow='<rect x="6" y="6" width="18" height="14" fill="#000" opacity="0.25"/>';
  var crt = '<rect x="5" y="4" width="18" height="14" fill="'+faceColor+'" stroke="#000"/>'+
            '<rect x="7" y="6" width="14" height="10" fill="'+innerColor+'"/>'+
            '<rect x="7" y="6" width="14" height="3" fill="'+faceColor+'" opacity="0.8"/>'+
            '<rect x="12" y="16" width="4" height="7" fill="'+faceColor+'" stroke="#000"/>'+
            '<rect x="8" y="23" width="12" height="2" fill="'+faceColor+'" stroke="#000"/>';
  return svg(32,32,crtShadow+crt);
}
/* 文件夹 */
function iconFolder(big){
  var f='<path d="M4 7 L12 7 L15 10 L28 10 L28 27 L6 27 Z" fill="#C66A1B" stroke="#000"/>'+
        '<path d="M28 27 L6 27 L6 12 L28 12 Z" fill="#F2C15D" stroke="#000"/>'+
        '<path d="M6 12 L28 12 L28 10 L13 10 L11 8 L4 8 L4 10 L6 12 Z" fill="#C66A1B" stroke="#000"/>'+
        '<path d="M5 12 L28 12 L28 13 L5 13 Z" fill="#fff" opacity="0.35"/>';
  return svg(big?32:16,big?32:16,f);
}
/* 回收站 */
function iconBin(isFull){
  var bin='<path d="M12 5 L20 5 L21 8 L28 8 L26 28 L6 28 L4 8 L11 8 Z" fill="'
   +(isFull?'#8B7FE8':'#B7E4F5')+'" stroke="#000"/>'+
   '<path d="M6 28 L5 10 L27 10 L26 28 Z" fill="'+(isFull?'#A79BF0':'#FFFFFF')+'" stroke="#000"/>'+
   '<path d="M11 8 L14 5 L18 5 L21 8 Z" fill="'+(isFull?'#8B7FE8':'#B7E4F5')+'" stroke="#000"/>'+
   '<path d="M5 10 L27 10" stroke="#000"/>'+
   '<path d="M12 5 L14 8 M20 5 L18 8 M16 8 L17 5" stroke="#000" stroke-width="0.8"/>';
  if(isFull){
    bin+='<path d="M20 16 L24 6 L27 18 L22 17 L20 16 Z" fill="#D8D8D8" stroke="#000"/>'+
         '<path d="M17 22 L21 12 L24 24 L19 23 Z" fill="#EFEFEF" stroke="#000" opacity="0.9"/>';
  }
  return svg(32,32,bin);
}
/* 计算器 */
function iconCalc(){
  return svg(32,32,
    '<rect x="5" y="4" width="22" height="24" fill="#C0C0C0" stroke="#000" rx="1"/>'+
    '<rect x="8" y="7" width="16" height="4" fill="#0B7A37" stroke="#000"/>'+
    '<text x="9" y="10.5" font-family="MS Sans Serif" font-size="6" fill="#9CFF9C">o</text>'+
    '<g font-family="MS Sans Serif" font-size="6" fill="#000">'+
    '<text x="9" y="17">7 8 9</text><text x="9" y="23">4 5 6</text>'+
    '<text x="9" y="29">1 2 3</text></g>');
}
/* 记事本 */
function iconNotepad(){
  var sheet='<path d="M8 3 L21 3 L21 28 L8 28 Z" fill="#FFFFFF" stroke="#000"/>'+
    '<path d="M21 3 L25 7 L21 7 Z" fill="#C0C0C0" stroke="#000"/>'+
    '<path d="M21 7 L25 7 L25 9 L21 9 Z" fill="#C0C0C0"/>'+
    '<g stroke="#808080" stroke-width="0.7">'+
    '<path d="M10 10 L19 10 M10 13 L19 13 M10 16 L19 16 M10 19 L19 19 M10 22 L16 22"/>'+
    '</g>'+
    '<rect x="23" y="10" width="4" height="5" fill="#F8B8B0" stroke="#000"/>'+
    '<rect x="23" y="18" width="4" height="7" fill="#B8D8F8" stroke="#000"/>';
  return svg(32,32,sheet);
}
/* 画笔 */
function iconPaint(){
  var pal='<rect x="4" y="16" width="16" height="11" fill="#C0C0C0" stroke="#000" rx="1"/>'+
    '<circle cx="8" cy="20" r="2.4" fill="#E03A3A"/><circle cx="13" cy="20" r="2.4" fill="#3AA03A"/>'+
    '<circle cx="18" cy="20" r="2.4" fill="#3A4AE0"/><circle cx="8" cy="25" r="2.4" fill="#F0E040"/>'+
    '<circle cx="13" cy="25" r="2.4" fill="#A03AE0"/>';
  var brush='<path d="M20 4 L26 10 L14 22 L8 22 Z" fill="#C0C0C0" stroke="#000"/>'+
    '<path d="M6 25 L22 9 L23 10 L7 26 Z" fill="#7A3A0B"/>'+
    '<path d="M20 4 L23 7 L8 22 Z" fill="#6B4A2B"/>';
  return svg(32,32,pal+brush);
}
/* Minesweeper 地雷 */
function iconMine(){
  return svg(32,32,
    '<circle cx="16" cy="15" r="8" fill="#C0C0C0" stroke="#000"/>'+
    '<circle cx="13" cy="12" r="2.4" fill="#E03A3A"/><circle cx="19" cy="12" r="2.4" fill="#E03A3A"/>'+
    '<circle cx="16" cy="18" r="2.4" fill="#3A3A3A"/>'+
    '<g stroke="#000" stroke-width="1.2" stroke-linecap="round">'+
    '<path d="M16 3 L16 7 M16 23 L16 27 M3 15 L7 15 M25 15 L29 15"/>'+
    '</g>');
}
/* 纸牌 */
function iconSolitaire(){
  return svg(32,32,
    '<rect x="6" y="3" width="14" height="19" rx="2" fill="#E03A3A" stroke="#000"/>'+
    '<rect x="14" y="9" width="14" height="19" rx="2" fill="#FFFFFF" stroke="#000"/>'+
    '<text x="17" y="23" font-size="14" fill="#E03A3A">♥</text>');
}
/* 探路者 (资源管理器) */
function iconExplorer(){
  return svg(32,32,
    '<circle cx="15" cy="15" r="7" fill="#F2C15D" stroke="#000"/>'+
    '<path d="M20 20 L29 29" stroke="#7A6A2B" stroke-width="3"/>'+
    '<circle cx="13" cy="13" r="1.6" fill="#C66A1B"/>');
}
/* 地球 (IE) */
function iconIE(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="12" fill="#3A7AE0" stroke="#000"/>'+
    '<g stroke="#2055A0" stroke-width="0.7" fill="none">'+
    '<ellipse cx="16" cy="16" rx="5" ry="12"/><ellipse cx="16" cy="16" rx="12" ry="5"/>'+
    '<path d="M4 16 L28 16 M16 4 L16 28"/>'+
    '<ellipse cx="16" cy="16" rx="8" ry="11"/>'+
    '</g>'+
    '<path d="M9 13 Q16 4 23 13 Z" fill="#7FB8FF" opacity="0.6"/>');
}
/* 我的文档 */
function iconDocs(){
  var sheet='<rect x="7" y="3" width="17" height="25" rx="1.5" fill="#7A5A96" stroke="#000"/>'+
    '<g fill="#fff">'+
    '<text x="10" y="14" font-size="7" font-family="MS Sans Serif">F</text>'+
    '<text x="17" y="14" font-size="7" font-family="MS Sans Serif">.</text>'+
    '<text x="20" y="14" font-size="7" font-family="MS Sans Serif">X</text>'+
    '<text x="10" y="21" font-size="7" font-family="MS Sans Serif">W</text>'+
    '<text x="17" y="21" font-size="7" font-family="MS Sans Serif">9</text>'+
    '<text x="20" y="21" font-size="7" font-family="MS Sans Serif">9</text>'+
    '</g>'+
    '<rect x="10" y="6" width="11" height="2" fill="#fff" opacity="0.6"/>';
  return svg(32,32,sheet);
}
/* 网上邻居 */
function iconNet(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="12" fill="#3A7AE0" stroke="#000"/>'+
    '<ellipse cx="16" cy="16" rx="12" ry="5" fill="none" stroke="#9FC8FF" stroke-width="1"/>'+
    '<g stroke="#2055A0" stroke-width="0.8" fill="none">'+
    '<ellipse cx="16" cy="16" rx="5" ry="12" transform="rotate(15 16 16)"/>'+
    '</g>'+
    '<path d="M12 12 L20 12 L20 20 L12 20 Z" fill="#8Fc8A0"/>');
}
/* 控制面板 */
function iconControl(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="11" fill="#C0C0C0" stroke="#000"/>'+
    '<g stroke="#000" stroke-width="1.4">'+
    '<path d="M16 5 L16 9 M16 23 L16 27 M5 16 L9 16 M23 16 L27 16"/>'+
    '<path d="M7 7 L10 10 M22 22 L25 25"/>'+
    '</g>'+
    '<circle cx="16" cy="16" r="3" fill="#E03A3A"/>');
}
/* 关机的红色圆钮 (power) */
function iconShutdownBig(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="13" fill="#E03A3A" stroke="#7A1010"/>'+
    '<path d="M16 8 L16 15" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>'+
    '<path d="M10.5 11 A 8 8 0 1 0 21.5 11" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>');
}
/* 惊叹号/问号系统图标 */
function iconInfo(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="12" fill="#fff" stroke="#000"/>'+
    '<path d="M6 12 Q16 4 26 12" fill="#F0E040" stroke="#000" stroke-width="0.6"/>'+
    '<path d="M8 6 L24 6 A6 6 0 0 1 24 16 L8 16 A6 6 0 0 1 8 6 Z" fill="#F0E040" stroke="#000" stroke-width="0.6"/>'+
    '<text x="16" y="11" font-size="8" font-weight="bold" text-anchor="middle" fill="#000">i</text>'+
    '<rect x="13" y="19" width="6" height="11" fill="#F0E040" stroke="#000" stroke-width="0.6"/>');
}
/* 问号对话框图标 */
function iconQuestion(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="12" fill="#fff" stroke="#000"/>'+
    '<circle cx="16" cy="16" r="9.5" fill="#fff" stroke="#000" stroke-width="0.4"/>'+
    '<text x="16" y="23" font-size="15" font-weight="bold" text-anchor="middle" fill="#3A6AE0">?</text>');
}
/* 红叉 (错误) */
function iconError(){
  return svg(32,32,
    '<circle cx="16" cy="16" r="12" fill="#E03A3A" stroke="#7A1010"/>'+
    '<circle cx="16" cy="16" r="12" fill="none" stroke="#7A1010" stroke-width="0.4"/>'+
    '<g stroke="#fff" stroke-width="2.6" stroke-linecap="round">'+
    '<path d="M10 10 L22 22 M22 10 L10 22"/></g>');
}
/* 黄色警告三角 */
function iconWarn(){
  return svg(32,32,
    '<path d="M16 4 L30 27 L2 27 Z" fill="#F0E040" stroke="#000"/>'+
    '<rect x="14.5" y="12" width="3" height="8" fill="#000"/>'+
    '<circle cx="16" cy="24" r="1.6" fill="#000"/>');
}
/* 软盘保存 */
function iconFloppy(){
  return svg(32,32,
    '<rect x="5" y="4" width="22" height="24" fill="#C0C0C0" stroke="#000" rx="1"/>'+
    '<rect x="6" y="15" width="14" height="13" fill="#fff" stroke="#000"/>'+
    '<rect x="20" y="5" width="6" height="8" fill="#E0E0E0" stroke="#000"/>'+
    '<rect x="8" y="17" width="10" height="9" fill="#C0C0C0" stroke="#000" stroke-width="0.4"/>'+
    '<path d="M6 15 L8 8 L18 8 L20 15" fill="#D8D8D8" stroke="#000" stroke-width="0.5" opacity="0.5"/>');
}
/* 打开/文件夹 */
var ICON = {
  mycomputer: iconMonitor('#B7E4F5','#87CEEB',true),
  recycle:     iconBin(false),
  deflects:    iconBin(false),
  docs:        iconDocs(),
  net:         iconNet(),
  control:     iconControl(),
  msdos:       iconMonitor('#C0C0C0','#000',true),
  notepad:     iconNotepad(),
  calc:        iconCalc(),
  paint:       iconPaint(),
  mine:        iconMine(),
  solitaire:   iconSolitaire(),
  explorer:    iconExplorer(),
  ie:          iconIE(),
  folder:      iconFolder(true),
  floppy:      iconFloppy(),
  info:        iconInfo(),
  question:    iconQuestion(),
  warn:        iconWarn(),
  error:       iconError(),
  shutdown:    iconShutdownBig()
};
