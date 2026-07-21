# 测试策略与现状说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 测试技术栈

| 工具 | 用途 |
|------|------|
| Jest | 测试框架 |
| jest-environment-jsdom | 浏览器 DOM 环境 |
| @testing-library/react | React 组件测试 |
| @testing-library/jest-dom | DOM 断言扩展 |
| @testing-library/user-event | 用户交互模拟 |
| tsx | 测试脚本和 seed 执行 |

---

## 测试配置

**文件**: `jest.config.js`

```js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
};

module.exports = createJestConfig(customJestConfig);
```

---

## 测试目录结构

```
__tests__/
├── bug-context.test.tsx
├── bug-tracker.test.tsx
├── dashboard.test.tsx
├── goal-context.test.tsx
├── login-form.test.tsx
├── requirement-context.test.tsx
├── shared-context.test.tsx
├── task-context.test.tsx
├── tasks-view.test.tsx
├── testcase-context.test.tsx
└── useDataLoader.test.ts

app/dashboard/contexts/
├── EpicContext.test.tsx
├── ...

app/dashboard/services/
├── EpicService.test.ts
└── ...
```

---

## 测试策略

### 1. Context 测试

- 所有业务 Context 都使用 `jest.mock("../app/dashboard/services/api")` 统一 mock API 调用。
- 使用 `waitFor` 和 `await act(async () => ...)` 处理异步操作。
- 每个 Context 测试验证：加载、新增、更新、删除、错误处理。

### 2. Hook 测试

- `useDataLoader` 验证数据加载顺序和日志输出。
- 使用 `renderHook` 和 `waitFor` 处理异步 hook。

### 3. 视图/组件测试

- 验证页面渲染、筛选、弹窗交互、表单提交。
- 需要包裹对应的 Provider（如 `EpicProvider`）。

### 4. Service 测试

- `EpicService.test.ts` 当前为占位测试，后续需要补充完整用例。

---

## 当前测试状态

截至 2026-07-21：

- **完整 `npx jest`**: 39 个测试套件、952 个测试全部通过 ✅
- **`npx tsc --noEmit`**: 退出码 0，无类型错误（此前 22 个测试文件的约 230 个类型错误已全部修复，仅修改测试文件）
- **已删除的过期套件**: `__tests__/auth.test.ts`、`__tests__/admin-preservation.test.tsx`（测试对象为已移除的 localStorage 认证）
- **UI/认证套件适配方式**: 此前失败的 6 个 UI/认证套件（dashboard、login-form、tasks-view、bug-tracker、useAuth、dashboard-layout 等）已统一 mock `next-auth/react`（`useSession` / `signIn` / `signOut` / `SessionProvider` 透传）与 `app/dashboard/services/api`，现全部通过。

---

## 常用测试命令

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 运行单个测试文件
npx jest __tests__/task-context.test.tsx

# 运行特定 describe/it
npx jest __tests__/tasks-view.test.tsx -t "should handle task with null related fields"
```

---

## 后续测试改进方向

1. ~~修复 7 个失败 UI/认证测试套件~~（已完成，2026-07-21：全部套件通过）。
2. 为 `EpicService` 编写完整测试，替换占位测试。
3. 为 API 路由添加集成测试。
4. 为 `useDashboardLogic` 和 `usePersistence` 添加 hook 测试。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
