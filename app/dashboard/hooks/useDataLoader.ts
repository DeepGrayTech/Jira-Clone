"use client";

import { useLayoutEffect } from "react";
import { decryptData } from "@/lib/encryption";
import { STORAGE_KEYS } from "../constants";
import {
  getDefaultAgents,
  getDefaultTestCases,
  getDefaultGoals,
  getDefaultMilestones,
  getDefaultKeyResults,
  getDefaultBugs,
} from "../data/default-data";
import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  Goal,
  Milestone,
  KeyResult,
  Agent,
  AgentTaskAssignment,
  Comment,
  AuditLogEntry,
} from "../types";

/**
 * Data loading hook.
 * Loads all persisted data from localStorage with decryption on mount.
 * Sets isInitialized flag when complete to enable auto-save.
 *
 * Loading Strategy:
 * 1. Try to decrypt data (AES-GCM)
 * 2. If decryption fails, try plain JSON parsing (legacy format)
 * 3. If all fails, use default data
 */
export function useDataLoader(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>,
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>,
  setBugs: React.Dispatch<React.SetStateAction<Bug[]>>,
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>,
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>,
  setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>,
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>,
  setAgentAssignments: React.Dispatch<React.SetStateAction<AgentTaskAssignment[]>>,
  setTagHistory: React.Dispatch<React.SetStateAction<string[]>>,
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>,
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>,
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>
) {
  const MAX_AUDIT_LOG_ENTRIES = 1000;

  useLayoutEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const savedRequirements = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
      const savedTestCases = localStorage.getItem(STORAGE_KEYS.TEST_CASES);
      const savedTagHistory = localStorage.getItem(STORAGE_KEYS.TAG_HISTORY);

      if (savedTasks) {
        const decrypted = await decryptData<Task[]>(savedTasks);
        if (cancelled) return;
        if (decrypted) {
          setTasks(decrypted);
        } else {
          try {
            setTasks(JSON.parse(savedTasks));
          } catch {
            setTasks([
              {
                id: "t1",
                title: "搭建项目框架和Next.js配置",
                description:
                  "初始化Next.js项目，配置TypeScript、Tailwind CSS和项目目录结构",
                status: "DONE",
                priority: "URGENT",
                dueDate: "2026-06-01",
                tags: ["setup", "nextjs", "typescript"],
                assignee: "数据大厨",
                relatedRequirementId: "r1",
                comments: [],
                createdAt: "2026-06-01",
              },
              {
                id: "t2",
                title: "实现Task Board看板页面",
                description:
                  "开发任务看板主页面，包含TODO/IN_PROGRESS/DONE三列布局",
                status: "DONE",
                priority: "URGENT",
                dueDate: "2026-06-05",
                tags: ["frontend", "kanban", "ui"],
                assignee: "像素魔法师",
                relatedRequirementId: "r1",
                comments: [],
                createdAt: "2026-06-03",
              },
              {
                id: "t3",
                title: "实现任务拖拽功能",
                description:
                  "集成@hello-pangea/dnd实现任务卡片在状态列之间拖拽移动",
                status: "DONE",
                priority: "URGENT",
                dueDate: "2026-06-08",
                tags: ["frontend", "drag-drop", "interaction"],
                assignee: "像素魔法师",
                relatedRequirementId: "r1",
                comments: [],
                createdAt: "2026-06-05",
              },
              {
                id: "t4",
                title: "实现任务创建/编辑表单",
                description:
                  "开发任务创建和编辑的模态框表单，支持标题、描述、优先级、标签和截止日期",
                status: "DONE",
                priority: "URGENT",
                dueDate: "2026-06-10",
                tags: ["frontend", "form", "modal"],
                assignee: "像素魔法师",
                relatedRequirementId: "r1",
                comments: [],
                createdAt: "2026-06-07",
              },
              {
                id: "t5",
                title: "实现任务搜索和筛选",
                description: "实现任务列表的搜索、按状态筛选和按优先级排序功能",
                status: "DONE",
                priority: "HIGH",
                dueDate: "2026-06-12",
                tags: ["frontend", "search", "filter"],
                assignee: "数据大厨",
                relatedRequirementId: "r1",
                comments: [],
                createdAt: "2026-06-09",
              },
              {
                id: "t6",
                title: "实现Requirement管理页面",
                description:
                  "开发需求管理页面，支持需求的创建、编辑、删除和状态跟踪",
                status: "DONE",
                priority: "URGENT",
                dueDate: "2026-06-15",
                tags: ["frontend", "requirement", "management"],
                assignee: "像素魔法师",
                relatedRequirementId: "r2",
                comments: [],
                createdAt: "2026-06-11",
              },
              {
                id: "t7",
                title: "实现Test Case管理页面",
                description:
                  "开发测试用例管理页面，支持测试用例的创建、执行和状态管理",
                status: "DONE",
                priority: "HIGH",
                dueDate: "2026-06-18",
                tags: ["frontend", "testing", "qa"],
                assignee: "像素魔法师",
                relatedRequirementId: "r3",
                comments: [],
                createdAt: "2026-06-13",
              },
              {
                id: "t8",
                title: "实现Agent工作流可视化（React Flow）",
                description:
                  "使用React Flow实现智能体工作流的可视化展示，支持节点动画和状态流转",
                status: "DONE",
                priority: "HIGH",
                dueDate: "2026-06-20",
                tags: ["frontend", "react-flow", "visualization"],
                assignee: "配色狂魔",
                relatedRequirementId: "r4",
                comments: [],
                createdAt: "2026-06-15",
              },
              {
                id: "t9",
                title: "实现Bug Tracker页面",
                description:
                  "开发Bug跟踪页面，实现Bug的提交、分配、修复和验证闭环管理",
                status: "DONE",
                priority: "HIGH",
                dueDate: "2026-06-22",
                tags: ["frontend", "bug", "tracking"],
                assignee: "像素魔法师",
                relatedRequirementId: "r5",
                comments: [],
                createdAt: "2026-06-17",
              },
              {
                id: "t10",
                title: "实现Goal Tracker页面",
                description: "开发目标跟踪页面，支持OKR目标创建和进度跟踪",
                status: "IN_PROGRESS",
                priority: "HIGH",
                dueDate: "2026-07-05",
                tags: ["frontend", "goal", "okr"],
                assignee: "数据大厨",
                relatedRequirementId: "r6",
                comments: [],
                createdAt: "2026-06-19",
              },
              {
                id: "t11",
                title: "实现Timeline View页面",
                description: "开发时间线甘特图视图，展示任务和目标的时序关系",
                status: "IN_PROGRESS",
                priority: "MEDIUM",
                dueDate: "2026-07-08",
                tags: ["frontend", "timeline", "gantt"],
                assignee: "配色狂魔",
                relatedRequirementId: "r6",
                comments: [],
                createdAt: "2026-06-20",
              },
              {
                id: "t12",
                title: "实现数据加密存储",
                description:
                  "使用AES-GCM算法对localStorage中的数据进行加密存储，确保数据安全",
                status: "DONE",
                priority: "HIGH",
                dueDate: "2026-06-24",
                tags: ["security", "encryption", "backend"],
                assignee: "数据大厨",
                relatedRequirementId: "r7",
                comments: [],
                createdAt: "2026-06-21",
              },
              {
                id: "t13",
                title: "实现响应式布局适配",
                description:
                  "适配移动端和桌面端不同屏幕尺寸，确保所有页面在多种设备上显示正常",
                status: "DONE",
                priority: "MEDIUM",
                dueDate: "2026-06-26",
                tags: ["frontend", "responsive", "ui"],
                assignee: "配色狂魔",
                relatedRequirementId: "r8",
                comments: [],
                createdAt: "2026-06-22",
              },
              {
                id: "t14",
                title: "实现操作日志记录",
                description:
                  "记录所有关键操作（创建、编辑、删除）的历史日志，支持审计追溯",
                status: "TODO",
                priority: "MEDIUM",
                dueDate: "2026-07-12",
                tags: ["backend", "audit", "logging"],
                assignee: "数据大厨",
                relatedRequirementId: "r9",
                comments: [],
                createdAt: "2026-06-23",
              },
              {
                id: "t15",
                title: "实现单元测试覆盖",
                description:
                  "为任务、需求、Bug等核心功能模块编写单元测试，确保测试覆盖率达标",
                status: "IN_PROGRESS",
                priority: "HIGH",
                dueDate: "2026-07-15",
                tags: ["testing", "unit-test", "qa"],
                assignee: "代码找茬王",
                relatedRequirementId: "r3",
                comments: [],
                createdAt: "2026-06-24",
              },
              {
                id: "t16",
                title: "实现用户权限管理",
                description:
                  "实现基于角色的访问控制(RBAC)，不同角色拥有不同的操作权限",
                status: "TODO",
                priority: "HIGH",
                dueDate: "2026-07-20",
                tags: ["security", "auth", "permissions"],
                assignee: "系统拆弹专家",
                relatedRequirementId: "r7",
                comments: [],
                createdAt: "2026-06-25",
              },
            ]);
          }
        }
      } else {
        setTasks([
          {
            id: "t1",
            title: "搭建项目框架和Next.js配置",
            description:
              "初始化Next.js项目，配置TypeScript、Tailwind CSS和项目目录结构",
            status: "DONE",
            priority: "URGENT",
            dueDate: "2026-06-01",
            tags: ["setup", "nextjs", "typescript"],
            assignee: "数据大厨",
            relatedRequirementId: "r1",
            comments: [],
            createdAt: "2026-06-01",
          },
          {
            id: "t2",
            title: "实现Task Board看板页面",
            description:
              "开发任务看板主页面，包含TODO/IN_PROGRESS/DONE三列布局",
            status: "DONE",
            priority: "URGENT",
            dueDate: "2026-06-05",
            tags: ["frontend", "kanban", "ui"],
            assignee: "像素魔法师",
            relatedRequirementId: "r1",
            comments: [],
            createdAt: "2026-06-03",
          },
          {
            id: "t3",
            title: "实现任务拖拽功能",
            description:
              "集成@hello-pangea/dnd实现任务卡片在状态列之间拖拽移动",
            status: "DONE",
            priority: "URGENT",
            dueDate: "2026-06-08",
            tags: ["frontend", "drag-drop", "interaction"],
            assignee: "像素魔法师",
            relatedRequirementId: "r1",
            comments: [],
            createdAt: "2026-06-05",
          },
          {
            id: "t4",
            title: "实现任务创建/编辑表单",
            description:
              "开发任务创建和编辑的模态框表单，支持标题、描述、优先级、标签和截止日期",
            status: "DONE",
            priority: "URGENT",
            dueDate: "2026-06-10",
            tags: ["frontend", "form", "modal"],
            assignee: "像素魔法师",
            relatedRequirementId: "r1",
            comments: [],
            createdAt: "2026-06-07",
          },
          {
            id: "t5",
            title: "实现任务搜索和筛选",
            description: "实现任务列表的搜索、按状态筛选和按优先级排序功能",
            status: "DONE",
            priority: "HIGH",
            dueDate: "2026-06-12",
            tags: ["frontend", "search", "filter"],
            assignee: "数据大厨",
            relatedRequirementId: "r1",
            comments: [],
            createdAt: "2026-06-09",
          },
          {
            id: "t6",
            title: "实现Requirement管理页面",
            description:
              "开发需求管理页面，支持需求的创建、编辑、删除和状态跟踪",
            status: "DONE",
            priority: "URGENT",
            dueDate: "2026-06-15",
            tags: ["frontend", "requirement", "management"],
            assignee: "像素魔法师",
            relatedRequirementId: "r2",
            comments: [],
            createdAt: "2026-06-09",
          },
          {
            id: "t7",
            title: "实现Test Case管理页面",
            description:
              "开发测试用例管理页面，支持测试用例的创建、执行和状态管理",
            status: "DONE",
            priority: "HIGH",
            dueDate: "2026-06-18",
            tags: ["frontend", "testing", "qa"],
            assignee: "像素魔法师",
            relatedRequirementId: "r3",
            comments: [],
            createdAt: "2026-06-11",
          },
          {
            id: "t8",
            title: "实现Agent工作流可视化（React Flow）",
            description:
              "使用React Flow实现智能体工作流的可视化展示，支持节点动画和状态流转",
            status: "DONE",
            priority: "HIGH",
            dueDate: "2026-06-20",
            tags: ["frontend", "react-flow", "visualization"],
            assignee: "配色狂魔",
            relatedRequirementId: "r4",
            comments: [],
            createdAt: "2026-06-13",
          },
          {
            id: "t9",
            title: "实现Bug Tracker页面",
            description:
              "开发Bug跟踪页面，实现Bug的提交、分配、修复和验证闭环管理",
            status: "DONE",
            priority: "HIGH",
            dueDate: "2026-06-22",
            tags: ["frontend", "bug", "tracking"],
            assignee: "像素魔法师",
            relatedRequirementId: "r5",
            comments: [],
            createdAt: "2026-06-15",
          },
          {
            id: "t10",
            title: "实现Goal Tracker页面",
            description: "开发目标跟踪页面，支持OKR目标创建和进度跟踪",
            status: "IN_PROGRESS",
            priority: "HIGH",
            dueDate: "2026-07-05",
            tags: ["frontend", "goal", "okr"],
            assignee: "数据大厨",
            relatedRequirementId: "r6",
            comments: [],
            createdAt: "2026-06-17",
          },
          {
            id: "t11",
            title: "实现Timeline View页面",
            description: "开发时间线甘特图视图，展示任务和目标的时序关系",
            status: "IN_PROGRESS",
            priority: "MEDIUM",
            dueDate: "2026-07-08",
            tags: ["frontend", "timeline", "gantt"],
            assignee: "配色狂魔",
            relatedRequirementId: "r6",
            comments: [],
            createdAt: "2026-06-19",
          },
          {
            id: "t12",
            title: "实现数据加密存储",
            description:
              "使用AES-GCM算法对localStorage中的数据进行加密存储，确保数据安全",
            status: "DONE",
            priority: "HIGH",
            dueDate: "2026-06-24",
            tags: ["security", "encryption", "backend"],
            assignee: "数据大厨",
            relatedRequirementId: "r7",
            comments: [],
            createdAt: "2026-06-20",
          },
          {
            id: "t13",
            title: "实现响应式布局适配",
            description:
              "适配移动端和桌面端不同屏幕尺寸，确保所有页面在多种设备上显示正常",
            status: "DONE",
            priority: "MEDIUM",
            dueDate: "2026-06-26",
            tags: ["frontend", "responsive", "ui"],
            assignee: "配色狂魔",
            relatedRequirementId: "r8",
            comments: [],
            createdAt: "2026-06-21",
          },
          {
            id: "t14",
            title: "实现操作日志记录",
            description:
              "记录所有关键操作（创建、编辑、删除）的历史日志，支持审计追溯",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: "2026-07-12",
            tags: ["backend", "audit", "logging"],
            assignee: "数据大厨",
            relatedRequirementId: "r9",
            comments: [],
            createdAt: "2026-06-23",
          },
          {
            id: "t15",
            title: "实现单元测试覆盖",
            description:
              "为任务、需求、Bug等核心功能模块编写单元测试，确保测试覆盖率达标",
            status: "IN_PROGRESS",
            priority: "HIGH",
            dueDate: "2026-07-15",
            tags: ["testing", "unit-test", "qa"],
            assignee: "代码找茬王",
            relatedRequirementId: "r3",
            comments: [],
            createdAt: "2026-06-24",
          },
          {
            id: "t16",
            title: "实现用户权限管理",
            description:
              "实现基于角色的访问控制(RBAC)，不同角色拥有不同的操作权限",
            status: "TODO",
            priority: "HIGH",
            dueDate: "2026-07-20",
            tags: ["security", "auth", "permissions"],
            assignee: "系统拆弹专家",
            relatedRequirementId: "r7",
            comments: [],
            createdAt: "2026-06-25",
          },
        ]);
      }

      if (savedRequirements) {
        const decrypted = await decryptData<Requirement[]>(savedRequirements);
        if (cancelled) return;
        if (decrypted) {
          setRequirements(decrypted);
        } else {
          try {
            setRequirements(JSON.parse(savedRequirements));
          } catch {
            setRequirements([
              {
                id: "r1",
                title: "任务看板功能",
                description:
                  "实现可视化的任务管理看板，支持任务创建、拖拽、搜索和筛选",
                priority: "CRITICAL",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "支持三列看板布局（TODO/IN_PROGRESS/DONE）",
                  "支持任务拖拽变更状态",
                  "支持任务创建和编辑表单",
                  "支持任务搜索和按状态筛选",
                ],
                createdAt: "2026-06-01",
                updatedAt: "2026-06-12",
                requester: "需求粉碎机",
                executor: "像素魔法师",
              },
              {
                id: "r2",
                title: "需求管理功能",
                description:
                  "实现需求的创建、编辑和状态跟踪，支持完整的需求生命周期管理",
                priority: "CRITICAL",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "支持需求的创建和编辑",
                  "支持需求状态流转（DRAFT→REVIEW→APPROVED→IMPLEMENTED）",
                  "支持需求关联任务",
                ],
                createdAt: "2026-06-10",
                updatedAt: "2026-06-15",
                requester: "需求粉碎机",
                executor: "像素魔法师",
              },
              {
                id: "r3",
                title: "测试用例管理",
                description: "实现测试用例的创建和管理，支持测试执行和结果跟踪",
                priority: "HIGH",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "支持测试用例的创建和编辑",
                  "支持测试步骤和预期结果管理",
                  "支持测试用例关联需求",
                  "支持测试执行状态标记",
                ],
                createdAt: "2026-06-14",
                updatedAt: "2026-06-18",
                requester: "代码找茬王",
                executor: "像素魔法师",
              },
              {
                id: "r4",
                title: "多智能体工作流可视化",
                description:
                  "使用React Flow实现动态流程图，展示智能体工作流的状态和节点关系",
                priority: "HIGH",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "支持节点拖拽和布局",
                  "支持节点状态动画",
                  "支持工作流启动和流动效果",
                  "支持节点间连接线渲染",
                ],
                createdAt: "2026-06-16",
                updatedAt: "2026-06-20",
                requester: "系统拆弹专家",
                executor: "配色狂魔",
              },
              {
                id: "r5",
                title: "Bug跟踪系统",
                description:
                  "实现Bug的提交、分配、修复和验证闭环，构建完整的Bug生命周期管理",
                priority: "HIGH",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "支持Bug提交和详细描述",
                  "支持Bug分配给负责人",
                  "支持Bug状态流转（REPORTED→ASSIGNED→IN_PROGRESS→RESOLVED→VERIFIED→CLOSED）",
                  "支持Bug评论和修复记录",
                ],
                createdAt: "2026-06-18",
                updatedAt: "2026-06-22",
                requester: "Bug猎手",
                executor: "像素魔法师",
              },
              {
                id: "r6",
                title: "目标管理和时间线",
                description:
                  "实现OKR目标跟踪和时间线甘特图，支持目标进度可视化和时序规划",
                priority: "HIGH",
                status: "APPROVED",
                acceptanceCriteria: [
                  "支持OKR目标创建和进度跟踪",
                  "支持目标关联任务和需求",
                  "支持时间线甘特图展示",
                  "支持目标进度自动计算",
                ],
                createdAt: "2026-06-25",
                updatedAt: "2026-07-03",
                requester: "需求粉碎机",
                executor: "数据大厨",
              },
              {
                id: "r7",
                title: "数据安全与加密",
                description:
                  "实现localStorage数据加密存储，使用AES-GCM算法确保数据安全，支持用户权限管理",
                priority: "CRITICAL",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "所有持久化数据使用AES-GCM加密",
                  "支持用户登录认证",
                  "支持基于角色的权限控制",
                  "加密密钥安全管理",
                ],
                createdAt: "2026-06-20",
                updatedAt: "2026-06-24",
                requester: "规矩守护者",
                executor: "数据大厨",
              },
              {
                id: "r8",
                title: "响应式设计",
                description:
                  "支持多屏幕尺寸自适应，确保在桌面端和移动端都有良好的用户体验",
                priority: "MEDIUM",
                status: "IMPLEMENTED",
                acceptanceCriteria: [
                  "所有页面支持桌面端（≥1024px）",
                  "所有页面支持平板端（768px-1023px）",
                  "所有页面支持手机端（<768px）",
                  "布局和交互在不同屏幕尺寸下保持一致",
                ],
                createdAt: "2026-06-22",
                updatedAt: "2026-06-26",
                requester: "配色狂魔",
                executor: "配色狂魔",
              },
              {
                id: "r9",
                title: "操作审计日志",
                description: "记录所有关键操作的历史，支持操作追溯和审计审查",
                priority: "MEDIUM",
                status: "DRAFT",
                acceptanceCriteria: [
                  "记录任务创建、编辑、删除操作",
                  "记录需求状态变更",
                  "记录Bug修复和验证操作",
                  "日志支持按操作类型和时间筛选",
                ],
                createdAt: "2026-07-01",
                updatedAt: "2026-07-01",
                requester: "规矩守护者",
                executor: "系统拆弹专家",
              },
              {
                id: "r10",
                title: "ISO/IEC 25010 数据完整性校验",
                description: "依据ISO/IEC 25010:2023功能适用性-正确性要求，对所有用户输入进行完整的数据校验，确保数据完整性和准确性",
                priority: "CRITICAL",
                status: "DRAFT",
                acceptanceCriteria: [
                  "所有表单输入框实施必填校验和格式校验，前端即时反馈",
                  "数值输入框实施边界值校验（最小值/最大值/0值/负数）",
                  "文本输入框实施长度限制和特殊字符过滤（XSS/注入防护）",
                  "非法输入提供明确的错误提示，不静默失败，指出修正方向",
                  "所有校验逻辑统一管理，可复用可测试，避免重复代码",
                  "服务端API层对所有输入数据进行二次校验，不可仅依赖前端校验",
                  "跨字段逻辑校验：日期范围合法性、状态流转规则一致性",
                  "业务规则校验：引用完整性、状态机流转合规性、数据一致性",
                  "密码和敏感字段禁止在日志及错误提示中明文回显",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "代码找茬王",
              },
              {
                id: "r11",
                title: "WCAG 2.1 AA 可访问性合规",
                description: "依据ISO/IEC 25010:2023交互能力-包容性要求及WCAG 2.1 AA标准，确保系统对残障用户可用，符合无障碍设计规范",
                priority: "HIGH",
                status: "DRAFT",
                acceptanceCriteria: [
                  "所有交互元素支持键盘导航（Tab/Enter/Escape），操作顺序符合视觉逻辑",
                  "所有图标和图片提供 aria-label 文本描述，装饰性图片标记为 aria-hidden",
                  "色彩对比度满足 WCAG AA 标准（正常文本≥4.5:1，大文本≥3:1，非文本≥3:1）",
                  "表单元素关联 label 标签，错误提示关联 aria-describedby，支持屏幕阅读器",
                  "页面支持 200% 缩放不失布局，320px 宽度无水平滚动（内容回流）",
                  "键盘焦点可见指示器：所有可聚焦元素有明显的焦点轮廓（≥2px）",
                  "无键盘陷阱：键盘焦点可移入和移出所有模态框、下拉菜单等交互组件",
                  "提供「跳过导航」链接（Skip to Content），支持键盘快速跳转到主内容",
                  "使用语义化HTML结构（header, nav, main, footer, h1-h6层级正确）",
                  "表单验证失败时提供具体的错误修正建议，状态消息通过 ARIA live regions 通知",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "配色狂魔",
              },
              {
                id: "r12",
                title: "IEEE 829 测试文档标准化",
                description: "依据IEEE 829-2008标准，建立标准化的测试文档体系，包括测试计划、测试用例、测试记录和测试报告",
                priority: "HIGH",
                status: "DRAFT",
                acceptanceCriteria: [
                  "测试用例模板包含：用例ID、测试目标、前置条件、测试步骤、预期结果",
                  "测试执行记录包含：执行人、执行时间、实际结果、通过/失败状态",
                  "测试报告包含：测试覆盖率、通过率、缺陷统计、风险评估",
                  "测试用例与需求建立双向追溯矩阵，覆盖率可量化追踪",
                  "支持测试用例的导入/导出（CSV格式），兼容主流测试管理工具",
                  "测试计划模板：测试策略、范围、资源、进度、风险、准入/准出标准",
                  "异常报告模板：测试环境、严重程度、复现步骤、影响分析、建议修复方案",
                  "测试环境规格说明：硬件配置、软件版本、网络拓扑、测试数据集",
                  "测试文档版本控制：支持变更历史追溯和基线管理",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "Bug猎手",
                executor: "Bug猎手",
              },
              {
                id: "r13",
                title: "IEEE 1044 Bug分类标准对齐",
                description: "依据IEEE 1044-2009软件异常分类标准，规范Bug的严重性、优先级和生命周期分类体系",
                priority: "HIGH",
                status: "DRAFT",
                acceptanceCriteria: [
                  "Bug严重性（Severity）四级分类与IEEE 1044标准对齐：CRITICAL/HIGH/MEDIUM/LOW",
                  "Bug优先级（Priority）与Severity独立为两个维度：Severity描述技术影响，Priority描述业务紧迫性",
                  "Bug生命周期状态完整覆盖：REPORTED→ASSIGNED→IN_PROGRESS→RESOLVED→VERIFIED→CLOSED/REOPENED",
                  "异常类型（Type）分类：Logic/Computation/Interface/Data，覆盖所有缺陷类别",
                  "根因分类（Root Cause）和解决方案分类（Resolution）字段独立记录，支持统计分析",
                  "Bug分类维度包含：产生阶段（需求/设计/编码/测试）、影响范围、复现概率",
                  "支持Bug与需求/任务的关联追溯，构建缺陷关系图谱",
                  "Bug指标统计：缺陷密度、修复率、重开率、平均修复时间实时计算",
                  "支持Bug批量操作（批量更新状态、批量分配）和关联关系可视化",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "Bug猎手",
                executor: "像素魔法师",
              },
              {
                id: "r14",
                title: "GB/T 15532 软件测试规范",
                description: "依据GB/T 15532-2008《计算机软件测试规范》国家标准，建立符合中国标准的测试管理体系",
                priority: "MEDIUM",
                status: "DRAFT",
                acceptanceCriteria: [
                  "测试级别覆盖：单元测试、集成测试、系统测试、验收测试",
                  "测试类型覆盖：功能测试、性能测试、安全性测试、兼容性测试",
                  "测试管理流程：测试策划→测试设计→测试执行→测试评估",
                  "缺陷管理按严重等级分级处理，致命缺陷要求24小时内修复",
                  "测试过程文档符合GB/T 15532的文档结构要求",
                  "测试资源规划：明确测试人员角色、测试环境配置、测试工具清单",
                  "测试风险管理：识别测试风险、评估影响程度、制定缓解措施",
                  "回归测试策略：定义回归测试触发条件（代码变更/配置变更）和测试范围",
                  "测试退出量化标准：缺陷发现率≤1个/天，用例通过率≥95%，无遗留致命与严重缺陷",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "Bug猎手",
              },
              {
                id: "r15",
                title: "GB/T 25000.51 质量评价体系",
                description: "依据GB/T 25000.51-2016《系统与软件质量要求和评价》标准，建立八大质量特性的评价指标和测试方法",
                priority: "HIGH",
                status: "DRAFT",
                acceptanceCriteria: [
                  "功能性评价：核心功能完整率≥95%，功能正确率≥99%",
                  "性能效率评价：页面加载时间≤2秒，操作响应时间≤200ms",
                  "可靠性评价：系统可用性≥99.5%，MTBF≥3600秒",
                  "易用性评价：用户操作完成率≥90%，平均学习时间≤30分钟",
                  "信息安全性评价：敏感数据加密存储率100%，安全漏洞修复率100%",
                  "兼容性评价：主流浏览器（Chrome/Firefox/Safari/Edge）功能一致性≥95%",
                  "维护性评价：模块化程度（内聚度≥0.7，耦合度≤0.3）、可复用性和可分析性指标",
                  "可移植性评价：支持Windows/macOS/Linux跨平台运行，移动端响应式适配",
                  "并发性能指标：50并发用户时页面加载≤3秒，事务成功率≥99%",
                  "使用质量评价：任务有效性≥90%，用户效率≥85%，满意度评分≥4.0/5.0",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "代码找茬王",
              },
              {
                id: "r16",
                title: "GDPR 数据隐私合规",
                description: "依据EU GDPR条例，确保系统对用户个人数据的收集、存储、处理和删除满足欧洲数据保护法规要求",
                priority: "CRITICAL",
                status: "DRAFT",
                acceptanceCriteria: [
                  "数据收集前获取用户明确同意（opt-in），提供清晰的隐私政策说明",
                  "实施数据最小化原则：仅收集业务必需的个人数据字段，定期审查数据收集范围",
                  "支持用户数据访问权：用户可导出全部个人数据（JSON格式），响应时限≤30天",
                  "支持用户删除权（被遗忘权）：用户可一键删除所有个人数据，级联清除关联数据",
                  "数据传输使用加密（TLS 1.3+），静态数据使用AES-256-GCM加密，密钥与数据分离存储",
                  "数据泄露通知机制：确认泄露后72小时内向监管机构报告并通知受影响用户",
                  "数据保留策略：定义各类数据保留期限，到期自动删除或匿名化处理",
                  "数据处理活动记录（ROPA）：记录处理目的、数据类别、接收方、跨境传输、保留期限",
                  "隐私设计原则（Privacy by Design & Default）：默认隐私保护设置，隐私控制嵌入产品设计",
                  "支持用户更正权、限制处理权、反对权：提供自助操作入口，15天内响应",
                  "提供同意撤回机制：用户可随时撤回已授予的数据处理同意，撤回后停止相应处理",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "数据大厨",
              },
              {
                id: "r17",
                title: "ISO/IEC 27001 信息安全审计",
                description: "依据ISO/IEC 27001:2022信息安全管理体系标准，建立完整的操作审计日志、访问控制和事件响应机制",
                priority: "CRITICAL",
                status: "DRAFT",
                acceptanceCriteria: [
                  "所有CRUD操作记录完整审计日志：操作人、操作时间、操作类型、操作对象、变更前后数据",
                  "审计日志防篡改：日志写入后不可修改或删除，支持哈希校验完整性",
                  "实现基于角色的访问控制（RBAC）：管理员/开发者/测试者/查看者四角色权限模型",
                  "敏感操作需二次确认（如批量删除、数据导出、权限变更）",
                  "日志保留期≥90天，支持按时间范围、操作类型、操作人筛选检索",
                  "信息安全事件响应程序：检测→报告→响应→恢复，各环节定义SLA时限",
                  "密码策略：最小长度12位，含大小写字母+数字+特殊字符，90天轮换，5次失败锁定30分钟",
                  "会话管理：15分钟无操作自动超时，同账号并发会话≤3个，安全登出清除所有会话令牌",
                  "漏洞管理流程：每季度执行漏洞扫描，高危漏洞30天内修复，修复后验证",
                  "安全监控与实时告警：异常登录、批量操作、权限变更触发告警通知",
                  "访问权限定期审查：每季度审查用户权限，遵循最小权限原则，回收冗余权限",
                ],
                createdAt: "2026-07-08",
                updatedAt: "2026-07-09",
                requester: "规矩守护者",
                executor: "系统拆弹专家",
              },
            ]);
          }
        }
      } else {
        setRequirements([
          {
            id: "r1",
            title: "任务看板功能",
            description:
              "实现可视化的任务管理看板，支持任务创建、拖拽、搜索和筛选",
            priority: "CRITICAL",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "支持三列看板布局（TODO/IN_PROGRESS/DONE）",
              "支持任务拖拽变更状态",
              "支持任务创建和编辑表单",
              "支持任务搜索和按状态筛选",
            ],
            createdAt: "2026-06-01",
            updatedAt: "2026-06-12",
            requester: "需求粉碎机",
            executor: "像素魔法师",
          },
          {
            id: "r2",
            title: "需求管理功能",
            description:
              "实现需求的创建、编辑和状态跟踪，支持完整的需求生命周期管理",
            priority: "CRITICAL",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "支持需求的创建和编辑",
              "支持需求状态流转（DRAFT→REVIEW→APPROVED→IMPLEMENTED）",
              "支持需求关联任务",
            ],
            createdAt: "2026-06-10",
            updatedAt: "2026-06-15",
            requester: "需求粉碎机",
            executor: "像素魔法师",
          },
          {
            id: "r3",
            title: "测试用例管理",
            description: "实现测试用例的创建和管理，支持测试执行和结果跟踪",
            priority: "HIGH",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "支持测试用例的创建和编辑",
              "支持测试步骤和预期结果管理",
              "支持测试用例关联需求",
              "支持测试执行状态标记",
            ],
            createdAt: "2026-06-14",
            updatedAt: "2026-06-18",
            requester: "代码找茬王",
            executor: "像素魔法师",
          },
          {
            id: "r4",
            title: "多智能体工作流可视化",
            description:
              "使用React Flow实现动态流程图，展示智能体工作流的状态和节点关系",
            priority: "HIGH",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "支持节点拖拽和布局",
              "支持节点状态动画",
              "支持工作流启动和流动效果",
              "支持节点间连接线渲染",
            ],
            createdAt: "2026-06-16",
            updatedAt: "2026-06-20",
            requester: "系统拆弹专家",
            executor: "配色狂魔",
          },
          {
            id: "r5",
            title: "Bug跟踪系统",
            description:
              "实现Bug的提交、分配、修复和验证闭环，构建完整的Bug生命周期管理",
            priority: "HIGH",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "支持Bug提交和详细描述",
              "支持Bug分配给负责人",
              "支持Bug状态流转（REPORTED→ASSIGNED→IN_PROGRESS→RESOLVED→VERIFIED→CLOSED）",
              "支持Bug评论和修复记录",
            ],
            createdAt: "2026-06-18",
            updatedAt: "2026-06-22",
            requester: "Bug猎手",
            executor: "像素魔法师",
          },
          {
            id: "r6",
            title: "目标管理和时间线",
            description:
              "实现OKR目标跟踪和时间线甘特图，支持目标进度可视化和时序规划",
            priority: "HIGH",
            status: "APPROVED",
            acceptanceCriteria: [
              "支持OKR目标创建和进度跟踪",
              "支持目标关联任务和需求",
              "支持时间线甘特图展示",
              "支持目标进度自动计算",
            ],
            createdAt: "2026-06-25",
            updatedAt: "2026-07-03",
            requester: "需求粉碎机",
            executor: "数据大厨",
          },
          {
            id: "r7",
            title: "数据安全与加密",
            description:
              "实现localStorage数据加密存储，使用AES-GCM算法确保数据安全，支持用户权限管理",
            priority: "CRITICAL",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "所有持久化数据使用AES-GCM加密",
              "支持用户登录认证",
              "支持基于角色的权限控制",
              "加密密钥安全管理",
            ],
            createdAt: "2026-06-20",
            updatedAt: "2026-06-24",
            requester: "规矩守护者",
            executor: "数据大厨",
          },
          {
            id: "r8",
            title: "响应式设计",
            description:
              "支持多屏幕尺寸自适应，确保在桌面端和移动端都有良好的用户体验",
            priority: "MEDIUM",
            status: "IMPLEMENTED",
            acceptanceCriteria: [
              "所有页面支持桌面端（≥1024px）",
              "所有页面支持平板端（768px-1023px）",
              "所有页面支持手机端（<768px）",
              "布局和交互在不同屏幕尺寸下保持一致",
            ],
            createdAt: "2026-06-22",
            updatedAt: "2026-06-26",
            requester: "配色狂魔",
            executor: "配色狂魔",
          },
          {
            id: "r9",
            title: "操作审计日志",
            description: "记录所有关键操作的历史，支持操作追溯和审计审查",
            priority: "MEDIUM",
            status: "DRAFT",
            acceptanceCriteria: [
              "记录任务创建、编辑、删除操作",
              "记录需求状态变更",
              "记录Bug修复和验证操作",
              "日志支持按操作类型和时间筛选",
            ],
            createdAt: "2026-07-01",
            updatedAt: "2026-07-01",
            requester: "规矩守护者",
            executor: "系统拆弹专家",
          },
          {
            id: "r10",
            title: "ISO/IEC 25010 数据完整性校验",
            description: "依据ISO/IEC 25010:2023功能适用性-正确性要求，对所有用户输入进行完整的数据校验，确保数据完整性和准确性",
            priority: "CRITICAL",
            status: "DRAFT",
            acceptanceCriteria: [
              "所有表单输入框实施必填校验和格式校验，前端即时反馈",
              "数值输入框实施边界值校验（最小值/最大值/0值/负数）",
              "文本输入框实施长度限制和特殊字符过滤（XSS/注入防护）",
              "非法输入提供明确的错误提示，不静默失败，指出修正方向",
              "所有校验逻辑统一管理，可复用可测试，避免重复代码",
              "服务端API层对所有输入数据进行二次校验，不可仅依赖前端校验",
              "跨字段逻辑校验：日期范围合法性、状态流转规则一致性",
              "业务规则校验：引用完整性、状态机流转合规性、数据一致性",
              "密码和敏感字段禁止在日志及错误提示中明文回显",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "代码找茬王",
          },
          {
            id: "r11",
            title: "WCAG 2.1 AA 可访问性合规",
            description: "依据ISO/IEC 25010:2023交互能力-包容性要求及WCAG 2.1 AA标准，确保系统对残障用户可用，符合无障碍设计规范",
            priority: "HIGH",
            status: "DRAFT",
            acceptanceCriteria: [
              "所有交互元素支持键盘导航（Tab/Enter/Escape），操作顺序符合视觉逻辑",
              "所有图标和图片提供 aria-label 文本描述，装饰性图片标记为 aria-hidden",
              "色彩对比度满足 WCAG AA 标准（正常文本≥4.5:1，大文本≥3:1，非文本≥3:1）",
              "表单元素关联 label 标签，错误提示关联 aria-describedby，支持屏幕阅读器",
              "页面支持 200% 缩放不失布局，320px 宽度无水平滚动（内容回流）",
              "键盘焦点可见指示器：所有可聚焦元素有明显的焦点轮廓（≥2px）",
              "无键盘陷阱：键盘焦点可移入和移出所有模态框、下拉菜单等交互组件",
              "提供「跳过导航」链接（Skip to Content），支持键盘快速跳转到主内容",
              "使用语义化HTML结构（header, nav, main, footer, h1-h6层级正确）",
              "表单验证失败时提供具体的错误修正建议，状态消息通过 ARIA live regions 通知",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "配色狂魔",
          },
          {
            id: "r12",
            title: "IEEE 829 测试文档标准化",
            description: "依据IEEE 829-2008标准，建立标准化的测试文档体系，包括测试计划、测试用例、测试记录和测试报告",
            priority: "HIGH",
            status: "DRAFT",
            acceptanceCriteria: [
              "测试用例模板包含：用例ID、测试目标、前置条件、测试步骤、预期结果",
              "测试执行记录包含：执行人、执行时间、实际结果、通过/失败状态",
              "测试报告包含：测试覆盖率、通过率、缺陷统计、风险评估",
              "测试用例与需求建立双向追溯矩阵，覆盖率可量化追踪",
              "支持测试用例的导入/导出（CSV格式），兼容主流测试管理工具",
              "测试计划模板：测试策略、范围、资源、进度、风险、准入/准出标准",
              "异常报告模板：测试环境、严重程度、复现步骤、影响分析、建议修复方案",
              "测试环境规格说明：硬件配置、软件版本、网络拓扑、测试数据集",
              "测试文档版本控制：支持变更历史追溯和基线管理",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "Bug猎手",
            executor: "Bug猎手",
          },
          {
            id: "r13",
            title: "IEEE 1044 Bug分类标准对齐",
            description: "依据IEEE 1044-2009软件异常分类标准，规范Bug的严重性、优先级和生命周期分类体系",
            priority: "HIGH",
            status: "DRAFT",
            acceptanceCriteria: [
              "Bug严重性（Severity）四级分类与IEEE 1044标准对齐：CRITICAL/HIGH/MEDIUM/LOW",
              "Bug优先级（Priority）与Severity独立为两个维度：Severity描述技术影响，Priority描述业务紧迫性",
              "Bug生命周期状态完整覆盖：REPORTED→ASSIGNED→IN_PROGRESS→RESOLVED→VERIFIED→CLOSED/REOPENED",
              "异常类型（Type）分类：Logic/Computation/Interface/Data，覆盖所有缺陷类别",
              "根因分类（Root Cause）和解决方案分类（Resolution）字段独立记录，支持统计分析",
              "Bug分类维度包含：产生阶段（需求/设计/编码/测试）、影响范围、复现概率",
              "支持Bug与需求/任务的关联追溯，构建缺陷关系图谱",
              "Bug指标统计：缺陷密度、修复率、重开率、平均修复时间实时计算",
              "支持Bug批量操作（批量更新状态、批量分配）和关联关系可视化",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "Bug猎手",
            executor: "像素魔法师",
          },
          {
            id: "r14",
            title: "GB/T 15532 软件测试规范",
            description: "依据GB/T 15532-2008《计算机软件测试规范》国家标准，建立符合中国标准的测试管理体系",
            priority: "MEDIUM",
            status: "DRAFT",
            acceptanceCriteria: [
              "测试级别覆盖：单元测试、集成测试、系统测试、验收测试",
              "测试类型覆盖：功能测试、性能测试、安全性测试、兼容性测试",
              "测试管理流程：测试策划→测试设计→测试执行→测试评估",
              "缺陷管理按严重等级分级处理，致命缺陷要求24小时内修复",
              "测试过程文档符合GB/T 15532的文档结构要求",
              "测试资源规划：明确测试人员角色、测试环境配置、测试工具清单",
              "测试风险管理：识别测试风险、评估影响程度、制定缓解措施",
              "回归测试策略：定义回归测试触发条件（代码变更/配置变更）和测试范围",
              "测试退出量化标准：缺陷发现率≤1个/天，用例通过率≥95%，无遗留致命与严重缺陷",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "Bug猎手",
          },
          {
            id: "r15",
            title: "GB/T 25000.51 质量评价体系",
            description: "依据GB/T 25000.51-2016《系统与软件质量要求和评价》标准，建立八大质量特性的评价指标和测试方法",
            priority: "HIGH",
            status: "DRAFT",
            acceptanceCriteria: [
              "功能性评价：核心功能完整率≥95%，功能正确率≥99%",
              "性能效率评价：页面加载时间≤2秒，操作响应时间≤200ms",
              "可靠性评价：系统可用性≥99.5%，MTBF≥3600秒",
              "易用性评价：用户操作完成率≥90%，平均学习时间≤30分钟",
              "信息安全性评价：敏感数据加密存储率100%，安全漏洞修复率100%",
              "兼容性评价：主流浏览器（Chrome/Firefox/Safari/Edge）功能一致性≥95%",
              "维护性评价：模块化程度（内聚度≥0.7，耦合度≤0.3）、可复用性和可分析性指标",
              "可移植性评价：支持Windows/macOS/Linux跨平台运行，移动端响应式适配",
              "并发性能指标：50并发用户时页面加载≤3秒，事务成功率≥99%",
              "使用质量评价：任务有效性≥90%，用户效率≥85%，满意度评分≥4.0/5.0",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "代码找茬王",
          },
          {
            id: "r16",
            title: "GDPR 数据隐私合规",
            description: "依据EU GDPR条例，确保系统对用户个人数据的收集、存储、处理和删除满足欧洲数据保护法规要求",
            priority: "CRITICAL",
            status: "DRAFT",
            acceptanceCriteria: [
              "数据收集前获取用户明确同意（opt-in），提供清晰的隐私政策说明",
              "实施数据最小化原则：仅收集业务必需的个人数据字段，定期审查数据收集范围",
              "支持用户数据访问权：用户可导出全部个人数据（JSON格式），响应时限≤30天",
              "支持用户删除权（被遗忘权）：用户可一键删除所有个人数据，级联清除关联数据",
              "数据传输使用加密（TLS 1.3+），静态数据使用AES-256-GCM加密，密钥与数据分离存储",
              "数据泄露通知机制：确认泄露后72小时内向监管机构报告并通知受影响用户",
              "数据保留策略：定义各类数据保留期限，到期自动删除或匿名化处理",
              "数据处理活动记录（ROPA）：记录处理目的、数据类别、接收方、跨境传输、保留期限",
              "隐私设计原则（Privacy by Design & Default）：默认隐私保护设置，隐私控制嵌入产品设计",
              "支持用户更正权、限制处理权、反对权：提供自助操作入口，15天内响应",
              "提供同意撤回机制：用户可随时撤回已授予的数据处理同意，撤回后停止相应处理",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "数据大厨",
          },
          {
            id: "r17",
            title: "ISO/IEC 27001 信息安全审计",
            description: "依据ISO/IEC 27001:2022信息安全管理体系标准，建立完整的操作审计日志、访问控制和事件响应机制",
            priority: "CRITICAL",
            status: "DRAFT",
            acceptanceCriteria: [
              "所有CRUD操作记录完整审计日志：操作人、操作时间、操作类型、操作对象、变更前后数据",
              "审计日志防篡改：日志写入后不可修改或删除，支持哈希校验完整性",
              "实现基于角色的访问控制（RBAC）：管理员/开发者/测试者/查看者四角色权限模型",
              "敏感操作需二次确认（如批量删除、数据导出、权限变更）",
              "日志保留期≥90天，支持按时间范围、操作类型、操作人筛选检索",
              "信息安全事件响应程序：检测→报告→响应→恢复，各环节定义SLA时限",
              "密码策略：最小长度12位，含大小写字母+数字+特殊字符，90天轮换，5次失败锁定30分钟",
              "会话管理：15分钟无操作自动超时，同账号并发会话≤3个，安全登出清除所有会话令牌",
              "漏洞管理流程：每季度执行漏洞扫描，高危漏洞30天内修复，修复后验证",
              "安全监控与实时告警：异常登录、批量操作、权限变更触发告警通知",
              "访问权限定期审查：每季度审查用户权限，遵循最小权限原则，回收冗余权限",
            ],
            createdAt: "2026-07-08",
            updatedAt: "2026-07-09",
            requester: "规矩守护者",
            executor: "系统拆弹专家",
          },
        ]);
      }

      if (savedTestCases) {
        const decrypted = await decryptData<TestCase[]>(savedTestCases);
        if (cancelled) return;
        if (decrypted && decrypted.length > 0) {
          setTestCases(decrypted);
        } else {
          try {
            const parsed = JSON.parse(savedTestCases);
            if (parsed && parsed.length > 0) {
              setTestCases(parsed);
            } else {
              setTestCases(getDefaultTestCases());
            }
          } catch {
            setTestCases(getDefaultTestCases());
          }
        }
      } else {
        setTestCases(getDefaultTestCases());
      }

      if (savedTagHistory) {
        const decrypted = await decryptData<string[]>(savedTagHistory);
        if (cancelled) return;
        if (decrypted) {
          setTagHistory(decrypted);
        } else {
          try {
            setTagHistory(JSON.parse(savedTagHistory));
          } catch {
            setTagHistory([
              "design",
              "backend",
              "frontend",
              "database",
              "security",
              "api",
              "infrastructure",
              "performance",
              "optimization",
              "ui",
              "responsive",
              "websocket",
              "user",
              "testing",
              "qa",
            ]);
          }
        }
      } else {
        setTagHistory([
          "design",
          "backend",
          "frontend",
          "database",
          "security",
          "api",
          "infrastructure",
          "performance",
          "optimization",
          "ui",
          "responsive",
          "websocket",
          "user",
          "testing",
          "qa",
        ]);
      }

      const savedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (savedComments) {
        const decrypted = await decryptData<Comment[]>(savedComments);
        if (cancelled) return;
        if (decrypted) {
          setComments(decrypted);
        } else {
          try {
            setComments(JSON.parse(savedComments));
          } catch {
            setComments([]);
          }
        }
      } else {
        setComments([]);
      }

      const savedAgents = localStorage.getItem(STORAGE_KEYS.AGENTS);
      if (savedAgents) {
        const decrypted = await decryptData<Agent[]>(savedAgents);
        if (cancelled) return;
        if (decrypted) {
          setAgents(decrypted);
        } else {
          try {
            setAgents(JSON.parse(savedAgents));
          } catch {
            setAgents(getDefaultAgents());
          }
        }
      } else {
        setAgents(getDefaultAgents());
      }

      const savedAssignments = localStorage.getItem(
        STORAGE_KEYS.AGENT_ASSIGNMENTS
      );
      if (savedAssignments) {
        const decrypted = await decryptData<AgentTaskAssignment[]>(
          savedAssignments
        );
        if (cancelled) return;
        if (decrypted) {
          setAgentAssignments(decrypted);
        } else {
          try {
            setAgentAssignments(JSON.parse(savedAssignments));
          } catch {
            setAgentAssignments([]);
          }
        }
      } else {
        setAgentAssignments([]);
      }

      const savedBugs = localStorage.getItem(STORAGE_KEYS.BUGS);
      if (savedBugs) {
        const decrypted = await decryptData<Bug[]>(savedBugs);
        if (cancelled) return;
        if (decrypted) {
          setBugs(decrypted);
        } else {
          try {
            setBugs(JSON.parse(savedBugs));
          } catch {
            setBugs(getDefaultBugs());
          }
        }
      } else {
        setBugs(getDefaultBugs());
      }

      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) {
        const decrypted = await decryptData<Goal[]>(savedGoals);
        if (cancelled) return;
        if (decrypted) {
          setGoals(decrypted);
        } else {
          try {
            setGoals(JSON.parse(savedGoals));
          } catch {
            setGoals(getDefaultGoals());
          }
        }
      } else {
        setGoals(getDefaultGoals());
      }

      const savedMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (savedMilestones) {
        const decrypted = await decryptData<Milestone[]>(savedMilestones);
        if (cancelled) return;
        if (decrypted) {
          setMilestones(decrypted);
        } else {
          try {
            setMilestones(JSON.parse(savedMilestones));
          } catch {
            setMilestones(getDefaultMilestones());
          }
        }
      } else {
        setMilestones(getDefaultMilestones());
      }

      const savedKeyResults = localStorage.getItem(STORAGE_KEYS.KEY_RESULTS);
      if (savedKeyResults) {
        const decrypted = await decryptData<KeyResult[]>(savedKeyResults);
        if (cancelled) return;
        if (decrypted) {
          setKeyResults(decrypted);
        } else {
          try {
            setKeyResults(JSON.parse(savedKeyResults));
          } catch {
            setKeyResults(getDefaultKeyResults());
          }
        }
      } else {
        setKeyResults(getDefaultKeyResults());
      }

      // Load audit logs (encrypted)
      const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedAuditLogs) {
        const decrypted = await decryptData<AuditLogEntry[]>(savedAuditLogs);
        if (cancelled) return;
        if (decrypted) {
          setAuditLogs(decrypted.slice(0, MAX_AUDIT_LOG_ENTRIES));
        } else {
          try {
            setAuditLogs(JSON.parse(savedAuditLogs).slice(0, MAX_AUDIT_LOG_ENTRIES));
          } catch {
            setAuditLogs([]);
          }
        }
      }

      const hasLocalData = savedTasks || savedRequirements || savedTestCases || savedBugs || savedGoals || savedMilestones || savedKeyResults || savedAgents || savedAuditLogs;
      console.log('[useDataLoader] 数据加载完成:', {
        tasks: savedTasks ? 'localStorage' : 'default',
        requirements: savedRequirements ? 'localStorage' : 'default',
        testCases: savedTestCases ? 'localStorage' : 'default',
        bugs: savedBugs ? 'localStorage' : 'default',
        goals: savedGoals ? 'localStorage' : 'default',
        milestones: savedMilestones ? 'localStorage' : 'default',
        keyResults: savedKeyResults ? 'localStorage' : 'default',
        agents: savedAgents ? 'localStorage' : 'default',
        auditLogs: savedAuditLogs ? 'localStorage' : 'default',
        source: hasLocalData ? 'localStorage' : 'default'
      });
      setIsInitialized(true);
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);
}