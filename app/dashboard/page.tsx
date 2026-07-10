/**
 * Dashboard Page - Main application component for Jira Clone.
 *
 * This is the central component that manages the entire application state,
 * including tasks, requirements, test cases, authentication, and UI interactions.
 *
 * Key features:
 * - Kanban-style task management with drag-and-drop
 * - Product requirements management
 * - Test case management with requirement linking
 * - AI Agent management and workflow visualization
 * - Authentication and role-based access control
 * - Responsive design with adaptive scaling
 * - Local data persistence with AES-GCM encryption
 */
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

/**
 * Main Dashboard component.
 * Manages all application state and orchestrates UI rendering.
 *
 * State Management Strategy:
 * - Data states (tasks, requirements, testCases): Persisted to localStorage with encryption
 * - UI states (showModal, editingTask): In-memory only
 * - Authentication state: Checked on mount from localStorage
 * - isInitialized flag: Prevents empty state overwrite during initialization
 */
export default function Dashboard() {
  // === DATA STATES ===
  const [tasks, setTasks] = useState<Task[]>([]); // Kanban tasks
  const [requirements, setRequirements] = useState<Requirement[]>([]); // Product requirements
  const [testCases, setTestCases] = useState<TestCase[]>([]); // Test cases
  const [tagHistory, setTagHistory] = useState<string[]>([]); // Tag history for autocomplete
  const [isInitialized, setIsInitialized] = useState(false); // Initialization guard

  // === VIEW MODE STATE ===
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
  >("TASKS"); // Current view

  // === MODAL STATES ===
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [modalType, setModalType] = useState<
    "task" | "requirement" | "test" | "bug"
  >("task"); // Modal type
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Task being edited
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null); // Requirement being edited
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null); // Test case being edited
  const [editingBug, setEditingBug] = useState<Bug | null>(null); // Bug being edited

  // === BUG STATES ===
  const [bugs, setBugs] = useState<Bug[]>([]); // Bug reports

  // === GOAL STATES ===
  const [goals, setGoals] = useState<Goal[]>([]); // Goals
  const [milestones, setMilestones] = useState<Milestone[]>([]); // Milestones
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]); // Key Results

  // === FORM STATE ===
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

  // === DRAG & DROP STATES ===
  const [isDragging, setIsDragging] = useState(false); // Drag operation in progress

  // === RESPONSIVE & UI STATES ===
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]); // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]); // ISO 27001 audit logs
  const [showPrivacySettings, setShowPrivacySettings] = useState(false); // Privacy settings panel
  const [importMessage, setImportMessage] = useState(""); // Import status message
  const fileInputRef = useRef<HTMLInputElement>(null); // Hidden file input for import

  // === AUDIT FILTER STATES ===
  const [filterAuditAction, setFilterAuditAction] = useState<string>(""); // Filter by action type
  const [filterAuditTarget, setFilterAuditTarget] = useState<string>(""); // Filter by target type
  const [filterAuditStartDate, setFilterAuditStartDate] = useState<string>(""); // Start date filter
  const [filterAuditEndDate, setFilterAuditEndDate] = useState<string>(""); // End date filter

  // === FILTERED AUDIT LOGS ===
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

  // === AUDIT LOG CAPACITY ===
  const MAX_AUDIT_LOG_ENTRIES = 1000; // Maximum number of audit log entries to prevent localStorage overflow

  // === SEARCH & FILTER STATES ===
  const [comments, setComments] = useState<Comment[]>([]); // Task comments
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [filterPriority, setFilterPriority] = useState<string>(""); // Priority filter
  const [filterAssignee, setFilterAssignee] = useState<string>(""); // Assignee filter

  // === AGENT STATES ===
  const [agents, setAgents] = useState<Agent[]>([]); // AI agents
  const [agentAssignments, setAgentAssignments] = useState<
    AgentTaskAssignment[]
  >([]); // Agent-task assignments
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null); // Selected agent for detail view
  const [showAssignModal, setShowAssignModal] = useState(false); // Task assignment modal
  const [agentToAssign, setAgentToAssign] = useState<Agent | null>(null); // Agent receiving task
  const [recentlyDraggedTaskId, setRecentlyDraggedTaskId] = useState<
    string | null
  >(null); // Recently dragged task for animation

  // === CUSTOM HOOKS ===
  const { isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, handleLoginSuccess: _handleLoginSuccess, handleLogout: _handleLogout } = useAuth();

  const { windowWidth, isClient, showPrivacyModal, setShowPrivacyModal, privacyConsented, setPrivacyConsented, effectiveWidth, isSmall, isMedium } = useWindow(setShowModal);

  useDataLoader(setTasks, setRequirements, setTestCases, setBugs, setGoals, setMilestones, setKeyResults, setAgents, setAgentAssignments, setTagHistory, setComments, setAuditLogs, setIsInitialized);

  usePersistence(tasks, requirements, testCases, bugs, goals, milestones, keyResults, tagHistory, comments, agents, agentAssignments, auditLogs, isInitialized, setTagHistory);

  const { validationResults, setValidationResults, showValidationBanner, setShowValidationBanner } = useValidation(isInitialized, tasks, requirements, testCases, bugs, goals, milestones, keyResults, agents, setTasks, setRequirements, setTestCases, setBugs, setGoals, setMilestones, setKeyResults, setAgents);

  /**
   * Returns the font size scale factor based on screen size.
   * @returns Scale factor (0.85 for small, 0.95 for medium, 1.0 for large)
   */
  const getFontSize = () => {
    if (isSmall) return 0.85;
    if (isMedium) return 0.95;
    return 1;
  };

  /**
   * Returns the column width for kanban columns based on screen size.
   * @returns CSS width value as string
   */
  const getColumnWidth = () => {
    if (isSmall) return "95%";
    if (isMedium) return "45%";
    return "280px";
  };

  const fontSizeScale = getFontSize();

  /**
   * Get all comments for a specific task.
   * @param taskId - ID of the task to get comments for
   * @returns Array of Comment objects for the task
   */
  const getCommentsByTaskId = (taskId: string): Comment[] => {
    return comments.filter((c) => c.taskId === taskId);
  };

  /**
   * Add a comment to a task.
   * Updates both the comments state and the task's embedded comments.
   * @param taskId - ID of the task to add comment to
   * @param content - Comment text content
   */
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

  /**
   * Delete a comment from a task.
   * Updates both the comments state and removes from the task's embedded comments.
   * @param commentId - ID of the comment to delete
   * @param taskId - ID of the task the comment belongs to
   */
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

  /**
   * Filter tasks based on search query, priority, and assignee filters.
   * @returns Array of filtered Task objects
   */
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

  /**
   * Get filtered tasks by status for kanban columns.
   * @param status - Task status to filter by
   * @returns Array of Task objects with the specified status
   */
  const getFilteredTasksByStatus = (status: Task["status"]): Task[] => {
    return filteredTasks.filter((task) => task.status === status);
  };

  /**
   * Get unique list of all assignees from tasks.
   * Used for filter dropdown options.
   */
  const allAssignees = [...new Set(tasks.map((t) => t.assignee))].filter(
    Boolean
  );

  /**
   * Handle privacy consent acceptance.
   * Saves consent to localStorage and closes the modal.
   */
  const handlePrivacyConsent = () => {
    setPrivacyConsented(true);
    setShowPrivacyModal(false);
    localStorage.setItem("jira-clone-privacy-consent", "true");
  };

  /**
   * Handle privacy consent revocation.
   * Clears all user data and redirects to login.
   */
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

  /**
   * Add an ISO 27001 audit log entry.
   * Stores the log in memory and persists to encrypted localStorage.
   * @param action - Audit action type
   * @param target - Audit target type
   * @param targetId - ID of the target object
   * @param details - Human-readable description of the operation
   * @param username - Username of the person performing the action
   */
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

  /**
   * Handle successful login (wraps useAuth handler with audit logging).
   */
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

  /**
   * Handle logout (wraps useAuth handler with audit logging).
   */
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

  /**
   * Handle export of all user data.
   * Triggers a download of the JSON export file.
   */
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

  /**
   * Handle import of user data from a JSON file.
   * Reads the file, validates, and merges data into application state.
   * @param event - The file input change event
   */
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportMessage("Importing...");
      const importedData = await importUserData(file);

      // Validate imported data integrity before merging
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

      // Merge imported data into state
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

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Log an operation for audit purposes.
   * Maintains last 100 logs in memory.
   * @param action - Action type (CREATE, UPDATE, DELETE, etc.)
   * @param target - Target type (Task, Requirement, TestCase, etc.)
   * @param details - Detailed description of the operation
   */
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

  /**
   * Clear all application data.
   * Resets all state and removes localStorage entries.
   * Requires admin permission and confirmation dialog.
   */
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
    
    // Optimistic lock check: if expected updatedAt doesn't match current, reject deletion
    if (expectedUpdatedAt && goal && goal.updatedAt !== expectedUpdatedAt) {
      window.alert("Conflict: This goal was modified by someone else. Refresh and try again.");
      return;
    }
    
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    // Cascade cleanup: also remove associated milestones and key results
    setMilestones((prev) => prev.filter((m) => m.goalId !== goalId));
    setKeyResults((prev) => prev.filter((kr) => kr.goalId !== goalId));
    logOperation(
      "DELETE",
      "Goal",
      goal ? `Goal deleted: ${goal.title}` : `Goal ID: ${goalId}`
    );
    addAuditLog("DELETE", "GOAL", goalId, goal ? `Goal deleted: "${goal.title}"` : `Goal ID: ${goalId} deleted`);
  };

  /**
   * Get tasks by status (unfiltered).
   * Used for drag-and-drop operations which need all tasks.
   * @param status - Task status to filter by
   * @returns Array of Task objects with the specified status
   */
  const getTasksByStatus = (status: Task["status"]): Task[] => {
    return tasks.filter((task) => task.status === status);
  };

  /**
   * Prepare and open modal for creating a new task.
   * Resets form data to defaults and opens the modal.
   */
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

  /**
   * Prepare and open modal for editing an existing task.
   * Populates form data with task values and opens the modal.
   * @param task - Task to edit
   */
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

  /**
   * Delete a task.
   * Removes the task and logs the operation.
   * @param taskId - ID of the task to delete
   */
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

  /**
   * Save task (create or update).
   * Validates form data, performs runtime validation on status/priority,
   * and either updates existing task or creates a new one.
   * Auto-save to localStorage is triggered via useEffect.
   */
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

  /**
   * Prepare and open modal for creating a new requirement.
   * Resets form data to defaults and opens the modal.
   */
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

  /**
   * Prepare and open modal for editing an existing requirement.
   * Populates form data with requirement values and opens the modal.
   * @param requirement - Requirement to edit
   */
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

  /**
   * Delete a requirement.
   * Removes the requirement and clears the requirementId from related test cases.
   * Does NOT delete related test cases - sets their requirementId to empty string.
   * @param requirementId - ID of the requirement to delete
   */
  const handleDeleteRequirement = (requirementId: string, expectedUpdatedAt?: string) => {
    const req = requirements.find((r) => r.id === requirementId);
    
    // Optimistic lock check: if expected updatedAt doesn't match current, reject deletion
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

  /**
   * Save requirement (create or update).
   * Validates form data, parses acceptance criteria from newline-separated text,
   * and either updates existing requirement or creates a new one.
   * @param requirement - Requirement to edit
   */
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

  /**
   * Prepare and open modal for creating a new test case.
   * Optionally pre-associates with a requirement.
   * @param requirementId - Optional requirement ID to associate with the test case
   */
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

  /**
   * Prepare and open modal for editing an existing test case.
   * Populates form data with test case values and opens the modal.
   * @param testCase - Test case to edit
   */
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

  /**
   * Delete a test case.
   * @param testCaseId - ID of the test case to delete
   */
  const handleDeleteTestCase = (testCaseId: string) => {
    const tc = testCases.find((t) => t.id === testCaseId);
    setTestCases((prev) => prev.filter((t) => t.id !== testCaseId));
    addAuditLog("DELETE", "TEST_CASE", testCaseId, tc ? `Test case deleted: "${tc.title}"` : `Test case ID: ${testCaseId} deleted`);
  };

  /**
   * Save test case (create or update).
   * Validates form data, parses test steps from newline-separated text,
   * and either updates existing test case or creates a new one.
   */
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

  /**
   * Prepare and open modal for creating a new bug report.
   * Resets form data to defaults and opens the modal.
   */
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

  /**
   * Save bug report (create or update).
   * Validates form data, parses stepsToReproduce from newline-separated text,
   * and either updates existing bug or creates a new one.
   */
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

  /**
   * Update an agent's status and current task information.
   * @param agentId - ID of the agent to update
   * @param status - New agent status
   * @param currentTask - Optional current task title
   * @param currentTaskId - Optional current task ID
   */
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

  /**
   * Assign a task to an agent.
   * Creates an assignment record and updates the agent's status to WORKING.
   * @param agent - Agent to assign task to
   * @param taskId - ID of the task to assign
   */
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

  /**
   * Mark an agent's task as completed.
   * Updates assignment status and increments agent's completed task count.
   * @param assignmentId - ID of the assignment to complete
   */
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

  /**
   * Mark an agent's task as failed.
   * Updates assignment status, records result, and increments agent's failed task count.
   * @param assignmentId - ID of the assignment to fail
   * @param result - Optional result/error message
   */
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

  /**
   * Handle drag-and-drop completion for kanban tasks.
   * Supports both reordering within the same column and moving between columns.
   * @param result - Drop result from @hello-pangea/dnd
   */
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceStatus = source.droppableId as Task["status"];
    const destStatus = destination.droppableId as Task["status"];

    if (sourceStatus === destStatus) {
      // Reorder tasks within the same column
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
      // Move task to a different column (update status)
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
          <button
            onClick={() => setViewMode("TASKS")}
            aria-pressed={viewMode === "TASKS"}
            aria-label="View tasks kanban board"
            style={{
              padding: isSmall ? "6px 12px" : "8px 20px",
              background:
                viewMode === "TASKS" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "TASKS" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "TASKS" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${14 * fontSizeScale}px`,
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "TASKS"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "TASKS" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            📋 Tasks
          </button>
          <button
            onClick={() => setViewMode("REQUIREMENTS")}
            aria-pressed={viewMode === "REQUIREMENTS"}
            aria-label="View product requirements list"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "REQUIREMENTS" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "REQUIREMENTS" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "REQUIREMENTS"
                  ? "none"
                  : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "REQUIREMENTS"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "REQUIREMENTS" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            📝 Requirements
          </button>
          <button
            onClick={() => setViewMode("TESTING")}
            aria-pressed={viewMode === "TESTING"}
            aria-label="View test cases management"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "TESTING" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "TESTING" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "TESTING" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "TESTING"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "TESTING" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            ✅ Testing
          </button>
          <button
            onClick={() => setViewMode("AGENTS")}
            aria-pressed={viewMode === "AGENTS"}
            aria-label="View AI agents list"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "AGENTS" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "AGENTS" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "AGENTS" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "AGENTS"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "AGENTS" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            🤖 Agents
          </button>

          <button
            onClick={() => setViewMode("WORKFLOW")}
            aria-pressed={viewMode === "WORKFLOW"}
            aria-label="View agent workflow visualization"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "WORKFLOW" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "WORKFLOW" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "WORKFLOW" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "WORKFLOW"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "WORKFLOW" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            🔄 Workflow
          </button>

          <button
            onClick={() => setViewMode("BUGS")}
            aria-pressed={viewMode === "BUGS"}
            aria-label="View bug tracker"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "BUGS" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "BUGS" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "BUGS" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "BUGS"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "BUGS" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            🐛 Bug Tracker
          </button>
          <button
            onClick={() => setViewMode("GOALS")}
            aria-pressed={viewMode === "GOALS"}
            aria-label="View goals tracker"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "GOALS" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "GOALS" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "GOALS" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "GOALS"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "GOALS" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            🎯 Goals
          </button>
          <button
            onClick={() => setViewMode("TIMELINE")}
            aria-pressed={viewMode === "TIMELINE"}
            aria-label="View project timeline view"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "TIMELINE" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "TIMELINE" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "TIMELINE" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "TIMELINE"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "TIMELINE" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            📅 Timeline
          </button>
          <button
            onClick={() => setViewMode("AUDIT")}
            aria-pressed={viewMode === "AUDIT"}
            aria-label="View security audit log"
            style={{
              padding: "8px 20px",
              background:
                viewMode === "AUDIT" ? COLORS.buttonPrimary : "#ffffff",
              color: viewMode === "AUDIT" ? "#ffffff" : COLORS.text,
              border:
                viewMode === "AUDIT" ? "none" : `2px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                viewMode === "AUDIT"
                  ? COLORS.buttonPrimaryHover
                  : COLORS.buttonSecondary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                viewMode === "AUDIT" ? COLORS.buttonPrimary : "#ffffff";
            }}
          >
            🔍 Audit Log
          </button>
        </div>
      </header>

      {/* ─── Privacy Settings Modal ─── */}
      {showPrivacySettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-settings-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowPrivacySettings(false)}
        >
          <div
            style={{
              background: COLORS.cardBackground,
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="privacy-settings-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "22px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Privacy Settings
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: COLORS.textSecondary,
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              GDPR gives you the right to access, export, import, and delete your personal data.
              All data is stored locally on your device.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <button
                onClick={handleExportData}
                style={{
                  padding: "12px 16px",
                  background: "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#059669";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#10b981";
                }}
              >
                📥 Export All User Data
                <span style={{ fontSize: "12px", opacity: 0.8 }}>Download JSON</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportData}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "12px 16px",
                  background: "#3b82f6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#2563eb";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#3b82f6";
                }}
              >
                📤 Import User Data
                <span style={{ fontSize: "12px", opacity: 0.8 }}>From JSON file</span>
              </button>

              {importMessage && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: importMessage.includes("success") ? "#dcfce7" : "#fee2e2",
                    color: importMessage.includes("success") ? "#166534" : "#991b1b",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  {importMessage}
                </div>
              )}

              <button
                onClick={() => {
                  if (window.confirm("This will delete ALL your data from this browser. This action cannot be undone. Are you sure?")) {
                    deleteAllUserData();
                    addAuditLog(
                      "CLEAR",
                      "SYSTEM",
                      "system",
                      "User requested deletion of all data via privacy settings",
                      currentUser?.username || currentUser?.email || "Unknown"
                    );
                    window.location.reload();
                  }
                }}
                style={{
                  padding: "12px 16px",
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#ef4444";
                }}
              >
                🗑️ Delete All My Data
                <span style={{ fontSize: "12px", opacity: 0.8 }}>GDPR right to be forgotten</span>
              </button>
            </div>
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                paddingTop: "16px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <strong>Your Privacy Rights:</strong>
              </p>
              <ul
                style={{
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  margin: "8px 0 0 20px",
                  paddingLeft: "20px",
                }}
              >
                <li>You can export all your data at any time</li>
                <li>You can import previously exported data</li>
                <li>You can permanently delete all your data</li>
                <li>You can withdraw your privacy consent at any time</li>
              </ul>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <a
                href="https://gdpr-info.eu/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "13px",
                  color: COLORS.buttonPrimary,
                  textDecoration: "none",
                }}
              >
                Learn more about GDPR ↗
              </a>
              <button
                type="button"
                onClick={() => setShowPrivacySettings(false)}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonSecondary,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Data Integrity Validation Banner ─── */}
      {validationResults.length > 0 && showValidationBanner && (
        <div
          style={{
            background: "#fef2f2",
            border: "2px solid #fecaca",
            borderTop: "none",
            padding: "16px 32px",
            margin: "0 0 16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#991b1b",
                }}
              >
                数据完整性校验失败
              </h3>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  color: "#b91c1c",
                }}
              >
                {getValidationSummary(validationResults)}
              </p>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginBottom: "12px",
                }}
              >
                {validationResults.map((result, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    {result.errors.map((error, eIdx) => (
                      <div
                        key={eIdx}
                        style={{
                          padding: "6px 12px",
                          background: "#fee2e2",
                          borderRadius: "4px",
                          marginBottom: "4px",
                          fontSize: "12px",
                          color: "#7f1d1d",
                        }}
                      >
                        <strong>[{error.type}]</strong> {error.field}:{" "}
                        {error.message}
                        {error.id !== "N/A" && (
                          <span style={{ color: "#9ca3af" }}>
                            {" "}
                            (ID: {error.id})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                onClick={() => {
                  // Remove corrupt data: validation already filtered them,
                  // just dismiss the banner
                  setValidationResults([]);
                  setShowValidationBanner(false);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                清除损坏数据
              </button>
              <button
                onClick={() => setShowValidationBanner(false)}
                style={{
                  padding: "8px 16px",
                  background: "#f3f4f6",
                  color: "#4b5563",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        id="main-content"
        style={{ padding: isSmall ? "0 12px 12px 12px" : "0 32px 32px 32px" }}
      >
        {viewMode === "TASKS" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isSmall ? "12px" : "20px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: `${22 * fontSizeScale}px`,
                  fontWeight: 700,
                }}
              >
                Task Board
              </h2>
              <button
                onClick={handleNewTask}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonPrimary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimaryHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimary;
                }}
              >
                + New Task
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, minWidth: isSmall ? "100%" : "200px" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by title, description, or tags..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">All Assignees</option>
                <optgroup label="👤 Agents">
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.nickname}>
                      {agent.nickname}
                    </option>
                  ))}
                </optgroup>
                {allAssignees.length > 0 && (
                  <optgroup label="📋 Other Assignees">
                    {allAssignees.map((assignee) => (
                      <option key={assignee} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {(searchQuery || filterPriority || filterAssignee) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPriority("");
                    setFilterAssignee("");
                  }}
                  style={{
                    padding: "10px 12px",
                    background: COLORS.buttonSecondary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div
                style={{
                  display: "flex",
                  gap: isSmall ? "12px" : "24px",
                  overflowX: "auto",
                  flexWrap: isSmall ? "nowrap" : "nowrap",
                }}
              >
                {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
                  <TaskColumn
                    key={status}
                    status={status}
                    tasks={getFilteredTasksByStatus(status)}
                    requirements={requirements}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    getColumnWidth={getColumnWidth}
                    fontSizeScale={fontSizeScale}
                    isSmall={isSmall}
                    recentlyDraggedTaskId={recentlyDraggedTaskId}
                  />
                ))}
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
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                Product Requirements
              </h2>
              <button
                onClick={handleNewRequirement}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonPrimary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimaryHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimary;
                }}
              >
                + New Requirement
              </button>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {requirements.length === 0 && (
                <div
                  style={{
                    flex: "1",
                    minWidth: "300px",
                    maxWidth: "400px",
                    padding: "40px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "10px",
                    color: COLORS.textSecondary,
                  }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "8px" }}>📋</p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    No requirements yet
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    Click "+ New Requirement" to create one
                  </p>
                </div>
              )}
              {requirements.map((req) => (
                <RequirementCard
                  key={req.id}
                  requirement={req}
                  onEdit={handleEditRequirement}
                  onDelete={handleDeleteRequirement}
                  onAddTest={handleNewTestCase}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === "TESTING" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                Test Cases
              </h2>
              <button
                onClick={() => handleNewTestCase()}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonPrimary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimaryHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = COLORS.buttonPrimary;
                }}
              >
                + New Test Case
              </button>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {testCases.length === 0 && (
                <div
                  style={{
                    flex: "1",
                    minWidth: "300px",
                    maxWidth: "400px",
                    padding: "40px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "10px",
                    color: COLORS.textSecondary,
                  }}
                >
                  <p style={{ fontSize: "18px", marginBottom: "8px" }}>✅</p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    No test cases yet
                  </p>
                  <p style={{ fontSize: "14px" }}>
                    Click "+ New Test Case" to create one
                  </p>
                </div>
              )}
              {testCases.map((test) => {
                const requirement = requirements.find(
                  (r) => r.id === test.requirementId
                );
                return (
                  <TestCaseCard
                    key={test.id}
                    testCase={test}
                    requirement={requirement}
                    onEdit={handleEditTestCase}
                    onDelete={handleDeleteTestCase}
                  />
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "AGENTS" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                Agent Management
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {agents.map((agent) => {
                const agentAssignmentsList = agentAssignments.filter(
                  (a) => a.agentId === agent.id
                );
                const activeAssignment = agentAssignmentsList.find(
                  (a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS"
                );

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    style={{
                      background: COLORS.cardBackground,
                      border: `2px solid ${
                        selectedAgent?.id === agent.id
                          ? agent.color
                          : COLORS.border
                      }`,
                      borderRadius: "12px",
                      padding: "20px",
                      cursor: "pointer",
                      transition:
                        "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
                      boxShadow:
                        selectedAgent?.id === agent.id
                          ? `0 0 0 2px ${agent.color}40`
                          : "none",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = `0 8px 25px rgba(0,0,0,0.12)`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow =
                        selectedAgent?.id === agent.id
                          ? `0 0 0 2px ${agent.color}40`
                          : "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {agent.status === "WORKING" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "3px",
                          background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                          animation: "pulseProgress 2s ease-in-out infinite",
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: agent.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "16px",
                          position: "relative",
                          boxShadow: `0 4px 12px ${agent.color}40`,
                        }}
                      >
                        {agent.name.charAt(0)}
                        {agent.status === "WORKING" && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: "#f97316",
                              border: "3px solid white",
                              animation: "pulseDot 1.5s ease-in-out infinite",
                            }}
                          />
                        )}
                        {agent.status === "IDLE" && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: "#22c55e",
                              border: "3px solid white",
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: 700,
                            color: agent.color,
                          }}
                        >
                          {agent.nickname}
                        </h3>
                        <p
                          style={{
                            margin: "2px 0 4px 0",
                            fontSize: "12px",
                            color: COLORS.textSecondary,
                          }}
                        >
                          {agent.name}
                        </p>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color:
                              agent.status === "IDLE"
                                ? "#22c55e"
                                : agent.status === "WORKING"
                                ? "#f97316"
                                : agent.status === "COMPLETED"
                                ? "#22c55e"
                                : "#ef4444",
                            background:
                              agent.status === "IDLE"
                                ? "#dcfce7"
                                : agent.status === "WORKING"
                                ? "#ffedd5"
                                : agent.status === "COMPLETED"
                                ? "#dcfce7"
                                : "#fee2e2",
                            animation:
                              agent.status === "WORKING"
                                ? "statusPulse 2s ease-in-out infinite"
                                : "none",
                          }}
                        >
                          {agent.status === "IDLE"
                            ? "🟢 Idle"
                            : agent.status === "WORKING"
                            ? "🔴 Working..."
                            : agent.status === "COMPLETED"
                            ? "✅ Completed"
                            : "❌ Failed"}
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        color: COLORS.textSecondary,
                        lineHeight: "1.4",
                      }}
                    >
                      {agent.description}
                    </p>

                    {agent.currentTask && (
                      <div
                        style={{
                          background: `${agent.color}08`,
                          border: `1px solid ${agent.color}20`,
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          animation: "slideIn 0.3s ease-out",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>⚡</span>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: agent.color,
                              fontWeight: 700,
                            }}
                          >
                            Working On:
                          </p>
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "13px",
                            color: COLORS.text,
                            fontWeight: 500,
                          }}
                        >
                          {agent.currentTask}
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                          flex: 1,
                          background: "#f0fdf4",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#22c55e",
                          }}
                        >
                          {agent.tasksCompleted}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: COLORS.textSecondary,
                          }}
                        >
                          Completed
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          flex: 1,
                          background: "#fef2f2",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#ef4444",
                          }}
                        >
                          {agent.tasksFailed}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: COLORS.textSecondary,
                          }}
                        >
                          Failed
                        </p>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          flex: 1,
                          background: `${agent.color}10`,
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: 700,
                            color: agent.color,
                          }}
                        >
                          {agent.tasksCompleted + agent.tasksFailed}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: COLORS.textSecondary,
                          }}
                        >
                          Total
                        </p>
                      </div>
                    </div>

                    {agent.tasksCompleted + agent.tasksFailed > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            fontSize: "12px",
                            color: COLORS.textSecondary,
                            fontWeight: 600,
                          }}
                        >
                          Completion Rate
                        </p>
                        <div
                          style={{
                            height: "6px",
                            background: "#e5e7eb",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)`,
                              borderRadius: "3px",
                              width: `${
                                (agent.tasksCompleted /
                                  (agent.tasksCompleted + agent.tasksFailed)) *
                                100
                              }%`,
                              transition: "width 0.5s ease-out",
                            }}
                          />
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "11px",
                            color: agent.color,
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(
                            (agent.tasksCompleted /
                              (agent.tasksCompleted + agent.tasksFailed)) *
                              100
                          )}
                          %
                        </p>
                      </div>
                    )}

                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {agent.capabilities.slice(0, 3).map((capability) => (
                        <span
                          key={capability}
                          style={{
                            padding: "4px 8px",
                            background: `${agent.color}15`,
                            color: agent.color,
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {capability}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: COLORS.textSecondary,
                            paddingTop: "4px",
                          }}
                        >
                          +{agent.capabilities.length - 3} more
                        </span>
                      )}
                    </div>

                    {agent.status === "IDLE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgentToAssign(agent);
                          setShowAssignModal(true);
                        }}
                        style={{
                          width: "100%",
                          marginTop: "16px",
                          padding: "10px",
                          background: agent.color,
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = `${agent.color}cc`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = agent.color;
                        }}
                      >
                        📋 Assign Task
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedAgent && (
              <div
                style={{
                  marginTop: "32px",
                  background: COLORS.cardBackground,
                  borderRadius: "12px",
                  padding: "24px",
                  border: `2px solid ${selectedAgent.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: selectedAgent.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "20px",
                      }}
                    >
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "22px",
                          fontWeight: 700,
                          color: selectedAgent.color,
                        }}
                      >
                        {selectedAgent.nickname}
                      </h3>
                      <p
                        style={{
                          margin: "2px 0 4px 0",
                          fontSize: "14px",
                          color: COLORS.text,
                        }}
                      >
                        {selectedAgent.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                        }}
                      >
                        {selectedAgent.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    style={{
                      padding: "8px 16px",
                      background: COLORS.buttonSecondary,
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "18px",
                        fontWeight: 700,
                        color:
                          selectedAgent.status === "IDLE"
                            ? "#22c55e"
                            : selectedAgent.status === "WORKING"
                            ? "#f97316"
                            : "#ef4444",
                      }}
                    >
                      {selectedAgent.status === "IDLE"
                        ? "🟢 Idle"
                        : selectedAgent.status === "WORKING"
                        ? "🔴 Working"
                        : selectedAgent.status === "COMPLETED"
                        ? "✅ Completed"
                        : "❌ Failed"}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Tasks Completed
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#22c55e",
                      }}
                    >
                      {selectedAgent.tasksCompleted}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Tasks Failed
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#ef4444",
                      }}
                    >
                      {selectedAgent.tasksFailed}
                    </p>
                  </div>
                  <div
                    style={{
                      background: "#f3f4f6",
                      padding: "16px",
                      borderRadius: "8px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Success Rate
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: COLORS.text,
                      }}
                    >
                      {selectedAgent.tasksCompleted +
                        selectedAgent.tasksFailed >
                      0
                        ? Math.round(
                            (selectedAgent.tasksCompleted /
                              (selectedAgent.tasksCompleted +
                                selectedAgent.tasksFailed)) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Description
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: COLORS.textSecondary,
                      lineHeight: "1.6",
                    }}
                  >
                    {selectedAgent.description}
                  </p>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Capabilities
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {selectedAgent.capabilities.map((capability) => (
                      <span
                        key={capability}
                        style={{
                          padding: "6px 12px",
                          background: `${selectedAgent.color}20`,
                          color: selectedAgent.color,
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Task History
                  </h4>
                  {agentAssignments.filter(
                    (a) => a.agentId === selectedAgent.id
                  ).length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        border: "2px dashed #d1d5db",
                        borderRadius: "8px",
                        color: COLORS.textSecondary,
                      }}
                    >
                      <p style={{ fontSize: "14px" }}>No tasks assigned yet</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {agentAssignments
                        .filter((a) => a.agentId === selectedAgent.id)
                        .sort(
                          (a, b) =>
                            new Date(b.assignedAt).getTime() -
                            new Date(a.assignedAt).getTime()
                        )
                        .map((assignment) => (
                          <div
                            key={assignment.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 16px",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              borderLeft: `3px solid ${
                                assignment.status === "COMPLETED"
                                  ? "#22c55e"
                                  : assignment.status === "FAILED"
                                  ? "#ef4444"
                                  : "#f97316"
                              }`,
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: COLORS.text,
                                }}
                              >
                                {assignment.taskTitle}
                              </p>
                              <p
                                style={{
                                  margin: "4px 0 0 0",
                                  fontSize: "12px",
                                  color: COLORS.textSecondary,
                                }}
                              >
                                Assigned:{" "}
                                {new Date(
                                  assignment.assignedAt
                                ).toLocaleDateString()}
                                {assignment.completionTime &&
                                  ` | Completed: ${new Date(
                                    assignment.completionTime
                                  ).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color:
                                    assignment.status === "COMPLETED"
                                      ? "#22c55e"
                                      : assignment.status === "FAILED"
                                      ? "#ef4444"
                                      : "#f97316",
                                  background:
                                    assignment.status === "COMPLETED"
                                      ? "#dcfce7"
                                      : assignment.status === "FAILED"
                                      ? "#fee2e2"
                                      : "#ffedd5",
                                }}
                              >
                                {assignment.status === "ASSIGNED"
                                  ? "Assigned"
                                  : assignment.status === "IN_PROGRESS"
                                  ? "In Progress"
                                  : assignment.status === "COMPLETED"
                                  ? "Completed"
                                  : "Failed"}
                              </span>
                              {(assignment.status === "ASSIGNED" ||
                                assignment.status === "IN_PROGRESS") && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleCompleteAgentTask(assignment.id)
                                    }
                                    style={{
                                      padding: "6px 12px",
                                      background: "#22c55e",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ✅ Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleFailAgentTask(assignment.id)
                                    }
                                    style={{
                                      padding: "6px 12px",
                                      background: "#ef4444",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ❌ Fail
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {selectedAgent.status === "IDLE" && (
                  <button
                    onClick={() => {
                      setAgentToAssign(selectedAgent);
                      setShowAssignModal(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: selectedAgent.color,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = `${selectedAgent.color}cc`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = selectedAgent.color;
                    }}
                  >
                    📋 Assign New Task to {selectedAgent.nickname}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === "WORKFLOW" && (
          <div style={{ width: "100%" }}>
            <AgentWorkflow agents={agents} onAgentUpdate={setAgents} />
          </div>
        )}

        {viewMode === "BUGS" && (
          <BugTracker
            bugs={bugs}
            tasks={tasks}
            requirements={requirements}
            onCreateBug={handleNewBug}
            onEditBug={(bug) => {
              setEditingBug(bug);
            }}
            onUpdateBug={(bug) => {
              const isNew = !bugs.find((b) => b.id === bug.id);
              setBugs((prev) => {
                const exists = prev.find((b) => b.id === bug.id);
                if (exists) {
                  return prev.map((b) => (b.id === bug.id ? bug : b));
                }
                return [...prev, bug];
              });
              if (isNew) {
                addAuditLog("CREATE", "BUG", bug.id, `Bug created: "${bug.title}"`);
              } else {
                addAuditLog("UPDATE", "BUG", bug.id, `Bug updated: "${bug.title}"`);
              }
            }}
            onDeleteBug={(bugId, expectedUpdatedAt) => {
              const bug = bugs.find((b) => b.id === bugId);
              
              // Optimistic lock check
              if (expectedUpdatedAt && bug && bug.updatedAt !== expectedUpdatedAt) {
                window.alert("Conflict: This bug was modified by someone else. Refresh and try again.");
                return;
              }
              
              setBugs((prev) => prev.filter((b) => b.id !== bugId));
              addAuditLog("DELETE", "BUG", bugId, bug ? `Bug deleted: "${bug.title}"` : `Bug ID: ${bugId} deleted`);
            }}
            onAddBugComment={(bugId, content, author) => {
              setBugs((prev) =>
                prev.map((b) =>
                  b.id === bugId
                    ? {
                        ...b,
                        comments: [
                          ...b.comments,
                          {
                            id: `comment-${Date.now()}`,
                            bugId,
                            author,
                            content,
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : b
                )
              );
            }}
          />
        )}

        {viewMode === "GOALS" && (
          <GoalTracker
            goals={goals}
            tasks={tasks}
            requirements={requirements}
            milestones={milestones}
            keyResults={keyResults}
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {viewMode === "TIMELINE" && (
          <TimelineView
            goals={goals}
            requirements={requirements}
          />
        )}

        {viewMode === "AUDIT" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                🔍 Security Audit Log
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: COLORS.textSecondary,
                    marginLeft: "12px",
                  }}
                >
                  ISO 27001 Compliant
                </span>
              </h2>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: COLORS.textSecondary,
                    background: COLORS.columnBackground,
                    padding: "4px 10px",
                    borderRadius: "999px",
                  }}
                >
                  {filteredAuditLogs.length} entries
                </span>
                <button
                  onClick={() => {
                    setFilterAuditAction("");
                    setFilterAuditTarget("");
                    setFilterAuditStartDate("");
                    setFilterAuditEndDate("");
                  }}
                  style={{
                    padding: "6px 12px",
                    background: COLORS.buttonSecondary,
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <select
                value={filterAuditAction}
                onChange={(e) => setFilterAuditAction(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="EXPORT">EXPORT</option>
                <option value="IMPORT">IMPORT</option>
                <option value="CLEAR">CLEAR</option>
              </select>

              <select
                value={filterAuditTarget}
                onChange={(e) => setFilterAuditTarget(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="">All Targets</option>
                <option value="TASK">TASK</option>
                <option value="REQUIREMENT">REQUIREMENT</option>
                <option value="TEST_CASE">TEST_CASE</option>
                <option value="BUG">BUG</option>
                <option value="GOAL">GOAL</option>
                <option value="MILESTONE">MILESTONE</option>
                <option value="KEY_RESULT">KEY_RESULT</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>

              <input
                type="date"
                value={filterAuditStartDate}
                onChange={(e) => setFilterAuditStartDate(e.target.value)}
                placeholder="Start Date"
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                }}
              />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: COLORS.textSecondary,
                  fontSize: "13px",
                }}
              >
                to
              </span>
              <input
                type="date"
                value={filterAuditEndDate}
                onChange={(e) => setFilterAuditEndDate(e.target.value)}
                placeholder="End Date"
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 80px 100px 1fr 160px",
                  gap: "0",
                  background: COLORS.columnBackground,
                  padding: "10px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <div>Timestamp</div>
                <div>Action</div>
                <div>Target</div>
                <div>Details</div>
                <div>User</div>
              </div>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {filteredAuditLogs.length === 0 ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: COLORS.textSecondary,
                      fontSize: "14px",
                    }}
                  >
                    No audit log entries found.
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => {
                    const actionColor =
                      log.action === "CREATE"
                        ? COLORS.auditCreate
                        : log.action === "UPDATE"
                        ? COLORS.auditUpdate
                        : log.action === "DELETE"
                        ? COLORS.auditDelete
                        : log.action === "LOGIN"
                        ? COLORS.auditLogin
                        : log.action === "LOGOUT"
                        ? COLORS.auditLogout
                        : log.action === "EXPORT"
                        ? COLORS.auditExport
                        : log.action === "IMPORT"
                        ? COLORS.auditImport
                        : COLORS.auditClear;
                    const targetColor =
                      log.target === "TASK"
                        ? COLORS.auditTask
                        : log.target === "REQUIREMENT"
                        ? COLORS.auditRequirement
                        : log.target === "TEST_CASE"
                        ? COLORS.auditTestCase
                        : log.target === "BUG"
                        ? COLORS.auditBug
                        : log.target === "GOAL"
                        ? COLORS.auditGoal
                        : log.target === "MILESTONE"
                        ? COLORS.auditMilestone
                        : log.target === "KEY_RESULT"
                        ? COLORS.auditKeyResult
                        : COLORS.auditSystem;
                    return (
                      <div
                        key={log.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 80px 100px 1fr 160px",
                          gap: "0",
                          padding: "10px 16px",
                          borderBottom: `1px solid ${COLORS.border}`,
                          fontSize: "13px",
                          color: COLORS.text,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: actionColor,
                              background: `${actionColor}15`,
                              border: `1px solid ${actionColor}40`,
                            }}
                          >
                            {log.action}
                          </span>
                        </div>
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: targetColor,
                              background: `${targetColor}15`,
                              border: `1px solid ${targetColor}40`,
                            }}
                          >
                            {log.target}
                          </span>
                        </div>
                        <div>{log.details}</div>
                        <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                          {log.username}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Privacy Policy Footer ─── */}
      <footer
        style={{
          padding: "16px 32px",
          borderTop: `1px solid ${COLORS.border}`,
          textAlign: "center",
          background: "#ffffff",
          marginTop: "24px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: COLORS.textSecondary,
          }}
        >
          <a
            href="https://gdpr-info.eu/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: COLORS.buttonPrimary,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </a>
          {" "}|{" "}
          <span
            onClick={() => setShowPrivacySettings(true)}
            style={{
              color: COLORS.buttonPrimary,
              cursor: "pointer",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Privacy Settings
          </span>
          {" "}| All data is encrypted and stored locally on your device.
        </p>
      </footer>

      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            style={{
              background: COLORS.cardBackground,
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="privacy-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "22px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Privacy Policy
            </h2>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                marginBottom: "20px",
                fontSize: "14px",
                lineHeight: "1.6",
                color: COLORS.textSecondary,
              }}
            >
              <p>
                This application collects and stores task management data on
                your local device using localStorage.
              </p>
              <h3
                style={{
                  margin: "16px 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Data Collection
              </h3>
              <ul style={{ margin: "0 0 16px 20px", padding: 0 }}>
                <li>Task titles, descriptions, and statuses</li>
                <li>Requirement information</li>
                <li>Test case details</li>
                <li>Tag history</li>
                <li>Assignee names</li>
              </ul>
              <h3
                style={{
                  margin: "16px 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Data Storage
              </h3>
              <p>
                All data is stored locally on your device and is not transmitted
                to any external servers. You can clear all data at any time by
                clearing your browser's localStorage.
              </p>
              <h3
                style={{
                  margin: "16px 0 8px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Your Rights
              </h3>
              <ul style={{ margin: "0 0 16px 20px", padding: 0 }}>
                <li>You have the right to access your data</li>
                <li>You have the right to delete your data</li>
                <li>You have the right to withdraw consent</li>
              </ul>
              <p>
                By clicking "I Accept", you acknowledge that you have read and
                understood our privacy policy.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonSecondary,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConsent}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonDanger,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Revoke Consent
              </button>
              <button
                type="button"
                onClick={handlePrivacyConsent}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonPrimary,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={showModal}
        modalType={modalType}
        editingTask={editingTask}
        editingRequirement={editingRequirement}
        editingTestCase={editingTestCase}
        editingBug={editingBug}
        formData={formData}
        setFormData={setFormData}
        requirements={requirements}
        tagHistory={tagHistory}
        agents={agents}
        onSave={
          modalType === "task"
            ? handleSaveTask
            : modalType === "requirement"
            ? handleSaveRequirement
            : modalType === "bug"
            ? handleSaveBug
            : handleSaveTestCase
        }
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
          setEditingRequirement(null);
          setEditingTestCase(null);
          setEditingBug(null);
        }}
        fontSizeScale={fontSizeScale}
        isSmall={isSmall}
        taskComments={
          editingTask ? comments.filter((c) => c.taskId === editingTask.id) : []
        }
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {showAssignModal && agentToAssign && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-modal-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => {
            setShowAssignModal(false);
            setAgentToAssign(null);
          }}
        >
          <div
            style={{
              background: COLORS.cardBackground,
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="assign-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "22px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Assign Task to {agentToAssign.nickname}
            </h2>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: COLORS.textSecondary,
              }}
            >
              Select a task from the list below to assign to this agent:
            </p>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "20px",
              }}
            >
              {tasks.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    color: COLORS.textSecondary,
                  }}
                >
                  <p style={{ fontSize: "14px" }}>
                    No tasks available to assign
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() =>
                        handleAssignTaskToAgent(agentToAssign!, task.id)
                      }
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        background: "#f9fafb",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor =
                          agentToAssign!.color;
                        e.currentTarget.style.background = `${
                          agentToAssign!.color
                        }10`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.background = "#f9fafb";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 600,
                              color: COLORS.text,
                            }}
                          >
                            {task.title}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              color: COLORS.textSecondary,
                            }}
                          >
                            Status: {task.status} | Priority: {task.priority}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color:
                              task.status === "TODO"
                                ? "#f97316"
                                : task.status === "IN_PROGRESS"
                                ? "#eab308"
                                : "#22c55e",
                            background:
                              task.status === "TODO"
                                ? "#ffedd5"
                                : task.status === "IN_PROGRESS"
                                ? "#fef9c3"
                                : "#dcfce7",
                          }}
                        >
                          {task.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setAgentToAssign(null);
                }}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonSecondary,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
