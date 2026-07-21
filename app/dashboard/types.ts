/**
 * Type definitions for Jira Clone application.
 * Contains all data models and type utilities used throughout the application.
 */

/**
 * Comment interface representing a comment on a task.
 */
export interface Comment {
  id: string; // Unique comment identifier
  taskId: string; // ID of the task this comment belongs to
  author: string; // Name of the comment author
  content: string; // Comment text content
  createdAt: string; // ISO timestamp of creation
}

export type EpicStatus = "ACTIVE" | "ARCHIVED";

export interface Epic {
  id: string;
  title: string;
  description: string;
  color: string;
  status: EpicStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Task interface representing a kanban task.
 */
export interface Task {
  id: string; // Unique task identifier (timestamp-based)
  title: string; // Task title (required)
  description: string; // Detailed task description
  status: "TODO" | "IN_PROGRESS" | "DONE"; // Current task status
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; // Task priority level
  dueDate: string; // ISO date string for due date
  tags: string[]; // Array of tag strings for categorization
  assignee: string; // Name of the assigned team member
  relatedRequirementId?: string; // Optional reference to related requirement
  relatedGoalId?: string; // Optional reference to related goal
  figmaUrl?: string; // Optional Figma design URL
  comments: Comment[]; // Array of comments on this task
  createdAt: string; // ISO date string for creation date
  epicId?: string; // Optional reference to related epic
}

/**
 * Requirement interface representing a product requirement.
 */
export interface Requirement {
  id: string; // Unique requirement identifier
  title: string; // Requirement title (required)
  description: string; // Detailed requirement description
  source?: string; // Standard source reference (e.g., ISO 9001:2015, GB/T 35273-2020)
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; // Requirement priority
  status: "DRAFT" | "REVIEW" | "APPROVED" | "IMPLEMENTED"; // Lifecycle status
  acceptanceCriteria: string[]; // List of acceptance criteria
  createdAt: string; // ISO timestamp of creation
  updatedAt: string; // ISO timestamp of last update
  requester: string; // Name of the requester
  executor: string; // Name of the executor
  relatedGoalId?: string; // Optional reference to related goal
  epicId?: string; // Optional reference to related epic
}

/**
 * TestCase interface representing a test case for requirements.
 */
export interface TestCase {
  id: string; // Unique test case identifier
  requirementId: string; // ID of related requirement (empty string = no relation)
  title: string; // Test case title (required)
  description: string; // Detailed test case description
  steps: string[]; // Array of test steps
  expectedResult: string; // Expected outcome of the test
  status: "PENDING" | "PASSED" | "FAILED" | "BLOCKED"; // Test execution status
  executedAt?: string; // ISO timestamp of when test was executed
  executor?: string; // Name of who executed the test
  errorMessage?: string; // Error message if test failed
  errorLog?: string; // Detailed error log if test failed
  actualResult?: string; // Actual outcome of the test
  epicId?: string; // Optional reference to related epic
}

/**
 * BugStatus union type representing the lifecycle status of a bug.
 */
export type BugStatus =
  | "REPORTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "VERIFIED"
  | "CLOSED"
  | "REOPENED";

/**
 * BugSeverity union type representing the severity level of a bug.
 */
export type BugSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

/**
 * BugPriority union type representing the priority level of a bug.
 */
export type BugPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

/**
 * Bug interface representing a bug report in the system.
 */
export interface Bug {
  id: string; // Unique bug identifier
  title: string; // Bug title (required)
  description: string; // Detailed bug description
  stepsToReproduce: string[]; // Steps to reproduce the bug
  expectedBehavior: string; // Expected behavior
  actualBehavior: string; // Actual behavior (what happened)
  severity: BugSeverity; // Bug severity level
  priority: BugPriority; // Bug priority level
  status: BugStatus; // Current bug status
  reporter: string; // Name of the person who reported the bug
  assignee?: string; // Name of the assigned engineer
  verifier?: string; // Name of the person who verifies the fix
  relatedTaskId?: string; // Optional reference to related task
  relatedRequirementId?: string; // Optional reference to related requirement
  createdAt: string; // ISO timestamp of creation
  updatedAt: string; // ISO timestamp of last update
  resolvedAt?: string; // ISO timestamp when resolved
  verifiedAt?: string; // ISO timestamp when verified
  resolution?: string; // How the bug was resolved
  comments: BugComment[]; // Array of comments on this bug
  attachments?: string[]; // Array of attachment URLs
  epicId?: string; // Optional reference to related epic
}

/**
 * BugComment interface representing a comment on a bug.
 */
export interface BugComment {
  id: string; // Unique comment identifier
  bugId: string; // ID of the bug this comment belongs to
  author: string; // Name of the comment author
  content: string; // Comment text content
  createdAt: string; // ISO timestamp of creation
}

/**
 * FormFields interface representing form input state for create/edit operations.
 */
export interface FormFields {
  title: string; // Title field (used for tasks, requirements, test cases)
  description: string; // Description field
  status: string; // Status field
  priority: string; // Priority field
  dueDate: string; // Due date field (for tasks)
  tags: string[]; // Tags array (for tasks)
  assignee: string; // Assignee field (for tasks)
  relatedRequirementId: string; // Related requirement ID (for tasks)
  relatedGoalId: string; // Related goal ID (for tasks)
  figmaUrl: string; // Figma design URL (for tasks)
  steps: string; // Test steps (for test cases)
  expectedResult: string; // Expected result (for test cases)
  acceptanceCriteria: string; // Acceptance criteria (for requirements)
  requester: string; // Requester (for requirements)
  executor: string; // Executor (for requirements)
  severity: string; // Bug severity (for bugs)
  bugPriority: string; // Bug priority (for bugs)
  stepsToReproduce: string; // Steps to reproduce (for bugs)
  expectedBehavior: string; // Expected behavior (for bugs)
  actualBehavior: string; // Actual behavior (for bugs)
}

/**
 * OperationLog interface representing an audit log entry.
 */
export interface OperationLog {
  id: string; // Unique log identifier
  timestamp: string; // ISO timestamp of the operation
  action: string; // Action type (CREATE, UPDATE, DELETE)
  target: string; // Target type (TASK, REQUIREMENT, TEST_CASE)
  details: string; // Detailed description of the operation
}

/**
 * Audit action types for ISO 27001 security audit logging.
 */
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT"
  | "CLEAR"
  | "READ";

/**
 * Audit target types representing the entity being operated on.
 */
export type AuditTarget =
  | "TASK"
  | "REQUIREMENT"
  | "TEST_CASE"
  | "BUG"
  | "GOAL"
  | "MILESTONE"
  | "KEY_RESULT"
  | "SYSTEM"
  | "NOTIFICATION"
  | "SUBAGENT_TASK"
  | "EPIC";

/**
 * AuditLogEntry interface representing an ISO 27001 security audit log entry.
 */
export interface AuditLogEntry {
  id: string; // Unique log identifier (timestamp + random)
  timestamp: string; // ISO timestamp of the operation
  action: AuditAction; // Action type
  target: AuditTarget; // Target entity type
  targetId: string; // ID of the target object
  details: string; // Detailed description of the operation
  username: string; // Username of who performed the action
}

/**
 * ModalType union type representing the type of modal dialog.
 */
export type ModalType = "task" | "requirement" | "test" | "bug";

/**
 * ViewMode union type representing the current application view.
 */
export type ViewMode =
  | "TASKS"
  | "REQUIREMENTS"
  | "TESTING"
  | "BUGS"
  | "GOALS"
  | "AUDIT"
  | "NOTIFICATIONS";

export type GoalStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "ON_TRACK"
  | "AT_RISK"
  | "ACHIEVED";

export type GoalType = "OKR" | "SMART" | "MILESTONE" | "PROJECT";

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  target: string;
  currentProgress: number;
  startDate: string;
  endDate: string;
  owner: string;
  relatedRequirementIds?: string[];
  relatedTaskIds?: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
  epicId?: string; // Optional reference to related epic
  milestones?: Milestone[];
  keyResults?: KeyResult[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  status?: "TODO" | "PENDING" | "COMPLETED";
}

export interface KeyResult {
  id: string;
  goalId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: "ON_TRACK" | "AT_RISK" | "BEHIND";
}

/**
 * Validates that a string is a valid task status.
 * @param status - String to validate
 * @returns True if valid task status, false otherwise
 */
export const isValidTaskStatus = (status: string): status is Task["status"] => {
  return ["TODO", "IN_PROGRESS", "DONE"].includes(status);
};

/**
 * Validates that a string is a valid task priority.
 * @param priority - String to validate
 * @returns True if valid task priority, false otherwise
 */
export const isValidTaskPriority = (
  priority: string
): priority is Task["priority"] => {
  return ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority);
};

