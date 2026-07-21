# 默认数据说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 文件位置

`app/dashboard/data/default-data.ts`

---

## 概述

该文件提供应用初始化时使用的默认数据，包括默认标签历史、默认需求、任务、测试用例、Bug、目标、里程碑、关键结果、审计日志、评论和 Epic 等。

---

## 主要导出函数

| 函数 | 返回类型 | 说明 |
|------|----------|------|
| `getDefaultTagHistory()` | `string[]` | 默认标签历史 |
| `getDefaultRequirements()` | `Requirement[]` | 默认需求列表 |
| `getDefaultTasks()` | `Task[]` | 默认任务列表 |
| `getDefaultTestCases()` | `TestCase[]` | 默认测试用例列表 |
| `getDefaultBugs()` | `Bug[]` | 默认 Bug 列表 |
| `getDefaultGoals()` | `Goal[]` | 默认目标列表 |
| `getDefaultMilestones()` | `Milestone[]` | 默认里程碑列表 |
| `getDefaultKeyResults()` | `KeyResult[]` | 默认关键结果列表 |
| `getDefaultAuditLogs()` | `AuditLogEntry[]` | 默认审计日志 |
| `getDefaultComments()` | `Comment[]` | 默认评论 |
| `getDefaultEpics()` | `Epic[]` | 默认 Epic 列表 |
| `getDefaultData()` | `object` | 所有默认数据的完整集合 |

---

## 默认需求（getDefaultRequirements）

包含 22+ 条需求，覆盖以下主题：

| 主题 | 示例 |
|------|------|
| 核心功能 | 任务看板、需求管理、测试用例管理 |
| 智能体/工作流 | 多智能体工作流可视化 |
| 安全 | 数据安全与加密、ISO 27001 信息安全审计 |
| 隐私合规 | GDPR、CCPA、GB/T 35273、SOC 2 |
| 标准合规 | ISO 9001、ISO/IEC 25010、WCAG 2.1 AA |
| 测试标准 | IEEE 829、IEEE 1044、GB/T 15532、GB/T 25000.51 |
| 行业 | PCI DSS、HIPAA、FedRAMP 等 |

每条需求包含：id、title、description、source、priority、status、acceptanceCriteria、createdAt、updatedAt、requester、executor、epicId。

---

## 默认任务（getDefaultTasks）

包含 10+ 个默认任务，例如：
- 设计登录页面
- 实现任务拖拽
- 集成数据加密
- 实现审计日志
- 编写测试用例

任务状态覆盖 TODO、IN_PROGRESS、DONE，优先级覆盖 LOW、MEDIUM、HIGH、URGENT。

---

## 默认测试用例（getDefaultTestCases）

包含 6+ 条测试用例，覆盖：
- 任务创建流程
- 需求状态流转
- 加密数据持久化
- 审计日志记录
- 错误处理

---

## 默认 Bug（getDefaultBugs）

包含 4+ 条默认 Bug，覆盖：
- 登录页低分辨率按钮错位
- 任务拖拽偶发丢失
- 加密初始化失败
- 审计日志未记录

---

## 默认目标（getDefaultGoals）

包含 3+ 个默认目标，例如：
- V1.0 产品发布
- 提升团队交付效率
- 通过 ISO 27001 审计

---

## 默认数据用途

1. **应用首次启动**: 当数据库和 localStorage 都没有数据时，作为 fallback 展示。
2. **演示模式**: 新用户登录后可直接看到完整示例项目。
3. **测试**: 部分测试用例使用默认数据作为初始状态。

---

## 与当前架构的关系

迁移到 Prisma/SQLite 后端后，默认数据不再通过 `default-data.ts` 自动注入。实际示例数据由 `prisma/seed.ts` 写入数据库。`default-data.ts` 仍保留，用于：
- 离线 fallback
- 快速测试
- 文档示例

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
