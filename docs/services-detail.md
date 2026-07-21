# 业务 Services 详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`app/dashboard/services/` 包含两类服务：

1. **HTTP API 封装**：`api.ts` 负责与后端 API 通信。
2. **业务逻辑服务**：`TaskService`、`RequirementService`、`BugService`、`TestCaseService`、`GoalService`、`ValidationService`、`AuditService`、`NotificationService`、`SubagentTaskService` 负责前端业务逻辑、校验、审计记录。

---

## 2. 通用服务处理模式

```
输入：业务数据 / 操作请求
  │
  ▼
[1] 校验（ValidationService）
  │   输出：ValidationResult
  ▼
[2] 业务处理（生成 ID、时间戳、状态转换）
  │   输出：处理后的实体
  ▼
[3] 记录审计（AuditService）
  │   输出：AuditLogEntry
  ▼
输出：处理结果
```

---

## 3. API Service (api.ts)

**职责**: 封装所有前端到后端的 HTTP 请求。

**通用流程**:

```
输入：请求方法、路径、可选 body
  │
  ▼
fetch('/api/...', { method, headers, body })
  │
  ▼
检查 response.ok
  │
  ├─ 失败 → 抛出错误
  │
  ▼
解析 JSON
  │
  ▼
输出：业务数据
```

**主要方法**:

| 方法 | 说明 |
|------|------|
| `getTasks()` | GET /api/tasks |
| `createTask(data)` | POST /api/tasks |
| `updateTask(id, data)` | PUT /api/tasks/[id] |
| `deleteTask(id)` | DELETE /api/tasks/[id] |
| 类似方法 | requirements, bugs, test-cases, goals, epics, comments, audit-logs |

**序列化处理**:
- 发送前将数组字段 JSON.stringify。
- 返回数据后解析 ISO 日期字符串为 Date 对象（如需要）。

---

## 4. ValidationService

**职责**: 校验业务实体数据。

### 处理流程

```
输入：Partial<业务实体>
  │
  ▼
[1] 检查 title 是否为空
  ▼
[2] 检查 status 是否有效
  ▼
[3] 检查 priority/日期等字段（如适用）
  ▼
输出：ValidationResult
  {
    isValid: boolean,
    errors: ValidationError[],
    warnings: [],
    validCount: 0|1,
    totalCount: 1,
    type: string
  }
```

### 支持校验

| 方法 | 校验内容 |
|------|----------|
| `validateTaskData` | title、status、priority |
| `validateRequirementData` | title、status、priority |
| `validateTestCaseData` | title、status |
| `validateBugData` | title |
| `validateGoalData` | title、startDate/endDate |

---

## 5. AuditService

**职责**: 生成审计日志条目。

### 处理流程

```
输入：action, target, targetId, details, username?
  │
  ▼
生成 AuditLogEntry
  {
    id: `${timestamp}_${random}`,
    timestamp: ISO 时间,
    action, target, targetId, details, username
  }
  ▼
输出：AuditLogEntry
```

### 主要方法

| 方法 | 说明 |
|------|------|
| `logAction(...)` | 生成单条审计日志 |
| `truncateLogs(logs)` | 截断日志，保留最多 1000 条 |

---

## 6. TaskService

**职责**: 任务业务逻辑。

### 处理流程

#### createTask

```
输入：taskData（不含 id/createdAt）
  │
  ▼
ValidationService.validateTaskData
  │
  ▼
生成 id = task-${Date.now()}
生成 createdAt = 当前 ISO 时间
  │
  ▼
输出：Task
```

#### updateTask

```
输入：taskId, updates
  │
  ▼
ValidationService.validateTaskData
  │
  ▼
输出：updates
```

#### canMoveToStatus

**输入**: currentStatus, newStatus

**处理**: 检查状态转换是否合法

| 当前状态 | 可转状态 |
|----------|----------|
| TODO | IN_PROGRESS |
| IN_PROGRESS | TODO, DONE |
| DONE | IN_PROGRESS |

**输出**: boolean

#### generateAuditLog

**输入**: action, task, username?

**处理**: 生成描述文本，调用 AuditService

**输出**: AuditLogEntry

---

## 7. RequirementService

**职责**: 需求业务逻辑。

### createRequirement

```
输入：reqData（不含 id/createdAt/updatedAt）
  │
  ▼
生成 id = req-${Date.now()}
生成 createdAt/updatedAt
  │
  ▼
输出：Requirement
```

### updateRequirement

```
输入：reqId, updates
  │
  ▼
更新 updatedAt
  │
  ▼
输出：updates
```

### generateAuditLog

生成需求创建/更新/删除审计日志。

---

## 8. BugService

**职责**: Bug 业务逻辑。

### createBug

```
输入：bugData（不含 id/createdAt/updatedAt）
  │
  ▼
ValidationService.validateBugData
  │
  ▼
生成 id = bug-${Date.now()}
生成 createdAt/updatedAt
  │
  ▼
输出：Bug
```

