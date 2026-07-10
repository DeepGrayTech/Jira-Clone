/**
 * Constants for Jira Clone application.
 * Contains color schemes, storage keys, and status labels used throughout the app.
 */

/**
 * Color scheme object containing all color values used in the application.
 * Colors follow a modern, accessible design palette.
 */
export const COLORS = {
  background: "#ffffff", // Main page background
  text: "#111827", // Primary text color
  textSecondary: "#4b5563", // Secondary text color (muted)
  border: "#e5e7eb", // Border color for dividers and cards
  buttonPrimary: "#2563eb", // Primary button background
  buttonPrimaryHover: "#1d4ed8", // Primary button hover state
  buttonSecondary: "#f3f4f6", // Secondary button background
  buttonDanger: "#dc2626", // Danger button background (delete, cancel)
  buttonDangerHover: "#b91c1c", // Danger button hover state
  cardBackground: "#ffffff", // Card background color
  columnBackground: "#f3f4f6", // Kanban column background
  priorityLow: "#22c55e", // Low priority indicator color (green)
  priorityMedium: "#eab308", // Medium priority indicator color (yellow)
  priorityHigh: "#f97316", // High priority indicator color (orange)
  priorityUrgent: "#dc2626", // Urgent priority indicator color (red)
  auditCreate: "#22c55e", // CREATE action color (green)
  auditUpdate: "#3b82f6", // UPDATE action color (blue)
  auditDelete: "#dc2626", // DELETE action color (red)
  auditLogin: "#8b5cf6", // LOGIN action color (purple)
  auditLogout: "#6b7280", // LOGOUT action color (gray)
  auditExport: "#eab308", // EXPORT action color (yellow)
  auditImport: "#f97316", // IMPORT action color (orange)
  auditClear: "#ef4444", // CLEAR action color (red)
  auditSystem: "#6366f1", // SYSTEM target color (indigo)
  auditTask: "#3b82f6", // TASK target color (blue)
  auditRequirement: "#8b5cf6", // REQUIREMENT target color (purple)
  auditTestCase: "#22c55e", // TEST_CASE target color (green)
  auditBug: "#f97316", // BUG target color (orange)
  auditGoal: "#eab308", // GOAL target color (yellow)
  auditMilestone: "#06b6d4", // MILESTONE target color (cyan)
  auditKeyResult: "#f472b6", // KEY_RESULT target color (pink)
};

/**
 * localStorage keys for application data storage.
 * Each key corresponds to a specific data type stored in localStorage.
 */
export const STORAGE_KEYS = {
  TASKS: "jira-clone-tasks", // Task data storage key
  REQUIREMENTS: "jira-clone-requirements", // Requirements data storage key
  TEST_CASES: "jira-clone-test-cases", // Test case data storage key
  TAG_HISTORY: "jira-clone-tag-history", // Tag history storage key
  COMMENTS: "jira-clone-comments", // Comments storage key
  AGENTS: "jira-clone-agents", // Agent data storage key
  AGENT_ASSIGNMENTS: "jira-clone-agent-assignments", // Agent-task assignments key
  BUGS: "jira-clone-bugs", // Bug reports storage key
  GOALS: "jira-clone-goals", // Goals data storage key
  MILESTONES: "jira-clone-milestones", // Milestones data storage key
  KEY_RESULTS: "jira-clone-key-results", // Key Results data storage key
  AUDIT_LOGS: "jira-clone-audit-logs", // ISO 27001 audit logs storage key
};

/**
 * Status labels for tasks.
 * Maps task status enum values to user-friendly display strings.
 */
export const STATUS_LABELS = {
  TODO: "To Do", // Display label for TODO status
  IN_PROGRESS: "In Progress", // Display label for IN_PROGRESS status
  DONE: "Done", // Display label for DONE status
};

/**
 * Status labels for requirements.
 * Maps requirement status enum values to user-friendly display strings.
 */
export const REQUIREMENT_STATUS_LABELS = {
  DRAFT: "Draft", // Display label for DRAFT status
  REVIEW: "In Review", // Display label for REVIEW status
  APPROVED: "Approved", // Display label for APPROVED status
  IMPLEMENTED: "Implemented", // Display label for IMPLEMENTED status
};

/**
 * Status labels for test cases.
 * Maps test case status enum values to user-friendly display strings.
 */
export const TEST_CASE_STATUS_LABELS = {
  PENDING: "Pending", // Display label for PENDING status
  PASSED: "Passed", // Display label for PASSED status
  FAILED: "Failed", // Display label for FAILED status
  BLOCKED: "Blocked", // Display label for BLOCKED status
};
