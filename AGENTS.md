# 个人任务管理系统 - AI 操作指南

## 项目概述

纯前端的个人任务管理系统，支持任务的增删改查、分类与优先级标记。
数据通过 `localStorage` 持久化，无需后端。主要用于汇报工作进展与计划。
**左侧主导航**（`AppSidebar`）：**新建任务**、**对话助手**（切换）、**个性化与模型（⚙）**；**主区域**为固定视口 **`h-[100dvh]`**：**任务列**（顶栏 + 筛选工具栏 + 分页 + `#task-list-scroll` 内滚动卡片栅格）与 **右侧工作面板**并列。右侧采用单槽互斥：**助手** / **新增任务** / **任务详情与进度**，宽屏固定列、窄屏抽屉。**顶栏**标题/角标/欢迎语/Logo 与 **每页条数** 在 `uiPreferencesStore`（`taskApp_ui_preferences`）。任务列表：先时间窗，再 **全局** 状态/领域/子标签/排序，再 **分页**（默认每页 24，可选 12/48/96）。LLM 连接信息在 `PersonalizationDrawer`；助手见 `AssistantDrawer`、`assistantSettingsStore`。  
**飞书日报**：配置在 `PersonalizationDrawer`（`feishuReportStore` / `taskApp_feishu_report`）；主进程按 `sendTimeLocal` 触发 `IPC`，渲染进程调用模型生成「今日完成/明日计划/阻碍」，再由主进程 POST 飞书 Webhook（仅应用运行时触发）。  
**助手能力说明**：UI 文案源 `assistantHelpSections.ts`（`AssistantHelpPanel`）；快捷能力见 `assistantPresets.ts`（批量创建 / 工作日志 / 今日要点）。**@ 提及**为 `@[标题]`（括号内标题中的 `]` 写作 `›`），解析 id 见 `parseLinkedTaskIdsFromText`；同名任务取 id 字典序最小的一条。
**桌面版**：无应用内自动更新；主页顶栏展示 `VITE_APP_VERSION`（构建时自 `package.json` 注入）。新版请用户自行安装新 DMG。

## 时间与视图层级

- 顶层时间粒度为 **月**，向下展开为 **周**，再至 **日**。
- 所有功能设计必须支持这一从粗到细的导航与汇总。

## 技术栈与约束

- 框架：React 18+ / TypeScript（严格模式）
- 样式：Tailwind CSS
- 状态管理：Zustand
- 持久化：所有状态通过 `zustand/middleware` 的 `persist` 存入 localStorage，key 前缀统一为 `taskApp_`
- 测试：Vitest + React Testing Library
- 代码结构（约定目录）：
  - `src/components/`  纯展示组件
  - `src/features/`    按功能拆分（tasks、categories、filters、**assistant**）
  - `src/hooks/`       通用 hooks
  - `src/stores/`      Zustand store
  - `src/utils/`       工具函数
- 组件文件不超过 200 行；复杂逻辑提取为 hooks 或子组件
- 禁止修改 `dist/` 或 `build/` 目录

## 构建与质量命令

- 启动开发服务器：`npm run dev`
- 生产构建：`npm run build`
- 运行测试（含覆盖率）：`npm run test -- --coverage`
- 代码检查：`npm run lint`

所有 PR / 提交前必须通过 lint 和 test。

## Git 与 GitHub（推送到远程）

- **远程仓库**：`https://github.com/oliverwudy0710-hue/woody.project-management.git`
- **默认分支**：`main`
- **日常推送**（在本机项目根目录执行）：

```bash
git status
git add -A
git commit -m "简明说明本次改动"
git push
```

若本地分支尚未绑定远程 `main`，或第一次从该电脑推送：

```bash
git push -u origin main
```

- **修改远程地址**（例如仓库迁移或远程填错时）：

```bash
git remote set-url origin https://github.com/oliverwudy0710-hue/woody.project-management.git
git remote -v
```

- **HTTPS 认证**：终端提示输入密码时，使用 **Personal Access Token**（不能使用 GitHub 登录密码）。细粒度令牌须在 **Repository permissions** 中为 **Contents** 勾选 **Read and write**，且 **Repository access** 须包含本仓库（或 All repositories）。若出现 403，检查令牌权限，并在 macOS **钥匙串访问** 中删除旧的 `github.com` 凭据后重试 `git push`。

## 工作约定

### 需求澄清

