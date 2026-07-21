# Hooks 详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 概述

`app/dashboard/hooks/` 包含 7 个自定义 React Hooks，封装认证、数据加载、业务逻辑、持久化、校验、视图模式、窗口响应等通用能力。

---

## 2. useAuth

**文件**: `app/dashboard/hooks/useAuth.ts`

**职责**: 封装 NextAuth session，暴露认证状态和当前用户信息。

### 输入-过程-输出

```
输入：NextAuth session (useSession)
  │
  ▼
useEffect 监听 session/status 变化
  │
  ├─ authenticated → 设置 isAuthenticated=true, currentUser={id, email, name, username, role}
  ├─ unauthenticated → 设置 isAuthenticated=false, currentUser=null
  └─ loading → 保持当前状态
  │
  ▼
输出：{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, handleLoginSuccess, handleLogout }
```

### 返回对象

| 字段 | 说明 |
|------|------|
| `isAuthenticated` | 是否已认证 |
| `currentUser` | 当前用户对象（含 id, email, name, username, role） |
| `handleLoginSuccess` | 空函数（NextAuth 自动刷新 session） |
| `handleLogout` | 调用 signOut({ callbackUrl: '/' }) |

---

## 3. useDataLoader

**文件**: `app/dashboard/hooks/useDataLoader.ts`

**职责**: 应用挂载时加载所有业务数据，优先从后端 API 加载，失败则回退到 localStorage，最后使用默认数据。

### 输入-过程-输出

```
输入：各业务实体的 setState 函数（setTasks, setRequirements, ...）
  │
  ▼
useLayoutEffect 触发 loadData
  │
  ├─ 尝试 loadFromApi
  │     ├─ Promise.all 并行获取 tasks/requirements/testCases/bugs/goals/epics/auditLogs
  │     ├─ 设置各状态
  │     ├─ 从 goals 提取 milestones/keyResults 并设置
  │     └─ 成功 → setIsInitialized(true)
  │
  └─ API 失败 → loadFromLocalStorage
        ├─ 读取 STORAGE_KEYS 各键
        ├─ 尝试 decryptData（兼容旧加密数据）
        ├─ 合并默认数据
        ├─ 设置各状态
        └─ setIsInitialized(true)
  │
  ▼
输出：状态已初始化，UI 可渲染
```

### 加载策略

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 后端 API | 主数据源，按 userId 隔离 |
| 2 | localStorage | API 失败时回退 |
| 3 | default-data | 无任何数据时使用 |

### 跨标签同步

监听 `window.storage` 事件，当其他标签页修改 localStorage 时自动同步当前状态。

---

## 4. useDashboardLogic

**文件**: `app/dashboard/hooks/useDashboardLogic.ts`

**职责**: 聚合各 Context 的状态和方法，提供 Dashboard 页面级别的业务逻辑处理函数。

### 输入-过程-输出

```
输入：props（currentUser, formData, editingTask 等）
  │
  ▼
读取各 Context 的 state 和 dispatch
  │
  ▼
提供业务处理函数
  │
  ▼
输出：处理函数集合
```

### 主要函数

| 函数 | 输入 | 处理 | 输出 |
|------|------|------|------|
| `handleAddComment` | taskId, content | 创建评论，更新 task comments | 无 |
| `handleDeleteComment` | commentId, taskId | 删除评论，更新 task comments | 无 |
| `handlePrivacyConsent` | 无 | 设置 privacyConsented=true | 无 |
| `handleRevokeConsent` | 无 | 确认后清空所有数据 | 无 |
| `handleLoginSuccess` | 无 | 记录登录审计日志 | 无 |
| `handleLogout` | 无 | 记录登出审计日志，清空认证 | 无 |
| `handleExportData` | 无 | 导出用户数据 | 无 |
| `handleImportData` | file event | 校验、导入数据到 API | 提示信息 |
| `handleClearAllData` | 无 | 确认后清空所有数据 | 无 |
| `handleNewTask` | 无 | 重置表单，打开任务弹窗 | 无 |
| `handleSaveTask` | 无 | 校验表单，创建/更新任务 | 无 |
| `handleNewRequirement` | 无 | 重置表单，打开需求弹窗 | 无 |
| `handleSaveRequirement` | 无 | 创建/更新需求 | 无 |
| `handleDeleteRequirement` | id | 删除需求 | 无 |
| `handleNewTestCase` | 无 | 重置表单，打开测试用例弹窗 | 无 |
| `handleSaveTestCase` | 无 | 创建/更新测试用例 | 无 |
| `handleDeleteTestCase` | id | 删除测试用例 | 无 |
| `handleNewBug` | 无 | 重置表单，打开 Bug 弹窗 | 无 |
| `handleSaveBug` | 无 | 创建/更新 Bug | 无 |
| `handleDeleteBug` | id | 删除 Bug | 无 |

### Epic 归属处理（v1.4.0）

