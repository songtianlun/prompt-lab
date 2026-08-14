/* ============================================================
   W95 APPS - 记事本 / 计算器 / 画图 / 资源管理器 / 我的电脑 / 回收站
   ============================================================ */
"use strict";
/* ---------------- 记事本 ---------------- */
function aboutNotepad(){ msg('关于 记事本','Windows 95 记事本\n版本 4.0 - AI 复刻演示', T.info); }
W95.apps.notepad={
  title:'记事本 - 无标题', icon:'notepad', menu:true, minW:260, minH:160, w:460, h:330,
  menus:[
    {label:'文件(F)', items:[
      {label:'新建(N)', click:function(){}},
      {label:'打开(O)…', click:function(){ findOpener('notepad'); }},
      {sep:true},
      {label:'保存(S)', click:function(){ findOpener('notepad'); }},
      {sep:true},
      {label:'退出(X)', click:function(){ getWin('notepad')&&closeWinById('notepad'); }},
    ]},
    {label:'编辑(E)', items:[
      {label:'撤销(U)', click:function(){}},
      {sep:true},
      {label:'剪切(T)', click:function(){}},
      {label:'复制(C)', click:function(){}},
      {label:'粘贴(P)', click:function(){}},
      {label:'删除(L)', click:function(){}},
      {sep:true},
      {label:'全选(A)', click:function(){}},
    ]},
    {label:'搜索(S)', items:[
      {label:'查找(F)…', click:function(){}},
      {label:'查找下一个(N)', click:function(){}},
    ]},
    {label:'帮助(H)', items:[
      {label:'关于记事本(A)', click:aboutNotepad},
    ]},
  ],
  build:function(win,body){
    var ta=document.createElement('textarea');
    ta.style.width='100%'; ta.style.height='100%';
    ta.style.border='1px solid #808080'; ta.style.padding='4px';
    ta.style.fontFamily="'Fixedsys','Courier New',monospace"; ta.style.fontSize='13px';
    ta.spellcheck=false;
    ta.value='欢迎使用 Windows 95 记事本！\r\n\r\n这是一个模拟的 Windows 95 操作系统。\r\n您可以像真实系统一样打开、关闭窗口，\r\n拖拽、缩放，使用开始菜单等。\r\n\r\n';
    ta.addEventListener('input',function(){ updateTitle(win,'记事本 - 无标题'); });
    body.appendChild(ta);
    // 状态栏
    var sb=document.createElement('div'); sb.className='statusbar';
    sb.innerHTML='<div style="width:60px">第 1 行</div><div style="flex:1"></div>';
    body.parentNode.insertBefore(sb, null);
    win.body.parentNode.style.overflow='hidden';
  }
};
function updateTitle(win,t){ var s=$('.title span',win); if(s) s.textContent=t; }

function getWin(id){ for(var i=0;i<W95.wins.length;i++) if(W95.wins[i].appId===id) return W95.wins[i]; return null; }
function closeWinById(id){ var w=getWin(id); if(w) closeWin(w); }

