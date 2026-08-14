/* ============================================================
   W95 SYSTEM APPS - 我的电脑 / 回收站 / 控制面板 / 任务栏设置 / 查找 / 运行 / 帮助
   ============================================================ */
"use strict";
/* 通用导航窗口构建器（左右双栏资源管理器样式） */
function explorerWindow(opts){
  // opts: {title, icon, items:[{label,icon,type,children,dbl}]}
  var app={
    title:opts.title, icon:opts.icon, minW:280,minH:200,w:opts.w||560,h:opts.h||380, menu:true,
    menus:opts.menus||[
      {label:'文件(F)', items:[{label:'关闭(C)',click:function(){closeWinById(opts.id);}}]},
      {label:'查看(V)', items:[{label:'大图标(G)',click:function(){}},{label:'小图标(S)',click:function(){}},{label:'列表(L)',click:function(){}},{label:'详细资料(D)',click:function(){}}]},
      {label:'帮助(H)', items:[{label:'关于',click:function(){msg('关于','Windows 95 资源管理器风格',T.info);}}]},
    ],
    build:function(win,body){
      body.style.cssText='display:flex;';
      var left=document.createElement('div');
      left.style.cssText='width:150px;border-right:1px solid #808080;background:#fff;overflow:auto;padding:4px;height:100%;';
      var tree=[
        {l:'桌面',i:'mycomputer'},
        {l:'我的电脑',i:'mycomputer',ch:[
          {l:'A盘',i:'floppy'},{l:'C盘',i:'mycomputer'},{l:'D盘',i:'mycomputer'},{l:'控制面板',i:'control'}
        ]},
        {l:'我的文档',i:'docs'},
        {l:'网上邻居',i:'net'},
        {l:'回收站',i:'recycle'},
      ];
      function renderTree(items, lvl){
        items.forEach(function(it){
          var d=document.createElement('div');
          d.style.cssText='padding:2px 4px;padding-left:'+(6+lvl*16)+'px;display:flex;align-items:center;gap:4px;white-space:nowrap;';
          d.innerHTML='<img style="width:16px;height:16px" src="'+ICON[it.i]+'"><span>'+it.l+'</span>';
          d.addEventListener('click',function(){
            $$('.treenode',left).forEach(function(x){x.style.background='';});
            d.style.background='#000080'; d.style.color='#fff';
            refreshRight(it);
          });
          d.className='treenode';
          left.appendChild(d);
          if(it.ch) renderTree(it.ch,lvl+1);
        });
      }
      renderTree(tree,0);
      var right=document.createElement('div');
      right.style.cssText='flex:1;overflow:auto;padding:6px;background:#fff;';
      function refreshRight(node){
        right.innerHTML='';
        var h=document.createElement('div');
        h.style.cssText='font-size:12px;font-weight:bold;margin-bottom:6px;';
        h.textContent=node.l+':';
        right.appendChild(h);
        var grid=document.createElement('div');
        grid.style.cssText='display:flex;flex-wrap:wrap;gap:8px;';
        (node.ch||[]).forEach(function(it){
          var d=document.createElement('div');
          d.style.cssText='width:70px;text-align:center;padding:4px;';
          d.innerHTML='<img style="width:32px;height:32px" src="'+ICON[it.i]+'"><div>'+it.l+'</div>';
          d.addEventListener('dblclick',function(){ if(it.dbl) it.dbl(); });
          grid.appendChild(d);
        });
        right.appendChild(grid);
      }
      body.appendChild(left); body.appendChild(right);
      win._right=right;
    }
  };
  app.id=opts.id; app.opts=opts;
  return app;
}

/* ---------------- 我的电脑 ---------------- */
W95.apps.mycomputer=explorerWindow({
  id:'mycomputer', title:'我的电脑', icon:'mycomputer', w:560,h:400,
  items:[
    {label:'A盘',icon:'floppy'},
    {label:'C盘',icon:'mycomputer'},
    {label:'D盘',icon:'mycomputer'},
    {label:'控制面板',icon:'control', dbl:function(){openApp('control');}},
    {label:'打印机',icon:'deflects'},
  ]
});

/* ---------------- 回收站 ---------------- */
W95.apps.recycle=function(){};
(function(){
  var app=explorerWindow({
    id:'recycle', title:'回收站', icon:'recycle', w:430,h:320,
    items:[]
  });
  app.build=function(win,body){
    body.innerHTML='<div style="padding:10px;font-size:11px;line-height:1.6">回收站为空。<br><br>被删除的项目会放在这里。您可以在关闭或重新启动计算机之前还原或永久删除它们。</div>';
  };
  W95.apps.recycle=app;
})();

