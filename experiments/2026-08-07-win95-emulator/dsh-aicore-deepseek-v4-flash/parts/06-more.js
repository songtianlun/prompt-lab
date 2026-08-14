/* ============================================================
   W95 MORE APPS & SYSTEM - MS-DOS / 浏览器 / 任务栏设置 / 关机 / 开机
   ============================================================ */
"use strict";
/* ---------------- MS-DOS 方式 ---------------- */
W95.apps.msdos={
  title:'MS-DOS 方式', icon:'msdos', minW:320,minH:240,w:560,h:360,
  build:function(win,body){
    body.style.cssText='background:#000;padding:10px;color:#C0C0C0;font-family:Fixedsys,Consolas,monospace;font-size:14px;';
    var line=document.createElement('div');
    line.style.cssText='line-height:1.5;white-space:pre-wrap;';
    line.textContent='Microsoft(R) Windows 95\n   (C)Copyright Microsoft Corp 1981-1995.\n\nC:\\WINDOWS>_';
    body.appendChild(line);
    body.addEventListener('click',function(){
      msg('MS-DOS 方式','这是一个模拟的 DOS 提示符。\n\n它只是外观，不接受实际的 DOS 命令。',T.info);
    });
  }
};

/* ---------------- Internet Explorer ---------------- */
W95.apps.ie={
  title:'Welcome to the Internet', icon:'ie', menu:true, minW:360,minH:240,w:640,h:420,
  menus:[
    {label:'文件(F)', items:[{label:'关闭(C)',click:function(){closeWinById('ie');}}]},
    {label:'帮助(H)', items:[{label:'关于 Internet Explorer',click:function(){msg('关于','Microsoft Internet Explorer 2.0\n(模拟版)',T.info);}}]},
  ],
  build:function(win,body){
    var tb=document.createElement('div');
    tb.style.cssText='display:flex;gap:4px;padding:3px;';
    ['←','→','✕','🏠','🔍'].forEach(function(b,i){
      var bt=document.createElement('button'); bt.className='btn'; bt.style.cssText='padding:2px 8px;font-size:11px;'; bt.textContent=b;
      bt.addEventListener('click',function(){ if(i===4) msg('搜索','在这台计算机上找不到 Internet 连接。',T.warn); });
      tb.appendChild(bt);
    });
    var addr=document.createElement('div');
    addr.style.cssText='padding:3px;font-size:11px;';
    addr.innerHTML='地址: <input type="text" style="width:80%" value="http://home.microsoft.com/">';
    var frame=document.createElement('div');
    frame.style.cssText='border:1px solid #808080;margin:0 4px;height:calc(100% - 50px);background:#fff;overflow:auto;padding:8px;';
    frame.innerHTML='<center><h3 style="margin:12px 0">欢迎使用 Internet!</h3>'+
    '<p style="margin:8px 40px;line-height:1.5">Internet Explorer 是一个用于浏览 Internet 的免费组件。<br>本处为模拟界面。</p>'+
    '<button class="btn" style="margin-top:10px" onclick=maybeErr()>开始使用</button></center>';
    body.appendChild(tb); body.appendChild(addr); body.appendChild(frame);
    body.parentNode.style.overflow='hidden';
    // expose
    window.maybeErr=function(){ msg('Internet Explorer','无法连接到服务器。请检查网络连接。',T.warn); };
  }
};

