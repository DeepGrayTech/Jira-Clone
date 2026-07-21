# 部署说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 环境要求

- Node.js 18+
- npm 9+ 或 pnpm / yarn
- Windows / macOS / Linux

---

## 本地开发部署

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 应用数据库迁移（首次）
npx prisma migrate dev

# 初始化 seed 数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问：
- 应用：`http://localhost:3000`
- Prisma Studio：`http://localhost:5555`

默认账号（由 `prisma/seed.ts` 幂等创建）：
- 管理员：`admin@example.com` / `admin123`（role: ADMIN）
- 演示用户：`demo@example.com` / `demo123`（role: USER）

---

## 生产构建部署

```bash
# 设置环境变量
# .env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-strong-secret
NEXTAUTH_URL=https://your-domain.com

# 安装依赖
npm install --production

# 生成 Prisma Client
npx prisma generate

# 应用迁移
npx prisma migrate deploy

# 构建
npm run build

# 启动生产服务
npm start
```

---

## 环境变量说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | SQLite 数据库路径，如 `file:./dev.db` |
| `NEXTAUTH_SECRET` | ✅ | NextAuth 加密密钥，生产环境必须为强随机字符串 |
| `NEXTAUTH_URL` | 推荐 | 应用部署后的公网地址 |
| `PORT` | 可选 | 服务端口，默认 3000 |

---

## 部署平台建议

### Vercel

- 直接导入 Git 仓库即可自动部署。
- 注意：Vercel 的 Serverless 函数不持久化 SQLite，需要迁移到 PostgreSQL 或使用外部存储。

### 自托管服务器

- 适合使用 SQLite 部署。
- 确保数据库文件持久化保存，不被构建覆盖。

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 部署注意事项

1. **数据库迁移**：生产环境使用 `npx prisma migrate deploy`，不要用 `migrate dev`。
2. **NEXTAUTH_SECRET**：生产环境必须设置强随机字符串，每次部署保持一致。
3. **SQLite 限制**：多实例部署时 SQLite 无法并发写入，建议使用 PostgreSQL。
4. **.env 文件**：不要提交到版本控制，生产环境通过平台环境变量注入。
5. **构建缓存**：如果登录或静态资源异常，可清理 `.next` 目录后重新构建。

---

## 健康检查

部署后检查以下端点：

| 端点 | 期望状态 |
|------|----------|
| `/` | 200 |
| `/api/auth/session` | 200 |
| `/dashboard` | 200 或 302（未登录时） |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
