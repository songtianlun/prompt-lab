// Smoke-test harness: parses the STATIC HTML (before <script>) into a stub DOM,
// then runs the W95 app JS, mimicking window.onload, and exercises key actions.
"use strict";
const fs = require('fs');

const html = fs.readFileSync(process.argv[2], 'utf8');
const scriptStart = html.indexOf('<script>');
const staticHtml = html.slice(0, scriptStart>0?scriptStart:html.length);

/* ---------- minimal DOM ---------- */
class ClassList{constructor(el){this._s=new Set();this._el=el;}
  add(...c){c.forEach(x=>this._s.add(x));}remove(...c){c.forEach(x=>this._s.delete(x));}
  toggle(c,f){const on=f!==undefined?f:!this._s.has(c);on?this.add(c):this.remove(c);return on;}
  contains(c){return this._s.has(c);}}
function numOr(s,def){const n=parseFloat(s);return isNaN(n)?def:n;}
const elProto={
  addEventListener(ev,fn){(this._l=this._l||{})[ev]=(this._l[ev]||[]).concat(fn);},
  removeEventListener(ev,fn){if(this._l&&this._l[ev])this._l[ev]=this._l[ev].filter(f=>f!==fn);},
  dispatchEvent(ev){ev=ev||{type:'click'};ev.preventDefault=ev.preventDefault||function(){};ev.stopPropagation=ev.stopPropagation||function(){};
    (this._l&&this._l[ev.type]||[]).slice().forEach(fn=>{try{fn(ev);}catch(e){captureErr('event:'+ev.type,e)}});},
  appendChild(c){if(c==null)return c;c.parentNode=this;this.children.push(c);return c;},
  insertBefore(c,ref){if(ref===null)return this.appendChild(c);c.parentNode=this;const i=this.children.indexOf(ref);this.children.splice(i<=0?0:i,0,c);return c;},
  removeChild(c){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1);c.parentNode=null;return c;},
  remove(){if(this.parentNode)this.parentNode.removeChild(this);},
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')this.ownerDocument&&this.ownerDocument.idx(this,v,1);},
  getAttribute(k){return this.attributes[k];},
  focus(){}, blur(){},
  click(){this.dispatchEvent({type:'click'});},
  getBoundingClientRect(){return {left:0,top:0,right:300,bottom:280,width:300,height:280};},
  getContext(){return new Proxy({},{get:(t,k)=>typeof k==='string'?function(){return 0;}:0});},
  querySelector(sel){return qa(this,sel)[0]||null;},
  querySelectorAll(sel){return qa(this,sel);},
  closest(sel){let n=this;while(n){if(matchSel(n,sel))return n;n=n.parentNode;}return null;},
  get offsetWidth(){return 300;}, get offsetHeight(){return 260;},
};
function makeEl(tag, doc){
  const el=Object.create(elProto);
  el.tagName=(tag||'div').toUpperCase(); el.nodeType=1; el.children=[]; el.parentNode=null;
  el.attributes={}; el.style={}; el.dataset={}; el.classList=new ClassList(el);
  el.innerHTML=''; el.textContent=''; el.value=''; el.type=''; el.placeholder=''; el.checked=false;
  el.className=''; el.id=''; el.ownerDocument=doc||null;
  el.spellcheck=true; el.readOnly=false;
  // innerHTML setter: register id= child elements as stubs so lookups work
  let _html='';
  Object.defineProperty(el,'innerHTML',{
    get(){return _html;},
    set(v){
      _html=String(v);
      // Build a nested stub subtree from tags so .class / tag lookups resolve
      let s=_html;
      // strip comments
      s=s.replace(/<!--[\s\S]*?-->/g,'');
      el.children=[];
      const stack=[el];
      const voidTags=['img','input','br','hr','meta','link','col','area','base'];
      const tagRe=/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)(\/?)>/g;
      let m, last=0;
      while((m=tagRe.exec(s))!==null){
        // text between tags -> attach to current top
        const tx=s.slice(last,m.index);
        last=m.index+m[0].length;
        const closing=!!m[1], name=m[2].toLowerCase(), attrs=m[3]||'', selfClose=!!m[4];
        if(tx && stack.length){ stack[stack.length-1].textContent=(stack[stack.length-1].textContent||'')+tx; }
        if(closing){
          for(let i=stack.length-1;i>0;i--){ if(stack[i].tagName&&stack[i].tagName.toLowerCase()===name){ stack.pop(); break;} stack.pop(); }
          continue;
        }
        const c=makeEl(name, doc);
        // parse attrs
        const ar=/([a-zA-Z_:][\w:.-]*)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
        let am;
        while((am=ar.exec(attrs))!==null){
          let k=am[1]; let rawv=am[2]||'';
          let val=rawv.replace(/^["']|["']$/g,'');
          c.attributes[k]=val;
          if(k==='id'){ c.id=val; if(doc&&doc._ids) doc._ids[val]=c; }
          if(k==='class'){ c.className=val; val.split(/\s+/).forEach(x=>{if(x)c.classList.add(x);}); }
          if(k==='type')c.type=val;
          if(k==='value')c.value=val;
        }
        // collect text content until matching close (rough: assign on next text chunk)
        stack[stack.length-1].appendChild(c);
        if(!selfClose && voidTags.indexOf(name)<0){ stack.push(c); }
      }
    }
  });
  Object.defineProperty(el,'src',{get(){return el.attributes['src'];},set(v){el.setAttribute('src',v);}});
  return el;
}
// global id index per document
function buildDoc(){
  const body=makeEl('body');
  const doc={
    body, documentElement:body, _ids:{}, _l:{},
    idx(el,id){ this._ids[id]=el; },
    createElement(t){ return makeEl(t,this); },
    querySelectorAll(sel){ return qa(this.body,sel); },
    querySelector(sel){ return qa(this.body,sel)[0]||null; },
    getElementById(id){ return this._ids[id]||null; },
    addEventListener(ev,fn){(this._l[ev]=this._l[ev]||[]).concat&&this._l[ev].push(fn);},
    clientWidth:1024, clientHeight:768, bodyStyle:{}
  };
  // fix addEventListener
  body.ownerDocument=doc;
  const d=doc;
  d.addEventListener=(ev,fn)=>{(d._l[ev]=d._l[ev]||[]).push(fn);};
  return doc;
}
function matchSel(el,sel){
  sel=sel.trim();
  if(!sel) return false;
  // split combinators, keep last
  const parts=sel.split(/\s+/);
  const last=parts[parts.length-1];
  if(last[0]==='#') return el.id===last.slice(1);
  if(last[0]==='.') return el.classList.contains(last.slice(1));
  return (el.tagName&&el.tagName.toLowerCase())===last.toLowerCase();
}
function qa(root,sel){
  // If the selector has a leading '#', still need to descend to find by final part.
  // Do a full tree walk matching only the LAST combinator component, and return
  // all matches in document order (coarse but sufficient for smoke testing single-element lookups).
  const parts=sel.trim().split(/\s+/);
  const last=parts[parts.length-1];
  // special: pure id anywhere -> use index for speed/correctness
  if(parts.length===1 && last[0]==='#'){
    const id=last.slice(1);
    const doc=root.ownerDocument;
    return (doc&&doc._ids&&doc._ids[id])?[doc._ids[id]]:[];
  }
  const out=[];
  (function walk(n){
    if(n!==root&&matchSel(n,last)){ out.push(n); }
    (n.children||[]).forEach(walk);
  })(root);
  return out;
}
function captureErr(label,e){ if(!seenErr){seenErr=e;errLabel=label;} }
let seenErr=null, errLabel='';

/* ---------- parse static HTML into tree ---------- */
function parseHtml(doc){
  const stack=[doc.body];
  // strip comments
  let h=staticHtml.replace(/<!--[\s\S]*?-->/g,'');
  // script/style not in static part, but strip head
  const headEnd=h.indexOf('</head>');
  h=h.slice(headEnd+7);
  // tokenize tags
  const tagRe=/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
  let m, last=0; const textBuf=[];
  while((m=tagRe.exec(h))!==null){
    if(m.index>last){ const tx=h.slice(last,m.index); if(stack.length&&tx.trim()){/* text ignored */} }
    last=m.index+m[0].length;
    const closing=!!m[1], name=m[2].toLowerCase(), attrs=m[3]||'';
    if(closing){
      // pop until matching on stack
      for(let i=stack.length-1;i>=0;i--){
        if(stack[i].tagName&&stack[i].tagName.toLowerCase()===name){ stack.pop();break; }
        stack.pop();
      }
      continue;
    }
    const el=makeEl(name,doc);
    // parse attributes
    const attrRe=/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*"([^"]*)"|\s*=\s*'([^']*)'|\s*=\s*([^\s>]+))?/g;
    let am; 
    while((am=attrRe.exec(attrs))!==null){
      const k=am[1], v=am[2]!==undefined?am[2]:am[3]!==undefined?am[3]:am[4]!==undefined?am[4]:'';
      el.attributes[k]=v;
      if(k==='id'){el.id=v; doc._ids[v]=el;}
      if(k==='class'){v.split(/\s+/).forEach(c=>{if(c)el.classList.add(c);});el.className=v;}
      if(k==='type')el.type=v;
    }
    const parent=stack[stack.length-1];
    parent.appendChild(el);
    // text content from inner (rough): skip
    const selfClose=/\/>$/.test(attrs)||['img','input','br','hr','meta','link'].indexOf(name)>=0;
    if(!selfClose){ stack.push(el); }
    if(name==='img'){ el.appendChild&&0; }
  }
  return doc;
}
const doc=buildDoc();
global.document=doc;
const win={document:doc, innerWidth:1024, innerHeight:768, addEventListener(ev,fn){}, };
global.window=win; global.self=win;
global.AudioContext=undefined;

