"use client";

import { useCallback } from "react";
import { logoutAndClear } from "@/lib/auth";
import type { AuthUser } from "./useAuth";
import { exportUserData, deleteAllUserData } from "@/lib/privacy";
import { importDataApi } from "../services/api";
import { validateDataIntegrity, getValidationSummary } from "@/lib/validation";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import { useBugs } from "../contexts/BugContext";
import { useGoals } from "../contexts/GoalContext";
import { useAuditLogs } from "../contexts/AuditContext";
import { useTestCases } from "../contexts/TestCaseContext";
import { useShared } from "../contexts/SharedContext";
import { AuditService } from "../services/AuditService";
import type {
  Task,
  Requirement,
  TestCase,
  FormFields,
  Bug,
  Goal,
  Epic,
  Milestone,
  KeyResult,
  ModalType,
} from "../types";
import {
  isValidTaskStatus,
  isValidTaskPriority,
  isValidRequirementStatus,
  isValidRequirementPriority,
  isValidTestCaseStatus,
} from "../types";

interface UseDashboardLogicProps {
  currentUser: AuthUser | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
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
  setShowPrivacyModal: React.Dispatch<React.SetStateAction<boolean>>;
  setPrivacyConsented: React.Dispatch<React.SetStateAction<boolean>>;
  setImportMessage: React.Dispatch<React.SetStateAction<string>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  currentEpicId: string | null;
}

