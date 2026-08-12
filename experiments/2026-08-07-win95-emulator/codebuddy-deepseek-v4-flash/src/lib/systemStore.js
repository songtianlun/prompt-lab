import { writable } from 'svelte/store';

// 系统电源状态：
// 'on'            - 桌面运行中
// 'bios'          - BIOS 自检（内存计数）
// 'starting'      - "Starting Windows 95..." 黑底白字
// 'splash'        - 蓝天白云启动画面
// 'shuttingDown'  - "正在关机" 画面
// 'off'           - 已关机（可安全关闭）
export const powerState = writable('on');

// 开机阶段计时
export function boot() {
  powerState.set('bios');
  setTimeout(() => powerState.set('starting'), 1800);
  setTimeout(() => powerState.set('splash'), 3200);
  setTimeout(() => powerState.set('on'), 6000);
}

export function shutdown() {
  powerState.set('shuttingDown');
  setTimeout(() => {
    powerState.set('off');
  }, 3000);
}
