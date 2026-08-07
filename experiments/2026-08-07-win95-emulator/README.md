---
model:
	- DeepSeek-V4-Flash (opencode)
	- GLM-5 (opencode)
date: 2026-08-07
notes:
	- 两个版本均由 opencode 通过同一自然语言提示词生成，使用 Svelte + Vite。
	- 目录名对应生成所用的模型。
---

# 2026-08-07 Win95 模拟器

同一提示词下，用不同模型在浏览器中生成一个 Windows 95 风格桌面模拟器，用于对比各模型的实现细节与完成度。

# Prompt

> 用 Svelte 写一个 Windows 95 桌面模拟器，包含桌面图标、任务栏、开始菜单、可拖动/缩放/最小化的窗口，以及记事本和扫雷等演示应用，样式还原 Win95 的拟物质感。

# Results

## DeepSeek-V4-Flash 版本（`opencode-deepseek-v4-flash`）

- 技术栈：Svelte 5 + Vite 8
- 结构：`src/components`（Desktop / Taskbar / Window / StartMenu / apps）+ `src/lib/windowStore.svelte.js`
- 应用：记事本、我的电脑、扫雷
- UI 为中文标签，桌面背景为经典 teal（#008080）

```bash
cd opencode-deepseek-v4-flash
npm install
npm run dev
```

## GLM-5 版本（`opencode-glm5-2`）

- 技术栈：Svelte 4 + Vite 5
- 结构：`src/lib`（Desktop / Taskbar / StartMenu / Window / apps）+ `src/lib/stores.js`
- 应用：记事本、扫雷、我的电脑、关于、资源管理器
- 带开机动画（蓝色启动画面 + 四色 logo + 加载条）

```bash
cd opencode-glm5-2
npm install
npm run dev
```
