import type { SubagentTask } from "../types";
import { STORAGE_KEYS } from "../constants";
import { AuditService } from "./AuditService";

export class SubagentTaskService {
  constructor(private auditService: AuditService) {}

  createSubagentTask(data: Omit<SubagentTask, "id" | "createdAt">): SubagentTask {
    const newTask: SubagentTask = {
      ...data,
      id: `sat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.auditService.logAction("CREATE", "SUBAGENT_TASK", newTask.id, 
      `Subagent task created: ${newTask.subagentName} - ${newTask.taskType}`, "system");

    return newTask;
  }

  getSubagentTasks(notificationId?: string): SubagentTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBAGENT_TASKS);
    if (!raw) return [];

    try {
      const allTasks: SubagentTask[] = JSON.parse(raw);
      if (notificationId) {
        return allTasks.filter(t => t.notificationId === notificationId);
      }
      return allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  getSubagentTask(id: string): SubagentTask | undefined {
    const tasks = this.getSubagentTasks();
    return tasks.find(t => t.id === id);
  }

  saveSubagentTask(task: SubagentTask): void {
    const tasks = this.getSubagentTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.unshift(task);
    }

    localStorage.setItem(STORAGE_KEYS.SUBAGENT_TASKS, JSON.stringify(tasks));
  }

  saveSubagentTasks(tasks: SubagentTask[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBAGENT_TASKS, JSON.stringify(tasks));
  }

  updateTaskStatus(id: string, status: SubagentTask["status"]): void {
    const tasks = this.getSubagentTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task) {
      const oldStatus = task.status;
      task.status = status;
      
      if (status === "RUNNING" && !task.startedAt) {
        task.startedAt = new Date().toISOString();
      } else if (status === "COMPLETED" || status === "FAILED" || status === "CANCELLED") {
        task.completedAt = new Date().toISOString();
        if (status === "COMPLETED") {
          task.progress = 100;
        }
      }
      
      this.saveSubagentTasks(tasks);
      
      this.auditService.logAction("UPDATE", "SUBAGENT_TASK", id, 
        `Subagent task status changed: ${oldStatus} -> ${status}`, "system");
    }
  }

  updateTaskProgress(id: string, progress: number): void {
    const tasks = this.getSubagentTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress));
      
      if (task.progress === 100 && task.status !== "COMPLETED") {
        task.status = "COMPLETED";
        task.completedAt = new Date().toISOString();
      } else if (task.progress > 0 && task.status === "PENDING") {
        task.status = "RUNNING";
        task.startedAt = new Date().toISOString();
      }
      
      this.saveSubagentTasks(tasks);
      
      this.auditService.logAction("UPDATE", "SUBAGENT_TASK", id, 
        `Subagent task progress updated: ${task.progress}%`, "system");
    }
  }

  updateTaskOutput(id: string, outputData: Record<string, unknown>): void {
    const tasks = this.getSubagentTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task) {
      task.outputData = outputData;
      this.saveSubagentTasks(tasks);
      
      this.auditService.logAction("UPDATE", "SUBAGENT_TASK", id, 
        "Subagent task output updated", "system");
    }
  }

  updateTaskError(id: string, errorMessage: string): void {
    const tasks = this.getSubagentTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task) {
      task.errorMessage = errorMessage;
      task.status = "FAILED";
      task.completedAt = new Date().toISOString();
      this.saveSubagentTasks(tasks);
      
      this.auditService.logAction("UPDATE", "SUBAGENT_TASK", id, 
        `Subagent task failed: ${errorMessage}`, "system");
    }
  }

  cancelTask(id: string): boolean {
    const tasks = this.getSubagentTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task && task.status !== "COMPLETED" && task.status !== "FAILED") {
      task.status = "CANCELLED";
      task.completedAt = new Date().toISOString();
      this.saveSubagentTasks(tasks);
      
      this.auditService.logAction("DELETE", "SUBAGENT_TASK", id, 
        "Subagent task cancelled", "system");
      
      return true;
    }
    
    return false;
  }

  deleteTask(id: string): boolean {
    const tasks = this.getSubagentTasks();
    const filtered = tasks.filter(t => t.id !== id);
    
    if (filtered.length !== tasks.length) {
      this.saveSubagentTasks(filtered);
      
      this.auditService.logAction("DELETE", "SUBAGENT_TASK", id, 
        "Subagent task deleted", "system");
      
      return true;
    }
    
    return false;
  }

  getTasksByStatus(status: SubagentTask["status"]): SubagentTask[] {
    const tasks = this.getSubagentTasks();
    return tasks.filter(t => t.status === status);
  }

  getRunningTasks(): SubagentTask[] {
    return this.getTasksByStatus("RUNNING");
  }

  getPendingTasks(): SubagentTask[] {
    return this.getTasksByStatus("PENDING");
  }

  getCompletedTasks(): SubagentTask[] {
    return this.getTasksByStatus("COMPLETED");
  }
}