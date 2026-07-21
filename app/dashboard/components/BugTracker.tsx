"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS } from "../constants";
import type { Bug, Task, Requirement } from "../types";

const BUG_STATUS_LABELS: Record<string, string> = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  VERIFIED: "Verified",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

/**
 * IEEE 1044 Bug Severity Classification Descriptions
 */
const SEVERITY_DESCRIPTIONS: Record<Bug["severity"], string> = {
  CRITICAL: "系统崩溃、数据丢失、安全漏洞",
  HIGH: "核心功能不可用，无替代方案",
  MEDIUM: "功能部分不可用，有替代方案",
  LOW: "轻微问题，不影响核心功能",
};

/**
 * IEEE 1044 Bug Priority Classification Descriptions
 */
const PRIORITY_DESCRIPTIONS: Record<Bug["priority"], string> = {
  URGENT: "需立即修复，阻塞发布或影响大量用户",
  HIGH: "应在当前迭代内优先修复",
  MEDIUM: "可在下一迭代修复",
  LOW: "可在后续版本中修复",
};

const getSeverityStyle = (severity: Bug["severity"]) => {
  const styles: Record<Bug["severity"], { color: string; bgColor: string }> = {
    CRITICAL: { color: "#991b1b", bgColor: "#fee2e2" },
    HIGH: { color: "#c2410c", bgColor: "#fed7aa" },
    MEDIUM: { color: "#854d0e", bgColor: "#fef9c3" },
    LOW: { color: "#166534", bgColor: "#dcfce7" },
  };
  return styles[severity];
};

const getPriorityStyle = (priority: Bug["priority"]) => {
  const styles: Record<Bug["priority"], { color: string; bgColor: string }> = {
    URGENT: { color: "#991b1b", bgColor: "#fee2e2" },
    HIGH: { color: "#c2410c", bgColor: "#fed7aa" },
    MEDIUM: { color: "#854d0e", bgColor: "#fef9c3" },
    LOW: { color: "#166534", bgColor: "#dcfce7" },
  };
  return styles[priority];
};

const getStatusColor = (status: Bug["status"]) => {
  const colors: Record<Bug["status"], string> = {
    REPORTED: "#6b7280",
    ASSIGNED: "#3b82f6",
    IN_PROGRESS: "#f97316",
    RESOLVED: "#8b5cf6",
    VERIFIED: "#06b6d4",
    CLOSED: "#22c55e",
    REOPENED: "#ef4444",
  };
  return colors[status];
};

interface BugCardProps {
  bug: Bug;
  onEdit: (bug: Bug) => void;
  onAddComment: (bugId: string) => void;
  relatedTask?: Task;
  relatedRequirement?: Requirement;
}

