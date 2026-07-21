# 系统架构与数据流

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 总体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              浏览器客户端                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Next.js 14 App Router                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │  Page / View │  │  Components  │  │  Custom Hooks            │  │    │
│  │  │  (views/)    │  │  (components/)│  │  (hooks/)               │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └───────────┬──────────────┘  │    │
│  │         │                 │                       │                 │    │
│  │         └────────┬────────┴───────────────┬──────┘                 │    │
│  │                  │                         │                         │    │
│  │  ┌───────────────▼────────┐  ┌───────────▼──────────┐             │    │
│  │  │  React Context           │  │  Services            │             │    │
│  │  │  (contexts/)            │  │  (services/)          │             │    │
│  │  │  跨组件状态共享          │  │  API 调用封装        │             │    │
│  │  └───────────────┬─────────┘  └───────────┬──────────┘             │    │
│  │                  │                         │                         │    │
│  │                  └─────────────┬───────────┘                         │    │
│  │                                │                                     │    │
│  │  ┌─────────────────────────────▼──────────────────────┐            │    │
│  │  │  NextAuth React (useSession / signIn / signOut)    │            │    │
│  │  └─────────────────────────────┬──────────────────────┘            │    │
│  └────────────────────────────────┼─────────────────────────────────────┘    │
│                                   │                                          │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │  localStorage (离线缓存/回退)    │                                     │   │
│  │  jira-clone-tasks, requirements, ...                                  │   │
│  └────────────────────────────────┼─────────────────────────────────────┘   │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   │ HTTP / Fetch
                                   │
┌──────────────────────────────────┼──────────────────────────────────────────┐
│                              服务端                                         │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                         Next.js API Routes                             │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐  │  │
│  │  │  tasks   │requirements│ test-cases│  bugs   │  goals  │  epics  │  │  │
│  │  │  bugs    │ comments │ audit-logs│  import │  auth   │ register│  │  │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘  │  │
│  │                              │                                        │  │
│  │                  ┌───────────▼──────────┐                           │  │
│  │                  │  NextAuth /api/auth/... │  读取 JWT Session      │  │
│  │                  │  Credentials Provider  │  验证 bcrypt 密码       │  │
│  │                  └───────────┬───────────┘                           │  │
│  │                              │                                        │  │
│  │                  ┌───────────▼──────────┐                           │  │
│  │                  │  Prisma Client        │                           │  │
│  │                  │  (lib/prisma.ts)      │                           │  │
│  │                  └───────────┬───────────┘                           │  │
│  │                              │                                        │  │
│  │                  ┌───────────▼──────────┐                           │  │
│  │                  │  SQLite (dev.db)      │                           │  │
│  │                  └────────────────────────┘                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 认证流程

### 2.1 登录

1. 用户输入邮箱/密码，点击 Login。
2. `LoginForm` 调用 `signIn("credentials", { email, password, redirect: false })`。
3. NextAuth 调用 `lib/auth-config.ts` 的 `authorize` 回调。
4. `authorize` 通过 Prisma 查询 `User` 表，使用 `bcryptjs.compare` 验证密码。
5. 验证成功后返回 `{ id, email, name, role }`。
6. NextAuth 签发 JWT，写入浏览器 cookie。
7. `LoginForm` 检测到 `result.ok`，调用 `onLoginSuccess()` 并刷新页面到 `/dashboard`。
8. `useAuth()` 通过 `useSession()` 读取 session，设置 `isAuthenticated` 和 `currentUser`。

### 2.2 注册

1. 用户在 `LoginForm` 切换到 Register。
2. 提交表单调用 `/api/auth/register`。
3. 服务端使用 `bcryptjs.hash` 生成密码哈希，创建 `User` 记录。
4. 注册成功后自动切换回登录页。

### 2.3 登出

1. 点击登出按钮调用 `useAuth.handleLogout()`。
2. 调用 `signOut({ callbackUrl: "/" })`。
3. NextAuth 清除 cookie，重定向到 `/`。

---

## 3. 数据加载流程

`useDataLoader` 负责初始化所有 Context 状态：

1. 组件挂载时，调用各实体 Service 的 `getAll` 方法（GET `/api/{entity}`）。
2. 如果 API 调用成功，用返回数据初始化所有 Context 的 state。
3. 如果 API 调用失败（网络错误、未认证等），回退到 `localStorage` 读取旧数据。
4. 初始化完成后设置 `isInitialized = true`。