遇到模糊或不完整的需求，必须主动提问，明确范围、验收标准和约束。
澄清时可参考 `prompts/` 目录下的模板（按日/周/月或开发需求分类），先补充信息再编码。

### 经验沉淀

每完成一个完整功能（达到验收标准，可独立闭环）后，将成功的关键步骤和常见陷阱简要追加到下方的“经验教训”小节中。

要求：

- 最新条目放在列表顶部（最新在上）
- 每条包含：功能或模块名、可复现的关键步骤/检查点、易错点与规避方式
- 仅追加，不修改历史条目（更正用新条目说明）

---

## 经验教训

### 2026-05-08 · @「仅标题」提及 + 批量创建列表 + 1.0.0 基线（v1.0.0）

- **可复现要点**：`formatTaskMention(title)` → `@[escape(title)]`；`getActiveMentionPickerState` 区分筛选态与已闭合 token；`sortTasksForMentionPicker`（前缀匹配、状态序）；`mentionTokenBoundsForBackspace` / `mentionTokenBoundsForDelete` 原子删；`parseLinkedTaskIdsFromText(text, tasks)` 发送前按当前库解析 id。有序列表：`AssistantDrawer` 里对 `^\s*\d+\.\s` 行 **Enter** 插 `\n${n+1}. `，**Shift+Enter** 走默认换行。批量创建模板短版 + 系统提示强调「口语提炼、多条 create_task」；系统提示明确「多 @[标题] → 多条 update_task」。
- **易错点**：标题含 `]` 必须经 `escapeForMentionTitle` 与解析同一规则；**同名任务**只会绑定 id 最小的一条，团队版前应产品层消歧或强制唯一标题。

### 2026-05-08 · 助手帮助文档 + 快捷工作日志/今日要点/批量创建（v0.0.7）

- **可复现要点**：`ASSISTANT_HELP_SECTIONS` 集中维护 UI 能力说明；`assistantPresets` 区分 `inject_input`（批量创建模板）与 `send_auto`（工作日志、今日要点：短 `displayUser` + 长 `userPrompt`）。`AssistantDrawer` 用 `ChatTurn` 的 `apiContent` 与 `toApiMessages` 保证多轮时 API 仍收到完整指令。`buildAssistantContextBlock` 注入列表时间窗、今日进展（含 `progressSnapshot`）、阻塞任务、窗内任务列表；`assistantSystemPrompt` 约定工作日志/今日要点返回 `message` + `operations: none`，批量创建可多条 `create_task`。执行层 `executeAssistantOperations` 本身已支持遍历多条 `create_task`。
- **易错点**：勿把「气泡展示文案」当作 API 用户消息全文；一键类能力必须走 `apiContent`。改行为时同步改 `assistantHelpSections`、`assistantSystemPrompt`、`assistantPresets` 三处，避免文档与模型指令脱节。

### 2026-05-08 · 右栏单槽统一 + 飞书日报定时（v0.0.6）

- **可复现要点**：抽取 `WorkspaceSidePanel` 复用助手同款「宽屏固定列 / 窄屏抽屉」协议；`App` 通过 `rightPanel + taskDetailId` 管理右侧单槽互斥。飞书链路：`main.cjs` 维护 `sendTimeLocal` 定时器，触发 `feishu:scheduled-trigger`；渲染进程收到后执行 `sendDailyReport`，调用 `buildDailyReport`（复用 OpenAI 兼容客户端）生成文本，再由主进程 `fetch` Webhook 发送，成功后写回 `lastSentDate` 防重。
- **易错点**：`contextIsolation: true` 时必须走 `preload + contextBridge` 暴露白名单 API，不能在渲染进程直接访问 `ipcRenderer`。另：飞书机器人 Webhook 与 API Key 都是本地敏感配置，文档要明确「勿入库」。

### 2026-05-08 · 固定视口三栏 + 任务列表全局分页（v0.0.5）

- **可复现要点**：根布局 `flex h-[100dvh] overflow-hidden`；任务列与助手列均 `min-h-0` + 子级 `flex-1 overflow-y-auto`。分页：**筛选/排序** 在全量 `filteredAll` 上完成，再 `slice`；切换时间窗或任一筛选项 **重置到第 1 页**；`tasksPerPage` **持久化**并写入 `setUiPreferences` 时用 `clampTaskPageSize`。**回到顶部** 应滚动 `#task-list-scroll`，勿依赖 `window.scrollTo`。
- **易错点**：在 `flex` 子列里忘记 `min-h-0` 会导致内部 `overflow-y-auto` 不生效、列表仍把整页撑高。

