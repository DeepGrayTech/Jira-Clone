import type { Notification, NotificationSettings, NotificationType } from "../types";
import { STORAGE_KEYS } from "../constants";
import { AuditService } from "./AuditService";

export class NotificationService {
  constructor(private auditService: AuditService) {}

  createNotification(data: Omit<Notification, "id" | "createdAt" | "isRead">): Notification {
    const newNotification: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    this.auditService.logAction("CREATE", "NOTIFICATION", newNotification.id, 
      `Notification created: ${newNotification.type}`, data.sender);

    return newNotification;
  }

  getNotifications(recipient: string): Notification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];

    try {
      const allNotifications: Notification[] = JSON.parse(raw);
      return allNotifications
        .filter(n => n.recipient === recipient)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  getUnreadCount(recipient: string): number {
    const notifications = this.getNotifications(recipient);
    return notifications.filter(n => !n.isRead).length;
  }

  saveNotification(notification: Notification): void {
    const notifications = this.getNotifications(notification.recipient);
    const existingIndex = notifications.findIndex(n => n.id === notification.id);
    
    if (existingIndex >= 0) {
      notifications[existingIndex] = notification;
    } else {
      notifications.unshift(notification);
    }

    const allRaw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let allNotifications: Notification[] = [];
    if (allRaw) {
      try {
        allNotifications = JSON.parse(allRaw);
      } catch {
        allNotifications = [];
      }
    }

    const otherRecipientNotifications = allNotifications.filter(n => n.recipient !== notification.recipient);
    const updatedAll = [...otherRecipientNotifications, ...notifications];
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedAll));
  }

  saveNotifications(notifications: Notification[], recipient?: string): void {
    const targetRecipient = recipient || (notifications.length > 0 ? notifications[0].recipient : undefined);
    if (!targetRecipient) return;
    
    const allRaw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let allNotifications: Notification[] = [];
    if (allRaw) {
      try {
        allNotifications = JSON.parse(allRaw);
      } catch {
        allNotifications = [];
      }
    }

    const otherRecipientNotifications = allNotifications.filter(n => n.recipient !== targetRecipient);
    const updatedAll = [...otherRecipientNotifications, ...notifications];
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedAll));
  }

  markAsRead(id: string, recipient: string): void {
    const notifications = this.getNotifications(recipient);
    const notification = notifications.find(n => n.id === id);
    
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.saveNotifications(notifications);
      
      this.auditService.logAction("READ", "NOTIFICATION", id, 
        "Notification marked as read", recipient);
    }
  }

  markAllAsRead(recipient: string): number {
    const notifications = this.getNotifications(recipient);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    notifications.forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
      }
    });
    
    this.saveNotifications(notifications);
    
    if (unreadCount > 0) {
      this.auditService.logAction("READ", "NOTIFICATION", "all", 
        `${unreadCount} notifications marked as read`, recipient);
    }
    
    return unreadCount;
  }

  deleteNotification(id: string, recipient: string): boolean {
    const notifications = this.getNotifications(recipient);
    const filtered = notifications.filter(n => n.id !== id);
    
    if (filtered.length !== notifications.length) {
      this.saveNotifications(filtered, recipient);
      
      this.auditService.logAction("DELETE", "NOTIFICATION", id, 
        "Notification deleted", recipient);
      
      return true;
    }
    
    return false;
  }

  getSettings(userId: string): NotificationSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!raw) {
      return this.getDefaultSettings(userId);
    }

    try {
      const allSettings: Record<string, NotificationSettings> = JSON.parse(raw);
      return allSettings[userId] || this.getDefaultSettings(userId);
    } catch {
      return this.getDefaultSettings(userId);
    }
  }

  saveSettings(settings: NotificationSettings): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    let allSettings: Record<string, NotificationSettings> = {};
    
    if (raw) {
      try {
        allSettings = JSON.parse(raw);
      } catch {
        allSettings = {};
      }
    }

    allSettings[settings.userId] = settings;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(allSettings));
  }

  getDefaultSettings(userId: string): NotificationSettings {
    return {
      userId,
      enabledTypes: [
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
      ],
      autoScheduleSubagent: true,
      preferredSubagents: [
        "senior-frontend-engineer",
        "senior-backend-engineer",
        "architecture-task-splitter",
        "code-reviewer",
        "test-engineer",
      ],
    };
  }

  isNotificationEnabled(type: NotificationType, userId: string): boolean {
    const settings = this.getSettings(userId);
    return settings.enabledTypes.includes(type);
  }

  isSubagentAutoScheduleEnabled(userId: string): boolean {
    const settings = this.getSettings(userId);
    return settings.autoScheduleSubagent;
  }

  getPreferredSubagents(userId: string): string[] {
    const settings = this.getSettings(userId);
    return settings.preferredSubagents;
  }
}