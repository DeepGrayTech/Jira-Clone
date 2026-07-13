import type { Bug } from "../types";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";

export class BugService {
  constructor(
    private auditService: AuditService,
    private validationService: ValidationService
  ) {}

  createBug(bugData: Omit<Bug, "id" | "createdAt" | "updatedAt">): Bug {
    const validation = this.validationService.validateBugData(bugData);
    if (!validation.isValid) {
      throw new Error("Invalid bug data");
    }

    const newBug: Bug = {
      ...bugData,
      id: `bug-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newBug;
  }

  updateBug(bugId: string, updates: Partial<Bug>): Partial<Bug> {
    return {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  generateAuditLog(action: "CREATE" | "UPDATE" | "DELETE", bug: Bug, username?: string) {
    const details = action === "CREATE" 
      ? `Bug created: "${bug.title}"`
      : action === "UPDATE"
      ? `Bug updated: "${bug.title}"`
      : `Bug deleted: "${bug.title}"`;
    
    return this.auditService.logAction(action, "BUG", bug.id, details, username);
  }
}