# API 路由说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 通用约定

- 所有 API 路由均位于 `app/api/**/*`。
- 所有受保护的 API 路由通过 `getServerSession(authOptions)` 读取当前用户，并限制 `userId`。
- 请求/响应格式为 JSON，HTTP 状态码遵循 REST 约定。
- 通用 HTTP 状态：
  - `200` 成功
  - `201` 创建成功
  - `400` 请求参数错误
  - `401` 未认证
  - `403` 无权限
  - `404` 资源不存在
  - `500` 服务端错误

---

## 通用请求处理流程

```
输入：HTTP 请求 (req)
  │
  ▼
[1] 调用 getServerSession(req, res, authOptions)
  │
  ▼
[2] 检查 session 是否存在
  │  ├─ 不存在 → 返回 401 Unauthorized
  │  └─ 存在 → 继续
  │
  ▼
[3] 从 session 获取 user.id
  │
  ▼
[4] 解析请求体/查询参数
  │  ├─ 解析失败 → 返回 400 Bad Request
  │  └─ 成功 → 继续
  │
  ▼
[5] 执行 Prisma 操作（带 where: { userId }）
  │  ├─ 资源不存在 → 返回 404 Not Found
  │  └─ 成功 → 继续
  │
  ▼
[6] 返回 JSON 响应
  │
  ▼
输出：HTTP Response
```

---

## 认证相关

### `POST /api/auth/[...nextauth]`

NextAuth 内部路由，用于：
- 获取 session: `GET /api/auth/session`
- 登录: `POST /api/auth/callback/credentials`

由 `lib/auth-config.ts` 的 `authorize` 回调实现。

### `POST /api/auth/register`

注册用户。

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "USER | ADMIN"
}
```

**处理流程**:

```
输入：{ username, email, password, role }
  │
  ▼
[1] 校验 email 唯一性
  │  ├─ 已存在 → 返回 409
  │  └─ 不存在 → 继续
  │
  ▼
[2] 使用 bcryptjs.hash(password, 10) 生成密码哈希
  ▼
[3] prisma.user.create({ email, username, passwordHash, role })
  ▼
输出：{ message: "User registered successfully" }
```

**响应**:
```json
{ "message": "User registered successfully" }
```

**实现文件**: `app/api/auth/register/route.ts`

---

## 任务 (Tasks)

### `GET /api/tasks`

返回当前用户的所有任务。

**响应**:
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "TODO | IN_PROGRESS | DONE",
    "priority": "LOW | MEDIUM | HIGH | CRITICAL",
    "dueDate": "string",
    "tags": "JSON string",
    "assignee": "string",
    "relatedRequirementId": "string",
    "relatedGoalId": "string",
    "figmaUrl": "string",
    "epicId": "string",
    "createdAt": "string"
  }
]
```

### `POST /api/tasks`

创建任务。

**处理流程**:

```
输入：任务字段（除 id, userId）
  │
  ▼
[1] 校验 title 非空
  ▼
[2] prisma.task.create({ data: { ..., userId: session.user.id } })
  ▼
[3] 返回创建的任务
```

**请求体**: 任务字段（除 `id`、 `userId`）。

### `PUT /api/tasks/:id`

更新任务。

**处理流程**:

```
输入：id, 更新字段
  │
  ▼
[1] 校验 id 存在
  ▼
[2] prisma.task.update({ where: { id, userId }, data: { ... } })
  ▼
[3] 返回更新后的任务
```

### `DELETE /api/tasks/:id`

删除任务。

**处理流程**:

```
输入：id
  │
  ▼
[1] prisma.task.delete({ where: { id, userId } })
  ▼
[2] 返回 200 OK
```

**实现文件**: `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`

---

## 需求 (Requirements)

### `GET /api/requirements`

返回当前用户的所有需求。

### `POST /api/requirements`

创建需求。

### `PUT /api/requirements/:id`

更新需求。

### `DELETE /api/requirements/:id`

删除需求。删除后关联测试用例的 `relatedRequirementId` 会被清空。

**处理流程**:

```
输入：需求 id
  │
  ▼
[1] prisma.requirement.delete({ where: { id, userId } })
[2] prisma.testCase.updateMany({ where: { relatedRequirementId: id }, data: { relatedRequirementId: null } })
  ▼
输出：删除成功
```

**实现文件**: `app/api/requirements/route.ts`, `app/api/requirements/[id]/route.ts`

---

## 测试用例 (Test Cases)

### `GET /api/test-cases`

返回当前用户的所有测试用例。

### `POST /api/test-cases`

创建测试用例。

### `PUT /api/test-cases/:id`

更新测试用例。

### `DELETE /api/test-cases/:id`

删除测试用例。

