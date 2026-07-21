# 视图与组件详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`app/dashboard/components/` 和 `app/dashboard/views/` 构成前端 UI 层。组件负责局部渲染和交互，视图负责页面级布局。

---

## 2. Dashboard 组件结构

```
app/dashboard/components/
├── DashboardLayout.tsx      # Context Provider 嵌套容器
├── DashboardShell.tsx       # Dashboard 主壳组件
├── DashboardNavigation.tsx  # 顶部视图导航
├── LoginForm.tsx            # 登录/注册表单
├── Modal.tsx                # 通用弹窗容器
├── EpicSelector.tsx         # Epic 选择器
├── TaskCard.tsx             # 任务卡片
├── TaskColumn.tsx           # 任务列（看板）
├── RequirementCard.tsx      # 需求卡片
├── TestCaseCard.tsx         # 测试用例卡片
├── BugTracker.tsx           # Bug 追踪器
├── GoalTracker.tsx          # 目标追踪器
├── NotificationCenter.tsx   # 通知中心
├── NotificationSettingsPanel.tsx # 通知设置面板
├── SubagentProgressIndicator.tsx # 子代理进度指示器
└── modals/                  # 表单字段组件
    ├── BugFormFields.tsx
    ├── CommentList.tsx
    ├── RequirementFormFields.tsx
    ├── TagInput.tsx
    ├── TaskFormFields.tsx
    └── TestCaseFormFields.tsx

app/dashboard/views/
├── index.ts                 # 统一导出
├── TasksView.tsx
├── RequirementsView.tsx
├── TestingView.tsx
├── BugsView.tsx
├── GoalsView.tsx
├── AuditView.tsx
└── NotificationsView.tsx
```

---

## 3. DashboardLayout

**文件**: `app/dashboard/components/DashboardLayout.tsx`

**职责**: 按正确顺序嵌套所有 Context Provider。

### 输入-过程-输出

```
输入：无
  │
  ▼
按顺序嵌套 Provider
  1. NotificationProvider
  2. EpicProvider
  3. TaskProvider
  4. RequirementProvider
  5. BugProvider
  6. GoalProvider
  7. AuditProvider
  8. TestCaseProvider
  9. SharedProvider
  ▼
渲染 DashboardShell
  ▼
输出：完整 Provider 树包裹的 Dashboard
```

---

## 4. DashboardShell

**文件**: `app/dashboard/components/DashboardShell.tsx`

**职责**: Dashboard 主壳，连接 Hooks、Context、视图，处理认证、布局、弹窗、Epic 管理。

### 输入-过程-输出

```
输入：认证状态、视图模式、弹窗状态、表单数据
  │
  ▼
[1] 使用 useAuth 获取认证状态
[2] 使用 useWindow 获取窗口/隐私状态
[3] 使用 useViewMode 获取当前视图
[4] 使用 useDataLoader 加载数据
[5] 使用 usePersistence 持久化数据
[6] 使用 useValidation 校验数据
[7] 使用 useDashboardLogic 获取业务处理函数
[8] 读取各 Context 状态
  │
  ▼
如果未认证 → 渲染 LoginForm
  │
  已认证 → 渲染 Dashboard 主界面
  │
  ▼
输出：当前视图对应的 UI
```

### 主要子区域

| 区域 | 组件/内容 |
|------|----------|
| Header | 标题、Epic 选择器、新建 Epic 按钮、用户菜单 |
| Navigation | DashboardNavigation（视图切换） |
| Main Content | 根据 viewMode 渲染对应 View 组件 |
| Modal | 任务/需求/测试用例/Bug 编辑弹窗 |
| Privacy Modal | 隐私同意弹窗 |
| Notification Panel | 通知中心/设置面板 |

### Epic 管理流程

```
输入：用户点击新建/编辑/删除 Epic
  │
  ▼
打开对应弹窗
  │
  ▼
用户提交 → 调用 addEpic/updateEpic/deleteEpic
  │
  ▼
更新 epics 状态
  │
  ▼
输出：Epic 列表更新
```

---

## 5. DashboardNavigation

**文件**: `app/dashboard/components/DashboardNavigation.tsx`

**职责**: 渲染顶部视图切换导航。

### 输入-过程-输出

```
输入：currentView, onViewChange, fontSizeScale
  │
  ▼
渲染 navItems 按钮列表
  │
  ▼
用户点击 → onViewChange(item.id)
  │
  ▼
输出：视图切换
```

### 导航项

| id | label | icon |
|----|-------|------|
| TASKS | Tasks | 📋 |
| REQUIREMENTS | Requirements | 📝 |
| TESTING | Testing | 🧪 |
| BUGS | Bugs | 🐛 |
| GOALS | Goals | 🎯 |
| AUDIT | Audit | 🔍 |

---

## 6. LoginForm

