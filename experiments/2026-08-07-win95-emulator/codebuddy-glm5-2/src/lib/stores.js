import { writable } from 'svelte/store'

// ============================================================
// Window Manager Store
// Manages all open windows: open/close/focus/minimize/maximize/z-order
// ============================================================

let zCounter = 100
let idCounter = 0

function createWindowManager() {
  const { subscribe, set, update } = writable([])

  /**
   * Open a new window (or focus existing singleton).
   * @param {Object} opts - { app, title, icon, width, height, x, y, singleton, resizable, props }
   */
  function open(opts) {
    const {
      app,
      title = 'Untitled',
      icon = '',
      width = 480,
      height = 360,
      x = null,
      y = null,
      singleton = false,
      resizable = true,
      maximizable = true,
      props = {}
    } = opts

    // If singleton and already open, just focus it
    if (singleton) {
      let found = null
      update(wins => {
        found = wins.find(w => w.app === app)
        return wins
      })
      if (found) {
        focus(found.id)
        // un-minimize if needed
        if (found.minimized) toggleMinimize(found.id)
        return found.id
      }
    }

    const id = ++idCounter
    const z = ++zCounter

    // Cascade window position
    const offset = (idCounter % 8) * 24
    const win = {
      id,
      app,
      title,
      icon,
      width,
      height,
      x: x !== null ? x : Math.max(10, 40 + offset),
      y: y !== null ? y : Math.max(10, 40 + offset),
      z,
      minimized: false,
      maximized: false,
      resizable,
      maximizable,
      props,
      // Store pre-maximize geometry
      prevX: null,
      prevY: null,
      prevW: null,
      prevH: null
    }

    update(wins => [...wins, win])
    return id
  }

  function close(id) {
    update(wins => wins.filter(w => w.id !== id))
  }

  function focus(id) {
    update(wins =>
      wins.map(w => {
        if (w.id === id) {
          return { ...w, z: ++zCounter, minimized: false }
        }
        return w
      })
    )
  }

  function toggleMinimize(id) {
    update(wins =>
      wins.map(w => {
        if (w.id === id) {
          return { ...w, minimized: !w.minimized }
        }
        return w
      })
    )
  }

  function minimize(id) {
    update(wins =>
      wins.map(w => (w.id === id ? { ...w, minimized: true } : w))
    )
  }

  function toggleMaximize(id) {
    update(wins =>
      wins.map(w => {
        if (w.id === id) {
          if (w.maximized) {
            return {
              ...w,
              maximized: false,
              x: w.prevX ?? w.x,
              y: w.prevY ?? w.y,
              width: w.prevW ?? w.width,
              height: w.prevH ?? w.height
            }
          } else {
            return {
              ...w,
              maximized: true,
              prevX: w.x,
              prevY: w.y,
              prevW: w.width,
              prevH: w.height
            }
          }
        }
        return w
      })
    )
  }

  function move(id, x, y) {
    update(wins =>
      wins.map(w => (w.id === id ? { ...w, x, y } : w))
    )
  }

  function resize(id, width, height) {
    update(wins =>
      wins.map(w => (w.id === id ? { ...w, width, height } : w))
    )
  }

  function setTitle(id, title) {
    update(wins =>
      wins.map(w => (w.id === id ? { ...w, title } : w))
    )
  }

  function closeAll() {
    set([])
  }

  return {
    subscribe,
    open,
    close,
    focus,
    minimize,
    toggleMinimize,
    toggleMaximize,
    move,
    resize,
    setTitle,
    closeAll
  }
}

export const windows = createWindowManager()

// ============================================================
// Settings Store - wallpaper, theme color, etc.
// ============================================================

export const settings = writable({
  wallpaper: 'teal', // teal, blue, clouds, forest, pattern
  accent: '#000080'
})

// ============================================================
// Start Menu Store
// ============================================================

export const startMenuOpen = writable(false)

// ============================================================
// Power State Store - state machine for boot/shutdown
// States: 'on' | 'shutdown-dialog' | 'shutting-down' | 'off' | 'booting'
// ============================================================

export const powerState = writable('on')

// Flag: when true, shutdown animation completes into boot instead of off
export const restartRequested = writable(false)
