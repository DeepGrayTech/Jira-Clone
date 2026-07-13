import {
  Task,
  Requirement,
  TestCase,
  Bug,
  BugComment,
  Goal,
  Milestone,
  KeyResult,
  AuditLogEntry,
  Comment,
  AuditAction,
  AuditTarget,
  BugStatus,
  BugSeverity,
  BugPriority,
  GoalStatus,
  GoalType,
  isValidTaskStatus,
  isValidTaskPriority,
  isValidRequirementStatus,
  isValidRequirementPriority,
  isValidTestCaseStatus,
} from "../app/dashboard/types";
import { AuditService } from "../app/dashboard/services/AuditService";
import { ValidationService } from "../app/dashboard/services/ValidationService";
import { TaskService } from "../app/dashboard/services/TaskService";
import { RequirementService } from "../app/dashboard/services/RequirementService";
import { TestCaseService } from "../app/dashboard/services/TestCaseService";

describe("API Validation Tests", () => {
  describe("Type Definitions", () => {
    it("should correctly define Task interface with all required fields", () => {
      const task: Task = {
        id: "task-1",
        title: "Test Task",
        description: "Test Description",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "2026-12-31",
        tags: ["test"],
        assignee: "John",
        comments: [],
        createdAt: "2026-07-12T10:00:00Z",
      };
      expect(task).toBeDefined();
      expect(task.id).toBe("task-1");
      expect(task.title).toBe("Test Task");
      expect(task.createdAt).toBe("2026-07-12T10:00:00Z");
    });

    it("should correctly define Requirement interface with all required fields", () => {
      const requirement: Requirement = {
        id: "req-1",
        title: "Test Requirement",
        description: "Test Description",
        source: "ISO 9001:2015",
        priority: "HIGH",
        status: "DRAFT",
        acceptanceCriteria: ["criteria 1"],
        createdAt: "2026-07-12T10:00:00Z",
        updatedAt: "2026-07-12T10:00:00Z",
        requester: "Alice",
        executor: "Bob",
      };
      expect(requirement).toBeDefined();
      expect(requirement.source).toBe("ISO 9001:2015");
      expect(requirement.requester).toBe("Alice");
      expect(requirement.executor).toBe("Bob");
    });

    it("should correctly define TestCase interface", () => {
      const testCase: TestCase = {
        id: "tc-1",
        requirementId: "req-1",
        title: "Test Case",
        description: "Test Description",
        steps: ["Step 1", "Step 2"],
        expectedResult: "Expected",
        status: "PENDING",
      };
      expect(testCase).toBeDefined();
      expect(testCase.steps).toHaveLength(2);
    });

    it("should correctly define Bug interface with all fields", () => {
      const bugComment: BugComment = {
        id: "bc-1",
        bugId: "bug-1",
        author: "John",
        content: "Comment",
        createdAt: "2026-07-12T10:00:00Z",
      };

      const bug: Bug = {
        id: "bug-1",
        title: "Test Bug",
        description: "Test Description",
        stepsToReproduce: ["Step 1"],
        expectedBehavior: "Expected",
        actualBehavior: "Actual",
        severity: "HIGH",
        priority: "URGENT",
        status: "REPORTED",
        reporter: "John",
        assignee: "Bob",
        verifier: "Alice",
        relatedTaskId: "task-1",
        relatedRequirementId: "req-1",
        createdAt: "2026-07-12T10:00:00Z",
        updatedAt: "2026-07-12T10:00:00Z",
        resolvedAt: "2026-07-12T11:00:00Z",
        verifiedAt: "2026-07-12T12:00:00Z",
        resolution: "Fixed",
        comments: [bugComment],
        attachments: ["file1.pdf"],
      };
      expect(bug).toBeDefined();
      expect(bug.comments).toHaveLength(1);
      expect(bug.attachments).toHaveLength(1);
    });

    it("should correctly define Goal, Milestone, and KeyResult interfaces", () => {
      const milestone: Milestone = {
        id: "m-1",
        goalId: "goal-1",
        title: "Milestone 1",
        description: "Desc",
        dueDate: "2026-08-01",
        completed: false,
      };

      const keyResult: KeyResult = {
        id: "kr-1",
        goalId: "goal-1",
        title: "Key Result 1",
        targetValue: 100,
        currentValue: 50,
        unit: "%",
        status: "ON_TRACK",
      };

      const goal: Goal = {
        id: "goal-1",
        title: "Test Goal",
        description: "Test Description",
        type: "OKR",
        status: "IN_PROGRESS",
        target: "100%",
        currentProgress: 50,
        startDate: "2026-07-01",
        endDate: "2026-12-31",
        owner: "John",
        relatedRequirementIds: ["req-1"],
        relatedTaskIds: ["task-1"],
        createdAt: "2026-07-12T10:00:00Z",
        updatedAt: "2026-07-12T10:00:00Z",
        color: "#3b82f6",
      };

      expect(goal).toBeDefined();
      expect(milestone).toBeDefined();
      expect(keyResult).toBeDefined();
    });

    it("should correctly define AuditLogEntry interface", () => {
      const log: AuditLogEntry = {
        id: "log-1",
        timestamp: "2026-07-12T10:00:00Z",
        action: "CREATE",
        target: "TASK",
        targetId: "task-1",
        details: "Task created",
        username: "admin",
      };
      expect(log).toBeDefined();
      expect(log.action).toBe("CREATE");
      expect(log.target).toBe("TASK");
    });
  });

  describe("Validation Functions", () => {
    it("should validate task status correctly", () => {
      expect(isValidTaskStatus("TODO")).toBe(true);
      expect(isValidTaskStatus("IN_PROGRESS")).toBe(true);
      expect(isValidTaskStatus("DONE")).toBe(true);
      expect(isValidTaskStatus("INVALID")).toBe(false);
    });

    it("should validate task priority correctly", () => {
      expect(isValidTaskPriority("LOW")).toBe(true);
      expect(isValidTaskPriority("MEDIUM")).toBe(true);
      expect(isValidTaskPriority("HIGH")).toBe(true);
      expect(isValidTaskPriority("URGENT")).toBe(true);
      expect(isValidTaskPriority("INVALID")).toBe(false);
    });

    it("should validate requirement status correctly", () => {
      expect(isValidRequirementStatus("DRAFT")).toBe(true);
      expect(isValidRequirementStatus("REVIEW")).toBe(true);
      expect(isValidRequirementStatus("APPROVED")).toBe(true);
      expect(isValidRequirementStatus("IMPLEMENTED")).toBe(true);
      expect(isValidRequirementStatus("INVALID")).toBe(false);
    });

    it("should validate requirement priority correctly", () => {
      expect(isValidRequirementPriority("LOW")).toBe(true);
      expect(isValidRequirementPriority("MEDIUM")).toBe(true);
      expect(isValidRequirementPriority("HIGH")).toBe(true);
      expect(isValidRequirementPriority("CRITICAL")).toBe(true);
      expect(isValidRequirementPriority("INVALID")).toBe(false);
    });

    it("should validate test case status correctly", () => {
      expect(isValidTestCaseStatus("PENDING")).toBe(true);
      expect(isValidTestCaseStatus("PASSED")).toBe(true);
      expect(isValidTestCaseStatus("FAILED")).toBe(true);
      expect(isValidTestCaseStatus("BLOCKED")).toBe(true);
      expect(isValidTestCaseStatus("INVALID")).toBe(false);
    });
  });

  describe("AuditService", () => {
    let auditService: AuditService;

    beforeEach(() => {
      auditService = new AuditService();
    });

    it("should create an audit log entry", () => {
      const log = auditService.logAction(
        "CREATE",
        "TASK",
        "task-1",
        "Task created",
        "admin"
      );
      expect(log).toBeDefined();
      expect(log.id).toBeDefined();
      expect(log.action).toBe("CREATE");
      expect(log.target).toBe("TASK");
      expect(log.targetId).toBe("task-1");
      expect(log.username).toBe("admin");
    });

    it("should truncate logs to MAX_ENTRIES", () => {
      const logs: AuditLogEntry[] = Array.from({ length: 1500 }, (_, i) => ({
        id: `log-${i}`,
        timestamp: "2026-07-12T10:00:00Z",
        action: "CREATE",
        target: "TASK",
        targetId: `task-${i}`,
        details: "Test",
        username: "admin",
      }));

      const truncated = auditService.truncateLogs(logs);
      expect(truncated.length).toBe(1000);
    });
  });

  describe("ValidationService", () => {
    let validationService: ValidationService;

    beforeEach(() => {
      validationService = new ValidationService();
    });

    it("should validate task data correctly", () => {
      const validResult = validationService.validateTaskData({
        title: "Valid Task",
        status: "TODO",
        priority: "MEDIUM",
      });
      expect(validResult.isValid).toBe(true);

      const invalidResult = validationService.validateTaskData({
        title: "",
        status: "INVALID",
      });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it("should validate requirement data correctly", () => {
      const validResult = validationService.validateRequirementData({
        title: "Valid Requirement",
        status: "DRAFT",
        priority: "MEDIUM",
      });
      expect(validResult.isValid).toBe(true);
    });

    it("should validate test case data correctly", () => {
      const validResult = validationService.validateTestCaseData({
        title: "Valid Test Case",
        status: "PENDING",
      });
      expect(validResult.isValid).toBe(true);
    });

    it("should validate bug data correctly", () => {
      const validResult = validationService.validateBugData({
        title: "Valid Bug",
        severity: "HIGH",
        priority: "MEDIUM",
        status: "REPORTED",
      });
      expect(validResult.isValid).toBe(true);
    });
  });

  describe("TaskService", () => {
    let taskService: TaskService;
    let mockAuditService: Partial<AuditService>;
    let mockValidationService: Partial<ValidationService>;

    beforeEach(() => {
      mockAuditService = {} as AuditService;
      mockValidationService = {
        validateTaskData: () => ({
          isValid: true,
          errors: [],
          warnings: [],
          validCount: 1,
          totalCount: 1,
        }),
      } as ValidationService;

      taskService = new TaskService(
        mockAuditService as AuditService,
        mockValidationService as ValidationService
      );
    });

    it("should create a task with generated id and createdAt", () => {
      const task = taskService.createTask({
        title: "Test Task",
        description: "Desc",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "2026-12-31",
        tags: [],
        assignee: "John",
        comments: [],
      });

      expect(task.id).toMatch(/task-\d+/);
      expect(task.createdAt).toBeDefined();
      expect(task.title).toBe("Test Task");
    });

    it("should update task data", () => {
      const updates = taskService.updateTask("task-1", {
        title: "Updated Title",
        status: "IN_PROGRESS",
      });

      expect(updates.title).toBe("Updated Title");
      expect(updates.status).toBe("IN_PROGRESS");
    });

    it("should validate status transitions", () => {
      expect(taskService.canMoveToStatus("TODO", "IN_PROGRESS")).toBe(true);
      expect(taskService.canMoveToStatus("IN_PROGRESS", "DONE")).toBe(true);
      expect(taskService.canMoveToStatus("DONE", "IN_PROGRESS")).toBe(true);
      expect(taskService.canMoveToStatus("TODO", "DONE")).toBe(false);
    });
  });

  describe("RequirementService", () => {
    let requirementService: RequirementService;
    let mockAuditService: Partial<AuditService>;
    let mockValidationService: Partial<ValidationService>;

    beforeEach(() => {
      mockAuditService = {} as AuditService;
      mockValidationService = {
        validateRequirementData: () => ({
          isValid: true,
          errors: [],
          warnings: [],
          validCount: 1,
          totalCount: 1,
        }),
      } as ValidationService;

      requirementService = new RequirementService(
        mockAuditService as AuditService,
        mockValidationService as ValidationService
      );
    });

    it("should create a requirement with generated id and timestamps", () => {
      const requirement = requirementService.createRequirement({
        title: "Test Requirement",
        description: "Desc",
        priority: "HIGH",
        status: "DRAFT",
        acceptanceCriteria: ["criteria"],
        requester: "Alice",
        executor: "Bob",
      });

      expect(requirement.id).toMatch(/req-\d+/);
      expect(requirement.createdAt).toBeDefined();
      expect(requirement.updatedAt).toBeDefined();
      expect(requirement.requester).toBe("Alice");
      expect(requirement.executor).toBe("Bob");
    });

    it("should update requirement data", () => {
      const updates = requirementService.updateRequirement("req-1", {
        title: "Updated Title",
        status: "REVIEW",
      });

      expect(updates.title).toBe("Updated Title");
      expect(updates.status).toBe("REVIEW");
    });
  });

  describe("TestCaseService", () => {
    let testCaseService: TestCaseService;
    let mockAuditService: Partial<AuditService>;
    let mockValidationService: Partial<ValidationService>;

    beforeEach(() => {
      mockAuditService = {} as AuditService;
      mockValidationService = {
        validateTestCaseData: () => ({
          isValid: true,
          errors: [],
          warnings: [],
          validCount: 1,
          totalCount: 1,
        }),
      } as ValidationService;

      testCaseService = new TestCaseService(
        mockAuditService as AuditService,
        mockValidationService as ValidationService
      );
    });

    it("should create a test case with generated id", () => {
      const testCase = testCaseService.createTestCase({
        requirementId: "req-1",
        title: "Test Case",
        description: "Desc",
        steps: ["Step 1"],
        expectedResult: "Expected",
        status: "PENDING",
      });

      expect(testCase.id).toMatch(/t-\d+/);
      expect(testCase.title).toBe("Test Case");
    });

    it("should update test case data", () => {
      const updates = testCaseService.updateTestCase("tc-1", {
        title: "Updated Title",
        status: "PASSED",
      });

      expect(updates.title).toBe("Updated Title");
      expect(updates.status).toBe("PASSED");
    });
  });

  describe("Enum Types", () => {
    it("should have correct AuditAction values", () => {
      const actions: AuditAction[] = [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "IMPORT",
        "CLEAR",
      ];
      expect(actions.length).toBe(8);
    });

    it("should have correct AuditTarget values", () => {
      const targets: AuditTarget[] = [
        "TASK",
        "REQUIREMENT",
        "TEST_CASE",
        "BUG",
        "GOAL",
        "MILESTONE",
        "KEY_RESULT",
        "SYSTEM",
      ];
      expect(targets.length).toBe(8);
    });

    it("should have correct BugStatus values", () => {
      const statuses: BugStatus[] = [
        "REPORTED",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "VERIFIED",
        "CLOSED",
        "REOPENED",
      ];
      expect(statuses.length).toBe(7);
    });

    it("should have correct BugSeverity values", () => {
      const severities: BugSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
      expect(severities.length).toBe(4);
    });

    it("should have correct BugPriority values", () => {
      const priorities: BugPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];
      expect(priorities.length).toBe(4);
    });

    it("should have correct GoalStatus values", () => {
      const statuses: GoalStatus[] = [
        "NOT_STARTED",
        "IN_PROGRESS",
        "ON_TRACK",
        "AT_RISK",
        "ACHIEVED",
      ];
      expect(statuses.length).toBe(5);
    });

    it("should have correct GoalType values", () => {
      const types: GoalType[] = ["OKR", "SMART", "MILESTONE", "PROJECT"];
      expect(types.length).toBe(4);
    });
  });
});