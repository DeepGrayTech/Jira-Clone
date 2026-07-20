"use client";

import { useState } from "react";
import { useNotifications } from "../contexts";
import { COLORS } from "../constants";
import type { NotificationType } from "../types";

interface NotificationSettingsPanelProps {
  fontSizeScale: number;
  onClose: () => void;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: "Task Assigned",
  TASK_STATUS_CHANGED: "Task Status Changed",
  TASK_COMMENTED: "Task Commented",
  BUG_REPORTED: "Bug Reported",
  BUG_ASSIGNED: "Bug Assigned",
  REQUIREMENT_APPROVED: "Requirement Approved",
  TEST_CASE_FAILED: "Test Case Failed",
  GOAL_PROGRESS_UPDATED: "Goal Progress Updated",
  SUBAGENT_TASK_STARTED: "Subagent Task Started",
  SUBAGENT_TASK_COMPLETED: "Subagent Task Completed",
  SUBAGENT_TASK_FAILED: "Subagent Task Failed",
};

const SUBAGENTS = [
  { name: "senior-frontend-engineer", label: "Senior Frontend Engineer" },
  { name: "senior-backend-engineer", label: "Senior Backend Engineer" },
  { name: "architecture-task-splitter", label: "Architecture Task Splitter" },
  { name: "code-reviewer", label: "Code Reviewer" },
  { name: "test-engineer", label: "Test Engineer" },
  { name: "requirements-analyst", label: "Requirements Analyst" },
  { name: "ui-designer", label: "UI Designer" },
  { name: "compliance-engineer", label: "Compliance Engineer" },
  { name: "workflow-manager", label: "Workflow Manager" },
];

export default function NotificationSettingsPanel({ fontSizeScale, onClose }: NotificationSettingsPanelProps) {
  const { settings, saveSettings } = useNotifications();
  const [enabledTypes, setEnabledTypes] = useState<NotificationType[]>([...settings.enabledTypes]);
  const [autoScheduleSubagent, setAutoScheduleSubagent] = useState(settings.autoScheduleSubagent);
  const [preferredSubagents, setPreferredSubagents] = useState<string[]>([...settings.preferredSubagents]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleType = (type: NotificationType) => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSubagent = (name: string) => {
    setPreferredSubagents((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    saveSettings({
      userId: settings.userId,
      enabledTypes,
      autoScheduleSubagent,
      preferredSubagents,
    });
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleReset = () => {
    setEnabledTypes([
      "TASK_ASSIGNED",
      "TASK_STATUS_CHANGED",
      "TASK_COMMENTED",
      "BUG_REPORTED",
      "BUG_ASSIGNED",
      "REQUIREMENT_APPROVED",
      "TEST_CASE_FAILED",
      "GOAL_PROGRESS_UPDATED",
      "SUBAGENT_TASK_STARTED",
      "SUBAGENT_TASK_COMPLETED",
      "SUBAGENT_TASK_FAILED",
    ]);
    setAutoScheduleSubagent(true);
    setPreferredSubagents([
      "senior-frontend-engineer",
      "senior-backend-engineer",
      "architecture-task-splitter",
      "code-reviewer",
      "test-engineer",
    ]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-title"
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
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.cardBackground,
          borderRadius: "12px",
          padding: `${24 * fontSizeScale}px`,
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: `${20 * fontSizeScale}px` }}>
          <h2
            id="notification-settings-title"
            style={{
              margin: 0,
              fontSize: `${20 * fontSizeScale}px`,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            🔔 Notification Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: `${18 * fontSizeScale}px`,
              color: COLORS.textSecondary,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: `${24 * fontSizeScale}px` }}>
          <h3 style={{ margin: 0, fontSize: `${16 * fontSizeScale}px`, fontWeight: 600, marginBottom: `${12 * fontSizeScale}px` }}>
            Notification Types
          </h3>
          <p style={{ margin: 0, fontSize: `${13 * fontSizeScale}px`, color: COLORS.textSecondary, marginBottom: `${12 * fontSizeScale}px` }}>
            Select which types of notifications you want to receive
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${8 * fontSizeScale}px` }}>
            {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
              <label
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${8 * fontSizeScale}px`,
                  padding: `${10 * fontSizeScale}px`,
                  background: enabledTypes.includes(type as NotificationType) ? "#eff6ff" : "#f9fafb",
                  border: `1px solid ${enabledTypes.includes(type as NotificationType) ? "#bfdbfe" : COLORS.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: `${13 * fontSizeScale}px`,
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={enabledTypes.includes(type as NotificationType)}
                  onChange={() => toggleType(type as NotificationType)}
                  style={{ cursor: "pointer" }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: `${24 * fontSizeScale}px` }}>
          <h3 style={{ margin: 0, fontSize: `${16 * fontSizeScale}px`, fontWeight: 600, marginBottom: `${12 * fontSizeScale}px` }}>
            Subagent Auto-Scheduling
          </h3>
          <p style={{ margin: 0, fontSize: `${13 * fontSizeScale}px`, color: COLORS.textSecondary, marginBottom: `${12 * fontSizeScale}px` }}>
            When enabled, the system will automatically dispatch subagents to handle certain tasks
          </p>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${12 * fontSizeScale}px`,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autoScheduleSubagent}
              onChange={(e) => setAutoScheduleSubagent(e.target.checked)}
              style={{ cursor: "pointer", width: `${18 * fontSizeScale}px`, height: `${18 * fontSizeScale}px` }}
            />
            <span style={{ fontSize: `${14 * fontSizeScale}px` }}>Enable auto-scheduling</span>
          </label>
        </div>

        <div style={{ marginBottom: `${24 * fontSizeScale}px` }}>
          <h3 style={{ margin: 0, fontSize: `${16 * fontSizeScale}px`, fontWeight: 600, marginBottom: `${12 * fontSizeScale}px` }}>
            Preferred Subagents
          </h3>
          <p style={{ margin: 0, fontSize: `${13 * fontSizeScale}px`, color: COLORS.textSecondary, marginBottom: `${12 * fontSizeScale}px` }}>
            Select which subagents to use for task execution
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: `${8 * fontSizeScale}px` }}>
            {SUBAGENTS.map((subagent) => (
              <label
                key={subagent.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${8 * fontSizeScale}px`,
                  padding: `${10 * fontSizeScale}px`,
                  background: preferredSubagents.includes(subagent.name) ? "#eff6ff" : "#f9fafb",
                  border: `1px solid ${preferredSubagents.includes(subagent.name) ? "#bfdbfe" : COLORS.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: `${13 * fontSizeScale}px`,
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={preferredSubagents.includes(subagent.name)}
                  onChange={() => toggleSubagent(subagent.name)}
                  style={{ cursor: "pointer" }}
                />
                <span>{subagent.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: `${12 * fontSizeScale}px`, justifyContent: "flex-end" }}>
          <button
            onClick={handleReset}
            style={{
              padding: `${10 * fontSizeScale}px ${20 * fontSizeScale}px`,
              background: COLORS.buttonSecondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${14 * fontSizeScale}px`,
              fontWeight: 500,
            }}
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: `${10 * fontSizeScale}px ${20 * fontSizeScale}px`,
              background: COLORS.buttonPrimary,
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${14 * fontSizeScale}px`,
              fontWeight: 500,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}