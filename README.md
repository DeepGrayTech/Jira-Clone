# Jira Clone - 任务管理系统

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

AI 驱动的项目管理工具，提供完整的软件开发生命周期管理：任务看板、需求管理、测试用例、Bug 跟踪、目标管理、Epic 管理和智能体工作流可视化。

---

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js (App Router) | 14.2.4 | 客户端渲染模式 |
| UI 库 | React | 18.x | 函数组件 + Hooks |
| 语言 | TypeScript | 5.x | 全项目类型安全 |
| 样式 | Tailwind CSS + Inline Styles | 3.4.1 | 响应式布局 |
| 认证 | NextAuth.js Credentials Provider + JWT | 4.24.14 | 数据库认证 |
| ORM | Prisma | 5.22.0 | 类型安全的数据库访问 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | - | 通过 `DATABASE_URL` 切换 |
| 拖拽 | @hello-pangea/dnd | 18.0.1 | 看板拖拽 |
| 可视化 | @xyflow/react (React Flow) | 12.11.2 | 智能体工作流图 |
| 测试 | Jest + React Testing Library | 30.x | 单元测试 |
| 密码哈希 | bcryptjs | 3.0.3 | 安全密码存储 |

---

## 目录结构

```
demo01/
├── app/
│   ├── api/                          # Next.js API Routes
│   ├── dashboard/
│   │   ├── components/               # UI 组件
│   │   ├── contexts/                 # React Context 状态管理
│   │   ├── data/                     # Mock 默认数据
│   │   ├── hooks/                    # 自定义 Hooks
│   │   ├── services/                 # 业务服务层
│   │   ├── views/                    # 页面视图组件
│   │   ├── constants.ts              # 常量定义
│   │   ├── page.tsx                  # Dashboard 入口
│   │   └── types.ts                  # 类型定义
│   ├── layout.tsx                    # 根布局（含 AuthProvider）
│   ├── page.tsx                      # 首页（重定向到 dashboard）
│   └── providers.tsx                 # NextAuth SessionProvider 包装
├── lib/                                # 通用工具库
├── prisma/                             # Prisma schema / seed / migrations
├── scripts/                            # 调试/数据迁移脚本
├── __tests__/                          # Jest 测试
├── docs/                               # 项目文档
├── CHANGE_LOG.md                       # 变更归档
├── CODE_STYLE.md                       # 代码风格
├── DESIGN_SPEC.md                      # 设计规格
├── WORKFLOW_RULES.md                   # 工作流规则
└── TEST_COMPLIANCE_REPORT.md           # 测试合规报告
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已包含 `.env`（开发环境）：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

生产环境请替换 `NEXTAUTH_SECRET` 为强随机字符串，并将 `DATABASE_URL` 改为 PostgreSQL 连接串。

### 3. 初始化数据库

```bash
npm run db:migrate
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`。

### 5. 默认账号

| 邮箱 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `demo@example.com` | `demo123` | USER | 含 seed 演示数据 |
| `admin@example.com` | `admin123` | ADMIN | 数据库为空时首次登录自动生成 |

---

## 常用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run test` | 运行 Jest 测试 |
| `npm run test:watch` | watch 模式运行测试 |
| `npm run lint` | ESLint 检查 |
| `npm run db:migrate` | 执行 Prisma 迁移 |
| `npm run db:seed` | 写入 seed 数据 |
| `npm run db:reset` | 重置数据库 |
| `npm run db:studio` | 启动 Prisma Studio |

---

## 功能模块

| 模块 | 入口 | 说明 |
|------|------|------|
| Tasks（任务看板） | `views/TasksView.tsx` | 拖拽三列看板，支持搜索、筛选、标签、评论 |
| Requirements（需求） | `views/RequirementsView.tsx` | 需求生命周期管理，可关联任务和测试用例 |
| Testing（测试） | `views/TestingView.tsx` | 测试用例管理，关联需求 |
| Bugs（Bug 跟踪） | `views/BugsView.tsx` | 7 步 Bug 生命周期，含验证人角色 |
| Goals（目标） | `views/GoalsView.tsx` | OKR/SMART 目标，里程碑和关键结果 |
| Epic（项目集） | `components/EpicSelector.tsx` | 项目集分类，级联删除/编辑 |
| Workflow（智能体工作流） | `components/AgentWorkflow.tsx` | React Flow 可视化 9 个 AI 智能体协作流程 |
| Audit（审计） | `views/AuditView.tsx` | 操作日志 |
| Notifications（通知） | `views/NotificationsView.tsx` | 通知中心 |

---

## 架构概览

- **数据层**: Prisma + SQLite，按 `userId` 隔离数据。
- **API 层**: Next.js App Router API Routes，读取 NextAuth session 鉴权。
- **状态层**: React Context（TaskContext、RequirementContext、BugContext、GoalContext、EpicContext、TestCaseContext、AuditContext、SharedContext）。
- **服务层**: `app/dashboard/services/*` 封装 API 调用和 Epic 业务逻辑。
- **视图层**: `app/dashboard/views/*` 展示各模块界面。
- **认证层**: NextAuth CredentialsProvider + JWT，数据库存储 bcrypt 密码哈希。
- **离线回退**: 初始数据加载优先从 API 读取，失败时回退到 localStorage；写操作成功后同步写入 localStorage。

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [DESIGN_SPEC.md](DESIGN_SPEC.md) | 设计规格文档 |
| [CODE_STYLE.md](CODE_STYLE.md) | 代码风格指南 |
| [WORKFLOW_RULES.md](WORKFLOW_RULES.md) | Superpowers 七步工作流规则 |
| [TEST_COMPLIANCE_REPORT.md](TEST_COMPLIANCE_REPORT.md) | 测试合规报告 |
| [CHANGE_LOG.md](CHANGE_LOG.md) | 变更归档记录 |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | 技术文档（老版本，待更新） |
| [docs/backend-migration-plan.md](docs/backend-migration-plan.md) | 后端迁移方案 |
| [docs/architecture.md](docs/architecture.md) | 系统架构与数据流 |
| [docs/api.md](docs/api.md) | API 路由说明 |
| [docs/contexts.md](docs/contexts.md) | Context 状态管理说明 |
| [docs/hooks.md](docs/hooks.md) | 自定义 Hooks 说明 |
| [docs/services.md](docs/services.md) | 服务层说明 |
| [docs/views-and-components.md](docs/views-and-components.md) | 视图与组件说明 |
| [docs/lib.md](docs/lib.md) | 工具库说明 |
| [docs/scripts.md](docs/scripts.md) | 脚本说明 |
| [docs/database.md](docs/database.md) | 数据库模型说明 |

---

## 维护者

*文档管理员*