/* ---------------- 任务栏设置 ---------------- */
W95.apps.taskbarSettings={
  title:'任务栏 属性', icon:'control', minW:320,minH:300,w:380,h:340, menu:true,
  menus:[{label:'帮助(H)', items:[{label:'关于',click:function(){msg('任务栏','Windows 95 任务栏设置',T.info);}}]}],
  build:function(win,body){
    var tabs=document.createElement('div');
    tabs.style.cssText='display:flex;padding:8px 8px 0;';
    var mk=function(l,on,i){
      var t=document.createElement('div');
      t.style.cssText='padding:4px 12px;border:1px solid #808080;position:relative;top:1px;font-size:11px;background:'+(on?'#C0C0C0':'#D0D0D0')+';';
      t.textContent=l;
      t.addEventListener('click',function(){
        $$('.tabbtn',tabs).forEach(function(x){x.style.background='#D0D0D0';});
        t.style.background='#C0C0C0';
        show(i);
      });
      t.className='tabbtn';
      return t;
    };
    var tabOptions=mk('任务栏选项',true,0), tabStart=mk('开始菜单程序',false,1);
    tabs.appendChild(tabOptions); tabs.appendChild(tabStart);
    var panel=document.createElement('div');
    panel.style.cssText='border:1px solid #808080;margin:0 8px;padding:12px;height:180px;';
    var p0, p1;
    function show(i){
      panel.innerHTML='';
      if(i===0){
        p0=document.createElement('div'); p0.innerHTML=
        '<label style="display:block;margin:4px 0"><input type="checkbox" checked> 总在最前(T)</label>'+
        '<label style="display:block;margin:4px 0"><input type="checkbox" checked> 自动隐藏(U)</label>'+
        '<label style="display:block;margin:4px 0"><input type="checkbox" checked> 在“开始”菜单中显示小图标(S)</label>'+
        '<label style="display:block;margin:4px 0"><input type="checkbox" checked> 显示时钟(C)</label>'+
        '<div style="margin-top:10px;height:40px;width:100%;background:linear-gradient(#0000aa,#1084d0);border:1px solid #fff;position:relative">'+
        '<div style="position:absolute;left:4px;bottom:3px;width:28px;height:12px;background:#C0C0C0;border:1px solid #fff;font-size:7px;padding:1px">开始</div></div>';
        panel.appendChild(p0);
      } else {
        p1=document.createElement('div'); p1.innerHTML=
        '<div style="font-size:11px">自定义“开始”菜单中的程序。</div>'+
        '<div style="margin:10px 0"><button class="btn">添加(A)…</button> <button class="btn">删除(R)…</button> <button class="btn">高级(V)…</button></div>'+
        '<div style="font-size:11px;margin-top:8px"><label style="display:block"><input type="checkbox" checked> <b>清除(C)</b> 文档菜单内容</label></div>';
        panel.appendChild(p1);
      }
    }
    show(0);
    var btns=document.createElement('div');
    btns.style.cssText='display:flex;justify-content:flex-end;gap:6px;padding:10px 8px;';
    ['确定','取消','应用'].forEach(function(l){
      var b=document.createElement('button'); b.className='btn'; b.textContent=l;
      b.addEventListener('click',function(){ if(l==='确定') closeWin(win); });
      btns.appendChild(b);
    });
    body.appendChild(tabs); body.appendChild(panel); body.appendChild(btns);
  }
};

/* ============================================================
   关机 / 重启 / 注销 界面
   ============================================================ */