function BugCard({
  bug,
  onEdit,
  onAddComment,
  relatedTask,
  relatedRequirement,
}: BugCardProps) {
  const severityStyle = getSeverityStyle(bug.severity);
  const priorityStyle = getPriorityStyle(bug.priority);
  const statusColor = getStatusColor(bug.status);

  return (
    <div
      style={{
        background: COLORS.cardBackground,
        padding: "12px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={() => onEdit(bug)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: "0 0 4px 0",
              fontSize: "13px",
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            {bug.title}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: COLORS.textSecondary,
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {bug.description}
          </p>
        </div>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: statusColor,
            marginLeft: "8px",
            flexShrink: 0,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "9px",
            fontWeight: 600,
            color: severityStyle.color,
            background: severityStyle.bgColor,
          }}
          title={SEVERITY_DESCRIPTIONS[bug.severity]}
        >
          {bug.severity}
        </span>
        <span
          style={{
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "9px",
            fontWeight: 600,
            color: priorityStyle.color,
            background: priorityStyle.bgColor,
          }}
          title={PRIORITY_DESCRIPTIONS[bug.priority]}
        >
          {bug.priority}
        </span>
      </div>

      {relatedTask && (
        <div
          style={{
            marginBottom: "6px",
            padding: "4px",
            background: "#eff6ff",
            borderRadius: "4px",
          }}
        >
          <span style={{ fontSize: "9px", color: "#3b82f6", fontWeight: 500 }}>
            📋 {relatedTask.title}
          </span>
        </div>
      )}

      {relatedRequirement && (
        <div
          style={{
            marginBottom: "6px",
            padding: "4px",
            background: "#f0fdf4",
            borderRadius: "4px",
          }}
        >
          <span style={{ fontSize: "9px", color: "#16a34a", fontWeight: 500 }}>
            📝 {relatedRequirement.title}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "10px", color: COLORS.textSecondary }}>
            Reported by: {bug.reporter}
          </span>
          {bug.assignee && (
            <span style={{ fontSize: "10px", color: COLORS.textSecondary }}>
              Assigned to: {bug.assignee}
            </span>
          )}
          {bug.verifier && (
            <span style={{ fontSize: "10px", color: COLORS.textSecondary }}>
              Verified by: {bug.verifier}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {bug.comments.length > 0 && (
            <span
              style={{
                fontSize: "10px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              💬 {bug.comments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface BugColumnProps {
  status: Bug["status"];
  bugs: Bug[];
  tasks: Task[];
  requirements: Requirement[];
  onEditBug: (bug: Bug) => void;
  onAddComment: (bugId: string) => void;
}

function BugColumn({
  status,
  bugs,
  tasks,
  requirements,
  onEditBug,
  onAddComment,
}: BugColumnProps) {
  const statusColor = getStatusColor(status);
  const statusLabel = BUG_STATUS_LABELS[status];

  return (
    <div
      style={{
        minWidth: "260px",
        width: "auto",
        maxWidth: "300px",
        background: COLORS.columnBackground,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "16px",
          fontWeight: 700,
          color: COLORS.text,
          paddingBottom: "10px",
          borderBottom: `2px solid ${statusColor}`,
        }}
      >
        {statusLabel}
        <span
          style={{
            marginLeft: "8px",
            fontSize: "13px",
            color: COLORS.textSecondary,
            fontWeight: 400,
          }}
        >
          ({bugs.length})
        </span>
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {bugs.length === 0 && (
          <p
            style={{
              margin: 0,
              color: COLORS.textSecondary,
              fontStyle: "italic",
              textAlign: "center",
              padding: "20px",
              fontSize: "12px",
            }}
          >
            No bugs yet
          </p>
        )}
        {bugs.map((bug) => {
          const relatedTask = bug.relatedTaskId
            ? tasks.find((t) => t.id === bug.relatedTaskId)
            : undefined;
          const relatedRequirement = bug.relatedRequirementId
            ? requirements.find((r) => r.id === bug.relatedRequirementId)
            : undefined;
          return (
            <BugCard
              key={bug.id}
              bug={bug}
              onEdit={onEditBug}
              onAddComment={onAddComment}
              relatedTask={relatedTask}
              relatedRequirement={relatedRequirement}
            />
          );
        })}
      </div>
    </div>
  );
}

interface BugTrackerProps {
  bugs: Bug[];
  tasks: Task[];
  requirements: Requirement[];
  onCreateBug: () => void;
  onEditBug: (bug: Bug) => void;
  onUpdateBug: (bug: Bug) => void;
  onDeleteBug: (bugId: string, expectedUpdatedAt?: string) => void;
  onAddBugComment: (bugId: string, content: string, author: string) => void;
}

export default function BugTracker({
  bugs,
  tasks,
  requirements,
  onCreateBug,
  onEditBug,
  onUpdateBug,
  onDeleteBug,
  onAddBugComment,
}: BugTrackerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Bug["severity"] | "ALL">(
    "ALL"
  );
  const [priorityFilter, setPriorityFilter] = useState<Bug["priority"] | "ALL">(
    "ALL"
  );
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [newComment, setNewComment] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (saveMessageTimerRef.current) {
        clearTimeout(saveMessageTimerRef.current);
      }
    };
  }, []);

  const filteredBugs = bugs.filter((bug) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bug.assignee &&
        bug.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (bug.verifier &&
        bug.verifier.toLowerCase().includes(searchQuery.toLowerCase())) ||
      bug.severity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.status.toLowerCase().includes(searchQuery.toLowerCase());

    // Severity filter
    const matchesSeverity =
      severityFilter === "ALL" || bug.severity === severityFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === "ALL" || bug.priority === priorityFilter;

    return matchesSearch && matchesSeverity && matchesPriority;
  });

  const bugStatuses: Bug["status"][] = [
    "REPORTED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "VERIFIED",
    "CLOSED",
    "REOPENED",
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedBug) {
        setSelectedBug(null);
      }
    },
    [selectedBug]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleAddComment = () => {
    if (selectedBug && newComment.trim()) {
      onAddBugComment(selectedBug.id, newComment.trim(), "Current User");
      setNewComment("");
    }
  };

  const handleStatusChange = (status: Bug["status"]) => {
    if (selectedBug) {
      const updatedBug = {
        ...selectedBug,
        status,
        updatedAt: new Date().toISOString(),
      };
      setSelectedBug(updatedBug);
      onUpdateBug(updatedBug);
    }
  };

  const criticalCount = bugs.filter((b) => b.severity === "CRITICAL").length;
  const highCount = bugs.filter((b) => b.severity === "HIGH").length;
  const unresolvedCount = bugs.filter(
    (b) => !["RESOLVED", "VERIFIED", "CLOSED"].includes(b.status)
  ).length;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Bug Tracker
          </h1>
          <p style={{ margin: 0, color: COLORS.textSecondary }}>
            Manage and track bug reports from testing and customer feedback
          </p>
        </div>
        <button
          onClick={onCreateBug}
          aria-label="Create new bug report"
          style={{
            padding: "10px 20px",
            background: COLORS.buttonPrimary,
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = COLORS.buttonPrimaryHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = COLORS.buttonPrimary)
          }
        >
          + New Bug Report
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div
          style={{
            flex: 1,
            background: "#fef2f2",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#dc2626" }}>
            {criticalCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            Critical Bugs
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: "#fed7aa",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#f97316" }}>
            {highCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            High Severity
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: "#eff6ff",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>
            {unresolvedCount}
          </span>
          <span
            style={{ marginLeft: "8px", fontSize: "14px", color: "#6b7280" }}
          >
            Unresolved
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
          type="text"
          placeholder="Search bugs by title, description, reporter, assignee, verifier, severity, priority, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search bugs"
          style={{
              flex: 1,
              padding: "10px 16px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value as Bug["severity"] | "ALL")
            }
            style={{
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              fontSize: "13px",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              minWidth: "130px",
            }}
            title="按严重程度筛选"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL - 系统崩溃、数据丢失</option>
            <option value="HIGH">HIGH - 核心功能不可用</option>
            <option value="MEDIUM">MEDIUM - 功能部分不可用</option>
            <option value="LOW">LOW - 轻微问题</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as Bug["priority"] | "ALL")
            }
            style={{
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              fontSize: "13px",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              minWidth: "130px",
            }}
            title="按优先级筛选"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">URGENT - 需立即修复</option>
            <option value="HIGH">HIGH - 当前迭代修复</option>
            <option value="MEDIUM">MEDIUM - 下一迭代修复</option>
            <option value="LOW">LOW - 后续版本修复</option>
          </select>
        </div>
      </div>

      {searchQuery && filteredBugs.length === 0 && (
        <div
          style={{
            padding: "30px",
            background: "#fef3c7",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "14px", color: "#b45309", fontWeight: 500 }}>
            No bugs found matching "{searchQuery}". Try a different search term.
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", overflowX: "auto" }}>
        {bugStatuses.map((status) => (
          <BugColumn
            key={status}
            status={status}
            bugs={filteredBugs.filter((bug) => bug.status === status)}
            tasks={tasks}
            requirements={requirements}
            onEditBug={(bug) => setSelectedBug(bug)}
            onAddComment={() => {}}
          />
        ))}
      </div>

      {selectedBug && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-detail-title"
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
          onClick={() => setSelectedBug(null)}
        >
          <div
            role="document"
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2
                  id="bug-detail-title"
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: COLORS.text,
                  }}
                >
                  {selectedBug.title}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: getSeverityStyle(selectedBug.severity).color,
                        background: getSeverityStyle(selectedBug.severity)
                          .bgColor,
                      }}
                    >
                      {selectedBug.severity} Severity
                    </span>
                    <span style={{ fontSize: "9px", color: COLORS.textSecondary, paddingLeft: "4px" }}>
                      {SEVERITY_DESCRIPTIONS[selectedBug.severity]}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: getPriorityStyle(selectedBug.priority).color,
                        background: getPriorityStyle(selectedBug.priority)
                          .bgColor,
                      }}
                    >
                      {selectedBug.priority} Priority
                    </span>
                    <span style={{ fontSize: "9px", color: COLORS.textSecondary, paddingLeft: "4px" }}>
                      {PRIORITY_DESCRIPTIONS[selectedBug.priority]}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => {
                    onEditBug(selectedBug);
                    setSelectedBug(null);
                  }}
                  aria-label="Edit bug"
                  style={{
                    padding: "6px 14px",
                    background: COLORS.buttonPrimary,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setSelectedBug(null)}
                  aria-label="Close bug details"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: COLORS.textSecondary,
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Description
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                  lineHeight: "1.6",
                }}
              >
                {selectedBug.description}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Steps to Reproduce
              </h3>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                {selectedBug.stepsToReproduce.map((step, index) => (
                  <li key={index} style={{ marginBottom: "4px" }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Expected Behavior
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                {selectedBug.expectedBehavior}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Actual Behavior
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                {selectedBug.actualBehavior}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "11px", color: COLORS.textSecondary }}>
                  Reporter
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {selectedBug.reporter}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "11px", color: COLORS.textSecondary }}>
                  Assignee
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {selectedBug.assignee || "Not assigned"}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <span style={{ fontSize: "11px", color: COLORS.textSecondary }}>
                  Verifier
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {selectedBug.verifier || "Not assigned"}
                </p>
              </div>
            </div>

            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#f0fdf4",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#166534",
                }}
              >
                🔄 Bug Lifecycle Flow
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                }}
              >
                <span style={{ color: "#6b7280", fontWeight: 600 }}>
                  REPORTED
                </span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ color: "#3b82f6", fontWeight: 600 }}>
                  ASSIGNED
                </span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ color: "#f97316", fontWeight: 600 }}>
                  IN_PROGRESS
                </span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ color: "#8b5cf6", fontWeight: 600 }}>
                  RESOLVED
                </span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ color: "#06b6d4", fontWeight: 600 }}>
                  VERIFIED
                </span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                  CLOSED
                </span>
                <span style={{ color: "#9ca3af", marginLeft: "8px" }}>|</span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>
                  REOPENED
                </span>
              </div>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "11px",
                  color: "#166534",
                  lineHeight: "1.5",
                }}
              >
                💡 <strong>流转说明：</strong>Bug提交后由负责人分配给工程师 →
                工程师修复后标记为RESOLVED → 由测试人员或原报告人验证 →
                通过后VERIFIED → 最终CLOSED。若验证失败可REOPENED重新处理。
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Assign Verifier (验证人)
              </h3>
              <select
                value={selectedBug.verifier || ""}
                onChange={(e) => {
                  const updatedBug = {
                    ...selectedBug,
                    verifier: e.target.value || undefined,
                    updatedAt: new Date().toISOString(),
                  };
                  setSelectedBug(updatedBug);
                  onUpdateBug(updatedBug);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="">Select a verifier...</option>
                <optgroup label="--- 客户 ---">
                  <option value="客户A">客户A</option>
                  <option value="客户B">客户B</option>
                  <option value="客户C">客户C</option>
                </optgroup>
                <optgroup label="--- 测试人员 ---">
                  <option value="测试人员A">测试人员A</option>
                  <option value="测试人员B">测试人员B</option>
                  <option value="测试人员">测试人员</option>
                </optgroup>
                <optgroup label="--- 我方人员 ---">
                  <option value="需求粉碎机">需求粉碎机</option>
                  <option value="系统拆弹专家">系统拆弹专家</option>
                  <option value="像素魔法师">像素魔法师</option>
                  <option value="数据大厨">数据大厨</option>
                  <option value="配色狂魔">配色狂魔</option>
                  <option value="代码找茬王">代码找茬王</option>
                  <option value="规矩守护者">规矩守护者</option>
                  <option value="Bug猎手">Bug猎手</option>
                  <option value="文档整理控">文档整理控</option>
                  <option value="管理员">管理员</option>
                </optgroup>
              </select>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "11px",
                  color: COLORS.textSecondary,
                }}
              >
                验证人负责在Bug修复后进行测试验证
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Change Status
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {bugStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    aria-label={`Change status to ${BUG_STATUS_LABELS[status]}`}
                    aria-pressed={selectedBug.status === status}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      border:
                        selectedBug.status === status
                          ? `2px solid ${getStatusColor(status)}`
                          : "1px solid #d1d5db",
                      background:
                        selectedBug.status === status
                          ? `${getStatusColor(status)}15`
                          : "#ffffff",
                      color:
                        selectedBug.status === status
                          ? getStatusColor(status)
                          : COLORS.textSecondary,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {BUG_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {selectedBug.resolution && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "#f0fdf4",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                >
                  Resolution:
                </span>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: COLORS.text,
                  }}
                >
                  {selectedBug.resolution}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                Comments ({selectedBug.comments.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {selectedBug.comments.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      color: COLORS.textSecondary,
                      fontStyle: "italic",
                      fontSize: "12px",
                    }}
                  >
                    No comments yet
                  </p>
                ) : (
                  selectedBug.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: COLORS.text,
                          }}
                        >
                          {comment.author}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: COLORS.textSecondary,
                          }}
                        >
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: COLORS.textSecondary,
                        }}
                      >
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                aria-label="Add a comment"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  fontSize: "13px",
                  resize: "vertical",
                  minHeight: "60px",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                }}
              />
              {saveMessage && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    textAlign: "center",
                  }}
                >
                  ✓ {saveMessage}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  aria-label="Submit comment"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: COLORS.buttonPrimary,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: newComment.trim() ? "pointer" : "not-allowed",
                    opacity: newComment.trim() ? 1 : 0.5,
                  }}
                >
                  Add Comment
                </button>
                <button
                  onClick={() => {
                    if (submitting || !selectedBug) {
                      console.log(`[BugTracker] saveBug | SKIPPED | submitting=${submitting} | selectedBug=${!!selectedBug}`);
                      return;
                    }
                    console.log(`[BugTracker] saveBug | starting | bugId=${selectedBug.id} | bugTitle="${selectedBug.title}"`);
                    setSubmitting(true);
                    onUpdateBug(selectedBug);
                    setSaveMessage("Bug updated successfully!");
                    if (saveMessageTimerRef.current) {
                      clearTimeout(saveMessageTimerRef.current);
                    }
                    saveMessageTimerRef.current = setTimeout(() => {
                      setSaveMessage("");
                      setSubmitting(false);
                      console.log(`[BugTracker] saveBug | completed | bugId=${selectedBug.id}`);
                    }, 3000);
                  }}
                  disabled={submitting}
                  aria-label="Save bug changes"
                  style={{
                    padding: "10px 20px",
                    background: submitting ? "#86efac" : "#22c55e",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    if (!selectedBug) {
                      console.warn(`[BugTracker] deleteBug | SKIPPED (selectedBug is null)`);
                      return;
                    }
                    console.log(`[BugTracker] deleteBug | starting | bugId=${selectedBug.id} | bugTitle="${selectedBug.title}"`);
                    onDeleteBug(selectedBug.id, selectedBug.updatedAt);
                    setSelectedBug(null);
                    console.log(`[BugTracker] deleteBug | completed | bugId=${selectedBug.id}`);
                  }}
                  aria-label="Delete bug"
                  style={{
                    padding: "10px 20px",
                    background: COLORS.buttonDanger,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
