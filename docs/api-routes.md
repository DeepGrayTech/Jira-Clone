# API 路由层详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

所有 API 路由位于 `app/api/**/*`，基于 Next.js App Router 的 Route Handlers 实现。每个路由遵循统一的认证 → 鉴权 → 处理 → 响应流程。

---

## 2. 通用处理流程

```
输入：HTTP Request
  │
  ▼
[1] 认证检查：getServerSession(authOptions)
  │   输出：session.user.id 或 401
  ▼
[2] 权限检查：验证资源是否属于当前用户 userId
  │   输出：通过 或 404
  ▼
[3] 解析请求体：request.json()
  │   输出：业务数据对象
  ▼
[4] 数据库操作：prisma.xxx.findMany/create/update/delete
  │   输出：数据库记录
  ▼
[5] 数据映射：mapXxx() 将 Prisma 格式转为前端格式
  │   输出：标准化 JSON
  ▼
输出：NextResponse.json(data, status)
```

---

## 3. 路由清单与工作原理

### 3.1 /api/tasks

**文件**: `app/api/tasks/route.ts` + `app/api/tasks/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/tasks` | session cookie | 查询当前用户所有 tasks | Task[] |
| POST | `/api/tasks` | Task 字段 JSON | 创建 task | Task 201 |
| GET | `/api/tasks/[id]` | id | 查询指定 task | Task |
| PUT | `/api/tasks/[id]` | id + 更新字段 | 更新 task | Task |
| DELETE | `/api/tasks/[id]` | id | 删除 task | `{success: true}` |

**特殊处理**:
- `tags` 在前端是 `string[]`，数据库中存储为 JSON 字符串，通过 `mapTask()` 转换。
- `comments` 通过 `include: { comments: true }` 级联查询。

---

### 3.2 /api/requirements

**文件**: `app/api/requirements/route.ts` + `app/api/requirements/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/requirements` | session | 查询 requirements | Requirement[] |
| POST | `/api/requirements` | Requirement JSON | 创建 requirement | Requirement 201 |
| GET | `/api/requirements/[id]` | id | 查询 requirement | Requirement |
| PUT | `/api/requirements/[id]` | id + 更新 | 更新 requirement | Requirement |
| DELETE | `/api/requirements/[id]` | id | 删除 requirement | `{success: true}` |

**特殊处理**:
- `acceptanceCriteria` 是 JSON 字符串数组，通过 `mapRequirement()` 转换。
- `status` 经过 `normalizeStatus` 处理，兼容旧别名如 `IN_REVIEW` → `REVIEW`。

---

### 3.3 /api/bugs

**文件**: `app/api/bugs/route.ts` + `app/api/bugs/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/bugs` | session | 查询 bugs | Bug[] |
| POST | `/api/bugs` | Bug JSON | 创建 bug | Bug 201 |
| PUT | `/api/bugs/[id]` | id + 更新 | 更新 bug | Bug |
| DELETE | `/api/bugs/[id]` | id | 删除 bug | `{success: true}` |

**特殊处理**:
- `stepsToReproduce`、`comments`、`attachments` 是 JSON 字符串数组，通过 `mapBug()` 转换。
- `status` 缺省时回退为 `REPORTED`；POST/PUT 均支持 status、reporter、assignee、verifier、关联 ID、resolution、resolvedAt/verifiedAt、epicId 等完整字段。

---

### 3.4 /api/test-cases

**文件**: `app/api/test-cases/route.ts` + `app/api/test-cases/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/test-cases` | session | 查询 test cases | TestCase[] |
| POST | `/api/test-cases` | TestCase JSON | 创建 test case | TestCase 201 |
| PUT | `/api/test-cases/[id]` | id + 更新 | 更新 test case | TestCase |
| DELETE | `/api/test-cases/[id]` | id | 删除 test case | `{success: true}` |

**特殊处理**:
- `steps` 是 JSON 字符串数组，通过 `mapTestCase()` 转换。
- `status` 兼容 `TODO` → `PENDING` 等旧别名。
- POST/PUT 接受 `epicId`（String?，`null` 表示无 Epic；自 v1.4.0 迁移 `add_testcase_epicid` 起支持）。

---

### 3.5 /api/goals

**文件**: `app/api/goals/route.ts` + `app/api/goals/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/goals` | session | 查询 goals | Goal[] |
| POST | `/api/goals` | Goal JSON | 创建 goal | Goal 201 |
| PUT | `/api/goals/[id]` | id + 更新 | 更新 goal | Goal |
| DELETE | `/api/goals/[id]` | id | 删除 goal | `{success: true}` |

**特殊处理**:
- Goal 查询包含 `milestones` 和 `keyResults` 关联数据。
- `status` 经过 `normalizeStatus` 处理，兼容旧别名。

---

### 3.6 /api/goals/milestones