/* 关机画面 */
function doShutdown(){
  var box=document.createElement('div');
  box.style.cssText='position:fixed;left:50%;top:35%;transform:translate(-50%,-50%);background:#C0C0C0;border:1px solid #000;outline:1px solid #fff;box-shadow:inset -1px -1px 0 #808080,inset 1px 1px 0 #fff;z-index:26000;width:380px;padding:3px;';
  box.innerHTML=
  '<div style="height:20px;margin:-3px -3px 0;padding:0 4px;background-image:linear-gradient(90deg,#000080,#1084D0);color:#fff;font-weight:bold;line-height:20px;font-size:11px">关闭 Windows</div>'+
  '<div style="display:flex;gap:12px;padding:16px 14px 8px;align-items:flex-start">'+
  '<img style="width:32px;height:32px" src="'+ICON.shutdown+'">'+
  '<div style="font-size:11px;line-height:1.5">确实要：<br>'+
  '<label style="display:block;margin:6px 0"><input type="radio" name="shut" value="shutdown" checked> 关闭计算机？(S)</label>'+
  '<label style="display:block;margin:6px 0"><input type="radio" name="shut" value="restart"> 重新启动计算机？(R)</label>'+
  '<label style="display:block;margin:6px 0"><input type="radio" name="shut" value="msdos"> 重新启动计算机并切换到 MS-DOS 方式？(M)</label>'+
  '<label style="display:block;margin:6px 0"><input type="radio" name="shut" value="logoff"> 关闭所有程序并作为其他用户登录？(L)</label>'+
  '</div></div>'+
  '<div style="display:flex;justify-content:flex-end;gap:6px;padding:10px 14px 14px">'+
  '<button class="btn" id=shYes>是(Y)</button><button class="btn" id=shNo>否(N)</button><button class="btn" id=shHelp>帮助(H)</button></div>';
  document.body.appendChild(box);
  function val(){ var r=box.querySelector('input[name=shut]:checked'); return r?r.value:null; }
  $('#shNo',box).addEventListener('click',function(){ box.remove(); });
  $('#shHelp',box).addEventListener('click',function(){ msg('关闭 Windows','请选择一种关机方式，然后按“是”。',T.info); });
  $('#shYes',box).addEventListener('click',function(){
    var v=val(); box.remove(); proceedShutdown(v);
  });
  box.addEventListener('mousedown',function(){ W95.z++; this.style.zIndex=++W95.z; });
}
function proceedShutdown(v){
  AudioSys.shutdown();
  if(v==='logoff'){ showLoginScreen(); return; }
  if(v==='msdos'){ msg('MS-DOS 方式','正在准备切换到 MS-DOS…\n\n(模拟) 此模式下只能运行文本程序。',T.info); return; }
  // shutdown 或 restart -> 黑屏淡出
  var black=document.createElement('div');
  black.style.cssText='position:fixed;inset:0;background:#000;z-index:40000;opacity:0;transition:opacity 1.5s;';
  document.body.appendChild(black);
  setTimeout(function(){ black.style.opacity='1'; },50);
  setTimeout(function(){
    if(v==='restart'){ black.remove(); showLoginScreen(); }
    else showShutdownScreen();
  },1700);
}
/* 它现在可以安全地关闭计算机了 */
function showShutdownScreen(){
  var os=document.createElement('div');
  os.style.cssText='position:fixed;inset:0;background:#000080;color:#fff;z-index:40000;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  os.innerHTML='<div style="font-size:26px;font-weight:bold;font-family:MS Sans Serif,Tahoma;text-shadow:2px 2px 0 #000">你现在可以安全地关闭计算机了。</div>'+
    '<div style="font-size:12px;margin-top:14px;color:#aaa">(点击屏幕可重新启动)</div>';
  document.body.appendChild(os);
  os.addEventListener('click',function(){ os.remove(); showLoginScreen(); });
}

/* ============================================================
   开机 BIOS / 登录 / 启动画面 流程
   ============================================================ */
function showLoginScreen(bootAfter){
  var layer=document.createElement('div');
  layer.style.cssText='position:fixed;inset:0;background:#008080;z-index:39990;display:flex;align-items:center;justify-content:center;';
  // 模拟 Windows 95 登录对话框
  var box=document.createElement('div');
  box.style.cssText='background:#C0C0C0;border:1px solid #000;outline:1px solid #fff;box-shadow:inset -1px -1px 0 #808080,inset 1px 1px 0 #fff;width:340px;padding:3px;';
  box.innerHTML=
    '<div style="height:20px;margin:-3px -3px 0;padding:0 4px;background-image:linear-gradient(90deg,#000080,#1084D0);color:#fff;font-weight:bold;line-height:20px;font-size:11px">欢迎使用 Windows</div>'+
    '<div style="display:flex;gap:12px;padding:14px 12px 6px;">'+
      '<img style="width:32px;height:32px" src="'+ICON.info+'">'+
      '<div style="font-size:11px">输入用户名和密码以登录到 Windows。<br><br>'+
        '用户名(U): <input type="text" id=lgUser value="Student" style="width:150px"><br>'+
        '密码(P): &nbsp;&nbsp;<input type="password" id=lgPass style="width:150px" placeholder="(任意)"></div>'+
    '</div>'+
    '<div style="display:flex;justify-content:flex-end;gap:6px;padding:10px 12px 12px;">'+
      '<button class="btn" id=lgOK>确定</button><button class="btn" id=lgCancel>取消</button></div>';
  layer.appendChild(box);
  document.body.appendChild(layer);
  function go(){
    var u=$('#lgUser',box).value||'Guest';
    var p=$('#lgPass',box).value;
    AudioSys.start();
    layer.style.opacity='0'; layer.style.transition='opacity 0.5s';
    setTimeout(function(){ layer.remove(); bootLogo(); },450);
  }
  $('#lgCancel',box).addEventListener('click',go);
  $('#lgOK',box).addEventListener('click',go);
  $('#lgPass',box).addEventListener('keydown',function(e){ if(e.key==='Enter') go(); });
  $('#lgUser',box).focus();
}

