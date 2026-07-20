import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { NotificationService } from "../app/dashboard/services/NotificationService";
import { SubagentTaskService } from "../app/dashboard/services/SubagentTaskService";
import { AuditService } from "../app/dashboard/services/AuditService";
import { STORAGE_KEYS } from "../app/dashboard/constants";
import type { Notification, SubagentTask, NotificationType } from "../app/dashboard/types";

describe("Notification Service", () => {
  let notificationService: NotificationService;
  let auditService: AuditService;

  beforeEach(() => {
    localStorage.clear();
    auditService = new AuditService();
    notificationService = new NotificationService(auditService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create a notification", () => {
    const notification = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 'Implement Login' has been assigned to you",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "test-user",
      isActionable: true,
    });

    expect(notification.id).toBeDefined();
    expect(notification.type).toBe("TASK_ASSIGNED");
    expect(notification.title).toBe("Task Assigned");
    expect(notification.isRead).toBe(false);
    expect(notification.createdAt).toBeDefined();
  });

  it("should get notifications for a recipient", () => {
    const notification1 = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 1",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification1);

    const notification2 = notificationService.createNotification({
      type: "BUG_REPORTED",
      title: "Bug Reported",
      message: "Bug 1",
      targetId: "bug-1",
      targetType: "BUG",
      recipient: "user2",
      isActionable: true,
    });
    notificationService.saveNotification(notification2);

    const user1Notifications = notificationService.getNotifications("user1");
    const user2Notifications = notificationService.getNotifications("user2");

    expect(user1Notifications.length).toBe(1);
    expect(user1Notifications[0].id).toBe(notification1.id);
    expect(user2Notifications.length).toBe(1);
    expect(user2Notifications[0].id).toBe(notification2.id);
  });

  it("should return empty array when no notifications exist", () => {
    const notifications = notificationService.getNotifications("user1");
    expect(notifications.length).toBe(0);
  });

  it("should get unread count", () => {
    const notification1 = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 1",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification1);

    const notification2 = notificationService.createNotification({
      type: "BUG_REPORTED",
      title: "Bug Reported",
      message: "Bug 1",
      targetId: "bug-1",
      targetType: "BUG",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification2);

    expect(notificationService.getUnreadCount("user1")).toBe(2);
  });

  it("should mark notification as read", () => {
    const notification = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 1",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification);

    expect(notificationService.getUnreadCount("user1")).toBe(1);

    notificationService.markAsRead(notification.id, "user1");

    expect(notificationService.getUnreadCount("user1")).toBe(0);
  });

  it("should mark all notifications as read", () => {
    const notification1 = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 1",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification1);

    const notification2 = notificationService.createNotification({
      type: "BUG_REPORTED",
      title: "Bug Reported",
      message: "Bug 1",
      targetId: "bug-1",
      targetType: "BUG",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification2);

    expect(notificationService.getUnreadCount("user1")).toBe(2);

    notificationService.markAllAsRead("user1");

    expect(notificationService.getUnreadCount("user1")).toBe(0);
  });

  it("should delete notification", () => {
    const notification = notificationService.createNotification({
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task 1",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isActionable: true,
    });
    notificationService.saveNotification(notification);

    expect(notificationService.getNotifications("user1").length).toBe(1);

    const result = notificationService.deleteNotification(notification.id, "user1");

    expect(result).toBe(true);
    expect(notificationService.getNotifications("user1").length).toBe(0);
  });

  it("should return false when deleting non-existent notification", () => {
    const result = notificationService.deleteNotification("non-existent-id", "user1");
    expect(result).toBe(false);
  });

  it("should get default settings when no settings exist", () => {
    const settings = notificationService.getSettings("user1");
    expect(settings.userId).toBe("user1");
    expect(settings.enabledTypes.length).toBe(11);
    expect(settings.autoScheduleSubagent).toBe(true);
    expect(settings.preferredSubagents.length).toBe(5);
  });

  it("should save and retrieve settings", () => {
    const settings = {
      userId: "user1",
      enabledTypes: ["TASK_ASSIGNED", "BUG_REPORTED"] as NotificationType[],
      autoScheduleSubagent: false,
      preferredSubagents: ["senior-frontend-engineer"],
    };

    notificationService.saveSettings(settings);
    const retrieved = notificationService.getSettings("user1");

    expect(retrieved.userId).toBe("user1");
    expect(retrieved.enabledTypes).toEqual(["TASK_ASSIGNED", "BUG_REPORTED"]);
    expect(retrieved.autoScheduleSubagent).toBe(false);
    expect(retrieved.preferredSubagents).toEqual(["senior-frontend-engineer"]);
  });

  it("should check if notification type is enabled", () => {
    const settings = {
      userId: "user1",
      enabledTypes: ["TASK_ASSIGNED"] as NotificationType[],
      autoScheduleSubagent: true,
      preferredSubagents: [],
    };
    notificationService.saveSettings(settings);

    expect(notificationService.isNotificationEnabled("TASK_ASSIGNED", "user1")).toBe(true);
    expect(notificationService.isNotificationEnabled("BUG_REPORTED", "user1")).toBe(false);
  });

  it("should handle null or invalid JSON in localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, "invalid json");
    const notifications = notificationService.getNotifications("user1");
    expect(notifications.length).toBe(0);
  });

  it("should handle non-array notifications data", () => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify({ id: "1", name: "not an array" }));
    const notifications = notificationService.getNotifications("user1");
    expect(notifications.length).toBe(0);
  });
});

