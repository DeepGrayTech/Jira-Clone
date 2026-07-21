# 工具库 (lib) 详细说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 文件清单

| 文件 | 职责 |
|------|------|
| `lib/prisma.ts` | Prisma Client 单例（见 prisma.md） |
| `lib/api-mappers.ts` | API 数据映射（见 api-mappers.md） |
| `lib/auth.ts` | 认证最小遗留模块（`UserRole` 类型 + `logoutAndClear` 清理工具） |
| `lib/auth-config.ts` | NextAuth 配置（当前主认证） |
| `lib/encryption.ts` | 数据加密/解密（旧 localStorage 使用） |
| `lib/encoding.ts` | UTF-8 编码/解码工具 |
| `lib/privacy.ts` | GDPR 数据导出/导入/删除 |
| `lib/validation.ts` | 数据完整性校验工具 |

---

## 2. auth.ts（认证遗留模块）

### 职责

自 v1.4.0 起，认证完全由 NextAuth + 数据库负责（见 `lib/auth-config.ts`），本文件不再包含注册、登录、权限检查或密码哈希逻辑，仅保留：

1. `UserRole` 类型（`"ADMIN" | "USER"`），供 `types/next-auth.d.ts`、`LoginForm` 等共享引用。
2. `logoutAndClear()` 清理函数，在登出和撤销隐私同意时清空 localStorage。

旧版基于 `localStorage` 的 `register` / `login` / `logout` / `getAuthState` / `getCurrentUser` / `hasPermission` / `getUsers` / `saveUsers`（含 SHA-256/MD5 密码哈希、token 生成与调试日志）已全部删除。

### 输入-过程-输出

#### logoutAndClear()

**输入**: 无

**处理**:
1. 删除遗留认证键 `jira-clone-auth-token`、`jira-clone-users`、`jira-clone-privacy-consent`。
2. 清空所有 `STORAGE_KEYS` 中的应用数据。

**输出**: 无

---

## 3. auth-config.ts（NextAuth 配置）

### 职责

配置 NextAuth 的认证选项，是当前系统的主认证入口。

### 输入-过程-输出

```
输入：登录请求（email, password）
  │
  ▼
[1] CredentialsProvider.authorize
  │
  ├─ 检查 prisma.user 是否存在该 email
  │  ├─ 不存在且用户数为 0 → 创建默认 admin 用户
  │  └─ 不存在且用户数 > 0 → 返回 null
  │
  ▼
[2] bcryptjs.compare(password, dbUser.passwordHash)
  │
  ├─ 不匹配 → 返回 null
  │
  ▼
[3] 返回 { id, email, name, role }
  │
  ▼
[4] JWT 回调：将 id, role 写入 token
  ▼
[5] Session 回调：将 token 信息暴露给 session.user
  ▼
输出：session 或 JWT
```

### 关键配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| provider | CredentialsProvider | 邮箱/密码认证 |
| session.strategy | jwt | 使用 JWT session |
| session.maxAge | 30 天 | token 有效期 |
| pages.signIn | /dashboard | 登录页面 |
| secret | NEXTAUTH_SECRET | 环境变量 |

---

## 4. encryption.ts

### 职责

提供 AES-GCM 加密/解密，用于早期 localStorage 数据加密。

### 处理流程

#### encrypt(data, key)

```
输入：明文数据，CryptoKey
  │
  ▼
[1] 生成随机 IV (12 bytes)
  ▼
[2] crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, encodedData)
  ▼
[3] 合并 IV + ciphertext，base64 编码
  ▼
输出：密文字符串
```

#### decrypt(ciphertext, key)

```
输入：密文字符串，CryptoKey
  │
  ▼
[1] base64 解码，分离 IV 和 ciphertext
  ▼
[2] crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, ciphertext)
  ▼
[3] 解码为字符串，JSON.parse
  ▼
输出：明文数据
```

### 当前状态

迁移到后端后，业务数据不再使用 localStorage 加密，但工具函数仍保留。

---

## 5. encoding.ts

### 职责

提供零依赖的 UTF-8 编码/解码工具，兼容浏览器和 Node.js。

### utf8Encode(str)

**输入**: 字符串

**处理**: 按 Unicode 码点生成 UTF-8 字节序列（1-4 字节）

**输出**: `Uint8Array`

### utf8Decode(bytes)

**输入**: `Uint8Array`

**处理**: 按 UTF-8 规则解析字节序列，支持代理对

**输出**: 字符串 或 null（解码失败时）

---

## 6. privacy.ts

### 职责

提供 GDPR 合规的数据导出、导入、删除功能。操作对象为 localStorage。

### exportUserData()

**输入**: 无

**处理**:
1. 从 `STORAGE_KEYS` 读取 tasks、requirements、testCases、bugs、goals、milestones、keyResults、epics。
2. 递归去除敏感字段（password、passwordHash、token、secret）。
3. 生成 JSON 文件并触发下载。

**输出**: 下载 JSON 文件

### importUserData(file)

**输入**: File 对象

**处理**:
1. FileReader 读取文件文本。
2. JSON.parse 解析内容。
3. 校验必要字段（exportDate、version、data.* 数组）；`data.epics` 为可选字段，兼容 v1.4.0 之前的旧导出文件。

**输出**: Promise<ExportedData>

### deleteAllUserData()

**输入**: 无

**处理**:
1. 保留 ADMIN 用户（从 `jira-clone-users` 过滤）。
2. 清空所有 `STORAGE_KEYS` 数据。
3. 删除 privacy consent、auth token、users。
4. 如果保留了 admin，重新写入 users。

**输出**: `{ success, message }`

---

## 7. validation.ts

### 职责

提供 ISO/IEC 25010 风格的数据完整性校验，覆盖 Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult。

### 校验流程

```
输入：data[] 和 type（DataTypeName）
  │
  ▼
[1] 查找对应 validator
  │
  ▼
[2] 遍历每个 item，调用 validator
  │   - 检查 id/title 非空
  │   - 检查状态/优先级枚举值
  │   - 检查 ISO 8601 时间格式
  │   - 检查数组字段类型
  │   - 检查 ID 唯一性
  ▼
[3] 聚合 errors 和 warnings
  ▼
输出：ValidationResult
```

### 支持校验的类型

| 类型 | 校验内容 |
|------|----------|
| Task | id, title, status, priority, dueDate, createdAt, tags, comments |
| Requirement | id, title, status, priority, createdAt, updatedAt, acceptanceCriteria |
| TestCase | id, title, status, steps, executedAt |
| Bug | id, title, status, severity, priority, stepsToReproduce, createdAt, updatedAt |
| Goal | id, title, status, type, startDate, endDate, createdAt, updatedAt, relatedRequirementIds, relatedTaskIds |
| Milestone | id, title, goalId, dueDate, completedAt |
| KeyResult | id, title, goalId, status, targetValue, currentValue |

### 输出格式

```ts
{
  isValid: boolean,
  errors: ValidationError[],
  warnings: ValidationError[],
  validCount: number,
  totalCount: number,
  type: string
}
```

### getValidationSummary(results)

**输入**: 一个或多个 ValidationResult

**处理**: 汇总错误、警告、有效/总数

**输出**: 人类可读字符串

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
