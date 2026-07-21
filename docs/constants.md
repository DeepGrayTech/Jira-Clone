# 常量说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 文件位置

`app/dashboard/constants.ts`

---

## 1. COLORS

应用全局配色方案，使用现代可访问的调色板。

### 基础颜色

| 常量 | 颜色值 | 说明 |
|------|--------|------|
| `background` | `#ffffff` | 页面背景 |
| `text` | `#111827` | 主文字 |
| `textSecondary` | `#4b5563` | 次要文字 |
| `border` | `#e5e7eb` | 边框 |
| `cardBackground` | `#ffffff` | 卡片背景 |
| `columnBackground` | `#f3f4f6` | 看板列背景 |

### 按钮颜色

| 常量 | 颜色值 | 说明 |
|------|--------|------|
| `buttonPrimary` | `#2563eb` | 主按钮 |
| `buttonPrimaryHover` | `#1d4ed8` | 主按钮悬停 |
| `buttonSecondary` | `#f3f4f6` | 次要按钮 |
| `buttonDanger` | `#dc2626` | 危险按钮 |
| `buttonDangerHover` | `#b91c1c` | 危险按钮悬停 |

### 优先级颜色

| 常量 | 颜色值 | 说明 |
|------|--------|------|
| `priorityLow` | `#22c55e` | 低优先级 |
| `priorityMedium` | `#eab308` | 中优先级 |
| `priorityHigh` | `#f97316` | 高优先级 |
| `priorityUrgent` | `#dc2626` | 紧急 |

### 审计日志颜色

| 常量 | 颜色值 | 说明 |
|------|--------|------|
| `auditCreate` | `#22c55e` | CREATE |
| `auditUpdate` | `#3b82f6` | UPDATE |
| `auditDelete` | `#dc2626` | DELETE |
| `auditLogin` | `#8b5cf6` | LOGIN |
| `auditLogout` | `#6b7280` | LOGOUT |
| `auditExport` | `#eab308` | EXPORT |
| `auditImport` | `#f97316` | IMPORT |
| `auditClear` | `#ef4444` | CLEAR |
| `auditRead` | `#6b7280` | READ |
| `auditSystem` | `#6366f1` | SYSTEM |
| `auditTask` | `#3b82f6` | TASK |
| `auditRequirement` | `#8b5cf6` | REQUIREMENT |
| `auditTestCase` | `#22c55e` | TEST_CASE |
| `auditBug` | `#f97316` | BUG |
| `auditGoal` | `#eab308` | GOAL |
| `auditMilestone` | `#06b6d4` | MILESTONE |
| `auditKeyResult` | `#f472b6` | KEY_RESULT |
| `auditNotification` | `#8b5cf6` | NOTIFICATION |
| `auditSubagentTask` | `#06b6d4` | SUBAGENT_TASK |
| `auditEpic` | `#8b5cf6` | EPIC |

---

## 2. STORAGE_KEYS

`localStorage` 存储键名。

| 常量 | 键值 | 说明 |
|------|------|------|
| `TASKS` | `jira-clone-tasks` | 任务数据 |
| `REQUIREMENTS` | `jira-clone-requirements` | 需求数据 |
| `TEST_CASES` | `jira-clone-test-cases` | 测试用例数据 |
| `TAG_HISTORY` | `jira-clone-tag-history` | 标签历史 |
| `COMMENTS` | `jira-clone-comments` | 评论 |
| `BUGS` | `jira-clone-bugs` | Bug |
| `GOALS` | `jira-clone-goals` | 目标 |
| `MILESTONES` | `jira-clone-milestones` | 里程碑 |
| `KEY_RESULTS` | `jira-clone-key-results` | 关键结果 |
| `AUDIT_LOGS` | `jira-clone-audit-logs` | 审计日志 |
| `OPERATION_LOGS` | `jira-clone-operation-logs` | 操作日志 |
| `NOTIFICATIONS` | `jira-clone-notifications` | 通知 |
| `SUBAGENT_TASKS` | `jira-clone-subagent-tasks` | 子代理任务 |
| `NOTIFICATION_SETTINGS` | `jira-clone-notification-settings` | 通知设置 |
| `EPICS` | `jira-clone-epics` | Epic |
| `DATA_VERSION` | `jira-clone-data-version` | 数据版本 |

---

## 3. DATA_VERSION

当前数据格式版本：`"3"`

用于数据迁移时判断 localStorage 数据格式是否需要升级。

### 数据版本检查流程

```
输入：localStorage.getItem(STORAGE_KEYS.DATA_VERSION)
  │
  ▼
[1] 比较当前版本与 DATA_VERSION
  │  ├─ 一致 → 无需升级
  │  └─ 不一致 → 可能需要执行迁移逻辑
  │
  ▼
输出：是否需要升级
```

---

## 4. STATUS_LABELS

### 任务状态显示标签

| 状态 | 显示文本 |
|------|----------|
| `TODO` | To Do |
| `IN_PROGRESS` | In Progress |
| `DONE` | Done |

### 需求状态显示标签

| 状态 | 显示文本 |
|------|----------|
| `DRAFT` | Draft |
| `REVIEW` | In Review |
| `APPROVED` | Approved |
| `IMPLEMENTED` | Implemented |

### 测试用例状态显示标签

| 状态 | 显示文本 |
|------|----------|
| `PENDING` | Pending |
| `PASSED` | Passed |
| `FAILED` | Failed |
| `BLOCKED` | Blocked |

### 使用流程

```
输入：原始状态字符串
  │
  ▼
[1] 在 STATUS_LABELS 中查找对应状态
[2] 如果找到，返回显示文本
[3] 如果未找到，返回原始状态或默认值
  │
  ▼
输出：用户友好的显示文本
```

---

## 5. Epic 过滤常量与助手函数

自 v1.4.0 起，`constants.ts` 提供 Epic 作用边界（"No Epic" 过滤器）相关的常量与纯函数。

| 导出 | 类型 | 说明 |
|------|------|------|
| `NO_EPIC_FILTER` | `string` | Epic 过滤器哨兵值 `"__no_epic__"`，表示"只显示无 Epic 的卡片"；不是真实 Epic id，不会写入数据 |
| `matchesEpicFilter(itemEpicId, currentEpicId)` | 函数 | 判断卡片是否匹配当前 Epic 过滤器，五个业务视图统一使用 |
| `epicIdForCreate(currentEpicId)` | 函数 | 计算新建卡片应携带的 epicId |

### matchesEpicFilter 判断流程

```
输入：itemEpicId（卡片的 epicId）、currentEpicId（当前过滤器）
  │
  ▼
[1] currentEpicId === null（All Epics） → 全部匹配
[2] currentEpicId === NO_EPIC_FILTER → 仅匹配无 epicId 的卡片
[3] 其他 → itemEpicId === currentEpicId
  │
  ▼
输出：boolean
```

### epicIdForCreate

- 输入：当前 Epic 过滤器（`string | null`）。
- 输出：过滤器为具体 Epic 时返回该 id；All Epics（`null`）或 No Epic（哨兵）时返回 `undefined`，保证哨兵值不会写入存储数据。

**epicId 语义约定**: 空串 `""`、`undefined`、`null` 统一视为"无 Epic"。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