**文件**: `app/dashboard/components/LoginForm.tsx`

**职责**: 登录/注册表单，使用 NextAuth 登录或调用注册 API。

### 输入-过程-输出

```
输入：用户输入的 email, password, username(注册), role(注册)
  │
  ▼
[登录模式]
  - 调用 signIn('credentials', {email, password, redirect: false})
  - 成功 → onLoginSuccess() + window.location.href='/dashboard'
  - 失败 → 显示错误信息

[注册模式]
  - 调用 POST /api/auth/register
  - 成功 → 2秒后切换回登录模式
  - 失败 → 显示错误信息
  │
  ▼
输出：登录成功跳转或显示提示信息
```

---

## 7. 视图组件（Views）

| 视图 | 文件 | 职责 |
|------|------|------|
| TasksView | `views/TasksView.tsx` | 任务看板，展示 TODO/IN_PROGRESS/DONE 列 |
| RequirementsView | `views/RequirementsView.tsx` | 需求列表 |
| TestingView | `views/TestingView.tsx` | 测试用例列表 |
| BugsView | `views/BugsView.tsx` | Bug 追踪器 |
| GoalsView | `views/GoalsView.tsx` | 目标追踪器 |
| AuditView | `views/AuditView.tsx` | 审计日志列表 |
| NotificationsView | `views/NotificationsView.tsx` | 通知列表 |

### Epic 过滤

五个业务视图（Tasks / Requirements / Bugs / Goals / Testing）按当前 Epic 过滤器筛选卡片，统一使用 `matchesEpicFilter()`（见 constants.md）：All Epics（`null`）显示全部，No Epic（`NO_EPIC_FILTER`）只显示无 Epic 的卡片，具体 Epic 只显示其名下卡片。

### 视图渲染模式

```
输入：对应 Context 的 state 和 dispatch 函数
  │
  ▼
视图组件渲染列表/看板/表格
  │
  ▼
用户交互 → 调用 dispatch 或业务处理函数
  │
  ▼
输出：更新后的状态反映在 UI 上
```

---

## 8. 卡片组件

### TaskCard

**输入**: task, onEdit, onDelete

**处理**: 渲染任务标题、状态、优先级、标签、负责人、截止日期、评论数、Epic 徽标（EpicBadge）

**输出**: 任务卡片 UI

### TaskColumn

**输入**: title, status, tasks, onEdit, onDelete, onDragEnd

**处理**: 渲染看板列，支持拖拽（@hello-pangea/dnd）

**输出**: 可拖拽列 UI

### RequirementCard

**输入**: requirement, onEdit, onDelete

**处理**: 渲染需求标题、状态、优先级、验收标准、Epic 徽标（EpicBadge）

**输出**: 需求卡片 UI

### TestCaseCard

**输入**: testCase, onEdit, onDelete

**处理**: 渲染测试用例标题、状态、步骤、预期结果

**输出**: 测试用例卡片 UI

### EpicBadge

**输入**: epicId, fontSizeScale?（默认 1）

**处理**: 通过 `useEpicsOptional()` 在 EpicContext 中查找 Epic，渲染色点 + Epic 名徽标；无 epicId、Epic 不存在或无 EpicProvider 时返回 null（不渲染）。已接入 TaskCard、RequirementCard、BugCard（BugTracker 内）

**输出**: Epic 归属徽标 UI 或 null

---

## 9. 表单字段组件（modals/）

| 组件 | 输入 | 输出 |
|------|------|------|
| TaskFormFields | formData, setFormData | 任务表单字段 |
| RequirementFormFields | formData, setFormData | 需求表单字段 |
| TestCaseFormFields | formData, setFormData | 测试用例表单字段 |
| BugFormFields | formData, setFormData | Bug 表单字段 |
| CommentList | comments, taskId, onAdd, onDelete | 评论列表 |
| TagInput | tags, onChange | 标签输入（带自动补全） |

---

## 10. 其他组件

### EpicSelector

**输入**: epics, currentEpicId, onEpicChange, onNewEpic, onEditEpic, onDeleteEpic, fontSizeScale

**处理**: 渲染 Epic 下拉选择器和管理按钮。下拉选项含 All Epics（`null`）、No Epic（`NO_EPIC_FILTER` 哨兵，虚线空心圆图标，选中后只显示无 Epic 的卡片）和各 ACTIVE Epic

**输出**: Epic 选择 UI

### NotificationCenter

**输入**: 当前用户

**处理**: 从 NotificationService 读取通知，标记已读/删除

**输出**: 通知列表 UI

### NotificationSettingsPanel

**输入**: 当前用户

**处理**: 读取/保存通知偏好设置

**输出**: 设置面板 UI

### SubagentProgressIndicator

**输入**: 子代理任务列表

**处理**: 渲染进度条和状态

**输出**: 进度指示 UI

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
