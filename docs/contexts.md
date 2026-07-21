# Context 状态管理说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 概述

Dashboard 使用 React Context 进行全局状态管理。每个业务实体对应一个独立的 Context，避免单一 Context 过度重渲染。所有 Context 均位于 `app/dashboard/contexts/`。

Context 统一遵循以下模式：

- 使用 `useState` 管理状态，使用 `useRef` 保存最新值以解决陈旧闭包问题。
- 所有 `setXxx` 均使用函数式更新，确保连续状态更新正确。
- CRUD 操作优先调用 API；API 失败时回退到本地状态，并同步写入 `localStorage`。
- 导出 `useXxx` Hook，未在 Provider 内使用会抛错。

---

## Context 层级

```
NotificationProvider
└── EpicProvider
    └── TaskProvider
        └── RequirementProvider
            └── BugProvider
                └── GoalProvider
                    └── AuditProvider
                        └── TestCaseProvider
                            └── SharedProvider
                                └── DashboardShell
```

---

## 通用 Context 模式

```
输入：业务操作（add/update/delete）
  │
  ▼
[1] 乐观更新本地状态 + 持久化到 localStorage
  │
  ▼
[2] 调用后端 API
  │
  ├─ 成功 → 用服务端返回数据再次更新本地状态
  │   │
  │   ▼
  │   输出：最终状态
  │
  └─ 失败 → 保留本地状态（控制台警告）
      │
      ▼
      输出：本地状态
```

---

## 1. TaskContext

**文件**: `app/dashboard/contexts/TaskContext.tsx`

**职责**: 任务状态管理。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `tasks` | `Task[]` | 任务列表 |
| `setTasks` | `React.Dispatch<...>` | 直接设置任务列表 |
| `addTask(task)` | `Promise<void>` | 创建任务，先调用 API，失败回退本地 |
| `updateTask(id, updates)` | `Promise<void>` | 更新任务 |
| `deleteTask(id)` | `Promise<void>` | 删除任务 |
| `getTaskById(id)` | `Task \| undefined` | 按 ID 查找任务 |

**输入-过程-输出**:

```
输入：addTask(task) / updateTask(id, updates) / deleteTask(id)
  │
  ▼
[1] 乐观更新本地状态
[2] 调用 createTaskApi / updateTaskApi / deleteTaskApi
[3] 成功 → 用服务端数据再次更新状态
[4] 失败 → 保留本地状态
  │
  ▼
输出：tasks 状态变化
```

**持久化键**: `jira-clone-tasks`

---

## 2. RequirementContext

**文件**: `app/dashboard/contexts/RequirementContext.tsx`

**职责**: 需求状态管理。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `requirements` | `Requirement[]` | 需求列表 |
| `setRequirements` | `React.Dispatch<...>` | 直接设置需求列表 |
| `addRequirement(req)` | `Promise<void>` | 创建需求 |
| `updateRequirement(id, updates)` | `Promise<void>` | 更新需求 |
| `deleteRequirement(id)` | `Promise<void>` | 删除需求 |
| `getRequirementById(id)` | `Requirement \| undefined` | 按 ID 查找需求 |

**输入-过程-输出**: 同 TaskContext 模式。

**持久化键**: `jira-clone-requirements`

---

## 3. TestCaseContext

**文件**: `app/dashboard/contexts/TestCaseContext.tsx`

**职责**: 测试用例状态管理。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `testCases` | `TestCase[]` | 测试用例列表 |
| `setTestCases` | `React.Dispatch<...>` | 直接设置测试用例列表 |
| `addTestCase(tc)` | `Promise<void>` | 创建测试用例 |
| `updateTestCase(id, updates)` | `Promise<void>` | 更新测试用例 |
| `deleteTestCase(id)` | `Promise<void>` | 删除测试用例 |
| `getTestCaseById(id)` | `TestCase \| undefined` | 按 ID 查找测试用例 |

**输入-过程-输出**: 同 TaskContext 模式。

**持久化键**: `jira-clone-test-cases`

