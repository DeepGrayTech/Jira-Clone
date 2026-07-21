"use client";

import type { Requirement } from "../types";
import { COLORS, REQUIREMENT_STATUS_LABELS } from "../constants";
import EpicBadge from "./EpicBadge";

interface RequirementCardProps {
  requirement: Requirement;
  onEdit: (req: Requirement) => void;
  onDelete: (reqId: string) => void;
  onAddTest: (reqId: string) => void;
  fontSizeScale?: number;
  isSmall?: boolean;
}

export default function RequirementCard({
  requirement,
  onEdit,
  onDelete,
  onAddTest,
  fontSizeScale = 1,
  isSmall = false,
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
        background: COLORS.cardBackground,
        padding: isSmall ? "8px" : "12px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
      }}
      onClick={() => onEdit(requirement)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isSmall ? "6px" : "8px",
          gap: "6px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: `${13 * fontSizeScale}px`,
            fontWeight: 600,
            color: COLORS.text,
            flex: 1,
            lineHeight: "1.3",
          }}
        >
          {requirement.title}
        </h4>
        <span
          role="status"
          aria-label={`Status: ${REQUIREMENT_STATUS_LABELS[requirement.status]}`}
          style={{
            fontSize: "9px",
            padding: "2px 6px",
            borderRadius: "3px",
            background: statusStyle.bg,
            color: statusStyle.color,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {REQUIREMENT_STATUS_LABELS[requirement.status]}
        </span>
      </div>

      {requirement.description && (
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "11px",
            color: COLORS.textSecondary,
            lineHeight: "1.4",
          }}
        >
          {requirement.description}
        </p>
      )}

      {requirement.epicId && (
        <div style={{ marginBottom: "8px" }}>
          <EpicBadge epicId={requirement.epicId} fontSizeScale={fontSizeScale} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: COLORS.textSecondary,
          marginBottom: "8px",
        }}
      >
        <span
          role="status"
          aria-label={`Priority: ${requirement.priority}`}
          style={{
            fontSize: "9px",
            padding: "2px 6px",
            borderRadius: "3px",
            background: priorityStyle.bg,
            color: priorityStyle.color,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {requirement.priority}
        </span>
        <span>📅 {requirement.updatedAt}</span>
      </div>

      {requirement.source && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            padding: "6px 10px",
            background: "#f0f9ff",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "14px" }}>📋</span>
          <span style={{ color: "#0369a1", fontWeight: 500 }}>
            标准出处：{requirement.source}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: COLORS.textSecondary,
        }}
      >
        <span>📥 {requirement.requester}</span>
        <span>📤 {requirement.executor}</span>
      </div>

      {requirement.acceptanceCriteria.length > 0 && (
        <div style={{ marginTop: "8px" }}>
          <p
            style={{
              margin: "0 0 4px 0",
              fontSize: "11px",
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            Acceptance Criteria:
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: "16px",
            }}
          >
            {requirement.acceptanceCriteria.map((criteria, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "11px",
                  color: COLORS.textSecondary,
                  marginBottom: "2px",
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
          gap: "4px",
          marginTop: "8px",
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
            padding: "3px 8px",
            background: COLORS.buttonSecondary,
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px",
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
            padding: "3px 8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: COLORS.buttonDanger,
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
