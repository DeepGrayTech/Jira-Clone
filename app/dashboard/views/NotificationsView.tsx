"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "../contexts";
import { COLORS } from "../constants";
import type { Notification, NotificationType, ViewMode } from "../types";

interface NotificationsViewProps {
  fontSizeScale: number;
  isSmall: boolean;
  onViewChange: (view: ViewMode) => void;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  TASK_STATUS_CHANGED: "🔄",
  TASK_COMMENTED: "💬",
  BUG_REPORTED: "🐛",
  BUG_ASSIGNED: "👤",
  REQUIREMENT_APPROVED: "✅",
  TEST_CASE_FAILED: "❌",
  GOAL_PROGRESS_UPDATED: "📈",
  SUBAGENT_TASK_STARTED: "🚀",
  SUBAGENT_TASK_COMPLETED: "🎉",
  SUBAGENT_TASK_FAILED: "⚠️",
};

const NOTIFICATION_COLORS: Record<string, string> = {
  TASK_ASSIGNED: "#3b82f6",
  TASK_STATUS_CHANGED: "#eab308",
  TASK_COMMENTED: "#8b5cf6",
  BUG_REPORTED: "#f97316",
  BUG_ASSIGNED: "#22c55e",
  REQUIREMENT_APPROVED: "#22c55e",
  TEST_CASE_FAILED: "#dc2626",
  GOAL_PROGRESS_UPDATED: "#06b6d4",
  SUBAGENT_TASK_STARTED: "#8b5cf6",
  SUBAGENT_TASK_COMPLETED: "#22c55e",
  SUBAGENT_TASK_FAILED: "#dc2626",
};

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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString();
}

