"use client";

import type { Requirement } from "../types";
import { COLORS, REQUIREMENT_STATUS_LABELS } from "../constants";

interface RequirementCardProps {
  requirement: Requirement;
  onEdit: (req: Requirement) => void;
  onDelete: (reqId: string) => void;
  onAddTest: (reqId: string) => void;
}

export default function RequirementCard({
  requirement,
  onEdit,
  onDelete,
  onAddTest,
}: RequirementCardProps) {
  const getStatusStyle = () => {
    const styles = {
      APPROVED: { bg: "#dcfce7", color: "#166534" },
      IMPLEMENTED: { bg: "#bfdbfe", color: "#1e40af" },
      REVIEW: { bg: "#fef9c3", color: "#854d0e" },
      DRAFT: { bg: "#f3f4f6", color: "#4b5563" },
    };
    return styles[requirement.status] ?? { bg: "#f3f4f6", color: "#4b5563" };
  };

  const getPriorityStyle = () => {
    const styles = {
      CRITICAL: { bg: "#fee2e2", color: "#991b1b" },
      HIGH: { bg: "#fed7aa", color: "#c2410c" },
      MEDIUM: { bg: "#fef9c3", color: "#854d0e" },
      LOW: { bg: "#dcfce7", color: "#166534" },
    };
    return styles[requirement.priority] ?? { bg: "#f3f4f6", color: "#4b5563" };
  };

  const statusStyle = getStatusStyle();
  const priorityStyle = getPriorityStyle();

  return (
    <div
      key={requirement.id}
      role="button"
      tabIndex={0}
      aria-label={`Requirement: ${requirement.title}, Status: ${REQUIREMENT_STATUS_LABELS[requirement.status]}, Priority: ${requirement.priority}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(requirement);
        }
      }}
      style={{
        minWidth: "300px",
        maxWidth: "400px",
        background: COLORS.cardBackground,
        padding: "20px",
        borderRadius: "10px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
      onClick={() => onEdit(requirement)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          {requirement.title}
        </h3>
        <span
          role="status"
          aria-label={`Status: ${REQUIREMENT_STATUS_LABELS[requirement.status]}`}
          style={{
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
            background: statusStyle.bg,
            color: statusStyle.color,
            fontWeight: 600,
          }}
        >
          {REQUIREMENT_STATUS_LABELS[requirement.status]}
        </span>
      </div>

      {requirement.description && (
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: "14px",
            color: COLORS.textSecondary,
            lineHeight: "1.5",
          }}
        >
          {requirement.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
          color: COLORS.textSecondary,
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            background: priorityStyle.bg,
            color: priorityStyle.color,
            fontWeight: 600,
          }}
        >
          {requirement.priority}
        </span>
        <span>📅 {requirement.updatedAt}</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          padding: "8px",
          background: "#f8fafc",
          borderRadius: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>📥</span>
          <div>
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>提出者</span>
            <div style={{ color: COLORS.text, fontWeight: 600 }}>
              {requirement.requester}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "16px", color: "#cbd5e1" }}>→</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>📤</span>
          <div>
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>执行者</span>
            <div style={{ color: COLORS.text, fontWeight: 600 }}>
              {requirement.executor}
            </div>
          </div>
        </div>
      </div>

      {requirement.acceptanceCriteria.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            Acceptance Criteria:
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
            }}
          >
            {requirement.acceptanceCriteria.map((criteria, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  marginBottom: "4px",
                }}
              >
                {criteria}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTest(requirement.id);
          }}
          aria-label={`Add test case for requirement: ${requirement.title}`}
          style={{
            flex: 1,
            padding: "8px",
            background: COLORS.buttonSecondary,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          + Add Test
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(requirement.id);
          }}
          aria-label={`Delete requirement: ${requirement.title}`}
          style={{
            padding: "8px 12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: COLORS.buttonDanger,
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
