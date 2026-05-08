# 个人任务管理系统

纯前端的个人任务管理工具：创建与编辑任务、分类与优先级、按时间与进度筛选，数据保存在浏览器 **localStorage**（前缀 `taskApp_`），无需后端。适合日常工作进展与计划梳理。

## 功能概览

- 任务列表、卡片视图与筛选/排序  
- 月 / 周 / 日 时间视图与自定义时间窗  
- 任务详情侧栏：Markdown 描述、附件预览、进度滑条（100% 需确认后标记已完成）、进展记录  
- 实施起止日与状态流转（含已完成改回进行中 / 阻塞）

## 技术栈

- React 18、TypeScript、Vite 5  
- Tailwind CSS、Zustand（`persist` 持久化）  
- Vitest、React Testing Library  

## 环境要求

- [Node.js](https://nodejs.org/) 18+（建议使用 LTS）

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认地址：<http://localhost:5175>（见 `vite.config.ts`）。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run dev:desktop` | 本地调试桌面壳（启动 Vite + Electron） |
| `npm run build` | 生产构建 |
| `npm run build:desktop` | 构建前端并打包 macOS 安装产物（dmg/zip） |
| `npm run preview` | 预览构建产物 |
| `npm run test` | 运行单元测试 |
| `npm run test -- --coverage` | 测试 + 覆盖率 |
| `npm run lint` | ESLint |

## 数据说明

同一浏览器里，`localStorage` **按网站源**（协议 + 域名 + 端口）隔离。若更换端口或域名，会看起来像「数据不见了」，实际是另一套存储空间。

桌面版（Electron）与浏览器版也不是同一套存储分区：桌面版数据位于系统应用目录（通常在 `~/Library/Application Support/<AppName>`），不会自动和 `localhost` 的 localStorage 互通。

## Mac 桌面版与应用内更新

- 首次安装：使用 `npm run build:desktop` 生成的 `.dmg` 或 `.zip` 安装。
- 应用内更新：桌面版会检查 GitHub Releases 新版本，发现后在 App 内提示，可点击「立即更新」自动下载、退出安装并重启。
- 关键点：**仅 push 到 `main` 不会触发终端用户更新**；必须发布带版本号的 Release 资产（例如 `latest-mac.yml`、`.zip`、`.dmg`）。
- 自动化参考：`.github/workflows/release-desktop.yml` 会在 `v*` tag 时构建并上传 Release 资产。
- macOS 未签名/未公证时，系统可能提示安全限制；建议后续配置 Apple Developer 签名与公证以获得顺滑更新体验。

## 仓库与协作

- 给 AI 或深度协作的约定与经验见根目录 **[`AGENTS.md`](./AGENTS.md)**。  
- 远程示例：`https://github.com/oliverwudy0710-hue/woody.project-management`（以你实际远程为准）。

## 许可

私有项目（`package.json` 中 `"private": true`）。如需开源请自行补充许可证文件。