/* ---------------- 控制面板 ---------------- */
W95.apps.control=function(){};
(function(){
  var cps=[
    {l:'显示器',i:'control',fn:function(){openApp('display');}},
    {l:'声音',i:'control',fn:function(){openApp('soundSettings');}},
    {l:'日期/时间',i:'control',fn:function(){openApp('datetime');}},
    {l:'鼠标',i:'control',fn:function(){msg('鼠标','这里可以调整鼠标设置。\n(模拟界面)',T.info);}},
    {l:'键盘',i:'control',fn:function(){msg('键盘','这里可以调整键盘设置。\n(模拟界面)',T.info);}},
    {l:'添加/删除程序',i:'control',fn:function(){openApp('addremove');}},
    {l:'字体',i:'control',fn:function(){msg('字体','已安装字体：Arial, Times New Roman 等。',T.info);}},
    {l:'网络',i:'net',fn:function(){msg('网络','无法检测到网络适配器。',T.info);}},
    {l:'系统',i:'mycomputer',fn:function(){openApp('systemProps');}},
  ];
  W95.apps.control=explorerWindow({
    id:'control', title:'控制面板', icon:'control', w:520,h:360,
    items:[]
  });
  W95.apps.control.build=function(win,body){
    body.style.padding='10px';
    body.innerHTML='<div style="font-size:11px;margin-bottom:6px">控制面板 — 调整计算机的系统设置。</div>';
    var grid=document.createElement('div');
    grid.style.cssText='display:flex;flex-wrap:wrap;gap:10px;';
    cps.forEach(function(c){
      var d=document.createElement('div');
      d.style.cssText='width:82px;text-align:center;padding:4px;cursor:default;';
      d.innerHTML='<img style="width:32px;height:32px" src="'+ICON[c.i]+'"><div>'+c.l+'</div>';
      d.addEventListener('dblclick',c.fn);
      grid.appendChild(d);
    });
    body.appendChild(grid);
  };
})();

/* ---------------- 显示器设置 ---------------- */
W95.apps.display={
  title:'显示器 属性', icon:'control', minW:340,minH:280,w:440,h:400,
  build:function(win,body){
    body.style.padding='12px';
    body.innerHTML=
      '<div style="font-size:12px;font-weight:bold;margin-bottom:8px">显示器</div>'+
      '<div style="line-height:2;font-size:11px">'+
      '&nbsp;背景图案: <select class="field"><option>（无）</option><option>砖墙</option><option>波浪</option><option>棋盘</option></select><br>'+
      '&nbsp;背景颜色: <select class="field" id=dispBg><option>青色</option><option>蓝色</option><option>黑色</option><option>紫红色</option></select><br>'+
      '&nbsp;屏幕保护程序: <select class="field"><option>（无）</option><option>多彩曲线</option><option>飞行窗口</option></select><br>'+
      '&nbsp;等待(N): <input type="text" class="field" value="15" style="width:34px"> 分钟</div>'+
      '<div style="margin-top:10px">'+
      '<div style="font-size:11px;margin-bottom:4px">桌面预览:</div>'+
      '<div id=dispPrev style="width:100%;height:130px;border:1px solid #808080;position:relative;overflow:hidden"></div></div>'+
      '<div style="margin-top:10px;display:flex;gap:6px">'+
      '<button class="btn" id=dispOk>确定</button><button class="btn" id=dispCancel>取消</button></div>';
    var prev=$('#dispPrev',body), bgSel=$('#dispBg',body);
    function updateBg(){
      var map={'青色':'#008080','蓝色':'#000080','黑色':'#000000','紫红色':'#800080'};
      prev.style.background=map[bgSel.value]||'#008080';
    }
    bgSel.addEventListener('change',updateBg); updateBg();
    $('#dispOk',body).addEventListener('click',function(){ closeWin(win); });
    $('#dispCancel',body).addEventListener('click',function(){ closeWin(win); });
  }
};

/* ---------------- 声音设置 ---------------- */
W95.apps.soundSettings={
  title:'声音 属性', icon:'control', minW:300,minH:300,w:380,h:360,
  build:function(win,body){
    body.innerHTML=
    '<div style="padding:12px;line-height:2">'+
    '<div style="font-weight:bold;margin-bottom:6px">启动声音</div>'+
    '<label><input type="checkbox" checked onchange="window.__w95Sound=this.checked;AudioSys[this.checked?"on":"off"]()"> 使用启动/关闭声音</label>'+
    '<div style="margin-top:12px"><button class="btn" data-c="playstart">播放启动音</button> '+
    '<button class="btn" data-c="playshut">播放关机音</button> '+
    '<button class="btn" data-c="playerr">播放错误音</button></div>'+
    '</div>';
    $$('button[data-c]',body).forEach(function(b){
      b.addEventListener('click',function(){
        var c=b.getAttribute('data-c');
        if(c==='playstart') AudioSys.start();
        else if(c==='playshut') AudioSys.shutdown();
        else if(c==='playerr') AudioSys.err();
      });
    });
    var ok=document.createElement('button'); ok.className='btn'; ok.textContent='确定';
    ok.addEventListener('click',function(){closeWin(win);});
    body.appendChild(ok); body.style.paddingBottom='12px';
  }
};

