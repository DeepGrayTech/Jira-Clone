"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import type { AuthUser } from "../hooks/useAuth";
import LoginForm from "./LoginForm";
import Modal from "./Modal";
import DashboardNavigation from "./DashboardNavigation";
import {
  TasksView,
  RequirementsView,
  TestingView,
  BugsView,
  GoalsView,
  AuditView,
  NotificationsView,
} from "../views";
import NotificationCenter from "./NotificationCenter";
import NotificationSettingsPanel from "./NotificationSettingsPanel";
import { COLORS, STORAGE_KEYS } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { useWindow } from "../hooks/useWindow";
import { useDataLoader } from "../hooks/useDataLoader";
import { usePersistence } from "../hooks/usePersistence";
import { useValidation } from "../hooks/useValidation";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import { useViewMode } from "../hooks/useViewMode";
import { useTasks } from "../contexts/TaskContext";
import { useRequirements } from "../contexts/RequirementContext";
import { useBugs } from "../contexts/BugContext";
import { useGoals } from "../contexts/GoalContext";
import { useAuditLogs } from "../contexts/AuditContext";
import { useTestCases } from "../contexts/TestCaseContext";
import { useShared } from "../contexts/SharedContext";
import { useEpics } from "../contexts/EpicContext";
import EpicSelector from "./EpicSelector";
import { AuditService } from "../services/AuditService";
import { EpicService } from "../services/EpicService";
import type {
  Task,
  Requirement,
  TestCase,
  FormFields,
  Bug,
  Goal,
  ModalType,
  ViewMode,
  Epic,
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

export default function DashboardShell() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
  } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const {
    windowWidth,
    isClient,
    showPrivacyModal,
    setShowPrivacyModal,
    privacyConsented,
    setPrivacyConsented,
    effectiveWidth,
    isSmall,
    isMedium,
  } = useWindow(setShowModal);

  const { viewMode, setViewMode } = useViewMode();

  const [modalType, setModalType] = useState<ModalType>("task");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRequirement, setEditingRequirement] =
    useState<Requirement | null>(null);
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
    epicId: "",
  });

  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auditService = new AuditService();

  return (
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
      showNotificationSettings={showNotificationSettings}
      setShowNotificationSettings={setShowNotificationSettings}
      importMessage={importMessage}
      setImportMessage={setImportMessage}
      fileInputRef={fileInputRef}
      isSmall={isSmall}
      isMedium={isMedium}
      auditService={auditService}
    />
  );
}