**文件**: `app/api/goals/milestones/route.ts` + `app/api/goals/milestones/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/goals/milestones` | session | 查询 milestones | Milestone[] |
| POST | `/api/goals/milestones` | Milestone JSON | 创建 milestone | Milestone 201 |
| PUT | `/api/goals/milestones/[id]` | id + 更新 | 更新 milestone | Milestone |
| DELETE | `/api/goals/milestones/[id]` | id | 删除 milestone | `{success: true}` |

---

### 3.7 /api/goals/key-results

**文件**: `app/api/goals/key-results/route.ts` + `app/api/goals/key-results/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/goals/key-results` | session | 查询 key results | KeyResult[] |
| POST | `/api/goals/key-results` | KeyResult JSON | 创建 key result | KeyResult 201 |
| PUT | `/api/goals/key-results/[id]` | id + 更新 | 更新 key result | KeyResult |
| DELETE | `/api/goals/key-results/[id]` | id | 删除 key result | `{success: true}` |

---

### 3.8 /api/epics

**文件**: `app/api/epics/route.ts` + `app/api/epics/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/epics` | session | 查询 epics | Epic[] |
| POST | `/api/epics` | Epic JSON | 创建 epic | Epic 201 |
| GET | `/api/epics/[id]` | id | 查询 epic（含 tasks/requirements） | Epic |
| PUT | `/api/epics/[id]` | id + 更新 | 更新 epic | Epic |
| DELETE | `/api/epics/[id]` | id | 删除 epic（级联删除子记录） | `{success: true}` |

**特殊处理**:
- Prisma schema 中 Epic 关联 `tasks` 和 `requirements` 使用 `onDelete: Cascade`。
- 删除 Epic 会自动级联删除其下 tasks 和 requirements。

---

### 3.9 /api/comments

**文件**: `app/api/comments/route.ts` + `app/api/comments/[id]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/comments` | session | 查询 comments | Comment[] |
| POST | `/api/comments` | Comment JSON | 创建 comment | Comment 201 |
| DELETE | `/api/comments/[id]` | id | 删除 comment | `{success: true}` |

---

### 3.10 /api/audit-logs

**文件**: `app/api/audit-logs/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET | `/api/audit-logs` | session | 查询当前用户审计日志 | AuditLog[] |
| POST | `/api/audit-logs` | AuditLog JSON | 创建审计日志 | AuditLog 201 |

---

### 3.11 /api/import

**文件**: `app/api/import/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| POST | `/api/import` | 批量数据 JSON | 事务导入多种实体 | `{success, imported}` |

**处理流程**:
1. 认证用户。
2. 使用 `prisma.$transaction()` 原子导入。
3. 支持 `epics`、`tasks`、`requirements`、`testCases`、`bugs`、`goals`、`auditLogs`。
4. Goals 单独逐条创建以支持嵌套的 milestones/keyResults（导出文件中二者为扁平数组，客户端在 POST 前按 `goalId` 归巢到对应 goal 内）。
5. keyResults 同时接受两种字段命名：`target` / `current`（API 命名）或 `targetValue` / `currentValue`（前端导出名）。
6. 返回各实体导入数量。

---

### 3.12 /api/auth/[...nextauth]

**文件**: `app/api/auth/[...nextauth]/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth 请求 | 认证回调处理 | session/token |

**处理流程**:
1. 从 `lib/auth-config` 导入 `authOptions`。
2. 导出 `GET` 和 `POST` handlers 供 NextAuth 使用。

---

### 3.13 /api/auth/register

**文件**: `app/api/auth/register/route.ts`

| 方法 | 路由 | 输入 | 处理 | 输出 |
|------|------|------|------|------|
| POST | `/api/auth/register` | username, email, password, role | 校验、哈希、创建用户 | 新用户信息 201 |

**处理流程**:
1. 校验必填字段。
2. 校验邮箱格式。
3. 校验密码长度 ≥ 6。
4. 检查 email/username 是否已存在。
5. 使用 `bcryptjs.hash(password, 10)` 生成密码哈希。
6. 创建用户并返回基本信息。

---

## 4. 认证与权限统一流程

```
HTTP Request
  │
  ▼
getServerSession(authOptions)
  │
  ├─ 无 session ──→ 401 Unauthorized
  │
  ▼
校验 userId
  │
  ├─ 资源不属于当前用户 ──→ 404 Not Found
  │
  ▼
执行业务逻辑
  │
  ▼
NextResponse.json(data, status)
```

---

## 5. 数据映射层

所有 API 路由返回的数据都经过 `lib/api-mappers.ts` 映射：

| 映射函数 | 作用 |
|----------|------|
| `mapTask` | tags JSON 字符串 → string[]，日期格式化 |
| `mapRequirement` | acceptanceCriteria JSON 字符串 → string[]，status 归一化 |
| `mapTestCase` | steps JSON 字符串 → string[]，status 归一化 |
| `mapBug` | stepsToReproduce JSON 字符串 → string[]，日期格式化 |
| `mapGoal` | 嵌套 milestones/keyResults 映射，status 归一化 |
| `mapMilestone` | 日期格式化 |
| `mapKeyResult` | target/current 数值化，status 归一化 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