**实现文件**: `app/api/test-cases/route.ts`, `app/api/test-cases/[id]/route.ts`

---

## Bug (Bugs)

### `GET /api/bugs`

返回当前用户的所有 Bug。

### `POST /api/bugs`

创建 Bug。

### `PUT /api/bugs/:id`

更新 Bug。

### `DELETE /api/bugs/:id`

删除 Bug。

**实现文件**: `app/api/bugs/route.ts`, `app/api/bugs/[id]/route.ts`

---

## 目标 (Goals)

### `GET /api/goals`

返回当前用户的所有目标，包含关联的 `milestones` 和 `keyResults`。

**处理流程**:

```
输入：session
  │
  ▼
prisma.goal.findMany({
  where: { userId },
  include: { milestones: true, keyResults: true }
})
  ▼
输出：Goal[]（含子实体）
```

### `POST /api/goals`

创建目标。

### `PUT /api/goals/:id`

更新目标。

### `DELETE /api/goals/:id`

删除目标，级联删除关联的 milestones 和 key results。

**实现文件**: `app/api/goals/route.ts`, `app/api/goals/[id]/route.ts`

---

## 里程碑 (Milestones)

### `GET /api/goals/milestones`

返回当前用户的所有里程碑。

### `POST /api/goals/milestones`

创建里程碑。

### `PUT /api/goals/milestones/:id`

更新里程碑。

### `DELETE /api/goals/milestones/:id`

删除里程碑。

**实现文件**: `app/api/goals/milestones/route.ts`, `app/api/goals/milestones/[id]/route.ts`

---

## 关键结果 (Key Results)

### `GET /api/goals/key-results`

返回当前用户的所有关键结果。

### `POST /api/goals/key-results`

创建关键结果。

### `PUT /api/goals/key-results/:id`

更新关键结果。

### `DELETE /api/goals/key-results/:id`

删除关键结果。

**实现文件**: `app/api/goals/key-results/route.ts`, `app/api/goals/key-results/[id]/route.ts`

---

## Epic

### `GET /api/epics`

返回当前用户的所有 Epic。

### `POST /api/epics`

创建 Epic。

### `PUT /api/epics/:id`

更新 Epic。

### `DELETE /api/epics/:id`

删除 Epic，级联删除关联的任务、需求、测试用例、Bug、目标、评论等。

**处理流程**:

```
输入：epic id
  │
  ▼
[1] prisma.task.deleteMany({ where: { epicId: id, userId } })
[2] prisma.requirement.deleteMany({ where: { epicId: id, userId } })
[3] prisma.testCase.deleteMany({ where: { epicId: id, userId } })
[4] prisma.bug.deleteMany({ where: { epicId: id, userId } })
[5] prisma.goal.deleteMany({ where: { epicId: id, userId } })
[6] prisma.epic.delete({ where: { id, userId } })
  ▼
输出：删除成功
```

**实现文件**: `app/api/epics/route.ts`, `app/api/epics/[id]/route.ts`

---

## 评论 (Comments)

### `GET /api/comments?taskId=xxx`

返回指定任务下的评论。需传入 `taskId` 查询参数。

**处理流程**:

```
输入：taskId 查询参数
  │
  ▼
[1] 校验 taskId 存在
  ▼
[2] prisma.comment.findMany({ where: { taskId, task: { userId } } })
  ▼
输出：Comment[]
```

### `POST /api/comments`

创建评论。

**请求体**:
```json
{
  "taskId": "string",
  "content": "string",
  "author": "string"
}
```

### `DELETE /api/comments/:id`

删除评论。

**实现文件**: `app/api/comments/route.ts`, `app/api/comments/[id]/route.ts`

---

## 审计日志 (Audit Logs)

### `GET /api/audit-logs`

返回当前用户的审计日志。

### `POST /api/audit-logs`

创建审计日志。

**请求体**:
```json
{
  "action": "string",
  "entityType": "string",
  "entityId": "string",
  "details": "string",
  "username": "string"
}
```

**实现文件**: `app/api/audit-logs/route.ts`

---

## 数据导入 (Import)

### `POST /api/import`

将本地 localStorage 导出的数据批量导入到当前用户数据库。

**请求体**:
```json
{
  "epics": [...],
  "tasks": [...],
  "requirements": [...],
  "testCases": [...],
  "bugs": [...],
  "goals": [...],
  "auditLogs": [...]
}
```

**处理流程**:

```
输入：导入数据
  │
  ▼
[1] 认证（getServerSession），未登录返回 401
  ▼
[2] 在 prisma.$transaction 中逐类 createMany：
    epics → tasks → requirements → testCases → bugs
  ▼
[3] goals 逐条 create，嵌套创建 milestones / keyResults
  │   └─ keyResults 兼容两种字段命名：
  │      target ?? targetValue ?? 100
  │      current ?? currentValue ?? 0
  ▼
[4] auditLogs createMany
  ▼
输出：{ success: true, imported: { 各实体导入数量 } }
```

