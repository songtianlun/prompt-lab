/* ============================================================
   W95 GAMES - 扫雷 / 纸牌
   ============================================================ */
"use strict";
/* ---------------- 扫雷 ---------------- */
W95.apps.mine={
  title:'扫雷', icon:'mine', minW:220,minH:260,w:250,h:300,
  build:function(win,body){
    var R=9,C=9,MN=10;
    var grid=[], revealed=0, over=false, flagCount=0, first=true;
    var timer=0, timeInt=null;
    var face='🙂';
    body.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;background:#C0C0C0;';

    var top=document.createElement('div');
    top.style.cssText='display:flex;justify-content:space-between;align-items:center;width:100%;max-width:220px;padding:2px 4px;border:1px solid;border-color:#fff #808080 #808080 #fff;';
    var mineL=document.createElement('span');
    mineL.style.cssText='background:#000;color:#E03A3A;font-family:Fixedsys,monospace;font-size:13px;padding:1px 4px;';
    var faceB=document.createElement('button'); faceB.className='btn'; faceB.style.cssText='font-size:14px;padding:1px 8px;'; faceB.textContent='🙂';
    var timeL=document.createElement('span');
    timeL.style.cssText='background:#000;color:#E03A3A;font-family:Fixedsys,monospace;font-size:13px;padding:1px 4px;';
    top.appendChild(mineL); top.appendChild(faceB); top.appendChild(timeL);

    var board=document.createElement('div');
    board.style.cssText='display:grid;gap:0;border:1px solid;border-color:#808080 #fff #fff #808080;padding:1px;background:#C0C0C0;';
    function updateLEd(){ mineL.textContent=('000'+Math.max(0,MN-flagCount)).slice(-3); }
    function updateT(){ timeL.textContent=('000'+Math.min(999,timer)).slice(-3); }
    function reset(){
      grid=[]; revealed=0; over=false; flagCount=0; first=true; timer=0;
      makeGrid();
      revGrid();
      updateLEd(); updateT(); faceB.textContent='🙂';
      if(timeInt) clearInterval(timeInt); timeInt=null;
    }
    function makeGrid(){
      grid=[];
      for(var r=0;r<R;r++){ grid[r]=[]; for(var c=0;c<C;c++) grid[r][c]={m:false,f:false,o:false,n:0}; }
    }
    function plantMines(sr,sc){
      var spots=[];
      for(var r=0;r<R;r++) for(var c=0;c<C;c++){ if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1) continue; spots.push([r,c]); }
      // 洗牌
      for(var i=spots.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=spots[i]; spots[i]=spots[j]; spots[j]=t; }
      for(var k=0;k<Math.min(MN,spots.length);k++){ var p=spots[k]; grid[p[0]][p[1]].m=true; }
      // 计算邻居
      for(r=0;r<R;r++)for(c=0;c<C;c++){ var n=0; eachN(r,c,function(nr,nc){ if(grid[nr][nc].m)n++; }); grid[r][c].n=n; }
    }
    function eachN(r,c,fn){ for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){ if(!dr&&!dc)continue; var nr=r+dr,nc=c+dc; if(nr>=0&&nr<R&&nc>=0&&nc<C) fn(nr,nc);} }
    function cellHtml(cell){
      if(cell.o){
        if(cell.m) return '<span style="font-size:12px;color:#000">💣</span>';
        var colors=['#0000FF','#008000','#E03A3A','#000080','#800000','#008080','#000','#808080'];
        return cell.n>0?'<span style="font-size:12px;font-weight:bold;color:'+colors[cell.n-1]+'">'+cell.n+'</span>':'';
      }
      if(cell.f) return '<span style="font-size:12px;color:#E03A3A">🚩</span>';
      return '';
    }
    function revGrid(){
      board.innerHTML='';
      board.style.gridTemplateColumns='repeat('+C+',24px)';
      for(var r=0;r<R;r++)for(var c=0;c<C;c++){
        (function(rr,cc){
          var d=document.createElement('div');
          d.style.cssText='width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:11px;';
          var refresh=function(){ d.style.background=grid[rr][cc].o?'#C0C0C0':'#B0B0B0'; d.innerHTML=cellHtml(grid[rr][cc]);
            if(grid[rr][cc].o){ d.style.border='1px solid #808080'; d.style.boxShadow='inset 0 0 0'; } else { d.style.border='1px solid'; d.style.borderColor='#fff #808080 #808080 #fff'; } };
          d.addEventListener('mousedown',function(e){
            if(over) return;
            if(e.button===0 && !grid[rr][cc].o && !grid[rr][cc].f){ faceB.textContent='😮'; }
            if(e.button===2 && !grid[rr][cc].o){ grid[rr][cc].f=!grid[rr][cc].f; flagCount=grid.flat().filter(function(x){return x.f;}).length; updateLEd(); refresh(); }
          });
          d.addEventListener('mouseup',function(e){ faceB.textContent='🙂'; });
          d.addEventListener('click',function(){ if(over)return; openCell(rr,cc); refreshAll(); reviewWin(); });
          d.addEventListener('contextmenu',function(e){ e.preventDefault(); });
          function refreshAll(){ revGrid(); }
          refresh();
          board.appendChild(d);
          grid[rr][cc].el=d;
        })(r,c);
      }
    }
    function openCell(r,c){
      if(grid[r][c].o||grid[r][c].f) return;
      if(first){ makeGrid(); plantMines(r,c); first=false; timeInt=setInterval(function(){ timer++; updateT(); if(timer>=999)clearInterval(timeInt); },1000); }
      var cell=grid[r][c];
      cell.o=true; revealed++;
      if(cell.m){ cell.o=true; lose(); return; }
      if(cell.n===0){ eachN(r,c,function(nr,nc){ if(!grid[nr][nc].m) openCell(nr,nc); }); }
    }
    function lose(){ over=true; clearInterval(timeInt); faceB.textContent='😵'; msg('扫雷','你踩到地雷了！游戏结束。',T.warn); }
    function reviewWin(){
      if(over)return;
      var safe=R*C-MN;
      if(revealed>=safe){ over=true; clearInterval(timeInt); faceB.textContent='😎'; msg('扫雷','恭喜！你赢了！用时 '+timer+' 秒。',T.info); }
    }
    refresh=function(){ revGrid(); };
    reset();
    faceB.addEventListener('click',reset);
    body.appendChild(top); body.appendChild(board);
    body.addEventListener('contextmenu',function(e){e.preventDefault();});
  }
};