---

## 4. BugContext

**文件**: `app/dashboard/contexts/BugContext.tsx`

**职责**: Bug 状态管理。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `bugs` | `Bug[]` | Bug 列表 |
| `setBugs` | `React.Dispatch<...>` | 直接设置 Bug 列表 |
| `addBug(bug)` | `Promise<void>` | 创建 Bug |
| `updateBug(id, updates)` | `Promise<void>` | 更新 Bug |
| `deleteBug(id)` | `Promise<void>` | 删除 Bug |
| `getBugById(id)` | `Bug \| undefined` | 按 ID 查找 Bug |

**输入-过程-输出**: 同 TaskContext 模式。

**持久化键**: `jira-clone-bugs`

---

## 5. GoalContext

**文件**: `app/dashboard/contexts/GoalContext.tsx`

**职责**: 目标、里程碑、关键结果状态管理。这是功能最复杂的 Context，同时管理三个关联实体。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `goals` | `Goal[]` | 目标列表 |
| `milestones` | `Milestone[]` | 里程碑列表 |
| `keyResults` | `KeyResult[]` | 关键结果列表 |
| `setGoals` | `React.Dispatch<...>` | 设置目标列表 |
| `setMilestones` | `React.Dispatch<...>` | 设置里程碑列表 |
| `setKeyResults` | `React.Dispatch<...>` | 设置关键结果列表 |
| `addGoal(goal)` | `Promise<void>` | 创建目标 |
| `updateGoal(id, updates)` | `Promise<void>` | 更新目标 |
| `deleteGoal(id)` | `Promise<void>` | 删除目标，级联删除关联里程碑和关键结果 |
| `addMilestone(milestone)` | `Promise<void>` | 创建里程碑 |
| `updateMilestone(id, updates)` | `Promise<void>` | 更新里程碑 |
| `deleteMilestone(id)` | `Promise<void>` | 删除里程碑 |
| `addKeyResult(keyResult)` | `Promise<void>` | 创建关键结果 |
| `updateKeyResult(id, updates)` | `Promise<void>` | 更新关键结果 |
| `deleteKeyResult(id)` | `Promise<void>` | 删除关键结果 |

**输入-过程-输出**:

```
输入：Goal/Milestone/KeyResult 操作
  │
  ▼
[1] 更新对应本地状态
[2] 调用 API
[3] 成功 → 用服务端数据同步状态
[4] 失败 → 保留本地状态
  │
  ▼
输出：goals/milestones/keyResults 状态变化
```

**持久化键**: `jira-clone-goals`, `jira-clone-milestones`, `jira-clone-key-results`

---

## 6. EpicContext

**文件**: `app/dashboard/contexts/EpicContext.tsx`

**职责**: Epic 状态管理，并维护当前选中的 Epic ID。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `epics` | `Epic[]` | Epic 列表 |
| `currentEpicId` | `string \| null` | 当前选中的 Epic ID |
| `setEpics` | `React.Dispatch<...>` | 设置 Epic 列表 |
| `setCurrentEpicId` | `React.Dispatch<...>` | 设置当前 Epic ID |
| `addEpic(epic)` | `Promise<void>` | 创建 Epic |
| `updateEpic(id, updates)` | `Promise<void>` | 更新 Epic |
| `deleteEpic(id)` | `Promise<void>` | 删除 Epic，如果删除的是当前选中 Epic 会清空选择 |
| `getEpicById(id)` | `Epic \| undefined` | 按 ID 查找 Epic |
| `setCurrentEpic(epicId)` | `void` | 设置当前 Epic |

**输入-过程-输出**: 同 TaskContext 模式，额外维护 currentEpicId。

**持久化键**: `jira-clone-epics`

---

## 7. AuditContext

**文件**: `app/dashboard/contexts/AuditContext.tsx`

**职责**: 审计日志管理。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `auditLogs` | `AuditLogEntry[]` | 审计日志列表 |
| `setAuditLogs` | `React.Dispatch<...>` | 设置审计日志列表 |
| `addAuditLog(log)` | `Promise<void>` | 添加审计日志，最多保留 1000 条 |

