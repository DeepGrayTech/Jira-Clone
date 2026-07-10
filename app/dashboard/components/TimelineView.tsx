"use client";

import { useState, useMemo } from "react";
import { Goal, Requirement } from "../types";

interface TimelineViewProps {
  goals: Goal[];
  requirements: Requirement[];
}

export default function TimelineView({
  goals,
  requirements,
}: TimelineViewProps) {
  const [selectedItem, setSelectedItem] = useState<{
    type: "goal" | "requirement";
    item: Goal | Requirement;
  } | null>(null);
  const [viewMode, setViewMode] = useState<
    "all" | "goals" | "requirements"
  >("all");

  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      type: "goal" | "requirement";
      startDate: Date;
      endDate: Date;
      status: string;
      color: string;
      owner?: string;
      progress?: number;
      priority?: string;
      relatedId?: string;
      original: Goal | Requirement;
    }> = [];

    if (viewMode === "all" || viewMode === "goals") {
      goals.forEach((goal) => {
        items.push({
          id: goal.id,
          title: goal.title,
          type: "goal",
          startDate: new Date(goal.startDate),
          endDate: new Date(goal.endDate),
          status: goal.status,
          color: goal.color,
          owner: goal.owner,
          progress: goal.currentProgress,
          original: goal,
        });
      });
    }

    if (viewMode === "all" || viewMode === "requirements") {
      requirements.forEach((req) => {
        items.push({
          id: req.id,
          title: req.title,
          type: "requirement",
          startDate: new Date(req.createdAt),
          endDate: new Date(req.updatedAt),
          status: req.status,
          color:
            req.priority === "CRITICAL"
              ? "#dc2626"
              : req.priority === "HIGH"
              ? "#f97316"
              : req.priority === "MEDIUM"
              ? "#eab308"
              : "#22c55e",
          owner: req.executor,
          priority: req.priority,
          original: req,
        });
      });
    }

    items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    return items;
  }, [goals, requirements, viewMode]);

  const dateRange = useMemo(() => {
    if (timelineItems.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      };
    }

    const validItems = timelineItems.filter(
      (item) =>
        !isNaN(item.startDate.getTime()) && !isNaN(item.endDate.getTime())
    );

    if (validItems.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      };
    }

    const minStart = new Date(
      Math.min(...validItems.map((item) => item.startDate.getTime()))
    );
    const maxEnd = new Date(
      Math.max(...validItems.map((item) => item.endDate.getTime()))
    );

    const padding = (maxEnd.getTime() - minStart.getTime()) * 0.1;

    return {
      start: new Date(minStart.getTime() - padding),
      end: new Date(maxEnd.getTime() + padding),
    };
  }, [timelineItems]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const current = new Date(dateRange.start);
    current.setDate(current.getDate() - current.getDay());

    while (current <= dateRange.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return days;
  }, [dateRange]);

  const getPosition = (date: Date) => {
    const total = dateRange.end.getTime() - dateRange.start.getTime();
    const offset = date.getTime() - dateRange.start.getTime();
    return Math.max(0, Math.min(100, (offset / total) * 100));
  };

  const getDuration = (start: Date, end: Date) => {
    const total = dateRange.end.getTime() - dateRange.start.getTime();
    const duration = end.getTime() - start.getTime();
    return Math.max(1, Math.min(100, (duration / total) * 100));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "🎯";
      case "requirement":
        return "📝";
      default:
        return "📌";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "goal":
        return "Goal";
      case "requirement":
        return "Requirement";
      default:
        return "";
    }
  };

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
            📅 Timeline View
          </h1>
          <p style={{ margin: "0", color: "#4b5563", fontSize: "14px" }}>
            Visualize project timeline with goals and requirements
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { value: "all", label: "All" },
          { value: "goals", label: "Goals" },
          { value: "requirements", label: "Requirements" },
        ].map((mode) => (
          <button
            key={mode.value}
            onClick={() => setViewMode(mode.value as typeof viewMode)}
            aria-pressed={viewMode === mode.value}
            aria-label={`Filter by ${mode.label}`}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: viewMode === mode.value ? "#2563eb" : "#ffffff",
              color: viewMode === mode.value ? "#ffffff" : "#374151",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "200px",
            minWidth: "200px",
            borderRight: "1px solid #e5e7eb",
            backgroundColor: "#f9fafb",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              fontWeight: 600,
              fontSize: "13px",
              color: "#374151",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            Items ({timelineItems.length})
          </div>
          <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {timelineItems.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`${getTypeLabel(item.type)}: ${item.title}, ${formatDate(item.startDate)} to ${formatDate(item.endDate)}`}
                onClick={() =>
                  setSelectedItem({
                    type: item.type,
                    item: item.original,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedItem({
                      type: item.type,
                      item: item.original,
                    });
                  }
                }}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  backgroundColor:
                    selectedItem?.item.id === item.id
                      ? "#eff6ff"
                      : "transparent",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (selectedItem?.item.id !== item.id) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedItem?.item.id !== item.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span>{getTypeIcon(item.type)}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: item.color,
                    }}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                  {item.priority && (
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        backgroundColor:
                          item.priority === "URGENT" ||
                          item.priority === "CRITICAL"
                            ? "#fee2e2"
                            : item.priority === "HIGH"
                            ? "#ffedd5"
                            : item.priority === "MEDIUM"
                            ? "#fef3c7"
                            : "#dcfce7",
                        color:
                          item.priority === "URGENT" ||
                          item.priority === "CRITICAL"
                            ? "#dc2626"
                            : item.priority === "HIGH"
                            ? "#f97316"
                            : item.priority === "MEDIUM"
                            ? "#eab308"
                            : "#22c55e",
                      }}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: "4px",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  {item.owner && <span>👤 {item.owner} · </span>}
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#ffffff",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", minWidth: "100%" }}>
              {weekDays.map((day) => (
                <div
                  key={day.getTime()}
                  style={{
                    flex: 1,
                    minWidth: "80px",
                    padding: "12px 8px",
                    textAlign: "center",
                    borderBottom: "1px solid #e5e7eb",
                    borderRight: "1px solid #e5e7eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  {day.getMonth() + 1}/{day.getDate()}
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: "calc(100vh - 280px)", overflowY: "auto" }}>
            {timelineItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  height: "50px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${getPosition(item.startDate)}%`,
                    width: `${getDuration(item.startDate, item.endDate)}%`,
                    height: "36px",
                    backgroundColor: item.color,
                    borderRadius: "6px",
                    cursor: "pointer",
                    opacity: selectedItem?.item.id === item.id ? 1 : 0.85,
                    transition: "all 0.2s",
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${getTypeLabel(item.type)}: ${item.title}, ${formatDate(item.startDate)} to ${formatDate(item.endDate)}`}
                  onClick={() =>
                    setSelectedItem({
                      type: item.type,
                      item: item.original,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedItem({
                        type: item.type,
                        item: item.original,
                      });
                    }
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity =
                      selectedItem?.item.id === item.id ? "1" : "0.85";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div
                    style={{
                      padding: "4px 8px",
                      color: "#ffffff",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 400,
                        opacity: 0.8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </div>
                  </div>
                  {item.progress !== undefined && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        height: "3px",
                        backgroundColor: "#ffffff",
                        width: `${item.progress}%`,
                        borderRadius: "0 0 6px 6px",
                      }}
                    />
                  )}
                </div>

                {index % 2 === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: "#fafafa",
                      zIndex: -1,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeline-detail-title"
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
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "85vh",
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
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>
                    {getTypeIcon(selectedItem.type)}
                  </span>
                  <span
                    style={{
                      backgroundColor:
                        (selectedItem.item as Goal).color || "#2563eb",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {getTypeLabel(selectedItem.type)}
                  </span>
                </div>
                <h2 id="timeline-detail-title" style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                  {(selectedItem.item as Goal | Requirement).title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close timeline detail dialog"
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

            {selectedItem.type === "goal" && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Status:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Goal).status}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Owner:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Goal).owner}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Target:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Goal).target}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Progress:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Goal).currentProgress}%
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Start Date:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {formatDateFull(
                      new Date((selectedItem.item as Goal).startDate)
                    )}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    End Date:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {formatDateFull(
                      new Date((selectedItem.item as Goal).endDate)
                    )}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Description:
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Goal).description}
                  </p>
                </div>
              </>
            )}

            {selectedItem.type === "requirement" && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Status:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Requirement).status}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Priority:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Requirement).priority}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Requester:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Requirement).requester}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Executor:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Requirement).executor}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Created:
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {formatDateFull(
                      new Date((selectedItem.item as Requirement).createdAt)
                    )}
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Acceptance Criteria:
                  </span>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {(selectedItem.item as Requirement).acceptanceCriteria.map(
                      (criteria, idx) => (
                        <li
                          key={idx}
                          style={{ fontSize: "13px", color: "#374151" }}
                        >
                          {criteria}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Description:
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    {(selectedItem.item as Requirement).description}
                  </p>
                </div>
              </>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              aria-label="Close timeline detail dialog"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                marginTop: "20px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
