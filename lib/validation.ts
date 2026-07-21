/**
 * Data Integrity Validation Module
 *
 * Implements ISO/IEC 25010 data integrity checks for all data types
 * in the Jira Clone application. Validates structure, types, enum values,
 * and data consistency across all entity types.
 */

import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  Goal,
  Milestone,
  KeyResult,
} from "@/app/dashboard/types";
import type {
  ValidationError,
  ValidationResult,
} from "@/app/dashboard/types";

// ─── ISO 8601 Timestamp Validation ───────────────────────────────────────────

/**
 * Validates that a string conforms to ISO 8601 format.
 * Accepts both full datetime (2026-06-22T10:00:00Z) and date-only (2026-06-01) formats.
 */
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2}))?$/;

function isValidTimestamp(value: string): boolean {
  // Treat an empty string as "no date set", which is allowed for optional date fields.
  if (value === "") return true;
  return ISO_8601_REGEX.test(value);
}

// ─── Enum Value Validators (local, for types not in types.ts) ────────────────

const VALID_BUG_STATUSES = [
  "REPORTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
  "CLOSED",
  "REOPENED",
] as const;

const VALID_BUG_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const VALID_BUG_PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;

const VALID_GOAL_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_TRACK",
  "AT_RISK",
  "ACHIEVED",
] as const;

const VALID_GOAL_TYPES = ["OKR", "SMART", "MILESTONE", "PROJECT"] as const;

const VALID_KEY_RESULT_STATUSES = ["ON_TRACK", "AT_RISK", "BEHIND"] as const;

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Checks if a value is a non-empty string.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Checks if a value is a string array.
 */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * Checks if a value is a non-empty string array.
 */
function isNonEmptyStringArray(value: unknown): value is string[] {
  return isStringArray(value) && value.length > 0;
}

/**
 * Records a validation error.
 */
function addError(
  errors: ValidationError[],
  id: string,
  type: string,
  field: string,
  message: string,
  severity: "error" | "warning" = "error"
): void {
  errors.push({ id, type, field, message, severity });
}

// ─── Per-Type Validation Rules ────────────────────────────────────────────────

/**
 * Validates a single Task object.
 */