describe("Subagent Task Service", () => {
  let subagentTaskService: SubagentTaskService;
  let auditService: AuditService;

  beforeEach(() => {
    localStorage.clear();
    auditService = new AuditService();
    subagentTaskService = new SubagentTaskService(auditService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should create a subagent task", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "PENDING",
      progress: 0,
      inputData: { taskId: "task-1", taskTitle: "Implement Login" },
    });

    expect(task.id).toBeDefined();
    expect(task.subagentName).toBe("senior-frontend-engineer");
    expect(task.status).toBe("PENDING");
    expect(task.progress).toBe(0);
    expect(task.createdAt).toBeDefined();
  });

  it("should get subagent tasks", () => {
    const task1 = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task1);

    const task2 = subagentTaskService.createSubagentTask({
      notificationId: "notif-2",
      subagentName: "test-engineer",
      taskType: "testing",
      status: "PENDING",
      progress: 0,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task2);

    const tasks = subagentTaskService.getSubagentTasks();
    expect(tasks.length).toBe(2);
  });

  it("should get subagent task by ID", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    const found = subagentTaskService.getSubagentTask(task.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(task.id);
    expect(found?.subagentName).toBe("senior-frontend-engineer");
  });

  it("should return undefined for non-existent task", () => {
    const found = subagentTaskService.getSubagentTask("non-existent-id");
    expect(found).toBeUndefined();
  });

  it("should update task status", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "PENDING",
      progress: 0,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    subagentTaskService.updateTaskStatus(task.id, "RUNNING");
    const updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.status).toBe("RUNNING");
    expect(updated?.startedAt).toBeDefined();

    subagentTaskService.updateTaskStatus(task.id, "COMPLETED");
    const completed = subagentTaskService.getSubagentTask(task.id);
    expect(completed?.status).toBe("COMPLETED");
    expect(completed?.progress).toBe(100);
    expect(completed?.completedAt).toBeDefined();
  });

  it("should update task progress", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "PENDING",
      progress: 0,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    subagentTaskService.updateTaskProgress(task.id, 30);
    let updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.progress).toBe(30);
    expect(updated?.status).toBe("RUNNING");

    subagentTaskService.updateTaskProgress(task.id, 100);
    updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.progress).toBe(100);
    expect(updated?.status).toBe("COMPLETED");
  });

  it("should update task output", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    const outputData = { result: "success", code: "function test() {}" };
    subagentTaskService.updateTaskOutput(task.id, outputData);

    const updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.outputData).toEqual(outputData);
  });

  it("should update task error and mark as failed", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    subagentTaskService.updateTaskError(task.id, "Build failed: syntax error");

    const updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.status).toBe("FAILED");
    expect(updated?.errorMessage).toBe("Build failed: syntax error");
    expect(updated?.completedAt).toBeDefined();
  });

  it("should cancel task", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    const result = subagentTaskService.cancelTask(task.id);
    expect(result).toBe(true);

    const updated = subagentTaskService.getSubagentTask(task.id);
    expect(updated?.status).toBe("CANCELLED");
  });

  it("should not cancel completed task", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "COMPLETED",
      progress: 100,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    const result = subagentTaskService.cancelTask(task.id);
    expect(result).toBe(false);
  });

  it("should delete task", () => {
    const task = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task);

    expect(subagentTaskService.getSubagentTasks().length).toBe(1);

    const result = subagentTaskService.deleteTask(task.id);
    expect(result).toBe(true);
    expect(subagentTaskService.getSubagentTasks().length).toBe(0);
  });

  it("should get tasks by status", () => {
    const task1 = subagentTaskService.createSubagentTask({
      notificationId: "notif-1",
      subagentName: "senior-frontend-engineer",
      taskType: "development",
      status: "RUNNING",
      progress: 50,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task1);

    const task2 = subagentTaskService.createSubagentTask({
      notificationId: "notif-2",
      subagentName: "test-engineer",
      taskType: "testing",
      status: "RUNNING",
      progress: 30,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task2);

    const task3 = subagentTaskService.createSubagentTask({
      notificationId: "notif-3",
      subagentName: "code-reviewer",
      taskType: "review",
      status: "COMPLETED",
      progress: 100,
      inputData: {},
    });
    subagentTaskService.saveSubagentTask(task3);

    const runningTasks = subagentTaskService.getRunningTasks();
    const completedTasks = subagentTaskService.getCompletedTasks();

    expect(runningTasks.length).toBe(2);
    expect(completedTasks.length).toBe(1);
  });

  it("should handle null or invalid JSON in localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.SUBAGENT_TASKS, "invalid json");
    const tasks = subagentTaskService.getSubagentTasks();
    expect(tasks.length).toBe(0);
  });

  it("should handle empty localStorage", () => {
    const tasks = subagentTaskService.getSubagentTasks();
    expect(tasks.length).toBe(0);
  });
});