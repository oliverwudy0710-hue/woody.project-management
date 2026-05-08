# 个人任务管理系统

纯前端的个人任务管理工具：创建与编辑任务、分类与优先级、按时间与进度筛选，数据保存在浏览器 **localStorage**（前缀 `taskApp_`），无需后端。适合日常工作进展与计划梳理。

## 版本更新记录（面向用户）

> 版本号与 `package.json` 的 `version` 一致；桌面安装包文件名也会带上该版本。

### v1.0.0（当前）

- **个人自用基线**：功能闭环到可日常使用的程度；后续可能向团队版任务管理演进。
- **@ 提及**：插入 **仅标题**（`@[标题]`，无 uuid）；**关键字筛选**（含空格）、列表 **状态优先排序**；**退格/Delete 一次删整块**；可多 `@` 多条任务，配合模型 **一轮内多条 `update_task`**。
- **批量创建**：快捷提示改为 **短说明 + `1. ` 有序列表**，口语逐条写；**Enter 自动续序号**（**Shift+Enter** 为普通换行）；由模型从自然语言 **提炼** 多条 `create_task`。

### v0.0.7

- **对话助手能力说明（可维护）**：助手面板内增加折叠式帮助，文案集中在 `assistantHelpSections.ts`，后续改能力说明主要改该文件即可。
- **快捷能力**：**批量创建任务**（向输入框注入模板，模型可一次返回多条 `create_task`）；**工作日志**（一键生成：今日做了什么含进展与进度%、明日做什么按当前时间窗内任务、困难聚焦阻塞任务）；**今日要点**（无需打字，一键向模型请求早间要点）。
- **上下文**：`buildAssistantContext` 补充与列表一致的时间窗、今日进展快照、阻塞与时间窗内任务等块；多轮对话用 `apiContent` 区分展示气泡与实际请求正文。

### v0.0.6

- **右侧面板统一交互**：`新增任务` 与 `任务详情/编辑` 在宽屏下改为与助手一致的**右侧固定列**，窄屏仍是全屏抽屉；`App` 采用右栏单槽，避免助手与任务编辑同时挤占空间。
- **飞书日报（应用内定时）**：在「个性化与模型」新增飞书配置（启用开关、Webhook、发送时间、立即测试发送）。每天默认 **18:00** 触发，由 AI 生成「今日完成 / 明日计划 / 阻碍」三段并推送到飞书机器人。
- **发送链路**：桌面端新增 `preload + IPC`，由主进程发 Webhook（规避渲染层 CORS）；同日自动去重，避免重复发送。
- **边界说明**：当前是**机器人消息推送**，不是写入飞书原生「汇报」表单；且仅在应用运行时触发定时。

### v0.0.5

- **主工作区交互**：整体采用 **`100dvh` 视口 + 三栏**：左 **主导航**、中 **任务列**、右 **对话助手**（打开时）。中间与右侧均为 **列内独立滚动**（`overflow-y-auto`），**不再依赖整页拉长滚动**，与助手侧栏的交互一致；「首页」按钮将 **任务列表滚动区** 滚回顶部（`#task-list-scroll`）。
- **任务列表分页**：先在 **当前时间窗** 内做 **状态 / 领域 / 子标签 / 排序**（**全局筛选**），再 **按页展示卡片**；分页条显示 **总匹配数、当前条范围、页码、上一页/下一页**；**每页条数** 可选 **12 / 24 / 48 / 96**，默认 **24**，持久化在 `taskApp_ui_preferences.tasksPerPage`。
- **文案**：工具栏上的数量展示改为 **「条匹配」**，强调是筛选后的全量条数而非仅当页。

### v0.0.4

- **布局与入口**：**左侧固定窄栏**提供稳定入口——**回到顶部**、**新建任务**、**对话助手**（切换开关）、底部 **个性化与模型（⚙）**。不再使用右下角悬浮按钮。
- **个性化**：可配置**系统名称**（顶栏主标题、浏览器标签页标题）、**角标与欢迎语**、**顶栏/侧栏图标**（本地上传小图或恢复默认）。配置持久化键 `taskApp_ui_preferences`。
- **对话助手**：**模型、API Key、代理**等已从助手面板内迁出，统一在 **「个性化与模型」** 抽屉中编辑；助手侧栏专注对话与 `@` 关联任务。

### v0.0.3

- **桌面版更新方式**：**不再提供应用内一键自动更新**。Mac 未配置 Apple Developer 正式签名时，链式更新容易触发系统签名校验失败；后续若你希望恢复「应用内更新」，需付费开发者账号 + 固定证书签名与公证。  
  **现在请每次发版后，自行下载或本地新打的 `.dmg`，拖到「应用程序」覆盖安装。**
- **首页能看见版本**：顶栏卡片**右下角**显示灰色 **`v0.0.x`**，便于确认当前跑的是不是刚装的新包（网页版与打包进桌面的前端一致）。
- **对话助手**：已在输入框用 **`@` 选任务**，侧栏里**去掉**了「本轮已 @ 关联」说明区，减少重复信息。
- **开源 / Release**：仓库仍可用 GitHub Actions 在推送 `v*` 标签时构建并**附件上传 `.dmg` / `.zip`**，方便分发；**不提供**基于 `electron-updater` 的在线升级检查。

### v0.0.2

