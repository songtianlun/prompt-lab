/* ============================================================
   W95 CORE - 窗口管理 / 任务栏 / 开始菜单 / 消息框 / 图标/开机
   ============================================================ */
"use strict";
var $ = function(s, c){ return (c||document).querySelector(s); };
var $$ = function(s, c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };
function el(id){ return document.getElementById(id); }

/* ------------- 全局状态 ------------- */
var W95 = {
  z: 100,
  wins: [],          // 打开的窗口 {el, app, id, ...}
  focused: null,
  apps: {},          // 已注册应用构造器
  startOpen: false,
  clockTimer: null,
  booted: false,
  shutdownType: null
};

/* ------------- 声音 (WebAudio 合成 95 风格提示音) ------------- */
var AudioSys = (function(){
  var ctx=null, enabled=true;
  function ac(){
    if(!ctx){ try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
    return ctx;
  }
  function tone(freq,dur,vol,type,when){
    var c=ac(); if(!c||!enabled) return;
    var t=(when||0); var o=c.createOscillator(), g=c.createGain();
    o.type=type||'square'; o.frequency.value=freq;
    g.gain.setValueAtTime(vol||0.08,c.currentTime+t);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime+t); o.stop(c.currentTime+t+dur+0.02);
  }
  return {
    on:function(){ enabled=true; ac(); },
    off:function(){ enabled=false; },
    isOn:function(){ return enabled; },
    start:function(){ tone(392,0.12,0.09,'triangle'); tone(659,0.18,0.08,'triangle',0.12); },
    shutdown:function(){ tone(659,0.12,0.08,'triangle'); tone(392,0.2,0.07,'triangle',0.12); },
    ding:function(){ tone(880,0.5,0.06,'sine'); tone(660,0.5,0.05,'sine',0.05); },
    notify:function(){ tone(1200,0.09,0.06,'square'); tone(900,0.09,0.06,'square',0.1); },
    err:function(){ tone(240,0.35,0.09,'sawtooth'); }
  };
})();

/* ------------- 定时器 / 帮助的图标显示 ------------- */
function iconTag(k){ return '<img class="ic" style="width:16px;height:16px" src="'+ICON[k]+'">'; }

/* ------------- 时间 ------------- */
function pad(n){ return (n<10?'0':'')+n; }
function tickClock(){
  var d=new Date();
  $('#clock').textContent = pad(d.getHours())+':'+pad(d.getMinutes())+' '+pad(d.getDate())+'日';
  $('#clock').setAttribute('title', d.toLocaleString());
}

