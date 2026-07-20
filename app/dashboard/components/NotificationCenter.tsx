"use client";

import { useState, useEffect, useRef } from "react";
import { useNotifications } from "../contexts";
import { COLORS } from "../constants";
import type { Notification, ViewMode } from "../types";

interface NotificationCenterProps {
  fontSizeScale: number;
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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

export default function NotificationCenter({ fontSizeScale, onViewChange }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
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

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const displayNotifications = notifications.slice(0, 10);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          position: "relative",
          padding: `${8 * fontSizeScale}px`,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: `${20 * fontSizeScale}px`,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: `${2 * fontSizeScale}px`,
              right: `${2 * fontSizeScale}px`,
              background: COLORS.buttonDanger,
              color: "#ffffff",
              borderRadius: "50%",
              width: `${18 * fontSizeScale}px`,
              height: `${18 * fontSizeScale}px`,
              fontSize: `${10 * fontSizeScale}px`,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: `${18 * fontSizeScale}px`,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            width: `${360 * fontSizeScale}px`,
            maxWidth: "calc(100vw - 20px)",
            background: COLORS.cardBackground,
            borderRadius: "8px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: `1px solid ${COLORS.border}`,
            zIndex: 1000,
            marginTop: `${8 * fontSizeScale}px`,
            maxHeight: `${480 * fontSizeScale}px`,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: `${12 * fontSizeScale}px ${16 * fontSizeScale}px`,
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: `${16 * fontSizeScale}px`, fontWeight: 600 }}>
              Notifications ({notifications.length})
            </h3>
            <button
              onClick={markAllAsRead}
              style={{
                background: "none",
                border: "none",
                color: COLORS.buttonPrimary,
                cursor: "pointer",
                fontSize: `${12 * fontSizeScale}px`,
                fontWeight: 500,
              }}
            >
              Mark all as read
            </button>
          </div>

          {displayNotifications.length === 0 ? (
            <div
              style={{
                padding: `${40 * fontSizeScale}px ${20 * fontSizeScale}px`,
                textAlign: "center",
                color: COLORS.textSecondary,
              }}
            >
              <div style={{ fontSize: `${32 * fontSizeScale}px`, marginBottom: `${8 * fontSizeScale}px` }}>
                🔔
              </div>
              <p style={{ fontSize: `${14 * fontSizeScale}px` }}>No notifications</p>
            </div>
          ) : (
            <div style={{ padding: `${4 * fontSizeScale}px` }}>
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: `${12 * fontSizeScale}px ${16 * fontSizeScale}px`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: notification.isRead ? "transparent" : "#fef3c7",
                    borderLeft: notification.isRead ? "none" : `3px solid ${NOTIFICATION_COLORS[notification.type]}`,
                    marginBottom: `${4 * fontSizeScale}px`,
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead ? "#f3f4f6" : "#fde68a";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = notification.isRead ? "transparent" : "#fef3c7";
                  }}
                >
                  <div style={{ display: "flex", gap: `${12 * fontSizeScale}px` }}>
                    <div
                      style={{
                        fontSize: `${20 * fontSizeScale}px`,
                        flexShrink: 0,
                      }}
                    >
                      {NOTIFICATION_ICONS[notification.type] || "📌"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: `${14 * fontSizeScale}px`,
                            fontWeight: 600,
                            color: COLORS.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: COLORS.textSecondary,
                            fontSize: `${14 * fontSizeScale}px`,
                            padding: "2px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <p
                        style={{
                          margin: `${4 * fontSizeScale}px 0`,
                          fontSize: `${12 * fontSizeScale}px`,
                          color: COLORS.textSecondary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notification.message}
                      </p>
                      <div
                        style={{
                          fontSize: `${10 * fontSizeScale}px`,
                          color: COLORS.textSecondary,
                          marginTop: `${4 * fontSizeScale}px`,
                        }}
                      >
                        {formatTime(notification.createdAt)}
                        {notification.scheduledSubagent && (
                          <span style={{ marginLeft: `${8 * fontSizeScale}px` }}>
                            • Assigned to {notification.scheduledSubagent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 10 && (
            <div
              style={{
                padding: `${12 * fontSizeScale}px`,
                borderTop: `1px solid ${COLORS.border}`,
                textAlign: "center",
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  onViewChange("NOTIFICATIONS");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.buttonPrimary,
                  cursor: "pointer",
                  fontSize: `${12 * fontSizeScale}px`,
                  fontWeight: 500,
                }}
              >
                View all {notifications.length} notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}