/* ---------------- 计算器 ---------------- */
W95.apps.calc={
  title:'计算器', icon:'calc', minW:200,minH:200,w:250,h:300, menu:true,
  menus:[
    {label:'编辑(E)', items:[{label:'复制(C)',click:function(){}},{label:'粘贴(P)',click:function(){}}]},
    {label:'查看(V)', items:[{label:'标准型(T)',click:function(){}},{label:'科学型(S)',click:function(){}}]},
    {label:'帮助(H)', items:[{label:'关于计算器(A)',click:function(){msg('关于计算器','Windows 95 计算器',T.info);}}]},
  ],
  build:function(win,body){
    body.style.cssText='display:flex;flex-direction:column;gap:6px;padding:8px;';
    var disp=document.createElement('input'); disp.type='text'; disp.readOnly=true;
    disp.style.cssText='text-align:right;font-size:16px;height:30px;';
    disp.value='0';
    var pad=document.createElement('div');
    pad.style.cssText='display:flex;flex-direction:column;gap:5px;';
    var rows=[['C','CE','←','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['±','0','.','=']];
    var state={acc:0,op:null, fresh:true};
    rows.forEach(function(r){
      var row=document.createElement('div'); row.style.cssText='display:flex;gap:5px;';
      r.forEach(function(k){
        var b=document.createElement('button'); b.className='btn'; b.textContent=k;
        b.style.cssText='flex:1;';
        b.addEventListener('click',function(){ calcKey(k,disp,state); });
        row.appendChild(b);
      });
      pad.appendChild(row);
    });
    body.appendChild(disp); body.appendChild(pad);
    body.style.cursor='default';
  }
};
function calcKey(k,disp,st){
  function set(v){ disp.value=(''+v).slice(0,15); }
  if(/[0-9]/.test(k)){ if(st.fresh){ set(k); st.fresh=false; } else { var cur=disp.value; if(cur==='0'){set(k);} else set(cur+k);} return; }
  if(k==='.'){ if(st.fresh){ set('0.'); st.fresh=false; } else if(disp.value.indexOf('.')<0){ set(disp.value+'.'); } return; }
  if(k==='C'){ st.acc=0; st.op=null; st.fresh=true; set(0); return; }
  if(k==='CE'){ set(0); st.fresh=true; return; }
  if(k==='←'){ var v=disp.value; set(v.length>1?v.slice(0,-1):'0'); return; }
  if(k==='±'){ set(parseFloat(disp.value)*-1); return; }
  if(k==='='){
    if(st.op){ var b=parseFloat(disp.value); var r=calcOp(st.acc,b,st.op); set(r); st.acc=r; st.op=null; st.fresh=true; }
    return;
  }
  // 运算
  if(st.op && !st.fresh){ var b=parseFloat(disp.value); var r=calcOp(st.acc,b,st.op); set(r); st.acc=r; }
  else { st.acc=parseFloat(disp.value); }
  st.op={'÷':'/','×':'*','−':'-','+':'+'}[k];
  st.fresh=true;
}
function calcOp(a,b,o){ try{ var r=eval(a+o+b); if(!isFinite(r)){ return '除以零'; } return r; }catch(e){ return '错误'; } }

/* ---------------- 画图 ---------------- */
W95.apps.paint={
  title:'画图 - 未命名', icon:'paint', menu:true, minW:300,minH:220,w:560,h:400,
  menus:[
    {label:'文件(F)', items:[
      {label:'新建(N)',click:function(){}},
      {label:'保存(S)',click:function(){ findOpener('paint'); }},
      {sep:true},{label:'退出(X)',click:function(){closeWinById('paint');}},
    ]},
    {label:'帮助(H)', items:[{label:'关于画图(A)',click:function(){msg('关于画图','Windows 95 画图',T.info);}}]},
  ],
  build:function(win,body){
    var wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-direction:column;height:100%;';
    var add=document.createElement('canvas');
    add.width=260; add.height=180;
    add.style.cssText='background:#fff;border:1px solid #808080;margin:2px;';
    add.style.cursor='crosshair';
    var ctx=add.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,add.width,add.height);
    var cx=document.createElement('div');
    cx.style.cssText='display:flex;flex-direction:column;gap:4px;padding:4px;border-right:1px solid #808080;';
    var cols=['#000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080FF','#004080','#8000FF','#804000','#00FFFF'];
    cols.forEach(function(c){
      var sw=document.createElement('div');
      sw.style.cssText='width:16px;height:16px;background:'+c+';border:1px solid #fff;outline:1px solid #000;';
      sw.addEventListener('click',function(){ win._color=c; });
      sw.style.cursor='pointer';
      cx.appendChild(sw);
    });
    var toolrow=document.createElement('div');
    toolrow.style.cssText='display:flex;gap:2px;align-items:center;padding:2px;';
    var tools=['✏️','🖌️','🖍️','🧹'];
    tools.forEach(function(t,d){
      var b=document.createElement('button'); b.className='btn'; b.style.cssText='font-size:13px;padding:2px 8px;';
      b.textContent=t;
      b.addEventListener('click',function(){ win._tool=d; });
      toolrow.appendChild(b);
    });
    var drawing=false,last=null;
    add.addEventListener('mousedown',function(e){
      drawing=true; var p=getPos(e); last=p;
      ctx.strokeStyle=win._color||'#000'; ctx.lineWidth=2; ctx.lineCap='round';
      var r=add.getBoundingClientRect();
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+0.1,p.y+0.1); ctx.stroke();
    });
    add.addEventListener('mousemove',function(e){
      if(!drawing) return;
      var p=getPos(e);
      ctx.strokeStyle=win._color||'#000'; ctx.lineWidth=2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
      last=p;
    });
    document.addEventListener('mouseup',function(){ drawing=false; });
    function getPos(e){ var r=add.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
    var area=document.createElement('div');
    area.style.cssText='flex:1;display:flex;align-items:flex-start;padding:4px;overflow:auto;';
    area.appendChild(add);
    wrap.appendChild(toolrow);
    var lower=document.createElement('div');
    lower.style.cssText='display:flex;height:180px;';
    lower.appendChild(cx); lower.appendChild(area);
    wrap.appendChild(lower);
    body.appendChild(wrap);
  }
};
