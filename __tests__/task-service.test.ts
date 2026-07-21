import { TaskService } from "../app/dashboard/services/TaskService";
import { AuditService } from "../app/dashboard/services/AuditService";
import { ValidationService } from "../app/dashboard/services/ValidationService";
import type { Task } from "../app/dashboard/types";

jest.mock("../app/dashboard/services/AuditService");
jest.mock("../app/dashboard/services/ValidationService");

describe("TaskService", () => {
  let auditService: jest.Mocked<AuditService>;
  let validationService: jest.Mocked<ValidationService>;
  let service: TaskService;

  beforeEach(() => {
    auditService = new AuditService() as jest.Mocked<AuditService>;
    validationService = new ValidationService() as jest.Mocked<ValidationService>;
    service = new TaskService(auditService, validationService);
  });

  it("should create a task", () => {
    validationService.validateTaskData = jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [], validCount: 1, totalCount: 1, type: "Task" });

    const taskData: Omit<Task, "id" | "createdAt"> = {
      title: "Test Task",
      description: "Test description",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: ["tag1"],
      assignee: "user1",
      comments: [],
    };

    const result = service.createTask(taskData);

    expect(result.id).toBeDefined();
    expect(result.id.startsWith("task-")).toBe(true);
    expect(result.title).toBe("Test Task");
    expect(result.status).toBe("TODO");
    expect(result.createdAt).toBeDefined();
  });

  it("should throw error for invalid task data", () => {
    validationService.validateTaskData = jest.fn().mockReturnValue({ isValid: false, errors: [{ id: "1", type: "Task", field: "title", message: "Title is required", severity: "error" }], warnings: [], validCount: 0, totalCount: 1, type: "Task" });

    const taskData: Omit<Task, "id" | "createdAt"> = {
      title: "",
      description: "Test",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
      assignee: "",
      comments: [],
    };

    expect(() => service.createTask(taskData)).toThrow("Invalid task data");
  });

  it("should update a task", () => {
    validationService.validateTaskData = jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [], validCount: 1, totalCount: 1, type: "Task" });

    const updates: Partial<Task> = {
      title: "Updated Title",
      status: "IN_PROGRESS",
    };

    const result = service.updateTask("task-1", updates);

    expect(result.title).toBe("Updated Title");
    expect(result.status).toBe("IN_PROGRESS");
  });

  it("should throw error for invalid update data", () => {
    validationService.validateTaskData = jest.fn().mockReturnValue({ isValid: false, errors: [{ id: "1", type: "Task", field: "status", message: "Invalid status", severity: "error" }], warnings: [], validCount: 0, totalCount: 1, type: "Task" });

    const updates = {
      status: "INVALID",
    } as unknown as Partial<Task>;

    expect(() => service.updateTask("task-1", updates)).toThrow("Invalid task update data");
  });

  describe("canMoveToStatus", () => {
    it("should allow moving from TODO to IN_PROGRESS", () => {
      expect(service.canMoveToStatus("TODO", "IN_PROGRESS")).toBe(true);
    });

    it("should not allow moving from TODO to DONE", () => {
      expect(service.canMoveToStatus("TODO", "DONE")).toBe(false);
    });

    it("should allow moving from IN_PROGRESS to TODO", () => {
      expect(service.canMoveToStatus("IN_PROGRESS", "TODO")).toBe(true);
    });

    it("should allow moving from IN_PROGRESS to DONE", () => {
      expect(service.canMoveToStatus("IN_PROGRESS", "DONE")).toBe(true);
    });

    it("should allow moving from DONE to IN_PROGRESS", () => {
      expect(service.canMoveToStatus("DONE", "IN_PROGRESS")).toBe(true);
    });

    it("should not allow moving from DONE to TODO", () => {
      expect(service.canMoveToStatus("DONE", "TODO")).toBe(false);
    });
  });

  it("should generate CREATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const task: Task = {
      id: "task-1",
      title: "Test Task",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: [],
      assignee: "user1",
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const result = service.generateAuditLog("CREATE", task, "user1");

    expect(auditService.logAction).toHaveBeenCalledWith("CREATE", "TASK", "task-1", 'Task created: "Test Task"', "user1");
    expect(result).toBeDefined();
  });

  it("should generate UPDATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const task: Task = {
      id: "task-1",
      title: "Test Task",
      description: "",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: [],
      assignee: "user1",
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const result = service.generateAuditLog("UPDATE", task);

    expect(auditService.logAction).toHaveBeenCalledWith("UPDATE", "TASK", "task-1", 'Task updated: "Test Task"', undefined);
    expect(result).toBeDefined();
  });

  it("should generate DELETE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const task: Task = {
      id: "task-1",
      title: "Test Task",
      description: "",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: [],
      assignee: "admin",
      comments: [],
      createdAt: new Date().toISOString(),
    };

    const result = service.generateAuditLog("DELETE", task, "admin");

    expect(auditService.logAction).toHaveBeenCalledWith("DELETE", "TASK", "task-1", 'Task deleted: "Test Task"', "admin");
    expect(result).toBeDefined();
  });
});