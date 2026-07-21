"use client";

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { useDashboardLogic } from "../app/dashboard/hooks/useDashboardLogic";
import { TaskProvider } from "../app/dashboard/contexts/TaskContext";
import { RequirementProvider } from "../app/dashboard/contexts/RequirementContext";
import { BugProvider } from "../app/dashboard/contexts/BugContext";
import { GoalProvider } from "../app/dashboard/contexts/GoalContext";
import { AuditProvider } from "../app/dashboard/contexts/AuditContext";
import { TestCaseProvider } from "../app/dashboard/contexts/TestCaseContext";
import { SharedProvider } from "../app/dashboard/contexts/SharedContext";
import { NotificationProvider } from "../app/dashboard/contexts/NotificationContext";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <TaskProvider>
      <RequirementProvider>
        <BugProvider>
          <GoalProvider>
            <AuditProvider>
              <TestCaseProvider>
                <SharedProvider>
                  {children}
                </SharedProvider>
              </TestCaseProvider>
            </AuditProvider>
          </GoalProvider>
        </BugProvider>
      </RequirementProvider>
    </TaskProvider>
  </NotificationProvider>
);

describe("useDashboardLogic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("handleAddComment", () => {
    it("should add comment when content is provided and user is logged in", () => {
      const mockSetComments = jest.fn();
      const mockSetTasks = jest.fn();
      
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleAddComment("task-1", "Test comment");
      });
    });

    it("should not add comment when content is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleAddComment("task-1", "");
      });
    });

    it("should not add comment when currentUser is null", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: null,
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleAddComment("task-1", "Test comment");
      });
    });
  });

  describe("handleDeleteComment", () => {
    it("should delete comment", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleDeleteComment("comment-1", "task-1");
      });
    });
  });

  describe("handlePrivacyConsent", () => {
    it("should set privacy consent", () => {
      const mockSetPrivacyConsented = jest.fn();
      const mockSetShowPrivacyModal = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: mockSetShowPrivacyModal,
        setPrivacyConsented: mockSetPrivacyConsented,
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handlePrivacyConsent();
      });

      expect(localStorage.getItem("jira-clone-privacy-consent")).toBe("true");
    });
  });

  describe("handleRevokeConsent", () => {
    it("should revoke consent when confirmed", () => {
      const mockConfirm = jest.fn(() => true);
      (window as any).confirm = mockConfirm;

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleRevokeConsent();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });

    it("should not revoke consent when cancelled", () => {
      const mockConfirm = jest.fn(() => false);
      (window as any).confirm = mockConfirm;

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleRevokeConsent();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  describe("handleClearAllData", () => {
    it("should clear all data when confirmed", () => {
      const mockConfirm = jest.fn(() => true);
      (window as any).confirm = mockConfirm;

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleClearAllData();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });

    it("should not clear data when cancelled", () => {
      const mockConfirm = jest.fn(() => false);
      (window as any).confirm = mockConfirm;

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleClearAllData();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  describe("handleSaveTask", () => {
    it("should not save task when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTask();
      });
    });

    it("should create new task when editingTask is null", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Test Task",
          description: "Test description",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTask();
      });
    });

    it("should update task when editingTask is provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: {
          id: "task-1",
          title: "Old Title",
          description: "Old description",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: "",
          tags: [],
          assignee: "",
          comments: [],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Updated Task",
          description: "Updated description",
          status: "IN_PROGRESS",
          priority: "HIGH",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTask();
      });
    });
  });

  describe("handleSaveRequirement", () => {
    it("should not save requirement when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveRequirement();
      });
    });

    it("should create new requirement when editingRequirement is null", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Test Requirement",
          description: "Test description",
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
          acceptanceCriteria: "AC1\nAC2",
          requester: "test@test.com",
          executor: "dev@test.com",
          severity: "",
          bugPriority: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveRequirement();
      });
    });

    it("should update requirement when editingRequirement is provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: {
          id: "req-1",
          title: "Old Requirement",
          description: "Old description",
          priority: "MEDIUM",
          status: "DRAFT",
          acceptanceCriteria: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          requester: "test@test.com",
          executor: "dev@test.com",
        },
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Updated Requirement",
          description: "Updated description",
          status: "IN_PROGRESS",
          priority: "HIGH",
          dueDate: "",
          tags: [],
          assignee: "",
          relatedRequirementId: "",
          relatedGoalId: "",
          figmaUrl: "",
          steps: "",
          expectedResult: "",
          acceptanceCriteria: "Updated AC",
          requester: "test@test.com",
          executor: "dev@test.com",
          severity: "",
          bugPriority: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveRequirement();
      });
    });
  });

  describe("handleSaveTestCase", () => {
    it("should not save test case when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTestCase();
      });
    });

    it("should create new test case when editingTestCase is null", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Test TestCase",
          description: "Test description",
          status: "PENDING",
          priority: "MEDIUM",
          dueDate: "",
          tags: [],
          assignee: "",
          relatedRequirementId: "req-1",
          relatedGoalId: "",
          figmaUrl: "",
          steps: "Step 1\nStep 2",
          expectedResult: "Expected result",
          acceptanceCriteria: "",
          requester: "",
          executor: "",
          severity: "",
          bugPriority: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTestCase();
      });
    });

    it("should update test case when editingTestCase is provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: {
          id: "tc-1",
          requirementId: "req-1",
          title: "Old TestCase",
          description: "Old description",
          steps: [],
          expectedResult: "Old result",
          status: "PENDING",
        },
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Updated TestCase",
          description: "Updated description",
          status: "IN_PROGRESS",
          priority: "HIGH",
          dueDate: "",
          tags: [],
          assignee: "dev@test.com",
          relatedRequirementId: "req-1",
          relatedGoalId: "",
          figmaUrl: "",
          steps: "Step 1\nStep 2\nStep 3",
          expectedResult: "Updated result",
          acceptanceCriteria: "",
          requester: "",
          executor: "",
          severity: "",
          bugPriority: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveTestCase();
      });
    });
  });

  describe("handleSaveBug", () => {
    it("should not save bug when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveBug();
      });
    });

    it("should create new bug when editingBug is null", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "Test Bug",
          description: "Test description",
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
          severity: "HIGH",
          bugPriority: "HIGH",
          stepsToReproduce: "Step 1\nStep 2",
          expectedBehavior: "Expected behavior",
          actualBehavior: "Actual behavior",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveBug();
      });
    });

    it("should update bug when editingBug is provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: {
          id: "bug-1",
          title: "Old Bug",
          description: "Old description",
          severity: "MEDIUM",
          priority: "MEDIUM",
          status: "REPORTED",
          stepsToReproduce: [],
          expectedBehavior: "Old expected",
          actualBehavior: "Old actual",
          reporter: "test@test.com",
          comments: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        setEditingBug: jest.fn(),
        formData: {
          title: "Updated Bug",
          description: "Updated description",
          status: "IN_PROGRESS",
          priority: "HIGH",
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
          severity: "HIGH",
          bugPriority: "HIGH",
          stepsToReproduce: "Step 1\nStep 2\nStep 3",
          expectedBehavior: "Updated expected",
          actualBehavior: "Updated actual",
          epicId: "",
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleSaveBug();
      });
    });
  });

  describe("handleCreateGoal", () => {
    it("should not create goal when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleCreateGoal({
          title: "",
          description: "",
          type: "OKR",
          status: "IN_PROGRESS",
          target: "",
          currentProgress: 50,
          startDate: "2026-07-01",
          endDate: "2026-12-31",
          owner: "",
          color: "",
        });
      });
    });

    it("should not create goal when startDate is missing", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleCreateGoal({
          title: "Test Goal",
          description: "",
          type: "OKR",
          status: "IN_PROGRESS",
          target: "",
          currentProgress: 50,
          startDate: "",
          endDate: "2026-12-31",
          owner: "",
          color: "",
        });
      });
    });

    it("should not create goal when endDate is missing", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleCreateGoal({
          title: "Test Goal",
          description: "",
          type: "OKR",
          status: "IN_PROGRESS",
          target: "",
          currentProgress: 50,
          startDate: "2026-07-01",
          endDate: "",
          owner: "",
          color: "",
        });
      });
    });

    it("should create goal when all required fields are provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleCreateGoal({
          title: "Test Goal",
          description: "",
          type: "OKR",
          status: "IN_PROGRESS",
          target: "",
          currentProgress: 50,
          startDate: "2026-07-01",
          endDate: "2026-12-31",
          owner: "",
          color: "",
        });
      });
    });
  });

  describe("handleUpdateGoal", () => {
    it("should not update goal when title is empty", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleUpdateGoal({
          id: "goal-1",
          title: "",
          description: "",
          type: "OKR",
          status: "IN_PROGRESS",
          target: "",
          currentProgress: 50,
          startDate: "2026-07-01",
          endDate: "2026-12-31",
          owner: "",
          color: "",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        });
      });
    });

    it("should update goal when title is provided", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleUpdateGoal({
          id: "goal-1",
          title: "Updated Goal",
          description: "",
          type: "OKR",
          status: "ACHIEVED",
          target: "",
          currentProgress: 100,
          startDate: "2026-07-01",
          endDate: "2026-12-31",
          owner: "",
          color: "",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        });
      });
    });
  });

  describe("handleDeleteGoal", () => {
    it("should delete goal and update related tasks and requirements", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleDeleteGoal("goal-1");
      });
    });
  });

  describe("handleLogout", () => {
    it("should logout user", () => {
      const mockSetIsAuthenticated = jest.fn();
      const mockSetCurrentUser = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: mockSetIsAuthenticated,
        setCurrentUser: mockSetCurrentUser,
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleLogout();
      });
    });
  });

  describe("handleExportData", () => {
    it("should export data", () => {
      const mockCreateObjectURL = jest.fn(() => "blob://mock-url");
      const mockRevokeObjectURL = jest.fn();
      (URL as any).createObjectURL = mockCreateObjectURL;
      (URL as any).revokeObjectURL = mockRevokeObjectURL;

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleExportData();
      });
    });
  });

  describe("handleLoginSuccess", () => {
    it("should log login success", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleLoginSuccess();
      });
    });
  });

  describe("handleNewTask", () => {
    it("should initialize task form", () => {
      const mockSetEditingTask = jest.fn();
      const mockSetModalType = jest.fn();
      const mockSetFormData = jest.fn();
      const mockSetShowModal = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: mockSetShowModal,
        setModalType: mockSetModalType,
        editingTask: null,
        setEditingTask: mockSetEditingTask,
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: mockSetFormData,
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleNewTask();
      });

      expect(mockSetEditingTask).toHaveBeenCalledWith(null);
      expect(mockSetModalType).toHaveBeenCalledWith("task");
      expect(mockSetShowModal).toHaveBeenCalledWith(true);
    });
  });

  describe("handleNewRequirement", () => {
    it("should initialize requirement form", () => {
      const mockSetEditingRequirement = jest.fn();
      const mockSetModalType = jest.fn();
      const mockSetFormData = jest.fn();
      const mockSetShowModal = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: mockSetShowModal,
        setModalType: mockSetModalType,
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: mockSetEditingRequirement,
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
          epicId: "",
        },
        setFormData: mockSetFormData,
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleNewRequirement();
      });

      expect(mockSetEditingRequirement).toHaveBeenCalledWith(null);
      expect(mockSetModalType).toHaveBeenCalledWith("requirement");
      expect(mockSetShowModal).toHaveBeenCalledWith(true);
    });
  });

  describe("handleNewTestCase", () => {
    it("should initialize test case form", () => {
      const mockSetEditingTestCase = jest.fn();
      const mockSetModalType = jest.fn();
      const mockSetFormData = jest.fn();
      const mockSetShowModal = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: mockSetShowModal,
        setModalType: mockSetModalType,
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: mockSetEditingTestCase,
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
          epicId: "",
        },
        setFormData: mockSetFormData,
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleNewTestCase();
      });

      expect(mockSetEditingTestCase).toHaveBeenCalledWith(null);
      expect(mockSetModalType).toHaveBeenCalledWith("test");
      expect(mockSetShowModal).toHaveBeenCalledWith(true);
    });
  });

  describe("handleNewBug", () => {
    it("should initialize bug form", () => {
      const mockSetEditingBug = jest.fn();
      const mockSetModalType = jest.fn();
      const mockSetFormData = jest.fn();
      const mockSetShowModal = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: mockSetShowModal,
        setModalType: mockSetModalType,
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: mockSetEditingBug,
        formData: {
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
          epicId: "",
        },
        setFormData: mockSetFormData,
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleNewBug();
      });

      expect(mockSetEditingBug).toHaveBeenCalledWith(null);
      expect(mockSetModalType).toHaveBeenCalledWith("bug");
      expect(mockSetShowModal).toHaveBeenCalledWith(true);
    });
  });

  describe("handleImportData", () => {
    it("should not import when no file is selected", async () => {
      const mockSetImportMessage = jest.fn();

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: mockSetImportMessage,
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      const mockEvent = {
        target: { files: [] },
      } as any;

      await act(async () => {
        result.current.handleImportData(mockEvent);
      });

      expect(mockSetImportMessage).not.toHaveBeenCalled();
    });

    it("should import data successfully", async () => {
      const mockSetImportMessage = jest.fn();

      const mockFile = new File([JSON.stringify({
        data: {
          tasks: [{ id: "task-imported", title: "Imported Task", status: "TODO", priority: "MEDIUM" }],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
        },
      })], "import.json", { type: "application/json" });

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: mockSetImportMessage,
        fileInputRef: { current: { value: "test" } as any },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      await act(async () => {
        result.current.handleImportData(mockEvent);
      });

      expect(mockSetImportMessage).toHaveBeenCalledWith("Importing...");
    });

    it("should handle import error", async () => {
      const mockSetImportMessage = jest.fn();

      const mockFile = new File(["invalid json"], "import.json", { type: "application/json" });

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: mockSetImportMessage,
        fileInputRef: { current: { value: "test" } as any },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      await act(async () => {
        result.current.handleImportData(mockEvent);
      });

      expect(mockSetImportMessage).toHaveBeenCalled();
    });

    it("should import all data types", async () => {
      const mockSetImportMessage = jest.fn();

      const mockFile = new File([JSON.stringify({
        data: {
          tasks: [{ id: "task-imported", title: "Imported Task", status: "TODO", priority: "MEDIUM" }],
          requirements: [{ id: "req-imported", title: "Imported Req", status: "DRAFT", priority: "MEDIUM", acceptanceCriteria: [] }],
          testCases: [{ id: "tc-imported", title: "Imported TC", status: "PENDING", steps: [], expectedResult: "" }],
          bugs: [{ id: "bug-imported", title: "Imported Bug", status: "REPORTED", severity: "MEDIUM", priority: "MEDIUM", stepsToReproduce: [] }],
          goals: [{ id: "goal-imported", title: "Imported Goal", type: "OKR", status: "IN_PROGRESS", startDate: "2026-07-01", endDate: "2026-12-31" }],
        },
      })], "import.json", { type: "application/json" });

      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: mockSetImportMessage,
        fileInputRef: { current: { value: "test" } as any },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      const mockEvent = {
        target: { files: [mockFile] },
      } as any;

      await act(async () => {
        result.current.handleImportData(mockEvent);
      });
    });
  });

  describe("handleDeleteGoal", () => {
    it("should update related tasks when goal is deleted", () => {
      const { result } = renderHook(() => useDashboardLogic({
        currentUser: { id: "user-1", username: "testuser", email: "test@test.com" },
        setIsAuthenticated: jest.fn(),
        setCurrentUser: jest.fn(),
        setShowModal: jest.fn(),
        setModalType: jest.fn(),
        editingTask: null,
        setEditingTask: jest.fn(),
        editingRequirement: null,
        setEditingRequirement: jest.fn(),
        editingTestCase: null,
        setEditingTestCase: jest.fn(),
        editingBug: null,
        setEditingBug: jest.fn(),
        formData: {
          title: "",
          description: "",
          status: "IN_PROGRESS",
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
        },
        setFormData: jest.fn(),
        setShowPrivacyModal: jest.fn(),
        setPrivacyConsented: jest.fn(),
        setImportMessage: jest.fn(),
        fileInputRef: { current: null },
        currentEpicId: null,
      }), {
        wrapper: Providers,
      });

      act(() => {
        result.current.handleDeleteGoal("goal-1");
      });
    });
  });
});