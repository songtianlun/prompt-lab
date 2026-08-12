// ============================================================
// App Registry - defines all available applications
// Icons are inline SVG data URIs for crisp pixel-art look
// ============================================================

import Notepad from './apps/Notepad.svelte'
import Paint from './apps/Paint.svelte'
import Minesweeper from './apps/Minesweeper.svelte'
import Calculator from './apps/Calculator.svelte'
import MyComputer from './apps/MyComputer.svelte'
import Settings from './apps/Settings.svelte'
import About from './apps/About.svelte'
import Explorer from './apps/Explorer.svelte'

// Helper: build a small pixel-art SVG icon
function svgIcon(paths, bg = 'none') {
  const inner = paths
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${bg !== 'none' ? `<rect width="32" height="32" fill="${bg}"/>` : ''}${inner}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const apps = {
  myComputer: {
    id: 'myComputer',
    name: '我的电脑',
    icon: svgIcon(
      `<rect x="4" y="6" width="24" height="16" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
       <rect x="6" y="8" width="20" height="12" fill="#008080"/>
       <rect x="8" y="10" width="16" height="8" fill="#00a0a0"/>
       <rect x="10" y="24" width="12" height="2" fill="#808080"/>
       <rect x="6" y="26" width="20" height="2" fill="#c0c0c0" stroke="#000" stroke-width="1"/>`,
      'none'
    ),
    component: MyComputer,
    defaultSize: { width: 560, height: 400 },
    singleton: true
  },
  notepad: {
    id: 'notepad',
    name: '记事本',
    icon: svgIcon(
      `<rect x="6" y="4" width="20" height="24" fill="#ffffff" stroke="#000" stroke-width="1"/>
       <rect x="6" y="4" width="20" height="3" fill="#000080"/>
       <line x1="9" y1="11" x2="23" y2="11" stroke="#000" stroke-width="1"/>
       <line x1="9" y1="14" x2="23" y2="14" stroke="#000" stroke-width="1"/>
       <line x1="9" y1="17" x2="23" y2="17" stroke="#000" stroke-width="1"/>
       <line x1="9" y1="20" x2="19" y2="20" stroke="#000" stroke-width="1"/>
       <line x1="9" y1="23" x2="21" y2="23" stroke="#000" stroke-width="1"/>`
    ),
    component: Notepad,
    defaultSize: { width: 500, height: 380 }
  },
  paint: {
    id: 'paint',
    name: '画图',
    icon: svgIcon(
      `<rect x="4" y="6" width="24" height="18" fill="#ffffff" stroke="#000" stroke-width="1"/>
       <rect x="4" y="6" width="24" height="3" fill="#c0c0c0"/>
       <circle cx="12" cy="16" r="3" fill="#ff0000"/>
       <circle cx="18" cy="16" r="3" fill="#00ff00"/>
       <circle cx="24" cy="16" r="3" fill="#0000ff"/>
       <rect x="8" y="21" width="16" height="2" fill="#808080"/>`
    ),
    component: Paint,
    defaultSize: { width: 620, height: 480 }
  },
  minesweeper: {
    id: 'minesweeper',
    name: '扫雷',
    icon: svgIcon(
      `<rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
       <circle cx="16" cy="16" r="6" fill="#000"/>
       <rect x="14" y="8" width="4" height="4" fill="#ff0000"/>
       <line x1="16" y1="6" x2="16" y2="10" stroke="#000" stroke-width="2"/>
       <line x1="10" y1="16" x2="22" y2="16" stroke="#000" stroke-width="1"/>
       <line x1="16" y1="10" x2="16" y2="22" stroke="#000" stroke-width="1"/>`
    ),
    component: Minesweeper,
    defaultSize: { width: 280, height: 380 },
    resizable: false,
    maximizable: false
  },
  calculator: {
    id: 'calculator',
    name: '计算器',
    icon: svgIcon(
      `<rect x="6" y="4" width="20" height="24" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
       <rect x="8" y="6" width="16" height="5" fill="#80a080"/>
       <rect x="8" y="13" width="4" height="3" fill="#404040"/>
       <rect x="14" y="13" width="4" height="3" fill="#404040"/>
       <rect x="20" y="13" width="4" height="3" fill="#404040"/>
       <rect x="8" y="18" width="4" height="3" fill="#404040"/>
       <rect x="14" y="18" width="4" height="3" fill="#404040"/>
       <rect x="20" y="18" width="4" height="3" fill="#404040"/>
       <rect x="8" y="23" width="4" height="3" fill="#404040"/>
       <rect x="14" y="23" width="4" height="3" fill="#ff0000"/>
       <rect x="20" y="23" width="4" height="3" fill="#404040"/>`
    ),
    component: Calculator,
    defaultSize: { width: 240, height: 300 },
    resizable: false,
    maximizable: false
  },
  explorer: {
    id: 'explorer',
    name: '文件管理器',
    icon: svgIcon(
      `<rect x="4" y="8" width="24" height="18" fill="#ffcc00" stroke="#000" stroke-width="1"/>
       <rect x="4" y="8" width="24" height="3" fill="#ffaa00"/>
       <rect x="8" y="12" width="16" height="12" fill="#ffe080"/>
       <rect x="10" y="14" width="12" height="1" fill="#806020"/>
       <rect x="10" y="17" width="12" height="1" fill="#806020"/>
       <rect x="10" y="20" width="8" height="1" fill="#806020"/>`
    ),
    component: Explorer,
    defaultSize: { width: 560, height: 400 }
  },
  settings: {
    id: 'settings',
    name: '控制面板',
    icon: svgIcon(
      `<rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
       <rect x="6" y="6" width="20" height="20" fill="#808080"/>
       <circle cx="16" cy="16" r="8" fill="#404040"/>
       <circle cx="16" cy="16" r="3" fill="#c0c0c0"/>
       <rect x="14" y="6" width="4" height="4" fill="#ff0000"/>
       <rect x="22" y="14" width="4" height="4" fill="#00ff00"/>
       <rect x="14" y="22" width="4" height="4" fill="#0000ff"/>
       <rect x="6" y="14" width="4" height="4" fill="#ffff00"/>`
    ),
    component: Settings,
    defaultSize: { width: 480, height: 400 },
    singleton: true
  },
  about: {
    id: 'about',
    name: '关于 Windows 95',
    icon: svgIcon(
      `<rect x="4" y="4" width="12" height="12" fill="#ff0000"/>
       <rect x="16" y="4" width="12" height="12" fill="#00ff00"/>
       <rect x="4" y="16" width="12" height="12" fill="#0000ff"/>
       <rect x="16" y="16" width="12" height="12" fill="#ffff00"/>`
    ),
    component: About,
    defaultSize: { width: 400, height: 320 },
    singleton: true,
    resizable: false,
    maximizable: false
  }
}

// Desktop icons (subset shown on desktop)
export const desktopIcons = [
  { appId: 'myComputer', label: '我的电脑' },
  { appId: 'explorer', label: '文件管理器' },
  { appId: 'notepad', label: '记事本' },
  { appId: 'paint', label: '画图' },
  { appId: 'minesweeper', label: '扫雷' },
  { appId: 'calculator', label: '计算器' },
  { appId: 'settings', label: '控制面板' }
]

// Start menu programs
export const startMenuPrograms = [
  { appId: 'notepad', label: '记事本', group: '附件' },
  { appId: 'paint', label: '画图', group: '附件' },
  { appId: 'calculator', label: '计算器', group: '附件' },
  { appId: 'explorer', label: '文件管理器', group: '附件' },
  { appId: 'minesweeper', label: '扫雷', group: '游戏' },
  { appId: 'settings', label: '控制面板', group: '设置' },
  { appId: 'about', label: '关于 Windows 95', group: '帮助' }
]
