"use client";

import { useState, useEffect, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { getAuthState, logoutAndClear, hasPermission, getCurrentUser, type User } from "@/lib/auth";
import { exportUserData, importUserData, deleteAllUserData } from "@/lib/privacy";
import LoginForm from "./components/LoginForm";
import TaskColumn from "./components/TaskColumn";
import RequirementCard from "./components/RequirementCard";
import TestCaseCard from "./components/TestCaseCard";
import Modal from "./components/Modal";
import AgentWorkflow from "./components/AgentWorkflow";
import BugTracker from "./components/BugTracker";
import GoalTracker from "./components/GoalTracker";
import TimelineView from "./components/TimelineView";
import type {
  Task,
  Requirement,
  TestCase,
  FormFields,
  OperationLog,
  Comment,
  Agent,
  AgentTaskAssignment,
  AgentStatus,
  Bug,
  Goal,
  Milestone,
  KeyResult,
  AuditLogEntry,
  AuditAction,
  AuditTarget,
} from "./types";
import { validateDataIntegrity, getValidationSummary } from "@/lib/validation";
import type { ValidationResult } from "./types";
import {
  COLORS,
  STORAGE_KEYS,
  REQUIREMENT_STATUS_LABELS,
  TEST_CASE_STATUS_LABELS,
} from "./constants";
import { useAuth } from "./hooks/useAuth";
import { useWindow } from "./hooks/useWindow";
import { useDataLoader } from "./hooks/useDataLoader";
import { usePersistence } from "./hooks/usePersistence";
import { useValidation } from "./hooks/useValidation";
import {
  isValidTaskStatus,
  isValidTaskPriority,
  isValidRequirementStatus,
  isValidRequirementPriority,
  isValidTestCaseStatus,
} from "./types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [tagHistory, setTagHistory] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [viewMode, setViewMode] = useState<
    | "TASKS"
    | "REQUIREMENTS"
    | "TESTING"
    | "AGENTS"
    | "WORKFLOW"
    | "BUGS"
    | "GOALS"
    | "TIMELINE"
    | "AUDIT"
  >("TASKS");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "task" | "requirement" | "test" | "bug"
  >("task");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);

  const [bugs, setBugs] = useState<Bug[]>([]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  const [formData, setFormData] = useState<FormFields>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    tags: [],
    assignee: "",
    relatedRequirementId: "",
    steps: "",
    expectedResult: "",
    acceptanceCriteria: "",
    requester: "",
    executor: "",
    severity: "",
    bugPriority: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
  });

  const [isDragging, setIsDragging] = useState(false);

  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterAuditAction, setFilterAuditAction] = useState<string>("");
  const [filterAuditTarget, setFilterAuditTarget] = useState<string>("");
  const [filterAuditStartDate, setFilterAuditStartDate] = useState<string>("");
  const [filterAuditEndDate, setFilterAuditEndDate] = useState<string>("");

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (filterAuditAction && log.action !== filterAuditAction) return false;
    if (filterAuditTarget && log.target !== filterAuditTarget) return false;
    if (filterAuditStartDate && log.timestamp < filterAuditStartDate) return false;
    if (filterAuditEndDate) {
      const endDate = new Date(filterAuditEndDate);
      endDate.setDate(endDate.getDate() + 1);
      if (new Date(log.timestamp) >= endDate) return false;
    }
    return true;
  });

  const MAX_AUDIT_LOG_ENTRIES = 1000;

  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentAssignments, setAgentAssignments] = useState<
    AgentTaskAssignment[]
  >([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [agentToAssign, setAgentToAssign] = useState<Agent | null>(null);
  const [recentlyDraggedTaskId, setRecentlyDraggedTaskId] = useState<
    string | null
  >(null);

  const { isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, handleLoginSuccess: _handleLoginSuccess, handleLogout: _handleLogout } = useAuth();

  const { windowWidth, isClient, showPrivacyModal, setShowPrivacyModal, privacyConsented, setPrivacyConsented, effectiveWidth, isSmall, isMedium } = useWindow(setShowModal);

  useDataLoader(setTasks, setRequirements, setTestCases, setBugs, setGoals, setMilestones, setKeyResults, setAgents, setAgentAssignments, setTagHistory, setComments, setAuditLogs, setIsInitialized);

  usePersistence(tasks, requirements, testCases, bugs, goals, milestones, keyResults, tagHistory, comments, agents, agentAssignments, auditLogs, isInitialized, setTagHistory);

  const { validationResults, setValidationResults, showValidationBanner, setShowValidationBanner } = useValidation(isInitialized, tasks, requirements, testCases, bugs, goals, milestones, keyResults, agents, setTasks, setRequirements, setTestCases, setBugs, setGoals, setMilestones, setKeyResults, setAgents);

  const getFontSize = () => {
    if (isSmall) return 0.85;
    if (isMedium) return 0.95;
    return 1;
  };

  const getColumnWidth = () => {
    if (isSmall) return "95%";
    if (isMedium) return "45%";
    return "280px";
  };

  const fontSizeScale = getFontSize();

  const getCommentsByTaskId = (taskId: string): Comment[] => {
    return comments.filter((c) => c.taskId === taskId);
  };

  const handleAddComment = (taskId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      taskId,
      author: currentUser.username || currentUser.email || "Unknown",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), newComment] }
          : t
      )
    );
  };

  const handleDeleteComment = (commentId: string, taskId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: (t.comments || []).filter((c) => c.id !== commentId),
            }
          : t
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesPriority =
      filterPriority === "" || task.priority === filterPriority;
    const matchesAssignee =
      filterAssignee === "" ||
      task.assignee.toLowerCase().includes(filterAssignee.toLowerCase());

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const getFilteredTasksByStatus = (status: Task["status"]): Task[] => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const allAssignees = [...new Set(tasks.map((t) => t.assignee))].filter(
    Boolean
  );

  const handlePrivacyConsent = () => {
    setPrivacyConsented(true);
    setShowPrivacyModal(false);
    localStorage.setItem("jira-clone-privacy-consent", "true");
  };

  const handleRevokeConsent = () => {
    if (
      window.confirm(
        "Revoking consent will delete all your data. This action cannot be undone. Are you sure?"
      )
    ) {
      addAuditLog(
        "CLEAR",
        "SYSTEM",
        "system",
        "Privacy consent revoked - all data cleared",
        currentUser?.username || currentUser?.email || "Unknown"
      );
      logoutAndClear();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setPrivacyConsented(false);
      setShowPrivacyModal(false);
      setTasks([]);
      setRequirements([]);
      setTestCases([]);
      setBugs([]);
      setGoals([]);
      setMilestones([]);
      setKeyResults([]);
      setAuditLogs([]);
      setOperationLogs([]);
      setTagHistory([]);
      setComments([]);
      setAgents([]);
      setAgentAssignments([]);
    }
  };

  const addAuditLog = (
    action: AuditAction,
    target: AuditTarget,
    targetId: string,
    details: string,
    username?: string
  ) => {
    console.log('[addAuditLog] 审计日志:', { action, target, targetId, detail: details, operator: username, timestamp: new Date().toISOString() });
    const currentUser = getCurrentUser();
    const newLog: AuditLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      target,
      targetId,
      details,
      username: username || currentUser?.username || currentUser?.email || "Unknown",
    };
    setAuditLogs((prev) => [newLog, ...prev].slice(0, MAX_AUDIT_LOG_ENTRIES));
  };

  const handleLoginSuccess = () => {
    _handleLoginSuccess();
    const auth = getAuthState();
    addAuditLog(
      "LOGIN",
      "SYSTEM",
      "system",
      `User "${auth.user?.username || auth.user?.email}" logged in`,
      auth.user?.username || auth.user?.email || "Unknown"
    );
  };

  const handleLogout = () => {
    const username = currentUser?.username || currentUser?.email || "Unknown";
    addAuditLog(
      "LOGOUT",
      "SYSTEM",
      "system",
      `User "${username}" logged out`,
      username
    );
    _handleLogout();
  };

  const handleExportData = () => {
    exportUserData();
    addAuditLog(
      "EXPORT",
      "SYSTEM",
      "system",
      "User data exported to JSON file",
      currentUser?.username || currentUser?.email || "Unknown"
    );
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportMessage("Importing...");
      const importedData = await importUserData(file);

      const validationResults: string[] = [];
      const validateAndCollect = <T,>(data: T[], type: Parameters<typeof validateDataIntegrity>[1]) => {
        if (Array.isArray(data) && data.length > 0) {
          const result = validateDataIntegrity(data, type);
          const summary = getValidationSummary(result);
          if (!result.isValid) {
            validationResults.push(`⚠ ${summary}`);
          }
        }
      };

      validateAndCollect(importedData.data.tasks as Task[], "Task");
      validateAndCollect(importedData.data.requirements as Requirement[], "Requirement");
      validateAndCollect(importedData.data.testCases as TestCase[], "TestCase");
      validateAndCollect(importedData.data.bugs as Bug[], "Bug");
      validateAndCollect(importedData.data.goals as Goal[], "Goal");
      validateAndCollect(importedData.data.milestones as Milestone[], "Milestone");
      validateAndCollect(importedData.data.keyResults as KeyResult[], "KeyResult");

      if (validationResults.length > 0) {
        setImportMessage(
          `Data integrity warnings:\n${validationResults.join("\n")}\nImport aborted. Please fix the data file.`
        );
        setTimeout(() => setImportMessage(""), 8000);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      console.log('[handleImportData] 数据导入:', {
        tasks: importedData.data.tasks?.length || 0,
        requirements: importedData.data.requirements?.length || 0,
        testCases: importedData.data.testCases?.length || 0,
        bugs: importedData.data.bugs?.length || 0,
        goals: importedData.data.goals?.length || 0,
        validationWarnings: validationResults.length
      });

      if (Array.isArray(importedData.data.tasks) && importedData.data.tasks.length > 0) {
        setTasks((prev) => [...prev, ...(importedData.data.tasks as Task[])]);
      }
      if (Array.isArray(importedData.data.requirements) && importedData.data.requirements.length > 0) {
        setRequirements((prev) => [...prev, ...(importedData.data.requirements as Requirement[])]);
      }
      if (Array.isArray(importedData.data.testCases) && importedData.data.testCases.length > 0) {
        setTestCases((prev) => [...prev, ...(importedData.data.testCases as TestCase[])]);
      }
      if (Array.isArray(importedData.data.bugs) && importedData.data.bugs.length > 0) {
        setBugs((prev) => [...prev, ...(importedData.data.bugs as Bug[])]);
      }
      if (Array.isArray(importedData.data.goals) && importedData.data.goals.length > 0) {
        setGoals((prev) => [...prev, ...(importedData.data.goals as Goal[])]);
      }
      if (Array.isArray(importedData.data.milestones) && importedData.data.milestones.length > 0) {
        setMilestones((prev) => [...prev, ...(importedData.data.milestones as Milestone[])]);
      }
      if (Array.isArray(importedData.data.keyResults) && importedData.data.keyResults.length > 0) {
        setKeyResults((prev) => [...prev, ...(importedData.data.keyResults as KeyResult[])]);
      }

      addAuditLog(
        "IMPORT",
        "SYSTEM",
        "system",
        `Data imported from file: ${file.name}`,
        currentUser?.username || currentUser?.email || "Unknown"
      );
      setImportMessage("Data imported successfully!");
      setTimeout(() => setImportMessage(""), 3000);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Import failed"
      );
      setTimeout(() => setImportMessage(""), 5000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const logOperation = (action: string, target: string, details: string) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      target,
      details,
    };
    setOperationLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all data? This action cannot be undone."
      )
    ) {
      addAuditLog(
        "CLEAR",
        "SYSTEM",
        "system",
        "All application data cleared by admin",
        currentUser?.username || currentUser?.email || "Unknown"
      );
      setTasks([]);
      setRequirements([]);
      setTestCases([]);
      setTagHistory([]);
      setComments([]);
      setAgents([]);
      setAgentAssignments([]);
      setBugs([]);
      setOperationLogs([]);
      setGoals([]);
      setMilestones([]);
      setKeyResults([]);
      setAuditLogs([]);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.REQUIREMENTS);
      localStorage.removeItem(STORAGE_KEYS.TEST_CASES);
      localStorage.removeItem(STORAGE_KEYS.TAG_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.COMMENTS);
      localStorage.removeItem(STORAGE_KEYS.AGENTS);
      localStorage.removeItem(STORAGE_KEYS.AGENT_ASSIGNMENTS);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem(STORAGE_KEYS.MILESTONES);
      localStorage.removeItem(STORAGE_KEYS.KEY_RESULTS);
      localStorage.removeItem(STORAGE_KEYS.BUGS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      localStorage.removeItem("jira-clone-privacy-consent");
    }
  };

  const handleCreateGoal = (
    goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!goalData.title || !goalData.title.trim()) {
      console.error("[page.tsx] handleCreateGoal: Title is empty, aborting.");
      return;
    }
    if (!goalData.startDate || !goalData.endDate) {
      console.error(
        "[page.tsx] handleCreateGoal: Missing start/end date, aborting."
      );
      return;
    }
    if (
      isNaN(new Date(goalData.startDate).getTime()) ||
      isNaN(new Date(goalData.endDate).getTime())
    ) {
      console.error(
        "[page.tsx] handleCreateGoal: Invalid date format, aborting."
      );
      return;
    }
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const goalId = newGoal.id;
    setGoals((prev) => [...prev, newGoal]);
    logOperation("CREATE", "Goal", `Goal created: ${goalData.title}`);
    addAuditLog("CREATE", "GOAL", goalId, `Goal created: "${goalData.title}"`);
  };

  const handleUpdateGoal = (goal: Goal) => {
    if (!goal.title || !goal.title.trim()) {
      console.error("[page.tsx] handleUpdateGoal: Title is empty, aborting.");
      return;
    }
    if (!goal.startDate || !goal.endDate) {
      console.error(
        "[page.tsx] handleUpdateGoal: Missing start/end date, aborting."
      );
      return;
    }
    if (
      isNaN(new Date(goal.startDate).getTime()) ||
      isNaN(new Date(goal.endDate).getTime())
    ) {
      console.error(
        "[page.tsx] handleUpdateGoal: Invalid date format, aborting."
      );
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    logOperation("UPDATE", "Goal", `Goal updated: ${goal.title}`);
    addAuditLog("UPDATE", "GOAL", goal.id, `Goal updated: "${goal.title}"`);
  };

  const handleDeleteGoal = (goalId: string, expectedUpdatedAt?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    
    if (expectedUpdatedAt && goal && goal.updatedAt !== expectedUpdatedAt) {
      window.alert("Conflict: This goal was modified by someone else. Refresh and try again.");
      return;
    }
    
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setMilestones((prev) => prev.filter((m) => m.goalId !== goalId));
    setKeyResults((prev) => prev.filter((kr) => kr.goalId !== goalId));
    logOperation(
      "DELETE",
      "Goal",
      goal ? `Goal deleted: ${goal.title}` : `Goal ID: ${goalId}`
    );
    addAuditLog("DELETE", "GOAL", goalId, goal ? `Goal deleted: "${goal.title}"` : `Goal ID: ${goalId} deleted`);
  };

  const getTasksByStatus = (status: Task["status"]): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setModalType("task");
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      relatedRequirementId: "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalType("task");
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: [...task.tags],
      assignee: task.assignee,
      relatedRequirementId: task.relatedRequirementId || "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    logOperation(
      "DELETE",
      "Task",
      task ? `Task deleted: ${task.title}` : `Task ID: ${taskId}`
    );
    addAuditLog("DELETE", "TASK", taskId, task ? `Task deleted: "${task.title}"` : `Task ID: ${taskId} deleted`);
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formData.title,
                description: formData.description,
                status: isValidTaskStatus(formData.status)
                  ? formData.status
                  : "TODO",
                priority: isValidTaskPriority(formData.priority)
                  ? formData.priority
                  : "MEDIUM",
                dueDate: formData.dueDate,
                tags: formData.tags,
                assignee: formData.assignee,
                relatedRequirementId:
                  formData.relatedRequirementId || undefined,
              }
            : t
        )
      );
      logOperation("UPDATE", "Task", `Task updated: ${formData.title}`);
      addAuditLog("UPDATE", "TASK", editingTask.id, `Task updated: "${formData.title}"`);
    } else {
      const newTaskId = Date.now().toString();
      const newTask: Task = {
        id: newTaskId,
        title: formData.title,
        description: formData.description,
        status: isValidTaskStatus(formData.status) ? formData.status : "TODO",
        priority: isValidTaskPriority(formData.priority)
          ? formData.priority
          : "MEDIUM",
        dueDate: formData.dueDate,
        tags: formData.tags,
        assignee: formData.assignee || "Unassigned",
        relatedRequirementId: formData.relatedRequirementId || undefined,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
      logOperation("CREATE", "Task", `Task created: ${formData.title}`);
      addAuditLog("CREATE", "TASK", newTaskId, `Task created: "${formData.title}"`);
    }

    setShowModal(false);
    setEditingTask(null);
  };

  const handleNewRequirement = () => {
    setEditingRequirement(null);
    setModalType("requirement");
    setFormData({
      title: "",
      description: "",
      status: "DRAFT",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      relatedRequirementId: "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setModalType("requirement");
    setFormData({
      title: requirement.title,
      description: requirement.description,
      status: requirement.status,
      priority: requirement.priority,
      dueDate: "",
      tags: [],
      assignee: "",
      relatedRequirementId: "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: requirement.acceptanceCriteria.join("\n"),
      requester: requirement.requester,
      executor: requirement.executor,
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleDeleteRequirement = (requirementId: string, expectedUpdatedAt?: string) => {
    const req = requirements.find((r) => r.id === requirementId);
    
    if (expectedUpdatedAt && req && req.updatedAt !== expectedUpdatedAt) {
      window.alert("Conflict: This requirement was modified by someone else. Refresh and try again.");
      return;
    }
    
    setRequirements((prev) => prev.filter((r) => r.id !== requirementId));
    setTestCases((prev) =>
      prev.map((t) =>
        t.requirementId === requirementId ? { ...t, requirementId: "" } : t
      )
    );
    addAuditLog("DELETE", "REQUIREMENT", requirementId, req ? `Requirement deleted: "${req.title}"` : `Requirement ID: ${requirementId} deleted`);
  };

  const handleSaveRequirement = () => {
    if (!formData.title.trim()) return;

    const acceptanceCriteriaArray = Array.isArray(formData.acceptanceCriteria)
      ? formData.acceptanceCriteria
      : formData.acceptanceCriteria
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s);

    if (editingRequirement) {
      setRequirements((prev) =>
        prev.map((r) =>
          r.id === editingRequirement.id
            ? {
                ...r,
                title: formData.title,
                description: formData.description,
                status: isValidRequirementStatus(formData.status)
                  ? formData.status
                  : "DRAFT",
                priority: (isValidRequirementPriority(formData.priority)
                  ? formData.priority
                  : "MEDIUM") as Requirement["priority"],
                acceptanceCriteria: acceptanceCriteriaArray,
                updatedAt: new Date().toISOString(),
                requester: formData.requester,
                executor: formData.executor,
              }
            : r
        )
      );
      addAuditLog("UPDATE", "REQUIREMENT", editingRequirement.id, `Requirement updated: "${formData.title}"`);
    } else {
      const newReqId = "r" + Date.now();
      const newRequirement: Requirement = {
        id: newReqId,
        title: formData.title,
        description: formData.description,
        status: isValidRequirementStatus(formData.status)
          ? formData.status
          : "DRAFT",
        priority: (isValidRequirementPriority(formData.priority)
          ? formData.priority
          : "MEDIUM") as Requirement["priority"],
        acceptanceCriteria: acceptanceCriteriaArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requester: formData.requester,
        executor: formData.executor,
      };
      setRequirements((prev) => [...prev, newRequirement]);
      addAuditLog("CREATE", "REQUIREMENT", newReqId, `Requirement created: "${formData.title}"`);
    }

    setShowModal(false);
    setEditingRequirement(null);
  };

  const handleNewTestCase = (requirementId?: string) => {
    setEditingTestCase(null);
    setModalType("test");
    setFormData({
      title: "",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      relatedRequirementId: requirementId || "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setModalType("test");
    setFormData({
      title: testCase.title,
      description: testCase.description,
      status: testCase.status,
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: testCase.executor || "",
      relatedRequirementId: testCase.requirementId,
      steps: testCase.steps.join("\n"),
      expectedResult: testCase.expectedResult,
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    const tc = testCases.find((t) => t.id === testCaseId);
    setTestCases((prev) => prev.filter((t) => t.id !== testCaseId));
    addAuditLog("DELETE", "TEST_CASE", testCaseId, tc ? `Test case deleted: "${tc.title}"` : `Test case ID: ${testCaseId} deleted`);
  };

  const handleSaveTestCase = () => {
    if (!formData.title.trim()) return;

    const stepsArray = Array.isArray(formData.steps)
      ? formData.steps
      : formData.steps
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s);

    if (editingTestCase) {
      setTestCases((prev) =>
        prev.map((t) =>
          t.id === editingTestCase.id
            ? {
                ...t,
                title: formData.title,
                description: formData.description,
                steps: stepsArray,
                expectedResult: formData.expectedResult,
                status: isValidTestCaseStatus(formData.status)
                  ? formData.status
                  : "PENDING",
                executor: formData.assignee || undefined,
              }
            : t
        )
      );
      addAuditLog("UPDATE", "TEST_CASE", editingTestCase.id, `Test case updated: "${formData.title}"`);
    } else {
      const newTcId = "t" + Date.now();
      const newTestCase: TestCase = {
        id: newTcId,
        requirementId: formData.relatedRequirementId,
        title: formData.title,
        description: formData.description,
        steps: stepsArray,
        expectedResult: formData.expectedResult,
        status: isValidTestCaseStatus(formData.status)
          ? formData.status
          : "PENDING",
      };
      setTestCases((prev) => [...prev, newTestCase]);
      addAuditLog("CREATE", "TEST_CASE", newTcId, `Test case created: "${formData.title}"`);
    }

    setShowModal(false);
    setEditingTestCase(null);
  };

  const handleNewBug = () => {
    setEditingBug(null);
    setModalType("bug");
    setFormData({
      title: "",
      description: "",
      status: "REPORTED",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      relatedRequirementId: "",
      steps: "",
      expectedResult: "",
      acceptanceCriteria: "",
      requester: "",
      executor: "",
      severity: "",
      bugPriority: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
    });
    setShowModal(true);
  };

  const handleSaveBug = () => {
    if (!formData.title.trim()) return;

    const stepsToReproduceArray = Array.isArray(formData.stepsToReproduce)
      ? formData.stepsToReproduce
      : formData.stepsToReproduce
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s);

    const currentUser = getCurrentUser();
    const reporter = currentUser?.username || currentUser?.email || "Current User";

    if (editingBug) {
      setBugs((prev) =>
        prev.map((b) =>
          b.id === editingBug.id
            ? {
                ...b,
                title: formData.title,
                description: formData.description,
                severity: (formData.severity || "MEDIUM") as Bug["severity"],
                priority: (formData.bugPriority || "MEDIUM") as Bug["priority"],
                stepsToReproduce: stepsToReproduceArray,
                expectedBehavior: formData.expectedBehavior,
                actualBehavior: formData.actualBehavior,
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      );
      addAuditLog("UPDATE", "BUG", editingBug.id, `Bug updated: "${formData.title}"`);
    } else {
      const newBugId = "bug-" + Date.now();
      const newBug: Bug = {
        id: newBugId,
        title: formData.title,
        description: formData.description,
        severity: (formData.severity || "MEDIUM") as Bug["severity"],
        priority: (formData.bugPriority || "MEDIUM") as Bug["priority"],
        status: "REPORTED",
        stepsToReproduce: stepsToReproduceArray,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        reporter,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBugs((prev) => [...prev, newBug]);
      addAuditLog("CREATE", "BUG", newBugId, `Bug created: "${formData.title}"`);
    }

    setShowModal(false);
    setEditingBug(null);
  };

  const updateAgentStatus = (
    agentId: string,
    status: AgentStatus,
    currentTask?: string,
    currentTaskId?: string
  ) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              status,
              currentTask,
              currentTaskId,
              lastActivity: new Date().toISOString(),
            }
          : agent
      )
    );
  };

  const handleAssignTaskToAgent = (agent: Agent, taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newAssignment: AgentTaskAssignment = {
      id: Date.now().toString(),
      agentId: agent.id,
      agentName: agent.name,
      taskId: task.id,
      taskTitle: task.title,
      assignedAt: new Date().toISOString(),
      status: "ASSIGNED",
    };

    setAgentAssignments((prev) => [...prev, newAssignment]);
    updateAgentStatus(agent.id, "WORKING", task.title, task.id);
    setShowAssignModal(false);
    setAgentToAssign(null);
    logOperation(
      "ASSIGN",
      "Agent",
      `Task "${task.title}" assigned to ${agent.name}`
    );
  };

  const handleCompleteAgentTask = (assignmentId: string) => {
    const assignment = agentAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setAgentAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: "COMPLETED",
              completionTime: new Date().toISOString(),
            }
          : a
      )
    );

    const agent = agents.find((a) => a.id === assignment.agentId);
    if (agent) {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id
            ? {
                ...a,
                status: "IDLE",
                currentTask: undefined,
                currentTaskId: undefined,
                tasksCompleted: a.tasksCompleted + 1,
              }
            : a
        )
      );
    }
    logOperation(
      "COMPLETE",
      "Agent Task",
      `Task "${assignment.taskTitle}" completed by ${assignment.agentName}`
    );
  };

  const handleFailAgentTask = (assignmentId: string, result?: string) => {
    const assignment = agentAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setAgentAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              status: "FAILED",
              completionTime: new Date().toISOString(),
              result,
            }
          : a
      )
    );

    const agent = agents.find((a) => a.id === assignment.agentId);
    if (agent) {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id
            ? {
                ...a,
                status: "IDLE",
                currentTask: undefined,
                currentTaskId: undefined,
                tasksFailed: a.tasksFailed + 1,
              }
            : a
        )
      );
    }
    logOperation(
      "FAIL",
      "Agent Task",
      `Task "${assignment.taskTitle}" failed by ${assignment.agentName}`
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId as Task["status"];
    const destStatus = destination.droppableId as Task["status"];

    if (sourceStatus === destStatus) {
      const sourceTasks = getTasksByStatus(sourceStatus);
      const newTasks = [...sourceTasks];
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setTasks((prev) =>
        prev.map((t) => {
          if (t.status === sourceStatus) {
            return newTasks.find((nt) => nt.id === t.id) || t;
          }
          return t;
        })
      );
    } else {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === result.draggableId) {
            return { ...t, status: destStatus };
          }
          return t;
        })
      );
    }

    setRecentlyDraggedTaskId(result.draggableId);
    setTimeout(() => {
      setRecentlyDraggedTaskId(null);
    }, 2000);
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#f9fafb", color: COLORS.text }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "2px solid #e5e7eb",
          padding: isSmall ? "12px 16px" : "16px 32px",
          marginBottom: isSmall ? "16px" : "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: `${28 * fontSizeScale}px`,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Jira Clone
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={handleClearAllData}
              aria-label="Clear all application data"
              style={{
                padding: "6px 12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: COLORS.buttonDanger,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#fee2e2";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#fef2f2";
              }}
              disabled={!hasPermission(currentUser, "ADMIN")}
            >
              🗑 Clear All Data
            </button>
            <span
              style={{
                fontSize: "13px",
                color: "#4b5563",
                background: "#e5e7eb",
                padding: "4px 8px",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              {currentUser?.role === "ADMIN" ? "🔒 Admin" : "👤 User"}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: COLORS.textSecondary,
                background: COLORS.columnBackground,
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              {currentUser?.username || currentUser?.email}
            </span>
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              aria-label="Open privacy and data export settings"
              style={{
                padding: "6px 12px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e0f2fe";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f0f9ff";
              }}
            >
              🔒 Privacy
            </button>
            <button
              onClick={handleLogout}
              aria-label="Logout from application"
              style={{
                padding: "6px 12px",
                background: COLORS.buttonSecondary,
                border: "1px solid #d1d5db",
                color: COLORS.text,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = COLORS.buttonSecondary;
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          role="navigation"
          aria-label="View navigation"
          style={{
            display: "flex",
            gap: isSmall ? "4px" : "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "TASKS", label: "📋 Tasks", view: "TASKS" as const },
            { key: "REQUIREMENTS", label: "📝 Requirements", view: "REQUIREMENTS" as const },
            { key: "TESTING", label: "🧪 Testing", view: "TESTING" as const },
            { key: "BUGS", label: "🐛 Bugs", view: "BUGS" as const },
            { key: "GOALS", label: "🎯 Goals", view: "GOALS" as const },
            { key: "TIMELINE", label: "📅 Timeline", view: "TIMELINE" as const },
            { key: "AGENTS", label: "🤖 Agents", view: "AGENTS" as const },
            { key: "WORKFLOW", label: "⚡ Workflow", view: "WORKFLOW" as const },
            { key: "AUDIT", label: "📊 Audit Logs", view: "AUDIT" as const },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setViewMode(item.view)}
              aria-pressed={viewMode === item.view}
              style={{
                padding: isSmall ? "6px 10px" : "8px 16px",
                background: viewMode === item.view ? COLORS.primary : "#ffffff",
                color: viewMode === item.view ? "#ffffff" : COLORS.text,
                border: `1px solid ${viewMode === item.view ? COLORS.primary : "#d1d5db"}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                if (viewMode !== item.view) {
                  e.currentTarget.style.background = "#f3f4f6";
                }
              }}
              onMouseOut={(e) => {
                if (viewMode !== item.view) {
                  e.currentTarget.style.background = "#ffffff";
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {showValidationBanner && validationResults.length > 0 && (
        <div
          style={{
            margin: "0 32px 16px",
            padding: "12px 16px",
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong style={{ color: "#92400e" }}>⚠️ Data Integrity Issues Detected</strong>
            <p style={{ margin: "4px 0 0", color: "#78350f", fontSize: "14px" }}>
              {validationResults.length} issue(s) found. Click for details.
            </p>
          </div>
          <button
            onClick={() => setShowValidationBanner(false)}
            style={{
              padding: "4px 8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#92400e",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {showPrivacySettings && (
        <div
          style={{
            margin: "0 32px 16px",
            padding: "16px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 600 }}>
            🔒 Privacy & Data Settings
          </h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleExportData}
              style={{
                padding: "8px 16px",
                background: "#dbeafe",
                border: "1px solid #93c5fd",
                color: "#1e40af",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              📤 Export All Data
            </button>
            <label
              style={{
                padding: "8px 16px",
                background: "#dcfce7",
                border: "1px solid #86efac",
                color: "#166534",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              📥 Import Data
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: "none" }}
              />
            </label>
            <button
              onClick={handleRevokeConsent}
              style={{
                padding: "8px 16px",
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              🗑 Delete All Data
            </button>
          </div>
          {importMessage && (
            <p style={{ marginTop: "12px", fontSize: "14px", color: COLORS.textSecondary }}>
              {importMessage}
            </p>
          )}
        </div>
      )}

      <main style={{ padding: isSmall ? "0 16px" : "0 32px" }}>
        {viewMode === "TASKS" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="🔍 Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search tasks"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  aria-label="Filter by priority"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  aria-label="Filter by assignee"
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">All Assignees</option>
                  {allAssignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNewTask}
                style={{
                  padding: "10px 20px",
                  background: COLORS.primary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                + New Task
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div
                style={{
                  display: "flex",
                  gap: isSmall ? "12px" : "16px",
                  overflowX: "auto",
                  paddingBottom: "16px",
                  flexWrap: isSmall ? "wrap" : "nowrap",
                }}
              >
                {("TODO" as const).toString() && (
                  <TaskColumn
                    status="TODO"
                    title="To Do"
                    tasks={getFilteredTasksByStatus("TODO")}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    getCommentsByTaskId={getCommentsByTaskId}
                    columnWidth={getColumnWidth()}
                    fontSizeScale={fontSizeScale}
                    recentlyDraggedTaskId={recentlyDraggedTaskId}
                  />
                )}
                <TaskColumn
                  status="IN_PROGRESS"
                  title="In Progress"
                  tasks={getFilteredTasksByStatus("IN_PROGRESS")}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  getCommentsByTaskId={getCommentsByTaskId}
                  columnWidth={getColumnWidth()}
                  fontSizeScale={fontSizeScale}
                  recentlyDraggedTaskId={recentlyDraggedTaskId}
                />
                <TaskColumn
                  status="DONE"
                  title="Done"
                  tasks={getFilteredTasksByStatus("DONE")}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  getCommentsByTaskId={getCommentsByTaskId}
                  columnWidth={getColumnWidth()}
                  fontSizeScale={fontSizeScale}
                  recentlyDraggedTaskId={recentlyDraggedTaskId}
                />
              </div>
            </DragDropContext>
          </div>
        )}

        {viewMode === "REQUIREMENTS" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: `${20 * fontSizeScale}px` }}>
                📝 Product Requirements ({requirements.length})
              </h2>
              <button
                onClick={handleNewRequirement}
                style={{
                  padding: "10px 20px",
                  background: COLORS.primary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                + New Requirement
              </button>
            </div>
            {requirements.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "12px",
                  color: COLORS.textSecondary,
                }}
              >
                <p style={{ fontSize: "48px", margin: "0 0 16px" }}>📝</p>
                <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>
                  No Requirements Yet
                </p>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  Click "New Requirement" to create your first product requirement.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmall
                    ? "1fr"
                    : isMedium
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {requirements.map((req) => (
                  <RequirementCard
                    key={req.id}
                    requirement={req}
                    onEdit={handleEditRequirement}
                    onDelete={handleDeleteRequirement}
                    onAddTestCase={handleNewTestCase}
                    testCases={testCases.filter(
                      (tc) => tc.requirementId === req.id
                    )}
                    fontSizeScale={fontSizeScale}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "TESTING" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: `${20 * fontSizeScale}px` }}>
                🧪 Test Cases ({testCases.length})
              </h2>
              <button
                onClick={() => handleNewTestCase()}
                style={{
                  padding: "10px 20px",
                  background: COLORS.primary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                + New Test Case
              </button>
            </div>
            {testCases.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  border: "2px dashed #d1d5db",
                  borderRadius: "12px",
                  color: COLORS.textSecondary,
                }}
              >
                <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🧪</p>
                <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>
                  No Test Cases Yet
                </p>
                <p style={{ fontSize: "14px", margin: 0 }}>
                  Click "New Test Case" to create your first test case.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmall
                    ? "1fr"
                    : isMedium
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {testCases.map((tc) => (
                  <TestCaseCard
                    key={tc.id}
                    testCase={tc}
                    onEdit={handleEditTestCase}
                    onDelete={handleDeleteTestCase}
                    fontSizeScale={fontSizeScale}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === "BUGS" && (
          <BugTracker
            bugs={bugs}
            onNewBug={handleNewBug}
            onEditBug={(bug) => {
              setEditingBug(bug);
              setModalType("bug");
              setFormData({
                title: bug.title,
                description: bug.description,
                status: bug.status,
                priority: "MEDIUM",
                dueDate: "",
                tags: [],
                assignee: "",
                relatedRequirementId: "",
                steps: "",
                expectedResult: "",
                acceptanceCriteria: "",
                requester: "",
                executor: "",
                severity: bug.severity,
                bugPriority: bug.priority,
                stepsToReproduce: bug.stepsToReproduce.join("\n"),
                expectedBehavior: bug.expectedBehavior,
                actualBehavior: bug.actualBehavior,
              });
              setShowModal(true);
            }}
            onDeleteBug={(bugId) => {
              setBugs((prev) => prev.filter((b) => b.id !== bugId));
              addAuditLog("DELETE", "BUG", bugId, `Bug deleted: ${bugId}`);
            }}
            fontSizeScale={fontSizeScale}
          />
        )}

        {viewMode === "GOALS" && (
          <GoalTracker
            goals={goals}
            milestones={milestones}
            keyResults={keyResults}
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            fontSizeScale={fontSizeScale}
          />
        )}

        {viewMode === "TIMELINE" && (
          <TimelineView
            goals={goals}
            milestones={milestones}
            keyResults={keyResults}
            requirements={requirements}
            fontSizeScale={fontSizeScale}
          />
        )}

        {viewMode === "AGENTS" && (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: `${20 * fontSizeScale}px` }}>
              🤖 AI Agents ({agents.length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isSmall
                  ? "1fr"
                  : isMedium
                  ? "repeat(2, 1fr)"
                  : "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                  }}
                  onClick={() => setSelectedAgent(agent)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: agent.color || COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                      }}
                    >
                      {agent.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                        {agent.name}
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: COLORS.textSecondary }}>
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          agent.status === "IDLE"
                            ? "#10b981"
                            : agent.status === "WORKING"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    />
                    <span style={{ fontSize: "13px", color: COLORS.textSecondary }}>
                      {agent.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                    <div>Completed: {agent.tasksCompleted}</div>
                    <div>Failed: {agent.tasksFailed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "WORKFLOW" && (
          <AgentWorkflow
            agents={agents}
            assignments={agentAssignments}
            tasks={tasks}
            onAssignTask={handleAssignTaskToAgent}
            onCompleteTask={handleCompleteAgentTask}
            onFailTask={handleFailAgentTask}
            fontSizeScale={fontSizeScale}
          />
        )}

        {viewMode === "AUDIT" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: `${20 * fontSizeScale}px` }}>
                📊 Audit Logs ({filteredAuditLogs.length})
              </h2>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={filterAuditAction}
                  onChange={(e) => setFilterAuditAction(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="EXPORT">Export</option>
                  <option value="IMPORT">Import</option>
                  <option value="CLEAR">Clear</option>
                </select>
                <select
                  value={filterAuditTarget}
                  onChange={(e) => setFilterAuditTarget(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  <option value="">All Targets</option>
                  <option value="TASK">Task</option>
                  <option value="REQUIREMENT">Requirement</option>
                  <option value="TEST_CASE">Test Case</option>
                  <option value="BUG">Bug</option>
                  <option value="GOAL">Goal</option>
                  <option value="SYSTEM">System</option>
                </select>
                <input
                  type="date"
                  value={filterAuditStartDate}
                  onChange={(e) => setFilterAuditStartDate(e.target.value)}
                  placeholder="Start Date"
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
                <input
                  type="date"
                  value={filterAuditEndDate}
                  onChange={(e) => setFilterAuditEndDate(e.target.value)}
                  placeholder="End Date"
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                {filteredAuditLogs.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center", color: COLORS.textSecondary }}>
                    <p style={{ fontSize: "48px", margin: "0 0 16px" }}>📋</p>
                    <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>
                      No Audit Logs
                    </p>
                    <p style={{ fontSize: "14px", margin: 0 }}>
                      No audit logs match your filters.
                    </p>
                  </div>
                ) : (
                  filteredAuditLogs.map((log, index) => (
                    <div
                      key={log.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: index < filteredAuditLogs.length - 1 ? "1px solid #f3f4f6" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              background:
                                log.action === "CREATE"
                                  ? "#dcfce7"
                                  : log.action === "UPDATE"
                                  ? "#dbeafe"
                                  : log.action === "DELETE"
                                  ? "#fee2e2"
                                  : log.action === "LOGIN" || log.action === "LOGOUT"
                                  ? "#fef3c7"
                                  : "#f3f4f6",
                              color:
                                log.action === "CREATE"
                                  ? "#166534"
                                  : log.action === "UPDATE"
                                  ? "#1e40af"
                                  : log.action === "DELETE"
                                  ? "#991b1b"
                                  : log.action === "LOGIN" || log.action === "LOGOUT"
                                  ? "#92400e"
                                  : COLORS.textSecondary,
                            }}
                          >
                            {log.action}
                          </span>
                          <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                            {log.target}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "14px", color: COLORS.text }}>
                          {log.details}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", minWidth: "120px" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: COLORS.textSecondary }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: 600 }}>
                          {log.username}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          modalType={modalType}
          formData={formData}
          setFormData={setFormData}
          onSave={
            modalType === "task"
              ? handleSaveTask
              : modalType === "requirement"
              ? handleSaveRequirement
              : modalType === "test"
              ? handleSaveTestCase
              : handleSaveBug
          }
          editingTask={editingTask}
          editingRequirement={editingRequirement}
          editingTestCase={editingTestCase}
          editingBug={editingBug}
          tagHistory={tagHistory}
          fontSizeScale={fontSizeScale}
          requirements={requirements}
        />
      )}

      {showPrivacyModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: "20px" }}>
              🔒 Privacy Consent
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: 1.6, color: COLORS.textSecondary }}>
              We use localStorage to store your data securely on your device.
              All data is encrypted using AES-GCM encryption. You can export
              or delete your data at any time from the Privacy settings.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={handleRevokeConsent}
                style={{
                  padding: "10px 20px",
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Decline
              </button>
              <button
                onClick={handlePrivacyConsent}
                style={{
                  padding: "10px 20px",
                  background: COLORS.primary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}