**输入-过程-输出**:

```
输入：AuditLogEntry
  │
  ▼
[1] 调用 createAuditLogApi
[2] 本地状态追加 log
[3] 截断到最多 1000 条
  │
  ▼
输出：auditLogs 状态变化
```

**持久化键**: `jira-clone-audit-logs`

---

## 8. SharedContext

**文件**: `app/dashboard/contexts/SharedContext.tsx`

**职责**: 跨模块共享数据：评论、标签历史、操作日志。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `comments` | `Comment[]` | 评论列表 |
| `tagHistory` | `string[]` | 标签历史 |
| `operationLogs` | `OperationLog[]` | 操作日志 |
| `setComments` | `React.Dispatch<...>` | 设置评论列表 |
| `setTagHistory` | `React.Dispatch<...>` | 设置标签历史 |
| `setOperationLogs` | `React.Dispatch<...>` | 设置操作日志 |
| `addComment(comment)` | `Promise<void>` | 添加评论 |
| `deleteComment(commentId)` | `Promise<void>` | 删除评论 |
| `logOperation(action, target, details)` | `void` | 记录操作日志，最多保留 100 条 |

**输入-过程-输出**: 同 TaskContext 模式。

**持久化键**: `jira-clone-comments`, `jira-clone-tag-history`, `jira-clone-operation-logs`

---

## 9. NotificationContext

**文件**: `app/dashboard/contexts/NotificationContext.tsx`

**职责**: 通知系统、子代理任务、通知设置。

**注意**: 该 Context 当前仍主要依赖 `localStorage` 和服务层（`NotificationService`, `SubagentTaskService`），尚未迁移到数据库。

**暴露 API**:

| 字段/方法 | 类型 | 说明 |
|-----------|------|------|
| `notifications` | `Notification[]` | 通知列表 |
| `unreadCount` | `number` | 未读通知数 |
| `subagentTasks` | `SubagentTask[]` | 子代理任务列表 |
| `settings` | `NotificationSettings` | 通知设置 |
| `fetchNotifications()` | `void` | 刷新通知 |
| `markAsRead(id)` | `void` | 标记已读 |
| `markAllAsRead()` | `void` | 全部已读 |
| `deleteNotification(id)` | `boolean` | 删除通知 |
| `createNotification(data)` | `Notification` | 创建通知 |
| `fetchSubagentTasks()` | `void` | 刷新子代理任务 |
| `createSubagentTask(data)` | `SubagentTask` | 创建子代理任务 |
| `updateSubagentTaskStatus(id, status)` | `void` | 更新任务状态 |
| `updateSubagentTaskProgress(id, progress)` | `void` | 更新任务进度 |
| `cancelSubagentTask(id)` | `boolean` | 取消任务 |
| `fetchSettings()` | `void` | 刷新设置 |
| `saveSettings(settings)` | `void` | 保存设置 |
| `isNotificationEnabled(type)` | `boolean` | 检查通知类型是否启用 |
| `isSubagentAutoScheduleEnabled()` | `boolean` | 检查是否自动调度子代理 |

**输入-过程-输出**:

```
输入：通知/子代理任务/设置操作
  │
  ▼
[1] 调用 NotificationService / SubagentTaskService 方法
[2] 从 localStorage 读取并更新状态
  │
  ▼
输出：notifications / subagentTasks / settings 状态变化
```

---

## 通用实现模式

所有业务 Context 遵循以下模式：

```tsx
const [items, setItems] = useState<Item[]>([]);
const itemsRef = useRef(items);
itemsRef.current = items;

const addItem = useCallback(async (item: Item) => {
  try {
    const created = await createItemApi(item);
    setItems((prev) => {
      const next = [...prev, created];
      persistItems(next);
      return next;
    });
  } catch (error) {
    // API 失败回退到本地状态
    setItems((prev) => [...prev, item]);
  }
}, []);
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
