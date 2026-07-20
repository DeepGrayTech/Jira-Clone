# Subagent 调度通知系统 - 设计文档

## 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| v1.0 | 2026-07-13 | System | 初始版本 |

---

## 一、功能范围

### 1.1 需求背景

> 用户希望通过 Jira Clone 系统实现"自我递归"的工作方式：用户作为管理者，subagents 作为员工，系统能够自动调度 subagents 完成任务，项目进展实时在系统中体现。

### 1.2 功能目标

| 目标 | 描述 | 优先级 |
|------|------|--------|
| 通知触发 | 系统事件自动触发通知（任务分配、状态变更、Bug报告等） | P0 |
| Subagent 调度 | 通知可自动触发 subagent 执行相关任务 | P0 |
| 进度追踪 | subagent 执行进度实时反馈到系统 | P0 |
| 通知管理 | 用户可查看、标记、过滤通知 | P1 |
| 通知配置 | 用户可自定义通知规则和偏好 | P2 |

### 1.3 功能清单

- [x] 通知中心组件
- [x] 实时通知推送
- [x] Subagent 调度 API 集成
- [x] 任务自动分配给 subagent
- [x] 执行进度实时更新
- [x] 通知分类与过滤
- [x] 通知标记为已读
- [x] 通知设置面板
- [x] 通知历史记录

---

## 二、数据模型设计

### 2.1 通知类型 (NotificationType)

```typescript
export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_COMMENTED"
  | "BUG_REPORTED"
  | "BUG_ASSIGNED"
  | "REQUIREMENT_APPROVED"
  | "TEST_CASE_FAILED"
  | "GOAL_PROGRESS_UPDATED"
  | "SUBAGENT_TASK_STARTED"
  | "SUBAGENT_TASK_COMPLETED"
  | "SUBAGENT_TASK_FAILED";
```

### 2.2 通知接口 (Notification)

```typescript
export interface Notification {
  id: string; // 唯一通知标识符
  type: NotificationType; // 通知类型
  title: string; // 通知标题
  message: string; // 通知详情
  targetId: string; // 关联实体ID（任务、Bug等）
  targetType: "TASK" | "BUG" | "REQUIREMENT" | "TEST_CASE" | "GOAL";
  sender?: string; // 发送者（可为subagent）
  recipient: string; // 接收者用户名
  isRead: boolean; // 是否已读
  isActionable: boolean; // 是否可操作
  actionUrl?: string; // 操作链接
  scheduledSubagent?: string; // 调度的subagent名称
  createdAt: string; // 创建时间
}
```

### 2.3 Subagent 任务接口 (SubagentTask)

```typescript
export interface SubagentTask {
  id: string; // 唯一任务标识符
  notificationId: string; // 关联通知ID
  subagentName: string; // Subagent名称
  taskType: string; // 任务类型（代码审查、测试、开发等）
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number; // 进度 0-100
  inputData: Record<string, unknown>; // 输入数据
  outputData?: Record<string, unknown>; // 输出数据
  errorMessage?: string; // 错误信息
  startedAt?: string; // 开始时间
  completedAt?: string; // 完成时间
  createdAt: string; // 创建时间
}
```

### 2.4 通知设置接口 (NotificationSettings)

```typescript
export interface NotificationSettings {
  userId: string; // 用户ID
  enabledTypes: NotificationType[]; // 启用的通知类型
  autoScheduleSubagent: boolean; // 是否自动调度subagent
  preferredSubagents: string[]; // 偏好的subagent列表
  muteUntil?: string; // 静音截止时间
}
```

---

## 三、API 设计

### 3.1 通知相关 API

| 方法 | 路径 | 描述 | 参数 | 返回值 |
|------|------|------|------|--------|
| GET | `/api/notifications` | 获取通知列表 | `limit`, `offset`, `filter`, `isRead` | `Notification[]` |
| GET | `/api/notifications/:id` | 获取单个通知 | `id` | `Notification` |
| POST | `/api/notifications` | 创建通知 | `Notification` | `Notification` |
| PUT | `/api/notifications/:id/read` | 标记为已读 | `id` | `Notification` |
| PUT | `/api/notifications/read-all` | 全部标记为已读 | - | `{ count: number }` |
| DELETE | `/api/notifications/:id` | 删除通知 | `id` | `{ success: boolean }` |

### 3.2 Subagent 调度 API

| 方法 | 路径 | 描述 | 参数 | 返回值 |
|------|------|------|------|--------|
| POST | `/api/subagents/tasks` | 创建 subagent 任务 | `SubagentTask` | `SubagentTask` |
| GET | `/api/subagents/tasks` | 获取 subagent 任务列表 | `status`, `notificationId` | `SubagentTask[]` |
| GET | `/api/subagents/tasks/:id` | 获取单个任务 | `id` | `SubagentTask` |
| PUT | `/api/subagents/tasks/:id` | 更新任务状态 | `id`, `status`, `progress`, `outputData` | `SubagentTask` |
| DELETE | `/api/subagents/tasks/:id` | 取消任务 | `id` | `{ success: boolean }` |

