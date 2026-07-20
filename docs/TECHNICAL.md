# Jira Clone 技术文档

> **项目名称**: Jira Clone - AI 驱动的项目管理工具
> **版本**: v1.3.0
> **更新日期**: 2026-07-20
> **文档类型**: 项目技术说明文档

---

## 目录

1. [项目概述](#一项目概述)
2. [技术架构](#二技术架构)
3. [功能模块](#三功能模块)
4. [核心组件](#四核心组件)
5. [安全机制](#五安全机制)
6. [脚本命令](#六脚本命令)
7. [最近修复记录](#七最近修复记录)

---

## 一、项目概述

### 1.1 项目定位

Jira Clone 是一个 **AI 驱动的项目管理工具**，旨在提供完整的软件开发生命周期管理。项目集成了任务看板、需求管理、测试用例管理、Bug 跟踪、目标管理、时间线视图和智能体工作流可视化等核心功能模块。

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js (App Router) | 14.2.4 |
| UI 库 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS + Inline Styles | 3.4.1 |
| 数据存储 | localStorage (AES-GCM 加密) | - |
| 可视化 | @xyflow/react (React Flow) | 12.11.2 |
| 拖拽 | @hello-pangea/dnd | 18.0.1 |
| 图标 | lucide-react | 1.23.0 |
| 测试 | Jest + React Testing Library | 30.x |
| 构建工具 | Next.js (Turbopack) | - |

---

## 二、技术架构

### 2.1 前端框架

- **Next.js 14 (App Router)**: 采用 `"use client"` 客户端渲染模式，Dashboard 页面作为单一页面承载所有功能模块。
- **React 18**: 使用函数组件 + Hooks 模式进行状态管理。

### 2.2 数据存储

- **localStorage**: 所有数据存储在浏览器本地，使用 AES-GCM 256 位加密算法保护数据安全。
- **加密流程**: 数据序列化为 JSON -> AES-GCM 加密 -> Base64 编码 -> 存入 localStorage。
- **解密流程**: 从 localStorage 读取 -> Base64 解码 -> AES-GCM 解密 -> JSON 解析。
- **存储键名**: 以 `jira-clone-` 为前缀命名，包括 tasks、requirements、test-cases、bugs、goals、agents 等。

### 2.3 状态管理

- **React useState/useEffect**: 使用本地状态管理所有数据，不依赖 Redux 或 Zustand 等外部状态库。
- **数据持久化**: 通过 `useEffect` 监听数据变化，自动触发 AES-GCM 加密并写入 localStorage。
- **初始化**: 使用 `useLayoutEffect` 在组件挂载前加载数据，避免白屏闪烁。包含取消机制（`cancelled` 标志）防止组件卸载后的无效状态更新。
- **`isInitialized` 标志**: 防止空状态覆盖已存储的数据。

### 2.4 可视化

- **@xyflow/react (React Flow)**: 构建智能体工作流图，支持节点拖拽、自定义节点、平滑连线动画。
- **甘特图**: 自定义实现时间线视图，展示任务和目标的时序关系。

### 2.5 拖拽

- **@hello-pangea/dnd**: 实现看板任务的拖拽操作，支持同列排序和跨列状态变更。

### 2.6 认证

- **本地密码哈希**: 使用 Web Crypto API 进行 SHA-256 哈希，不依赖外部加密库。
- **Token 管理**: 使用 `crypto.getRandomValues` 生成安全令牌，存储在 localStorage。
- **角色管理**: 支持 ADMIN 和 USER 两种角色，ADMIN 拥有所有权限。

### 2.7 单元测试

- **Jest + React Testing Library**: 对核心模块进行单元测试，覆盖 auth、encryption、dashboard、bug-tracker 等功能。

---

## 三、功能模块

项目采用视图切换模式，通过顶部导航栏在 8 个视图之间切换。

### 3.1 Tasks（任务看板）

- **视图模式**: `TASKS`
- **核心功能**: 三列看板（TODO / IN_PROGRESS / DONE），支持拖拽式任务状态流转。
- **数据流**:
  - 拖拽结束 -> `handleDragEnd` 回调 -> 更新任务状态 -> 自动加密保存到 localStorage。
  - 同列拖拽实现排序，跨列拖拽变更状态。
- **搜索与筛选**: 支持按标题、描述、标签搜索；按优先级和负责人筛选。
- **标签系统**: 自动收集所有任务标签，维护标签历史用于自动补全，去重操作防止重复条目。
- **评论功能**: 任务支持添加和删除评论，关联当前登录用户。

### 3.2 Requirements（需求管理）

- **视图模式**: `REQUIREMENTS`
- **核心功能**: 需求创建/编辑/删除，支持完整生命周期：DRAFT -> REVIEW -> APPROVED -> IMPLEMENTED。
- **关键字段**: title, description, priority (LOW/MEDIUM/HIGH/CRITICAL), status, acceptanceCriteria, requester, executor。
- **关联**: 需求可关联任务和测试用例。删除需求时自动清除关联测试用例的 requirementId。
- **日期格式**: 创建/更新时统一使用 `new Date().toISOString()` 格式。

### 3.3 Testing（测试用例）

- **视图模式**: `TESTING`
- **核心功能**: 测试用例的创建、编辑、执行和状态管理。
- **状态流转**: PENDING -> PASSED / FAILED / BLOCKED。
- **关联需求**: 测试用例可关联到需求，从需求卡片可直接创建关联测试用例。
- **执行记录**: 记录执行人、执行时间、实际结果和错误信息。

### 3.4 Agents（智能体管理）

- **视图模式**: `AGENTS`
- **核心功能**: 管理 9 个 AI 智能体，展示状态统计和任务分配。
- **9 个智能体**:
  | ID | 名称 | 昵称 | 角色 |
  |----|------|------|------|
  | agent-1 | Requirements Analyst | 需求粉碎机 | 需求分析 |
  | agent-2 | Architecture Task Splitter | 系统拆弹专家 | 系统架构 |
  | agent-3 | Senior Frontend Engineer | 像素魔法师 | 前端开发 |
  | agent-4 | Senior Backend Engineer | 数据大厨 | 后端开发 |
  | agent-5 | UI Designer | 配色狂魔 | UI/UX 设计 |
  | agent-6 | Code Reviewer | 代码找茬王 | 代码审查 |
  | agent-7 | Compliance Engineer | 规矩守护者 | 合规审查 |
  | agent-8 | Test Engineer | Bug猎手 | 测试 |
  | agent-9 | Document Manager | 文档整理控 | 文档管理 |
- **状态统计**: Total = tasksCompleted + tasksFailed，完成率 = tasksCompleted / Total。
- **任务分配**: 支持将任务分配给智能体，跟踪 ASSIGNED -> IN_PROGRESS -> COMPLETED/FAILED 状态。

### 3.5 Workflow（工作流可视化）

- **视图模式**: `WORKFLOW`
- **核心功能**: 使用 React Flow 构建 9 个智能体节点的可视化工作流图。
- **节点布局**: 左右交错纵向排列，垂直间距 210px，使用 SmoothStepEdge 平滑连线。
- **实时联动**: 通过 `useAgentLiveStatus` Hook 轮询 localStorage 中的 `jira-clone-active-agents` 数据，实时更新节点状态。
- **动画控制**: 支持 Start/Pause/Reset 按钮控制工作流动画。
- **Live Mode**: 开关控制实时模式，2 秒轮询间隔，30 秒条目过期时间。

### 3.6 Bugs（Bug 跟踪）

- **视图模式**: `BUGS`
- **核心功能**: 完整的 Bug 生命周期管理，7 步状态流转。
- **状态流转**: REPORTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> VERIFIED -> CLOSED，支持 REOPENED。
- **关键字段**: title, description, stepsToReproduce, expectedBehavior, actualBehavior, severity, priority, reporter, assignee, verifier。
- **统计**: 按严重程度和状态统计，Resolved 包含 RESOLVED/VERIFIED/CLOSED 三种状态。
- **验证人**: 支持 16 个验证人选项，分客户组、测试人员组、我方人员组。

### 3.7 Goals（目标管理）

- **视图模式**: `GOALS`
- **核心功能**: OKR/SMART/MILESTONE/PROJECT 四种目标类型，进度跟踪。
- **状态**: NOT_STARTED / IN_PROGRESS / ON_TRACK / AT_RISK / ACHIEVED。
- **进度计算**: 基于关联任务的完成率自动计算进度百分比。
- **关联**: 目标可关联任务和需求，支持里程碑和关键结果。
- **数据校验**: 创建/更新时校验 title 非空、startDate/endDate 必填且格式有效。

### 3.8 Timeline（时间线视图）

- **视图模式**: `TIMELINE`
- **核心功能**: 自定义甘特图实现，展示任务和目标的时序关系。
- **数据处理**: 过滤无效日期，仅显示有效日期范围的数据。

---

## 四、核心组件

### 4.1 页面组件

| 组件 | 文件路径 | 描述 |
|------|----------|------|
| Dashboard | `app/dashboard/page.tsx` | 主页面组件，管理所有状态和视图切换 |
| LoginForm | `app/dashboard/components/LoginForm.tsx` | 登录/注册表单，含 setTimeout 清理防止内存泄漏 |

### 4.2 视图组件

| 组件 | 文件路径 | 描述 |
|------|----------|------|
| TaskColumn | `app/dashboard/components/TaskColumn.tsx` | 看板列组件，包裹 TaskCard 列表 |
| TaskCard | `app/dashboard/components/TaskCard.tsx` | 任务卡片，展示任务信息 |
| RequirementCard | `app/dashboard/components/RequirementCard.tsx` | 需求卡片，含 Add Test 按钮 |
| TestCaseCard | `app/dashboard/components/TestCaseCard.tsx` | 测试用例卡片 |
| BugTracker | `app/dashboard/components/BugTracker.tsx` | Bug 跟踪 7 列看板，含 setTimeout 清理 |
| AgentWorkflow | `app/dashboard/components/AgentWorkflow.tsx` | React Flow 工作流画布，含 agentsRef 防陈旧闭包 |
| AgentNode | `app/dashboard/components/AgentNode.tsx` | 自定义 React Flow 节点，支持 IDLE/PAUSED 状态 |
| GoalTracker | `app/dashboard/components/GoalTracker.tsx` | 目标管理面板，含引用类型浅拷贝 |
| TimelineView | `app/dashboard/components/TimelineView.tsx` | 甘特图时间线，含无效日期过滤 |
| Modal | `app/dashboard/components/Modal.tsx` | 通用模态框，支持 task/requirement/test/bug 四种模式 |

### 4.3 自定义 Hook

| Hook | 文件路径 | 描述 |
|------|----------|------|
| useAgentLiveStatus | `app/dashboard/hooks/useAgentLiveStatus.ts` | 轮询 localStorage 获取活跃智能体状态，2s 间隔 |

### 4.4 关键修复点

- **RequirementCard**: `Add Test` 按钮添加 `stopPropagation` 防止冒泡；`getStatusStyle`/`getPriorityStyle` 添加 fallback 默认值。
- **Modal**: Test Case 模式 Executor 下拉框选项修复；表单 title 非空校验；steps/acceptanceCriteria 支持字符串自动转数组。
- **AgentNode**: IDLE/PAUSED 状态显示修复。
- **BugTracker**: `setTimeout` 清理防止内存泄漏。
- **AgentWorkflow**: 使用 `agentsRef` 解决陈旧闭包问题；`animationInterval` 改为 `useRef` 管理。
- **TestCaseCard**: `getStatusStyle` 添加 fallback 默认值。
- **GoalTracker**: `handleUpdateGoal` 对引用类型字段进行浅拷贝防数据污染。
- **TimelineView**: `dateRange` 过滤无效日期。
- **TaskColumn**: 移除冗余 key 避免性能问题。

---

## 五、安全机制

### 5.1 数据加密

- **算法**: AES-GCM 256 位对称加密。
- **密钥管理**: 首次使用时生成加密密钥，存储在 localStorage 中（`jira-clone-encryption-key`）。每次加密使用随机 12 字节 IV。
- **加密数据格式**: IV（12 字节） + 密文 -> Base64 编码。
- **容错**: 解密失败时尝试纯 JSON 解析（兼容旧格式），全部失败则使用默认数据。

### 5.2 密码哈希

- **算法**: SHA-256，通过 Web Crypto API (`crypto.subtle.digest`) 实现。
- **格式**: 对密码进行 UTF-8 编码后哈希，输出为十六进制字符串。

### 5.3 Token 生成

- **方法**: `crypto.getRandomValues(new Uint8Array(16))` 生成 16 字节随机数，转换为十六进制字符串，拼接时间戳。
- **格式**: `{timestamp}-{random_hex}`，存储在 `jira-clone-auth-token` 键中，同时保存 userId 用于精确查找用户。

### 5.4 用户认证与角色管理

- **注册校验**: 检查 email 格式（含 @）、密码长度（>=6 字符）、用户名/邮箱唯一性。
- **登录**: 递归深度限制（最大 2 层），防止无限递归。首次使用自动创建默认 admin 账号。
- **角色**: ADMIN（拥有所有权限）和 USER（受限权限）。
- **权限控制**: `hasPermission` 函数，ADMIN 角色自动通过所有权限检查。
- **getAuthState**: 按 userId 精确查找用户，避免返回错误用户。

### 5.5 隐私保护

- 首次使用时弹出隐私同意弹窗，用户同意后才开始数据持久化。
- 同意状态存储在 `jira-clone-privacy-consent` 键中。

---

## 六、脚本命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3000 或 3001） |
| `npm run predev` | 预启动脚本，清理 3000/3001/3002 端口的占用进程 |
| `npm run stop` | 停止开发服务器，清理 3000/3001/3002 端口 |
| `npm run build` | 生产构建（next build） |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |
| `npm run test` | 运行 Jest 单元测试 |
| `npm run test:watch` | 以 watch 模式运行测试 |

---

## 七、最近修复记录（2026-07-20）

### 7.4 登录问题修复（2026-07-20）

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `lib/auth.ts` | Chrome浏览器登录失败，密码哈希数据损坏 | 添加 `hashPasswordWithMD5` 函数兼容旧数据；登录逻辑先尝试SHA-256验证，失败则尝试MD5；检测到密码哈希长度<32字符时判定数据损坏，自动重置用户数据并重新创建默认管理员账户 |
| `lib/auth.ts` | 登录日志缺失 | 添加详细登录流程日志，包括环境检测、用户查找、哈希计算、匹配结果等 |

### 7.5 任务卡片编辑功能修复（2026-07-20）

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `app/dashboard/views/TasksView.tsx` | 任务卡片无法编辑 | 在 `TasksViewProps` 接口中添加 `setShowModal`；修改 `handleEditTask` 函数添加 `setShowModal(true)` |
| `app/dashboard/components/DashboardLayout.tsx` | 编辑弹窗不显示 | 将 `setShowModal` 传递给 `TasksView` 组件 |

### 7.6 数据完整性验证增强（2026-07-20）

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `app/dashboard/hooks/useValidation.ts` | 验证错误日志被截断，无法定位具体错误项 | 增强日志输出，记录每个失败实体的类型、ID、字段和错误消息 |

### 7.7 管理员用户添加（2026-07-20）

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `app/dashboard/contexts/TaskContext.tsx` | 任务 assignee 选项缺少管理员 | 在任务分配选项中添加管理员用户 |

### 7.1 安全模块修复（2026-07-08）

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `lib/auth.ts` | `getAuthState` 返回错误用户 | 改为按 `authData.userId` 精确查找用户，而非返回第一个用户 |
| `lib/auth.ts` | 密码哈希安全性不足 | `hashPassword` 改用 SHA-256（Web Crypto API）替代原有实现 |
| `lib/auth.ts` | Token 生成不够安全 | `generateToken` 改用 `crypto.getRandomValues` 生成随机令牌 |
| `lib/auth.ts` | 无效赋值语句 | 删除 `hash = hash & hash` 无效代码 |
| `lib/auth.ts` | 递归无限制 | `login` 添加 `depth` 参数，最大递归深度限制为 2 |
| `lib/auth.ts` | 注册缺少校验 | `register` 添加 email 格式校验（含 @）和密码长度校验（>=6） |
| `lib/encryption.ts` | Base64 编码 Bug | 修复 `uint8ArrayToBase64` 中二进制字符串编码问题，确保字节级正确编码 |
| `lib/encryption.ts` | 加密缺少异常处理 | `encryptData` 添加 try-catch 保护，失败时返回 null |
| `LoginForm` | 内存泄漏 | `setTimeout` 添加清理逻辑，组件卸载时清除定时器 |

### 7.2 UI 组件修复

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `RequirementCard` | Add Test 按钮事件冒泡 | 添加 `stopPropagation` 防止触发父元素事件 |
| `RequirementCard` | 样式函数缺少 fallback | `getStatusStyle`/`getPriorityStyle` 添加默认返回值 |
| `Modal` | Test Case 模式 Executor 下拉框错误 | 修复下拉框选项映射 |
| `Modal` | 表单 title 未校验 | 添加非空校验，阻止空标题提交 |
| `Modal` | steps/acceptanceCriteria 类型错误 | 支持字符串自动转为数组格式 |
| `AgentNode` | IDLE/PAUSED 状态显示异常 | 修复状态判断逻辑，确保两种状态正确渲染 |
| `BugTracker` | 内存泄漏 | `setTimeout` 添加清理逻辑 |
| `AgentWorkflow` | 陈旧闭包问题 | 使用 `agentsRef` 引用最新 agents 值 |
| `AgentWorkflow` | 动画定时器管理不当 | `animationInterval` 改为 `useRef` 管理，确保正确清理 |
| `TestCaseCard` | 样式函数缺少 fallback | `getStatusStyle` 添加默认返回值 |

### 7.3 数据流修复

| 文件 | 问题 | 修复内容 |
|------|------|----------|
| `page.tsx` | `useLayoutEffect` 无取消机制 | 添加 `cancelled` 标志，组件卸载时跳过无效状态更新 |
| `page.tsx` | `handleClearAllData` 清除不完整 | 添加 bugs、operationLogs、goals 的清除逻辑 |
| `page.tsx` | `handleSaveRequirement` 日期格式不统一 | 使用 `new Date().toISOString()` 统一 createdAt/updatedAt 格式 |
| `page.tsx` | TagHistory 重复条目 | 使用 Set 去重，避免重复标签 |
| `GoalTracker` | `handleUpdateGoal` 引用类型未拷贝 | 对 relatedRequirementIds/relatedTaskIds 进行浅拷贝 |
| `TimelineView` | 无效日期导致渲染异常 | 过滤无效日期数据 |
| `subagent-bridge` | `dispatchAgent` 缺少参数校验 | 添加 agentId 和 taskName 非空校验 |
| `TaskColumn` | 冗余 key 属性 | 移除多余的 key 属性 |

---

## 附录

### A. 文件结构

```
demo01/
├── app/
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── AgentNode.tsx
│   │   │   ├── AgentWorkflow.tsx
│   │   │   ├── BugTracker.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardNavigation.tsx
│   │   │   ├── GoalTracker.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationSettingsPanel.tsx
│   │   │   ├── RequirementCard.tsx
│   │   │   ├── SubagentProgressIndicator.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskColumn.tsx
│   │   │   ├── TestCaseCard.tsx
│   │   │   └── TimelineView.tsx
│   │   ├── contexts/
│   │   │   ├── AuditContext.tsx
│   │   │   ├── BugContext.tsx
│   │   │   ├── GoalContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   ├── RequirementContext.tsx
│   │   │   ├── SharedContext.tsx
│   │   │   ├── TaskContext.tsx
│   │   │   ├── TestCaseContext.tsx
│   │   │   └── index.ts
│   │   ├── data/
│   │   │   └── default-data.ts
│   │   ├── hooks/
│   │   │   ├── useAgentLiveStatus.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useDataLoader.ts
│   │   │   ├── usePersistence.ts
│   │   │   ├── useValidation.ts
│   │   │   └── useWindow.ts
│   │   ├── services/
│   │   │   ├── AuditService.ts
│   │   │   ├── BugService.ts
│   │   │   ├── GoalService.ts
│   │   │   ├── NotificationService.ts
│   │   │   ├── RequirementService.ts
│   │   │   ├── SubagentTaskService.ts
│   │   │   ├── TaskService.ts
│   │   │   ├── TestCaseService.ts
│   │   │   ├── ValidationService.ts
│   │   │   └── index.ts
│   │   ├── views/
│   │   │   ├── AuditView.tsx
│   │   │   ├── BugsView.tsx
│   │   │   ├── GoalsView.tsx
│   │   │   ├── NotificationsView.tsx
│   │   │   ├── RequirementsView.tsx
│   │   │   ├── TasksView.tsx
│   │   │   ├── TestingView.tsx
│   │   │   └── index.ts
│   │   ├── constants.ts
│   │   ├── page.tsx
│   │   └── types.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   ├── encoding.ts
│   ├── encryption.ts
│   ├── privacy.ts
│   └── validation.ts
├── __tests__/
│   ├── additional.test.tsx
│   ├── admin-preservation.test.tsx
│   ├── api-validation.test.ts
│   ├── auth.test.ts
│   ├── bug-tracker.test.tsx
│   ├── components.test.tsx
│   ├── dashboard-layout.test.tsx
│   ├── dashboard.test.tsx
│   ├── encoding.test.ts
│   ├── encryption.test.ts
│   ├── notification-system.test.tsx
│   ├── privacy.test.ts
│   └── usePersistence.test.ts
├── docs/
│   ├── superpowers/
│   │   └── specs/
│   │       └── 2026-07-13-subagent-notification-system-design.md
│   └── TECHNICAL.md
├── .cursorrules
├── CHANGE_LOG.md
├── CODE_STYLE.md
├── DESIGN_SPEC.md
├── WORKFLOW_RULES.md
├── README.md
├── jest.config.js
├── jest.d.ts
├── jest.setup.js
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── 使用说明.txt
└── 启动项目.bat
```

### B. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0.0 | 2026-07-07 | 初始版本，包含全部 8 个功能模块 |
| v1.0.1 | 2026-07-08 | 安全模块、UI 组件、数据流全面修复（详见第七章） |
| v1.0.2 | 2026-07-13 | 添加 Subagent 调度通知系统，引入 Superpowers 七步工作流 |
| v1.1.0 | 2026-07-11 | Dashboard组件大规模重构，拆分为15+组件、6个Context、4个服务、6个Hook |
| v1.2.0 | 2026-07-17 | Epic功能完善：删除、编辑、性能优化与测试 |
| v1.3.0 | 2026-07-20 | 登录问题修复（Chrome浏览器）、任务卡片编辑功能修复、数据完整性验证增强、管理员用户添加 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-20*