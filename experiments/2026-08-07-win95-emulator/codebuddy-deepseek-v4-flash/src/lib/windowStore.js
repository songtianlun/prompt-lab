import { writable, get } from 'svelte/store';

// 窗口状态管理
export const windows = writable([]);
export const zCounter = writable(10);
export const activeWindowId = writable(null);

let idCounter = 0;

export function openWindow(appId, props = {}) {
  const id = ++idCounter;
  const win = {
    id,
    appId,
    title: props.title || appId,
    x: props.x ?? 80 + (id % 5) * 30,
    y: props.y ?? 40 + (id % 5) * 25,
    width: props.width ?? 500,
    height: props.height ?? 400,
    minimized: false,
    maximized: false,
    z: get(zCounter) + 1,
    props: props.props || {}
  };
  zCounter.set(win.z);
  windows.update((list) => [...list, win]);
  activeWindowId.set(id);
  return id;
}

export function closeWindow(id) {
  windows.update((list) => list.filter((w) => w.id !== id));
  const remaining = get(windows);
  if (remaining.length > 0) {
    activeWindowId.set(remaining[remaining.length - 1].id);
  } else {
    activeWindowId.set(null);
  }
}

export function focusWindow(id) {
  const z = get(zCounter) + 1;
  zCounter.set(z);
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, z, minimized: false } : w))
  );
  activeWindowId.set(id);
}

export function minimizeWindow(id) {
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, minimized: true } : w))
  );
  const remaining = get(windows).filter((w) => !w.minimized);
  if (remaining.length > 0) {
    activeWindowId.set(remaining[remaining.length - 1].id);
  } else {
    activeWindowId.set(null);
  }
}

export function toggleMaximize(id) {
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
  );
}

export function moveWindow(id, x, y) {
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, x, y } : w))
  );
}

export function resizeWindow(id, width, height) {
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, width, height } : w))
  );
}

export function updateWindow(id, patch) {
  windows.update((list) =>
    list.map((w) => (w.id === id ? { ...w, ...patch } : w))
  );
}

export function getWindow(id) {
  return get(windows).find((w) => w.id === id);
}
