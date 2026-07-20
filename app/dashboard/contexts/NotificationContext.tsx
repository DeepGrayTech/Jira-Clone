"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Notification, NotificationSettings, SubagentTask, NotificationType } from "../types";
import { NotificationService } from "../services/NotificationService";
import { SubagentTaskService } from "../services/SubagentTaskService";
import { AuditService } from "../services/AuditService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  subagentTasks: SubagentTask[];
  settings: NotificationSettings;
  
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => boolean;
  createNotification: (data: Omit<Notification, "id" | "createdAt" | "isRead">) => Notification;
  
  fetchSubagentTasks: () => void;
  createSubagentTask: (data: Omit<SubagentTask, "id" | "createdAt">) => SubagentTask;
  updateSubagentTaskStatus: (id: string, status: SubagentTask["status"]) => void;
  updateSubagentTaskProgress: (id: string, progress: number) => void;
  cancelSubagentTask: (id: string) => boolean;
  
  fetchSettings: () => void;
  saveSettings: (settings: NotificationSettings) => void;
  isNotificationEnabled: (type: NotificationType) => boolean;
  isSubagentAutoScheduleEnabled: () => boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const auditService = new AuditService();
const notificationService = new NotificationService(auditService);
const subagentTaskService = new SubagentTaskService(auditService);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subagentTasks, setSubagentTasks] = useState<SubagentTask[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    userId: "",
    enabledTypes: [],
    autoScheduleSubagent: true,
    preferredSubagents: [],
  });

  const getCurrentUserId = useCallback(() => {
    const authToken = localStorage.getItem("jira-clone-auth-token");
    if (authToken) {
      try {
        const decoded = JSON.parse(atob(authToken.split(".")[1]));
        return decoded.username || "anonymous";
      } catch {
        return "anonymous";
      }
    }
    return "anonymous";
  }, []);

  const fetchNotifications = useCallback(() => {
    const userId = getCurrentUserId();
    const fetched = notificationService.getNotifications(userId);
    setNotifications(fetched);
    setUnreadCount(notificationService.getUnreadCount(userId));
  }, [getCurrentUserId]);

  const markAsRead = useCallback((id: string) => {
    const userId = getCurrentUserId();
    notificationService.markAsRead(id, userId);
    fetchNotifications();
  }, [getCurrentUserId, fetchNotifications]);

  const markAllAsRead = useCallback(() => {
    const userId = getCurrentUserId();
    notificationService.markAllAsRead(userId);
    fetchNotifications();
  }, [getCurrentUserId, fetchNotifications]);

  const deleteNotification = useCallback((id: string): boolean => {
    const userId = getCurrentUserId();
    const result = notificationService.deleteNotification(id, userId);
    fetchNotifications();
    return result;
  }, [getCurrentUserId, fetchNotifications]);

  const createNotification = useCallback((data: Omit<Notification, "id" | "createdAt" | "isRead">): Notification => {
    const userId = getCurrentUserId();
    const recipient = data.recipient || userId;
    const notification = notificationService.createNotification({ ...data, recipient });
    notificationService.saveNotification(notification);
    fetchNotifications();
    return notification;
  }, [getCurrentUserId, fetchNotifications]);

  const fetchSubagentTasks = useCallback(() => {
    const fetched = subagentTaskService.getSubagentTasks();
    setSubagentTasks(fetched);
  }, []);

  const createSubagentTask = useCallback((data: Omit<SubagentTask, "id" | "createdAt">): SubagentTask => {
    const task = subagentTaskService.createSubagentTask(data);
    subagentTaskService.saveSubagentTask(task);
    fetchSubagentTasks();
    return task;
  }, [fetchSubagentTasks]);

  const updateSubagentTaskStatus = useCallback((id: string, status: SubagentTask["status"]) => {
    subagentTaskService.updateTaskStatus(id, status);
    fetchSubagentTasks();
  }, [fetchSubagentTasks]);

  const updateSubagentTaskProgress = useCallback((id: string, progress: number) => {
    subagentTaskService.updateTaskProgress(id, progress);
    fetchSubagentTasks();
  }, [fetchSubagentTasks]);

  const cancelSubagentTask = useCallback((id: string): boolean => {
    const result = subagentTaskService.cancelTask(id);
    fetchSubagentTasks();
    return result;
  }, [fetchSubagentTasks]);

  const fetchSettings = useCallback(() => {
    const userId = getCurrentUserId();
    const fetched = notificationService.getSettings(userId);
    setSettings(fetched);
  }, [getCurrentUserId]);

  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    notificationService.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const isNotificationEnabled = useCallback((type: NotificationType): boolean => {
    return notificationService.isNotificationEnabled(type, settings.userId);
  }, [settings.userId]);

  const isSubagentAutoScheduleEnabled = useCallback((): boolean => {
    return notificationService.isSubagentAutoScheduleEnabled(settings.userId);
  }, [settings.userId]);

  useEffect(() => {
    fetchNotifications();
    fetchSubagentTasks();
    fetchSettings();
  }, [fetchNotifications, fetchSubagentTasks, fetchSettings]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        subagentTasks,
        settings,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
        fetchSubagentTasks,
        createSubagentTask,
        updateSubagentTaskStatus,
        updateSubagentTaskProgress,
        cancelSubagentTask,
        fetchSettings,
        saveSettings,
        isNotificationEnabled,
        isSubagentAutoScheduleEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};