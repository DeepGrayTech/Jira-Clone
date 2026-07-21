# Prisma 与数据库客户端说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 文件位置

- `lib/prisma.ts`：Prisma Client 单例导出
- `prisma/schema.prisma`：数据模型定义
- `prisma/seed.ts`：初始数据 seed 脚本
- `prisma/dev.db`：本地 SQLite 数据库文件

---

## 2. Prisma Client 工作原理

```
输入：模块导入 prisma
  │
  ▼
[检查全局缓存]
  │
  ├─ 生产环境：每次新建 PrismaClient
  │
  └─ 开发环境：复用 global.prisma 实例，避免热重载时创建多个连接
  │
  ▼
输出：单例 PrismaClient 实例
```

**关键代码**:

```ts
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### 输入

- 任何需要访问数据库的模块通过 `import { prisma } from "@/lib/prisma"` 导入。

### 过程

- 首次导入时创建 `PrismaClient`。
- 开发环境下将实例挂载到 `global` 对象，避免 Next.js 热重载导致连接池耗尽。
- 生产环境每次新建实例，不依赖全局缓存。

### 输出

- 一个单例 Prisma Client，可执行 `findMany`、`create`、`update`、`delete`、`$transaction` 等操作。

---

## 3. 数据模型总览

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| `User` | 用户 | id, username, email, passwordHash, role |
| `Account` | NextAuth 账号关联 | userId, type, provider, providerAccountId |
| `Session` | NextAuth Session | userId, sessionToken, expires |
| `VerificationToken` | 验证令牌 | identifier, token, expires |
| `Epic` | Epic | userId, title, description, color |
| `Task` | 任务 | userId, epicId, status, priority, dueDate, tags(JSON) |
| `Requirement` | 需求 | userId, epicId, status, priority, acceptanceCriteria(JSON) |
| `Bug` | Bug | userId, severity, priority, stepsToReproduce(JSON) |
| `TestCase` | 测试用例 | userId, steps(JSON), expectedResult, status |
| `Goal` | 目标 | userId, status, type, startDate, endDate |
| `Milestone` | 里程碑 | goalId, dueDate, status |
| `KeyResult` | 关键结果 | goalId, target, current, status |
| `Comment` | 评论 | userId, taskId, content |
| `AuditLog` | 审计日志 | userId, action, entityType, entityId, details, username |

### 关系说明

```
User
  ├── Epic[] (1:N)
  ├── Task[] (1:N)
  ├── Requirement[] (1:N)
  ├── Bug[] (1:N)
  ├── TestCase[] (1:N)
  ├── Goal[] (1:N)
  ├── Comment[] (1:N)
  └── AuditLog[] (1:N)

Epic
  ├── Task[] (1:N, onDelete: Cascade)
  └── Requirement[] (1:N, onDelete: Cascade)

Goal
  ├── Milestone[] (1:N)
  └── KeyResult[] (1:N)

Task
  └── Comment[] (1:N)
```

---

## 4. 常用命令

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 变更到数据库
npx prisma db push

# 重置数据库并运行 seed
npx prisma migrate reset

# 打开 Prisma Studio
npx prisma studio

# 运行迁移
npx prisma migrate dev --name [name]
```

---

## 5. 注意事项

- 所有业务查询必须通过 `where: { userId }` 实现用户隔离。
- 数组字段在 SQLite 中存储为 JSON 字符串，API 层通过 `lib/api-mappers.ts` 转换。
- 生产环境建议迁移到 PostgreSQL，以支持并发写入和更复杂查询。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
