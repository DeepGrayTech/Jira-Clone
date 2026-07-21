# Hooks 说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. useAuth

**文件**: `app/dashboard/hooks/useAuth.ts`

**职责**: 基于 NextAuth 的认证状态管理。

**返回值**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `isAuthenticated` | `boolean` | 是否已认证 |
| `setIsAuthenticated` | `React.Dispatch<boolean>` | 手动设置认证状态 |
| `currentUser` | `AuthUser \| null` | 当前用户信息 |
| `setCurrentUser` | `React.Dispatch<AuthUser \| null>` | 手动设置当前用户 |
| `handleLoginSuccess()` | `void` | 占位函数，NextAuth 自动处理 session 刷新 |
| `handleLogout()` | `void` | 调用 `signOut` 登出 |

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
输出：认证状态和用户信息
```

**注意**: 必须包裹在 `SessionProvider` 内使用，由 `app/providers.tsx` 提供。

---

## 2. useDashboardLogic

**文件**: `app/dashboard/hooks/useDashboardLogic.ts`

**职责**: Dashboard 主业务逻辑封装。聚合多个 Context，处理任务、需求、测试用例、Bug、目标的新建/编辑/保存、导入导出、隐私授权、清空数据等操作。

**输入 Props**:
- `currentUser`: 当前用户
- `setIsAuthenticated` / `setCurrentUser`: 认证状态设置
- `setShowModal` / `setModalType`: 弹窗控制
- `editingTask` / `editingRequirement` / `editingTestCase` / `editingBug`: 编辑中实体
- `setEditingXxx`: 编辑状态设置
- `formData` / `setFormData`: 表单数据
- `setShowPrivacyModal` / `setPrivacyConsented`: 隐私弹窗控制
- `setImportMessage`: 导入消息
- `fileInputRef`: 文件输入引用
- `currentEpicId`: 当前 Epic ID

**主要方法**:

| 方法 | 说明 |
|------|------|
| `handleAddComment(taskId, content)` | 添加评论并同步到任务 |
| `handleDeleteComment(commentId, taskId)` | 删除评论 |
| `handlePrivacyConsent()` | 接受隐私协议 |
| `handleRevokeConsent()` | 撤销隐私授权并清空数据 |
| `handleLoginSuccess()` | 登录成功记录审计 |
| `handleLogout()` | 登出并记录审计 |
| `handleExportData()` | 导出用户数据 |
| `handleImportData(event)` | 从文件导入数据 |
| `handleClearAllData()` | 清空所有数据 |
| `handleNewTask()` / `handleSaveTask()` / `handleDeleteTask()` | 任务 CRUD |
| `handleNewRequirement()` / `handleSaveRequirement()` / `handleDeleteRequirement()` | 需求 CRUD |
| `handleNewTestCase()` / `handleSaveTestCase()` / `handleDeleteTestCase()` | 测试用例 CRUD |
| `handleNewBug()` / `handleSaveBug()` / `handleDeleteBug()` | Bug CRUD |
| `handleNewGoal()` / `handleSaveGoal()` / `handleDeleteGoal()` / `handleDuplicateGoal()` | 目标 CRUD |
| `handleMilestoneXxx` / `handleKeyResultXxx` | 里程碑/关键结果操作 |
| `handleNewEpic()` / `handleSaveEpic()` / `handleDeleteEpic()` | Epic CRUD |

### 处理流程

```
输入：用户交互（点击按钮、提交表单）
  │
  ▼
useDashboardLogic 读取各 Context 的 state 和 dispatch
  │
  ▼
根据当前编辑状态和表单数据，调用对应 Context 方法
  │
  ▼
更新状态并记录审计日志
  │
  ▼
输出：UI 状态更新
```

---

## 3. useDataLoader

**文件**: `app/dashboard/hooks/useDataLoader.ts`

**职责**: 应用初始化时加载数据。策略：

1. **优先 API 加载**：从后端拉取任务、需求、测试用例、Bug、目标、Epic、审计日志。
2. **API 失败回退 localStorage**：离线或 API 不可用时读取本地加密数据。
3. **localStorage 为空回退默认值**：使用 `default-data` 中的演示数据。

### 输入-过程-输出

```
输入：各业务实体的 setState 函数
  │
  ▼
useLayoutEffect 触发加载
  │
  ├─ 尝试 API 加载（并行 fetch）
  │   ├─ 成功 → 设置状态
  │   └─ 失败 → 回退 localStorage
  │
  ├─ localStorage 加载
  │   ├─ 尝试解密数据
  │   ├─ 合并默认数据
  │   └─ 设置状态
  │
  ▼
输出：isInitialized=true，UI 可渲染
```

**额外功能**: 监听 `storage` 事件，实现多标签页同步。

---

## 4. usePersistence

**文件**: `app/dashboard/hooks/usePersistence.ts`

**职责**: 自动将各业务数据持久化到 `localStorage`，支持 AES 加密。

**特点**:
- 通过 `isInitialized` 标志防止初始化前覆盖数据。
- 记录保存耗时、数据大小、压缩比等日志。
- 自动从任务标签中提取标签历史。

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

---

## 5. useValidation

**文件**: `app/dashboard/hooks/useValidation.ts`

**职责**: 数据完整性校验。在 `isInitialized` 完成后对所有数据类型运行校验，过滤无效数据，并显示校验结果横幅。

**校验范围**: Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult。

### 输入-过程-输出

```
输入：isInitialized, 各业务数据数组
  │
  ▼
useEffect 在 isInitialized=true 时触发
  │
  ▼
对每种类型调用 validateDataIntegrity
  │
  ├─ 无错误 → 跳过
  └─ 有错误 → 过滤掉无效项
  │
  ▼
设置 validationResults 和 showValidationBanner
  │
  ▼
输出：{ validationResults, showValidationBanner, ... }
```

---

## 6. useViewMode

**文件**: `app/dashboard/hooks/useViewMode.ts`

**职责**: 管理 Dashboard 视图模式，并与 URL 查询参数 `?view=xxx` 同步。

**支持视图**:
- `TASKS`（任务看板）
- `REQUIREMENTS`（需求管理）
- `TESTING`（测试用例）
- `BUGS`（Bug 跟踪）
- `GOALS`（目标管理）
- `AUDIT`（审计日志）
- `NOTIFICATIONS`（通知中心）

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

---

## 7. useWindow

**文件**: `app/dashboard/hooks/useWindow.ts`

**职责**: 窗口/响应式管理。

**返回值**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `windowWidth` | `number` | 窗口宽度 |
| `isClient` | `boolean` | 是否已在客户端渲染 |
| `showPrivacyModal` | `boolean` | 是否显示隐私弹窗 |
| `setShowPrivacyModal` | `function` | 设置隐私弹窗显示 |
| `privacyConsented` | `boolean` | 是否已同意隐私协议 |
| `setPrivacyConsented` | `function` | 设置隐私同意状态 |
| `effectiveWidth` | `number` | 有效宽度（客户端用真实值，服务端用 1280） |
| `isSmall` | `boolean` | 是否小屏 |
| `isMedium` | `boolean` | 是否中屏 |

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

**副作用**:
- 监听 resize 更新窗口宽度。
- 监听 ESC 键关闭弹窗（如果传入 `setShowModal`）。
- 检查 `localStorage` 隐私同意状态，未同意则显示弹窗。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
