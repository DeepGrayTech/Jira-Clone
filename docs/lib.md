# Lib 工具库说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. auth.ts

**文件**: `lib/auth.ts`

**职责**: 认证相关的最小遗留模块。自 v1.4.0 起，认证完全由 NextAuth.js 负责（见 `lib/auth-config.ts`），本文件不再处理注册、登录或密码哈希，仅保留共享角色类型与 localStorage 清理工具。

**主要导出**:

| 导出 | 类型 | 说明 |
|------|------|------|
| `UserRole` | `type` | `"ADMIN" \| "USER"`，被 `types/next-auth.d.ts`、`LoginForm` 等引用 |
| `logoutAndClear()` | `void` | 清除遗留认证键（`jira-clone-auth-token`、`jira-clone-users`、`jira-clone-privacy-consent`）及所有 `STORAGE_KEYS` 应用数据；在登出与撤销隐私同意时调用 |

**历史说明**: 旧版基于 localStorage 的 `register` / `login` / `logout` / `getAuthState` / `getCurrentUser` / `hasPermission` / `getUsers` / `saveUsers`（含 SHA-256/MD5 密码哈希与 token 生成）已在 v1.4.0 全部删除。

---

## 2. auth-config.ts

**文件**: `lib/auth-config.ts`

**职责**: NextAuth 配置。实际认证由 Prisma 数据库驱动。

**关键配置**:

| 配置项 | 说明 |
|--------|------|
| `CredentialsProvider` | 邮箱 + 密码登录 |
| `session.strategy: "jwt"` | 使用 JWT session |
| `maxAge: 30 * 24 * 60 * 60` | 30 天有效期 |
| `jwt callback` | 将 user id/role 写入 token |
| `session callback` | 将 id/role 注入 session.user |
| `pages.signIn: "/dashboard"` | 登录页为 Dashboard 页 |
| `secret` | 从 `NEXTAUTH_SECRET` 读取 |

**特殊行为**:
- 如果数据库中没有任何用户，自动创建 `admin@example.com` / `admin123` 管理员账号。

---

## 3. encryption.ts

**文件**: `lib/encryption.ts`

**职责**: 提供 AES-GCM 256 位加密/解密，用于 localStorage 数据加密。

**主要导出**:

| 导出 | 说明 |
|------|------|
| `generateKey()` | 生成或导入 AES-GCM 256 key |
| `encryptData(data)` | 加密数据，返回 base64 字符串 |
| `decryptData(data)` | 解密 base64 字符串，返回原始数据 |

---

## 4. privacy.ts

**文件**: `lib/privacy.ts`

**职责**: GDPR 合规的数据导出、导入、删除。

**主要导出**:

| 导出 | 说明 |
|------|------|
| `ExportedData` | 导出数据结构 |
| `exportUserData()` | 导出所有用户数据为 JSON 文件 |
| `importUserData(file)` | 从文件导入数据 |
| `deleteAllUserData()` | 删除所有业务数据，保留 ADMIN 账号 |

**导出内容**: `exportUserData()` 导出 tasks、requirements、testCases、bugs、goals、milestones、keyResults，以及自 v1.4.0 起新增的 epics（`ExportedData.data.epics` 为可选字段，兼容 v1.4.0 之前的旧导出文件）。

---

## 5. validation.ts

**文件**: `lib/validation.ts`

**职责**: 数据完整性校验，实现 ISO/IEC 25010 数据质量检查。

**主要导出**:

| 导出 | 说明 |
|------|------|
| `validateDataIntegrity(data, type)` | 对指定类型数组进行校验 |
| `getValidationSummary(result)` | 生成校验结果摘要 |
| `getValidationSeverityCounts(result)` | 统计错误/警告数量 |
| `formatValidationResult(result)` | 格式化校验结果 |
| `VALIDATORS` | 内置校验器映射 |

**支持校验类型**: `Task`、`Requirement`、`TestCase`、`Bug`、`Goal`、`Milestone`、`KeyResult`。

---

## 6. encoding.ts

**文件**: `lib/encoding.ts`

**职责**: UTF-8 编码/解码工具，供 encryption.ts 使用。

**主要导出**:

| 导出 | 说明 |
|------|------|
| `utf8Encode(str)` | 将字符串编码为 Uint8Array |
| `utf8Decode(bytes)` | 将 Uint8Array 解码为字符串 |

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
