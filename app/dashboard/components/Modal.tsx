"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  FormFields,
  ModalType,
  Comment,
  Goal,
} from "../types";
import {
  COLORS,
  STATUS_LABELS,
  REQUIREMENT_STATUS_LABELS,
  TEST_CASE_STATUS_LABELS,
} from "../constants";
import {
  isValidTaskStatus,
  isValidTaskPriority,
  isValidRequirementStatus,
  isValidRequirementPriority,
  isValidTestCaseStatus,
} from "../types";

interface ModalProps {
  show: boolean;
  modalType: ModalType;
  editingTask: Task | null;
  editingRequirement: Requirement | null;
  editingTestCase: TestCase | null;
  editingBug: Bug | null;
  formData: FormFields;
  setFormData: React.Dispatch<React.SetStateAction<FormFields>>;
  requirements: Requirement[];
  goals: Goal[];
  tagHistory: string[];
  onSave: () => void;
  onClose: () => void;
  fontSizeScale: number;
  isSmall: boolean;
  taskComments?: Comment[];
  onAddComment?: (taskId: string, content: string) => void;
  onDeleteComment?: (commentId: string, taskId: string) => void;
}

export default function Modal({
  show,
  modalType,
  editingTask,
  editingRequirement,
  editingTestCase,
  editingBug,
  formData,
  setFormData,
  requirements,
  goals,
  tagHistory,
  onSave,
  onClose,
  fontSizeScale,
  isSmall,
  taskComments = [],
  onAddComment,
  onDeleteComment,
}: ModalProps) {
  const [tagInputValue, setTagInputValue] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [formError, setFormError] = useState("");

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Store previously focused element and move focus into modal on open
  useEffect(() => {
    if (show) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        } else if (modalRef.current) {
          // Fallback: focus the first focusable element in the modal
          const firstFocusable = modalRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [show]);

  // Trap focus inside modal
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowTagDropdown(false);
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) {
      setTagInputValue("");
      setShowTagDropdown(false);
      setFormError("");
    }
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const tagInputContainer = document.querySelector(".tag-input-container");
      if (tagInputContainer && !tagInputContainer.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    if (showTagDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagDropdown]);

  const handleAddTag = () => {
    const trimmedTag = tagInputValue.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSelectTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInputValue("");
    setShowTagDropdown(false);
  };

  const getTitle = () => {
    if (editingTask) return "Edit Task";
    if (editingRequirement) return "Edit Requirement";
    if (editingTestCase) return "Edit Test Case";
    if (editingBug) return "Edit Bug Report";
    if (modalType === "task") return "New Task";
    if (modalType === "requirement") return "New Requirement";
    if (modalType === "bug") return "New Bug Report";
    return "New Test Case";
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="document"
        style={{
          background: COLORS.cardBackground,
          borderRadius: "12px",
          padding: isSmall ? "16px" : "24px",
          width: isSmall ? "98%" : "90%",
          maxWidth: "500px",
          maxHeight: isSmall ? "85vh" : "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          style={{
            margin: `0 0 ${20 * fontSizeScale}px 0`,
            fontSize: `${22 * fontSizeScale}px`,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {getTitle()}
        </h2>

        {formError && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.title.trim()) {
              setFormError("Title is required");
              titleInputRef.current?.focus();
              return;
            }
            if (modalType === "bug") {
              if (!formData.severity) {
                setFormError("Severity is required");
                return;
              }
              if (!formData.bugPriority) {
                setFormError("Priority is required");
                return;
              }
            }
            setFormError("");
            if (modalType === "test" && typeof formData.steps === "string") {
              setFormData((prev) => ({
                ...prev,
                steps: prev.steps
                  .split("\n")
                  .map((s) => s.trim())
                  .filter((s) => s) as unknown as string,
              }));
            }
            if (
              modalType === "requirement" &&
              typeof formData.acceptanceCriteria === "string"
            ) {
              setFormData((prev) => ({
                ...prev,
                acceptanceCriteria: prev.acceptanceCriteria
                  .split("\n")
                  .map((s) => s.trim())
                  .filter((s) => s) as unknown as string,
              }));
            }
            if (modalType === "bug" && typeof formData.stepsToReproduce === "string") {
              setFormData((prev) => ({
                ...prev,
                stepsToReproduce: prev.stepsToReproduce
                  .split("\n")
                  .map((s) => s.trim())
                  .filter((s) => s) as unknown as string,
              }));
            }
            onSave();
          }}
          noValidate
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="modal-title-input"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Title
            </label>
            <input
              id="modal-title-input"
              ref={titleInputRef}
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (formError) setFormError("");
              }}
              aria-required="true"
              aria-invalid={formError ? "true" : "false"}
              aria-describedby={formError ? "modal-error" : undefined}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${formError ? "#dc2626" : COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Enter title"
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="modal-description"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Description
            </label>
            <textarea
              id="modal-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                minHeight: "80px",
                resize: "vertical",
              }}
              placeholder="Enter description"
            />
          </div>

          {modalType === "bug" && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-bug-severity"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Severity
                </label>
                <select
                  id="modal-bug-severity"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">Select severity...</option>
                  <option value="CRITICAL">CRITICAL - 系统崩溃、数据丢失、安全漏洞</option>
                  <option value="HIGH">HIGH - 核心功能不可用，无替代方案</option>
                  <option value="MEDIUM">MEDIUM - 功能部分不可用，有替代方案</option>
                  <option value="LOW">LOW - 轻微问题，不影响核心功能</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-bug-priority"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Priority
                </label>
                <select
                  id="modal-bug-priority"
                  value={formData.bugPriority}
                  onChange={(e) =>
                    setFormData({ ...formData, bugPriority: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">Select priority...</option>
                  <option value="URGENT">URGENT - 需立即修复，阻塞发布或影响大量用户</option>
                  <option value="HIGH">HIGH - 应在当前迭代内优先修复</option>
                  <option value="MEDIUM">MEDIUM - 可在下一迭代修复</option>
                  <option value="LOW">LOW - 可在后续版本中修复</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-steps-to-reproduce"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Steps to Reproduce (one per line)
                </label>
                <textarea
                  id="modal-steps-to-reproduce"
                  value={formData.stepsToReproduce}
                  onChange={(e) =>
                    setFormData({ ...formData, stepsToReproduce: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "100px",
                    resize: "vertical",
                  }}
                  placeholder="Step 1: ...&#10;Step 2: ..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-expected-behavior"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Expected Behavior
                </label>
                <textarea
                  id="modal-expected-behavior"
                  value={formData.expectedBehavior}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedBehavior: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "60px",
                    resize: "vertical",
                  }}
                  placeholder="Describe what should happen..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-actual-behavior"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Actual Behavior
                </label>
                <textarea
                  id="modal-actual-behavior"
                  value={formData.actualBehavior}
                  onChange={(e) =>
                    setFormData({ ...formData, actualBehavior: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "60px",
                    resize: "vertical",
                  }}
                  placeholder="Describe what actually happens..."
                />
              </div>
            </>
          )}

          {(modalType === "task" ||
            modalType === "requirement" ||
            modalType === "test") && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-status"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Status
              </label>
              <select
                id="modal-status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                {modalType === "task" && (
                  <>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </>
                )}
                {modalType === "requirement" && (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">In Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="IMPLEMENTED">Implemented</option>
                  </>
                )}
                {modalType === "test" && (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="BLOCKED">Blocked</option>
                  </>
                )}
              </select>
            </div>
          )}

          {(modalType === "task" || modalType === "requirement") && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-priority"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Priority
              </label>
              <select
                id="modal-priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                {modalType === "task" && (
                  <>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </>
                )}
                {modalType === "requirement" && (
                  <>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </>
                )}
              </select>
            </div>
          )}

          {modalType === "requirement" && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-acceptance-criteria"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Acceptance Criteria (one per line)
                </label>
                <textarea
                  id="modal-acceptance-criteria"
                  value={formData.acceptanceCriteria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acceptanceCriteria: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "100px",
                    resize: "vertical",
                  }}
                  placeholder="Criteria 1: ...&#10;Criteria 2: ..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-requester"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Requester (需求提出者)
                </label>
                <select
                  id="modal-requester"
                  value={formData.requester}
                  onChange={(e) =>
                    setFormData({ ...formData, requester: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select requester...</option>
                  <option value="需求粉碎机" style={{ backgroundColor: "#ffffff" }}>👤 需求粉碎机 (Requirements Analyst)</option>
                  <option value="系统拆弹专家" style={{ backgroundColor: "#ffffff" }}>👤 系统拆弹专家 (Architecture Task Splitter)</option>
                  <option value="像素魔法师" style={{ backgroundColor: "#ffffff" }}>👤 像素魔法师 (Senior Frontend Engineer)</option>
                  <option value="数据大厨" style={{ backgroundColor: "#ffffff" }}>👤 数据大厨 (Senior Backend Engineer)</option>
                  <option value="配色狂魔" style={{ backgroundColor: "#ffffff" }}>👤 配色狂魔 (UI Designer)</option>
                  <option value="代码找茬王" style={{ backgroundColor: "#ffffff" }}>👤 代码找茬王 (Code Reviewer)</option>
                  <option value="规矩守护者" style={{ backgroundColor: "#ffffff" }}>👤 规矩守护者 (Compliance Engineer)</option>
                  <option value="Bug猎手" style={{ backgroundColor: "#ffffff" }}>👤 Bug猎手 (Test Engineer)</option>
                  <option value="文档整理控" style={{ backgroundColor: "#ffffff" }}>👤 文档整理控 (Document Manager)</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-executor"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Executor (需求执行者)
                </label>
                <select
                  id="modal-executor"
                  value={formData.executor}
                  onChange={(e) =>
                    setFormData({ ...formData, executor: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select executor...</option>
                  <option value="需求粉碎机" style={{ backgroundColor: "#ffffff" }}>👤 需求粉碎机 (Requirements Analyst)</option>
                  <option value="系统拆弹专家" style={{ backgroundColor: "#ffffff" }}>👤 系统拆弹专家 (Architecture Task Splitter)</option>
                  <option value="像素魔法师" style={{ backgroundColor: "#ffffff" }}>👤 像素魔法师 (Senior Frontend Engineer)</option>
                  <option value="数据大厨" style={{ backgroundColor: "#ffffff" }}>👤 数据大厨 (Senior Backend Engineer)</option>
                  <option value="配色狂魔" style={{ backgroundColor: "#ffffff" }}>👤 配色狂魔 (UI Designer)</option>
                  <option value="代码找茬王" style={{ backgroundColor: "#ffffff" }}>👤 代码找茬王 (Code Reviewer)</option>
                  <option value="规矩守护者" style={{ backgroundColor: "#ffffff" }}>👤 规矩守护者 (Compliance Engineer)</option>
                  <option value="Bug猎手" style={{ backgroundColor: "#ffffff" }}>👤 Bug猎手 (Test Engineer)</option>
                  <option value="文档整理控" style={{ backgroundColor: "#ffffff" }}>👤 文档整理控 (Document Manager)</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-req-related-goal"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Related Goal
                </label>
                <select
                  id="modal-req-related-goal"
                  value={formData.relatedGoalId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relatedGoalId: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">None</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title} ({goal.type})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalType === "task" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-due-date"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Due Date
              </label>
              <input
                id="modal-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>
          )}

          {modalType === "task" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                id="modal-tags-label"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Tags
              </label>
              <div
                role="list"
                aria-label="Current tags"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 8px",
                      background: "#e0e7ff",
                      color: "#4338ca",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4338ca",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div
                className="tag-input-container"
                style={{
                  position: "relative",
                }}
              >
                <input
                  id="modal-tag-input"
                  type="text"
                  value={tagInputValue}
                  onChange={(e) => {
                    setTagInputValue(e.target.value);
                    if (e.target.value) {
                      setFilteredTags(
                        tagHistory.filter((tag) =>
                          tag
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                        )
                      );
                      setShowTagDropdown(true);
                    } else {
                      setShowTagDropdown(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  onFocus={() => {
                    if (tagInputValue) {
                      setFilteredTags(
                        tagHistory.filter((tag) =>
                          tag
                            .toLowerCase()
                            .includes(tagInputValue.toLowerCase())
                        )
                      );
                    } else {
                      setFilteredTags(tagHistory);
                    }
                    setShowTagDropdown(true);
                  }}
                  aria-label="Add a tag"
                  aria-describedby="modal-tags-label"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="Add a tag..."
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div
                    role="listbox"
                    aria-label="Tag suggestions"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      marginTop: "4px",
                      zIndex: 100,
                    }}
                  >
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        role="option"
                        aria-selected={formData.tags.includes(tag)}
                        onClick={() => handleSelectTag(tag)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: COLORS.text,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            COLORS.columnBackground;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(modalType === "task" || modalType === "test") && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-assignee"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                {modalType === "task" ? "Assignee" : "Executor"}
              </label>
              <select
                id="modal-assignee"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="">Select an assignee...</option>
                {(modalType === "task" || modalType === "test") && (
                  <>
                    <option value="需求粉碎机" style={{ backgroundColor: "#ffffff" }}>👤 需求粉碎机 (Requirements Analyst)</option>
                    <option value="系统拆弹专家" style={{ backgroundColor: "#ffffff" }}>👤 系统拆弹专家 (Architecture Task Splitter)</option>
                    <option value="像素魔法师" style={{ backgroundColor: "#ffffff" }}>👤 像素魔法师 (Senior Frontend Engineer)</option>
                    <option value="数据大厨" style={{ backgroundColor: "#ffffff" }}>👤 数据大厨 (Senior Backend Engineer)</option>
                    <option value="配色狂魔" style={{ backgroundColor: "#ffffff" }}>👤 配色狂魔 (UI Designer)</option>
                    <option value="代码找茬王" style={{ backgroundColor: "#ffffff" }}>👤 代码找茬王 (Code Reviewer)</option>
                    <option value="规矩守护者" style={{ backgroundColor: "#ffffff" }}>👤 规矩守护者 (Compliance Engineer)</option>
                    <option value="Bug猎手" style={{ backgroundColor: "#ffffff" }}>👤 Bug猎手 (Test Engineer)</option>
                    <option value="文档整理控" style={{ backgroundColor: "#ffffff" }}>👤 文档整理控 (Document Manager)</option>
                    <option value="管理员" style={{ backgroundColor: "#ffffff" }}>👤 管理员 (Admin)</option>
                  </>
                )}
              </select>
            </div>
          )}

          {modalType === "task" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-related-requirement"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Related Requirement
              </label>
              <select
                id="modal-related-requirement"
                value={formData.relatedRequirementId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relatedRequirementId: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">None</option>
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {modalType === "task" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-related-goal"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Related Goal
              </label>
              <select
                id="modal-related-goal"
                value={formData.relatedGoalId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relatedGoalId: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">None</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title} ({goal.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {modalType === "task" && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="modal-figma-url"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Figma URL
              </label>
              <input
                id="modal-figma-url"
                type="url"
                value={formData.figmaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, figmaUrl: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                }}
                placeholder="https://www.figma.com/file/..."
              />
            </div>
          )}

          {modalType === "test" && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-test-steps"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Test Steps (one per line)
                </label>
                <textarea
                  id="modal-test-steps"
                  value={formData.steps}
                  onChange={(e) =>
                    setFormData({ ...formData, steps: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "100px",
                    resize: "vertical",
                  }}
                  placeholder="Step 1: ...&#10;Step 2: ..."
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-expected-result"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Expected Result
                </label>
                <textarea
                  id="modal-expected-result"
                  value={formData.expectedResult}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedResult: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    minHeight: "60px",
                    resize: "vertical",
                  }}
                  placeholder="Describe the expected outcome..."
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="modal-test-related-req"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  Related Requirement
                </label>
                <select
                  id="modal-test-related-req"
                  value={formData.relatedRequirementId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relatedRequirementId: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">None</option>
                  {requirements.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalType === "task" && editingTask && (
            <div style={{ marginBottom: "16px" }}>
              <label
                id="modal-comments-label"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Comments ({taskComments.length})
              </label>
              <div
                role="log"
                aria-label="Comments list"
                aria-live="polite"
                style={{
                  marginBottom: "12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  padding: "12px",
                  background: "#f9fafb",
                }}
              >
                {taskComments.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      color: COLORS.textSecondary,
                      fontSize: "13px",
                    }}
                  >
                    No comments yet. Add a comment below.
                  </p>
                ) : (
                  taskComments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        marginBottom: "12px",
                        padding: "10px",
                        background: COLORS.cardBackground,
                        borderRadius: "6px",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "13px",
                            color: COLORS.text,
                          }}
                        >
                          {comment.author}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onDeleteComment?.(comment.id, editingTask!.id)
                          }
                          aria-label={`Delete comment by ${comment.author}`}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.buttonDanger,
                            cursor: "pointer",
                            fontSize: "12px",
                            padding: "2px 4px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                          lineHeight: "1.5",
                        }}
                      >
                        {comment.content}
                      </p>
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          fontSize: "11px",
                          color: "#6b7280",
                        }}
                      >
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="modal-new-comment"
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (newComment.trim() && editingTask) {
                        onAddComment?.(editingTask.id, newComment);
                        setNewComment("");
                      }
                    }
                  }}
                  aria-label="Add a comment"
                  aria-describedby="modal-comments-label"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="Add a comment..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newComment.trim() && editingTask) {
                      onAddComment?.(editingTask.id, newComment);
                      setNewComment("");
                    }
                  }}
                  aria-label="Submit comment"
                  style={{
                    padding: "10px 20px",
                    background: COLORS.buttonPrimary,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel and close"
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
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = COLORS.buttonSecondary;
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label={editingTask || editingRequirement || editingTestCase || editingBug ? "Save changes" : "Create new item"}
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
              {editingTask || editingRequirement || editingTestCase || editingBug
                ? "Save"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