function validateTask(
  task: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const t = task as Record<string, unknown>;
  const id = typeof t?.id === "string" ? t.id : `task-index-${index}`;
  const typeName = "Task";

  // Required fields
  if (!isNonEmptyString(t?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(t.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${t.id}"`);
  } else {
    seenIds.add(t.id as string);
  }

  if (!isNonEmptyString(t?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  // Status validation
  if (t?.status !== undefined && !["TODO", "IN_PROGRESS", "DONE"].includes(t.status as string)) {
    addError(errors, id, typeName, "status", `Invalid status: "${t.status}"`);
  }

  // Priority validation
  if (t?.priority !== undefined && !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(t.priority as string)) {
    addError(errors, id, typeName, "priority", `Invalid priority: "${t.priority}"`);
  }

  // Timestamp validation
  if (t?.dueDate !== undefined && typeof t.dueDate === "string" && !isValidTimestamp(t.dueDate)) {
    addError(errors, id, typeName, "dueDate", `Invalid ISO 8601 date: "${t.dueDate}"`);
  }
  if (t?.createdAt !== undefined && typeof t.createdAt === "string" && !isValidTimestamp(t.createdAt)) {
    addError(errors, id, typeName, "createdAt", `Invalid ISO 8601 date: "${t.createdAt}"`);
  }

  // Tags validation
  if (t?.tags !== undefined && !isStringArray(t.tags)) {
    addError(errors, id, typeName, "tags", "tags must be an array of strings");
  }

  // Comments validation
  if (t?.comments !== undefined && !Array.isArray(t.comments)) {
    addError(errors, id, typeName, "comments", "comments must be an array");
  }

  return errors;
}

/**
 * Validates a single Requirement object.
 */
function validateRequirement(
  req: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const r = req as Record<string, unknown>;
  const id = typeof r?.id === "string" ? r.id : `requirement-index-${index}`;
  const typeName = "Requirement";

  if (!isNonEmptyString(r?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(r.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${r.id}"`);
  } else {
    seenIds.add(r.id as string);
  }

  if (!isNonEmptyString(r?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  if (r?.status !== undefined && !["DRAFT", "REVIEW", "APPROVED", "IMPLEMENTED"].includes(r.status as string)) {
    addError(errors, id, typeName, "status", `Invalid status: "${r.status}"`);
  }

  if (r?.priority !== undefined && !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(r.priority as string)) {
    addError(errors, id, typeName, "priority", `Invalid priority: "${r.priority}"`);
  }

  if (r?.createdAt !== undefined && typeof r.createdAt === "string" && !isValidTimestamp(r.createdAt)) {
    addError(errors, id, typeName, "createdAt", `Invalid ISO 8601 date: "${r.createdAt}"`);
  }

  if (r?.updatedAt !== undefined && typeof r.updatedAt === "string" && !isValidTimestamp(r.updatedAt)) {
    addError(errors, id, typeName, "updatedAt", `Invalid ISO 8601 date: "${r.updatedAt}"`);
  }

  if (r?.acceptanceCriteria !== undefined && !isStringArray(r.acceptanceCriteria)) {
    addError(errors, id, typeName, "acceptanceCriteria", "acceptanceCriteria must be an array of strings");
  }

  return errors;
}

/**
 * Validates a single TestCase object.
 */
function validateTestCase(
  tc: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const t = tc as Record<string, unknown>;
  const id = typeof t?.id === "string" ? t.id : `testcase-index-${index}`;
  const typeName = "TestCase";

  if (!isNonEmptyString(t?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(t.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${t.id}"`);
  } else {
    seenIds.add(t.id as string);
  }

  if (!isNonEmptyString(t?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  if (t?.status !== undefined && !["PENDING", "PASSED", "FAILED", "BLOCKED"].includes(t.status as string)) {
    addError(errors, id, typeName, "status", `Invalid status: "${t.status}"`);
  }

  if (t?.steps !== undefined && !isStringArray(t.steps)) {
    addError(errors, id, typeName, "steps", "steps must be an array of strings");
  }

  if (t?.executedAt !== undefined && typeof t.executedAt === "string" && !isValidTimestamp(t.executedAt)) {
    addError(errors, id, typeName, "executedAt", `Invalid ISO 8601 date: "${t.executedAt}"`);
  }

  return errors;
}

/**
 * Validates a single Bug object.
 */
function validateBug(
  bug: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const b = bug as Record<string, unknown>;
  const id = typeof b?.id === "string" ? b.id : `bug-index-${index}`;
  const typeName = "Bug";

  if (!isNonEmptyString(b?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(b.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${b.id}"`);
  } else {
    seenIds.add(b.id as string);
  }

  if (!isNonEmptyString(b?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  const bugStatus = String(b?.status ?? "");
  if (b?.status !== undefined && !(VALID_BUG_STATUSES as readonly string[]).includes(bugStatus)) {
    addError(errors, id, typeName, "status", `Invalid status: "${bugStatus}"`);
  }

  const bugSeverity = String(b?.severity ?? "");
  if (b?.severity !== undefined && !(VALID_BUG_SEVERITIES as readonly string[]).includes(bugSeverity)) {
    addError(errors, id, typeName, "severity", `Invalid severity: "${bugSeverity}"`);
  }

  const bugPriority = String(b?.priority ?? "");
  if (b?.priority !== undefined && !(VALID_BUG_PRIORITIES as readonly string[]).includes(bugPriority)) {
    addError(errors, id, typeName, "priority", `Invalid priority: "${bugPriority}"`);
  }

  if (b?.stepsToReproduce !== undefined && !isStringArray(b.stepsToReproduce)) {
    addError(errors, id, typeName, "stepsToReproduce", "stepsToReproduce must be an array of strings");
  }

  if (b?.createdAt !== undefined && typeof b.createdAt === "string" && !isValidTimestamp(b.createdAt)) {
    addError(errors, id, typeName, "createdAt", `Invalid ISO 8601 date: "${b.createdAt}"`);
  }

  if (b?.updatedAt !== undefined && typeof b.updatedAt === "string" && !isValidTimestamp(b.updatedAt)) {
    addError(errors, id, typeName, "updatedAt", `Invalid ISO 8601 date: "${b.updatedAt}"`);
  }

  return errors;
}

/**
 * Validates a single Goal object.
 */
function validateGoal(
  goal: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const g = goal as Record<string, unknown>;
  const id = typeof g?.id === "string" ? g.id : `goal-index-${index}`;
  const typeName = "Goal";

  if (!isNonEmptyString(g?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(g.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${g.id}"`);
  } else {
    seenIds.add(g.id as string);
  }

  if (!isNonEmptyString(g?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  const goalStatus = String(g?.status ?? "");
  if (g?.status !== undefined && !(VALID_GOAL_STATUSES as readonly string[]).includes(goalStatus)) {
    addError(errors, id, typeName, "status", `Invalid status: "${goalStatus}"`);
  }

  const goalType = String(g?.type ?? "");
  if (g?.type !== undefined && !(VALID_GOAL_TYPES as readonly string[]).includes(goalType)) {
    addError(errors, id, typeName, "type", `Invalid type: "${goalType}"`);
  }

  if (g?.startDate !== undefined && typeof g.startDate === "string" && !isValidTimestamp(g.startDate)) {
    addError(errors, id, typeName, "startDate", `Invalid ISO 8601 date: "${g.startDate}"`);
  }

  if (g?.endDate !== undefined && typeof g.endDate === "string" && !isValidTimestamp(g.endDate)) {
    addError(errors, id, typeName, "endDate", `Invalid ISO 8601 date: "${g.endDate}"`);
  }

  if (g?.createdAt !== undefined && typeof g.createdAt === "string" && !isValidTimestamp(g.createdAt)) {
    addError(errors, id, typeName, "createdAt", `Invalid ISO 8601 date: "${g.createdAt}"`);
  }

  if (g?.updatedAt !== undefined && typeof g.updatedAt === "string" && !isValidTimestamp(g.updatedAt)) {
    addError(errors, id, typeName, "updatedAt", `Invalid ISO 8601 date: "${g.updatedAt}"`);
  }

  if (g?.relatedRequirementIds !== undefined && !isStringArray(g.relatedRequirementIds)) {
    addError(errors, id, typeName, "relatedRequirementIds", "relatedRequirementIds must be an array of strings");
  }

  if (g?.relatedTaskIds !== undefined && !isStringArray(g.relatedTaskIds)) {
    addError(errors, id, typeName, "relatedTaskIds", "relatedTaskIds must be an array of strings");
  }

  return errors;
}

/**
 * Validates a single Milestone object.
 */
function validateMilestone(
  milestone: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const m = milestone as Record<string, unknown>;
  const id = typeof m?.id === "string" ? m.id : `milestone-index-${index}`;
  const typeName = "Milestone";

  if (!isNonEmptyString(m?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(m.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${m.id}"`);
  } else {
    seenIds.add(m.id as string);
  }

  if (!isNonEmptyString(m?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  if (!isNonEmptyString(m?.goalId)) {
    addError(errors, id, typeName, "goalId", "goalId is required and must be a non-empty string");
  }

  if (m?.dueDate !== undefined && typeof m.dueDate === "string" && !isValidTimestamp(m.dueDate)) {
    addError(errors, id, typeName, "dueDate", `Invalid ISO 8601 date: "${m.dueDate}"`);
  }

  if (m?.completedAt !== undefined && typeof m.completedAt === "string" && !isValidTimestamp(m.completedAt)) {
    addError(errors, id, typeName, "completedAt", `Invalid ISO 8601 date: "${m.completedAt}"`);
  }

  return errors;
}

/**
 * Validates a single KeyResult object.
 */
function validateKeyResult(
  kr: unknown,
  index: number,
  seenIds: Set<string>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const k = kr as Record<string, unknown>;
  const id = typeof k?.id === "string" ? k.id : `keyresult-index-${index}`;
  const typeName = "KeyResult";

  if (!isNonEmptyString(k?.id)) {
    addError(errors, id, typeName, "id", "id is required and must be a non-empty string");
  } else if (seenIds.has(k.id as string)) {
    addError(errors, id, typeName, "id", `Duplicate id: "${k.id}"`);
  } else {
    seenIds.add(k.id as string);
  }

  if (!isNonEmptyString(k?.title)) {
    addError(errors, id, typeName, "title", "title is required and must be a non-empty string");
  }

  if (!isNonEmptyString(k?.goalId)) {
    addError(errors, id, typeName, "goalId", "goalId is required and must be a non-empty string");
  }

  const krStatus = String(k?.status ?? "");
  if (k?.status !== undefined && !(VALID_KEY_RESULT_STATUSES as readonly string[]).includes(krStatus)) {
    addError(errors, id, typeName, "status", `Invalid status: "${krStatus}"`);
  }

  if (typeof k?.targetValue !== "number") {
    addError(errors, id, typeName, "targetValue", "targetValue must be a number");
  }

  if (typeof k?.currentValue !== "number") {
    addError(errors, id, typeName, "currentValue", "currentValue must be a number");
  }

  return errors;
}

// ─── Data Type Mapping ────────────────────────────────────────────────────────

type DataTypeName =
  | "Task"
  | "Requirement"
  | "TestCase"
  | "Bug"
  | "Goal"
  | "Milestone"
  | "KeyResult";

const VALIDATORS: Record<
  DataTypeName,
  (item: unknown, index: number, seenIds: Set<string>) => ValidationError[]
> = {
  Task: validateTask,
  Requirement: validateRequirement,
  TestCase: validateTestCase,
  Bug: validateBug,
  Goal: validateGoal,
  Milestone: validateMilestone,
  KeyResult: validateKeyResult,
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates an array of data objects against type-specific integrity rules.
 *
 * Checks include:
 * - Required field non-empty checks (id, title, etc.)
 * - Field type validation (string, array, enum values)
 * - ID uniqueness within the collection
 * - Enum value legality validation
 * - ISO 8601 timestamp format validation
 *
 * @param data - Array of data objects to validate
 * @param type - The data type name (e.g., "Task", "Bug", "Goal")
 * @returns A ValidationResult containing all errors, warnings, and counts
 */
export function validateDataIntegrity<T,>(
  data: T[],
  type: DataTypeName
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const seenIds = new Set<string>();

  const validator = VALIDATORS[type];

  if (!validator) {
    return {
      isValid: false,
      errors: [
        {
          id: "N/A",
          type,
          field: "N/A",
          message: `Unknown data type: "${type}"`,
          severity: "error",
        },
      ],
      warnings: [],
      validCount: 0,
      totalCount: data.length,
    };
  }

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [
        {
          id: "N/A",
          type,
          field: "N/A",
          message: "Data must be an array",
          severity: "error",
        },
      ],
      warnings: [],
      validCount: 0,
      totalCount: 0,
    };
  }

  const invalidIndices = new Set<number>();

  for (let i = 0; i < data.length; i++) {
    const itemErrors = validator(data[i], i, seenIds);
    if (itemErrors.length > 0) {
      invalidIndices.add(i);
    }
    for (const err of itemErrors) {
      if (err.severity === "error") {
        errors.push(err);
      } else {
        warnings.push(err);
      }
    }
  }

  const validCount = data.length - invalidIndices.size;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validCount: Math.max(0, validCount),
    totalCount: data.length,
    type,
  };
}

/**
 * Generates a human-readable summary from a validation result.
 *
 * @param results - One or more ValidationResult objects to summarize
 * @returns A string summary of the validation outcome
 */
export function getValidationSummary(
  results: ValidationResult | ValidationResult[]
): string {
  const resultsArray = Array.isArray(results) ? results : [results];

  if (resultsArray.length === 0) {
    return "No validation results to summarize.";
  }

  const totalErrors = resultsArray.reduce(
    (sum, r) => sum + r.errors.length,
    0
  );
  const totalWarnings = resultsArray.reduce(
    (sum, r) => sum + r.warnings.length,
    0
  );
  const totalItems = resultsArray.reduce(
    (sum, r) => sum + r.totalCount,
    0
  );
  const totalValid = resultsArray.reduce(
    (sum, r) => sum + r.validCount,
    0
  );

  if (totalErrors === 0 && totalWarnings === 0) {
    return `All ${totalItems} items passed validation.`;
  }

  const parts: string[] = [];
  parts.push(`${totalValid}/${totalItems} items valid.`);

  if (totalErrors > 0) {
    parts.push(`${totalErrors} error(s) found.`);
  }
  if (totalWarnings > 0) {
    parts.push(`${totalWarnings} warning(s) found.`);
  }

  return parts.join(" ");
}