/**
 * Validates that a string is a valid requirement status.
 * @param status - String to validate
 * @returns True if valid requirement status, false otherwise
 */
export const isValidRequirementStatus = (
  status: string
): status is Requirement["status"] => {
  return ["DRAFT", "REVIEW", "APPROVED", "IMPLEMENTED"].includes(status);
};

/**
 * Validates that a string is a valid requirement priority.
 * @param priority - String to validate
 * @returns True if valid requirement priority, false otherwise
 */
export const isValidRequirementPriority = (
  priority: string
): priority is Requirement["priority"] => {
  return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority);
};

/**
 * Validates that a string is a valid test case status.
 * @param status - String to validate
 * @returns True if valid test case status, false otherwise
 */
export const isValidTestCaseStatus = (
  status: string
): status is TestCase["status"] => {
  return ["PENDING", "PASSED", "FAILED", "BLOCKED"].includes(status);
};

// ─── Data Integrity Validation Types ─────────────────────────────────────────

/**
 * ValidationError interface representing a single data integrity validation error.
 * Used by the ISO/IEC 25010 data integrity validation module.
 */
export interface ValidationError {
  id: string; // 数据对象ID
  type: string; // 数据类型
  field: string; // 出错的字段
  message: string; // 错误描述
  severity: "error" | "warning";
}