export const useDashboardLogic = ({
  currentUser,
  setIsAuthenticated,
  setCurrentUser,
  setShowModal,
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
  setShowPrivacyModal,
  setPrivacyConsented,
  setImportMessage,
  fileInputRef,
  currentEpicId,
}: UseDashboardLogicProps) => {
  const { tasks, setTasks, addTask, updateTask } = useTasks();
  const { requirements, setRequirements, addRequirement, updateRequirement, deleteRequirement } = useRequirements();
  const { bugs, setBugs, addBug, updateBug, deleteBug } = useBugs();
  const { goals, setGoals, addGoal, updateGoal, deleteGoal, milestones, setMilestones, keyResults, setKeyResults } = useGoals();
  const { auditLogs, setAuditLogs, addAuditLog } = useAuditLogs();
  const { testCases, setTestCases, addTestCase, updateTestCase, deleteTestCase } = useTestCases();
  const { comments, setComments, tagHistory, setTagHistory, addComment, deleteComment } = useShared();

  const auditService = new AuditService();

  const handleAddComment = useCallback((taskId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    const newComment = {
      id: Date.now().toString(),
      taskId,
      author: currentUser.username || currentUser.email || "Unknown",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    addComment(newComment).catch((err) => console.warn("添加评论失败", err));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments || []), newComment] }
          : t
      )
    );
  }, [currentUser, setComments, setTasks]);

  const handleDeleteComment = useCallback((commentId: string, taskId: string) => {
    deleteComment(commentId).catch((err) => console.warn("删除评论失败", err));
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
  }, [setComments, setTasks]);

  const handlePrivacyConsent = useCallback(() => {
    setPrivacyConsented(true);
    setShowPrivacyModal(false);
    localStorage.setItem("jira-clone-privacy-consent", "true");
  }, [setPrivacyConsented, setShowPrivacyModal]);

  const handleRevokeConsent = useCallback(() => {
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
  }, [
    currentUser,
    addAuditLog,
    setIsAuthenticated,
    setCurrentUser,
    setPrivacyConsented,
    setShowPrivacyModal,
    setTasks,
    setRequirements,
    setTestCases,
    setBugs,
    setGoals,
    setMilestones,
    setKeyResults,
    setAuditLogs,
    setTagHistory,
    setComments,
  ]);

  const handleLoginSuccess = useCallback(() => {
    const username = currentUser?.username || currentUser?.email || "Unknown";
    addAuditLog(
      auditService.logAction(
        "LOGIN",
        "SYSTEM",
        "system",
        `User "${username}" logged in`,
        username
      )
    );
  }, [currentUser, addAuditLog]);

  const handleLogout = useCallback(() => {
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
  }, [currentUser, addAuditLog, setIsAuthenticated, setCurrentUser]);

  const handleExportData = useCallback(() => {
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
  }, [currentUser, addAuditLog]);

  const handleImportData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportMessage("Importing...");
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file");
      }
      const importedData = parsed?.data || parsed;
      if (!importedData || typeof importedData !== "object") {
        throw new Error(
          "Invalid data format. The file does not contain valid Jira Clone export data."
        );
      }

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

      validateAndCollect(importedData.tasks as Task[], "Task");
      validateAndCollect(importedData.requirements as Requirement[], "Requirement");
      validateAndCollect(importedData.testCases as TestCase[], "TestCase");
      validateAndCollect(importedData.bugs as Bug[], "Bug");
      validateAndCollect(importedData.goals as Goal[], "Goal");

      if (validationResults.length > 0) {
        setImportMessage(
          `Data integrity warnings:\\n${validationResults.join("\\n")}\\nImport aborted. Please fix the data file.`
        );
        setTimeout(() => setImportMessage(""), 8000);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const tasks = Array.isArray(importedData.tasks) ? (importedData.tasks as Task[]) : [];
      const requirements = Array.isArray(importedData.requirements) ? (importedData.requirements as Requirement[]) : [];
      const testCases = Array.isArray(importedData.testCases) ? (importedData.testCases as TestCase[]) : [];
      const bugs = Array.isArray(importedData.bugs) ? (importedData.bugs as Bug[]) : [];
      const goals = Array.isArray(importedData.goals) ? (importedData.goals as Goal[]) : [];
      const milestones = Array.isArray(importedData.milestones) ? (importedData.milestones as Milestone[]) : [];
      const keyResults = Array.isArray(importedData.keyResults) ? (importedData.keyResults as KeyResult[]) : [];
      const epics = Array.isArray(importedData.epics) ? (importedData.epics as Epic[]) : [];

      // The export file stores milestones/keyResults flat with goalId refs,
      // while the import API expects them nested inside their goal (Prisma nested create).
      const goalsWithChildren = goals.map((goal) => ({
        ...goal,
        milestones: milestones.filter((m) => m.goalId === goal.id),
        keyResults: keyResults.filter((kr) => kr.goalId === goal.id),
      }));

      await importDataApi({
        epics,
        tasks,
        requirements,
        testCases,
        bugs,
        goals: goalsWithChildren,
      });

      if (tasks.length > 0) {
        setTasks((prev) => [...prev, ...tasks]);
      }
      if (requirements.length > 0) {
        setRequirements((prev) => [...prev, ...requirements]);
      }
      if (testCases.length > 0) {
        setTestCases((prev) => [...prev, ...testCases]);
      }
      if (bugs.length > 0) {
        setBugs((prev) => [...prev, ...bugs]);
      }
      if (goals.length > 0) {
        setGoals((prev) => [...prev, ...goals]);
      }
      if (milestones.length > 0) {
        setMilestones((prev) => [...prev, ...milestones]);
      }
      if (keyResults.length > 0) {
        setKeyResults((prev) => [...prev, ...keyResults]);
      }

      await addAuditLog(
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
  }, [
    setImportMessage,
    fileInputRef,
    setTasks,
    setRequirements,
    setTestCases,
    setBugs,
    setGoals,
    setMilestones,
    setKeyResults,
    addAuditLog,
    currentUser,
  ]);

  const handleClearAllData = useCallback(() => {
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
      deleteAllUserData();
    }
  }, [
    currentUser,
    addAuditLog,
    setTasks,
    setRequirements,
    setTestCases,
    setTagHistory,
    setComments,
    setBugs,
    setGoals,
    setMilestones,
    setKeyResults,
    setAuditLogs,
  ]);

  const handleNewTask = useCallback(() => {
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
      relatedGoalId: "",
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
  }, [setEditingTask, setModalType, setFormData, setShowModal]);

  const handleSaveTask = useCallback(() => {
    if (!formData.title.trim()) {
      console.warn("[handleSaveTask] 任务标题不能为空");
      return;
    }

    if (editingTask) {
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: isValidTaskStatus(formData.status) ? formData.status : "TODO",
        priority: isValidTaskPriority(formData.priority) ? formData.priority : "MEDIUM",
        dueDate: formData.dueDate,
        tags: formData.tags,
        assignee: formData.assignee,
        relatedRequirementId: formData.relatedRequirementId || undefined,
        figmaUrl: formData.figmaUrl || undefined,
      };

      console.log("[handleSaveTask] === 开始更新任务 ===");
      console.log("[handleSaveTask] 任务ID:", editingTask.id);
      console.log("[handleSaveTask] 原始数据:", {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        tags: editingTask.tags,
        assignee: editingTask.assignee,
        relatedRequirementId: editingTask.relatedRequirementId,
        figmaUrl: editingTask.figmaUrl,
      });
      console.log("[handleSaveTask] 更新数据:", updateData);

      updateTask(editingTask.id, updateData);
      
      console.log("[handleSaveTask] 任务更新成功");

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
        epicId: currentEpicId || undefined,
      };

      console.log("[handleSaveTask] === 开始创建任务 ===");
      console.log("[handleSaveTask] 新任务数据:", newTask);

      addTask(newTask);
      
      console.log("[handleSaveTask] 任务创建成功, ID:", newTask.id);

      addAuditLog(
        auditService.logAction(
          "CREATE",
          "TASK",
          newTask.id,
          `Task created: "${formData.title}"`
        )
      );
    }

    console.log("[handleSaveTask] === 保存完成 ===");
    setShowModal(false);
    setEditingTask(null);
  }, [
    formData,
    editingTask,
    updateTask,
    addTask,
    addAuditLog,
    setShowModal,
    setEditingTask,
  ]);

  const handleNewRequirement = useCallback(() => {
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
      relatedGoalId: "",
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
  }, [setEditingRequirement, setModalType, setFormData, setShowModal]);

  const handleSaveRequirement = useCallback(() => {
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
        epicId: currentEpicId || undefined,
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
  }, [
    formData,
    editingRequirement,
    updateRequirement,
    addRequirement,
    addAuditLog,
    setShowModal,
    setEditingRequirement,
  ]);

  const handleNewTestCase = useCallback(() => {
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
      relatedGoalId: "",
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
  }, [setEditingTestCase, setModalType, setFormData, setShowModal]);

  const handleSaveTestCase = useCallback(() => {
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
        epicId: currentEpicId || undefined,
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
  }, [
    formData,
    editingTestCase,
    updateTestCase,
    addTestCase,
    addAuditLog,
    setShowModal,
    setEditingTestCase,
  ]);

  const handleNewBug = useCallback(() => {
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
      relatedGoalId: "",
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
  }, [setEditingBug, setModalType, setFormData, setShowModal]);

  const handleSaveBug = useCallback(() => {
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
        epicId: currentEpicId || undefined,
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
  }, [
    formData,
    currentUser,
    editingBug,
    updateBug,
    addBug,
    addAuditLog,
    setShowModal,
    setEditingBug,
  ]);

  const handleCreateGoal = useCallback((goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
    if (!goalData.title || !goalData.title.trim()) return;
    if (!goalData.startDate || !goalData.endDate) return;

    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      epicId: currentEpicId || undefined,
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
  }, [addGoal, addAuditLog, currentEpicId]);

  const handleUpdateGoal = useCallback((goal: Goal) => {
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
  }, [updateGoal, addAuditLog]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    deleteGoal(goalId);
    setTasks((prev) =>
      prev.map((task) =>
        task.relatedGoalId === goalId ? { ...task, relatedGoalId: undefined } : task
      )
    );
    setRequirements((prev) =>
      prev.map((req) =>
        req.relatedGoalId === goalId ? { ...req, relatedGoalId: undefined } : req
      )
    );
    addAuditLog(
      auditService.logAction(
        "DELETE",
        "GOAL",
        goalId,
        `Goal deleted: ID ${goalId}`
      )
    );
  }, [deleteGoal, setTasks, setRequirements, addAuditLog]);

  return {
    handleAddComment,
    handleDeleteComment,
    handlePrivacyConsent,
    handleRevokeConsent,
    handleLoginSuccess,
    handleLogout,
    handleExportData,
    handleImportData,
    handleClearAllData,
    handleNewTask,
    handleSaveTask,
    handleNewRequirement,
    handleSaveRequirement,
    handleNewTestCase,
    handleSaveTestCase,
    handleNewBug,
    handleSaveBug,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal,
  };
};