/* ---------------- 日期/时间 ---------------- */
W95.apps.datetime={
  title:'日期/时间 属性', icon:'control', minW:300,minH:260,w:340,h:300,
  build:function(win,body){
    var d=new Date();
    var months=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    body.innerHTML='<div style="padding:12px;line-height:1.8">'+
    '<div style="font-weight:bold">今天的日期与时间</div>'+
    '日期：'+months[d.getMonth()]+' '+d.getDate()+'日, '+d.getFullYear()+' 年<br>'+
    '时间：'+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())+'<br><br>'+
    '时区：<select><option>(GMT+08:00) 北京，重庆</option></select>'+
    '</div>';
    var ok=document.createElement('button'); ok.className='btn'; ok.textContent='确定'; ok.style.marginLeft='12px';
    ok.addEventListener('click',function(){closeWin(win);});
    body.appendChild(ok);
  }
};

/* ---------------- 添加/删除程序 ---------------- */
W95.apps.addremove={
  title:'添加/删除程序 属性', icon:'control', minW:320,minH:320,w:400,h:380,
  build:function(win,body){
    body.innerHTML='<div style="padding:12px">'+
    '<div style="font-weight:bold;margin-bottom:8px">目前安装的程序:</div>'+
    '<div style="border:1px solid #808080;padding:6px;height:140px;overflow:auto">'+
    '<div>记事本</div><div>画图</div><div>计算器</div><div>扫雷</div><div>纸牌</div></div>'+
    '<div style="margin-top:10px"><button class="btn">添加/删除(D)…</button></div>'+
    '</div>';
    var ok=document.createElement('button'); ok.className='btn'; ok.textContent='确定'; ok.style.marginLeft='12px';
    ok.addEventListener('click',function(){closeWin(win);});
    body.appendChild(ok);
  }
};

/* ---------------- 系统属性 ---------------- */
W95.apps.systemProps={
  title:'系统 属性', icon:'mycomputer', minW:340,minH:300,w:420,h:360,
  build:function(win,body){
    body.innerHTML='<div style="padding:14px;text-align:center;line-height:1.6">'+
    '<img style="width:40px;height:40px" src="'+ICON.mycomputer+'"><br>'+
    '<div style="font-size:13px;font-weight:bold;margin:6px 0">Microsoft Windows 95</div>'+
    '<div>版权所有 © 1981-1995 Microsoft Corp.</div><br>'+
    '<div style="text-align:left;margin-top:8px">'+
    '计算机：<br>&nbsp;&nbsp;Intel Pentium 75MHz<br>'+
    '内存：&nbsp;&nbsp;16.0MB RAM<br>'+
    '系统资源：92% 可用<br></div></div>';
    var ok=document.createElement('button'); ok.className='btn'; ok.textContent='确定'; ok.style.cssText='position:absolute;right:12px;bottom:12px;';
    ok.addEventListener('click',function(){closeWin(win);});
    body.appendChild(ok);
  }
};

/* ---------------- 查找文件 ---------------- */
W95.apps.find={
  title:'查找: 所有文件', icon:'explorer', minW:380,minH:260,w:460,h:300,
  build:function(win,body){
    body.innerHTML='<div style="padding:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
    '名称(&amp;N): <input type="text" id=findq style="width:180px" placeholder="*.txt"> '+
    '<button class="btn" id=findgo>开始查找(F)</button><button class="btn">停止(S)</button></div>'+
    '<div id=findres style="border:1px solid #808080;margin:0 10px;height:150px;overflow:auto;background:#fff;padding:4px"></div>';
    var q=$('#findq',body), res=$('#findres',body);
    $('#findgo',body).addEventListener('click',function(){
      res.innerHTML='';
      var pat=(q.value||'*.txt').toLowerCase();
      var found=0;
      [['C:\\WINDOWS\\NOTEPAD.EXE','记事本'],['C:\\WINDOWS\\PBRUSH.EXE','画图'],['C:\\WINDOWS\\CALC.EXE','计算器'],['C:\\WINDOWS\\WINMINE.EXE','扫雷'],['C:\\WINDOWS\\SOL.EXE','纸牌']].forEach(function(f){
        if(pat==='*'||f[0].toLowerCase().indexOf(pat.replace('*.',''))>=0||pat==='*.txt'){
          var d=document.createElement('div');
          d.innerHTML='<img style="width:16px;height:16px;vertical-align:middle" src="'+ICON.explorer+'"> '+f[0]+' — '+f[1];
          res.appendChild(d); found++;
        }
      });
      if(!found){ var d=document.createElement('div'); d.textContent='没有找到匹配的文件。'; res.appendChild(d); }
    });
  }
};

