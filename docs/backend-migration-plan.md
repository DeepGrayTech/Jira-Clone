# 后端迁移方案：Next.js API + Prisma + SQLite

## 1. 目标

将当前纯前端 localStorage 数据存储迁移到 Next.js 后端 + Prisma ORM + SQLite，实现：

- 数据持久化到服务器端数据库，不再受浏览器 localStorage 限制。
- 多用户隔离（每个用户只能看到自己的数据）。
- 支持导出/导入既有 localStorage 数据到数据库。
- 保持前端 UI 和交互逻辑基本不变，逐步替换数据层。

## 2. 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| API | Next.js App Router API Routes + Server Actions | 与现有 Next.js 14 项目一致 |
| ORM | Prisma | 类型安全、迁移脚本、关系模型清晰 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | 开发成本低，生产可无缝切换 |
| 认证 | NextAuth.js Credentials Provider + JWT | 替换当前内存/ localStorage 登录状态 |
| 缓存/离线 | localStorage 可选降级 | 第一阶段保留 localStorage 作为缓存 |

## 3. 数据模型

基于当前类型定义 `app/dashboard/types` 设计 Prisma Schema：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks        Task[]
  requirements Requirement[]
  testCases    TestCase[]
  bugs         Bug[]
  goals        Goal[]
  comments     Comment[]
  auditLogs    AuditLog[]
  epics        Epic[]
}

model Epic {
  id          String  @id @default(cuid())
  title       String
  description String?
  color       String  @default("#3b82f6")
  userId      String
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks        Task[]
  requirements Requirement[]
}

model Task {
  id                   String   @id @default(cuid())
  title                String
  description          String?
  status               String
  priority             String
  dueDate              String?
  tags                 String   // JSON array
  assignee             String?
  relatedRequirementId String?
  figmaUrl             String?
  epicId               String?
  epic                 Epic?    @relation(fields: [epicId], references: [id])
  userId               String
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  comments Comment[]
}

model Requirement {
  id                 String   @id @default(cuid())
  title              String
  description        String?
  status             String
  priority           String
  dueDate            String?
  acceptanceCriteria String   // JSON array
  requester          String?
  executor           String?
  epicId             String?
  epic               Epic?    @relation(fields: [epicId], references: [id])
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model TestCase {
  id                 String  @id @default(cuid())
  title              String
  description        String?
  status             String
  steps              String  // JSON array
  expectedResult     String?
  relatedRequirementId String?
  userId             String
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Bug {
  id                String  @id @default(cuid())
  title             String
  description       String?
  severity          String
  priority          String
  stepsToReproduce  String  // JSON array
  expectedBehavior  String?
  actualBehavior    String?
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Goal {
  id        String   @id @default(cuid())
  title     String
  description String?
  status    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  milestones Milestone[]
  keyResults KeyResult[]
}

model Milestone {
  id        String   @id @default(cuid())
  title     String
  dueDate   String?
  status    String
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model KeyResult {
  id        String   @id @default(cuid())
  title     String
  target    Float
  current   Float    @default(0)
  status    String
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author    String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  entityType String
  entityId  String
  details   String
  username  String
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 4. 迁移阶段

### 阶段 1：搭建 Prisma + SQLite（基础设施）

- 安装依赖：`prisma`, `@prisma/client`, `next-auth`, `bcryptjs`。
- 创建 `prisma/schema.prisma` 和 `.env` 配置 `DATABASE_URL`。
- 运行 `npx prisma migrate dev --name init` 初始化数据库。
- 创建 `lib/prisma.ts` 单例导出 PrismaClient。

### 阶段 2：创建 API Routes 和 Server Actions

按实体创建 API 路由：

- `app/api/tasks/route.ts`（GET / POST / PUT / DELETE）
- `app/api/requirements/route.ts`
- `app/api/test-cases/route.ts`
- `app/api/bugs/route.ts`
- `app/api/goals/route.ts`
- `app/api/epics/route.ts`
- `app/api/comments/route.ts`
- `app/api/audit-logs/route.ts`
- `app/api/import/route.ts`（批量导入现有 JSON 数据）

认证使用 NextAuth.js Credentials provider，session 用 JWT。
所有 API 在 route handler 中读取 session，按 `userId` 过滤数据。

### 阶段 3：并行运行（双写双读）

- 前端 hooks 增加一层数据服务抽象 `lib/dataService.ts`。
- 数据服务优先调用 API；API 失败或离线时回退到 localStorage。
- 保存操作同时写入 API 和 localStorage，确保过渡期间数据不丢失。

### 阶段 4：前端切换

- 将 `useDataLoader` 改为从 API 加载数据，localStorage 仅作为离线缓存。
- 将 `usePersistence` 改为调用 API 保存，或移除（由 API 直接保存）。
- 将 `useDashboardLogic` 中的 CRUD 操作改为调用 Server Actions 或 API。

### 阶段 5：清理

- 移除 localStorage 持久化逻辑（保留导出/导入和离线缓存可选）。
- 删除 `useDataLoader`、`usePersistence` 中旧的 localStorage 主逻辑。
- 全面测试多用户隔离和权限。

## 5. 数据迁移

- 在登录后的设置页面增加"导入本地数据到数据库"按钮。
- 后端 `/api/import` 接收当前 localStorage 导出 JSON，按当前用户写入数据库。
- 导入前做数据校验（复用现有 `validateDataIntegrity`）。

## 6. 关键风险与对策

| 风险 | 对策 |
|------|------|
| 现有 localStorage 数据丢失 | 阶段 3-4 保留双写，导入前强制备份 |
| 测试文件大量依赖 localStorage mock | 新增 API mock，逐步替换 |
| 离线使用需求 | 保留 localStorage 作为缓存，网络恢复后同步 |
| 多用户数据隔离 | 所有 API 按 session userId 过滤，加外键约束 |
| 权限控制 | 复用现有 `hasPermission`，在后端再加一层校验 |

## 7. 下一步建议

1. 确认本方案是否满足需求（特别是数据库选型和认证方式）。
2. 如确认，先执行阶段 1：安装 Prisma 并初始化 schema。
3. 然后按实体逐个创建 API 路由，每个实体验证通过后再继续下一个。