interface DashboardContentProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: AuthUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalType: ModalType;
  setModalType: React.Dispatch<React.SetStateAction<ModalType>>;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  editingRequirement: Requirement | null;
  setEditingRequirement: React.Dispatch<
    React.SetStateAction<Requirement | null>
  >;
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
  showNotificationSettings: boolean;
  setShowNotificationSettings: React.Dispatch<React.SetStateAction<boolean>>;
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
  showNotificationSettings,
  setShowNotificationSettings,
  importMessage,
  setImportMessage,
  fileInputRef,
  isSmall,
  isMedium,
  auditService,
}: DashboardContentProps) {
  const { tasks, setTasks, addTask, updateTask } = useTasks();
  const {
    requirements,
    setRequirements,
    addRequirement,
    updateRequirement,
    deleteRequirement,
  } = useRequirements();
  const { bugs, setBugs, addBug, updateBug, deleteBug } = useBugs();
  const {
    goals,
    setGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    milestones,
    setMilestones,
    keyResults,
    setKeyResults,
  } = useGoals();
  const { auditLogs, setAuditLogs, addAuditLog } = useAuditLogs();
  const {
    testCases,
    setTestCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
  } = useTestCases();
  const { comments, setComments, tagHistory, setTagHistory } = useShared();
  const {
    epics,
    currentEpicId,
    setCurrentEpic,
    addEpic,
    updateEpic,
    setEpics,
    deleteEpic,
  } = useEpics();

  const [isInitialized, setIsInitialized] = useState(false);
  console.log(
    `[DashboardLayout] Component mounted | epicsCount=${epics.length}`
  );
  const [showNewEpicModal, setShowNewEpicModal] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [showDeleteEpicModal, setShowDeleteEpicModal] = useState(false);
  const [epicToDelete, setEpicToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [showEditEpicModal, setShowEditEpicModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editEpicTitle, setEditEpicTitle] = useState("");
  const [editEpicDescription, setEditEpicDescription] = useState("");
  const [editEpicColor, setEditEpicColor] = useState("#3b82f6");

  const handleNewEpic = useCallback(() => {
    console.log(`[Epic] handleNewEpic | START | opening create modal`);
    setNewEpicTitle("");
    setShowNewEpicModal(true);
    console.log(
      `[Epic] handleNewEpic | COMPLETE | modal opened, newEpicTitle reset to empty`
    );
  }, []);

  const handleEditEpic = useCallback((epic: Epic) => {
    console.log(
      `[DashboardLayout] handleEditEpic | opening edit modal | epicId=${epic.id} | epicTitle="${epic.title}"`
    );
    setEditingEpic(epic);
    setEditEpicTitle(epic.title);
    setEditEpicDescription(epic.description || "");
    setEditEpicColor(epic.color);
    setShowEditEpicModal(true);
  }, []);

  const handleDeleteEpic = useCallback(
    (epicId: string) => {
      if (showDeleteEpicModal || epicToDelete) {
        console.log(
          `[DashboardLayout] onDeleteEpic | SKIPPED (race condition) | epicId=${epicId} | showDeleteEpicModal=${showDeleteEpicModal}`
        );
        return;
      }
      const epic = epics.find((e) => e.id === epicId);
      if (epic) {
        console.log(
          `[DashboardLayout] onDeleteEpic | opening confirm modal | epicId=${epicId} | epicTitle="${epic.title}"`
        );
        setEpicToDelete({ id: epicId, title: epic.title });
        setShowDeleteEpicModal(true);
      } else {
        console.warn(
          `[DashboardLayout] onDeleteEpic | epic not found | epicId=${epicId}`
        );
      }
    },
    [showDeleteEpicModal, epicToDelete, epics]
  );

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
    setIsInitialized,
    setEpics
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
    setTagHistory,
    epics
  );

  const {
    validationResults,
    setValidationResults,
    showValidationBanner,
    setShowValidationBanner,
  } = useValidation(
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

  const {
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
  } = useDashboardLogic({
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
  });

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
              flexWrap: "wrap",
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
            <React.Profiler
              id="EpicSelector"
              onRender={(
                id,
                phase,
                actualDuration,
                baseDuration,
                startTime,
                commitTime
              ) => {
                console.log(
                  `[Perf] ${id} | phase=${phase} | actual=${actualDuration.toFixed(
                    2
                  )}ms | base=${baseDuration.toFixed(2)}ms | commit=${(
                    commitTime - startTime
                  ).toFixed(2)}ms`
                );
              }}
            >
              <EpicSelector
                epics={epics}
                currentEpicId={currentEpicId}
                onEpicChange={setCurrentEpic}
                onNewEpic={handleNewEpic}
                onEditEpic={handleEditEpic}
                onDeleteEpic={handleDeleteEpic}
                fontSizeScale={fontSizeScale}
              />
            </React.Profiler>
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
              onClick={() => setShowNotificationSettings(true)}
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
              🔔 Notifications
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

            <NotificationCenter
              fontSizeScale={fontSizeScale}
              onViewChange={setViewMode}
            />
          </div>
        </div>

        {importMessage && (
          <div
            style={{
              marginTop: `${12 * fontSizeScale}px`,
              padding: `${10 * fontSizeScale}px`,
              background: importMessage.includes("successfully")
                ? "#dcfce7"
                : "#fee2e2",
              color: importMessage.includes("successfully")
                ? "#166534"
                : "#991b1b",
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
              This application stores your data locally in your browser's
              localStorage. By accepting, you consent to the storage and
              processing of your data for the purpose of using this application.
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

      {showNotificationSettings && (
        <NotificationSettingsPanel
          fontSizeScale={fontSizeScale}
          onClose={() => setShowNotificationSettings(false)}
        />
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
              <li
                style={{
                  marginBottom: "8px",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                You can export all your data at any time
              </li>
              <li
                style={{
                  marginBottom: "8px",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                You can import previously exported data
              </li>
              <li
                style={{
                  marginBottom: "8px",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
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
            setShowModal={setShowModal}
            currentEpicId={currentEpicId}
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
            currentEpicId={currentEpicId}
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
            currentEpicId={currentEpicId}
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
                relatedGoalId: "",
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
                epicId: bug.epicId || "",
              });
              setShowModal(true);
            }}
            currentEpicId={currentEpicId}
          />
        )}

        {viewMode === "GOALS" && (
          <GoalsView
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            currentEpicId={currentEpicId}
          />
        )}

        {viewMode === "AUDIT" && <AuditView fontSizeScale={fontSizeScale} />}

        {viewMode === "NOTIFICATIONS" && (
          <NotificationsView
            fontSizeScale={fontSizeScale}
            isSmall={isSmall}
            onViewChange={setViewMode}
          />
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
        goals={goals}
        epics={epics}
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

      {showNewEpicModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-epic-modal-title"
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
              maxWidth: "400px",
            }}
          >
            <h2
              id="new-epic-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Create New Epic
            </h2>
            <input
              type="text"
              value={newEpicTitle}
              onChange={(e) => setNewEpicTitle(e.target.value)}
              placeholder="Enter Epic name"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "16px",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowNewEpicModal(false)}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newEpicTitle.trim()) {
                    console.log(
                      `[Epic] Create | START | title="${newEpicTitle.trim()}" | existingEpicsCount=${
                        epics.length
                      }`
                    );

                    const epicService = new EpicService();
                    console.log(`[Epic] Create | EpicService instantiated`);

                    const existingIds = epics.map((e) => e.id);
                    console.log(
                      `[Epic] Create | existingIds=${JSON.stringify(
                        existingIds
                      )}`
                    );

                    const newEpic = epicService.createEpic(
                      newEpicTitle.trim(),
                      "",
                      "#3b82f6",
                      existingIds
                    );
                    console.log(
                      `[Epic] Create | epic created | id=${newEpic.id} | title="${newEpic.title}" | color=${newEpic.color} | createdAt=${newEpic.createdAt}`
                    );

                    addEpic(newEpic);
                    console.log(
                      `[Epic] Create | addEpic dispatched | newEpicsCount=${
                        epics.length + 1
                      }`
                    );

                    setShowNewEpicModal(false);
                    console.log(`[Epic] Create | modal closed`);

                    setNewEpicTitle("");
                    console.log(`[Epic] Create | COMPLETE | form reset`);
                  } else {
                    console.log(`[Epic] Create | SKIPPED | title is empty`);
                  }
                }}
                disabled={!newEpicTitle.trim()}
                style={{
                  padding: "10px 24px",
                  background: newEpicTitle.trim()
                    ? COLORS.buttonPrimary
                    : "#93c5fd",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: newEpicTitle.trim() ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteEpicModal && epicToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-epic-modal-title"
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
              maxWidth: "400px",
            }}
          >
            <h2
              id="delete-epic-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: "#ef4444",
              }}
            >
              Confirm Delete
            </h2>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "14px",
                color: COLORS.text,
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete the Epic "
              <strong>{epicToDelete.title}</strong>"?
            </p>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "13px",
                color: COLORS.textSecondary,
                lineHeight: "1.5",
              }}
            >
              This action will also delete all associated tasks, requirements,
              test cases, bugs, goals, and comments. This cannot be undone.
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
                onClick={() => {
                  setShowDeleteEpicModal(false);
                  setEpicToDelete(null);
                }}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!epicToDelete) {
                    console.warn(
                      `[DashboardLayout] confirmDeleteEpic | SKIPPED (epicToDelete is null)`
                    );
                    return;
                  }

                  const deleteStartTime = performance.now();
                  performance.mark("delete-epic-start");

                  console.log(
                    `[DashboardLayout] confirmDeleteEpic | starting | epicId=${epicToDelete.id} | epicTitle="${epicToDelete.title}"`
                  );

                  const tasksToDelete = tasks
                    .filter((t) => t.epicId === epicToDelete.id)
                    .map((t) => t.id);
                  const goalsToDelete = goals
                    .filter((g) => g.epicId === epicToDelete.id)
                    .map((g) => g.id);
                  const reqsToDelete = requirements
                    .filter((r) => r.epicId === epicToDelete.id)
                    .map((r) => r.id);
                  const testCasesToDelete = testCases
                    .filter((tc) => tc.epicId === epicToDelete.id)
                    .map((tc) => tc.id);
                  const bugsToDelete = bugs
                    .filter((b) => b.epicId === epicToDelete.id)
                    .map((b) => b.id);

                  console.log(
                    `[DashboardLayout] confirmDeleteEpic | cascading deletes | tasks=${tasksToDelete.length} | requirements=${reqsToDelete.length} | testCases=${testCasesToDelete.length} | bugs=${bugsToDelete.length} | goals=${goalsToDelete.length}`
                  );

                  setTasks((prev) =>
                    prev.filter((t) => t.epicId !== epicToDelete.id)
                  );
                  setRequirements((prev) =>
                    prev.filter((r) => r.epicId !== epicToDelete.id)
                  );
                  setTestCases((prev) =>
                    prev.filter((tc) => tc.epicId !== epicToDelete.id)
                  );
                  setBugs((prev) =>
                    prev.filter((b) => b.epicId !== epicToDelete.id)
                  );
                  setGoals((prev) =>
                    prev.filter((g) => g.epicId !== epicToDelete.id)
                  );
                  setMilestones((prev) =>
                    prev.filter((m) => !goalsToDelete.includes(m.goalId))
                  );
                  setKeyResults((prev) =>
                    prev.filter((kr) => !goalsToDelete.includes(kr.goalId))
                  );
                  setComments((prev) =>
                    prev.filter((c) => !tasksToDelete.includes(c.taskId))
                  );
                  deleteEpic(epicToDelete.id);

                  setShowDeleteEpicModal(false);
                  setEpicToDelete(null);

                  const deleteEndTime = performance.now();
                  performance.mark("delete-epic-end");
                  performance.measure(
                    "delete-epic-full-cycle",
                    "delete-epic-start",
                    "delete-epic-end"
                  );

                  const measure = performance.getEntriesByName(
                    "delete-epic-full-cycle"
                  )[0];
                  console.log(
                    `[Perf] Epic Delete | fullCycle=${
                      measure?.duration.toFixed(2) ||
                      (deleteEndTime - deleteStartTime).toFixed(2)
                    }ms | tasks=${tasksToDelete.length} | epicsBefore=${
                      epics.length
                    } | epicsAfter=${epics.length - 1}`
                  );
                  performance.clearMarks("delete-epic-start");
                  performance.clearMarks("delete-epic-end");
                  performance.clearMeasures("delete-epic-full-cycle");

                  console.log(
                    `[DashboardLayout] confirmDeleteEpic | completed | epicId=${epicToDelete.id}`
                  );
                }}
                style={{
                  padding: "10px 24px",
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditEpicModal && editingEpic && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-epic-modal-title"
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
              id="edit-epic-modal-title"
              style={{
                margin: "0 0 16px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Edit Epic
            </h2>
            <input
              type="text"
              value={editEpicTitle}
              onChange={(e) => setEditEpicTitle(e.target.value)}
              placeholder="Epic title"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "12px",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <textarea
              value={editEpicDescription}
              onChange={(e) => setEditEpicDescription(e.target.value)}
              placeholder="Epic description (optional)"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "12px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: COLORS.text,
                }}
              >
                Color:
              </label>
              <input
                type="color"
                value={editEpicColor}
                onChange={(e) => setEditEpicColor(e.target.value)}
                style={{
                  width: "48px",
                  height: "36px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: "2px",
                }}
              />
              <span style={{ fontSize: "14px", color: COLORS.textSecondary }}>
                {editEpicColor}
              </span>
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
                  setShowEditEpicModal(false);
                  setEditingEpic(null);
                }}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingEpic) {
                    console.warn(
                      `[DashboardLayout] confirmEditEpic | SKIPPED (editingEpic is null)`
                    );
                    return;
                  }

                  const updateStartTime = performance.now();
                  performance.mark("update-epic-start");

                  console.log(
                    `[DashboardLayout] confirmEditEpic | starting | epicId=${editingEpic.id} | oldTitle="${editingEpic.title}" | newTitle="${editEpicTitle}"`
                  );

                  const updates: Partial<Epic> = {
                    title: editEpicTitle.trim(),
                    description: editEpicDescription.trim(),
                    color: editEpicColor,
                  };

                  updateEpic(editingEpic.id, updates);

                  setShowEditEpicModal(false);
                  setEditingEpic(null);

                  const updateEndTime = performance.now();
                  performance.mark("update-epic-end");
                  performance.measure(
                    "update-epic-full-cycle",
                    "update-epic-start",
                    "update-epic-end"
                  );

                  const measure = performance.getEntriesByName(
                    "update-epic-full-cycle"
                  )[0];
                  console.log(
                    `[Perf] Epic Update | fullCycle=${
                      measure?.duration.toFixed(2) ||
                      (updateEndTime - updateStartTime).toFixed(2)
                    }ms | epicId=${editingEpic.id}`
                  );
                  performance.clearMarks("update-epic-start");
                  performance.clearMarks("update-epic-end");
                  performance.clearMeasures("update-epic-full-cycle");

                  console.log(
                    `[DashboardLayout] confirmEditEpic | completed | epicId=${editingEpic.id}`
                  );
                }}
                disabled={!editEpicTitle.trim()}
                style={{
                  padding: "10px 24px",
                  background: editEpicTitle.trim()
                    ? COLORS.buttonPrimary
                    : "#93c5fd",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: editEpicTitle.trim() ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
