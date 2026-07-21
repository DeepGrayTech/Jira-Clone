# 前端迁移说明：从 localStorage 到后端 API

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 背景

早期版本的 Jira Clone 将所有业务数据存储在浏览器的 `localStorage` 中，并通过 `lib/encryption.ts` 进行 AES-GCM 加密。这种方式适合离线使用，但存在以下问题：

1. 数据无法跨设备同步。
2. 用户数据隔离依赖 localStorage 键，容易误删或串用。
3. 多标签页并发写入可能导致数据不一致。
4. 无法支持多用户和权限管理。

因此，项目从 v1.4.0 开始迁移到 Prisma + SQLite 后端，数据按 `userId` 隔离。

---

## 迁移架构

### 迁移前

```
浏览器 localStorage
├── jira-clone-tasks
├── jira-clone-requirements
├── jira-clone-test-cases
├── jira-clone-bugs
├── jira-clone-goals
├── jira-clone-milestones
├── jira-clone-key-results
├── jira-clone-comments
├── jira-clone-audit-logs
├── jira-clone-epics
└── jira-clone-operation-logs
```

### 迁移后

```
Next.js API Routes
├── /api/tasks
├── /api/requirements
├── /api/test-cases
├── /api/bugs
├── /api/goals
├── /api/goals/milestones
├── /api/goals/key-results
├── /api/comments
├── /api/epics
└── Prisma + SQLite (prisma/dev.db)
```

---

## 迁移策略

### 1. 数据持久化层切换

所有业务 Context 从直接读写 `localStorage` 改为：

1. 优先调用后端 API。
2. API 成功后再同步写入 `localStorage`（双写，用于离线回退）。
3. API 失败时回退到 `localStorage` 读取旧数据。

### 2. Context 实现模式更新

为避免连续调用状态更新读取陈旧闭包，所有 Context 引入：

- `useRef` 保存最新 state 引用。
- 函数式 `setState` 更新状态。

### 3. API Service 统一封装

`app/dashboard/services/api.ts` 封装所有 HTTP 调用：

- `fetch` 请求后端 API。
- 序列化/反序列化 JSON 数组字段。
- 统一错误处理。

### 4. 测试改造

原有测试直接读取 `localStorage` 验证结果，迁移后改为：

- `jest.mock("../app/dashboard/services/api")` mock API 调用。
- 使用 `await act(async () => ...)` 等待异步操作完成。
- 使用 `waitFor` 验证最终渲染结果。

---

## 迁移涉及的文件

### Context 文件

- `app/dashboard/contexts/EpicContext.tsx`
- `app/dashboard/contexts/TaskContext.tsx`
- `app/dashboard/contexts/RequirementContext.tsx`
- `app/dashboard/contexts/BugContext.tsx`
- `app/dashboard/contexts/TestCaseContext.tsx`
- `app/dashboard/contexts/GoalContext.tsx`
- `app/dashboard/contexts/AuditContext.tsx`
- `app/dashboard/contexts/SharedContext.tsx`
- `app/dashboard/contexts/NotificationContext.tsx`

### API 路由

- `app/api/tasks/*`
- `app/api/requirements/*`
- `app/api/test-cases/*`
- `app/api/bugs/*`
- `app/api/goals/*`
- `app/api/goals/milestones/*`
- `app/api/goals/key-results/*`
- `app/api/comments/*`
- `app/api/epics/*`
- `app/api/import/*`

### 数据加载器

- `app/dashboard/hooks/useDataLoader.ts`

### 测试文件

- `__tests__/task-context.test.tsx`
- `__tests__/bug-context.test.tsx`
- `__tests__/requirement-context.test.tsx`
- `__tests__/testcase-context.test.tsx`
- `__tests__/goal-context.test.tsx`
- `__tests__/shared-context.test.tsx`
- `app/dashboard/contexts/EpicContext.test.tsx`
- `__tests__/useDataLoader.test.ts`
- `app/dashboard/services/EpicService.test.ts`

### 脚本

- `scripts/check-users.ts`
- `scripts/check-password.ts`
- `scripts/count-db.ts`
- `scripts/import-localstorage.ts`（已创建但未使用）

---

## 数据迁移结果

### 2026-07-21 决策

- 用户决定**不恢复旧 localStorage 数据**，保持当前数据库状态。
- 当前浏览器 localStorage 中所有 `jira-clone-*` 业务键值均为空数组 `[]`，无实际旧数据。
- 数据库中 `demo@example.com` 用户已包含完整示例数据。

---

## 遗留的 localStorage 用途

虽然主要数据已迁移到后端，但 `localStorage` 仍保留以下用途：

1. **离线回退**：API 失败时，应用可从 localStorage 读取最近一次成功同步的数据。
2. **标签历史**：`jira-clone-tag-history` 仍用于前端标签输入建议。
3. **操作日志**：UI 操作日志在 `SharedContext` 中保留本地副本，限制最多 100 条。

---

## 迁移后的已知问题

1. ~~**旧测试套件失败**~~（已解决，2026-07-21）：6 个 UI/认证测试套件已适配 NextAuth Session 与 API mock，全部通过。
2. ~~**Admin 账号丢失**~~（已解决，2026-07-21）：`prisma/seed.ts` 现在会创建 `admin@example.com` / `admin123`（role: ADMIN），已写入开发库。
3. **多用户并发**：SQLite 在多实例部署下无法并发写入，生产环境需迁移到 PostgreSQL。

---

## 迁移命令参考

```bash
# 重置数据库并重新 seed
npx prisma migrate reset

# 查看数据库统计
npx tsx scripts/count-db.ts

# 查看用户列表
npx tsx scripts/check-users.ts

# 校验密码
npx tsx scripts/check-password.ts
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
