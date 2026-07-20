import { TestCaseService } from "../app/dashboard/services/TestCaseService";
import { AuditService } from "../app/dashboard/services/AuditService";
import { ValidationService } from "../app/dashboard/services/ValidationService";

jest.mock("../app/dashboard/services/AuditService");
jest.mock("../app/dashboard/services/ValidationService");

describe("TestCaseService", () => {
  let auditService: jest.Mocked<AuditService>;
  let validationService: jest.Mocked<ValidationService>;
  let service: TestCaseService;

  beforeEach(() => {
    auditService = new AuditService() as jest.Mocked<AuditService>;
    validationService = new ValidationService() as jest.Mocked<ValidationService>;
    service = new TestCaseService(auditService, validationService);
  });

  it("should create a test case", () => {
    validationService.validateTestCaseData = jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [], validCount: 1, totalCount: 1, type: "TestCase" });

    const tcData = {
      title: "Test Case",
      description: "Test description",
      status: "PENDING",
      priority: "MEDIUM",
      preconditions: ["precondition1"],
      testSteps: ["step1"],
      expectedResults: ["result1"],
      tags: ["tag1"],
    };

    const result = service.createTestCase(tcData);

    expect(result.id).toBeDefined();
    expect(result.id.startsWith("t-")).toBe(true);
    expect(result.title).toBe("Test Case");
    expect(result.status).toBe("PENDING");
  });

  it("should throw error for invalid test case data", () => {
    validationService.validateTestCaseData = jest.fn().mockReturnValue({ isValid: false, errors: [{ id: "1", type: "TestCase", field: "title", message: "Title is required", severity: "error" }], warnings: [], validCount: 0, totalCount: 1, type: "TestCase" });

    const tcData = {
      title: "",
      description: "Test",
      status: "PENDING",
      priority: "MEDIUM",
      preconditions: [],
      testSteps: [],
      expectedResults: [],
      tags: [],
    };

    expect(() => service.createTestCase(tcData)).toThrow("Invalid test case data");
  });

  it("should update a test case", () => {
    const updates = {
      title: "Updated Title",
      status: "IN_PROGRESS",
    };

    const result = service.updateTestCase("tc-1", updates);

    expect(result.title).toBe("Updated Title");
    expect(result.status).toBe("IN_PROGRESS");
  });

  it("should generate CREATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const tc = {
      id: "tc-1",
      title: "Test Case",
      description: "",
      status: "PENDING",
      priority: "MEDIUM",
      preconditions: [],
      testSteps: [],
      expectedResults: [],
      tags: [],
    };

    const result = service.generateAuditLog("CREATE", tc, "user1");

    expect(auditService.logAction).toHaveBeenCalledWith("CREATE", "TEST_CASE", "tc-1", 'Test case created: "Test Case"', "user1");
    expect(result).toBeDefined();
  });

  it("should generate UPDATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const tc = {
      id: "tc-1",
      title: "Test Case",
      description: "",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      preconditions: [],
      testSteps: [],
      expectedResults: [],
      tags: [],
    };

    const result = service.generateAuditLog("UPDATE", tc);

    expect(auditService.logAction).toHaveBeenCalledWith("UPDATE", "TEST_CASE", "tc-1", 'Test case updated: "Test Case"', undefined);
    expect(result).toBeDefined();
  });

  it("should generate DELETE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const tc = {
      id: "tc-1",
      title: "Test Case",
      description: "",
      status: "COMPLETED",
      priority: "MEDIUM",
      preconditions: [],
      testSteps: [],
      expectedResults: [],
      tags: [],
    };

    const result = service.generateAuditLog("DELETE", tc, "admin");

    expect(auditService.logAction).toHaveBeenCalledWith("DELETE", "TEST_CASE", "tc-1", 'Test case deleted: "Test Case"', "admin");
    expect(result).toBeDefined();
  });
});