### updateBug

```
输入：bugId, updates
  │
  ▼
更新 updatedAt
  │
  ▼
输出：updates
```

### generateAuditLog

生成 Bug 创建/更新/删除审计日志。

---

## 9. TestCaseService

**职责**: 测试用例业务逻辑。

### createTestCase

```
输入：tcData（不含 id）
  │
  ▼
ValidationService.validateTestCaseData
  │
  ▼
生成 id = t-${Date.now()}
  │
  ▼
输出：TestCase
```

### updateTestCase

```
输入：tcId, updates
  │
  ▼
输出：updates
```

### generateAuditLog

生成测试用例创建/更新/删除审计日志。

---

## 10. GoalService

**职责**: 目标业务逻辑。

### createGoal

```
输入：goalData（不含 id/createdAt/updatedAt）
  │
  ▼
ValidationService.validateGoalData
  │
  ▼
生成 id = Date.now().toString()
生成 createdAt/updatedAt
  │
  ▼
输出：Goal
```

### updateGoal

```
输入：goalId, updates
  │
  ▼
更新 updatedAt
  │
  ▼
输出：updates
```

### generateAuditLog

生成目标创建/更新/删除审计日志。

---

## 11. NotificationService

**职责**: 通知的创建、读取、存储、设置管理。

### 存储方式

当前通知数据仍保存在 `localStorage` 中（计划后续迁移到后端）。

### 处理流程

#### createNotification

```
输入：Notification 数据（不含 id/createdAt/isRead）
  │
  ▼
生成 id = notif-${Date.now()}-${random}
生成 createdAt
isRead = false
  │
  ▼
记录审计日志
  │
  ▼
输出：Notification
```

#### getNotifications(recipient)

```
输入：recipient 字符串
  │
  ▼
从 localStorage 读取 STORAGE_KEYS.NOTIFICATIONS
  │
  ▼
过滤 recipient 匹配项
  │
  ▼
按 createdAt 降序排序
  │
  ▼
输出：Notification[]
```

#### saveNotification / saveNotifications

```
输入：Notification 或 Notification[]
  │
  ▼
读取当前 localStorage 数据
  │
  ▼
按 recipient 合并更新
  │
  ▼
写回 localStorage
  │
  ▼
输出：无
```

#### markAsRead / markAllAsRead

```
输入：id 或 recipient
  │
  ▼
更新 isRead = true
  │
  ▼
保存回 localStorage
  │
  ▼
记录审计日志
  │
  ▼
输出：无 或 已读数量
```

#### getSettings / saveSettings

```
输入：userId 或 NotificationSettings
  │
  ▼
从 localStorage 读取 STORAGE_KEYS.NOTIFICATION_SETTINGS
  │
  ▼
按 userId 存取
  │
  ▼
输出：NotificationSettings
```

---

## 12. SubagentTaskService

**职责**: 子代理任务的生命周期管理。

### 存储方式

当前数据保存在 `localStorage` 中。

### 处理流程

#### createSubagentTask

```
输入：SubagentTask 数据（不含 id/createdAt）
  │
  ▼
生成 id = sat-${Date.now()}-${random}
生成 createdAt
  │
  ▼
记录审计日志
  │
  ▼
输出：SubagentTask
```

#### updateTaskStatus

```
输入：id, status
  │
  ▼
查找任务
  │
  ▼
更新状态
  - RUNNING → 设置 startedAt
  - COMPLETED/FAILED/CANCELLED → 设置 completedAt
  - COMPLETED → progress = 100
  │
  ▼
保存并记录审计日志
  │
  ▼
输出：无
```

#### updateTaskProgress

```
输入：id, progress
  │
  ▼
限制 progress 在 [0, 100]
  │
  ▼
自动更新状态
  - progress = 100 → COMPLETED
  - progress > 0 且 PENDING → RUNNING
  │
  ▼
保存并记录审计日志
  │
  ▼
输出：无
```

### 主要方法

| 方法 | 说明 |
|------|------|
| `getSubagentTasks` | 读取所有任务，可按 notificationId 过滤 |
| `getSubagentTask(id)` | 按 ID 读取 |
| `saveSubagentTask` | 保存/更新单条任务 |
| `saveSubagentTasks` | 批量保存 |
| `updateTaskStatus` | 更新状态并自动设置时间戳 |
| `updateTaskProgress` | 更新进度并自动推导状态 |
| `updateTaskOutput` | 更新 outputData |
| `updateTaskError` | 设置错误信息和失败状态 |
| `cancelTask` | 取消任务 |
| `deleteTask` | 删除任务 |
| `getTasksByStatus` | 按状态过滤 |
| `getRunningTasks` | 获取运行中任务 |
| `getPendingTasks` | 获取待处理任务 |
| `getCompletedTasks` | 获取已完成任务 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
