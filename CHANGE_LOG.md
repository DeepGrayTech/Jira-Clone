# 项目变更归档记录

> **项目名称**: Jira Clone - 任务管理系统
> **归档日期**: 2026-07-21
> **归档版本**: v1.4.0

---

## 📋 目录

1. [变更概览](#-变更概览)
2. [详细变更记录](#-详细变更记录)
   - [2026-07-17 Epic功能完善：删除、编辑、性能优化与测试](#2026-07-17-epic功能完善删除编辑性能优化与测试)
   - [2026-07-11 Dashboard组件大规模重构](#2026-07-11-dashboard组件大规模重构)
   - [2026-07-11 Agents页面工作流布局优化](#2026-07-11-agents页面工作流布局优化)
   - [2026-07-11 Mock数据构造](#2026-07-11-mock数据构造)
   - [2026-07-11 Requirements和Testing页面卡片样式复用](#2026-07-11-requirements和testing页面卡片样式复用)
   - [2026-07-11 Requirements和Testing标签页卡片宽度修复](#2026-07-11-requirements和testing标签页卡片宽度修复)
   - [2026-07-11 AI Agents页面显示修复](#2026-07-11-ai-agents页面显示修复)
   - [2026-07-11 登录问题修复](#2026-07-11-登录问题修复)
   - [2026-07-07 Bug Tracker功能](#2026-07-07-bug-tracker功能)
   - [2026-07-07 验证人角色完善](#2026-07-07-验证人角色完善)
   - [2026-07-07 统计逻辑修复](#2026-07-07-统计逻辑修复)
   - [2026-07-07 验证人下拉列表完善](#2026-07-07-验证人下拉列表完善)
   - [2026-07-07 单元测试](#2026-07-07-单元测试)
   - [2026-07-07 Workflow页面节点间距调整](#2026-07-07-workflow页面节点间距调整)
   - [2026-07-07 Agents页面Total显示修复](#2026-07-07-agents页面total显示修复)
   - [2026-07-07 Jira Clone项目开发过程管理](#2026-07-07-jira-clone项目开发过程管理)
   - [2026-07-07 Mock数据构造](#2026-07-07-mock数据构造)
   - [2026-07-07 需求提出者和执行者标识](#2026-07-07-需求提出者和执行者标识)
   - [2026-07-07 Task页面布局优化](#2026-07-07-task页面布局优化)
   - [2026-07-07 Workflow流程图布局调整](#2026-07-07-workflow流程图布局调整)
   - [2026-07-07 React Flow动态交互式流程图](#2026-07-07-react-flow动态交互式流程图)
3. [文件变更清单](#-文件变更清单)
4. [功能模块清单](#-功能模块清单)
5. [测试用例清单](#-测试用例清单)

---

## 📊 变更概览

### v1.3.0 (2026-07-20)

| 模块 | 变更类型 | 变更数量 | 状态 |
|------|----------|----------|------|
| Login | 修复 | Chrome浏览器登录失败（密码哈希数据损坏） | ✅ 完成 |
| Login | 新增 | MD5哈希函数兼容旧数据 | ✅ 完成 |
| Login | 新增 | 数据损坏自动检测和修复机制 | ✅ 完成 |
| Tasks | 修复 | 任务卡片编辑功能（assignee无法添加） | ✅ 完成 |
| Validation | 优化 | 数据完整性验证错误日志增强 | ✅ 完成 |
| Tasks | 新增 | 管理员用户添加到assignee选项 | ✅ 完成 |

### v1.4.0 (2026-07-21)

|| 模块 | 变更类型 | 变更数量 | 状态 |
|------|----------|----------|------|
|| Backend | 重构 | 所有业务 Context 切换为 API 优先 + localStorage 回退 | ✅ 完成 |
|| Backend | 新增 | Prisma + SQLite 后端 API 与数据模型 | ✅ 完成 |
|| Auth | 修复 | NextAuth 登录失败，清理构建缓存后恢复 | ✅ 完成 |
|| Data | 决定 | 放弃从 localStorage 恢复旧数据，保持数据库现状 | ✅ 完成 |
|| Tests | 修复 | 8 个 Context 测试套件改为 async act + API mock | ✅ 通过 |
|| Tests | 修复 | useDataLoader 日志期望修复、EpicService 占位测试 | ✅ 通过 |
|| Docs | 新增 | README、架构、API、Context、Hooks、Services、视图、Lib、Database、Scripts 文档 | ✅ 完成 |
|| Docs | 更新 | CHANGE_LOG 归档版本更新为 v1.4.0 | ✅ 完成 |
|| Docs | 新增 | docs/index.md 文档总览地图、docs/module-readme-template.md 模块模板 | ✅ 完成 |
|| Docs | 补充 | 全模块文档统一加入输入-过程-输出（IPO）和流程图 | ✅ 完成 |
|| Tests | 修复 | 6 个 UI/认证测试套件适配 NextAuth Session 与 API mock（39 套件 / 952 用例全通过） | ✅ 通过 |
|| Import | 修复 | useDashboardLogic 导入数据嵌套读取错误，正常导出文件可导入 | ✅ 完成 |
|| Import/Export | 补齐 | 导出新增 epics；导入时 milestones/keyResults 按 goalId 归巢进 goals，/api/import 兼容 target/current 与 targetValue/currentValue | ✅ 完成 |
|| Auth | 清理 | 删除 lib/auth.ts 旧 localStorage 认证（register/login/getAuthState 等），仅保留 UserRole 与 logoutAndClear | ✅ 完成 |
|| Tests | 删除 | 移除 2 个过期认证测试套件（auth.test.ts、admin-preservation.test.tsx） | ✅ 完成 |
|| Tests | 修复 | 22 个测试文件 TypeScript 类型错误清零，npx tsc --noEmit 通过 | ✅ 完成 |
|| Bugs | 修复 | Prisma Bug 模型补齐 status/reporter/verifier/comments 等 12 个字段（新迁移 add_bug_fields），修复卡片状态无法变更：POST/PUT/import 路由与 mapBug 全链路支持 | ✅ 完成 |
|| Bugs | 修复 | Bug 详情弹窗新增 Edit 按钮，接通 onEditBug 编辑入口 | ✅ 完成 |
|| Auth | 新增 | seed 创建 Admin 账号 admin@example.com（role: ADMIN） | ✅ 完成 |
|| Security | 修复 | 删除 hashPassword 明文密码日志；登录页默认账号提示改为 demo | ✅ 完成 |
|| Epic | 新增 | EpicSelector 新增 "No Epic" 过滤器（NO_EPIC_FILTER 哨兵 + matchesEpicFilter/epicIdForCreate，五个视图统一过滤逻辑） | ✅ 完成 |
|| Modal | 新增 | 创建/编辑弹窗新增 Epic 归属下拉（FormFields.epicId；新建默认跟随过滤器，编辑支持改派/清空） | ✅ 完成 |
|| Components | 新增 | EpicBadge 卡片 Epic 徽标（接入 TaskCard/RequirementCard/BugCard）；EpicContext 新增 useEpicsOptional | ✅ 完成 |
|| Backend | 新增 | TestCase 模型新增 epicId（迁移 add_testcase_epicid），test-cases 路由接受 epicId；serializeBug 转发全部字段，epicId 空串转 null | ✅ 完成 |
|| Tests | 新增 | __tests__/epic-filter.test.ts（5 用例），40 套件 / 957 用例全通过 | ✅ 通过 |

### v1.2.0 (2026-07-17)

| 模块 | 变更类型 | 变更数量 | 状态 |
|------|----------|----------|------|
| Epic | 新增 | 删除功能（含级联删除、竞态防护） | ✅ 完成 |
| Epic | 新增 | 编辑功能（标题、描述、颜色） | ✅ 完成 |
| Epic | 优化 | 渲染性能优化（React.memo、useCallback、useMemo） | ✅ 完成 |
| Epic | 新增 | 性能分析（React.Profiler、Performance API） | ✅ 完成 |
| Epic | 新增 | 结构化日志埋点 | ✅ 完成 |
| Epic | 测试 | 删除/编辑功能交互测试 | ✅ 通过 |

### v1.1.0 (2026-07-11)

| 模块 | 变更类型 | 变更数量 | 状态 |
|------|----------|----------|------|
| Dashboard | 重构 | 拆分为15+组件、6个Context、4个服务、6个Hook | ✅ 完成 |
| Agents | 优化 | 工作流布局重新设计为3×3网格，按开发阶段分层 | ✅ 完成 |
| Mock数据 | 新增 | 11种实体的默认数据 | ✅ 完成 |
| Requirements | 优化 | 卡片样式复用TaskCard | ✅ 完成 |
| Testing | 优化 | 卡片样式复用TaskCard | ✅ 完成 |
| Agents | 修复 | 工作流图显示修复 | ✅ 完成 |
| Login | 修复 | 构建缓存导致的资源加载失败 | ✅ 完成 |

### v1.0.0 (2026-07-07)

| 模块 | 变更类型 | 变更数量 | 状态 |
|------|----------|----------|------|
| Bug Tracker | 新增 | 1个页面 + 1个组件 + 类型定义 | ✅ 完成 |
| Workflow | 优化 | 组件布局调整 | ✅ 完成 |
| Agents | 修复 | 统计逻辑修复 | ✅ 完成 |
| Tasks | 优化 | 布局调整 | ✅ 完成 |
| Requirements | 新增 | 提出者/执行者字段 | ✅ 完成 |
| 测试 | 新增 | 单元测试 | ✅ 完成 |

---

## 📝 详细变更记录

### 2026-07-20 登录问题修复与功能完善

**变更描述**: 修复Chrome浏览器登录失败问题，完善任务编辑功能，增强数据完整性验证

**变更内容**:

#### 1. 登录问题修复（Chrome浏览器）
- 检测到密码哈希数据损坏问题（存储的哈希仅7字符，正常应为64字符SHA-256或32字符MD5）
- 添加 `hashPasswordWithMD5` 函数，支持MD5哈希验证以兼容旧数据
- 修改登录逻辑：先尝试SHA-256哈希验证，失败则尝试MD5
- 实现数据损坏自动检测和修复机制：当检测到密码哈希长度<32字符时，自动删除损坏数据，重新创建默认管理员账户
- 添加详细登录流程日志，便于问题排查

#### 2. 任务卡片编辑功能修复
- 在 `TasksViewProps` 接口中添加 `setShowModal` 属性
- 修改 `handleEditTask` 函数，添加 `setShowModal(true)` 显示编辑弹窗
- 在 `DashboardLayout` 中将 `setShowModal` 传递给 `TasksView` 组件
- 修复任务创建后无法编辑添加assignee的问题

#### 3. 数据完整性验证增强
- 增强 `useValidation.ts` 的错误日志输出
- 记录每个失败实体的类型、ID、字段和错误消息
- 解决日志被截断无法定位具体错误项的问题

#### 4. 管理员用户添加
- 在任务分配选项中添加管理员用户
- 确保所有assignee选项包含管理员

**涉及文件**:
- `lib/auth.ts` - 添加MD5哈希函数、数据损坏检测和自动修复逻辑、登录日志
- `app/dashboard/views/TasksView.tsx` - 添加 `setShowModal` 属性和调用
- `app/dashboard/components/DashboardLayout.tsx` - 传递 `setShowModal` 给 `TasksView`
- `app/dashboard/hooks/useValidation.ts` - 增强错误日志输出
- `app/dashboard/contexts/TaskContext.tsx` - 添加管理员用户到assignee选项

---

### 2026-07-17 Epic功能完善：删除、编辑、性能优化与测试

**变更描述**: 完善Epic模块功能，添加删除和编辑操作，实施性能优化，并添加完整的测试验证

**变更内容**:

#### 1. Epic删除功能
- 添加删除确认弹窗，支持级联删除关联数据（任务、需求、测试用例、Bug、目标、里程碑、关键结果、评论）
- 实现竞态条件防护，防止快速连续点击删除按钮导致重复操作
- 在删除确认按钮添加null检查，防止双击触发多次删除

#### 2. Epic编辑功能
- 在Epic列表项中添加编辑按钮（✏️图标）
- 实现编辑弹窗，支持修改标题、描述和颜色
- 使用useCallback稳定回调函数引用

#### 3. 性能优化
- 使用React.memo包装EpicSelector组件和EpicListItem组件，减少不必要的重渲染
- 使用useCallback稳定回调函数（handleSelectEpic、handleDeleteEpic、handleEditEpic、confirmEditEpic）
- 使用useMemo缓存过滤后的activeEpics列表和样式对象

#### 4. 性能分析
- 添加React.Profiler包装EpicSelector组件，测量渲染性能
- 使用Performance API标记测量完整删除/编辑周期（mark/measure）
- 记录性能指标：actualDuration、baseDuration、commit时间、fullCycle耗时

#### 5. 结构化日志埋点
- 删除流程日志：[DashboardLayout] onDeleteEpic、confirmDeleteEpic、级联删除统计
- 编辑流程日志：[DashboardLayout] handleEditEpic、confirmEditEpic（starting/completed）
- EpicContext日志：[EpicContext] DELETE epic、UPDATE epic（记录changedFields）
- 性能日志：[Perf] Epic Delete、[Perf] Epic Update

#### 6. 测试验证
- 删除流程测试：验证竞态防护、级联删除、任务列表刷新、控制台日志输出
- 编辑流程测试：验证弹窗打开、标题/描述/颜色修改、保存、数据持久化

**涉及文件**:
- `app/dashboard/components/DashboardLayout.tsx` - 删除/编辑确认逻辑、竞态保护、性能分析、编辑弹窗
- `app/dashboard/components/EpicSelector.tsx` - React.memo优化、编辑按钮、EpicListItem组件拆分
- `app/dashboard/contexts/EpicContext.tsx` - 删除/编辑操作日志
- `app/dashboard/services/EpicService.ts` - Epic数据处理

---

### 2026-07-11 Dashboard组件大规模重构

**变更描述**: 将超过4200行的Dashboard"上帝组件"拆分为分层架构，遵循单一职责原则

**变更内容**:
- 将Dashboard组件拆分为多个专注的视图组件（TasksView、RequirementsView、TestingView、BugsView、GoalsView、AgentsView、AuditView）
- 创建独立的Context状态管理（TaskContext、RequirementContext、BugContext、GoalContext、AgentContext、AuditContext）
- 提取服务层（TaskService、RequirementService、ValidationService、AuditService）
- 创建自定义Hooks（useAuth、useWindow、useDataLoader、usePersistence、useValidation、useAgentLiveStatus）
- 创建布局组件（DashboardLayout、DashboardNavigation）
- 重构数据加载逻辑，支持localStorage持久化和默认数据合并

**涉及文件**:
- `app/dashboard/page.tsx` - 重构入口，引入DashboardLayout
- `app/dashboard/components/DashboardLayout.tsx` - 主布局组件
- `app/dashboard/components/DashboardNavigation.tsx` - 导航组件
- `app/dashboard/components/TaskCard.tsx` - 任务卡片组件
- `app/dashboard/components/TaskColumn.tsx` - 任务列组件
- `app/dashboard/components/RequirementCard.tsx` - 需求卡片组件
- `app/dashboard/components/TestCaseCard.tsx` - 测试用例卡片组件
- `app/dashboard/components/AgentWorkflow.tsx` - 工作流组件
- `app/dashboard/components/AgentNode.tsx` - 智能体节点组件
- `app/dashboard/contexts/TaskContext.tsx` - 任务状态管理
- `app/dashboard/contexts/RequirementContext.tsx` - 需求状态管理
- `app/dashboard/contexts/BugContext.tsx` - Bug状态管理
- `app/dashboard/contexts/GoalContext.tsx` - 目标状态管理
- `app/dashboard/contexts/AgentContext.tsx` - 智能体状态管理
- `app/dashboard/contexts/AuditContext.tsx` - 审计日志管理
- `app/dashboard/services/TaskService.ts` - 任务服务
- `app/dashboard/services/RequirementService.ts` - 需求服务
- `app/dashboard/services/ValidationService.ts` - 验证服务
- `app/dashboard/services/AuditService.ts` - 审计服务
- `app/dashboard/hooks/useAuth.ts` - 认证Hook
- `app/dashboard/hooks/useWindow.ts` - 窗口尺寸Hook
- `app/dashboard/hooks/useDataLoader.ts` - 数据加载Hook
- `app/dashboard/hooks/usePersistence.ts` - 持久化Hook
- `app/dashboard/hooks/useValidation.ts` - 验证Hook
- `app/dashboard/hooks/useAgentLiveStatus.ts` - 智能体状态Hook
- `app/dashboard/views/TasksView.tsx` - 任务视图
- `app/dashboard/views/RequirementsView.tsx` - 需求视图
- `app/dashboard/views/TestingView.tsx` - 测试视图
- `app/dashboard/views/BugsView.tsx` - Bug视图
- `app/dashboard/views/GoalsView.tsx` - 目标视图
- `app/dashboard/views/AgentsView.tsx` - 智能体视图
- `app/dashboard/views/AuditView.tsx` - 审计视图
- `app/dashboard/data/default-data.ts` - 默认Mock数据

---

### 2026-07-11 Agents页面工作流布局优化

**变更描述**: 根据软件开发生命周期重新设计智能体工作流布局，使布局更符合实际业务流程

**变更内容**:
- 将智能体从左右交错布局改为3×3网格布局，按开发阶段分层
- 第一行：需求粉碎机（需求分析）→ 系统拆弹专家（架构设计）→ 配色狂魔（UI设计）
- 第二行：像素魔法师（前端开发）→ 数据大厨（后端开发）→ 代码找茬王（代码审查）
- 第三行：Bug猎手（测试）→ 规矩守护者（合规审查）→ 文档整理控（文档管理）
- 重新设计连线关系，体现实际工作流程：
  - 需求→设计→开发的单向依赖
  - 前端/后端并行开发后汇总到代码审查
  - 代码审查后进入测试和合规
  - 所有角色都连接到文档管理
- 业务流程连线带动画效果，文档关联连线为静态

**涉及文件**:
- `app/dashboard/components/AgentWorkflow.tsx` - 布局和连线逻辑重写

---

### 2026-07-11 Mock数据构造

**变更描述**: 为所有实体构造完整的Mock数据，支持重构后视图组件的测试验证

**变更内容**:
- 为任务、需求、测试用例、Bug、目标、里程碑、关键结果、智能体、审计日志、智能体分配、评论创建默认数据
- 确保所有视图组件在无真实数据时也能正常渲染
- 数据支持localStorage持久化，刷新后保持状态

**涉及文件**:
- `app/dashboard/data/default-data.ts` - 默认数据定义
- `app/dashboard/hooks/useDataLoader.ts` - 数据加载逻辑

---

### 2026-07-11 Requirements和Testing页面卡片样式复用

**变更描述**: 统一Requirements和Testing页面的卡片样式，复用Tasks页面的设计风格

**变更内容**:
- RequirementCard移除硬编码的minWidth/maxWidth，卡片宽度由容器控制
- 统一padding为`isSmall ? "8px" : "12px"`
- 统一borderRadius为`8px`
- 统一标题字体大小为`${13 * fontSizeScale}px`
- 统一状态标签样式（字体9px，padding 2px 6px）
- TestCaseCard应用相同样式调整
- 为两个卡片组件添加`isSmall`和`fontSizeScale` props支持响应式设计

**涉及文件**:
- `app/dashboard/components/RequirementCard.tsx` - 卡片样式调整
- `app/dashboard/components/TestCaseCard.tsx` - 卡片样式调整
- `app/dashboard/views/RequirementsView.tsx` - 传递新props
- `app/dashboard/views/TestingView.tsx` - 传递新props

---

### 2026-07-11 Requirements和Testing标签页卡片宽度修复

**变更描述**: 修复Requirements和Testing标签页卡片靠右显示的问题

**变更内容**:
- 将列样式从`minWidth`改为`width`，并添加`flexShrink: 0`防止列收缩
- 统一列宽为`isSmall ? "95%" : "280px"`，确保与Tasks页面一致

**涉及文件**:
- `app/dashboard/views/RequirementsView.tsx` - 列宽调整
- `app/dashboard/views/TestingView.tsx` - 列宽调整

---

### 2026-07-11 AI Agents页面显示修复

**变更描述**: 修复AI Agents页面工作流图无法显示的问题

**变更内容**:
- 修复useAgentLiveStatus Hook类型错误
- 更新AgentWorkflow组件接口，添加缺失属性
- 确保React Flow组件具有有效高度和背景
- 添加适当的错误处理

**涉及文件**:
- `app/dashboard/components/AgentWorkflow.tsx` - 接口修复
- `app/dashboard/hooks/useAgentLiveStatus.ts` - Hook修复
- `app/dashboard/views/AgentsView.tsx` - 调用修复

---

### 2026-07-11 登录问题修复

**变更描述**: 修复构建缓存导致的登录页面资源加载失败问题

**变更内容**:
- 清理`.next`构建目录
- 重新启动开发服务器
- 确保构建产物与开发服务器兼容

**涉及文件**:
- `.next/` - 清理构建缓存

---

### 2026-07-07 Bug Tracker功能

**变更描述**: 新增Bug追踪页面，实现完整的Bug反馈和修复闭环

**变更内容**:
- 新增Bug相关类型定义（Bug、BugStatus、BugSeverity、BugPriority、BugComment）
- 新增BugTracker组件，实现7列看板视图
- 更新主页面添加Bug页面导航和功能
- 添加8个Mock数据示例

**涉及文件**:
- `app/dashboard/types.ts` - 添加类型定义
- `app/dashboard/constants.ts` - 添加BUGS存储键
- `app/dashboard/components/BugTracker.tsx` - 新增组件
- `app/dashboard/page.tsx` - 集成Bug功能

---

### 2026-07-07 验证人角色完善

**变更描述**: 为Bug生命周期添加验证人角色，明确修复后的审核流程

**变更内容**:
- 在Bug类型中添加`verifier`字段
- 在Bug详情弹窗中添加验证人选择功能
- 添加Bug生命周期流程图和流转说明

**涉及文件**:
- `app/dashboard/types.ts` - 添加verifier字段
- `app/dashboard/components/BugTracker.tsx` - 添加验证人选择和流程说明

---

### 2026-07-07 统计逻辑修复

**变更描述**: 修复Unresolved统计逻辑，将RESOLVED状态也计入已解决

**变更内容**:
- 修改统计逻辑：`!["RESOLVED", "VERIFIED", "CLOSED"].includes(b.status)`
- 之前只统计VERIFIED和CLOSED为已解决，现在包含RESOLVED

**涉及文件**:
- `app/dashboard/components/BugTracker.tsx` - 第308行

---

### 2026-07-07 验证人下拉列表完善

**变更描述**: 完善验证人下拉列表选项，添加所有我方人员

**变更内容**:
- 将下拉选项从8个扩展到16个（含默认选项）
- 按分组显示：客户组、测试人员组、我方人员组
- 添加缺失的人员：需求粉碎机、代码找茬王、规矩守护者、Bug猎手、文档整理控

**涉及文件**:
- `app/dashboard/components/BugTracker.tsx` - 第544-566行

---

### 2026-07-07 单元测试

**变更描述**: 为BugTracker组件编写单元测试

**变更内容**:
- 编写12个测试用例
- 覆盖验证人下拉列表的所有分组和选项选择场景
- 测试全部通过

**涉及文件**:
- `__tests__/bug-tracker.test.tsx` - 新增测试文件

---

### 2026-07-07 Workflow页面节点间距调整

**变更描述**: 增加Workflow流程图中节点之间的垂直间距

**变更内容**:
- 将节点垂直间距从144px增加到210px
- 使节点完全错开，提升可视化效果

**涉及文件**:
- `app/dashboard/components/AgentWorkflow.tsx` - nodePositions配置

---

### 2026-07-07 Agents页面Total显示修复

**变更描述**: 修复Agents页面中Total显示为0的问题

**变更内容**:
- 将Total计算方式从`agentAssignmentsList.length`改为`agent.tasksCompleted + agent.tasksFailed`
- 同步修复完成率计算逻辑

**涉及文件**:
- `app/dashboard/page.tsx` - Agents页面统计逻辑

---

### 2026-07-07 Jira Clone项目开发过程管理

**变更描述**: 将项目开发过程添加到Jira Clone中管理

**变更内容**:
- 添加完整的项目开发流程Mock数据
- 关联需求、任务和测试用例
- 管理已完成和未完成工作

**涉及文件**:
- `app/dashboard/page.tsx` - Mock数据

---

### 2026-07-07 Mock数据构造

**变更描述**: 构造包含多个不同提出者和执行者的Mock数据

**变更内容**:
- 创建多样化的需求、任务、测试用例数据
- 关联提出者和执行者信息
- 验证界面显示效果

**涉及文件**:
- `app/dashboard/page.tsx` - Mock数据

---

### 2026-07-07 需求提出者和执行者标识

**变更描述**: 为需求添加输入和输出标识

**变更内容**:
- 在Requirement类型中添加`requester`和`executor`字段
- 在需求卡片中显示提出者和执行者信息
- 在表单中添加相关字段

**涉及文件**:
- `app/dashboard/types.ts` - 添加字段定义
- `app/dashboard/components/RequirementCard.tsx` - 显示提出者和执行者
- `app/dashboard/components/Modal.tsx` - 表单字段

---

### 2026-07-07 Task页面布局优化

**变更描述**: 优化Task页面排版布局

**变更内容**:
- 调整TaskColumn列宽和最大宽度
- 调整TaskCard卡片内边距和标签尺寸
- 增加卡片间距，解决布局拥挤问题

**涉及文件**:
- `app/dashboard/components/TaskColumn.tsx` - 列宽调整
- `app/dashboard/components/TaskCard.tsx` - 卡片样式调整

---

### 2026-07-07 Workflow流程图布局调整

**变更描述**: 调整Workflow流程图布局，解决遮挡和连接线扭曲问题

**变更内容**:
- 将节点从横向多排改为纵向单列布局
- 后调整为左右交错布局
- 使用SmoothStepEdge优化连接线
- 修复定时器内存泄漏问题

**涉及文件**:
- `app/dashboard/components/AgentWorkflow.tsx` - 布局调整
- `app/dashboard/components/AgentNode.tsx` - 连接点调整

---

### 2026-07-07 React Flow动态交互式流程图

**变更描述**: 使用React Flow库实现多智能体工作流动态可视化

**变更内容**:
- 实现9个智能体节点的可视化
- 添加状态指示器和连接线动画
- 实现Start/Pause/Reset控制按钮
- 添加节点状态流转动画效果

**涉及文件**:
- `app/dashboard/components/AgentWorkflow.tsx` - 新增组件
- `app/dashboard/components/AgentNode.tsx` - 自定义节点组件
- `package.json` - 添加@xyflow/react依赖

---

## 📁 文件变更清单

### v1.4.0 (2026-07-21)

| 文件路径 | 变更类型 | 变更描述 |
|----------|----------|----------|
| `docs/prisma.md` | 新增 | Prisma 与数据库客户端说明 |
| `docs/database.md` | 新增 | 数据库 schema、数据模型与 seed 脚本说明 |
| `docs/api-mappers.md` | 新增 | API 数据映射器（JSON/枚举/别名转换）说明 |
| `docs/lib-detail.md` | 新增 | 工具库 lib 各文件详细说明 |
| `docs/hooks-detail.md` | 新增 | 7 个自定义 Hooks 详细说明 |
| `docs/contexts-detail.md` | 新增 | 10 个 Context 详细说明 |
| `docs/views-and-components-detail.md` | 新增 | Dashboard 视图与组件结构说明 |
| `docs/tests-detail.md` | 新增 | 测试文件清单与失败套件说明 |
| `docs/scripts-detail.md` | 新增 | 脚本工具（覆盖率、诊断）说明 |
| `docs/api.md` | 更新 | 补充所有 API 路由的输入-过程-输出（IPO）说明 |
| `docs/services.md` | 更新 | 补充所有 Services 的输入-过程-输出（IPO）说明 |
| `docs/types.md` | 更新 | 补充类型守卫流程图 |
| `docs/constants.md` | 更新 | 补充数据版本检查与状态标签使用流程 |
| `docs/hooks.md` | 更新 | 补充所有 Hooks 的输入-过程-输出（IPO）说明 |
| `docs/contexts.md` | 更新 | 补充通用 Context 模式和各 Context 的输入-过程-输出 |
| `docs/index.md` | 更新 | 更新文档总览地图，链接新文档 |
| `CHANGE_LOG.md` | 更新 | 归档 v1.4.0 文档补充变更 |

### v1.3.0 (2026-07-20)

| 文件路径 | 变更类型 | 变更描述 |
|----------|----------|----------|
| `lib/auth.ts` | 修改 | 添加MD5哈希函数、数据损坏检测和自动修复逻辑、登录日志 |
| `app/dashboard/views/TasksView.tsx` | 修改 | 添加 `setShowModal` 属性和调用 |
| `app/dashboard/components/DashboardLayout.tsx` | 修改 | 传递 `setShowModal` 给 `TasksView` |
| `app/dashboard/hooks/useValidation.ts` | 修改 | 增强错误日志输出 |
| `app/dashboard/contexts/TaskContext.tsx` | 修改 | 添加管理员用户到assignee选项 |
| `docs/TECHNICAL.md` | 修改 | 更新版本号、添加最新修复记录 |
| `CHANGE_LOG.md` | 修改 | 添加v1.3.0变更记录 |

### v1.2.0 (2026-07-17)

| 文件路径 | 变更类型 | 变更描述 |
|----------|----------|----------|
| `app/dashboard/components/DashboardLayout.tsx` | 修改 | 添加删除确认弹窗、编辑弹窗、竞态防护、性能分析、日志埋点 |
| `app/dashboard/components/EpicSelector.tsx` | 修改 | React.memo优化、拆分EpicListItem组件、添加编辑按钮 |
| `app/dashboard/contexts/EpicContext.tsx` | 修改 | 添加DELETE/UPDATE操作日志 |
| `app/dashboard/services/EpicService.ts` | 修改 | Epic数据处理支持 |

### v1.1.0 (2026-07-11)

| 文件路径 | 变更类型 | 变更描述 |
|----------|----------|----------|
| `app/dashboard/page.tsx` | 重构 | 引入DashboardLayout，移除4200+行代码 |
| `app/dashboard/components/DashboardLayout.tsx` | 新增 | 主布局组件，集成所有Context |
| `app/dashboard/components/DashboardNavigation.tsx` | 新增 | 导航组件，管理视图切换 |
| `app/dashboard/components/TaskCard.tsx` | 修改 | 提取为独立组件 |
| `app/dashboard/components/TaskColumn.tsx` | 修改 | 提取为独立组件 |
| `app/dashboard/components/RequirementCard.tsx` | 修改 | 样式复用TaskCard，添加isSmall/fontSizeScale |
| `app/dashboard/components/TestCaseCard.tsx` | 修改 | 样式复用TaskCard，添加isSmall/fontSizeScale |
| `app/dashboard/components/AgentWorkflow.tsx` | 修改 | 接口修复，工作流图显示修复 |
| `app/dashboard/components/AgentNode.tsx` | 修改 | 连接点调整 |
| `app/dashboard/contexts/TaskContext.tsx` | 新增 | 任务状态管理 |
| `app/dashboard/contexts/RequirementContext.tsx` | 新增 | 需求状态管理 |
| `app/dashboard/contexts/BugContext.tsx` | 新增 | Bug状态管理 |
| `app/dashboard/contexts/GoalContext.tsx` | 新增 | 目标状态管理 |
| `app/dashboard/contexts/AgentContext.tsx` | 新增 | 智能体状态管理 |
| `app/dashboard/contexts/AuditContext.tsx` | 新增 | 审计日志管理 |
| `app/dashboard/services/TaskService.ts` | 新增 | 任务服务 |
| `app/dashboard/services/RequirementService.ts` | 新增 | 需求服务 |
| `app/dashboard/services/ValidationService.ts` | 新增 | 验证服务 |
| `app/dashboard/services/AuditService.ts` | 新增 | 审计服务 |
| `app/dashboard/hooks/useAuth.ts` | 新增 | 认证Hook |
| `app/dashboard/hooks/useWindow.ts` | 新增 | 窗口尺寸Hook |
| `app/dashboard/hooks/useDataLoader.ts` | 新增 | 数据加载Hook |
| `app/dashboard/hooks/usePersistence.ts` | 新增 | 持久化Hook |
| `app/dashboard/hooks/useValidation.ts` | 新增 | 验证Hook |
| `app/dashboard/hooks/useAgentLiveStatus.ts` | 新增 | 智能体状态Hook |
| `app/dashboard/views/TasksView.tsx` | 新增 | 任务视图 |
| `app/dashboard/views/RequirementsView.tsx` | 新增 | 需求视图，列宽修复 |
| `app/dashboard/views/TestingView.tsx` | 新增 | 测试视图，列宽修复 |
| `app/dashboard/views/BugsView.tsx` | 新增 | Bug视图 |
| `app/dashboard/views/GoalsView.tsx` | 新增 | 目标视图 |
| `app/dashboard/views/AgentsView.tsx` | 新增 | 智能体视图 |
| `app/dashboard/views/AuditView.tsx` | 新增 | 审计视图 |
| `app/dashboard/data/default-data.ts` | 新增 | 默认Mock数据 |

### v1.0.0 (2026-07-07)

| 文件路径 | 变更类型 | 变更描述 |
|----------|----------|----------|
| `app/dashboard/types.ts` | 修改 | 添加Bug相关类型、verifier字段、requester/executor字段 |
| `app/dashboard/constants.ts` | 修改 | 添加BUGS存储键 |
| `app/dashboard/page.tsx` | 修改 | 集成Bug功能、添加Mock数据、修复Agents统计 |
| `app/dashboard/components/BugTracker.tsx` | 新增 | Bug追踪页面组件 |
| `app/dashboard/components/AgentWorkflow.tsx` | 修改 | 工作流画布组件，布局调整，3×3网格布局优化 |
| `app/dashboard/components/AgentNode.tsx` | 新增/修改 | 自定义智能体节点组件 |
| `app/dashboard/components/TaskColumn.tsx` | 修改 | 列宽和布局调整 |
| `app/dashboard/components/TaskCard.tsx` | 修改 | 卡片样式调整 |
| `app/dashboard/components/RequirementCard.tsx` | 修改 | 显示提出者和执行者 |
| `app/dashboard/components/Modal.tsx` | 修改 | 添加Bug表单和requester/executor字段 |
| `__tests__/bug-tracker.test.tsx` | 新增 | BugTracker单元测试 |
| `package.json` | 修改 | 添加@xyflow/react依赖 |

---

## 🎯 功能模块清单

### 已实现功能

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| 📋 Tasks | 任务看板管理，支持拖拽、标签、评论 | ✅ |
| 📝 Requirements | 需求管理，支持提出者/执行者标识 | ✅ |
| ✅ Testing | 测试用例管理 | ✅ |
| 🤖 Agents | 智能体管理，任务分配和统计 | ✅ |
| 🔄 Workflow | 多智能体工作流动态可视化 | ✅ |
| 🐛 Bug Tracker | Bug追踪系统，完整生命周期管理 | ✅ |
| 📂 Epic | Epic管理，支持创建、编辑、删除、级联删除、性能优化 | ✅ |

### Bug生命周期状态

```
REPORTED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED
                                               ↘ REOPENED ↗
```

### 验证人分组

| 分组 | 成员 |
|------|------|
| 客户组 | 客户A、客户B、客户C |
| 测试人员组 | 测试人员A、测试人员B、测试人员 |
| 我方人员组 | 需求粉碎机、系统拆弹专家、像素魔法师、数据大厨、配色狂魔、代码找茬王、规矩守护者、Bug猎手、文档整理控 |

---

## 🧪 测试用例清单

### bug-tracker.test.tsx (12个测试用例)

| 测试用例 | 覆盖场景 |
|----------|----------|
| should render BugTracker with bug cards | 组件基本渲染 |
| should render verifier dropdown when bug is selected | 下拉列表显示 |
| should contain all 16 verifier options | 选项数量验证 |
| should contain customer group options | 客户组选项 |
| should contain tester group options | 测试人员组选项 |
| should contain all team member options | 我方人员组选项 |
| should show default selected value | 默认值显示 |
| should call onUpdateBug when selecting verifier | 选择验证人 |
| should call onUpdateBug with undefined | 清空验证人 |
| should update verifier for different bugs | 不同bug切换 |
| should verify verifier label | 标签显示 |
| should close bug details | 关闭弹窗 |

---

## 📝 备注

- 所有变更已通过交互测试验证
- Epic删除流程测试：竞态防护、级联删除、任务列表刷新、控制台日志输出 ✅
- Epic编辑流程测试：弹窗打开、标题/描述/颜色修改、保存、数据持久化 ✅
- 性能指标：删除/编辑周期 < 10ms，渲染耗时 < 1ms ✅
- 登录修复测试：Chrome浏览器登录成功 ✅
- 任务编辑测试：任务卡片编辑弹窗正常显示，assignee可添加 ✅
- 开发服务器运行地址：http://localhost:3000
- 项目使用Next.js 14 + React 18 + TypeScript技术栈
- 数据持久化使用localStorage

---

*归档人：系统管理员*
*归档时间：2026-07-20*
*版本号：v1.3.0*