- `handleNewTask` / `handleNewRequirement` / `handleNewTestCase` / `handleNewBug` 重置表单时将 `formData.epicId` 预填为 `epicIdForCreate(currentEpicId) || ""`（All Epics / No Epic 过滤器下为空串）。
- `handleSaveTask` / `handleSaveRequirement` / `handleSaveTestCase` / `handleSaveBug` 的更新分支透传 `formData.epicId`（支持改派或清空 Epic）；创建分支以 `formData.epicId || undefined` 写入。
- `handleSaveGoal` 新建分支使用 `epicIdForCreate(currentEpicId)` 写入 epicId，保证 `NO_EPIC_FILTER` 哨兵不会进入数据。

### 保存任务流程

```
输入：formData, editingTask?
  │
  ▼
校验 title 非空
  │
  ▼
如果是编辑 → 构建 updateData → 调用 updateTask
如果是新建 → 构建 Task 对象 → 调用 addTask
  │
  ▼
记录审计日志
  │
  ▼
关闭弹窗
```

---

## 5. usePersistence

**文件**: `app/dashboard/hooks/usePersistence.ts`

**职责**: 当业务状态变化时，自动加密并保存到 localStorage，同时维护标签历史。

### 输入-过程-输出

```
输入：各业务状态数组 + isInitialized
  │
  ▼
useEffect 监听每个状态变化
  │
  ▼
如果 isInitialized=true
  │
  ▼
encryptData(data) → 保存到 STORAGE_KEYS.xxx
  │
  ▼
输出：localStorage 已更新
```

### 保存的键

| 状态 | localStorage 键 |
|------|-----------------|
| tasks | STORAGE_KEYS.TASKS |
| requirements | STORAGE_KEYS.REQUIREMENTS |
| testCases | STORAGE_KEYS.TEST_CASES |
| bugs | STORAGE_KEYS.BUGS |
| goals | STORAGE_KEYS.GOALS |
| milestones | STORAGE_KEYS.MILESTONES |
| keyResults | STORAGE_KEYS.KEY_RESULTS |
| tagHistory | STORAGE_KEYS.TAG_HISTORY |
| comments | STORAGE_KEYS.COMMENTS |
| auditLogs | STORAGE_KEYS.AUDIT_LOGS |
| epics | STORAGE_KEYS.EPICS |

### 标签历史收集

```
输入：tasks
  │
  ▼
提取所有 tags 去重
  │
  ▼
合并到现有 tagHistory（不重复）
  │
  ▼
输出：更新 tagHistory 状态
```

---

## 6. useValidation

**文件**: `app/dashboard/hooks/useValidation.ts`

**职责**: 数据初始化完成后，校验所有业务数据完整性，过滤掉损坏对象。

### 输入-过程-输出

```
输入：isInitialized, tasks, requirements, ..., setters
  │
  ▼
useEffect 在 isInitialized=true 时触发
  │
  ▼
对每种类型调用 validateDataIntegrity
  │
  ├─ 无错误 → 跳过
  └─ 有错误 → 过滤掉无效项
        - 根据 error.id 找出无效项
        - 保留有效项，如果全部无效则置为空数组
  │
  ▼
设置 validationResults 和 showValidationBanner
  │
  ▼
输出：{ validationResults, setValidationResults, showValidationBanner, setShowValidationBanner }
```

---

## 7. useViewMode

**文件**: `app/dashboard/hooks/useViewMode.ts`

**职责**: 管理 Dashboard 视图模式，并与 URL 查询参数同步。

### 输入-过程-输出

```
输入：URL 查询参数 ?view=...
  │
  ▼
初始化 viewMode = searchParams.get('view') 或 'TASKS'
  │
  ▼
监听 searchParams 变化，同步 viewMode
  │
  ▼
handleViewModeChange(newView)
  - 更新 state
  - 更新 URL: router.push(`/dashboard?view=${newView}`)
  │
  ▼
输出：{ viewMode, setViewMode, VALID_VIEW_MODES }
```

### 有效视图模式

- TASKS, REQUIREMENTS, TESTING, BUGS, GOALS, AUDIT, NOTIFICATIONS

---

## 8. useWindow

**文件**: `app/dashboard/hooks/useWindow.ts`

**职责**: 管理窗口尺寸、客户端渲染标志、隐私同意弹窗、ESC 键关闭弹窗。

### 输入-过程-输出

```
输入：setShowModal（可选）
  │
  ▼
useEffect 初始化
  - 设置 isClient=true
  - 监听 resize 更新 windowWidth
  - 监听 keydown，ESC 关闭弹窗
  - 检查 localStorage 中 privacy consent
  │
  ▼
输出：{
  windowWidth, isClient,
  showPrivacyModal, setShowPrivacyModal,
  privacyConsented, setPrivacyConsented,
  effectiveWidth, isSmall, isMedium
}
```

### 响应式断点

| 变量 | 条件 |
|------|------|
| `isSmall` | width ≤ 768 |
| `isMedium` | width ≤ 1024 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
