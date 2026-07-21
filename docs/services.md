# Services 说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. API Service

**文件**: `app/dashboard/services/api.ts`

**职责**: 封装所有与后端 API 的 HTTP 通信，包括数据序列化和反序列化。

**主要分类**:

- Task APIs
- Requirement APIs
- TestCase APIs
- Bug APIs
- Goal APIs
- Milestone APIs
- KeyResult APIs
- Epic APIs
- Comment APIs
- AuditLog APIs
- Import API

**公共工具**:

| 函数 | 说明 |
|------|------|
| `parseXxx(row)` | 将 Prisma/API 返回字段转换为前端类型 |
| `serializeXxx(entity)` | 将前端类型转换为 API 请求体 |
| `ApiError` | 自定义错误类，包含 HTTP 状态码 |
| `fetchJson` | 通用 fetch 包装，处理 JSON 和错误 |

**API 调用流程**:

```
输入：前端实体数据
  │
  ▼
[1] 调用 serializeXxx(entity) 生成请求体
  ▼
[2] fetchJson(url, { method, body })
  ▼
[3] 接收响应数据
  ▼
[4] 调用 parseXxx(data) 转换为前端类型
  ▼
输出：前端实体
```

---

## 2. NotificationService

**文件**: `app/dashboard/services/NotificationService.ts`

**职责**: 通知管理，包括创建、读取、标记已读、删除、设置管理。

**注意**: 当前基于 `localStorage` 存储，尚未迁移到数据库。

### 输入-过程-输出

#### createNotification(data)

```
输入：通知数据（不含 id, createdAt, isRead）
  │
  ▼
[1] 生成 id 和 createdAt，isRead=false
[2] 调用 auditService.logAction 记录审计
  ▼
输出：Notification 对象
```

#### getNotifications(recipient)

```
输入：接收者
  │
  ▼
[1] 从 localStorage 读取 STORAGE_KEYS.NOTIFICATIONS
[2] 过滤 recipient 匹配的通知
[3] 按 createdAt 降序排列
  ▼
输出：Notification[]
```

#### markAsRead(id, recipient)

```
输入：通知 id，接收者
  │
  ▼
[1] 获取该接收者通知列表
[2] 找到对应通知，设置 isRead=true
[3] 保存回 localStorage
[4] 记录审计日志
  ▼
输出：无
```

#### markAllAsRead(recipient)

```
输入：接收者
  │
  ▼
[1] 获取该接收者通知列表
[2] 将所有未读通知 isRead=true
[3] 保存回 localStorage
[4] 记录审计日志
  ▼
输出：已读数量
```

#### deleteNotification(id, recipient)

```
输入：通知 id，接收者
  │
  ▼
[1] 过滤掉该通知
[2] 保存回 localStorage
[3] 记录审计日志
  ▼
输出：是否删除成功
```

#### getSettings(userId) / saveSettings(settings)

```
输入：userId 或 settings
  │
  ▼
[1] 从 localStorage 读取 STORAGE_KEYS.NOTIFICATION_SETTINGS
[2] 按 userId 读写设置
  ▼
输出：NotificationSettings
```

#### 默认通知类型

- TASK_ASSIGNED, TASK_STATUS_CHANGED, TASK_COMMENTED
- BUG_REPORTED, BUG_ASSIGNED
- REQUIREMENT_APPROVED
- TEST_CASE_FAILED
- GOAL_PROGRESS_UPDATED
- SUBAGENT_TASK_STARTED, SUBAGENT_TASK_COMPLETED, SUBAGENT_TASK_FAILED

---

## 3. SubagentTaskService

**文件**: `app/dashboard/services/SubagentTaskService.ts`

**职责**: 子代理任务管理，用于模拟 AI 子代理工作流。

**注意**: 当前基于 `localStorage` 存储，尚未迁移到数据库。

### 输入-过程-输出

#### createSubagentTask(data)

```
输入：子代理任务数据（不含 id, createdAt）
  │
  ▼
[1] 生成 id 和 createdAt
[2] 记录审计日志
  ▼
输出：SubagentTask 对象
```

#### getSubagentTasks(notificationId?)

```
输入：可选 notificationId
  │
  ▼
[1] 从 localStorage 读取 STORAGE_KEYS.SUBAGENT_TASKS
[2] 如果传了 notificationId 则过滤
[3] 按 createdAt 降序排列
  ▼
输出：SubagentTask[]
```

#### updateTaskStatus(id, status)

```
输入：任务 id，新状态
  │
  ▼
[1] 查找任务
[2] 更新状态
  - RUNNING → 设置 startedAt
  - COMPLETED/FAILED/CANCELLED → 设置 completedAt
  - COMPLETED → progress = 100
[3] 保存回 localStorage
[4] 记录审计日志
  ▼
输出：无
```

#### updateTaskProgress(id, progress)

```
输入：任务 id，进度值
  │
  ▼
[1] 校验进度范围 0-100
[2] 更新任务 progress
  - progress=100 且状态非 COMPLETED → 状态改为 COMPLETED
  - progress>0 且状态 PENDING → 状态改为 RUNNING
[3] 保存回 localStorage
[4] 记录审计日志
  ▼
输出：无
```

#### cancelTask(id) / deleteTask(id)

```
输入：任务 id
  │
  ▼
[1] 取消：仅允许取消非终态任务，状态改为 CANCELLED
[2] 删除：过滤掉任务
[3] 保存回 localStorage
[4] 记录审计日志
  ▼
输出：是否成功
```

---

## 4. AuditService

**文件**: `app/dashboard/services/AuditService.ts`

**职责**: 审计日志工具类，生成审计记录并限制最大条目数。

### 输入-过程-输出

#### logAction(action, target, targetId, details, username?)

```
输入：动作类型、目标类型、目标 id、详情、用户名
  │
  ▼
[1] 生成 AuditLogEntry 对象（id, timestamp, action, target, targetId, details, username）
  ▼
输出：AuditLogEntry
```

#### truncateLogs(logs)

```
输入：日志数组
  │
  ▼
[1] 如果长度超过 1000，保留最后 1000 条
  ▼
输出：截断后的日志数组
```

---

## 5. EpicService

**文件**: `app/dashboard/services/EpicService.ts`

**职责**: Epic 领域逻辑和校验。

### 输入-过程-输出

#### validateEpic(epic)

```
输入：Partial<Epic>
  │
  ▼
[1] 校验 title 非空且 ≤255 字符
[2] 校验 description 长度（警告级别）
[3] 校验 color 为合法 hex 颜色
  ▼
输出：ValidationResult
```

#### createEpic(title, description, color, existingIds)

```
输入：标题、描述、颜色、已有 id 列表
  │
  ▼
[1] 生成唯一 id（如 existingIds 非空则避免重复）
[2] 构造 Epic 对象（status=ACTIVE, createdAt, updatedAt）
  ▼
输出：Epic 对象
```

#### updateEpic(epic, updates)

```
输入：Epic 对象，更新字段
  │
  ▼
[1] 合并 updates，更新 updatedAt
  ▼
输出：更新后的 Epic
```

#### archiveEpic(epic) / activateEpic(epic)

```
输入：Epic 对象
  │
  ▼
[1] 调用 updateEpic，设置 status=ARCHIVED 或 ACTIVE
  ▼
输出：更新后的 Epic
```

#### sortEpicsByDate(epics, ascending)

```
输入：Epic 数组，是否升序
  │
  ▼
[1] 按 createdAt 排序
  ▼
输出：排序后的 Epic 数组
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
