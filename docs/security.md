# 安全说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. 认证

### 凭证认证

- 使用 `next-auth` 的 `CredentialsProvider` 实现邮箱/密码登录（配置见 `lib/auth-config.ts`）。
- 密码使用 `bcryptjs` 进行哈希存储，默认 cost factor 为 10。
- 认证成功后使用 JWT session 策略。
- `lib/auth.ts` 不再处理任何凭证逻辑：旧版 localStorage 认证（SHA-256/MD5 哈希、token 生成）已在 v1.4.0 删除，同时移除了一处记录明文密码的调试日志。

### 会话管理

- JWT 有效期 30 天。
- Session 包含用户 id 和 role。
- 登出通过 `signOut()` 清除客户端会话。

---

## 2. 授权

- API 路由通过 `getServerSession(authOptions)` 获取当前用户。
- 所有数据库查询都限制 `userId`，确保用户只能访问自己的数据。
- 管理权限通过 `role === "ADMIN"` 判断。

---

## 3. 数据加密

### 本地存储加密

**文件**: `lib/encryption.ts`

- 使用 AES-GCM 256 位算法。
- 通过 `generateKey()` 生成或导入加密密钥。
- `encryptData()` 加密数据，输出 base64。
- `decryptData()` 解密 base64 数据。

**当前状态**:
- 项目已迁移到 Prisma/SQLite 后端，数据库本身不加密。
- 如需端到端加密，可在写入数据库前调用 `encryption.ts` 进行加密。

---

## 4. 隐私合规

**文件**: `lib/privacy.ts`

- `exportUserData()`：导出用户所有数据为 JSON 文件（含 tasks、requirements、testCases、bugs、goals、milestones、keyResults，以及自 v1.4.0 起的 epics）。
- `importUserData(file)`：从文件导入数据。
- `deleteAllUserData()`：删除用户所有业务数据，保留管理员账号。

**支持的权利**:
- 数据导出权
- 数据删除权（被遗忘权）
- 数据导入权

---

## 5. 审计日志

**文件**: `app/dashboard/contexts/AuditContext.tsx`

- 记录 CREATE、UPDATE、DELETE 等关键操作。
- 审计日志条目包含：操作人、时间、动作类型、目标实体、目标 ID、详情。
- 用于 ISO 27001 信息安全审计要求。

---

## 6. 输入校验

**文件**: `lib/validation.ts`

- 对 Task、Requirement、TestCase、Bug、Goal、Milestone、KeyResult 进行数据完整性校验。
- 校验项包括：必填字段、字段类型、枚举值、ID 唯一性、ISO 8601 时间格式。
- 防止脏数据进入系统。

---

## 7. 环境变量安全

- `.env` 文件不提交到 Git。
- 生产环境 `NEXTAUTH_SECRET` 必须为强随机字符串。
- `DATABASE_URL` 根据实际数据库配置。

---

## 8. 已知安全注意事项

1. **SQLite 默认无加密**：数据库文件为明文，生产环境建议使用 PostgreSQL 或启用文件系统加密。
2. **无 HTTPS 强制**：`next.config.mjs` 未配置 HTTPS 强制，生产部署应通过反向代理（Nginx、Caddy）启用 TLS。
3. **CSRF**：`next-auth` 默认处理 CSRF 防护，无需额外配置。
4. **XSS**：React 默认转义 JSX，用户输入数据通过 JSX 渲染是安全的。但仍需避免使用 `dangerouslySetInnerHTML`。
5. **权限粒度过粗**：当前只有 `USER` 和 `ADMIN` 两种角色，未细分到具体实体权限。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