### 3.3 通知设置 API

| 方法 | 路径 | 描述 | 参数 | 返回值 |
|------|------|------|------|--------|
| GET | `/api/notifications/settings` | 获取用户通知设置 | - | `NotificationSettings` |
| PUT | `/api/notifications/settings` | 更新用户通知设置 | `NotificationSettings` | `NotificationSettings` |

---

## 四、UI 组件设计

### 4.1 通知中心 (NotificationCenter)

**位置**: 顶部导航栏右侧，铃铛图标

**功能**:
- 显示未读通知数量徽章
- 点击展开通知列表下拉面板
- 支持标记全部已读
- 支持跳转到通知设置

**组件结构**:
```
NotificationCenter
├── Badge (未读数量)
├── DropdownPanel
│   ├── Header (标题 + 标记全部已读按钮)
│   ├── NotificationList
│   │   ├── NotificationItem (可点击)
│   │   └── ...
│   └── Footer (查看全部 + 设置链接)
```

### 4.2 通知列表页面 (NotificationsView)

**位置**: 独立视图页面

**功能**:
- 分页显示所有通知
- 按类型过滤
- 按状态过滤（已读/未读）
- 支持批量操作
- 支持搜索

**组件结构**:
```
NotificationsView
├── FilterBar (类型筛选 + 状态筛选 + 搜索)
├── NotificationList
│   ├── NotificationCard
│   │   ├── Icon (通知类型图标)
│   │   ├── Title + Message
│   │   ├── Time
│   │   └── ActionButton (如果可操作)
│   └── ...
└── Pagination
```

### 4.3 通知设置面板 (NotificationSettingsPanel)

**位置**: 用户设置页面内

**功能**:
- 启用/禁用特定通知类型
- 开启/关闭自动调度 subagent
- 设置偏好的 subagent
- 设置静音时段

### 4.4 Subagent 进度指示器 (SubagentProgressIndicator)

**位置**: 任务卡片内、通知详情中

**功能**:
- 显示 subagent 执行进度
- 显示执行状态
- 点击查看详细日志

---

## 五、Subagent 调度逻辑

### 5.1 调度触发规则

| 事件类型 | 是否自动调度 | 默认 Subagent | 条件 |
|----------|-------------|---------------|------|
| TASK_ASSIGNED | 是 | senior-frontend-engineer | 任务类型为开发 |
| TASK_ASSIGNED | 是 | senior-backend-engineer | 任务类型为后端 |
| BUG_REPORTED | 是 | code-reviewer | Bug 严重级别为 CRITICAL |
| TEST_CASE_FAILED | 是 | test-engineer | 测试失败 |
| REQUIREMENT_APPROVED | 是 | architecture-task-splitter | 需求已批准 |
| TASK_STATUS_CHANGED | 否 | - | 状态变更 |

### 5.2 调度流程

```
事件触发
    │
    ▼
通知系统创建通知
    │
    ▼
检查用户通知设置
    │
    ├── autoScheduleSubagent = false → 仅发送通知
    │
    └── autoScheduleSubagent = true → 创建 SubagentTask
            │
            ▼
        选择 Subagent
            │
            ▼
        执行任务
            │
            ├── 成功 → 更新状态 COMPLETED，创建完成通知
            │
            └── 失败 → 更新状态 FAILED，创建失败通知
```

### 5.3 进度更新机制

Subagent 在执行过程中通过 API 更新进度：
- 开始执行: `progress = 0`, `status = RUNNING`
- 执行中: 根据任务类型定期更新 `progress`
- 完成: `progress = 100`, `status = COMPLETED`

---

## 六、状态管理设计

### 6.1 新增 Context

```typescript
// NotificationContext.tsx
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createNotification: (data: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
}
```

### 6.2 集成现有 Context

通知系统需要与以下现有 Context 集成：
- `TaskContext` - 监听任务状态变更
- `BugContext` - 监听 Bug 报告和分配
- `RequirementContext` - 监听需求审批状态
- `TestCaseContext` - 监听测试用例执行结果
- `GoalContext` - 监听目标进度更新

---

## 七、存储设计

### 7.1 localStorage Keys

```typescript
export const STORAGE_KEYS = {
  // ... 现有 keys
  NOTIFICATIONS: "jira-clone-notifications",
  SUBAGENT_TASKS: "jira-clone-subagent-tasks",
  NOTIFICATION_SETTINGS: "jira-clone-notification-settings",
};
```

