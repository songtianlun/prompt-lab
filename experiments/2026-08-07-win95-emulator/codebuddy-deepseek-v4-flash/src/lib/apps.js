// 应用注册表：定义所有可启动的应用
export const apps = {
  notepad: {
    id: 'notepad',
    name: '记事本',
    icon: '📝',
    component: 'Notepad',
    defaultSize: { width: 480, height: 360 }
  },
  paint: {
    id: 'paint',
    name: '画图',
    icon: '🎨',
    component: 'Paint',
    defaultSize: { width: 640, height: 480 }
  },
  calculator: {
    id: 'calculator',
    name: '计算器',
    icon: '🧮',
    component: 'Calculator',
    defaultSize: { width: 280, height: 360 }
  },
  minesweeper: {
    id: 'minesweeper',
    name: '扫雷',
    icon: '💣',
    component: 'Minesweeper',
    defaultSize: { width: 300, height: 400 }
  },
  explorer: {
    id: 'explorer',
    name: '资源管理器',
    icon: '📁',
    component: 'Explorer',
    defaultSize: { width: 560, height: 420 }
  },
  solitaire: {
    id: 'solitaire',
    name: '纸牌',
    icon: '🃏',
    component: 'Solitaire',
    defaultSize: { width: 640, height: 480 }
  },
  settings: {
    id: 'settings',
    name: '设置',
    icon: '⚙️',
    component: 'Settings',
    defaultSize: { width: 560, height: 440 }
  },
  display: {
    id: 'display',
    name: '显示属性',
    icon: '🖥️',
    component: 'DisplaySettings',
    defaultSize: { width: 480, height: 420 }
  },
  sound: {
    id: 'sound',
    name: '声音',
    icon: '🔊',
    component: 'SoundSettings',
    defaultSize: { width: 420, height: 360 }
  },
  system: {
    id: 'system',
    name: '系统属性',
    icon: '💻',
    component: 'SystemSettings',
    defaultSize: { width: 480, height: 420 }
  },
  about: {
    id: 'about',
    name: '关于',
    icon: 'ℹ️',
    component: 'About',
    defaultSize: { width: 400, height: 320 }
  },
  help: {
    id: 'help',
    name: '帮助',
    icon: '❓',
    component: 'Help',
    defaultSize: { width: 480, height: 400 }
  },
  clock: {
    id: 'clock',
    name: '时钟',
    icon: '🕐',
    component: 'Clock',
    defaultSize: { width: 300, height: 220 }
  },
  cmd: {
    id: 'cmd',
    name: 'MS-DOS 提示符',
    icon: '💻',
    component: 'Cmd',
    defaultSize: { width: 560, height: 400 }
  }
};
