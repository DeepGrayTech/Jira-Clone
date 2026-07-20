"use client";

import { useState, useRef } from "react";
import { Goal, GoalStatus, GoalType, Task, Requirement, Milestone, KeyResult } from "../types";

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  ACHIEVED: "Achieved",
};

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  OKR: "OKR",
  SMART: "SMART",
  MILESTONE: "Milestone",
  PROJECT: "Project",
};

const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  NOT_STARTED: "#9ca3af",
  IN_PROGRESS: "#3b82f6",
  ON_TRACK: "#22c55e",
  AT_RISK: "#f59e0b",
  ACHIEVED: "#10b981",
};

const GOAL_TYPE_COLORS: Record<GoalType, string> = {
  OKR: "#8b5cf6",
  SMART: "#06b6d4",
  MILESTONE: "#f97316",
  PROJECT: "#ec4899",
};

interface GoalTrackerProps {
  goals: Goal[];
  tasks: Task[];
  requirements: Requirement[];
  milestones: Milestone[];
  keyResults: KeyResult[];
  onCreateGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string, expectedUpdatedAt?: string) => void;
}

export default function GoalTracker({
  goals,
  tasks,
  requirements,
  milestones,
  keyResults,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalTrackerProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredGoals = goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGoalRelatedTasks = (goal: Goal) => {
    if (!goal.relatedTaskIds) return [];
    return tasks.filter((task) => goal.relatedTaskIds!.includes(task.id));
  };

  const getGoalRelatedRequirements = (goal: Goal) => {
    if (!goal.relatedRequirementIds) return [];
    return requirements.filter((req) =>
      goal.relatedRequirementIds!.includes(req.id)
    );
  };

  const getGoalMilestones = (goalId: string) => {
    return milestones.filter((m) => m.goalId === goalId);
  };

  const getGoalKeyResults = (goalId: string) => {
    return keyResults.filter((kr) => kr.goalId === goalId);
  };

  const calculateProgressFromTasks = (goal: Goal) => {
    if (goal.status === "ACHIEVED") {
      return goal.currentProgress;
    }

    const relatedTasks = getGoalRelatedTasks(goal);
    if (relatedTasks.length === 0) return goal.currentProgress;

    const completedCount = relatedTasks.filter(
      (t) => t.status === "DONE"
    ).length;
    const taskProgress = Math.round((completedCount / relatedTasks.length) * 100);

    if (taskProgress === 0 && goal.currentProgress > 0) {
      return goal.currentProgress;
    }

    return taskProgress;
  };

  /**
   * Validate goal form data. Returns an error message string, or null if valid.
   */
  const validateGoalData = (data: {
    title: string;
    startDate: string;
    endDate: string;
  }): string | null => {
    if (!data.title || !data.title.trim()) {
      return "Title is required and cannot be empty.";
    }
    if (!data.startDate || !data.endDate) {
      return "Both start date and end date are required.";
    }
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (isNaN(start.getTime())) {
      return `Start date "${data.startDate}" is not a valid date.`;
    }
    if (isNaN(end.getTime())) {
      return `End date "${data.endDate}" is not a valid date.`;
    }
    if (start > end) {
      return `Start date (${data.startDate}) must be before or equal to end date (${data.endDate}).`;
    }
    return null;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const title = (form.elements.namedItem("title") as HTMLInputElement)
        .value;
      const description = (
        form.elements.namedItem("description") as HTMLTextAreaElement
      ).value;
      const type = (form.elements.namedItem("type") as HTMLSelectElement)
        .value as GoalType;
      const target = (form.elements.namedItem("target") as HTMLInputElement)
        .value;
      const owner = (form.elements.namedItem("owner") as HTMLInputElement)
        .value;
      const startDate = (
        form.elements.namedItem("startDate") as HTMLInputElement
      ).value;
      const endDate = (form.elements.namedItem("endDate") as HTMLInputElement)
        .value;
      const color = (form.elements.namedItem("color") as HTMLInputElement)
        .value;

      const goalData = {
        title,
        description,
        type,
        status: "NOT_STARTED" as GoalStatus,
        target,
        currentProgress: 0,
        startDate,
        endDate,
        owner,
        color,
      };

      console.log("[GoalTracker] ========== CREATE GOAL SUBMITTED ==========");
      console.log("[GoalTracker] Timestamp:", new Date().toISOString());
      console.log(
        "[GoalTracker] Form data:",
        JSON.stringify(goalData, null, 2)
      );

      const validationError = validateGoalData({
        title,
        startDate,
        endDate,
      });
      if (validationError) {
        console.warn(
          "[GoalTracker] CREATE: Validation failed:",
          validationError
        );
        setCreateError(validationError);
        return;
      }

      // Check for duplicate title
      const duplicateGoal = goals.find(
        (g) => g.title.trim().toLowerCase() === title.trim().toLowerCase()
      );
      if (duplicateGoal) {
        const duplicateError = `A goal with the title "${title}" already exists. Please use a different title.`;
        console.warn(
          "[GoalTracker] CREATE: Duplicate title:",
          duplicateError
        );
        setCreateError(duplicateError);
        return;
      }

      setCreateError(null);

      console.log("[GoalTracker] Validation: PASSED");
      console.log("[GoalTracker] Calling onCreateGoal...");

      onCreateGoal(goalData);

      console.log("[GoalTracker] onCreateGoal returned. Closing modal.");
      setShowCreateModal(false);
      form.reset();
      console.log("[GoalTracker] ========== CREATE GOAL DONE ==========");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (!selectedGoal) {
        console.warn(
          "[GoalTracker] EDIT: handleUpdateGoal called but selectedGoal is null — aborting."
        );
        return;
      }

      const form = e.target as HTMLFormElement;
      const updatedGoal: Goal = {
        ...selectedGoal,
        title: (form.elements.namedItem("editTitle") as HTMLInputElement).value,
        description: (
          form.elements.namedItem("editDescription") as HTMLTextAreaElement
        ).value,
        type: (form.elements.namedItem("editType") as HTMLSelectElement)
          .value as GoalType,
        status: (form.elements.namedItem("editStatus") as HTMLSelectElement)
          .value as GoalStatus,
        target: (form.elements.namedItem("editTarget") as HTMLInputElement)
          .value,
        owner: (form.elements.namedItem("editOwner") as HTMLInputElement).value,
        startDate: (
          form.elements.namedItem("editStartDate") as HTMLInputElement
        ).value,
        endDate: (form.elements.namedItem("editEndDate") as HTMLInputElement)
          .value,
        color: (form.elements.namedItem("editColor") as HTMLInputElement).value,
        relatedRequirementIds: selectedGoal.relatedRequirementIds
          ? [...selectedGoal.relatedRequirementIds]
          : undefined,
        relatedTaskIds: selectedGoal.relatedTaskIds
          ? [...selectedGoal.relatedTaskIds]
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      console.log("[GoalTracker] ========== EDIT GOAL SUBMITTED ==========");
      console.log("[GoalTracker] Goal ID:", updatedGoal.id);
      console.log("[GoalTracker] Timestamp:", new Date().toISOString());
      console.log(
        "[GoalTracker] Before update:",
        JSON.stringify(selectedGoal, null, 2)
      );
      console.log(
        "[GoalTracker] After update:",
        JSON.stringify(updatedGoal, null, 2)
      );
      const changedFields = Object.keys(selectedGoal).filter(
        (key) =>
          JSON.stringify(
            (selectedGoal as unknown as Record<string, unknown>)[key]
          ) !==
          JSON.stringify(
            (updatedGoal as unknown as Record<string, unknown>)[key]
          )
      );
      console.log(
        "[GoalTracker] Changed fields:",
        changedFields.length > 0 ? changedFields.join(", ") : "NONE"
      );

      const validationError = validateGoalData({
        title: updatedGoal.title,
        startDate: updatedGoal.startDate,
        endDate: updatedGoal.endDate,
      });
      if (validationError) {
        console.warn("[GoalTracker] EDIT: Validation failed:", validationError);
        setEditError(validationError);
        return;
      }
      setEditError(null);

      console.log("[GoalTracker] Validation: PASSED");
      console.log("[GoalTracker] Calling onUpdateGoal...");

      onUpdateGoal(updatedGoal);
      setSelectedGoal(updatedGoal);
      setSaveSuccess(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveSuccess(false), 3000);

      console.log(
        "[GoalTracker] onUpdateGoal returned. Save success banner shown."
      );
      console.log("[GoalTracker] ========== EDIT GOAL DONE ==========");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = () => {
    if (submitting) return;
    if (!selectedGoal) {
      console.warn(
        "[GoalTracker] DELETE: handleDeleteGoal called but selectedGoal is null — aborting."
      );
      return;
    }
    const confirmed = window.confirm(
      `确定要删除目标 "${selectedGoal.title}" 吗？此操作不可撤销。`
    );
    if (!confirmed) {
      console.log("[GoalTracker] DELETE: User cancelled confirmation dialog.");
      return;
    }
    setSubmitting(true);
    try {
      console.log("[GoalTracker] ========== DELETE GOAL ==========");
      console.log("[GoalTracker] Goal ID:", selectedGoal.id);
      console.log("[GoalTracker] Goal title:", selectedGoal.title);
      console.log("[GoalTracker] Timestamp:", new Date().toISOString());
      console.log("[GoalTracker] Calling onDeleteGoal...");
      onDeleteGoal(selectedGoal.id, selectedGoal.updatedAt);
      console.log("[GoalTracker] onDeleteGoal returned. Closing edit modal.");
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setSelectedGoal(null);
      console.log("[GoalTracker] ========== DELETE GOAL DONE ==========");
    } finally {
      setSubmitting(false);
    }
  };

  const teamMembers = [
    "需求粉碎机",
    "系统拆弹专家",
    "像素魔法师",
    "数据大厨",
    "配色狂魔",
    "代码找茬王",
    "规矩守护者",
    "Bug猎手",
    "文档整理控",
    "管理员",
  ];

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
              color: "#111827",
            }}
          >
            🎯 Goal Tracker
          </h1>
          <p style={{ margin: "0", color: "#4b5563", fontSize: "14px" }}>
            Track team goals and align with tasks and requirements
          </p>
        </div>
        <button
          onClick={() => {
            console.log(
              "[GoalTracker] UI: 'New Goal' button clicked. Opening create modal."
            );
            setCreateError(null);
            setSubmitting(false);
            setShowCreateModal(true);
          }}
          aria-label="Create new goal"
          style={{
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1d4ed8")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          + New Goal
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <label htmlFor="goal-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
            Search goals
          </label>
          <input
            id="goal-search"
            type="text"
            placeholder="Search goals by title, description, owner, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search goals by title, description, owner, or type"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {filteredGoals.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            {searchQuery ? (
              <p>No goals found matching "{searchQuery}".</p>
            ) : (
              <p>No goals yet. Click "New Goal" to create one!</p>
            )}
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const progress = calculateProgressFromTasks(goal);
            const relatedTasks = getGoalRelatedTasks(goal);
            const relatedRequirements = getGoalRelatedRequirements(goal);

            const handleGoalCardClick = (goal: Goal) => {
                  console.log(
                    "[GoalTracker] UI: Goal card clicked. Opening edit modal."
                  );
                  console.log(
                    "[GoalTracker]   Goal ID:",
                    goal.id,
                    "Title:",
                    goal.title,
                    "Status:",
                    goal.status
                  );
                  setEditError(null);
                  if (saveTimerRef.current) {
                    clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = null;
                  }
                  setSaveSuccess(false);
                  setSubmitting(false);
                  setSelectedGoal(goal);
                };
                return (
              <div
                key={goal.id}
                role="button"
                tabIndex={0}
                aria-label={`Edit goal: ${goal.title}, status: ${GOAL_STATUS_LABELS[goal.status]}, progress: ${progress}%`}
                onClick={() => handleGoalCardClick(goal)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleGoalCardClick(goal);
                  }
                }}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "20px",
                  border: `2px solid ${goal.color}`,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: GOAL_TYPE_COLORS[goal.type],
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {GOAL_TYPE_LABELS[goal.type]}
                      </span>
                      <span
                        style={{
                          backgroundColor: GOAL_STATUS_COLORS[goal.status],
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {GOAL_STATUS_LABELS[goal.status]}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {goal.title}
                    </h3>
                  </div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: goal.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    {progress}%
                  </div>
                </div>

                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: "1.5",
                  }}
                >
                  {goal.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#6b7280" }}>
                      👤
                    </span>
                  </div>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {goal.owner}
                  </span>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        minWidth: "2px",
                        backgroundColor: goal.color,
                        borderRadius: "3px",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  <span>📋 {relatedTasks.length} tasks</span>
                  <span>📝 {relatedRequirements.length} requirements</span>
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    gap: "8px",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ color: "#9ca3af" }}>
                    📅 {new Date(goal.startDate).toLocaleDateString()}
                  </span>
                  <span style={{ color: "#9ca3af" }}>→</span>
                  <span style={{ color: "#9ca3af" }}>
                    {new Date(goal.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-create-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            console.log(
              "[GoalTracker] UI: Create modal backdrop clicked. Closing."
            );
            if (saveTimerRef.current) {
              clearTimeout(saveTimerRef.current);
              saveTimerRef.current = null;
            }
            setSaveSuccess(false);
            setSubmitting(false);
            setShowCreateModal(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 id="goal-create-title" style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                Create New Goal
              </h2>
              <button
                onClick={() => {
                  console.log(
                    "[GoalTracker] UI: Create modal X button clicked. Closing."
                  );
                  if (saveTimerRef.current) {
                    clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = null;
                  }
                  setSaveSuccess(false);
                  setSubmitting(false);
                  setShowCreateModal(false);
                }}
                aria-label="Close create goal dialog"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGoal}>
              {createError && (
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
                  {createError}
                </div>
              )}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-title"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Title *
                </label>
                <input
                  id="goal-title"
                  type="text"
                  name="title"
                  required
                  placeholder="Enter goal title"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-description"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Description
                </label>
                <textarea
                  id="goal-description"
                  name="description"
                  placeholder="Describe the goal"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="goal-type"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Type
                  </label>
                  <select
                    id="goal-type"
                    name="type"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  >
                    {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="goal-owner"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Owner
                  </label>
                  <select
                    id="goal-owner"
                    name="owner"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  >
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="goal-start-date"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    id="goal-start-date"
                    type="date"
                    name="startDate"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal-end-date"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    End Date
                  </label>
                  <input
                    id="goal-end-date"
                    type="date"
                    name="endDate"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-target"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Target
                </label>
                <input
                  id="goal-target"
                  type="text"
                  name="target"
                  placeholder="What are you aiming for?"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="goal-color"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Color
                </label>
                <input
                  id="goal-color"
                  type="color"
                  name="color"
                  defaultValue="#2563eb"
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "[GoalTracker] UI: Create modal Cancel button clicked. Closing."
                    );
                    if (saveTimerRef.current) {
                      clearTimeout(saveTimerRef.current);
                      saveTimerRef.current = null;
                    }
                    setSaveSuccess(false);
                    setSubmitting(false);
                    setShowCreateModal(false);
                  }}
                  aria-label="Cancel create goal"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label={submitting ? "Saving goal" : "Create goal"}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: submitting ? "#93c5fd" : "#2563eb",
                    color: "white",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedGoal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-edit-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            console.log(
              "[GoalTracker] UI: Edit modal backdrop clicked. Closing."
            );
            if (saveTimerRef.current) {
              clearTimeout(saveTimerRef.current);
              saveTimerRef.current = null;
            }
            setSaveSuccess(false);
            setSubmitting(false);
            setSelectedGoal(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            {saveSuccess && (
              <div
                role="status"
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  textAlign: "center",
                  color: "#166534",
                  fontWeight: 500,
                }}
              >
                Goal updated successfully!
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: GOAL_TYPE_COLORS[selectedGoal.type],
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {GOAL_TYPE_LABELS[selectedGoal.type]}
                  </span>
                  <span
                    style={{
                      backgroundColor: GOAL_STATUS_COLORS[selectedGoal.status],
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {GOAL_STATUS_LABELS[selectedGoal.status]}
                  </span>
                </div>
                <h2 id="goal-edit-title" style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                  {selectedGoal.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  console.log(
                    "[GoalTracker] UI: Edit modal X button clicked. Closing."
                  );
                  if (saveTimerRef.current) {
                    clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = null;
                  }
                  setSaveSuccess(false);
                  setSubmitting(false);
                  setSelectedGoal(null);
                }}
                aria-label="Close edit goal dialog"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateGoal}>
              {editError && (
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
                  {editError}
                </div>
              )}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-edit-title-input"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Title
                </label>
                <input
                  id="goal-edit-title-input"
                  type="text"
                  name="editTitle"
                  required
                  defaultValue={selectedGoal.title}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-edit-description"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Description
                </label>
                <textarea
                  id="goal-edit-description"
                  name="editDescription"
                  defaultValue={selectedGoal.description}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="goal-edit-type"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Type
                  </label>
                  <select
                    id="goal-edit-type"
                    name="editType"
                    defaultValue={selectedGoal.type}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  >
                    {Object.entries(GOAL_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="goal-edit-status"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Status
                  </label>
                  <select
                    id="goal-edit-status"
                    name="editStatus"
                    defaultValue={selectedGoal.status}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  >
                    {Object.entries(GOAL_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="goal-edit-owner"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Owner
                  </label>
                  <select
                    id="goal-edit-owner"
                    name="editOwner"
                    defaultValue={selectedGoal.owner}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  >
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="goal-edit-color"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Color
                  </label>
                  <input
                    id="goal-edit-color"
                    type="color"
                    name="editColor"
                    defaultValue={selectedGoal.color}
                    style={{
                      width: "100%",
                      height: "40px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="goal-edit-target"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Target
                </label>
                <input
                  id="goal-edit-target"
                  type="text"
                  name="editTarget"
                  defaultValue={selectedGoal.target}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Progress: {calculateProgressFromTasks(selectedGoal)}%
                </label>
                <div
                  style={{
                    height: "8px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${calculateProgressFromTasks(selectedGoal)}%`,
                      minWidth: "2px",
                      backgroundColor: selectedGoal.color,
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    htmlFor="goal-edit-start-date"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    id="goal-edit-start-date"
                    type="date"
                    name="editStartDate"
                    defaultValue={selectedGoal.startDate}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal-edit-end-date"
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    End Date
                  </label>
                  <input
                    id="goal-edit-end-date"
                    type="date"
                    name="editEndDate"
                    defaultValue={selectedGoal.endDate}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Related Tasks ({getGoalRelatedTasks(selectedGoal).length})
                </label>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  {getGoalRelatedTasks(selectedGoal).length === 0 ? (
                    <p
                      style={{
                        margin: "4px",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      No related tasks
                    </p>
                  ) : (
                    getGoalRelatedTasks(selectedGoal).map((task) => (
                      <div
                        key={task.id}
                        style={{
                          padding: "6px",
                          borderBottom: "1px solid #f3f4f6",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {task.title} - {task.status}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Related Requirements (
                  {getGoalRelatedRequirements(selectedGoal).length})
                </label>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  {getGoalRelatedRequirements(selectedGoal).length === 0 ? (
                    <p
                      style={{
                        margin: "4px",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      No related requirements
                    </p>
                  ) : (
                    getGoalRelatedRequirements(selectedGoal).map((req) => (
                      <div
                        key={req.id}
                        style={{
                          padding: "6px",
                          borderBottom: "1px solid #f3f4f6",
                          fontSize: "13px",
                          color: "#374151",
                        }}
                      >
                        {req.title} - {req.status}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Milestones ({getGoalMilestones(selectedGoal.id).filter((m) => m.completed).length}/{getGoalMilestones(selectedGoal.id).length} completed)
                </label>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  {getGoalMilestones(selectedGoal.id).length === 0 ? (
                    <p
                      style={{
                        margin: "4px",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      No milestones
                    </p>
                  ) : (
                    getGoalMilestones(selectedGoal.id).map((ms) => (
                      <div
                        key={ms.id}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #f3f4f6",
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span>{ms.completed ? "✅" : "⏳"}</span>
                          <span style={{ fontWeight: 500, color: ms.completed ? "#059669" : "#374151" }}>
                            {ms.title}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 4px 0", color: "#6b7280", fontSize: "12px" }}>
                          {ms.description}
                        </p>
                        <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#9ca3af" }}>
                          <span>📅 Due: {new Date(ms.dueDate).toLocaleDateString()}</span>
                          {ms.completed && ms.completedAt && (
                            <span>✔ Completed: {new Date(ms.completedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Key Results
                </label>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                >
                  {getGoalKeyResults(selectedGoal.id).length === 0 ? (
                    <p
                      style={{
                        margin: "4px",
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      No key results
                    </p>
                  ) : (
                    getGoalKeyResults(selectedGoal.id).map((kr) => {
                      const progressPct = Math.min(
                        Math.round((kr.currentValue / kr.targetValue) * 100),
                        100
                      );
                      const statusColor =
                        kr.status === "ON_TRACK"
                          ? "#22c55e"
                          : kr.status === "AT_RISK"
                          ? "#f59e0b"
                          : "#ef4444";
                      const statusLabel =
                        kr.status === "ON_TRACK"
                          ? "On Track"
                          : kr.status === "AT_RISK"
                          ? "At Risk"
                          : "Behind";
                      return (
                        <div
                          key={kr.id}
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 500, color: "#374151" }}>
                              {kr.title}
                            </span>
                            <span
                              style={{
                                backgroundColor: statusColor,
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div style={{ marginBottom: "4px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "2px",
                                fontSize: "11px",
                                color: "#6b7280",
                              }}
                            >
                              <span>{progressPct}%</span>
                              <span>
                                {kr.currentValue} / {kr.targetValue} {kr.unit}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "6px",
                                backgroundColor: "#f3f4f6",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${progressPct}%`,
                                  minWidth: "2px",
                                  backgroundColor: statusColor,
                                  borderRadius: "3px",
                                  transition: "width 0.3s",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleDeleteGoal}
                  disabled={submitting}
                  aria-label="Delete goal"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: submitting
                      ? "1px solid #9ca3af"
                      : "1px solid #ef4444",
                    backgroundColor: submitting ? "#f3f4f6" : "#fef2f2",
                    color: submitting ? "#9ca3af" : "#ef4444",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "[GoalTracker] UI: Edit modal Cancel button clicked. Closing."
                    );
                    if (saveTimerRef.current) {
                      clearTimeout(saveTimerRef.current);
                      saveTimerRef.current = null;
                    }
                    setSaveSuccess(false);
                    setSubmitting(false);
                    setSelectedGoal(null);
                  }}
                  aria-label="Cancel edit goal"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label={submitting ? "Saving goal" : "Save goal"}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: submitting ? "#93c5fd" : "#2563eb",
                    color: "white",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
