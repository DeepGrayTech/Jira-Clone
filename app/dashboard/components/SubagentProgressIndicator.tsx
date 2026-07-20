"use client";

import type { SubagentTask } from "../types";
import { COLORS } from "../constants";

interface SubagentProgressIndicatorProps {
  task: SubagentTask;
  fontSizeScale: number;
}

const STATUS_COLORS: Record<SubagentTask["status"], string> = {
  PENDING: "#6b7280",
  RUNNING: "#3b82f6",
  COMPLETED: "#22c55e",
  FAILED: "#dc2626",
  CANCELLED: "#9ca3af",
};

const STATUS_LABELS: Record<SubagentTask["status"], string> = {
  PENDING: "Pending",
  RUNNING: "Running",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export default function SubagentProgressIndicator({ task, fontSizeScale }: SubagentProgressIndicatorProps) {
  const statusColor = STATUS_COLORS[task.status];
  const statusLabel = STATUS_LABELS[task.status];

  return (
    <div
      style={{
        padding: `${12 * fontSizeScale}px ${16 * fontSizeScale}px`,
        background: "#f9fafb",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: `${12 * fontSizeScale}px`, marginBottom: `${8 * fontSizeScale}px` }}>
        <div
          style={{
            fontSize: `${20 * fontSizeScale}px`,
          }}
        >
          {task.status === "RUNNING" ? "🚀" : task.status === "COMPLETED" ? "✅" : task.status === "FAILED" ? "❌" : "⏳"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: `${14 * fontSizeScale}px`, fontWeight: 600, color: COLORS.text }}>
              {task.subagentName}
            </span>
            <span
              style={{
                padding: `${3 * fontSizeScale}px ${8 * fontSizeScale}px`,
                borderRadius: "4px",
                fontSize: `${11 * fontSizeScale}px`,
                fontWeight: 600,
                color: "#ffffff",
                background: statusColor,
              }}
            >
              {statusLabel}
            </span>
          </div>
          <span style={{ fontSize: `${12 * fontSizeScale}px`, color: COLORS.textSecondary }}>
            {task.taskType}
          </span>
        </div>
      </div>

      {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
        <div style={{ marginBottom: `${4 * fontSizeScale}px` }}>
          <div
            style={{
              height: `${6 * fontSizeScale}px`,
              background: "#e5e7eb",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${task.progress}%`,
                background: statusColor,
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: `${12 * fontSizeScale}px`, color: COLORS.textSecondary }}>
          {task.status === "RUNNING" ? `${task.progress}% complete` : `Progress: ${task.progress}%`}
        </span>
        {task.errorMessage && (
          <button
            onClick={() => alert(task.errorMessage)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: COLORS.buttonDanger,
              fontSize: `${12 * fontSizeScale}px`,
              textDecoration: "underline",
            }}
          >
            View Error
          </button>
        )}
      </div>

      {task.status === "RUNNING" && (
        <div
          style={{
            marginTop: `${8 * fontSizeScale}px`,
            padding: `${8 * fontSizeScale}px`,
            background: "#eff6ff",
            borderRadius: "4px",
            fontSize: `${12 * fontSizeScale}px`,
            color: "#1d4ed8",
          }}
        >
          📊 This task is being processed by the subagent...
        </div>
      )}
    </div>
  );
}