/* ---------------- 运行 ---------------- */
function openRun(){
  var box=document.createElement('div');
  box.style.cssText='position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);background:#C0C0C0;border:1px solid #000;outline:1px solid #fff;box-shadow:inset -1px -1px 0 #808080,inset 1px 1px 0 #fff;z-index:25000;width:360px;padding:3px;';
  box.innerHTML='<div class="mb-title" style="height:20px;margin:-3px -3px 0;padding:0 4px;background-image:linear-gradient(90deg,#000080,#1084D0);color:#fff;font-weight:bold;line-height:20px;font-size:11px">运行</div>'+
  '<div style="display:flex;gap:10px;padding:14px 12px 6px;align-items:center">'+
  '<img style="width:32px;height:32px" src="'+ICON.explorer+'">'+
  '<div><div style="padding-bottom:6px;font-size:11px">键入程序、文件夹或文档的名称，Windows 将为您打开它。</div>'+
  '<input type="text" style="width:220px" id=runCmd placeholder="blah"></div></div>'+
  '<div style="display:flex;justify-content:flex-end;gap:6px;padding:10px 12px 12px">'+
  '<button class="btn" id=runOK>确定</button><button class="btn" id=runCanc>取消</button></div>';
  document.body.appendChild(box);
  var close=function(){ box.remove(); };
  $('#runCanc',box).addEventListener('click',close);
  $('#runOK',box).addEventListener('click',function(){
    var v=($('#runCmd',box).value||'').trim().toLowerCase(); close(); runCommand(v);
  });
  box.addEventListener('mousedown',function(){ this.style.boxShadow='inset -1px -1px 0 #808080,inset 1px 1px 0 #fff'; });
  $('#runCmd',box).focus();
}
function runCommand(v){
  if(!v) return;
  if(v.indexOf('calc')>=0||v==='calculator'){openApp('calc');return;}
  if(v.indexOf('notepad')>=0){openApp('notepad');return;}
  if(v.indexOf('pbrush')>=0||v.indexOf('mspaint')>=0){openApp('paint');return;}
  if(v.indexOf('winmine')>=0||v==='mine'){openApp('mine');return;}
  if(v.indexOf('sol')>=0||v==='solitaire'){openApp('solitaire');return;}
  if(v.indexOf('explorer')>=0||v==='explorer'){openApp('explorer');return;}
  if(v.indexOf('command')>=0||v==='ms-dos'){openApp('msdos');return;}
  if(v.indexOf('control')>=0){openApp('control');return;}
  if(v==='shutdown'){doShutdown();return;}
  if(v.indexOf('.txt')>=0){openApp('notepad');return;}
  if(v.indexOf('http')>=0){openApp('ie');return;}
  err('无法找到要运行的程序或文档。\n\n\''+v+'\' 不是有效的命令。');
}

/* ---------------- 帮助 ---------------- */
function openHelp(){
  var w=openApp('notepad',{title:'帮助主题: Windows 帮助',icon:'info',w:420,h:340});
  if(w){ var ta=$('textarea',w); if(ta) ta.value='Windows 95 帮助\n==============\n\n• 如何在桌面上打开程序？\n  双击桌面图标，或用“开始”菜单。\n\n• 如何移动窗口？\n  按住标题栏拖动。\n\n• 如何调整窗口大小？\n  拖动右下角。\n\n• 如何关机？\n  开始 → 关闭系统。\n\n本模拟器由 AI 生成，用于展示 Windows 95 的经典界�与交互。\n'; }
}

/* ---------------- 资源管理器 ---------------- */
W95.apps.explorer=function(){};
(function(){
  W95.apps.explorer=explorerWindow({
    id:'explorer', title:'Exploring - C:', icon:'explorer', w:560,h:400
  });
})();

/* ---------------- 打印机 ---------------- */
W95.apps.printers={
  title:'打印机', icon:'deflects', minW:300,minH:220,w:420,h:300,
  build:function(win,body){
    body.innerHTML='<div style="padding:10px"><div style="font-size:12px;font-weight:bold;margin-bottom:8px">打印机</div>'+
    '<div style="border:1px solid #808080;padding:20px;text-align:center;background:#fff">没有安装打印机。<br><br><button class="btn">添加打印机(D)…</button></div></div>';
  }
};