**特殊处理**:
- goals 必须携带嵌套的 `milestones` / `keyResults`：导出文件中二者是扁平数组（通过 `goalId` 关联），客户端在 POST 前已按 `goalId` 归巢到对应 goal 内。
- keyResults 同时接受 API 字段名（`target` / `current`）与前端导出字段名（`targetValue` / `currentValue`）。
- 各实体按当前登录用户写入（`userId` 取自 session），不做旧 id 重映射。

**响应**:
```json
{
  "success": true,
  "imported": {
    "epics": 0,
    "tasks": 0,
    "requirements": 0,
    "testCases": 0,
    "bugs": 0,
    "goals": 0,
    "auditLogs": 0
  }
}
```

**实现文件**: `app/api/import/route.ts`

---

## 客户端 Service 层

API 调用统一封装在 `app/dashboard/services/api.ts`：

| 函数 | 对应 API | 说明 |
|------|----------|------|
| `fetchTasks` | `GET /api/tasks` | 获取任务列表 |
| `createTaskApi` | `POST /api/tasks` | 创建任务 |
| `updateTaskApi` | `PUT /api/tasks/:id` | 更新任务 |
| `deleteTaskApi` | `DELETE /api/tasks/:id` | 删除任务 |
| `fetchRequirements` | `GET /api/requirements` | 获取需求列表 |
| `createRequirementApi` | `POST /api/requirements` | 创建需求 |
| `updateRequirementApi` | `PUT /api/requirements/:id` | 更新需求 |
| `deleteRequirementApi` | `DELETE /api/requirements/:id` | 删除需求 |
| `fetchTestCases` | `GET /api/test-cases` | 获取测试用例 |
| `createTestCaseApi` | `POST /api/test-cases` | 创建测试用例 |
| `updateTestCaseApi` | `PUT /api/test-cases/:id` | 更新测试用例 |
| `deleteTestCaseApi` | `DELETE /api/test-cases/:id` | 删除测试用例 |
| `fetchBugs` | `GET /api/bugs` | 获取 Bug |
| `createBugApi` | `POST /api/bugs` | 创建 Bug |
| `updateBugApi` | `PUT /api/bugs/:id` | 更新 Bug |
| `deleteBugApi` | `DELETE /api/bugs/:id` | 删除 Bug |
| `fetchGoals` | `GET /api/goals` | 获取目标 |
| `createGoalApi` | `POST /api/goals` | 创建目标 |
| `updateGoalApi` | `PUT /api/goals/:id` | 更新目标 |
| `deleteGoalApi` | `DELETE /api/goals/:id` | 删除目标 |
| `createMilestoneApi` | `POST /api/goals/milestones` | 创建里程碑 |
| `updateMilestoneApi` | `PUT /api/goals/milestones/:id` | 更新里程碑 |
| `deleteMilestoneApi` | `DELETE /api/goals/milestones/:id` | 删除里程碑 |
| `createKeyResultApi` | `POST /api/goals/key-results` | 创建关键结果 |
| `updateKeyResultApi` | `PUT /api/goals/key-results/:id` | 更新关键结果 |
| `deleteKeyResultApi` | `DELETE /api/goals/key-results/:id` | 删除关键结果 |
| `fetchComments` | `GET /api/comments?taskId=...` | 获取评论 |
| `createCommentApi` | `POST /api/comments` | 创建评论 |
| `deleteCommentApi` | `DELETE /api/comments/:id` | 删除评论 |
| `fetchAuditLogs` | `GET /api/audit-logs` | 获取审计日志 |
| `createAuditLogApi` | `POST /api/audit-logs` | 创建审计日志 |
| `fetchEpics` | `GET /api/epics` | 获取 Epic |
| `createEpicApi` | `POST /api/epics` | 创建 Epic |
| `updateEpicApi` | `PUT /api/epics/:id` | 更新 Epic |
| `deleteEpicApi` | `DELETE /api/epics/:id` | 删除 Epic |
| `importDataApi` | `POST /api/import` | 批量导入数据 |

所有 Service 函数都包含 `parseXxx` / `serializeXxx` 转换器，用于适配 Prisma 返回字段与前端类型字段的差异。

### fetchJson 通用流程

```
输入：url, init
  │
  ▼
[1] fetch(url, { headers: { 'Content-Type': 'application/json', ... } })
  ▼
[2] 读取 response.text()
  ▼
[3] 尝试 JSON.parse
  ▼
[4] 如果 response.ok === false → 抛出 ApiError(status, message, data)
  ▼
[5] 返回 data
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
