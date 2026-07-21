# 应用级 Provider 与 Layout 说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. providers.tsx

**文件**: `app/providers.tsx`

**职责**: 提供全局 React Context Provider。

### AuthProvider

包裹 `next-auth/react` 的 `SessionProvider`，为整个应用提供 NextAuth 会话上下文。

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 使用位置

在 `app/layout.tsx` 的 RootLayout 中包裹 `{children}`。

---

## 2. layout.tsx

**文件**: `app/layout.tsx`

**职责**: 应用根布局，设置全局元数据、引入全局样式、挂载认证 Provider。

### 元数据

```tsx
export const metadata: Metadata = {
  title: "Jira Clone - 任务管理系统",
  description: "现代化的任务管理系统",
};
```

### 结构

- `html lang="zh-CN"`
- `body` 内包含：
  - 无障碍跳过导航链接：`Skip to main content`
  - `AuthProvider` 包裹所有子内容

### 无障碍

`skip-nav` 链接允许键盘用户直接跳转到主内容，符合 WCAG 2.1 AA 可访问性要求。

---

## 3. page.tsx

**文件**: `app/page.tsx`

**职责**: 应用首页（`/`），显示欢迎信息并提供跳转到 Dashboard 的入口。

### 内容

- 标题：Jira Clone - Task Manager
- 描述：Project is running!
- 按钮：Go to Dashboard → `/dashboard`

---

## 4. dashboard/page.tsx

**文件**: `app/dashboard/page.tsx`

**职责**: Dashboard 页面入口，使用 `Suspense` 包裹 `DashboardLayout`。

```tsx
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout />
    </Suspense>
  );
}
```

---

## Provider 层级

```
RootLayout
└── AuthProvider (SessionProvider)
    └── page.tsx / dashboard/page.tsx
        └── DashboardLayout
            └── Context Providers
                └── DashboardShell
                    └── Views
```

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
