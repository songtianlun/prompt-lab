import { writable, derived, get } from 'svelte/store'

/* ---------- App registry ----------
   Each app declares how it opens as a window.
   `component` is set lazily in App.svelte to avoid circular imports.
*/
export const APPS = {
  notepad: {
    id: 'notepad',
    title: '无标题 - 记事本',
    icon: 'notepad',
    width: 480,
    height: 360,
    resizable: true
  },
  minesweeper: {
    id: 'minesweeper',
    title: '扫雷',
    icon: 'mine',
    width: 280,
    height: 360,
    resizable: false
  },
  mycomputer: {
    id: 'mycomputer',
    title: '我的电脑',
    icon: 'computer',
    width: 560,
    height: 400,
    resizable: true
  },
  about: {
    id: 'about',
    title: '关于 Windows 95',
    icon: 'info',
    width: 380,
    height: 260,
    resizable: false
  },
  explorer: {
    id: 'explorer',
    title: '欢迎',
    icon: 'explorer',
    width: 560,
    height: 400,
    resizable: true
  }
}

/* ---------- Window manager ---------- */

let zCounter = 10
let idCounter = 1

function createWindowManager() {
  const { subscribe, update } = writable([])

  function open(appId, payload = {}) {
    const app = APPS[appId]
    if (!app) return

    // If a singleton-ish window for this app already exists, just focus it.
    const existing = get({ subscribe }).find((w) => w.appId === appId && app.single !== false)
    if (existing && appId !== 'notepad') {
      focus(existing.id)
      if (existing.minimized) toggleMinimize(existing.id)
      return
    }

    const state = {
      id: idCounter++,
      appId,
      title: app.title,
      icon: app.icon,
      x: 40 + (idCounter % 6) * 24,
      y: 30 + (idCounter % 6) * 22,
      width: app.width,
      height: app.height,
      zIndex: ++zCounter,
      minimized: false,
      maximized: false,
      resizable: app.resizable !== false,
      prevRect: null,
      payload
    }
    update((wins) => [...wins, state])
    setActive(state.id)
  }

  function close(id) {
    update((wins) => wins.filter((w) => w.id !== id))
  }

  function focus(id) {
    update((wins) =>
      wins.map((w) =>
        w.id === id ? { ...w, zIndex: ++zCounter, minimized: false } : w
      )
    )
    setActive(id)
  }

  function setActive(id) {
    activeId.set(id)
  }

  function toggleMinimize(id) {
    update((wins) =>
      wins.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    )
    // focus top-most non-minimized
    const wins = get({ subscribe })
    const top = wins.filter((w) => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0]
    activeId.set(top ? top.id : null)
  }

  function toggleMaximize(id) {
    update((wins) =>
      wins.map((w) => {
        if (w.id !== id) return w
        if (w.maximized) {
          const r = w.prevRect || { x: 60, y: 50, width: w.width, height: w.height }
          return { ...w, maximized: false, ...r }
        }
        return {
          ...w,
          maximized: true,
          prevRect: { x: w.x, y: w.y, width: w.width, height: w.height }
        }
      })
    )
    focus(id)
  }

  function move(id, x, y) {
    update((wins) => wins.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }

  function resize(id, width, height) {
    update((wins) => wins.map((w) => (w.id === id ? { ...w, width, height } : w)))
  }

  function setTitle(id, title) {
    update((wins) => wins.map((w) => (w.id === id ? { ...w, title } : w)))
  }

  return {
    subscribe,
    open,
    close,
    focus,
    toggleMinimize,
    toggleMaximize,
    move,
    resize,
    setTitle
  }
}

export const windows = createWindowManager()

export const activeId = writable(null)

/* Start menu open state */
export const startMenuOpen = writable(false)
