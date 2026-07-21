# 测试文件详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`__tests__/` 目录包含大量测试文件，覆盖认证、Context、Service、Hooks、组件、工具库等。截至 2026-07-21，`npx jest` 共 40 个测试套件、957 个测试全部通过，`npx tsc --noEmit` 无类型错误。此前未适配 NextAuth + Provider 结构而失败的 UI/认证套件已全部修复（统一 mock `next-auth/react` 与 `app/dashboard/services/api`）。

---

## 2. 测试文件清单

### 认证相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `auth.test.ts` | auth.ts 工具函数测试 | 🗑️ 已删除（localStorage 认证已移除） |
| `login-form.test.tsx` | LoginForm 组件测试 | ✅ 通过（已 mock next-auth/react） |
| `admin-preservation.test.tsx` | Admin 数据保留测试 | 🗑️ 已删除（localStorage 认证已移除） |

### Context 相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `task-context.test.tsx` | TaskContext 测试 | ✅ 通过 |
| `requirement-context.test.tsx` | RequirementContext 测试 | ✅ 通过 |
| `bug-context.test.tsx` | BugContext 测试 | ✅ 通过 |
| `testcase-context.test.tsx` | TestCaseContext 测试 | ✅ 通过 |
| `goal-context.test.tsx` | GoalContext 测试 | ✅ 通过 |
| `shared-context.test.tsx` | SharedContext 测试 | ✅ 通过 |
| `notification-context.test.tsx` | NotificationContext 测试 | ✅ 通过 |
| `contexts-index.test.ts` | contexts/index 导出测试 | ✅ 通过 |

### Service 相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `task-service.test.ts` | TaskService 测试 | ✅ 通过 |
| `requirement-service.test.ts` | RequirementService 测试 | ✅ 通过 |
| `test-case-service.test.ts` | TestCaseService 测试 | ✅ 通过 |
| `validation-service.test.ts` | ValidationService 测试 | ✅ 通过 |

### Hooks 相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `useAuth.test.ts` | useAuth 测试 | ✅ 通过（已 mock next-auth/react） |
| `useDataLoader.test.ts` | useDataLoader 测试 | ✅ 通过 |
| `usePersistence.test.ts` | usePersistence 测试 | ✅ 通过 |
| `useDashboardLogic.test.tsx` | useDashboardLogic 测试 | ✅ 通过 |
| `useValidation.test.ts` | useValidation 测试 | ✅ 通过 |

### 工具库相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `encryption.test.ts` | encryption.ts 测试 | ✅ 通过 |
| `encoding.test.ts` | encoding.ts 测试 | ✅ 通过 |
| `privacy.test.ts` | privacy.ts 测试 | ✅ 通过 |

### 组件相关

| 文件 | 说明 | 状态 |
|------|------|------|
| `components.test.tsx` | 通用组件测试 | ✅ 通过 |
| `dashboard-layout.test.tsx` | DashboardLayout 测试 | ✅ 通过 |
| `dashboard-navigation.test.tsx` | DashboardNavigation 测试 | ✅ 通过 |
| `dashboard.test.tsx` | Dashboard 测试 | ✅ 通过 |
| `modal.test.tsx` | Modal 测试 | ✅ 通过 |
| `notification-center.test.tsx` | NotificationCenter 测试 | ✅ 通过 |
| `notification-settings.test.tsx` | NotificationSettingsPanel 测试 | ✅ 通过 |
| `notification-system.test.tsx` | 通知系统测试 | ✅ 通过 |
| `notifications-view.test.tsx` | NotificationsView 测试 | ✅ 通过 |
| `requirement-card.test.tsx` | RequirementCard 测试 | ✅ 通过 |
| `bug-tracker.test.tsx` | BugTracker 测试 | ✅ 通过 |
| `goal-tracker.test.tsx` | GoalTracker 测试 | ✅ 通过 |
| `tasks-view.test.tsx` | TasksView 测试 | ✅ 通过 |
| `test-case-card.test.tsx` | TestCaseCard 测试 | ✅ 通过 |

### 其他

| 文件 | 说明 | 状态 |
|------|------|------|
| `additional.test.tsx` | 附加测试 | ✅ 通过 |
| `api-validation.test.ts` | API 校验测试 | ✅ 通过 |
| `epic-filter.test.ts` | Epic 过滤助手函数测试（matchesEpicFilter / epicIdForCreate，5 用例） | ✅ 通过 |
| `use-window.test.ts` | useWindow 测试 | 不存在（已确认） |

---

## 3. 历史失败根因与修复（已解决，2026-07-21）

### 主要原因

1. **NextAuth 未 mock**: 很多组件使用 `useSession` 或 `signIn`，需要包裹 `SessionProvider` 或 mock。
2. **Context Provider 缺失**: 很多组件依赖多个 Context，测试时未提供完整 Provider 树。
3. **API 未 mock**: Context 测试需要 mock `../services/api` 中的 HTTP 调用。
4. **localStorage 依赖**: 部分测试需要 `localStorage` mock。

### 已实施的修复

1. UI/认证相关套件统一 `jest.mock("next-auth/react")`（`useSession` / `signIn` / `signOut`，`SessionProvider` 透传）。
2. Context 与组件测试统一 `jest.mock("../app/dashboard/services/api")` mock HTTP 调用。
3. 为组件测试补充完整 Provider 包裹。
4. 修复 22 个测试文件中的 TypeScript 类型错误（仅修改测试文件），`npx tsc --noEmit` 现已通过。
5. 删除 2 个过期认证套件（`auth.test.ts`、`admin-preservation.test.tsx`），其测试对象 localStorage 认证已随 `lib/auth.ts` 重构移除。

---

## 4. 测试命令

```bash
# 运行所有测试
npm test

# 运行单个测试文件
npx jest __tests__/task-context.test.tsx

# 查看覆盖率
npx jest --coverage

# 生成 P0 覆盖率报告
node scripts/get-p0-coverage.js

# 生成完整覆盖率报告
node scripts/generate-full-coverage-report.js
```

---

## 5. 测试环境配置

- `jest.config.js`: jsdom 环境，模块路径别名 `@/*` 映射到项目根目录。
- `jest.config.ts`: 备用配置（当前未生效）。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