### 2026-05-08 · 左侧主导航 + 个性化抽屉（v0.0.4）

- **可复现要点**：`App` 为 `AppSidebar | (主列 + AssistantDrawer 并列)`；`AddTaskModal` / `PersonalizationDrawer` 由 App 顶层持有 `open` 状态。`AppSidebar` 上 `data-testid` 保留 **`add-task-fab`**、**`assistant-fab`** 以兼容旧用例命名。`document.title` 同步 `appTitle`。
- **易错点**：`RightDrawer` 已在包裹 `title` 的 **`<h2 id={titleId}>`** 上设置 `aria-labelledby`，**勿**在 `title` 子节点再写重复 `id`。助手内发送前若缺 API Key，错误文案需指向 **左侧 ⚙**，勿再引用已删除的「展开模型配置」。

### 2026-05-08 · 移除 electron-updater + 首页版本号 + 文档中的发版顺序

- **可复现要点（产品/发版）**：桌面版不再内置「检查 GitHub Releases → 下载 → 替换」：**无付费 Apple Developer 签名时**，Squirrel 链式更新常在签名校验处失败。用户改用 **手动安装新 DMG**；`README` 中写清 **先升 `package.json` 的 `version` 再打 `v*` tag**，避免 tag 与二进制版本不一致。
- **可复现要点（实现）**：删除 `electron-updater`、`preload`、IPC、`DesktopUpdateBanner`；`BrowserWindow` 不再指定 `preload`。`vite.config.ts` 用 `define` 注入 `import.meta.env.VITE_APP_VERSION`；`package.json` 的 `build.publish` 已移除；`release-desktop` workflow 仅上传 `dist/*.dmg`、`dist/*.zip`。
- **易错点**：只靠「合并 main」不会出现带正确版本号的安装包；**版本号仅由构建时的 `package.json` 决定**，与 git tag 名称无自动绑定。

### 2026-05-08 · 迁移安全线（防「有任务却写成空列表」）+ Electron 应用内更新

- **可复现要点（迁移安全线）**：`taskStore` 的 `persist.migrate` 不直接返回 `normalizePersistedSlice(persisted)`，而是先读取 `localStorage['taskApp_tasks']` 的原始 JSON 快照（`state.tasks`）并映射 `migrateTask`。若出现 **safeguardTasks > 0 且 normalized.tasks === 0**，视为升级异常，返回纠偏后的 `tasks`，并记录 warning。目标是避免版本迭代时因形状异常把非空任务静默覆盖成空数组。
- **可复现要点（桌面更新）**：桌面壳使用 Electron + `electron-updater`（GitHub provider）。主进程监听 `update-available`/`download-progress`/`update-downloaded`，通过 preload IPC 向 React 发状态；用户在页面点击「立即更新」后调用 `downloadUpdate`，下载完成 `quitAndInstall` 自动退出安装并重启。
- **发布口径**：仅 push 代码不会更新终端用户；必须有 GitHub Release 资产（`latest-mac.yml` + `.zip`/`.dmg`）。仓库内 `release-desktop` workflow 以 `v*` tag 触发构建上传。
- **边界与易错点**：桌面版存储与浏览器 `localhost` 的 localStorage 不共用；未签名/未公证的 macOS 包可能被 Gatekeeper 限制，自动更新体验会降级。该方案防代码路径导致的「误清空」，不防用户清站点数据或更换浏览器配置。

### 2026-05-08 · 持久化大版本升级与「任务列表一空」事后分析（taskApp_tasks）

