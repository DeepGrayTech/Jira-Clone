# 类型定义说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 文件位置

`app/dashboard/types.ts`

---

## 业务实体类型

### Comment

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 评论唯一 ID |
| `taskId` | `string` | 所属任务 ID |
| `author` | `string` | 作者名 |
| `content` | `string` | 内容 |
| `createdAt` | `string` | ISO 时间戳 |

---

### Epic

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | Epic ID |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `color` | `string` | hex 颜色 |
| `status` | `EpicStatus` | `ACTIVE \| ARCHIVED` |
| `createdAt` | `string` | 创建时间 |
| `updatedAt` | `string` | 更新时间 |

---

### Task

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 任务 ID |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `status` | `"TODO" \| "IN_PROGRESS" \| "DONE"` | 状态 |
| `priority` | `"LOW" \| "MEDIUM" \| "HIGH" \| "URGENT"` | 优先级 |
| `dueDate` | `string` | 截止日期 |
| `tags` | `string[]` | 标签 |
| `assignee` | `string` | 指派人 |
| `relatedRequirementId` | `string?` | 关联需求 |
| `relatedGoalId` | `string?` | 关联目标 |
| `figmaUrl` | `string?` | Figma 链接 |
| `comments` | `Comment[]` | 评论 |
| `createdAt` | `string` | 创建时间 |
| `epicId` | `string?` | 关联 Epic |

---

### Requirement

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 需求 ID |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `source` | `string?` | 标准来源 |
| `priority` | `"LOW" \| "MEDIUM" \| "HIGH" \| "CRITICAL"` | 优先级 |
| `status` | `"DRAFT" \| "REVIEW" \| "APPROVED" \| "IMPLEMENTED"` | 状态 |
| `acceptanceCriteria` | `string[]` | 验收标准 |
| `createdAt` | `string` | 创建时间 |
| `updatedAt` | `string` | 更新时间 |
| `requester` | `string` | 提出人 |
| `executor` | `string` | 执行人 |
| `relatedGoalId` | `string?` | 关联目标 |
| `epicId` | `string?` | 关联 Epic |

---

### TestCase

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 测试用例 ID |
| `requirementId` | `string` | 关联需求 ID |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `steps` | `string[]` | 测试步骤 |
| `expectedResult` | `string` | 预期结果 |
| `status` | `"PENDING" \| "PASSED" \| "FAILED" \| "BLOCKED"` | 状态 |
| `executedAt` | `string?` | 执行时间 |
| `executor` | `string?` | 执行人 |
| `errorMessage` | `string?` | 错误信息 |
| `errorLog` | `string?` | 错误日志 |
| `actualResult` | `string?` | 实际结果 |
| `epicId` | `string?` | 关联 Epic |

---

### Bug

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | Bug ID |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `stepsToReproduce` | `string[]` | 复现步骤 |
| `expectedBehavior` | `string` | 预期行为 |
| `actualBehavior` | `string` | 实际行为 |
| `severity` | `BugSeverity` | `CRITICAL \| HIGH \| MEDIUM \| LOW` |
| `priority` | `BugPriority` | `URGENT \| HIGH \| MEDIUM \| LOW` |
| `status` | `BugStatus` | `REPORTED \| ASSIGNED \| IN_PROGRESS \| RESOLVED \| VERIFIED \| CLOSED \| REOPENED` |
| `reporter` | `string` | 报告人 |
| `assignee` | `string?` | 处理人 |
| `verifier` | `string?` | 验证人 |
| `relatedTaskId` | `string?` | 关联任务 |
| `relatedRequirementId` | `string?` | 关联需求 |
| `createdAt` | `string` | 创建时间 |
| `updatedAt` | `string` | 更新时间 |
| `resolvedAt` | `string?` | 解决时间 |
| `verifiedAt` | `string?` | 验证时间 |
| `resolution` | `string?` | 解决方案 |
| `comments` | `BugComment[]` | 评论 |
| `attachments` | `string[]?` | 附件 |
| `epicId` | `string?` | 关联 Epic |

---

### BugComment

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 评论 ID |
| `bugId` | `string` | 所属 Bug ID |
| `author` | `string` | 作者 |
| `content` | `string` | 内容 |
| `createdAt` | `string` | 创建时间 |

---

### Goal / Milestone / KeyResult

| 类型 | 关键字段 | 说明 |
|------|----------|------|
| `Goal` | `type`, `status`, `target`, `currentProgress`, `startDate`, `endDate`, `owner`, `milestones`, `keyResults` | 目标 |
| `Milestone` | `goalId`, `dueDate`, `completed`, `completedAt` | 里程碑 |
| `KeyResult` | `goalId`, `targetValue`, `currentValue`, `unit`, `status` | 关键结果 |

---

## 表单与视图类型

### FormFields

通用表单状态，用于新建/编辑弹窗。包含任务、需求、测试用例、Bug 的所有字段。自 v1.4.0 起包含 `epicId: string` 字段（空串 = 无 Epic），驱动弹窗中的 Epic 归属下拉。

### ModalType

弹窗类型：`"task" | "requirement" | "test" | "bug"`

### ViewMode

Dashboard 视图模式：
- `TASKS`
- `REQUIREMENTS`
- `TESTING`
- `BUGS`
- `GOALS`
- `AUDIT`
- `NOTIFICATIONS`

---

## 审计与日志类型

### OperationLog

UI 操作日志，用于本地操作记录。

### AuditAction

审计动作：`CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT | IMPORT | CLEAR | READ`

### AuditTarget

审计目标：`TASK | REQUIREMENT | TEST_CASE | BUG | GOAL | MILESTONE | KEY_RESULT | SYSTEM | NOTIFICATION | SUBAGENT_TASK | EPIC`

### AuditLogEntry

完整审计日志条目，含 `id`, `timestamp`, `action`, `target`, `targetId`, `details`, `username`。

---

## 通知系统类型

### NotificationType

通知类型：任务分配、状态变更、评论、Bug 报告、子代理任务状态等。

### Notification

通知实体：包含 `type`, `title`, `message`, `recipient`, `isRead`, `isActionable`, `actionUrl` 等。

### SubagentTask

子代理任务实体：包含 `subagentName`, `taskType`, `status`, `progress`, `inputData`, `outputData` 等。

### NotificationSettings

通知设置：包含 `enabledTypes`, `autoScheduleSubagent`, `preferredSubagents`, `muteUntil`。

---

## 校验类型

### ValidationError

| 字段 | 说明 |
|------|------|
| `id` | 数据对象 ID |
| `type` | 数据类型 |
| `field` | 出错字段 |
| `message` | 错误描述 |
| `severity` | `error` 或 `warning` |

### ValidationResult

| 字段 | 说明 |
|------|------|
| `isValid` | 是否有效 |
| `errors` | 错误数组 |
| `warnings` | 警告数组 |
| `validCount` | 有效数量 |
| `totalCount` | 总数量 |
| `type` | 数据类型 |

---

## 类型守卫函数

| 函数 | 说明 |
|------|------|
| `isValidTaskStatus(status)` | 校验任务状态 |
| `isValidTaskPriority(priority)` | 校验任务优先级 |
| `isValidRequirementStatus(status)` | 校验需求状态 |
| `isValidRequirementPriority(priority)` | 校验需求优先级 |
| `isValidTestCaseStatus(status)` | 校验测试用例状态 |
| `isValidNotificationType(type)` | 校验通知类型 |

### 类型守卫流程

```
输入：任意字符串
  │
  ▼
[1] 检查字符串是否包含在预定义枚举中
  │
  ▼
输出：boolean
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
