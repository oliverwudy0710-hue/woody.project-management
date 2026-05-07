# 个人任务管理系统 - AI 操作指南

## 项目概述

纯前端的个人任务管理系统，支持任务的增删改查、分类与优先级标记。
数据通过 `localStorage` 持久化，无需后端。主要用于汇报工作进展与计划。

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
  - `src/features/`    按功能拆分（tasks、categories、filters）
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