/* ============================================================
   Windows 95 模拟器 — 核心库
   ============================================================ */
(function () {
  "use strict";

  const W95 = (window.W95 = {});

  /* ---------------- DOM helpers ---------------- */
  W95.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  W95.$$ = function (sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  };
  W95.el = function (tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined) continue;
        if (k === "class") e.className = v;
        else if (k === "style" && typeof v === "object")
          Object.assign(e.style, v);
        else if (k === "html") e.innerHTML = v;
        else if (k === "text") e.textContent = v;
        else if (k === "dataset") Object.assign(e.dataset, v);
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v);
      }
    }
    if (children !== undefined) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c === null || c === undefined) continue;
        e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return e;
  };
  W95.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  /* ---------------- storage ---------------- */
  const store = {
    get(key, def) {
      try {
        const v = localStorage.getItem("w95." + key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem("w95." + key, JSON.stringify(val)); } catch (e) {}
    },
  };
  W95.store = store;

  /* ---------------- pixel icon system ---------------- */
  function iconSVG(def, size) {
    size = size || 16;
    const pal = def.p;
    let rects = "";
    const rows = def.r;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === ".") continue;
        const col = pal[ch];
        if (!col) continue;
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
      }
    }
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" width="${size}" height="${size}" shape-rendering="crispEdges">` +
      rects +
      `</svg>`
    );
  }
  W95.iconSVG = iconSVG;

  const ICONS = {
    computer: {
      p: { k: "#000000", w: "#e8e8e8", c: "#008080", W: "#c0ffff" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kwwwwwwwwwwwwk.",
        ".kwcWcWcWcWcWwk.",
        ".kwcWcWcWcWcWwk.",
        ".kwcWcWcWcWcWwk.",
        ".kwcWcWcWcWcWwk.",
        ".kwcWcWcWcWcWwk.",
        ".kwccccccccccwk.",
        ".kwwwwwwwwwwwwk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        "......kggk......",
        ".....kggggk.....",
        "....kggggggk....",
        "...kkkkkkkkkk...",
      ],
    },
    recycle: {
      p: { k: "#000000", w: "#ffffff", g: "#c0c0c0", G: "#808080", n: "#008000", N: "#004000" },
      r: [
        "................",
        "....kkkkkkkk....",
        "...kggggggggk...",
        "..kggggggggggk..",
        "..kGkkkkkkkkGk..",
        "..kGggggggggGk..",
        "..kGgNnnnnNgGk..",
        "..kGgnwnnnw gGk.",
        "..kGgnwnnwnngGk.",
        "..kGgnnwnnnngGk.",
        "..kGggggggggGk..",
        "..kGggggggggGk..",
        "..kggggggggggk..",
        "..kkkkkkkkkkkk..",
        "................",
        "................",
      ],
    },
    mydocs: {
      p: { k: "#000000", y: "#ffff00", Y: "#c0c000", w: "#ffffff", b: "#0000a0" },
      r: [
        "................",
        ".....yyyyyy.....",
        "....yyyyyyyy....",
        "...yykkkkkkkk...",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyywwwwwwyyyk.",
        "..kyywbbbbwyyyk.",
        "..kyywwwwwwyyyk.",
        "..kyywbbbbwyyyk.",
        "..kyywwwwwwyyyk.",
        "..kyywwwwwwyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kkkkkkkkkkkk..",
        "................",
      ],
    },
    network: {
      p: { k: "#000000", g: "#808080", G: "#c0c0c0", b: "#0000c0", n: "#00a000", w: "#ffffff" },
      r: [
        "................",
        "...ggggggggg....",
        "..gbbbbbbbbg....",
        ".gbbnbbbbbbg....",
        ".gbbbnbbbbbg....",
        ".gbnbbbnbbbg....",
        ".gbbbbbnbbbg....",
        ".gbbbbbbbbbg....",
        "..gbbbbbbbbg....",
        "...ggggggggg....",
        ".......kkkkk....",
        ".......kwwk.....",
        ".......kwck.....",
        ".......kwwk.....",
        ".......kkkk.....",
        "................",
      ],
    },
    notepad: {
      p: { k: "#000000", w: "#ffffff", b: "#0000a0", G: "#c0c0c0" },
      r: [
        "................",
        "...wwwwkkk......",
        "..wwwwwkwwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..kkkkkkkkk.....",
        "................",
        "................",
      ],
    },
    paint: {
      p: { k: "#000000", G: "#c0c0c0", g: "#808080", r: "#ff0000", b: "#0000ff", n: "#00a000", y: "#ffff00", o: "#a0522d" },
      r: [
        "................",
        ".....ggggkk.....",
        "....gggggkgg....",
        "...ggggggkggg...",
        "..ggrggggkggg...",
        "..gggrggkgggg...",
        "..ggggrgkgggg...",
        "..gggggrggggg...",
        "..ggggggkkggg...",
        "..ggggggggggg...",
        "..gbyggggggyg...",
        "..ggbyggggyg....",
        "..gggggggggg....",
        "...gggggggg.....",
        "................",
        "................",
      ],
    },
    calc: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8", r: "#ff0000", b: "#0000c0" },
      r: [
        "................",
        "..kkkkkkkkkk....",
        "..kggggggggk....",
        "..kgkkkkkkkgk...",
        "..kggggggggk....",
        "..kGkGkGkGkk....",
        "..kGrGrGrGkk....",
        "..kGkGkGkGkk....",
        "..kGrGrGrGkk....",
        "..kGkGkGkGkk....",
        "..kGrGrGrGkk....",
        "..kGkGkGkGkk....",
        "..kbbbbbbbbk....",
        "..kkkkkkkkkk....",
        "................",
        "................",
      ],
    },
    mine: {
      p: { k: "#000000", w: "#ffffff", G: "#808080" },
      r: [
        "................",
        "....kkkkkk......",
        "..kkkkkkkkkk....",
        ".kkkkkkkkkkkk...",
        ".kkwkkkkkkkkk...",
        "kkkkkkkkkkkkkk..",
        "kkwkkkkkkkkkkk..",
        "kkkkkkkkkkkkkk..",
        "kkkkkkkkkkkkkk..",
        ".kkkkkkkkkkkk...",
        ".kkkkkkkkkkkk...",
        "..kkkkkkkkkk....",
        "..kk..kk..kk....",
        "................",
        "................",
        "................",
      ],
    },
    solitaire: {
      p: { k: "#000000", w: "#ffffff", r: "#ff0000", b: "#000080" },
      r: [
        "................",
        "...kkkkkkkk.....",
        "..kwwwwwwwwk....",
        "..kwrrrrrrwk....",
        "..kwrwrwrrwk....",
        "..kwrrrrrrwk....",
        "..kwwwwwwwwk....",
        "..kkkkkkkkk.....",
        "......kkkkkkk...",
        ".....kwwwwwwwk..",
        ".....kwrrrrrwk..",
        ".....kwrrrrrwk..",
        ".....kwrrrrrwk..",
        ".....kwwwwwwwk..",
        "......kkkkkkk...",
        "................",
      ],
    },
    explorer: {
      p: { k: "#000000", y: "#ffff00", Y: "#c0c000", w: "#ffffff", b: "#0000c0" },
      r: [
        "................",
        ".....yyyyyy.....",
        "....yyyyyyyy....",
        "...yykkkkkkkk...",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyywwwwyyyk.",
        "..kyyywwwwyyyk..",
        "..kyywwwwyyyk...",
        "..kyyywwyyyk....",
        "..kyyyyyyyyk....",
        "..kyyyyyyyk.....",
        "..kkkkkkkk......",
        "................",
        "................",
      ],
    },
    msdos: {
      p: { k: "#000000", w: "#ffffff", g: "#c0c0c0", G: "#e8e8e8" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kggggggggggggk.",
        ".kgkkkkkkkkkkkg.",
        ".kgkwkwwkwwkwkg.",
        ".kgkwkwwkwwkwkg.",
        ".kgkwkwwkwwkwkg.",
        ".kgkwwkwwkwwkkg.",
        ".kgkkkkkkkkkkkg.",
        ".kggggggggggggk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        "......kggk......",
        ".....kggggk.....",
        "....kkkkkkkk....",
        "................",
      ],
    },
    cpl: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8", r: "#ff0000", b: "#0000c0", n: "#00a000" },
      r: [
        "................",
        "....kkkkkkkk....",
        "...kggggggggk...",
        "..kggggggggggk..",
        "..kggggggggggk..",
        "..kgrggggggggk..",
        "..kgrggggbgggk..",
        "..kggggggbgggk..",
        "..kggggggggggk..",
        "..kgnkgnkgnkgk..",
        "..kggggggggggk..",
        "..kggggggggggk..",
        "..kkkkkkkkkkkk..",
        "................",
        "................",
        "................",
      ],
    },
    display: {
      p: { k: "#000000", w: "#e8e8e8", r: "#ff0000", n: "#00a000", b: "#0000c0", g: "#c0c0c0" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kwwwwwwwwwwwwk.",
        ".kwrrrrnnnnbbwk.",
        ".kwrrrrnnnnbbwk.",
        ".kwrrrrnnnnbbwk.",
        ".kwrrrrnnnnbbwk.",
        ".kwwwwwwwwwwwwk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        "......kggk......",
        ".....kggggk.....",
        "....kkkkkkkk....",
        "................",
        "................",
        "................",
      ],
    },
    datetime: {
      p: { k: "#000000", w: "#ffffff", G: "#c0c0c0", b: "#000080" },
      r: [
        "................",
        "...kkkkkkkkk....",
        "..kwwwwwwwwwk...",
        ".kwwwwwwwwwwwk..",
        ".kwwwwkwwwwwwk..",
        ".kwwwwkwkwwwwk..",
        ".kwwwwkwkwwwwk..",
        ".kwwwwwwkwwwk...",
        ".kwwwwwwwwwwwk..",
        ".kwwwwwwwwwwwk..",
        "..kwwwwwwwwwk...",
        "...kkkkkkkkk....",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    system: {
      p: { k: "#000000", w: "#e8e8e8", c: "#00a0c0", r: "#ff0000", g: "#c0c0c0" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kwwwwwwwwwwwwk.",
        ".kwccccccccccwk.",
        ".kwccccccccccwk.",
        ".kwccccccccccwk.",
        ".kwccccrccccwk..",
        ".kwccccccccccwk.",
        ".kwwwwwwwwwwwwk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        "......kggk......",
        ".....kggggk.....",
        "....kkkkkkkk....",
        "................",
        "................",
      ],
    },
    help: {
      p: { k: "#000000", b: "#000080", B: "#0000c0", y: "#ffff00", w: "#ffffff" },
      r: [
        "................",
        "...kkkkkkkk.....",
        "..kbbbbbbbbk....",
        "..kbbybbbbbk....",
        "..kbbybbbbbk....",
        "..kbbbbbbbbk....",
        "..kbbbbbybbk....",
        "..kbbbbbybbk....",
        "..kbbbbbbbbk....",
        "..kbbbbbybbk....",
        "..kbbbbbbbbk....",
        "..kkkkkkkkk.....",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    run: {
      p: { k: "#000000", w: "#ffffff", n: "#00a000", g: "#c0c0c0" },
      r: [
        "................",
        "..kkkkkkkkkk....",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwnnk...",
        ".kwwwwwwwnnnk...",
        ".kwwwwwwwwwnk...",
        ".kwwwwwwwwwwk...",
        ".kkkkkkkkkkkk...",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    shutdown: {
      p: { k: "#000000", w: "#e8e8e8", c: "#008080", r: "#ff0000", g: "#c0c0c0" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kwwwwwwwwwwwwk.",
        ".kwccccccccccwk.",
        ".kwccrrrrrrccwk.",
        ".kwccrrrrrrccwk.",
        ".kwccccccccccwk.",
        ".kwccccccccccwk.",
        ".kwwwwwwwwwwwwk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        "......kggk......",
        ".....kggggk.....",
        "....kkkkkkkk....",
        "................",
        "................",
      ],
    },
    folder: {
      p: { k: "#000000", y: "#ffff00", Y: "#c0c000" },
      r: [
        "................",
        ".....yyyyyy.....",
        "....yyyyyyyy....",
        "...yykkkkkkkk...",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kyyyyyyyyyyyk.",
        "..kkkkkkkkkkkk..",
        "................",
      ],
    },
    txtfile: {
      p: { k: "#000000", w: "#ffffff", b: "#0000a0" },
      r: [
        "................",
        "...wwwwkkk......",
        "..wwwwwkwwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wbbbbbbwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..kkkkkkkkk.....",
        "................",
        "................",
      ],
    },
    appfile: {
      p: { k: "#000000", w: "#ffffff", b: "#000080", B: "#0000c0", g: "#c0c0c0" },
      r: [
        "................",
        "...wwwwkkk......",
        "..wwwwwkwwk.....",
        "..wwwwwwwwk.....",
        "..wwkkkkkkwk....",
        "..wkwwwwwwk.....",
        "..wkwwwwwwk.....",
        "..wkwwwwwwk.....",
        "..wkwwwwwwk.....",
        "..wkwwwwwwk.....",
        "..wkkkkkkkk.....",
        "..wwwwwwwwk.....",
        "..wwwwwwwwk.....",
        "..kkkkkkkkk.....",
        "................",
        "................",
      ],
    },
    floppy: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8", b: "#0000c0", w: "#ffffff" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kbbbbbbbbbbbbk.",
        ".kbwwwwwwwwwwbk.",
        ".kbwwwwwwwwwwbk.",
        ".kbwwwwwwwwwwbk.",
        ".kbbbbbbbbbbbbk.",
        ".kggggggggggggk.",
        ".kggkkkkkkkkggk.",
        ".kggkkkkkkkkggk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
      ],
    },
    drive: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8", n: "#00a000", D: "#808080" },
      r: [
        "................",
        "..kkkkkkkkkkkk..",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kgnkggggggggGk.",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kggggggggggggk.",
        ".kDDDDDDDDDDDDk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    cdrom: {
      p: { k: "#000000", w: "#ffffff", G: "#c0c0c0", g: "#808080", r: "#ff0000", b: "#0000ff", n: "#00a000", y: "#ffff00" },
      r: [
        "................",
        "...kkkkkkkkk....",
        "..kwwwwwwwwwk...",
        ".kwwrrnnyywwk...",
        ".kwwrrnnyywwk...",
        ".kwwwwwwwwwwk...",
        ".kwGGGGGGGGGwk..",
        ".kwGgggggggGwk..",
        "..kGGGGGGGGGk...",
        "...kkkkkkkkk....",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    mouse: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8", w: "#ffffff" },
      r: [
        "................",
        "......k.........",
        "...kkkkkkkk.....",
        "..kggggggggk....",
        "..kgwwwwwwgk....",
        "..kgwwwwwwgk....",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kkkkkkkkkk....",
        "......kk........",
        "....kkkk........",
        "................",
        "................",
      ],
    },
    keyboard: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8" },
      r: [
        "................",
        "................",
        "................",
        "................",
        "..kkkkkkkkkkkk..",
        ".kggggggggggggk.",
        ".kGkGkGkGkGkGk..",
        ".kGkGkGkGkGkGk..",
        ".kGkGkGkGkGkGk..",
        ".kGkGkGkGkGkGk..",
        ".kggggggggggggk.",
        "..kkkkkkkkkkkk..",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    speaker: {
      p: { k: "#000000", g: "#c0c0c0", G: "#e8e8e8" },
      r: [
        "................",
        "................",
        "................",
        "................",
        ".kkkk...........",
        ".kGkkkk.........",
        ".kGkkkGkk.......",
        ".kGkkkkGkGk.....",
        ".kGkkkkGkGk.....",
        ".kGkkkGkk.......",
        ".kGkkkk.........",
        ".kkkk...........",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    addremove: {
      p: { k: "#000000", w: "#ffffff", n: "#00a000", G: "#c0c0c0" },
      r: [
        "................",
        "................",
        "..kkkkkkkkkk....",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kwwwwkkwwwwk...",
        ".kwwwknnkwwwk...",
        ".kwwwknnkwwwk...",
        ".kwwwwkkwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kkkkkkkkkkkk...",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    fonts: {
      p: { k: "#000000", w: "#ffffff", b: "#0000c0" },
      r: [
        "................",
        "................",
        "................",
        "...kkkkkkkk.....",
        "..kwwwwwwwwk....",
        "..kwwkwwkwwk....",
        "..kwwkwwkwwk....",
        "..kwwwwwwwwk....",
        "..kwwkwwkwwk....",
        "..kwwkwwkwwk....",
        "..kwwwwwwwwk....",
        "..kkkkkkkkk.....",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    printer: {
      p: { k: "#000000", w: "#ffffff", g: "#c0c0c0", G: "#e8e8e8" },
      r: [
        "................",
        "................",
        "..kkkkkkkkkk....",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kkkkkkkkkkkk...",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kgwwwwwwgk....",
        "..kggggggggk....",
        "..kggggggggk....",
        "..kkkkkkkkkk....",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    regional: {
      p: { k: "#000000", g: "#808080", G: "#c0c0c0", b: "#0000c0", n: "#00a000" },
      r: [
        "................",
        "................",
        "...ggggggggg....",
        "..gbbbbbbbbg....",
        ".gbbnbbbbbbg....",
        ".gbbbnbbbbbg....",
        ".gbnbbbnbbbg....",
        ".gbbbbbnbbbg....",
        ".gbbbbbbbbbg....",
        "..gbbbbbbbbg....",
        "...ggggggggg....",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    multimedia: {
      p: { k: "#000000", w: "#e8e8e8", c: "#008080", g: "#c0c0c0", W: "#c0ffff" },
      r: [
        "................",
        "................",
        "..kkkkkkkkkkkk..",
        ".kwwwwwwwwwwwwk.",
        ".kwccccccccccwk.",
        ".kwccWcccWccWk..",
        ".kwccWcccWccWk..",
        ".kwccccccccccwk.",
        ".kwwwwwwwwwwwwk.",
        "..kkkkkkkkkkkk..",
        "......kkkk......",
        ".....kggggk.....",
        "....kggggggk....",
        "...kkkkkkkkkk...",
        "................",
        "................",
      ],
    },
    taskbar: {
      p: { k: "#000000", w: "#ffffff", g: "#c0c0c0", G: "#e8e8e8" },
      r: [
        "................",
        "................",
        "..kkkkkkkkkk....",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kwwwwwwwwwwk...",
        ".kkkkkkkkkkkk...",
        ".kggkggkggkggk..",
        ".kggkggkggkggk..",
        ".kkkkkkkkkkkk...",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
      ],
    },
    find: {
      p: { k: "#000000", w: "#ffffff", G: "#c0c0c0", b: "#0000c0" },
      r: [
        "................",
        "................",
        "....kkkkkk......",
        "...kwwwwwwk.....",
        "..kwwwwwwwwk....",
        "..kwwbwwwwwwk...",
        "..kwwwwwwwwk....",
        "..kwwwwwwwwk....",
        "...kwwwwwwk.....",
        "....kkkkkk......",
        "......kkkk.....",
        ".....kkkkk......",
        "....kkkkk.......",
        "................",
        "................",
        "................",
      ],
    },
    msgerror: {
      p: { k: "#000000", w: "#ffffff", r: "#ff0000" },
      r: [
        "................",
        "................",
        "...rrrrrrrr.....",
        "..rrrrrrrrrr....",
        ".rrrrrrrrrrrr...",
        ".rrwwrrrrwwrr...",
        ".rrwwrrrrwwrr...",
        ".rrrrwwwwrrrr...",
        ".rrrrwwwwrrrr...",
        ".rrwwrrrrwwrr...",
        ".rrwwrrrrwwrr...",
        ".rrrrrrrrrrrr...",
        "..rrrrrrrrrr....",
        "...rrrrrrrr.....",
        "................",
        "................",
      ],
    },
    msgwarning: {
      p: { k: "#000000", w: "#ffffff", y: "#ffff00" },
      r: [
        "................",
        "................",
        "......yy........",
        ".....yyyy.......",
        ".....yyyy.......",
        "....ykyyyy......",
        "....ykyyyy......",
        "...ykykyyyy.....",
        "...ykykyyyy.....",
        "..ykyykyyyy.....",
        "..ykyykyyyy.....",
        ".ykyyykyyyy.....",
        ".yyyyyyyyyy.....",
        "..yyyyyyyy......",
        "................",
        "................",
      ],
    },
    msginfo: {
      p: { k: "#000000", w: "#ffffff", b: "#0000c0" },
      r: [
        "................",
        "................",
        "...bbbbbbbb.....",
        "..bbbbbbbbbb....",
        ".bbbbbbbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbbbbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbbbbbbbbb...",
        "..bbbbbbbbbb....",
        "...bbbbbbbb.....",
        "................",
        "................",
      ],
    },
    msgquestion: {
      p: { k: "#000000", w: "#ffffff", b: "#0000c0" },
      r: [
        "................",
        "................",
        "...bbbbbbbb.....",
        "..bbbbbbbbbb....",
        ".bbbbwwbbbbbb...",
        ".bbbwwwwbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbbbbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbwwbbbbbb...",
        ".bbbbbbbbbbbb...",
        "..bbbbbbbbbb....",
        "...bbbbbbbb.....",
        "................",
        "................",
      ],
    },
  };
  W95.ICONS = ICONS;

  W95.icon = function (name, size) {
    let n = name;
    if (typeof n === "string" && n.startsWith("msg-")) {
      const map = {
        "msg-error": "msgerror", "msg-warning": "msgwarning",
        "msg-info": "msginfo", "msg-question": "msgquestion",
        "msg-run": "run", "msg-folder": "folder", "msg-paint": "paint",
        "msg-solitaire": "solitaire", "msg-computer": "computer",
        "msg-notepad": "notepad",
      };
      n = map[n] || n.slice(4);
    }
    const def = ICONS[n] || ICONS.txtfile;
    return iconSVG(def, size || 16);
  };

  /* ---------------- app registry ---------------- */
  W95.apps = {};
  W95.registerApp = function (name, def) {
    W95.apps[name] = def;
  };

  W95.openApp = function (name, extra) {
    const def = W95.apps[name];
    if (!def) return null;
    const win = W95.WM.open(Object.assign({
      title: def.title || name,
      icon: def.icon || "appfile",
      width: def.width || 400,
      height: def.height || 300,
      minWidth: def.minWidth || 180,
      minHeight: def.minHeight || 120,
      resizable: def.resizable !== false,
      maximizable: def.maximizable !== false,
      minimizable: def.minimizable !== false,
      className: def.className,
      onClose: def.onClose,
    }, extra || {}));
    try {
      def.create(win);
    } catch (e) {
      console.error("App error: " + name, String(e && e.stack || e));
    }
    return win;
  };

  /* ---------------- sound (optional WebAudio) ---------------- */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, start, dur, type, vol, dest) {
    const ctx = dest.context;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.value = vol || 0.04;
    o.connect(g);
    g.connect(dest);
    o.start(start);
    o.stop(start + dur);
  }
  W95.sound = {
    enabled: true,
    play(name) {
      if (!this.enabled) return;
      const ctx = ensureAudio();
      if (!ctx) return;
      const t = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      switch (name) {
        case "error":
          tone(220, t, 0.22, "square", 0.5, master);
          tone(180, t + 0.22, 0.3, "square", 0.5, master);
          break;
        case "info":
          tone(880, t, 0.09, "sine", 0.7, master);
          tone(1174, t + 0.09, 0.16, "sine", 0.7, master);
          break;
        case "warning":
          tone(392, t, 0.12, "sine", 0.7, master);
          tone(392, t + 0.16, 0.12, "sine", 0.7, master);
          break;
        case "question":
          tone(523, t, 0.1, "sine", 0.7, master);
          tone(659, t + 0.11, 0.2, "sine", 0.7, master);
          break;
        case "ding":
          tone(1318, t, 0.06, "sine", 0.6, master);
          break;
        case "startup": {
          // 近似 Windows 95 开机音
          const notes = [392, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
          notes.forEach((f, i) => tone(f, t + i * 0.14, 0.32, "sine", 0.6, master));
          break;
        }
        case "shutdown": {
          const notes = [1046.5, 783.99, 659.25, 523.25, 392];
          notes.forEach((f, i) => tone(f, t + i * 0.13, 0.3, "sine", 0.6, master));
          break;
        }
      }
    },
  };

  /* ---------------- virtual file system ---------------- */
  function makeFile(name, icon, size, content, mime) {
    return { type: "file", name, icon: icon || "txtfile", size, content: content || "", mime };
  }
  function makeFolder(name, icon, children) {
    return { type: "folder", name, icon: icon || "folder", children: children || [] };
  }

  function seedVFS() {
    const c = makeFolder("(C:)", "drive");
    const myDocs = makeFolder("My Documents", "folder", [
      makeFile("README.txt", "txtfile", 340,
        "欢迎使用 Windows 95 网页模拟器！\r\n\r\n这是一个用 HTML/CSS/JavaScript 还原的\r\nWindows 95 桌面环境。\r\n\r\n- 双击桌面图标打开程序\r\n- 点击左下角“开始”打开开始菜单\r\n- 右键桌面查看属性\r\n- 关闭系统后可以重新开机\r\n\r\nEnjoy!  —— Windows 95 Web Simulator\r\n"),
      makeFile("Letter.txt", "txtfile", 180, "Dear Mom,\r\n\r\nI got Windows 95 today!\r\nIt's amazing.\r\n\r\nLove,\r\nYour child\r\n"),
      makeFile("Scenery.bmp", "bmpfile", 25344, "bmp:scenery"),
    ]);
    const winDir = makeFolder("Windows", "folder", [
      makeFile("NOTEPAD.EXE", "appfile", 34 * 1024, "exe:notepad"),
      makeFile("CALC.EXE", "appfile", 41 * 1024, "exe:calc"),
      makeFile("PBRUSH.EXE", "appfile", 176 * 1024, "exe:paint"),
      makeFile("WINMINE.EXE", "appfile", 22 * 1024, "exe:minesweeper"),
      makeFile("SOL.EXE", "appfile", 90 * 1024, "exe:solitaire"),
      makeFile("EXPLORER.EXE", "appfile", 52 * 1024, "exe:explorer"),
      makeFile("COMMAND.COM", "appfile", 54 * 1024, "exe:msdos"),
      makeFile("CONTROL.EXE", "appfile", 88 * 1024, "exe:control"),
      makeFile("WIN.COM", "appfile", 16 * 1024, "exe:win"),
    ]);
    const progFiles = makeFolder("Program Files", "folder", []);
    const recycled = makeFolder("Recycled", "folder", []);
    const system = makeFolder("System", "folder", [
      makeFile("README.TXT", "txtfile", 210, "This directory contains system files.\r\nDo not delete them!\r\n"),
    ]);
    c.children = [myDocs, winDir, progFiles, recycled, system];
    return {
      drives: {
        "A:": makeFolder("3½ 软盘 (A:)", "floppy", [
          makeFile("AUTOEXEC.BAT", "appfile", 42, "@echo off\r\nprompt $p$g\r\n"),
        ]),
        "C:": c,
        "D:": makeFolder("(D:)", "cdrom", [
          makeFile("README.TXT", "txtfile", 96, "CD-ROM drive D:\r\n"),
        ]),
      },
    };
  }

  let vfs = null;
  function getVFS() {
    if (vfs) return vfs;
    const saved = store.get("vfs");
    if (saved && saved.drives) { vfs = saved; return vfs; }
    vfs = seedVFS();
    return vfs;
  }
  W95.vfs = getVFS;

  function nodeChildren(node) {
    return node.type === "folder" ? node.children : [];
  }
  function findChild(folder, name) {
    return folder.children.find((c) => c.name.toLowerCase() === String(name).toLowerCase());
  }

  // path: "/C:/My Documents/README.txt" or "C:\My Documents\README.txt"
  W95.vfsResolve = function (path) {
    let p = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
    const parts = p.split("/").filter(Boolean);
    if (!parts.length) return null;
    let driveName = parts[0].toUpperCase().endsWith(":") ? parts[0].toUpperCase() : parts[0].toUpperCase() + ":";
    const fs = getVFS();
    let node = fs.drives[driveName];
    if (!node) return null;
    for (let i = 1; i < parts.length; i++) {
      if (!node.children) return null;
      const next = findChild(node, parts[i]);
      if (!next) return null;
      node = next;
    }
    return node;
  };
  W95.vfsGet = function (path) { return W95.vfsResolve(path); };

  W95.vfsList = function (path) {
    const node = W95.vfsResolve(path);
    return node && node.children ? node.children.slice() : [];
  };

  W95.vfsMkdir = function (parentPath, name) {
    const parent = W95.vfsResolve(parentPath);
    if (!parent || parent.type !== "folder") return false;
    if (findChild(parent, name)) return false;
    parent.children.push(makeFolder(name, "folder"));
    W95.vfsSave(); return true;
  };

  W95.vfsWriteFile = function (parentPath, name, content, icon, mime) {
    const parent = W95.vfsResolve(parentPath);
    if (!parent || parent.type !== "folder") return null;
    let f = findChild(parent, name);
    if (!f || f.type !== "file") {
      f = makeFile(name, icon || "txtfile", 0, "", mime);
      parent.children.push(f);
    }
    f.content = content;
    f.size = (content || "").length;
    if (icon) f.icon = icon;
    if (mime) f.mime = mime;
    W95.vfsSave();
    return f;
  };

  W95.vfsDelete = function (path) {
    let p = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
    const parts = p.split("/").filter(Boolean);
    const driveName = parts[0].toUpperCase().endsWith(":") ? parts[0].toUpperCase() : parts[0].toUpperCase() + ":";
    const fs = getVFS();
    const drive = fs.drives[driveName];
    let node = drive, parent = null;
    for (let i = 1; i < parts.length; i++) {
      parent = node;
      if (!node.children) return false;
      const next = findChild(node, parts[i]);
      if (!next) return false;
      node = next;
    }
    if (parent) {
      const idx = parent.children.indexOf(node);
      if (idx >= 0) {
        parent.children.splice(idx, 1);
        const rec = W95.vfsResolve("C:/Recycled");
        if (rec && rec.children) {
          node._orig = path;
          node.name = node.name + "(" + Date.now().toString(36) + ")";
          rec.children.unshift(node);
        }
        W95.vfsSave();
        return true;
      }
    }
    return false;
  };

  W95.vfsRestore = function (path) {
    const node = W95.vfsResolve(path);
    if (!node) return false;
    const orig = node._orig;
    if (!orig) return false;
    const origParent = W95.vfsResolve(orig.slice(0, orig.lastIndexOf("/")));
    if (!origParent || origParent.type !== "folder") return false;
    let cleanName = node.name.replace(/\(\w+\)$/, "");
    // 去掉还原后可能的冲突
    node.name = cleanName;
    delete node._orig;
    const rec = W95.vfsResolve("C:/Recycled");
    if (rec) {
      const i = rec.children.indexOf(node);
      if (i >= 0) rec.children.splice(i, 1);
    }
    origParent.children.push(node);
    W95.vfsSave();
    return true;
  };

  W95.vfsRename = function (path, newName) {
    const node = W95.vfsResolve(path);
    if (!node) return false;
    let p = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
    const parts = p.split("/").filter(Boolean);
    const driveName = parts[0].toUpperCase().endsWith(":") ? parts[0].toUpperCase() : parts[0].toUpperCase() + ":";
    let parent = W95.vfsResolve(driveName + "/" + parts.slice(1, -1).join("/"));
    if (!parent || parent.type !== "folder") return false;
    if (findChild(parent, newName)) return false;
    node.name = newName;
    W95.vfsSave(); return true;
  };

  W95.vfsSave = function () {
    store.set("vfs", getVFS());
  };

  W95.vfsRecycleCount = function () {
    const rec = W95.vfsResolve("C:/Recycled");
    return rec ? rec.children.length : 0;
  };
  W95.vfsEmptyRecycle = function () {
    const rec = W95.vfsResolve("C:/Recycled");
    if (rec) { rec.children = []; W95.vfsSave(); }
  };

  // 根据文件/路径返回打开方式
  W95.openPath = function (path) {
    const node = W95.vfsResolve(path);
    if (!node) return false;
    if (node.type === "folder") {
      W95.openApp("explorer", { path });
      return true;
    }
    const content = node.content || "";
    if (content.startsWith("exe:")) {
      const app = content.slice(4).trim();
      if (W95.apps[app]) { W95.openApp(app); return true; }
      W95.msgbox({ title: "应用程序", text: "无法运行 " + node.name + "：程序未安装。", icon: "error" });
      return false;
    }
    if (content.startsWith("bmp:")) {
      W95.openApp("paint", { path });
      return true;
    }
    W95.openApp("notepad", { path });
    return true;
  };

  /* ---------------- misc ---------------- */
  W95.formatBytes = function (n) {
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
    return n + " 字节";
  };

  W95.randomSerial = function () {
    let s = "";
    for (let i = 0; i < 8; i++) s += Math.floor(Math.random() * 10);
    return s.slice(0, 4) + "-" + s.slice(4);
  };

  // 桌面外观设置（与显示属性联动）
  W95.appearance = {
    get scheme() { return store.get("scheme", "standard"); },
    set scheme(v) { store.set("scheme", v); W95.applyScheme(); },
    get wallpaper() { return store.get("wallpaper", "none"); },
    set wallpaper(v) { store.set("wallpaper", v); W95.applyWallpaper(); },
    get tile() { return store.get("walltile", "center"); },
    set tile(v) { store.set("walltile", v); W95.applyWallpaper(); },
    get screenSaver() { return store.get("screensaver", "none"); },
    set screenSaver(v) { store.set("screensaver", v); },
    get resolution() { return store.get("resolution", "800x600"); },
    set resolution(v) { store.set("resolution", v); W95.applyResolution(); },
    get soundEnabled() { return store.get("sound", true); },
    set soundEnabled(v) { store.set("sound", v); W95.sound.enabled = v; },
  };

  W95.applyScheme = function () {
    const root = document.documentElement;
    const s = W95.appearance.scheme;
    const schemes = {
      standard: {},
      "standard-large": { "--w95-font-size": "14px", "--w95-dialog-font-size": "15px" },
      "high-contrast-black": {
        "--w95-face": "#000000", "--w95-face-light": "#404040",
        "--w95-face-dark": "#ffffff", "--w95-face-black": "#ffffff",
        "--w95-shadow": "#808080", "--w95-title-active1": "#000000",
        "--w95-title-active2": "#000000", "--w95-title-text": "#ffffff",
        "--w95-desktop": "#000000", "--w95-hover": "#000000",
        "--w95-hover-text": "#ffffff",
      },
      "high-contrast-white": {
        "--w95-face": "#ffffff", "--w95-face-light": "#ffffff",
        "--w95-face-dark": "#808080", "--w95-face-black": "#000000",
        "--w95-shadow": "#000000", "--w95-title-active1": "#ffffff",
        "--w95-title-active2": "#ffffff", "--w95-title-text": "#000000",
        "--w95-desktop": "#ffffff", "--w95-desktop-text": "#000000",
        "--w95-hover": "#000080", "--w95-hover-text": "#ffffff",
      },
      "high-contrast-green": {
        "--w95-face": "#c0c0c0", "--w95-title-active1": "#008000",
        "--w95-title-active2": "#00c000", "--w95-desktop": "#004000",
      },
      "plum": {
        "--w95-title-active1": "#800080", "--w95-title-active2": "#c080c0",
        "--w95-desktop": "#800080",
      },
      "rose": {
        "--w95-title-active1": "#800000", "--w95-title-active2": "#c08080",
        "--w95-desktop": "#800000",
      },
      "storm": {
        "--w95-title-active1": "#404040", "--w95-title-active2": "#a0a0a0",
        "--w95-desktop": "#808080",
      },
    };
    const vars = schemes[s] || {};
    for (const k in vars) root.style.setProperty(k, vars[k]);
    // 重置为默认后再应用，避免残留
    if (s === "standard") {
      root.style.removeProperty("--w95-font-size");
      root.style.removeProperty("--w95-dialog-font-size");
    }
    const desktop = W95.$("#desktop");
    if (desktop) desktop.style.background = "var(--w95-desktop)";
  };

  const WALLPAPERS = {
    none: null,
    clouds: {
      colors: ["#1084d0", "#9adcff"],
      draw(ctx, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#5ab8e8");
        g.addColorStop(1, "#1084d0");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,.85)";
        for (let i = 0; i < 26; i++) {
          const x = ((i * 331) % 1000) / 1000 * (w + 220) - 110;
          const y = ((i * 173) % 1000) / 1000 * (h * 0.75);
          const r = 18 + ((i * 97) % 50);
          ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
          ctx.arc(x + r * 0.9, y + r * 0.35, r * 0.65, 0, 7);
          ctx.arc(x - r * 0.9, y + r * 0.35, r * 0.6, 0, 7);
          ctx.fill();
        }
      },
    },
    bubbles: {
      colors: ["#004040", "#008080"],
      draw(ctx, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#004040");
        g.addColorStop(1, "#008080");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 60; i++) {
          const x = ((i * 397) % 1000) / 1000 * w;
          const y = ((i * 263) % 1000) / 1000 * h;
          const r = 3 + ((i * 61) % 14);
          ctx.strokeStyle = "rgba(200,255,255,.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,.35)";
          ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, 7); ctx.fill();
        }
      },
    },
    setup: {
      colors: ["#000080", "#0000c0"],
      draw(ctx, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#000080");
        g.addColorStop(1, "#0000c0");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      },
    },
    tiles: {
      colors: ["#c0c0c0", "#ffffff"],
      draw(ctx, w, h) {
        ctx.fillStyle = "#c0c0c0"; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1;
        const s = 60;
        for (let x = 0; x < w; x += s) {
          for (let y = 0; y < h; y += s) {
            ctx.strokeRect(x + 0.5, y + 0.5, s, s);
          }
        }
      },
    },
    stitched: {
      colors: ["#c0c0c0", "#000080"],
      draw(ctx, w, h) {
        ctx.fillStyle = "#c0c0c0"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#000080";
        for (let x = 0; x < w; x += 20) {
          for (let y = 0; y < h; y += 20) {
            ctx.fillRect(x, y, 8, 8);
          }
        }
      },
    },
  };
  W95.WALLPAPERS = WALLPAPERS;

  W95.applyWallpaper = function () {
    const desktop = W95.$("#desktop");
    if (!desktop) return;
    const name = W95.appearance.wallpaper;
    const def = WALLPAPERS[name];
    let old = desktop.querySelector(".wallpaper-canvas");
    if (old) old.remove();
    if (!def) {
      desktop.style.background = "var(--w95-desktop)";
      return;
    }
    desktop.style.background = "var(--w95-desktop)";
    const cv = W95.el("canvas", { class: "wallpaper-canvas" });
    cv.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
    desktop.insertBefore(cv, desktop.firstChild);
    const render = () => {
      const w = window.innerWidth, h = window.innerHeight;
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      if (W95.appearance.tile === "tile") {
        const c2 = document.createElement("canvas");
        const tileSize = 128;
        c2.width = tileSize; c2.height = tileSize;
        const tctx = c2.getContext("2d");
        def.draw(tctx, tileSize, tileSize);
        const pat = ctx.createPattern(c2, "repeat");
        ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h);
      } else if (W95.appearance.tile === "stretch") {
        def.draw(ctx, w, h);
      } else {
        // center
        def.draw(ctx, w, h);
      }
    };
    render();
    window.addEventListener("resize", render);
  };

  W95.applyResolution = function () {
    const res = W95.appearance.resolution;
    let scale = 1;
    if (res === "640x480") scale = 0.8;
    else if (res === "800x600") scale = 1;
    else if (res === "1024x768") scale = 1.2;
    const desktop = W95.$("#desktop");
    if (desktop) {
      desktop.style.zoom = scale;
      desktop.style.width = "100%";
      desktop.style.height = "100%";
    }
    if (window.__w95ResolutionScale !== scale) {
      window.__w95ResolutionScale = scale;
      // 让窗口管理器重排
      if (W95.WM) W95.WM.layoutMaximized();
    }
  };

  W95.applyDesktopSettings = function () {
    W95.applyScheme();
    W95.applyWallpaper();
    W95.applyResolution();
    W95.sound.enabled = W95.appearance.soundEnabled;
  };

  W95.now = function () {
    return new Date();
  };

  // 键盘辅助
  W95.focusOutline = function (e) {
    e.classList.add("dotted-focus");
  };

})();
