# Jira Clone 文档总览

> **项目**: Jira Clone - 任务管理系统
> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 如何使用本文档

本文档是项目所有文档的入口地图。每次新增功能、修改模块或重构时，请按以下顺序更新：

1. 修改对应模块的文档（如改动 Context 则更新 `contexts-detail.md`）。
2. 如果新增模块，则创建对应模块文档，并在这里添加链接。
3. 在 `CHANGE_LOG.md` 中追加变更记录。
4. 如果变更涉及架构或数据流，同步更新 `architecture.md`。
5. 运行 `npm run build` 验证文档不影响构建。

---

## 文档地图

### 项目级文档

| 文档 | 说明 |
|------|------|
| [README.md](../README.md) | 项目简介、技术栈、快速启动、环境变量 |
| [CHANGE_LOG.md](../CHANGE_LOG.md) | 按版本归档所有变更记录 |
| [WORKFLOW_RULES.md](../WORKFLOW_RULES.md) | 开发工作流规范 |
| [CODE_STYLE.md](../CODE_STYLE.md) | 代码风格规范 |
| [DESIGN_SPEC.md](../DESIGN_SPEC.md) | 设计规格说明 |
| [TEST_COMPLIANCE_REPORT.md](../TEST_COMPLIANCE_REPORT.md) | 测试合规报告 |

### 后端/数据

| 文档 | 说明 |
|------|------|
| [database.md](database.md) | Prisma schema、数据模型、seed 数据 |
| [prisma.md](prisma.md) | Prisma Client 单例、数据库连接、本地文件 |
| [api-routes.md](api-routes.md) | API 路由层详细说明（输入-过程-输出 + 流程图） |
| [api.md](api.md) | 所有 API 路由和 Service 函数 |
| [api-mappers.md](api-mappers.md) | API 数据映射器（JSON 字符串 ↔ 数组、状态别名） |
| [scripts.md](scripts.md) | 数据库/用户/数据迁移脚本 |
| [scripts-detail.md](scripts-detail.md) | 脚本工具详细说明 |

### 前端模块

| 文档 | 说明 |
|------|------|
| [contexts.md](contexts.md) | 所有 React Context 状态管理（旧版） |
| [contexts-detail.md](contexts-detail.md) | Context 详细说明（输入-过程-输出 + 流程图） |
| [hooks.md](hooks.md) | 自定义 Hooks（旧版） |
| [hooks-detail.md](hooks-detail.md) | Hooks 详细说明（输入-过程-输出 + 流程图） |
| [services.md](services.md) | API Service 和辅助 Service（旧版） |
| [services-detail.md](services-detail.md) | 业务 Services 详细说明 |
| [views-and-components.md](views-and-components.md) | 页面、视图、组件、弹窗（旧版） |
| [views-and-components-detail.md](views-and-components-detail.md) | 视图与组件详细说明 |
| [types.md](types.md) | TypeScript 类型定义 |
| [constants.md](constants.md) | 全局常量、颜色、存储键、状态标签 |
| [default-data.md](default-data.md) | 默认/示例数据 |
| [app-providers-and-layout.md](app-providers-and-layout.md) | 应用级 Provider 与 Layout |
| [agents-and-workflow.md](agents-and-workflow.md) | 智能体与工作流（历史/当前替代方案） |

### 基础设施与工具

| 文档 | 说明 |
|------|------|
| [lib.md](lib.md) | 工具库（auth、encryption、privacy、validation）旧版 |
| [lib-detail.md](lib-detail.md) | 工具库详细说明（输入-过程-输出 + 流程图） |
| [configuration.md](configuration.md) | 配置文件说明 |
| [testing.md](testing.md) | 测试策略、当前状态（全部通过）与改进方向 |
| [tests-detail.md](tests-detail.md) | 测试文件详细说明 |
| [deployment.md](deployment.md) | 部署说明 |
| [security.md](security.md) | 安全说明 |

### 迁移与重构

| 文档 | 说明 |
|------|------|
| [frontend-migration.md](frontend-migration.md) | 从 localStorage 到后端 API 的迁移记录 |
| [backend-migration-plan.md](backend-migration-plan.md) | 后端迁移计划 |
| [TECHNICAL.md](TECHNICAL.md) | 技术实现细节 |

---

## 模块化约定

为了支持持续递归更新，项目采用以下模块结构约定：

```
app/dashboard/
├── contexts/          # 每个业务实体一个 Context
├── hooks/             # 可复用逻辑
├── services/          # API 与业务 Service
├── views/             # 页面级视图组件
├── components/        # 通用/局部组件
├── data/              # 默认数据、静态数据
├── types.ts           # 类型定义
└── constants.ts       # 常量

每个模块内部遵循：
├── index.ts           # 统一导出
├── XxxContext.tsx     # 主实现
├── XxxContext.test.tsx # 测试
└── README.md          # （可选）模块级说明
```

---

## 文档维护流程

```
1. 开发/修改功能
2. 同步更新对应模块文档
3. 如果是新模块，创建新文档并在 docs/index.md 注册
4. 在 CHANGE_LOG.md 追加记录
5. 运行 npm run build 验证
6. 提交代码
```

---

## 待办文档（按需补充）

- [x] 模块级 README.md 模板（module-readme-template.md）
- [ ] 新增模块自动发现脚本
- [ ] 性能优化记录
- [ ] 错误码/异常处理文档
- [ ] 国际化方案（如未来支持）

---

*文档维护者: 项目维护者*
*最后更新: 2026-07-21*
