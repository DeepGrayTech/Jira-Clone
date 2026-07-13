import type { TestCase } from "../types";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";

export class TestCaseService {
  constructor(
    private auditService: AuditService,
    private validationService: ValidationService
  ) {}

  createTestCase(tcData: Omit<TestCase, "id">): TestCase {
    const validation = this.validationService.validateTestCaseData(tcData);
    if (!validation.isValid) {
      throw new Error("Invalid test case data");
    }

    const newTc: TestCase = {
      ...tcData,
      id: `t-${Date.now()}`,
    };

    return newTc;
  }

  updateTestCase(tcId: string, updates: Partial<TestCase>): Partial<TestCase> {
    return updates;
  }

  generateAuditLog(action: "CREATE" | "UPDATE" | "DELETE", tc: TestCase, username?: string) {
    const details = action === "CREATE" 
      ? `Test case created: "${tc.title}"`
      : action === "UPDATE"
      ? `Test case updated: "${tc.title}"`
      : `Test case deleted: "${tc.title}"`;
    
    return this.auditService.logAction(action, "TEST_CASE", tc.id, details, username);
  }
}