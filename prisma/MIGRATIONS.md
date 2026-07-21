# 数据库迁移说明

## 环境

- 数据库：SQLite (`prisma/dev.db`)
- ORM：Prisma 5.x
- 连接字符串：`DATABASE_URL="file:./dev.db"`（位于 `.env`）

## 已有迁移

| 迁移文件 | 说明 |
|----------|------|
| `20260720042909_init` | 初始化所有业务表（User、Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult、Comment、AuditLog、Epic） |
| `20260720043235_rename_password_to_hash` | 将 User.password 重命名为 passwordHash |
| `20260720043436_add_role_string` | 添加 User.role 字符串字段 |

## 常用命令

```bash
# 应用开发迁移
npm run db:migrate

# 重置数据库并重新应用迁移（会清空数据）
npm run db:reset

# 填充演示数据
npm run db:seed

# 打开可视化数据浏览器
npm run db:studio
```

## 种子数据

种子脚本位于 `prisma/seed.ts`，会创建一个演示账号：

- 邮箱：`demo@example.com`
- 密码：`demo123`
- 角色：`USER`

并填充 Epic、Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult、Comment 等示例数据。

## 生产切换

将 `.env` 中的 `DATABASE_URL` 替换为 PostgreSQL 连接字符串，例如：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/demo01"
```

然后运行：

```bash
npx prisma migrate deploy
```

无需改动应用代码。
