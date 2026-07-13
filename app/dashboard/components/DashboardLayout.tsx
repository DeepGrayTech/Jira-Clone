"use client";

import React, { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { getAuthState, logoutAndClear, hasPermission, getCurrentUser, type User } from "@/lib/auth";
import { exportUserData, importUserData, deleteAllUserData } from "@/lib/privacy";
import LoginForm from "./LoginForm";
import Modal from "./Modal";
import DashboardNavigation from "./DashboardNavigation";
import { TasksView, RequirementsView, TestingView, BugsView, GoalsView, AuditView } from "../views";
import { COLORS, STORAGE_KEYS } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { useWindow } from "../hooks/useWindow";
import { useDataLoader } from "../hooks/useDataLoader";
import { usePersistence } from "../hooks/usePersistence";
import { useValidation } from "../hooks/useValidation";
import { TaskProvider, useTasks } from "../contexts/TaskContext";
import { RequirementProvider, useRequirements } from "../contexts/RequirementContext";
import { BugProvider, useBugs } from "../contexts/BugContext";
import { GoalProvider, useGoals } from "../contexts/GoalContext";
import { AuditProvider, useAuditLogs } from "../contexts/AuditContext";
import { TestCaseProvider, useTestCases } from "../contexts/TestCaseContext";
import { SharedProvider, useShared } from "../contexts/SharedContext";
import { AuditService } from "../services/AuditService";
import type {
  Task,
  Requirement,
  TestCase,
  FormFields,
  Bug,
  Goal,
  ModalType,
  ViewMode,
} from "../types";
import { validateDataIntegrity, getValidationSummary } from "@/lib/validation";
import type { ValidationResult } from "../types";
import {
  isValidTaskStatus,
  isValidTaskPriority,
  isValidRequirementStatus,
  isValidRequirementPriority,
  isValidTestCaseStatus,
} from "../types";

export default function DashboardLayout() {
  const { isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { windowWidth, isClient, showPrivacyModal, setShowPrivacyModal, privacyConsented, setPrivacyConsented, effectiveWidth, isSmall, isMedium } = useWindow(setShowModal);

  const [viewMode, setViewMode] = useState<ViewMode>("TASKS");
  const [modalType, setModalType] = useState<ModalType>("task");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [formData, setFormData] = useState<FormFields>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    tags: [],
    assignee: "",
    relatedRequirementId: "",
    figmaUrl: "",
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

  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = React.createRef<HTMLInputElement>();

  const auditService = new AuditService();

  return (
    <TaskProvider>
      <RequirementProvider>
        <BugProvider>
        <GoalProvider>
          <AuditProvider>
            <TestCaseProvider>
              <SharedProvider>
                <DashboardContent
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  showModal={showModal}
                  setShowModal={setShowModal}
                  modalType={modalType}
                  setModalType={setModalType}
                  editingTask={editingTask}
                  setEditingTask={setEditingTask}
                  editingRequirement={editingRequirement}
                  setEditingRequirement={setEditingRequirement}
                  editingTestCase={editingTestCase}
                  setEditingTestCase={setEditingTestCase}
                  editingBug={editingBug}
                  setEditingBug={setEditingBug}
                  formData={formData}
                  setFormData={setFormData}
                  showPrivacyModal={showPrivacyModal}
                  setShowPrivacyModal={setShowPrivacyModal}
                  privacyConsented={privacyConsented}
                  setPrivacyConsented={setPrivacyConsented}
                  showPrivacySettings={showPrivacySettings}
                  setShowPrivacySettings={setShowPrivacySettings}
                  importMessage={importMessage}
                  setImportMessage={setImportMessage}
                  fileInputRef={fileInputRef}
                  isSmall={isSmall}
                  isMedium={isMedium}
                  auditService={auditService}
                />
              </SharedProvider>
            </TestCaseProvider>
          </AuditProvider>
        </GoalProvider>
      </BugProvider>
      </RequirementProvider>
    </TaskProvider>
  );
}

interface DashboardContentProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalType: ModalType;
  setModalType: React.Dispatch<React.SetStateAction<ModalType>>;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  editingRequirement: Requirement | null;
  setEditingRequirement: React.Dispatch<React.SetStateAction<Requirement | null>>;
  editingTestCase: TestCase | null;
  setEditingTestCase: React.Dispatch<React.SetStateAction<TestCase | null>>;
  editingBug: Bug | null;
  setEditingBug: React.Dispatch<React.SetStateAction<Bug | null>>;
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  showPrivacyModal: boolean;
  setShowPrivacyModal: React.Dispatch<React.SetStateAction<boolean>>;
  privacyConsented: boolean;
  setPrivacyConsented: React.Dispatch<React.SetStateAction<boolean>>;
  showPrivacySettings: boolean;
  setShowPrivacySettings: React.Dispatch<React.SetStateAction<boolean>>;
  importMessage: string;
  setImportMessage: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isSmall: boolean;
  isMedium: boolean;
  auditService: AuditService;
}

function DashboardContent({
  isAuthenticated,
  setIsAuthenticated,
  currentUser,
  setCurrentUser,
  viewMode,
  setViewMode,
  showModal,
  setShowModal,
  modalType,
  setModalType,
  editingTask,
  setEditingTask,
  editingRequirement,
  setEditingRequirement,
  editingTestCase,
  setEditingTestCase,
  editingBug,
  setEditingBug,
  formData,
  setFormData,
  showPrivacyModal,
  setShowPrivacyModal,
  privacyConsented,
  setPrivacyConsented,
  showPrivacySettings,
  setShowPrivacySettings,
  importMessage,
  setImportMessage,
  fileInputRef,
  isSmall,
  isMedium,
  auditService,
}: DashboardContentProps) {
  const { tasks, setTasks, addTask, updateTask } = useTasks();
  const { requirements, setRequirements, addRequirement, updateRequirement, deleteRequirement } = useRequirements();
  const { bugs, setBugs, addBug, updateBug, deleteBug } = useBugs();
  const { goals, setGoals, addGoal, updateGoal, deleteGoal, milestones, setMilestones, keyResults, setKeyResults } = useGoals();
  const { auditLogs, setAuditLogs, addAuditLog } = useAuditLogs();
  const { testCases, setTestCases, addTestCase, updateTestCase, deleteTestCase } = useTestCases();
  const { comments, setComments, tagHistory, setTagHistory } = useShared();

  const [isInitialized, setIsInitialized] = useState(false);

  useDataLoader(
    setTasks,
    setRequirements,
    setTestCases,
    setBugs,
    setGoals,
    setMilestones,
    setKeyResults,
    setTagHistory,
    setComments,
    setAuditLogs,
    setIsInitialized
  );

  usePersistence(
    tasks,
    requirements,
    testCases,
    bugs,
    goals,
    milestones,
    keyResults,
    tagHistory,
    comments,
    auditLogs,
    isInitialized,
    setTagHistory
  );

  const { validationResults, setValidationResults, showValidationBanner, setShowValidationBanner } = useValidation(
    isInitialized,
    tasks,
    requirements,
    testCases,
    bugs,
    goals,
    milestones,
    keyResults,
    setTasks,
    setRequirements,
    setTestCases,
    setBugs,
    setGoals,
    setMilestones,
    setKeyResults
  );

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

  const handleAddComment = (taskId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    const newComment = {
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
        auditService.logAction(
          "CLEAR",
          "SYSTEM",
          "system",
          "Privacy consent revoked - all data cleared",
          currentUser?.username || currentUser?.email || "Unknown"
        )
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
      setTagHistory([]);
      setComments([]);
    }
  };

  const handleLoginSuccess = () => {
    const auth = getAuthState();
    addAuditLog(
      auditService.logAction(
        "LOGIN",
        "SYSTEM",
        "system",
        `User "${auth.user?.username || auth.user?.email}" logged in`,
        auth.user?.username || auth.user?.email || "Unknown"
      )
    );
  };

  const handleLogout = () => {
    const username = currentUser?.username || currentUser?.email || "Unknown";
    addAuditLog(
      auditService.logAction(
        "LOGOUT",
        "SYSTEM",
        "system",
        `User "${username}" logged out`,
        username
      )
    );
    logoutAndClear();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleExportData = () => {
    exportUserData();
    addAuditLog(
      auditService.logAction(
        "EXPORT",
        "SYSTEM",
        "system",
        "User data exported to JSON file",
        currentUser?.username || currentUser?.email || "Unknown"
      )
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

      if (validationResults.length > 0) {
        setImportMessage(
          `Data integrity warnings:\n${validationResults.join("\n")}\nImport aborted. Please fix the data file.`
        );
        setTimeout(() => setImportMessage(""), 8000);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

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

      addAuditLog(
        auditService.logAction(
          "IMPORT",
          "SYSTEM",
          "system",
          `Data imported from file: ${file.name}`,
          currentUser?.username || currentUser?.email || "Unknown"
        )
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

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all data? This action cannot be undone."
      )
    ) {
      addAuditLog(
        auditService.logAction(
          "CLEAR",
          "SYSTEM",
          "system",
          "All application data cleared by admin",
          currentUser?.username || currentUser?.email || "Unknown"
        )
      );
      setTasks([]);
      setRequirements([]);
      setTestCases([]);
      setTagHistory([]);
      setComments([]);
      setBugs([]);
      setGoals([]);
      setMilestones([]);
      setKeyResults([]);
      setAuditLogs([]);
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem("jira-clone-privacy-consent");
    }
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
      figmaUrl: "",
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

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        status: isValidTaskStatus(formData.status) ? formData.status : "TODO",
        priority: isValidTaskPriority(formData.priority) ? formData.priority : "MEDIUM",
        dueDate: formData.dueDate,
        tags: formData.tags,
        assignee: formData.assignee,
        relatedRequirementId: formData.relatedRequirementId || undefined,
        figmaUrl: formData.figmaUrl || undefined,
      });
      addAuditLog(
        auditService.logAction(
          "UPDATE",
          "TASK",
          editingTask.id,
          `Task updated: "${formData.title}"`
        )
      );
    } else {
      const newTask: Task = {
        id: "task-" + Date.now(),
        title: formData.title,
        description: formData.description,
        status: isValidTaskStatus(formData.status) ? formData.status : "TODO",
        priority: isValidTaskPriority(formData.priority) ? formData.priority : "MEDIUM",
        dueDate: formData.dueDate,
        tags: formData.tags,
        assignee: formData.assignee,
        relatedRequirementId: formData.relatedRequirementId || undefined,
        figmaUrl: formData.figmaUrl || undefined,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      addTask(newTask);
      addAuditLog(
        auditService.logAction(
          "CREATE",
          "TASK",
          newTask.id,
          `Task created: "${formData.title}"`
        )
      );
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
      figmaUrl: "",
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

  const handleSaveRequirement = () => {
    if (!formData.title.trim()) return;

    const acceptanceCriteriaArray = formData.acceptanceCriteria
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s);

    if (editingRequirement) {
      updateRequirement(editingRequirement.id, {
        title: formData.title,
        description: formData.description,
        status: isValidRequirementStatus(formData.status) ? formData.status : "DRAFT",
        priority: isValidRequirementPriority(formData.priority) ? formData.priority : "MEDIUM",
        acceptanceCriteria: acceptanceCriteriaArray,
        requester: formData.requester,
        executor: formData.executor,
      });
      addAuditLog(
        auditService.logAction(
          "UPDATE",
          "REQUIREMENT",
          editingRequirement.id,
          `Requirement updated: "${formData.title}"`
        )
      );
    } else {
      const newReq: Requirement = {
        id: "req-" + Date.now(),
        title: formData.title,
        description: formData.description,
        priority: isValidRequirementPriority(formData.priority) ? formData.priority : "MEDIUM",
        status: isValidRequirementStatus(formData.status) ? formData.status : "DRAFT",
        acceptanceCriteria: acceptanceCriteriaArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requester: formData.requester,
        executor: formData.executor,
      };
      addRequirement(newReq);
      addAuditLog(
        auditService.logAction(
          "CREATE",
          "REQUIREMENT",
          newReq.id,
          `Requirement created: "${formData.title}"`
        )
      );
    }

    setShowModal(false);
    setEditingRequirement(null);
  };

  const handleNewTestCase = () => {
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
      relatedRequirementId: "",
      figmaUrl: "",
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

  const handleSaveTestCase = () => {
    if (!formData.title.trim()) return;

    const stepsArray = Array.isArray(formData.steps)
      ? formData.steps
      : formData.steps.split("\n").map((s) => s.trim()).filter((s) => s);

    if (editingTestCase) {
      updateTestCase(editingTestCase.id, {
        title: formData.title,
        description: formData.description,
        steps: stepsArray,
        expectedResult: formData.expectedResult,
        status: isValidTestCaseStatus(formData.status) ? formData.status : "PENDING",
        executor: formData.assignee || undefined,
      });
      addAuditLog(
        auditService.logAction(
          "UPDATE",
          "TEST_CASE",
          editingTestCase.id,
          `Test case updated: "${formData.title}"`
        )
      );
    } else {
      const newTcId = "t" + Date.now();
      const newTestCase: TestCase = {
        id: newTcId,
        requirementId: formData.relatedRequirementId,
        title: formData.title,
        description: formData.description,
        steps: stepsArray,
        expectedResult: formData.expectedResult,
        status: isValidTestCaseStatus(formData.status) ? formData.status : "PENDING",
      };
      addTestCase(newTestCase);
      addAuditLog(
        auditService.logAction(
          "CREATE",
          "TEST_CASE",
          newTcId,
          `Test case created: "${formData.title}"`
        )
      );
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
      figmaUrl: "",
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
      : formData.stepsToReproduce.split("\n").map((s) => s.trim()).filter((s) => s);

    const reporter = currentUser?.username || currentUser?.email || "Current User";

    if (editingBug) {
      updateBug(editingBug.id, {
        title: formData.title,
        description: formData.description,
        severity: (formData.severity || "MEDIUM") as Bug["severity"],
        priority: (formData.bugPriority || "MEDIUM") as Bug["priority"],
        stepsToReproduce: stepsToReproduceArray,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
      });
      addAuditLog(
        auditService.logAction(
          "UPDATE",
          "BUG",
          editingBug.id,
          `Bug updated: "${formData.title}"`
        )
      );
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
      addBug(newBug);
      addAuditLog(
        auditService.logAction(
          "CREATE",
          "BUG",
          newBugId,
          `Bug created: "${formData.title}"`
        )
      );
    }

    setShowModal(false);
    setEditingBug(null);
  };

  const handleCreateGoal = (goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
    if (!goalData.title || !goalData.title.trim()) return;
    if (!goalData.startDate || !goalData.endDate) return;

    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addGoal(newGoal);
    addAuditLog(
      auditService.logAction(
        "CREATE",
        "GOAL",
        newGoal.id,
        `Goal created: "${goalData.title}"`
      )
    );
  };

  const handleUpdateGoal = (goal: Goal) => {
    if (!goal.title || !goal.title.trim()) return;
    updateGoal(goal.id, goal);
    addAuditLog(
      auditService.logAction(
        "UPDATE",
        "GOAL",
        goal.id,
        `Goal updated: "${goal.title}"`
      )
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
    addAuditLog(
      auditService.logAction(
        "DELETE",
        "GOAL",
        goalId,
        `Goal deleted: ID ${goalId}`
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background }}>
      <header
        style={{
          background: COLORS.cardBackground,
          padding: `${16 * fontSizeScale}px ${32 * fontSizeScale}px`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${12 * fontSizeScale}px`,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: `${24 * fontSizeScale}px`,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              📊 Jira Clone
            </h1>
            <span
              style={{
                fontSize: `${12 * fontSizeScale}px`,
                color: COLORS.textSecondary,
                background: "#f3f4f6",
                padding: `${4 * fontSizeScale}px ${8 * fontSizeScale}px`,
                borderRadius: "4px",
              }}
            >
              Dashboard
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${12 * fontSizeScale}px`,
              flexWrap: "wrap",
            }}
          >
            {currentUser && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${8 * fontSizeScale}px`,
                  padding: `${8 * fontSizeScale}px ${12 * fontSizeScale}px`,
                  background: "#f3f4f6",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    width: `${28 * fontSizeScale}px`,
                    height: `${28 * fontSizeScale}px`,
                    borderRadius: "50%",
                    background: COLORS.buttonPrimary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: `${12 * fontSizeScale}px`,
                    fontWeight: 600,
                  }}
                >
                  {currentUser.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span
                  style={{
                    fontSize: `${13 * fontSizeScale}px`,
                    fontWeight: 500,
                    color: COLORS.text,
                  }}
                >
                  {currentUser.username || currentUser.email}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowPrivacySettings(true)}
              style={{
                padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
                background: COLORS.buttonSecondary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 500,
              }}
            >
              🔒 Privacy
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              style={{
                padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
                background: COLORS.buttonSecondary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 500,
              }}
            >
              📥 Import
            </button>

            <button
              onClick={handleExportData}
              style={{
                padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
                background: COLORS.buttonSecondary,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 500,
              }}
            >
              📤 Export
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
                background: COLORS.buttonDanger,
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${13 * fontSizeScale}px`,
                fontWeight: 500,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {importMessage && (
          <div
            style={{
              marginTop: `${12 * fontSizeScale}px`,
              padding: `${10 * fontSizeScale}px`,
              background:
                importMessage.includes("successfully")
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                importMessage.includes("successfully") ? "#166534" : "#991b1b",
              borderRadius: "6px",
              fontSize: `${13 * fontSizeScale}px`,
              fontWeight: 500,
            }}
          >
            {importMessage}
          </div>
        )}
      </header>

      {showPrivacyModal && !privacyConsented && (
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
            zIndex: 3000,
          }}
        >
          <div
            style={{
              background: COLORS.cardBackground,
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
            }}
          >
            <h2
              id="privacy-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Privacy Consent
            </h2>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: COLORS.textSecondary,
                lineHeight: "1.6",
              }}
            >
              This application stores your data locally in your browser's localStorage.
              By accepting, you consent to the storage and processing of your data
              for the purpose of using this application.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleRevokeConsent}
                style={{
                  padding: "10px 24px",
                  background: COLORS.buttonSecondary,
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="privacy-settings-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Privacy Settings
            </h2>
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "14px",
                color: COLORS.textSecondary,
                lineHeight: "1.6",
              }}
            >
              Your privacy is important to us. You have the following rights:
            </p>
            <ul
              style={{
                margin: "0 0 16px 0",
                paddingLeft: "20px",
              }}
            >
              <li style={{ marginBottom: "8px", fontSize: "13px", color: COLORS.textSecondary }}>
                You can export all your data at any time
              </li>
              <li style={{ marginBottom: "8px", fontSize: "13px", color: COLORS.textSecondary }}>
                You can import previously exported data
              </li>
              <li style={{ marginBottom: "8px", fontSize: "13px", color: COLORS.textSecondary }}>
                You can permanently delete all your data
              </li>
              <li style={{ fontSize: "13px", color: COLORS.textSecondary }}>
                You can withdraw your privacy consent at any time
              </li>
            </ul>
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
                Data Integrity Validation Failed
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
                Clear Corrupt Data
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        id="main-content"
        style={{ padding: isSmall ? "0 12px 12px 12px" : "0 32px 32px 32px" }}
      >
        <DashboardNavigation
          currentView={viewMode}
          onViewChange={setViewMode}
          fontSizeScale={fontSizeScale}
        />

        {viewMode === "TASKS" && (
          <TasksView
            fontSizeScale={fontSizeScale}
            isSmall={isSmall}
            getColumnWidth={getColumnWidth}
            onCreateTask={handleNewTask}
            onEditTask={handleSaveTask}
            setEditingTask={setEditingTask}
            setModalType={setModalType}
            setFormData={setFormData}
          />
        )}

        {viewMode === "REQUIREMENTS" && (
          <RequirementsView
            fontSizeScale={fontSizeScale}
            isSmall={isSmall}
            getColumnWidth={getColumnWidth}
            onCreateRequirement={handleNewRequirement}
            onEditRequirement={handleSaveRequirement}
            setEditingRequirement={setEditingRequirement}
            setModalType={setModalType}
            setFormData={setFormData}
            setShowModal={setShowModal}
          />
        )}

        {viewMode === "TESTING" && (
          <TestingView
            fontSizeScale={fontSizeScale}
            isSmall={isSmall}
            getColumnWidth={getColumnWidth}
            onCreateTestCase={handleNewTestCase}
            onEditTestCase={handleSaveTestCase}
            setEditingTestCase={setEditingTestCase}
            setModalType={setModalType}
            setFormData={setFormData}
            setShowModal={setShowModal}
          />
        )}

        {viewMode === "BUGS" && (
          <BugsView
            onCreateBug={handleNewBug}
            onEditBug={(bug) => {
              setEditingBug(bug);
              setModalType("bug");
              setFormData({
                title: bug.title,
                description: bug.description,
                status: bug.status,
                priority: bug.priority,
                dueDate: "",
                tags: [],
                assignee: bug.assignee || "",
                relatedRequirementId: bug.relatedRequirementId || "",
                figmaUrl: "",
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
          />
        )}

        {viewMode === "GOALS" && (
          <GoalsView
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {viewMode === "AUDIT" && (
          <AuditView fontSizeScale={fontSizeScale} />
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportData}
        style={{ display: "none" }}
        aria-label="Import data file"
      />

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
    </div>
  );
}