```
DashboardShell 挂载
        │
        ▼
useDataLoader(useEffect)
        │
        ├─ 调用 services.task.getAll()      ──► GET /api/tasks
        ├─ 调用 services.requirement.getAll() ──► GET /api/requirements
        ├─ 调用 services.testCase.getAll()    ──► GET /api/test-cases
        ├─ 调用 services.bug.getAll()         ──► GET /api/bugs
        ├─ 调用 services.goal.getAll()        ──► GET /api/goals
        ├─ 调用 services.epic.getAll()        ──► GET /api/epics
        ├─ 调用 services.comment.getAll()     ──► GET /api/comments
        └─ 调用 services.auditLog.getAll()    ──► GET /api/audit-logs
        │
        ├─ 成功 ──► 用 API 数据初始化 Context state
        └─ 失败 ──► 从 localStorage 读取并初始化
        │
        ▼
   isInitialized = true
```

---

## 4. 数据保存流程

所有 CRUD 操作现在通过 API 优先：

1. Context 中的 `addXxx` / `updateXxx` / `deleteXxx` 函数调用 Service 层 API。
2. Service 发送 HTTP 请求到 `/api/{entity}`。
3. API Route 读取 NextAuth session，按 `userId` 操作数据库。
4. API 成功后，Context 更新 state 并同步写入 `localStorage`（离线缓存/双保险）。
5. 如果 API 失败，部分操作保留 localStorage 回退或抛出错误。

```
用户操作（新增/编辑/删除）
        │
        ▼
Context function (addTask / updateTask / deleteTask ...)
        │
        ▼
Service API call (POST / PUT / DELETE /api/tasks)
        │
        ▼
API Route handler
        │
        ├─ 读取 session
        ├─ 验证 userId
        ├─ Prisma CRUD
        └─ 返回 JSON
        │
        ▼
Context 更新 state
        │
        ▼
usePersistence 同步到 localStorage
```

---

## 5. Context 层级

```
SessionProvider (app/providers.tsx)
    │
    └── RootLayout
            │
            └── DashboardPage
                    │
                    └── DashboardLayout
                            │
                            ├── NotificationProvider
                            └── EpicProvider
                                    └── TaskProvider
                                            └── RequirementProvider
                                                    └── BugProvider
                                                            └── GoalProvider
                                                                    └── AuditProvider
                                                                            └── TestCaseProvider
                                                                                    └── SharedProvider
                                                                                            └── DashboardShell
```

---

## 6. 离线回退策略

- **读**: API 失败时使用 localStorage 数据。
- **写**: API 成功后更新 state，并写入 localStorage。
- **localStorage 键名**:
  - `jira-clone-tasks`
  - `jira-clone-requirements`
  - `jira-clone-test-cases`
  - `jira-clone-bugs`
  - `jira-clone-goals`
  - `jira-clone-epics`
  - `jira-clone-milestones`
  - `jira-clone-key-results`
  - `jira-clone-comments`
  - `jira-clone-audit-logs`
  - `jira-clone-tag-history`
  - `jira-clone-privacy-consent`

---

## 7. 多用户隔离

- 所有 API Route 通过 `getServerSession` 读取当前用户。
- 所有 Prisma 查询都包含 `where: { userId: session.user.id }`。
- 数据库层面通过外键约束 + `onDelete: Cascade` 保证用户数据一致性。

---

## 8. 关键设计决策

| 决策 | 说明 |
|------|------|
| API 优先 + localStorage 双写 | 保证数据持久化到服务端，同时保留离线可用性 |
| useRef + 函数式 setState | 解决 Context 中连续状态更新读取陈旧闭包的问题 |
| 独立 Context 拆分 | 每个实体独立 Context，避免单一 Context 过度重渲染 |
| Service 层封装 | 所有 API 调用集中在 `services/api.ts` 和 `services/EpicService.ts` |
| NextAuth CredentialsProvider | 轻量级认证，不需要外部 OAuth 提供商 |
| Prisma + SQLite | 开发成本低，生产可切换 PostgreSQL |

---

## 9. 已知限制与 TODO

- ~~`npx tsc --noEmit` 仍被部分测试文件类型错误阻塞~~（已解决，2026-07-21）：22 个测试文件的类型错误已全部修复，`npx tsc --noEmit` 退出码 0。
- ~~完整 `npm test` 仍有部分 pre-existing UI/认证测试失败~~（已解决，2026-07-21）：6 个 UI/认证套件已适配 NextAuth 与 API mock，`npx jest` 39 个套件 / 952 个测试全部通过。
- 通知/智能体模块仍主要依赖 localStorage，尚未完全迁移到数据库。
- ~~部分旧的 `lib/auth.ts` 本地认证逻辑仍可运行~~（已解决，2026-07-21）：旧 localStorage 认证已删除，`lib/auth.ts` 仅保留 `UserRole` 类型与 `logoutAndClear()`。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
