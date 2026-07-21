# 脚本说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 1. check-users.ts

**文件**: `scripts/check-users.ts`

**用途**: 查询数据库中所有用户列表。

**运行方式**:
```bash
npx tsx scripts/check-users.ts
```

**输出示例**:
```
用户列表:
- admin@example.com (role: ADMIN, id: xxx)
- demo@example.com (role: USER, id: xxx)
```

---

## 2. check-password.ts

**文件**: `scripts/check-password.ts`

**用途**: 校验数据库中 demo 用户的密码是否匹配常见候选密码。

**运行方式**:
```bash
npx tsx scripts/check-password.ts
```

**输出示例**:
```
User: demo@example.com
password "demo123" matches: true
password "admin123" matches: false
```

---

## 3. count-db.ts

**文件**: `scripts/count-db.ts`

**用途**: 统计数据库中各模型记录数量，用于快速确认数据状态。

**运行方式**:
```bash
npx tsx scripts/count-db.ts
```

**输出示例**:
```
数据库统计:
- Users: 1
- Epics: 3
- Tasks: 6
- Requirements: 3
- TestCases: 2
- Bugs: 2
- Goals: 2
- Milestones: 2
- KeyResults: 2
- Comments: 2
- AuditLogs: 2
```

---

## 4. import-localstorage.ts

**文件**: `scripts/import-localstorage.ts`

**用途**: 将浏览器 localStorage 中导出的 JSON 数据批量导入到当前登录用户的数据库记录中。

**状态**: 已创建但当前未使用（用户已决定保持现状，不恢复旧数据）。

**运行方式**:
```bash
npx tsx scripts/import-localstorage.ts
```

**说明**:
- 从环境变量或 stdin 读取 localStorage 导出 JSON。
- 支持导入 epics、tasks、requirements、testCases、bugs、goals、milestones、keyResults、comments、auditLogs、tagHistory。
- 导入前会校验数据完整性。

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
