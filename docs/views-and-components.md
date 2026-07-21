# 视图与组件说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. DashboardPage

**文件**: `app/dashboard/page.tsx`

**职责**: Dashboard 入口页面，用 `Suspense` 包裹 `DashboardLayout`。

---

## 2. DashboardLayout

**文件**: `app/dashboard/components/DashboardLayout.tsx`

**职责**: 组合所有 Context Provider，构建 Context 层级树。

---

## 3. DashboardShell

**文件**: `app/dashboard/components/DashboardShell.tsx`

**职责**: Dashboard 主壳组件。核心协调器：

- 使用 `useAuth` 判断认证状态，未认证显示登录表单。
- 调用 `useDataLoader`、`usePersistence`、`useValidation` 完成数据加载、持久化、校验。
- 渲染导航栏、Epic 选择器、各视图、弹窗、隐私协议弹窗。
- 处理 Epic 新建/编辑/删除的弹窗逻辑。
- 渲染当前选中的视图组件。

---

## 4. DashboardNavigation

**文件**: `app/dashboard/components/DashboardNavigation.tsx`

**职责**: 左侧/顶部导航栏，用于切换 `viewMode`。

---

## 5. LoginForm

**文件**: `app/dashboard/components/LoginForm.tsx`

**职责**: 登录表单。调用 NextAuth `signIn("credentials", ...)` 进行认证，成功后跳转到 `/dashboard`。

---

## 6. EpicSelector

**文件**: `app/dashboard/components/EpicSelector.tsx`

**职责**: 顶部 Epic 选择器，允许用户：
- 切换当前 Epic
- 新建 Epic
- 编辑/删除 Epic

---

## 7. 视图组件 (Views)

| 组件 | 文件 | 职责 |
|------|------|------|
| `TasksView` | `app/dashboard/views/TasksView.tsx` | 任务看板，支持拖拽 |
| `RequirementsView` | `app/dashboard/views/RequirementsView.tsx` | 需求列表 |
| `TestingView` | `app/dashboard/views/TestingView.tsx` | 测试用例管理 |
| `BugsView` | `app/dashboard/views/BugsView.tsx` | Bug 跟踪 |
| `GoalsView` | `app/dashboard/views/GoalsView.tsx` | 目标、里程碑、关键结果 |
| `AuditView` | `app/dashboard/views/AuditView.tsx` | 审计日志 |
| `NotificationsView` | `app/dashboard/views/NotificationsView.tsx` | 通知中心 |

---

## 8. 卡片组件

| 组件 | 文件 | 职责 |
|------|------|------|
| `TaskCard` | `app/dashboard/components/TaskCard.tsx` | 任务卡片展示 |
| `TaskColumn` | `app/dashboard/components/TaskColumn.tsx` | 任务列（如 TODO、IN PROGRESS、DONE） |
| `RequirementCard` | `app/dashboard/components/RequirementCard.tsx` | 需求卡片 |
| `TestCaseCard` | `app/dashboard/components/TestCaseCard.tsx` | 测试用例卡片 |
| `BugTracker` | `app/dashboard/components/BugTracker.tsx` | Bug 列表/表单 |
| `GoalTracker` | `app/dashboard/components/GoalTracker.tsx` | 目标跟踪器 |

---

## 9. 弹窗与表单组件

| 组件 | 文件 | 职责 |
|------|------|------|
| `Modal` | `app/dashboard/components/Modal.tsx` | 通用弹窗容器 |
| `TaskFormFields` | `app/dashboard/components/modals/TaskFormFields.tsx` | 任务表单字段 |
| `RequirementFormFields` | `app/dashboard/components/modals/RequirementFormFields.tsx` | 需求表单字段 |
| `TestCaseFormFields` | `app/dashboard/components/modals/TestCaseFormFields.tsx` | 测试用例表单字段 |
| `BugFormFields` | `app/dashboard/components/modals/BugFormFields.tsx` | Bug 表单字段 |
| `TagInput` | `app/dashboard/components/modals/TagInput.tsx` | 标签输入组件 |
| `CommentList` | `app/dashboard/components/modals/CommentList.tsx` | 评论列表 |

---

## 10. 通知相关组件

| 组件 | 文件 | 职责 |
|------|------|------|
| `NotificationCenter` | `app/dashboard/components/NotificationCenter.tsx` | 通知下拉/列表 |
| `NotificationSettingsPanel` | `app/dashboard/components/NotificationSettingsPanel.tsx` | 通知设置面板 |
| `SubagentProgressIndicator` | `app/dashboard/components/SubagentProgressIndicator.tsx` | 子代理进度指示器 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
