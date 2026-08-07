let nextId = 1

export function createWindowManager() {
  const state = $state({
    windows: [],
    z: 10,
    startOpen: false,
  })

  function open(opts) {
    const id = nextId++
    const count = state.windows.length
    state.windows.push({
      id,
      title: opts.title,
      app: opts.app,
      icon: opts.icon,
      x: 60 + (count * 24) % 120,
      y: 40 + (count * 20) % 80,
      width: opts.width,
      height: opts.height,
      minimized: false,
      maximized: false,
      z: 0,
      props: opts.props || {},
    })
    focus(id)
    return id
  }

  function focus(id) {
    state.z += 1
    const w = state.windows.find((x) => x.id === id)
    if (w) {
      w.z = state.z
      w.minimized = false
    }
  }

  function close(id) {
    const i = state.windows.findIndex((x) => x.id === id)
    if (i !== -1) state.windows.splice(i, 1)
  }

  function minimize(id) {
    const w = state.windows.find((x) => x.id === id)
    if (w) w.minimized = true
  }

  function toggleMaximize(id) {
    const w = state.windows.find((x) => x.id === id)
    if (w) w.maximized = !w.maximized
  }

  function toggleTask(id) {
    const w = state.windows.find((x) => x.id === id)
    if (!w) return
    if (w.minimized) {
      focus(id)
    } else {
      minimize(id)
    }
  }

  function moveToFront(id) {
    const w = state.windows.find((x) => x.id === id)
    if (w) w.z = ++state.z
  }

  function updatePos(id, x, y, w, h) {
    const win = state.windows.find((z) => z.id === id)
    if (win) {
      win.x = x
      win.y = y
      win.width = w
      win.height = h
    }
  }

  function getTop() {
    return state.z
  }

  function getStartOpen() {
    return state.startOpen
  }

  function setStartOpen(v) {
    state.startOpen = v
  }

  function focusId() {
    let topWin = null
    for (const w of state.windows) {
      if (!w.minimized && (!topWin || w.z > topWin.z)) topWin = w
    }
    return topWin ? topWin.id : null
  }

  return {
    get windows() {
      return state.windows
    },
    getStartOpen,
    setStartOpen,
    open,
    focus,
    close,
    minimize,
    toggleMaximize,
    toggleTask,
    moveToFront,
    updatePos,
    getTop,
    focusId,
  }
}
