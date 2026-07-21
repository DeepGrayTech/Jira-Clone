# Contexts 详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`app/dashboard/contexts/` 包含 10 个 React Context，分别管理不同业务实体的状态。每个 Context 遵循统一模式：

- 使用 `useState` 管理状态
- 使用 `useRef` 保存最新状态引用，避免闭包问题
- 提供 `add/update/delete` 等操作函数
- 操作函数优先调用后端 API，失败时回退到本地状态
- 本地状态变化时同步到 `localStorage`

---

## 2. 通用 Context 模式

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

## 3. TaskContext

**文件**: `app/dashboard/contexts/TaskContext.tsx`

**职责**: 管理任务状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addTask(task)` | Task 对象 | 调用 `createTaskApi(task)` | 新增任务到 tasks |
| `updateTask(id, updates)` | id, 部分 Task 字段 | 乐观更新 → 调用 `updateTaskApi` → 用返回数据更新 | 更新后的任务 |
| `deleteTask(id)` | id | 乐观删除 → 调用 `deleteTaskApi` | 删除后的 tasks |
| `getTaskById(id)` | id | 从 `tasksRef.current` 查找 | Task 或 undefined |

### 持久化

```ts
function persistTasks(tasks: Task[]) {
  const payload = JSON.stringify(tasks);
  encryptData(payload).then((encrypted) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, encrypted || payload);
  });
}
```

### 回退策略

如果 API 失败，仍保留本地新增/修改/删除，确保 UI 不中断。

---

## 4. RequirementContext

**文件**: `app/dashboard/contexts/RequirementContext.tsx`

**职责**: 管理需求状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addRequirement(req)` | Requirement 对象 | 调用 `createRequirementApi` | 新增需求 |
| `updateRequirement(id, updates)` | id, 部分字段 | 乐观更新 → API 更新 | 更新后的需求 |
| `deleteRequirement(id)` | id | 乐观删除 → API 删除 | 删除后的 requirements |

### 回退策略

API 失败时保留本地状态。

---

## 5. BugContext

**文件**: `app/dashboard/contexts/BugContext.tsx`

**职责**: 管理 Bug 状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addBug(bug)` | Bug 对象 | 调用 `createBugApi` | 新增 Bug |
| `updateBug(id, updates)` | id, 部分字段 | 乐观更新 → API 更新 | 更新后的 Bug |
| `deleteBug(id)` | id | 乐观删除 → API 删除 | 删除后的 bugs |

---

## 6. TestCaseContext

**文件**: `app/dashboard/contexts/TestCaseContext.tsx`

**职责**: 管理测试用例状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addTestCase(tc)` | TestCase 对象 | 调用 `createTestCaseApi` | 新增测试用例 |
| `updateTestCase(id, updates)` | id, 部分字段 | 乐观更新 → API 更新 | 更新后的测试用例 |
| `deleteTestCase(id)` | id | 乐观删除 → API 删除 | 删除后的 testCases |

---

## 7. GoalContext

**文件**: `app/dashboard/contexts/GoalContext.tsx`

**职责**: 管理目标、里程碑、关键结果状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addGoal(goal)` | Goal 对象 | 调用 `createGoalApi` | 新增 Goal |
| `updateGoal(id, updates)` | id, 部分字段 | 乐观更新 → API 更新 | 更新后的 Goal |
| `deleteGoal(id)` | id | 乐观删除 → API 删除 | 删除后的 goals |
| `addMilestone(milestone)` | Milestone 对象 | 调用 `createMilestoneApi` | 新增 Milestone |
| `updateMilestone(id, updates)` | id | 乐观更新 → API 更新 | 更新后的 Milestone |
| `deleteMilestone(id)` | id | 乐观删除 → API 删除 | 删除后的 milestones |
| `addKeyResult(keyResult)` | KeyResult 对象 | 调用 `createKeyResultApi` | 新增 KeyResult |
| `updateKeyResult(id, updates)` | id | 乐观更新 → API 更新 | 更新后的 KeyResult |
| `deleteKeyResult(id)` | id | 乐观删除 → API 删除 | 删除后的 keyResults |

---

## 8. EpicContext

**文件**: `app/dashboard/contexts/EpicContext.tsx`

**职责**: 管理 Epic 状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addEpic(epic)` | Epic 对象 | 调用 `createEpicApi` | 新增 Epic |
| `updateEpic(id, updates)` | id, 部分字段 | 乐观更新 → API 更新 | 更新后的 Epic |
| `deleteEpic(id)` | id | 乐观删除 → API 删除 | 删除后的 epics |

---

## 9. AuditContext

**文件**: `app/dashboard/contexts/AuditContext.tsx`

**职责**: 管理审计日志状态。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addAuditLog(log)` | AuditLogEntry 对象 | 调用 `createAuditLogApi` | 新增审计日志 |
| `setAuditLogs(logs)` | AuditLogEntry[] | 直接设置状态 | 更新后的 auditLogs |

### 限制

审计日志最多保留 1000 条（在 `useDataLoader` 中处理）。

---

## 10. SharedContext

**文件**: `app/dashboard/contexts/SharedContext.tsx`

**职责**: 管理共享的局部状态：评论、标签历史、操作日志。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `addComment(comment)` | Comment 对象 | 调用 `createCommentApi` | 新增评论 |
| `deleteComment(id)` | id | 调用 `deleteCommentApi` | 删除后的 comments |
| `setTagHistory(tags)` | string[] | 直接设置 | 更新后的 tagHistory |
| `addOperationLog(action)` | 操作字符串 | 添加操作日志，限制 100 条 | 更新后的 operationLogs |

---

## 11. NotificationContext

**文件**: `app/dashboard/contexts/NotificationContext.tsx`

**职责**: 管理通知状态。当前数据主要保存在 localStorage 中，通过 NotificationService 操作。

### 输入-过程-输出

| 方法 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `createNotification(data)` | 通知数据 | 调用 NotificationService.createNotification | 新增通知 |
| `markAsRead(id)` | 通知 id | 调用 NotificationService.markAsRead | 标记已读 |
| `markAllAsRead()` | 无 | 调用 NotificationService.markAllAsRead | 全部已读 |
| `deleteNotification(id)` | 通知 id | 调用 NotificationService.deleteNotification | 删除通知 |
| `getSettings()` / `saveSettings()` | userId/settings | 操作 localStorage | 通知设置 |

---

## 12. contexts/index.ts

**文件**: `app/dashboard/contexts/index.ts`

**职责**: 统一导出所有 Context 和 Provider，简化导入路径。

### 输入-过程-输出

```
输入：模块导入
  │
  ▼
从各 Context 文件导入 Provider 和 Hook
  │
  ▼
输出：统一导出的 Provider 和 Hooks
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