/* Win95 启动 logo */
function bootLogo(){
  var layer=document.createElement('div');
  layer.style.cssText='position:fixed;inset:0;background:#000;z-index:39970;display:flex;align-items:center;justify-content:center;flex-direction:column;';
  document.body.appendChild(layer);
  var t=document.createElement('div');
  t.style.cssText='color:#F3F3EF;font-size:34px;font-family:Tahoma,MS Sans Serif;font-weight:bold;letter-spacing:1px;text-shadow:2px 2px 0 #000;';
  layer.appendChild(t);
  var bar=document.createElement('div');
  bar.style.cssText='margin-top:40px;width:320px;height:14px;border:2px solid #505050;display:none;position:relative;';
  bar.innerHTML='<div style="height:100%;width:0;background:#2b7ae0;" id=bw></div>';
  layer.appendChild(bar);
  var tag=document.createElement('div');
  tag.style.cssText='margin-top:8px;color:#7a7a7a;font-size:10px;';
  layer.appendChild(tag);

  var text='Microsoft Windows 95';
  var i=0;
  var ti=setInterval(function(){ i++; t.textContent=text.slice(0,i);
    if(i>=text.length){ clearInterval(ti); bar.style.display=''; }
  },45);
  var w=0;
  var bi=setInterval(function(){ w+=Math.random()*9+3; if(w>=100)w=100; $('#bw',layer).style.width=w+'%'; if(w>=100){clearInterval(bi); tag.textContent='正在准备桌面…';} },90);
  setTimeout(function(){
    layer.style.opacity='0'; layer.style.transition='opacity 0.8s';
    setTimeout(function(){ layer.remove(); W95.booted=true; buildTaskbar(); },800);
  }, 2600);
}

/* ============================================================
   BOOT STRAP
   ============================================================ */
function init(){
  // 时钟
  tickClock(); setInterval(tickClock,10000);
  // 开始按钮
  $('#startBtn').addEventListener('click',function(e){ e.stopPropagation(); toggleStartMenu(); });
  document.addEventListener('mousedown',function(e){
    if(!e.target.closest('#startMenu')) closeStartMenu();
    if(!e.target.closest('#msgbox')) {}
  });
  // 时钟区
  $('#clock').addEventListener('click',function(){ openApp('datetime'); });
  // 桌面图标
  buildDesktopIcons();
  // Windows 徽标 flg（用简单内联 svg）
  makeStartFlag();
}
function makeStartFlag(){
  var b=$('#startBtn .flg');
  b.src='data:image/svg+xml;utf8,'+encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">'+
    '<path fill="#ff2b2b" d="M0 0 H16 V16 H0 Z"/>'+
    '<path fill="#ffb100" d="M0 7 H16 V9 H0 Z"/>'+
    '<path fill="#00a000" d="M0 11 H16 V16 H0 Z"/>'+
    '<path fill="#2b5aff" d="M0 2 H4 V5 H0 Z M6 2 H10 V5 H6 Z M12 2 H16 V5 H12 Z" opacity="0.8"/>'+
    '</svg>');
}

/* 启动流程：先 BIOS+登录，再进入桌面 */
window.onload=function(){
  init();
  showLoginScreen();
};