### 7.2 数据结构

**通知数据**:
```json
{
  "id": "notif-12345",
  "type": "TASK_ASSIGNED",
  "title": "任务已分配",
  "message": "任务「实现用户登录」已分配给您",
  "targetId": "task-abc",
  "targetType": "TASK",
  "sender": "admin",
  "recipient": "user",
  "isRead": false,
  "isActionable": true,
  "actionUrl": "/dashboard/tasks/task-abc",
  "createdAt": "2026-07-13T10:00:00Z"
}
```

**Subagent 任务数据**:
```json
{
  "id": "sat-12345",
  "notificationId": "notif-12345",
  "subagentName": "senior-frontend-engineer",
  "taskType": "development",
  "status": "RUNNING",
  "progress": 45,
  "inputData": {
    "taskId": "task-abc",
    "taskTitle": "实现用户登录",
    "taskDescription": "..."
  },
  "startedAt": "2026-07-13T10:05:00Z",
  "createdAt": "2026-07-13T10:00:00Z"
}
```

---

## 八、审计日志集成

### 8.1 通知相关审计事件

| Action | Target | Description |
|--------|--------|-------------|
| CREATE | NOTIFICATION | 创建通知 |
| READ | NOTIFICATION | 标记通知为已读 |
| DELETE | NOTIFICATION | 删除通知 |

### 8.2 Subagent 调度审计事件

| Action | Target | Description |
|--------|--------|-------------|
| CREATE | SUBAGENT_TASK | 创建 Subagent 任务 |
| UPDATE | SUBAGENT_TASK | 更新 Subagent 任务状态 |
| DELETE | SUBAGENT_TASK | 取消 Subagent 任务 |

---

## 九、安全性考虑

### 9.1 数据权限

- 通知只能被指定接收者查看
- Subagent 任务只能由创建者或管理员查看
- 通知设置只能由用户自己修改

### 9.2 输入验证

- 所有 API 输入参数需经过验证
- 防止恶意脚本注入
- Subagent 任务输入数据需进行 sanitize

---

## 十、实施计划

### 10.1 任务拆分

| 阶段 | 任务 | 预估时间 | 依赖 |
|------|------|----------|------|
| Phase 1 | 数据模型与类型定义 | 0.5h | 无 |
| Phase 2 | 通知服务与 API | 1h | Phase 1 |
| Phase 3 | NotificationContext | 0.5h | Phase 2 |
| Phase 4 | 通知中心组件 | 1h | Phase 3 |
| Phase 5 | 通知列表页面 | 1h | Phase 3 |
| Phase 6 | 通知设置面板 | 0.5h | Phase 2 |
| Phase 7 | Subagent 任务服务 | 1h | Phase 2 |
| Phase 8 | Subagent 调度逻辑 | 1h | Phase 7 |
| Phase 9 | 进度指示器组件 | 0.5h | Phase 7 |
| Phase 10 | 审计日志集成 | 0.5h | Phase 2 |
| Phase 11 | 单元测试 | 1.5h | 所有 Phase |
| Phase 12 | 集成测试 | 1h | Phase 8 |

### 10.2 验证步骤

1. 创建任务时自动触发通知和 Subagent 调度
2. 检查通知中心显示新通知
3. 验证 Subagent 任务创建和进度更新
4. 测试通知过滤和标记已读功能
5. 验证通知设置保存和生效
6. 检查审计日志记录

---

## 十一、设计自查

### 11.1 占位符检查

- [x] 无 TBD/TODO 占位符
- [x] 所有功能点均已明确

### 11.2 内部一致性

- [x] 数据模型与 API 设计一致
- [x] UI 组件与状态管理一致
- [x] 调度逻辑与数据流程一致

### 11.3 范围检查

- [x] 功能范围明确，不包含超出通知系统的功能

### 11.4 歧义检查

- [x] 无歧义描述
- [x] 所有术语定义清晰

---

## 附录：Subagent 映射表

| 角色 | 适用任务类型 | 描述 |
|------|-------------|------|
| senior-frontend-engineer | 前端开发、UI实现 | 前端代码编写 |
| senior-backend-engineer | 后端开发、API实现 | 后端代码编写 |
| architecture-task-splitter | 架构设计、任务分解 | 技术方案制定 |
| code-reviewer | 代码审查、质量检查 | 代码审核 |
| test-engineer | 测试用例、功能测试 | 测试编写和执行 |
| requirements-analyst | 需求分析、PRD编写 | 需求梳理 |
| ui-designer | UI设计、界面设计 | 视觉设计 |
| compliance-engineer | 合规审查、安全合规 | 合规性检查 |
| workflow-manager | 工作流程、任务编排 | 流程管理 |