/**
 * ValidationResult interface representing the outcome of a data integrity check.
 * Contains all errors, warnings, and summary counts.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  validCount: number;
  totalCount: number;
  type?: string;
}

// ─── Notification System Types ────────────────────────────────────────────────

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_COMMENTED"
  | "BUG_REPORTED"
  | "BUG_ASSIGNED"
  | "REQUIREMENT_APPROVED"
  | "TEST_CASE_FAILED"
  | "GOAL_PROGRESS_UPDATED"
  | "SUBAGENT_TASK_STARTED"
  | "SUBAGENT_TASK_COMPLETED"
  | "SUBAGENT_TASK_FAILED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetId: string;
  targetType: "TASK" | "BUG" | "REQUIREMENT" | "TEST_CASE" | "GOAL";
  sender?: string;
  recipient: string;
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  scheduledSubagent?: string;
  createdAt: string;
}

export interface SubagentTask {
  id: string;
  notificationId: string;
  subagentName: string;
  taskType: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  inputData: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface NotificationSettings {
  userId: string;
  enabledTypes: NotificationType[];
  autoScheduleSubagent: boolean;
  preferredSubagents: string[];
  muteUntil?: string;
}

export const isValidNotificationType = (type: string): type is NotificationType => {
  return [
    "TASK_ASSIGNED",
    "TASK_STATUS_CHANGED",
    "TASK_COMMENTED",
    "BUG_REPORTED",
    "BUG_ASSIGNED",
    "REQUIREMENT_APPROVED",
    "TEST_CASE_FAILED",
    "GOAL_PROGRESS_UPDATED",
    "SUBAGENT_TASK_STARTED",
    "SUBAGENT_TASK_COMPLETED",
    "SUBAGENT_TASK_FAILED",
  ].includes(type);
};