- **背景**：一次功能更新为任务增加 **`domain`（工作/生活/学习）**、子标签仍用 **`category`**，并把 **`tagPresets`** 从 `string[]` 改为 **`Record<TaskDomain, string[]>`**；同时将 `taskStore` 的 **`STORE_VERSION` 从 4 升到 5**，并在 `persist.migrate` 中调用 **`normalizePersistedSlice` → 对每条任务 `migrateTask`**。助手侧栏改为底部 FAB；Vite 曾默认仅绑定 `localhost`（IPv6 `::1` 常见），`http://127.0.0.1:5175` 会 **ERR_CONNECTION_REFUSED**，已通过 `vite.config.ts` 的 **`server.host: true`** 缓解（IPv4/IPv6 均可访问）。
- **为何无法 100% 指认「就是某一行代码删库」**：任务只存在浏览器 **`localStorage` 键 `taskApp_tasks`**（Zustand 形如 `{"state":{...},"version":N}`）。若没有升级前该键的备份或 Time Machine 级浏览器数据快照，**无法事后对比**是迁移写了空数组、还是用户随后在一次会话里被空状态 **setItem 覆盖**、或 **清除站点数据/换用户配置/存储损坏**。用户回报的现网快照里 **`state.tasks` 已为 `[]`、`version` 为 5**，只能说明**当前持久化里就没有任务**；**不能从该快照恢复历史卡片**。
- **技术上「可能导致 tasks 变 []」的路径（改代码与 review 时自查）**：
  1. **`normalizePersistedSlice`**：`tasks` 仅在 **`Array.isArray(p.tasks)`** 时为旧数组逐项 `migrateTask`；**若 `p.tasks` 缺失或非数组，会直接变成 `[]`**。因此 `migrate` 收到的 **`persisted` 必须是 zustand 解冻后的完整 `state` 切片**；任何形状错误（例如误把外层 storage 再包一层、或读到半份 JSON）都会表现为**静默丢任务**。
  2. **Zustand v5 `persist.migrate` 约定**：`migrate` 的**第一个参数已是 `deserializedStorageValue.state`**（见 `node_modules/zustand/middleware.js` hydrate 分支），**不是**整段 `{ state, version }`。`unwrapPersistedPayload` 兼容「偶发多包一层 `state`」尚可；若上游传入不完整对象，风险同上。
  3. **默认 `merge`**：`merge(persistedState, currentState) => ({ ...currentState, ...persistedState })`。若 `persistedState` 里 **`tasks` 为 `[]`**（迁移或错误生成），会与默认初始态合并后 **把空数组写回**，随后 **`setItem` 覆盖本地存储**，历史任务如无外部备份则无法从应用内找回。
  4. **非代码因素**：`localhost` 与 **`127.0.0.1`、不同端口** 的 **localStorage 相互独立**；曾误以为自己「一直用 5175」但仍可能点进过其它源。测试里 `localStorage.clear()` 只影响 Vitest **jsdom**，不影响本机 Chrome，但 **开发者手动清除 Application 存储**会真实清空。
- **以后同类改动的硬性要求（给 AI/维护者）**：
  - 升 **`STORE_VERSION`** 前：**在浏览器导出或复制一份 `taskApp_tasks` 全文**做回滚样本；迁移函数内对 **`tasks` 从有变无** 打 **`console.error` 或显式校验**（例如旧版 `version` 下若曾存在非空 `tasks`，迁移结果不许在未发现「用户显式删空」的情况下变空），并在 PR 说明中写清迁移契约。
  - 产品层尽快提供 **JSON 导出/导入**（或定期下载备份），避免单点 localStorage 无备份。
  - 更新本文件与助手说明时：**关联任务**以输入框 **`@` 提及** 为准，**不再**写「仅在标题区打开」或「仅勾选列表」等过时交互。

### 2026-05-07 · 对话助手（LLM）与 Cursor 协作约定

