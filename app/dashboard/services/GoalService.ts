import type { Goal, Milestone, KeyResult } from "../types";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";

export class GoalService {
  constructor(
    private auditService: AuditService,
    private validationService: ValidationService
  ) {}

  createGoal(goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
    const validation = this.validationService.validateGoalData(goalData);
    if (!validation.isValid) {
      throw new Error("Invalid goal data");
    }

    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newGoal;
  }

  updateGoal(goalId: string, updates: Partial<Goal>): Partial<Goal> {
    const validation = this.validationService.validateGoalData(updates);
    if (!validation.isValid) {
      throw new Error("Invalid goal update data");
    }

    return {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  generateAuditLog(action: "CREATE" | "UPDATE" | "DELETE", goal: Goal, username?: string) {
    const details = action === "CREATE" 
      ? `Goal created: "${goal.title}"`
      : action === "UPDATE"
      ? `Goal updated: "${goal.title}"`
      : `Goal deleted: "${goal.title}"`;
    
    return this.auditService.logAction(action, "GOAL", goal.id, details, username);
  }
}