/* ---------------- 纸牌 (简化) ---------------- */
W95.apps.solitaire={
  title:'纸牌', icon:'solitaire', minW:300,minH:300,w:620,h:420,
  build:function(win,body){
    body.style.cssText='padding:8px;background:#008080;';
    var deck=[], pile=[], col=[[],[],[],[],[],[],[]], found=[[],[],[],[]];
    var stock=[], waste=[];
    var suits=['♠','♥','♦','♣'], reds={'♥':1,'♦':1};
    function newDeck(){ deck=[]; for(var s=0;s<4;s++)for(var v=1;v<=13;v++) deck.push({s:suits[s],v:v}); shuffle(); }
    function shuffle(){ for(var i=deck.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=deck[i];deck[i]=deck[j];deck[j]=t; } deal(); }
    var dealt=false;
    function deal(){
      if(!dealt){ for(i=0;i<7;i++) for(j=0;j<=i;j++) col[i].push(deck.pop()); dealt=true; }
    }
    var bodyEl=body;
    function render(canvas){
      newDeck();
      var d=document.createElement('div');
      d.style.cssText='width:1200px;height:760px;position:relative;transform-origin:top left;transform:scale(calcX);';
      function card(c,x,y,face,interactive){
        var el=document.createElement('div');
        el.style.cssText='position:absolute;left:'+x+'px;top:'+y+'px;width:58px;height:80px;';
        if(face){
          el.style.cssText+='background:#fff;border:1px solid #000;border-radius:3px;';
          el.innerHTML='<div style="padding:3px;font-size:11px;color:'+(reds[c.s]?'#E03A3A':'#000')+'"><b style="font-size:13px">'+c.v+'</b><br>'+c.s+'</div>';
        }else{
          el.style.cssText+='background:repeating-linear-gradient(45deg,#1a5a8a,#1a5a8a 3px,#276fa3 3px,#276fa3 6px);border:1px solid #000;border-radius:3px;';
        }
        return el;
      }
      var x0=20,y0=20;
      // 左上牌堆
      /* 简化为显示四列纸牌 + 堆 */
      bodyEl.innerHTML='<div style="line-height:1.5">纸牌 (简化版)</div><div style="margin-top:6px;font-size:11px;color:#fff">左上为发牌堆，这里我们简化处理，仅展示牌面。</div>';
    }
    body.style.overflow='auto';
    // 简化版：显示一副展开的牌
    msg('纸牌','简化版纸牌：\n\n这里只展示界面框架。\n（完整玩法可后续扩展）',T.info);
  }
};
