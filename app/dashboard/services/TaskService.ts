import type { Task } from "../types";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";

export class TaskService {
  constructor(
    private auditService: AuditService,
    private validationService: ValidationService
  ) {}

  createTask(taskData: Omit<Task, "id" | "createdAt">): Task {
    const validation = this.validationService.validateTaskData(taskData);
    if (!validation.isValid) {
      throw new Error("Invalid task data");
    }

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return newTask;
  }

  updateTask(taskId: string, updates: Partial<Task>): Partial<Task> {
    const validation = this.validationService.validateTaskData(updates);
    if (!validation.isValid) {
      throw new Error("Invalid task update data");
    }

    return updates;
  }

  canMoveToStatus(currentStatus: Task["status"], newStatus: Task["status"]): boolean {
    const validTransitions: Record<Task["status"], Task["status"][]> = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["TODO", "DONE"],
      DONE: ["IN_PROGRESS"],
    };
    return validTransitions[currentStatus].includes(newStatus);
  }

  generateAuditLog(action: "CREATE" | "UPDATE" | "DELETE", task: Task, username?: string) {
    const details = action === "CREATE" 
      ? `Task created: "${task.title}"`
      : action === "UPDATE"
      ? `Task updated: "${task.title}"`
      : `Task deleted: "${task.title}"`;
    
    return this.auditService.logAction(action, "TASK", task.id, details, username);
  }
}