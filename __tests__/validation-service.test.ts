import { ValidationService } from "../app/dashboard/services/ValidationService";

describe("ValidationService", () => {
  const service = new ValidationService();

  describe("validateTaskData", () => {
    it("should validate valid task data", () => {
      const result = service.validateTaskData({
        id: "task-1",
        title: "Test Task",
        status: "TODO",
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.type).toBe("Task");
    });

    it("should return error for empty title", () => {
      const result = service.validateTaskData({
        id: "task-1",
        title: "",
        status: "TODO",
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].field).toBe("title");
    });

    it("should return error for invalid status", () => {
      const result = service.validateTaskData({
        id: "task-1",
        title: "Test Task",
        status: "INVALID_STATUS" as any,
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].field).toBe("status");
    });

    it("should return error for invalid priority", () => {
      const result = service.validateTaskData({
        id: "task-1",
        title: "Test Task",
        status: "TODO",
        priority: "INVALID_PRIORITY" as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].field).toBe("priority");
    });

    it("should return multiple errors for multiple invalid fields", () => {
      const result = service.validateTaskData({
        id: "task-1",
        title: "",
        status: "INVALID" as any,
        priority: "INVALID" as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });

  describe("validateRequirementData", () => {
    it("should validate valid requirement data", () => {
      const result = service.validateRequirementData({
        id: "req-1",
        title: "Test Requirement",
        status: "DRAFT",
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.type).toBe("Requirement");
    });

    it("should return error for empty title", () => {
      const result = service.validateRequirementData({
        id: "req-1",
        title: "",
        status: "DRAFT",
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
    });

    it("should return error for invalid status", () => {
      const result = service.validateRequirementData({
        id: "req-1",
        title: "Test",
        status: "INVALID" as any,
        priority: "MEDIUM",
      });

      expect(result.isValid).toBe(false);
    });

    it("should return error for invalid priority", () => {
      const result = service.validateRequirementData({
        id: "req-1",
        title: "Test",
        status: "DRAFT",
        priority: "INVALID" as any,
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe("validateTestCaseData", () => {
    it("should validate valid test case data", () => {
      const result = service.validateTestCaseData({
        id: "tc-1",
        title: "Test Case",
        status: "PENDING",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.type).toBe("TestCase");
    });

    it("should return error for empty title", () => {
      const result = service.validateTestCaseData({
        id: "tc-1",
        title: "",
        status: "PENDING",
      });

      expect(result.isValid).toBe(false);
    });

    it("should return error for invalid status", () => {
      const result = service.validateTestCaseData({
        id: "tc-1",
        title: "Test",
        status: "INVALID" as any,
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe("validateBugData", () => {
    it("should validate valid bug data", () => {
      const result = service.validateBugData({
        id: "bug-1",
        title: "Test Bug",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.type).toBe("Bug");
    });

    it("should return error for empty title", () => {
      const result = service.validateBugData({
        id: "bug-1",
        title: "",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("validateGoalData", () => {
    it("should validate valid goal data", () => {
      const result = service.validateGoalData({
        id: "goal-1",
        title: "Test Goal",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.type).toBe("Goal");
    });

    it("should return error for empty title", () => {
      const result = service.validateGoalData({
        id: "goal-1",
        title: "",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });

      expect(result.isValid).toBe(false);
    });

    it("should return error for missing dates", () => {
      const result = service.validateGoalData({
        id: "goal-1",
        title: "Test Goal",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].field).toBe("dates");
    });

    it("should return error for missing start date", () => {
      const result = service.validateGoalData({
        id: "goal-1",
        title: "Test Goal",
        endDate: "2024-12-31",
      });

      expect(result.isValid).toBe(false);
    });

    it("should return error for missing end date", () => {
      const result = service.validateGoalData({
        id: "goal-1",
        title: "Test Goal",
        startDate: "2024-01-01",
      });

      expect(result.isValid).toBe(false);
    });
  });
});