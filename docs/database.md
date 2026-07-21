# 数据库详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

项目使用 Prisma + SQLite 作为后端数据库。Schema 位于 `prisma/schema.prisma`，默认数据通过 `prisma/seed.ts` 生成。

---

## 2. 数据模型

### 2.1 User

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id @default(cuid()) | 用户唯一标识 |
| email | String @unique | 邮箱，唯一 |
| username | String? | 用户名 |
| passwordHash | String | bcrypt 哈希密码 |
| role | String @default("USER") | 角色：USER/ADMIN |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### 2.2 Epic

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | Epic 唯一标识 |
| title | String | 标题 |
| description | String? | 描述 |
| color | String | 颜色 |
| userId | String | 所属用户 |
| tasks | Task[] | 关联任务 |
| requirements | Requirement[] | 关联需求 |

### 2.3 Task

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 任务 ID |
| title | String | 标题 |
| description | String? | 描述 |
| status | String | 状态：TODO/IN_PROGRESS/DONE |
| priority | String | 优先级 |
| dueDate | String? | 截止日期 |
| tags | String | JSON 数组字符串 |
| assignee | String? | 负责人 |
| relatedRequirementId | String? | 关联需求 ID |
| figmaUrl | String? | Figma 链接 |
| epicId | String? | 所属 Epic |
| userId | String | 所属用户 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |
| comments | Comment[] | 关联评论 |

### 2.4 Requirement

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 需求 ID |
| title | String | 标题 |
| description | String? | 描述 |
| status | String | 状态 |
| priority | String | 优先级 |
| dueDate | String? | 截止日期 |
| acceptanceCriteria | String | JSON 数组字符串 |
| requester | String? | 提出人 |
| executor | String? | 执行人 |
| epicId | String? | 所属 Epic |
| userId | String | 所属用户 |

### 2.5 TestCase

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 测试用例 ID |
| title | String | 标题 |
| description | String? | 描述 |
| status | String | 状态 |
| steps | String | JSON 数组字符串 |
| expectedResult | String? | 预期结果 |
| relatedRequirementId | String? | 关联需求 |
| epicId | String? | 所属 Epic（v1.4.0 新增，迁移 `add_testcase_epicid`） |
| userId | String | 所属用户 |

### 2.6 Bug

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | Bug ID |
| title | String | 标题 |
| description | String? | 描述 |
| severity | String | 严重程度 |
| priority | String | 优先级 |
| status | String @default("REPORTED") | 状态（REPORTED/ASSIGNED/IN_PROGRESS/RESOLVED/VERIFIED/CLOSED/REOPENED） |
| stepsToReproduce | String | JSON 数组字符串 |
| expectedBehavior | String? | 预期行为 |
| actualBehavior | String? | 实际行为 |
| reporter | String? | 报告人 |
| assignee | String? | 指派给 |
| verifier | String? | 验证人 |
| relatedTaskId | String? | 关联任务 ID |
| relatedRequirementId | String? | 关联需求 ID |
| resolution | String? | 解决方案 |
| resolvedAt | String? | 解决时间（ISO 字符串） |
| verifiedAt | String? | 验证时间（ISO 字符串） |
| comments | String @default("[]") | 评论（JSON 数组字符串） |
| attachments | String @default("[]") | 附件 URL（JSON 数组字符串） |
| epicId | String? | 关联 Epic ID |
| userId | String | 所属用户 |

### 2.7 Goal

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 目标 ID |
| title | String | 标题 |
| description | String? | 描述 |
| status | String | 状态 |
| userId | String | 所属用户 |
| milestones | Milestone[] | 关联里程碑 |
| keyResults | KeyResult[] | 关联关键结果 |

### 2.8 Milestone

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 里程碑 ID |
| title | String | 标题 |
| dueDate | String? | 截止日期 |
| status | String | 状态 |
| goalId | String | 所属目标 |

### 2.9 KeyResult

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 关键结果 ID |
| title | String | 标题 |
| target | Float | 目标值 |
| current | Float | 当前值 |
| status | String | 状态 |
| goalId | String | 所属目标 |

### 2.10 Comment

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 评论 ID |
| content | String | 内容 |
| taskId | String | 所属任务 |
| author | String | 作者名 |
| userId | String | 所属用户 |
| createdAt | DateTime | 创建时间 |

### 2.11 AuditLog

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | 日志 ID |
| action | String | 动作 |
| entityType | String | 实体类型 |
| entityId | String | 实体 ID |
| details | String | 详情 |
| username | String | 用户名 |
| userId | String | 所属用户 |
| createdAt | DateTime | 创建时间 |

---

## 3. 关系图

```
User 1 ────────* Task
User 1 ────────* Requirement
User 1 ────────* TestCase
User 1 ────────* Bug
User 1 ────────* Goal
User 1 ────────* Comment
User 1 ────────* AuditLog
User 1 ────────* Epic

Epic 1 ────────* Task
Epic 1 ────────* Requirement

Goal 1 ────────* Milestone
Goal 1 ────────* KeyResult

Task 1 ────────* Comment
```

---

## 4. Seed 数据流程

**文件**: `prisma/seed.ts`

### 输入-过程-输出

```
输入：无（Prisma Client 自动连接）
  │
  ▼
[1] 检查 admin@example.com 是否已存在
  │  ├─ 存在 → 跳过
  │  └─ 不存在 → 创建 admin 用户（passwordHash = bcrypt("admin123")，role: ADMIN）
  │  （幂等，独立于 demo 用户的提前返回逻辑）
  ▼
[2] 检查 demo@example.com 是否已存在
  │  ├─ 存在 → 跳过 seed
  │  └─ 不存在 → 继续
  │
  ▼
[3] 创建 demo 用户（passwordHash = bcrypt("demo123")，role: USER）
  ▼
[4] 创建 Epic: "🚀 V1.0 产品发布"
  ▼
[5] 创建 Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult、Comment、AuditLog
  ▼
[6] 所有示例数据关联到 demo 用户
  │
  ▼
输出：数据库已初始化 admin 账号与示例数据
```

### 运行 Seed

```bash
npx prisma db seed
```

---

## 5. Prisma 命令

| 命令 | 说明 |
|------|------|
| `npx prisma generate` | 生成 Prisma Client |
| `npx prisma db push` | 推送 schema 到数据库 |
| `npx prisma db seed` | 运行 seed 脚本 |
| `npx prisma studio` | 打开数据库管理界面 |
| `npx prisma migrate dev` | 创建并应用迁移 |

---

## 6. 数据隔离

所有业务数据均通过 `userId` 关联到 User。API 路由中通过 `getServerSession` 获取当前用户，并过滤 `userId`。

```
输入：HTTP 请求 + session
  │
  ▼
getServerSession(req, res, authOptions)
  │
  ▼
获取 userId
  │
  ▼
所有 Prisma 查询带 where: { userId }
  │
  ▼
输出：仅当前用户的数据
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