parseHtml(doc);

/* ---------- load app js (with in-scope smoke test appended) ---------- */
const appJs=html.slice(scriptStart<0?0:scriptStart);
const m2=/<script>([\s\S]*?)<\/script>/.exec(appJs);
if(!m2){ console.error('no script found'); process.exit(1); }
const testSnippet = `
;(function(){
  var failures=0;
  function tryit(name,fn){ try{ fn(); console.log('OK: '+name); }catch(e){ failures++; console.error('FAIL: '+name+' -> '+e.stack||e.message); } }
  try{
    ['notepad','calc','paint','mine','solitaire','mycomputer','control','explorer','find','msdos','ie',
     'recycle','datetime','display','soundSettings','addremove','systemProps','taskbarSettings']
     .forEach(a=>{ try{ openApp(a); }catch(e){ console.error('openApp '+a+' ERROR:', e.message); failures++; } });
    console.log('opened sample apps; windows open=', W95.wins.length);
    buildStartMenu(); toggleStartMenu(); console.log('start menu toggle OK'); closeStartMenu();

    // calculator interaction: press 7 + 5 =
    tryit('calc digits', function(){
      var w=getWin('calc'); if(!w) throw new Error('calc not open');
      var btns=w.querySelectorAll('.btn'); // includes digit buttons
      var b=function(t){ var found=null; w.querySelectorAll('button').forEach(function(x){ if(x.textContent.trim()===t&&!found) found=x; }); return found; };
      b('7').click(); b('+').click(); b('5').click(); b('=').click();
      var disp=w.querySelector('input'); if(!disp||disp.value!=='12') throw new Error('calc result wrong: '+disp.value);
    });
    // minesweeper: click first cell
    tryit('mine click', function(){
      var w=getWin('mine'); if(!w) throw new Error('mine not open');
      var cell=w.querySelector('div[style*="24px"], div[style*="gridTemplate"]');
      var board=w.body&&w.body.childNodes;
      // click each cell (they have click listeners)
      var cells=[]; (function walk(n){ (n.children||[]).forEach(function(c){ if(String(c.style&&c.style.cssText||'').indexOf('24px')>=0 && c.tagName==='DIV') cells.push(c); walk(c); }); })(w);
      if(cells.length) cells[0].click();
    });
    // solitaire opens (shows a msg) - fine
    // msgbox buttons
    tryit('msgbox click', function(){ var btnsv=[]; try{ document.querySelector('#mbBtns').dispatchEvent({}); }catch(e){ throw e; } });
    // close a window
    tryit('close win', function(){ var w=getWin('calc'); if(w) closeWin(w); console.log('closed calc, remaining=', W95.wins.length); });
    // doShutdown dialog present and has 是 button
    tryit('shutdown dialog', function(){ doShutdown(); if(!document.querySelector('#shYes')) throw new Error('no shutdown dialog'); });

    runCommand('calc'); runCommand('bogusxyz');
    console.log('=== IN-SCOPE ACTIONS DONE (failures='+failures+') ===');

    // ---- ASYNC power-cycle test (runs inside app scope) ----
    var asyncEnabled = typeof process!=='undefined' && process.env && process.env.ASYNC_TEST;
    if(asyncEnabled){
      var asteps=[], afail=[];
      function step(name,cond){ asteps.push(name); if(!cond) afail.push(name); console.log((cond?'PASS':'FAIL')+': '+name); }
      setTimeout(function(){
        proceedShutdown('shutdown');
        console.log('triggered shutdown; ~1.7s to safe screen...');
        setTimeout(function(){
          var found=false;
          (function walk(n){ if(n.textContent&&String(n.textContent).indexOf('安全地关闭')>=0) found=true; (n.children||[]).forEach(walk); })(document.body);
          step('safe-to-shutdown screen shown', found);
          // click safe screen to restart -> login
          var safe=null; (function walk(n){ if(!safe&&n.tagName==='DIV'&&n.style&&n.style.zIndex==='40000') safe=n; (n.children||[]).forEach(walk); })(document.body);
          try{ if(safe) safe.dispatchEvent({type:'click'}); }catch(e){ console.error('safe click err', e.message); }
          setTimeout(function(){
            var found2=false; (function walk(n){ if(n.textContent&&String(n.textContent).indexOf('欢迎使用 Windows')>=0) found2=true; (n.children||[]).forEach(walk); })(document.body);
            step('restart shows login dialog', found2);
            // click login OK
            try{ var lg=document.querySelector('#lgOK'); if(lg) lg.dispatchEvent({type:'click'}); }catch(e){ console.error('lg err',e.message); }
            setTimeout(function(){
              var found3=false; (function walk(n){ if(n.textContent&&String(n.textContent).indexOf('Microsoft Windows 95')>=0) found3=true; (n.children||[]).forEach(walk); })(document.body);
              step('login -> boot logo', found3);
              setTimeout(function(){
                step('desktop present after boot', !!document.querySelector('#desktop'));
                console.log('ASYNC FLOW DONE failures='+afail.length+' -> '+afail.join(','));
                process.exit(afail.length?1:0);
              }, 3000);
            }, 1300);
          }, 800);
        }, 2200);
      }, 100);
    }
  }catch(e){ console.error('ACTION ERROR:', e.stack||e.message); process.exitCode=1; }
})();`;
const runCode = m2[1] + '\n' + testSnippet;
try{ (new Function(runCode))(); }catch(e){ console.error('SCRIPT ERROR:',e.message); process.exit(1); }

/* ---------- run onload ---------- */
try{ win.onload(); }catch(e){ console.error('ONLOAD ERROR:',e.stack||e.message); process.exit(1); }
console.log('ONLOAD DONE');

if(process.env.ASYNC_TEST){
  // The async power-cycle test runs inside the app scope (testSnippet) and calls
  // process.exit itself. Add a safety timeout so we never hang.
  setTimeout(function(){ console.error('ASYNC TIMEOUT'); process.exit(1); }, 12000);
  console.log('async test armed (will finish on its own)');
} else {
  setTimeout(function(){ console.log('(sync smoke test complete)'); process.exit(process.exitCode||0); }, 50);
}