export default function NotificationsView({ fontSizeScale, isSmall, onViewChange }: NotificationsViewProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<NotificationType | "">("");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        searchQuery === "" ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "" || notification.type === filterType;
      const matchesRead = 
        filterRead === "all" ||
        (filterRead === "read" && notification.isRead) ||
        (filterRead === "unread" && !notification.isRead);

      return matchesSearch && matchesType && matchesRead;
    });
  }, [notifications, searchQuery, filterType, filterRead]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      const targetType = notification.targetType;
      const viewMap: Record<string, ViewMode> = {
        TASK: "TASKS",
        BUG: "BUGS",
        REQUIREMENT: "REQUIREMENTS",
        TEST_CASE: "TESTING",
        GOAL: "GOALS",
      };
      const view = viewMap[targetType];
      if (view) {
        onViewChange(view);
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteNotification(id));
    setSelectedIds([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.length - unreadCount;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isSmall ? "12px" : "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: `${22 * fontSizeScale}px`,
              fontWeight: 700,
            }}
          >
            Notifications
          </h2>
          <p
            style={{
              margin: `${4 * fontSizeScale}px 0 0`,
              fontSize: `${14 * fontSizeScale}px`,
              color: COLORS.textSecondary,
            }}
          >
            {unreadCount} unread, {readCount} read of {notifications.length} total
          </p>
        </div>
        <div style={{ display: "flex", gap: `${8 * fontSizeScale}px`, flexWrap: "wrap" }}>
          <button
            onClick={markAllAsRead}
            style={{
              padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
              background: COLORS.buttonSecondary,
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${14 * fontSizeScale}px`,
              fontWeight: 500,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = COLORS.buttonSecondary;
            }}
          >
            Mark All as Read
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{
                padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
                background: COLORS.buttonDanger,
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: `${14 * fontSizeScale}px`,
                fontWeight: 500,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = COLORS.buttonDangerHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = COLORS.buttonDanger;
              }}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: `${12 * fontSizeScale}px`,
          flexWrap: "wrap",
          marginBottom: `${16 * fontSizeScale}px`,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: isSmall ? "100%" : "200px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            style={{
              width: "100%",
              padding: `${10 * fontSizeScale}px ${12 * fontSizeScale}px`,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              fontSize: `${14 * fontSizeScale}px`,
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as NotificationType | "")}
          style={{
            padding: `${10 * fontSizeScale}px ${12 * fontSizeScale}px`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: `${14 * fontSizeScale}px`,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="">All Types</option>
          {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value as "all" | "read" | "unread")}
          style={{
            padding: `${10 * fontSizeScale}px ${12 * fontSizeScale}px`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            fontSize: `${14 * fontSizeScale}px`,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        {(searchQuery || filterType || filterRead !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterType("");
              setFilterRead("all");
            }}
            style={{
              padding: `${10 * fontSizeScale}px ${12 * fontSizeScale}px`,
              background: COLORS.buttonSecondary,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: `${14 * fontSizeScale}px`,
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <div
          style={{
            padding: `${60 * fontSizeScale}px ${20 * fontSizeScale}px`,
            textAlign: "center",
            color: COLORS.textSecondary,
          }}
        >
          <div style={{ fontSize: `${48 * fontSizeScale}px`, marginBottom: `${16 * fontSizeScale}px` }}>
            🔔
          </div>
          <h3 style={{ margin: 0, fontSize: `${18 * fontSizeScale}px`, fontWeight: 600 }}>
            No notifications found
          </h3>
          <p style={{ fontSize: `${14 * fontSizeScale}px`, marginTop: `${8 * fontSizeScale}px` }}>
            {searchQuery || filterType || filterRead !== "all"
              ? "Try adjusting your filters"
              : "You'll see notifications here when events happen"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${8 * fontSizeScale}px`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
              background: COLORS.buttonSecondary,
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: `${12 * fontSizeScale}px`,
              color: COLORS.textSecondary,
            }}
          >
            <input
              type="checkbox"
              checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={handleSelectAll}
              style={{ marginRight: `${12 * fontSizeScale}px`, cursor: "pointer" }}
            />
            Select All ({filteredNotifications.length})
          </div>

          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: "flex",
                gap: `${12 * fontSizeScale}px`,
                padding: `${16 * fontSizeScale}px`,
                background: notification.isRead ? COLORS.cardBackground : "#fef3c7",
                border: `1px solid ${notification.isRead ? COLORS.border : "#fcd34d"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(notification.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleSelect(notification.id);
                }}
                style={{
                  marginTop: `${4 * fontSizeScale}px`,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              
              <div
                style={{
                  fontSize: `${24 * fontSizeScale}px`,
                  flexShrink: 0,
                  color: NOTIFICATION_COLORS[notification.type],
                }}
              >
                {NOTIFICATION_ICONS[notification.type] || "📌"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: `${16 * fontSizeScale}px`,
                        fontWeight: 600,
                        color: COLORS.text,
                      }}
                    >
                      {notification.title}
                    </h4>
                    <span
                      style={{
                        fontSize: `${12 * fontSizeScale}px`,
                        color: NOTIFICATION_COLORS[notification.type],
                        fontWeight: 500,
                      }}
                    >
                      {NOTIFICATION_TYPE_LABELS[notification.type]}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: `${12 * fontSizeScale}px`, color: COLORS.textSecondary }}>
                      {formatTime(notification.createdAt)}
                    </span>
                    {!notification.isRead && (
                      <span
                        style={{
                          display: "inline-block",
                          width: `${8 * fontSizeScale}px`,
                          height: `${8 * fontSizeScale}px`,
                          background: COLORS.buttonPrimary,
                          borderRadius: "50%",
                          marginLeft: `${8 * fontSizeScale}px`,
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <p
                  style={{
                    margin: `${8 * fontSizeScale}px 0`,
                    fontSize: `${14 * fontSizeScale}px`,
                    color: COLORS.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {notification.message}
                </p>

                {notification.scheduledSubagent && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: `${4 * fontSizeScale}px`,
                      padding: `${4 * fontSizeScale}px ${10 * fontSizeScale}px`,
                      background: "#f0f9ff",
                      borderRadius: "4px",
                      fontSize: `${12 * fontSizeScale}px`,
                      color: "#0369a1",
                    }}
                  >
                    🤖 {notification.scheduledSubagent}
                  </div>
                )}

                {notification.isActionable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                    style={{
                      marginTop: `${8 * fontSizeScale}px`,
                      padding: `${6 * fontSizeScale}px ${12 * fontSizeScale}px`,
                      background: COLORS.buttonPrimary,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: `${12 * fontSizeScale}px`,
                      fontWeight: 500,
                    }}
                  >
                    View Details
                  </button>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: COLORS.textSecondary,
                  fontSize: `${16 * fontSizeScale}px`,
                  padding: `${4 * fontSizeScale}px`,
                  opacity: 0.5,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.color = COLORS.buttonDanger;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                  e.currentTarget.style.color = COLORS.textSecondary;
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}