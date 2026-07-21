"use client";

import { useState, useEffect, useRef } from "react";
import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  FormFields,
  ModalType,
} from "../types";
import { COLORS } from "../constants";
import TaskFormFields from "./modals/TaskFormFields";
import RequirementFormFields from "./modals/RequirementFormFields";
import TestCaseFormFields from "./modals/TestCaseFormFields";
import BugFormFields from "./modals/BugFormFields";
import CommentList from "./modals/CommentList";

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
  goals: import("../types").Goal[];
  tagHistory: string[];
  onSave: () => void;
  onClose: () => void;
  fontSizeScale: number;
  isSmall: boolean;
  taskComments?: import("../types").Comment[];
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
      setFormError("");
    }
  }, [show]);

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

  const renderFormFields = () => {
    switch (modalType) {
      case "task":
        return (
          <TaskFormFields
            formData={formData}
            setFormData={setFormData}
            requirements={requirements}
            goals={goals}
            tagHistory={tagHistory}
          />
        );
      case "requirement":
        return (
          <RequirementFormFields
            formData={formData}
            setFormData={setFormData}
            goals={goals}
          />
        );
      case "test":
        return (
          <TestCaseFormFields
            formData={formData}
            setFormData={setFormData}
            requirements={requirements}
          />
        );
      case "bug":
        return <BugFormFields formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
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

          {renderFormFields()}

          {modalType === "task" && editingTask && (
            <CommentList
              editingTask={editingTask}
              taskComments={taskComments}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
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
