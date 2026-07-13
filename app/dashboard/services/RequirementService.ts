import type { Requirement } from "../types";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";

export class RequirementService {
  constructor(
    private auditService: AuditService,
    private validationService: ValidationService
  ) {}

  createRequirement(reqData: Omit<Requirement, "id" | "createdAt" | "updatedAt">): Requirement {
    const newReq: Requirement = {
      ...reqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newReq;
  }

  updateRequirement(reqId: string, updates: Partial<Requirement>): Partial<Requirement> {
    return {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  generateAuditLog(action: "CREATE" | "UPDATE" | "DELETE", req: Requirement, username?: string) {
    const details = action === "CREATE" 
      ? `Requirement created: "${req.title}"`
      : action === "UPDATE"
      ? `Requirement updated: "${req.title}"`
      : `Requirement deleted: "${req.title}"`;
    
    return this.auditService.logAction(action, "REQUIREMENT", req.id, details, username);
  }
}