/* ------------- 打开窗口 ------------- */
/* app 传入 {title, icon, menu[bool], build(win, body), init(win), status, onResize, minW, minH, w, h} */
function openApp(appId, opts){
  opts = opts||{};
  var app = W95.apps[appId];
  if(!app){ err('程序未找到: '+appId); return; }
  var w = document.createElement('div');
  w.className='window';
  w.id='win-'+appId;
  var title = opts.title || app.title || appId;
  var icon = (opts.icon||app.icon||'mycomputer');

  w.innerHTML =
    '<div class="wtitlebar">'+
      '<div class="title"><img class="tic" src="'+ICON[icon]+'"><span>'+title+'</span></div>'+
      '<button class="wtbtn" data-act="min">─</button>'+
      '<button class="wtbtn" data-act="max">▢</button>'+
      '<button class="wtbtn" data-act="close">✕</button>'+
    '</div>'+
    (app.menu?'<div class="wmenu"></div>':'')+
    '<div class="wbody"></div>'+
    '<div class="resizer"></div>';

  w.header=$('.wtitlebar',w);
  w.menuEl=app.menu?$('.wmenu',w):null;
  w.body=$('.wbody',w);

  w.style.zIndex=++W95.z;
  var vw=document.body.clientWidth-40, vh=document.body.clientHeight-70;
  var iw=Math.min(opts.w||app.w||480, vw), ih=Math.min(opts.h||app.h||360, vh);
  var ix=opts.x!=null?opts.x:(vw-iw)/2 + (W95.wins.length*20 % 60);
  var iy=opts.y!=null?opts.y:(vh-ih)/2 - 20 + (W95.wins.length*14 % 50);
  w.style.left=Math.max(2,ix)+'px'; w.style.top=Math.max(2,iy)+'px';
  w.style.width=iw+'px'; w.style.height=ih+'px';
  w.app=app; w.appId=appId;

  // 窗口菜单栏
  if(app.menu){
    (app.menus||[]).forEach(function(m){
      var s=document.createElement('span'); s.textContent=m.label;
      s.addEventListener('click',function(e){
        e.stopPropagation();
        var mm=m.items||[];
        showAppMenu(s, mm, w);
      });
      w.menuEl.appendChild(s);
    });
  }

  // 事件
  w.addEventListener('mousedown', function(){ focusWin(w); });
  // 标题栏拖动
  w.header.addEventListener('mousedown', function(e){
    if(e.target.closest('.wtbtn')) return;
    if(w.classList.contains('maximized')) return;
    startDrag(e,w,'move');
  });
  // 按钮
  $$('.wtbtn',w).forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var a=b.getAttribute('data-act');
      if(a==='close') closeWin(w);
      else if(a==='min') minimizeWin(w);
      else if(a==='max') { w.dragged&&0; toggleMax(w); }
    });
  });
  // 双击标题栏最大化
  w.header.addEventListener('dblclick',function(e){ if(!e.target.closest('.wtbtn')) toggleMax(w); });
  // 缩放
  var rz=$('.resizer',w);
  rz.addEventListener('mousedown',function(e){ e.stopPropagation(); startDrag(e,w,'resize'); });

  // 构建内容
  if(app.build) app.build(w, w.body);
  $('#desktop').appendChild(w);

  W95.wins.push(w);
  buildTaskbar();
  focusWin(w);
  if(app.init) app.init(w);
  return w;
}
function focusWin(w){
  W95.wins.forEach(function(x){ x.classList.add('inactive'); });
  w.classList.remove('inactive');
  w.style.zIndex=++W95.z;
  W95.focused=w;
  buildTaskbar();
}
function closeWin(w){
  var i=W95.wins.indexOf(w);
  if(i>=0) W95.wins.splice(i,1);
  if(w.app&&w.app.close) w.app.close(w);
  w.remove();
  if(W95.wins.length) focusWin(W95.wins[W95.wins.length-1]);
  buildTaskbar();
}
function minimizeWin(w){
  w.dataset.min='1';
  w.classList.add('minimized');
  w.style.display='none';
  buildTaskbar();
}
function restoreWin(w){
  delete w.dataset.min;
  w.classList.remove('minimized');
  w.style.display='';
  focusWin(w);
}
function toggleMax(w){ w.classList.toggle('maximized'); buildTaskbar(); }