- **可复现要点**：对话助手入口在 **右下角 FAB（对话图标）**；配置存 `taskApp_assistant_settings`（`useAssistantSettingsStore`）。请求走 **OpenAI 兼容** `POST {baseUrl}{chatPath}`，开发环境可勾选 **经 `/api-llm` 代理**（`vite.config.ts` 转发，默认目标 `https://api.deepseek.com`，可用根目录 `.env` 的 `VITE_LLM_PROXY_TARGET` 指向其它兼容网关）。模型返回 **严格 JSON**（`parseAssistantResponse`），经 `executeAssistantOperations` 调用 `addTask` / `appendProgressLog` / **`update_task`（仅当用户在输入框中用 `@` 提及的任务 id 在允许列表内）**；`buildAssistantContextBlock` 注入今日任务、**关联任务全文**、**当日活动快照**（`activityLogStore` / `taskApp_activity_log`，由 `addTask`/`updateTask`/`appendProgressLog`/`removeTask` 经 `pushActivity` 写入）。快捷提示词见 `assistantPresets.ts`。**Harness** 等产品里的 **`/create-agent`** 流水线与本功能无关，勿混用。`TaskProgressPanel` 完成度为 **range**（步进 1%，50% 刻度），拖到 100% 需 **二次确认** 才标为已完成；`updateTask` 不单独因进度≥100 自动 `completed`，状态下拉仍可将已完成改回进行中/阻塞。
- **易错点**：浏览器直连多数厂商 API 会 **CORS** 失败——开发时请启用代理；**API Key 在前端/localStorage 仅适合个人本机**，勿在公共环境或仓库中提交密钥。`npm run preview` / 静态部署无 Vite 代理时需自建转发。长 Composer 会话接近 **context 上限**时会 **摘要/丢弃较早原文**，重要约定应写回本 `AGENTS.md` 或 `.cursor/rules`，必要时新开会话并 `@` 文件。
- **规则分层（备忘）**：**本文件** = 项目手册；**Cursor Settings → Rules** = 用户全局；**`项目/.cursor/rules/*.mdc`** = 可按 glob/始终应用的项目规则；**`~/.cursor/rules`** = 用户级规则落盘；共享规则可用 Cursor **Remote Rule (GitHub)** 拉取 `.mdc`（见 [Cursor 规则文档](https://cursor.com/docs/rules)）。

### 2026-05-06 · 实施周期 + 进度侧栏（飞书式一期）

- **可复现要点**：任务模型用 `implementationStart/End` 替代 `scheduledDate`；列表筛选改为区间与「锚定日/周/月」是否**相交**（`taskVisibleInImplementationWindow` + `ymdRangesOverlap`）；`persist` 的 `migrate` 收到的已是 **`partialize` 后的切片**（仅 `tasks` / `timeGranularity` / `referenceDate`），需在迁移函数中把旧任务的 `scheduledDate` 映射为起止日期。卡片**主体不响应点击编辑**，仅「更新进度」打开 `TaskProgressPanel`（`z-[60]`）；状态切到 `completed` 时在 store 内强制 `progressPercent = 100`；`completed`/`cancelled` 下禁止再 `appendProgressLog`。
- **易错点**：`migrateTask` 里把 `Record` 断言为 `Task` 会触发 TS2352，需 `as unknown as Task`；`updateTask` 中合并 patch 后应用 `prefer-const` 可读写法。进展表单用 `defaultValue` 时切换任务要加 **`key={task.id}`** 或控制组件，否则日期仍显示上一任务打开时的值。

### 2026-05-06 · 新增任务：FAB、Modal 表单与校验

- **可复现要点**：底部固定 `fixed bottom-6 right-6` 的圆形 FAB（`bg-blue-600`）打开 `AddTaskModal`；表单提交走 `useTaskStore.getState().addTask`（`persist` 仍为 `taskApp_tasks`），标题用 `trim()` 校验，空格-only 视为无效。模块化：`categoryOptions.ts` 承载分类下拉常量/类型；`TaskPriorityFieldset`、`TaskCategoryFields` 为纯展示，保证 `AddTaskModal` 不超过 200 行。
- **易错点**：Modal 再次打开时若不在 `open` 变化时重置 state，会残留上次错误提示或字段；通过在 `useAddTaskForm` 内对 `open` 的 `useEffect` 统一重置解决。`Escape` 与点击遮罩关闭需在 `open` 为真时注册监听并在卸载时移除。

### 2026-05-06 · 时间筛选锚点与「今日」

- **要点**：「本月 / 本周 / 今日」应对齐当前日历；在 `App` 挂载时用 `todayISODate()` 写回 store 的 `referenceDate`，避免 `persist` 长期保留旧日期导致筛选与直觉不符（单测仅渲染子树时仍可通过 `setState` 固定锚点日期）。

### 2026-05-06 · 第一阶段：Vite + React 脚手架、任务列表与时间筛选

- **可复现要点**：`vite.config.ts` 中 Vitest 配置需使用 `import { defineConfig } from 'vitest/config'`，否则 `tsc -b` 会报 `test` 不是合法字段；`src/features/`** 内引用 `utils` / `stores` / `components` 时要比 `src/` 下多一层 `../`。
- **易错点**：安装依赖被中断时可能出现 `esbuild` 的 `install.js` 缺失，需删除 `node_modules`（必要时连 `package-lock.json`）后重装；带 `persist` 的 Zustand store 在测试中须在 `setState` 前 `localStorage.clear()`，否则会读回旧持久化数据覆盖用例初始状态。
- **覆盖率**：仓库已安装 `@vitest/coverage-v8`，执行 `npm run test -- --coverage` 可生成报告。

*（更早条目将在后续迭代中追加在上方。）*