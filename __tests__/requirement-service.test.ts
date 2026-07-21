import { RequirementService } from "../app/dashboard/services/RequirementService";
import { AuditService } from "../app/dashboard/services/AuditService";
import { ValidationService } from "../app/dashboard/services/ValidationService";

jest.mock("../app/dashboard/services/AuditService");
jest.mock("../app/dashboard/services/ValidationService");

describe("RequirementService", () => {
  let auditService: jest.Mocked<AuditService>;
  let validationService: jest.Mocked<ValidationService>;
  let service: RequirementService;

  beforeEach(() => {
    auditService = new AuditService() as jest.Mocked<AuditService>;
    validationService = new ValidationService() as jest.Mocked<ValidationService>;
    service = new RequirementService(auditService, validationService);
  });

  it("should create a requirement", () => {
    const reqData = {
      title: "Test Requirement",
      description: "Test description",
      status: "DRAFT" as const,
      priority: "MEDIUM" as const,
      acceptanceCriteria: ["criteria1"],
      requester: "user1",
      executor: "user2",
    };

    const result = service.createRequirement(reqData);

    expect(result.id).toBeDefined();
    expect(result.id.startsWith("req-")).toBe(true);
    expect(result.title).toBe("Test Requirement");
    expect(result.status).toBe("DRAFT");
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });

  it("should update a requirement", () => {
    const updates = {
      title: "Updated Title",
      status: "REVIEW" as const,
    };

    const result = service.updateRequirement("req-1", updates);

    expect(result.title).toBe("Updated Title");
    expect(result.status).toBe("REVIEW");
    expect(result.updatedAt).toBeDefined();
  });

  it("should generate CREATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const req = {
      id: "req-1",
      title: "Test Requirement",
      description: "",
      status: "DRAFT" as const,
      priority: "MEDIUM" as const,
      acceptanceCriteria: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requester: "user1",
      executor: "user2",
    };

    const result = service.generateAuditLog("CREATE", req, "user1");

    expect(auditService.logAction).toHaveBeenCalledWith("CREATE", "REQUIREMENT", "req-1", 'Requirement created: "Test Requirement"', "user1");
    expect(result).toBeDefined();
  });

  it("should generate UPDATE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const req = {
      id: "req-1",
      title: "Test Requirement",
      description: "",
      status: "DRAFT" as const,
      priority: "MEDIUM" as const,
      acceptanceCriteria: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requester: "user1",
      executor: "user2",
    };

    const result = service.generateAuditLog("UPDATE", req);

    expect(auditService.logAction).toHaveBeenCalledWith("UPDATE", "REQUIREMENT", "req-1", 'Requirement updated: "Test Requirement"', undefined);
    expect(result).toBeDefined();
  });

  it("should generate DELETE audit log", () => {
    auditService.logAction = jest.fn().mockReturnValue({ id: "log-1" });
    
    const req = {
      id: "req-1",
      title: "Test Requirement",
      description: "",
      status: "DRAFT" as const,
      priority: "MEDIUM" as const,
      acceptanceCriteria: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requester: "user1",
      executor: "user2",
    };

    const result = service.generateAuditLog("DELETE", req, "admin");

    expect(auditService.logAction).toHaveBeenCalledWith("DELETE", "REQUIREMENT", "req-1", 'Requirement deleted: "Test Requirement"', "admin");
    expect(result).toBeDefined();
  });
});