- **产品侧**：以发布流程与构建管线为主（如 Release 附件、blockmap 等实验）。  
- **注意（发版教训）**：若 **Git 标签**已是 `v0.0.2`，但 **`package.json` 里的 `version` 未改**，对外安装包仍会带 **0.0.1** 字样，应用内也感知不到「新版本」。**正确顺序**：先改 `version` → 提交 → 再打对应 tag 触发构建。

### v0.0.1 及更早能力基线

- **领域 + 子标签**：工作 / 生活 / 学习大类，子标签可自定义与筛选。  
- **右下角**：新建任务、对话助手（LLM 配置见侧栏内说明）。  
- **助手**：输入框 `@` 提及任务后，可对允许范围的任务做自然语言修改（如进度、标题等）。  
- **数据安全**：`taskStore` 持久化迁移带**安全线**，降低升级异常时任务列表被静默写成空的概率（不能替代用户定期备份习惯）。  
- **桌面壳**：Electron 包装同一套 Web 前端；`Vite` 使用相对资源路径，避免 `file://` 打开白屏。

---

## 维护记录（简要 · 技术）

| 版本 | 代码/工程侧要点 |
|------|----------------|
| **1.0.0** | @ 提及改为 `@[标题]` + 关键字检索与排序；原子退格；有序列表 Enter 续号；批量创建口语提炼；系统提示支持多任务一轮 `update_task`。 |
| **0.0.7** | 助手内 `AssistantHelpPanel` + `assistantHelpSections`；快捷预设（批量创建 / 工作日志 / 今日要点）；`ChatTurn` + `apiContent` 与 `buildAssistantContext` 增强。 |
| **0.0.6** | 抽取 `WorkspaceSidePanel` 并统一任务右栏交互；`App` 右栏单槽互斥；新增 `feishuReportStore`、日报生成与发送链路（preload + main IPC + 定时调度）。 |
| **0.0.5** | `App` 固定视口三栏；`TaskList` 全局筛选后分页（`TaskListPagination`、`taskPaginationConstants`）；`tasksPerPage` 在 `uiPreferencesStore`；助手列 `h-full` 与任务列对齐。 |
| **0.0.4** | 左侧 `AppSidebar` + `PersonalizationDrawer`（外观 + LLM）；`uiPreferencesStore`；助手内移除内联模型表单；删除 `AddTaskEntry` FAB。 |
| **0.0.3** | 移除 `electron-updater`、`preload`、更新横幅；`vite` 注入 `VITE_APP_VERSION`；`electron-builder` 去掉 `publish`；`release-desktop` workflow 仅上传 `dmg`/`zip`。 |
| **0.0.2** | Workflow 曾尝试附带 zip blockmap / Release 资产；暴露 tag 与 `package.json` 不同步问题。 |
| **0.0.1** | Electron + electron-builder；`electronDist` 指向本地 `node_modules/electron/dist` 以规避 CI 重复拉取 Electron zip 失败等。 |

---

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
| `npm run build:desktop` | 构建前端并打包 macOS 安装产物（**dmg + zip**，见下） |
| `npm run preview` | 预览构建产物 |
| `npm run test` | 运行单元测试 |
| `npm run test -- --coverage` | 测试 + 覆盖率 |
| `npm run lint` | ESLint |

## 本地如何生成 / 更新 Mac 安装包（DMG）

1. 先改 **`package.json`** 里的 **`"version"`**（例如 `1.0.0`），保存。  
2. 在项目根目录执行：

```bash
npm run build:desktop
```

3. 完成后在 **`dist/`** 目录查找 **`Woody Task Manager-<version>-arm64.dmg`**（及同版本 `.zip`）。  
4. **更新本机已装应用**：双击 DMG，把 **Woody Task Manager** 拖进 **应用程序**，覆盖旧版即可（数据一般在应用沙箱/用户目录，与是否覆盖 `.app` 无必然冲突；浏览器版与桌面版存储仍不共用，见下）。

若构建阶段需从 GitHub 下载工具链，终端请配置可用的 **`HTTP_PROXY` / `HTTPS_PROXY`**（与浏览器代理分开配置）。

---

## 数据说明

同一浏览器里，`localStorage` **按网站源**（协议 + 域名 + 端口）隔离。若更换端口或域名，会看起来像「数据不见了」，实际是另一套存储空间。

桌面版（Electron）与浏览器版也不是同一套存储分区：桌面版数据位于系统应用目录（通常在 `~/Library/Application Support/<AppName>`），不会自动和 `localhost` 的 localStorage 互通。

## Mac 桌面版与 GitHub Release（可选）

- **日常自用**：本地 `npm run build:desktop` 得到 DMG 即可，**不必**发 Release。  
- **开源分发**：可将 DMG/ZIP 手动挂到 GitHub **Releases**；或推送 **`v*`** 标签触发 `.github/workflows/release-desktop.yml`，由 CI 构建并上传附件（**不会**向已安装客户端推送应用内更新）。

## 仓库与协作

- 给 AI 或深度协作的约定与经验见根目录 **[`AGENTS.md`](./AGENTS.md)**。  
- 远程示例：`https://github.com/oliverwudy0710-hue/woody.project-management`（以你实际远程为准）。

## 许可

计划开源时请在仓库根目录补充 **LICENSE**，并将 `package.json` 中 `"private"` 等字段按需调整；当前仓库可按需保留为私有。