/* 拖动/缩放 */
function startDrag(e,w,mode){
  e.preventDefault();
  var startX=e.clientX, startY=e.clientY;
  var oL=parseInt(w.style.left), oT=parseInt(w.style.top);
  var oW=w.offsetWidth, oH=w.offsetHeight;
  focusWin(w);
  var move=function(ev){
    var dx=ev.clientX-startX, dy=ev.clientY-startY;
    if(mode==='move'){
      w.style.left=(oL+dx)+'px'; w.style.top=(oT+dy)+'px';
    }else{
      w.style.width=Math.max(w.app.minW||180,oW+dx)+'px';
      w.style.height=Math.max(w.app.minH||120,oH+dy)+'px';
      if(w.app.onResize) w.app.onResize(w);
    }
  };
  var up=function(){ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',up);
}

/* ------------- 任务栏 ------------- */
function buildTaskbar(){
  var tb=$('#taskButtons'); tb.innerHTML='';
  W95.wins.forEach(function(w){
    var b=document.createElement('div');
    b.className='taskbtn';
    if(!w.dataset.min) b.classList.add('active');
    var app=w.app;
    b.innerHTML='<img class="tic" src="'+ICON[app.icon||'mycomputer']+'"><span>'+($('.title span',w).textContent)+'</span>';
    b.addEventListener('click',function(){
      if(w.dataset.min) restoreWin(w);
      else minimizeWin(w);
    });
    tb.appendChild(b);
  });
}

/* ------------- 菜单系统 (HTML 冒泡) ------------- */
var M = { el:null, parent:null, ownerWin:null };
document.addEventListener('mousedown',function(e){
  closeAllMenus();
  if(!e.target.closest('#startBtn')) closeStartMenu();
});
function closeAllMenus(){ $$('.submenu').forEach(function(m){ m.remove(); }); M.el=null; }
var popupStack=[];
function showAppMenu(anchor, items, win){
  closeAllMenus(); popupStack=[];
  M.ownerWin=win;
  var holder=win?win._menuLayer||win : document.body;
  openPop(items, anchor.getBoundingClientRect().left, anchor.getBoundingClientRect().bottom, holder, win);
}
function openPop(items, x, y, holder, win){
  var m=document.createElement('div');
  m.className='submenu';
  buildMenuItems(m, items, win);
  (win&&win._menuLayer?win._menuLayer:document.body).appendChild(m);
  m.style.left=x+'px'; m.style.top=y+'px';
  // 保持屏幕内
  var rect=m.getBoundingClientRect();
  if(rect.right>window.innerWidth) m.style.left=(window.innerWidth-rect.width)+'px';
  if(rect.bottom>window.innerHeight) m.style.top=(window.innerHeight-rect.height)+'px';
  m.classList.add('open');
  popupStack.push(m);
  return m;
}
function buildMenuItems(m, items, win){
  items.forEach(function(it){
    if(it.sep){ var s=document.createElement('div'); s.className='sm-sep'; m.appendChild(s); return; }
    var d=document.createElement('div');
    d.className='sm-item';
    d.innerHTML=(it.icon?('<img class="ic" src="'+ICON[it.icon]+'">'):'<span class="ic" style="width:26px"></span>')+
      '<span>'+(it.label||'')+'</span>'+((it.sub)?'<span class="arrow" style="margin-left:auto">▶</span>':'');
    d.addEventListener('mouseenter',function(){ $$('.sm-item',m).forEach(function(x){x.classList.remove('open');}); this.classList.add('open'); });
    if(it.sub){
      d.addEventListener('mouseenter',function(){
        closePopupsBelow(d);
        var r=d.getBoundingClientRect();
        var sub=openPop(it.sub, r.right-2, r.top-2, m.parentNode===document.body?null:null, win);
      });
      d.addEventListener('click',function(e){ e.stopPropagation(); });
    }else if(it.click){
      d.addEventListener('click',function(e){ e.stopPropagation(); closeAllMenus(); it.click(); });
    }
    m.appendChild(d);
  });
}
function closePopupsBelow(anchor){
  // 简化：关闭所有已开子菜单
  popupStack.slice(1).forEach(function(p){ p.remove(); });
  popupStack=[popupStack[0]];
}

/* ------------- 开始菜单 ------------- */
function buildStartMenu(){
  var sm=$('#smBody'); sm.innerHTML='';
  function item(label, icon, fn, sub){
    return {label:label, icon:icon, click:fn, sub:sub};
  }
  var prog=[
    item('记事本','notepad',function(){openApp('notepad');}),
    item('画图','paint',function(){openApp('paint');}),
    item('计算器','calc',function(){openApp('calc');}),
    item('扫雷','mine',function(){openApp('mine');}),
    item('纸牌','solitaire',function(){openApp('solitaire');}),
    {sep:true},
    item('MS-DOS 方式','msdos',function(){openApp('msdos');}),
    item('Windows 资源管理器','explorer',function(){openApp('explorer');}),
  ];
  var acc=[
    item('记事本','notepad',function(){openApp('notepad');}),
    item('画图','paint',function(){openApp('paint');}),
    item('计算器','calc',function(){openApp('calc');}),
    {sep:true},
    item('MS-DOS 方式','msdos',function(){openApp('msdos');}),
  ];
  var games=[
    item('扫雷','mine',function(){openApp('mine');}),
    item('纸牌','solitaire',function(){openApp('solitaire');}),
  ];
  var menu=[
    item('程序','folder',null,[
      item('附件','folder',null,acc),
      item('游戏','folder',null,games),
      item('启动','folder',null,[]),
      {sep:true},
      item('MS-DOS 方式','msdos',function(){openApp('msdos');}),
      item('Windows 资源管理器','explorer',function(){openApp('explorer');}),
    ]),
    item('文档','docs',function(){msg('我的文档','还没有最近的文档。',T.info);}),
    item('设置','control',null,[
      item('控制面板','control',function(){openApp('control');}),
      item('打印机','deflects',function(){msg('打印机','未安装打印机。',T.info);}),
      {sep:true},
      item('任务栏…','control',function(){openApp('taskbarSettings');}),
    ]),
    item('查找','explorer',null,[
      item('文件或文件夹…','explorer',function(){openApp('find');}),
      item('计算机…','net',function(){msg('查找计算机','在网络上找不到可用的计算机。',T.info);}),
    ]),
    item('帮助','info',function(){openHelp();}),
    {sep:true},
    item('运行…','explorer',function(){openRun();}),
    {sep:true},
    item('关闭系统…','shutdown',function(){doShutdown();}),
  ];
  menu.forEach(function(it){
    if(it.sep){ var s=document.createElement('div'); s.className='sm-sep'; sm.appendChild(s); return; }
    var d=document.createElement('div');
    d.className='sm-item';
    d.innerHTML='<img class="ic" src="'+ICON[it.icon]+'"><span>'+(it.label||'')+'</span>'+(it.sub?'<span class="arrow" style="margin-left:auto">▶</span>':'');
    d.addEventListener('mouseenter',function(){
      $$('.sm-item',sm).forEach(function(x){x.classList.remove('hover'); x.classList.remove('open'); this.classList.remove('hover');});
      this.classList.add('hover'); this.classList.add('open');
      // 关闭级联
      closeAllMenus();
      if(it.sub){
        var m=openPop(it.sub, $('#startMenu').getBoundingClientRect().right-4, d.getBoundingClientRect().top, null, null);
        wrapSubmenu(m,it.sub);
      }
    });
    d.addEventListener('mousedown',function(e){ e.stopPropagation(); });
    if(it.click) d.addEventListener('click',function(e){ e.stopPropagation(); closeStartMenu(); it.click(); });
    sm.appendChild(d);
  });
}
function wrapSubmenu(m, items){
  // 让子菜单项悬停也能再展开（start menu 级联的第二级）
  $$('.sm-item',m).forEach(function(d){
    d.addEventListener('mouseenter',function(){
      closeAllMenus();
    });
  });
}
function toggleStartMenu(){
  if(W95.startOpen){ closeStartMenu(); return; }
  buildStartMenu();
  $('#startMenu').classList.add('open');
  $('#startBtn').classList.add('open');
  W95.startOpen=true;
  if(AudioSys.isOn()) audioClick();
}
function closeStartMenu(){
  $('#startMenu').classList.remove('open');
  $('#startBtn').classList.remove('open');
  W95.startOpen=false;
  closeAllMenus();
}

/* ------------- 消息框/对话框 ------------- */
function msg(title, text, type, buttons, callback){
  var types={1:'error',2:'warn',3:'info',4:'question'};
  var ic = type===T.error?ICON.error : type===T.warn?ICON.warn : type===T.question?ICON.question : ICON.info;
  $('#msgbox').classList.remove('hide');
  $('#mbTitle').textContent=title;
  $('#mbIc').src=ic; $('#mbIc').style.display='';
  $('#mbText').textContent=text;
  var btns=$('#mbBtns'); btns.innerHTML='';
  var defs=buttons||[{label:'确定',def:true}];
  var focusBtn=null;
  defs.forEach(function(b){
    var bt=document.createElement('button'); bt.className='btn'; bt.textContent=b.label;
    if(b.def) focusBtn=bt;
    bt.addEventListener('click',function(){ $('#msgbox').classList.add('hide'); closeAllMenus(); if(callback) callback(b.value||b.label); });
    btns.appendChild(bt);
  });
  $('#overlay').classList.add('on');
  if(focusBtn) focusBtn.focus();
  if(type===T.error) AudioSys.err(); else if(type===T.warn) AudioSys.notify();
}
function audioClick(){ try{ AudioSys.ding(); }catch(e){} }
function err(text){ msg('错误', text, T.error); }

/* ------------- 桌面图标区 ------------- */
function buildDesktopIcons(){
  var icons=[
    {label:'我的电脑', icon:'mycomputer', dbl:function(){ openApp('mycomputer'); }},
    {label:'我的文档', icon:'docs', dbl:function(){ openApp('explorer'); }},
    {label:'网上邻居', icon:'net', dbl:function(){ msg('网上邻居','无法连接到网络。',T.err); }},
    {label:'回收站', icon:'recycle', dbl:function(){ openApp('recycle'); }},
  ];
  var box=$('#icons'); box.innerHTML='';
  icons.forEach(function(o){
    var d=document.createElement('div');
    d.className='desktop-icon';
    d.innerHTML='<img class="ic" src="'+ICON[o.icon]+'"><div class="lbl">'+o.label+'</div>';
    d.addEventListener('click',function(){
      $$('.desktop-icon').forEach(function(x){x.classList.remove('selected');});
      d.classList.add('selected');
    });
    d.addEventListener('dblclick',function(){ o.dbl(); });
    box.appendChild(d);
  });
}
