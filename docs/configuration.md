# 配置文件说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. next.config.mjs

**文件**: `next.config.mjs`

**当前配置**:

```js
const nextConfig = {
  reactStrictMode: true,
};
```

**说明**:
- 启用 React 严格模式。
- 当前无自定义路由、图片域名、rewrites 或 output 配置。
- 后续如需要导出静态站点、配置图片域名、设置 API 代理等，可在此扩展。

---

## 2. package.json

**文件**: `package.json`

### 项目信息

| 字段 | 值 |
|------|-----|
| `name` | jira-clone |
| `version` | 1.4.0 |
| `private` | true |

### 常用脚本

| 脚本 | 说明 |
|------|------|
| `dev` | 启动 Next.js 开发服务器 |
| `build` | 构建生产版本 |
| `start` | 启动生产服务器 |
| `lint` | 运行 ESLint |
| `test` | 运行 Jest 测试 |
| `test:watch` | 监听模式运行测试 |
| `db:migrate` | 执行 Prisma 迁移 |
| `db:seed` | 运行数据库 seed |
| `db:reset` | 重置数据库 |
| `db:studio` | 启动 Prisma Studio |

### 核心依赖

| 包 | 用途 |
|----|------|
| `next` | Next.js 框架 |
| `react` / `react-dom` | React 运行时 |
| `next-auth` | 认证 |
| `@prisma/client` / `prisma` | ORM 和数据库工具 |
| `bcryptjs` | 密码哈希 |
| `@hello-pangea/dnd` | 拖拽看板 |
| `@xyflow/react` | 流程图（保留依赖） |
| `lucide-react` | 图标 |

### 开发依赖

| 包 | 用途 |
|----|------|
| `typescript` | 类型系统 |
| `tailwindcss` / `postcss` | CSS 工具 |
| `eslint` / `eslint-config-next` | 代码检查 |
| `jest` / `jest-environment-jsdom` / `@testing-library/*` | 测试框架 |
| `tsx` | TypeScript 执行器 |

---

## 3. tsconfig.json

**文件**: `tsconfig.json`

### 关键配置

| 配置 | 值 | 说明 |
|------|-----|------|
| `strict` | `true` | 启用严格模式 |
| `noEmit` | `true` | 仅类型检查，不输出文件 |
| `jsx` | `preserve` | 保留 JSX 语法 |
| `moduleResolution` | `bundler` | 适配 Next.js 14 |
| `paths` | `@/*` → `./*` | 路径别名 |
| `include` | `**/*.ts`, `**/*.tsx` | 包含所有 TS/TSX 文件 |
| `exclude` | `node_modules` | 排除依赖目录 |

---

## 4. .env

**文件**: `.env`（不提交到 Git）

**必需环境变量**:

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:./dev.db` |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | 随机字符串 |
| `NEXTAUTH_URL` | NextAuth 服务地址 | `http://localhost:3000` |

**注意**: 生产环境必须使用强随机密钥。

---

## 5. tailwind.config.ts / postcss.config.js

**文件**: `tailwind.config.ts` / `postcss.config.js`

**说明**:
- Tailwind CSS 提供工具类样式。
- PostCSS 处理 CSS 转换。
- 具体主题色、断点、自定义插件配置在 `tailwind.config.ts` 中定义。

---

## 6. jest.config / jest.setup

**文件**: `jest.config.*` / `jest.setup.*`

**说明**:
- 使用 `jest-environment-jsdom` 提供浏览器 DOM 环境。
- `@testing-library/react` 用于组件测试。
- 测试文件分布：`__tests__/` 和 `*.test.tsx?` 文件。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
