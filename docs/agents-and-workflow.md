# 智能体与工作流页面说明

> **版本**: v1.4.0
> **最后更新**: 2026-07-21

---

## 概述

当前版本（v1.4.0）的项目已不再包含独立的 `/agents` 和 `/workflow` 页面模块。这些功能在之前的版本中逐步被移除或合并到 Dashboard 的通知系统/子代理任务中。

---

## 1. Agents 页面（历史）

**原位置**: `app/agents/page.tsx`（已删除）

**历史职责**:
- 展示多智能体工作流布局
- 显示智能体状态、统计信息
- 使用 3×3 网格按开发阶段分层

**当前替代方案**:
- 智能体任务状态在 `NotificationContext` 中管理。
- `SubagentTaskService` 负责子代理任务的创建、状态更新、进度跟踪。
- 通知列表在 Dashboard 的 `NOTIFICATIONS` 视图中展示。

---

## 2. Workflow 页面（历史）

**原位置**: `app/workflow/page.tsx`（已删除）

**历史职责**:
- 使用 React Flow 渲染动态流程图
- 展示工作流节点和连接线
- 支持节点拖拽、状态动画、工作流启动效果

**当前替代方案**:
- 项目核心流程通过 Dashboard 中各实体状态流转（Task、Requirement、Bug、Goal）体现。
- 工作流可视化能力在后续版本中可能以独立路由恢复。

---

## 3. 当前相关组件

### SubagentTaskService

**文件**: `app/dashboard/services/SubagentTaskService.ts`

**职责**:
- `createSubagentTask(...)` — 创建子代理任务
- `updateSubagentTaskStatus(...)` — 更新任务状态
- `runSubagentTask(...)` — 模拟运行子代理任务

### NotificationContext

**文件**: `app/dashboard/contexts/NotificationContext.tsx`

**职责**:
- 管理通知列表
- 子代理任务状态变化自动生成通知
- 支持 `SUBAGENT_TASK_STARTED` / `COMPLETED` / `FAILED` 通知类型

---

*文档维护者: 文档管理员*
*最后更新: 2026-07-21*
