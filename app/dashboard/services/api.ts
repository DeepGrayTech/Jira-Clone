import type {
  Task,
  Requirement,
  TestCase,
  Bug,
  BugComment,
  Goal,
  Milestone,
  KeyResult,
  Comment,
  AuditLogEntry,
  Epic,
} from "../types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof data === "object" && data !== null && "error" in data
        ? String(data.error)
        : `Request failed with status ${response.status}`,
      data
    );
  }

  return (data ?? null) as T;
}

// ── Task API ───────────────────────────────────────────────────────────────

export interface TaskListResponse {
  tasks: Task[];
}

export async function fetchTasks(): Promise<Task[]> {
  const rows = await fetchJson<Array<any>>("/api/tasks", { method: "GET" });
  return rows.map(parseTask);
}

export async function createTaskApi(
  payload: Partial<Task>
): Promise<Task> {
  const body = serializeTask(payload);
  const created = await fetchJson<any>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseTask(created);
}

export async function updateTaskApi(
  id: string,
  payload: Partial<Task>
): Promise<Task> {
  const body = serializeTask(payload);
  const updated = await fetchJson<any>(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return parseTask(updated);
}

export async function deleteTaskApi(id: string): Promise<void> {
  await fetchJson(`/api/tasks/${id}`, { method: "DELETE" });
}

// ── Requirement API ────────────────────────────────────────────────────────

export async function fetchRequirements(): Promise<Requirement[]> {
  const rows = await fetchJson<Array<any>>("/api/requirements", { method: "GET" });
  return rows.map(parseRequirement);
}

export async function createRequirementApi(
  payload: Partial<Requirement>
): Promise<Requirement> {
  const body = serializeRequirement(payload);
  const created = await fetchJson<any>("/api/requirements", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseRequirement(created);
}

export async function updateRequirementApi(
  id: string,
  payload: Partial<Requirement>
): Promise<Requirement> {
  const body = serializeRequirement(payload);
  const updated = await fetchJson<any>(`/api/requirements/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return parseRequirement(updated);
}

export async function deleteRequirementApi(id: string): Promise<void> {
  await fetchJson(`/api/requirements/${id}`, { method: "DELETE" });
}

// ── Test Case API ──────────────────────────────────────────────────────────

export async function fetchTestCases(): Promise<TestCase[]> {
  const rows = await fetchJson<Array<any>>("/api/test-cases", { method: "GET" });
  return rows.map(parseTestCase);
}

export async function createTestCaseApi(
  payload: Partial<TestCase>
): Promise<TestCase> {
  const body = serializeTestCase(payload);
  const created = await fetchJson<any>("/api/test-cases", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseTestCase(created);
}

export async function updateTestCaseApi(
  id: string,
  payload: Partial<TestCase>
): Promise<TestCase> {
  const body = serializeTestCase(payload);
  const updated = await fetchJson<any>(`/api/test-cases/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return parseTestCase(updated);
}

export async function deleteTestCaseApi(id: string): Promise<void> {
  await fetchJson(`/api/test-cases/${id}`, { method: "DELETE" });
}

// ── Bug API ────────────────────────────────────────────────────────────────

export async function fetchBugs(): Promise<Bug[]> {
  const rows = await fetchJson<Array<any>>("/api/bugs", { method: "GET" });
  return rows.map(parseBug);
}

export async function createBugApi(payload: Partial<Bug>): Promise<Bug> {
  const body = serializeBug(payload);
  const created = await fetchJson<any>("/api/bugs", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseBug(created);
}

export async function updateBugApi(
  id: string,
  payload: Partial<Bug>
): Promise<Bug> {
  const body = serializeBug(payload);
  const updated = await fetchJson<any>(`/api/bugs/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return parseBug(updated);
}

export async function deleteBugApi(id: string): Promise<void> {
  await fetchJson(`/api/bugs/${id}`, { method: "DELETE" });
}

// ── Goal / Milestone / Key Result API ───────────────────────────────────────

export async function fetchGoals(): Promise<Goal[]> {
  const rows = await fetchJson<Array<any>>("/api/goals", { method: "GET" });
  return rows.map(parseGoal);
}

export async function createGoalApi(payload: Partial<Goal>): Promise<Goal> {
  const body = serializeGoal(payload);
  const created = await fetchJson<any>("/api/goals", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseGoal(created);
}

export async function updateGoalApi(
  id: string,
  payload: Partial<Goal>
): Promise<Goal> {
  const body = serializeGoal(payload);
  const updated = await fetchJson<any>(`/api/goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return parseGoal(updated);
}

export async function deleteGoalApi(id: string): Promise<void> {
  await fetchJson(`/api/goals/${id}`, { method: "DELETE" });
}

export interface MilestonePayload {
  title?: string;
  dueDate?: string;
  status?: string;
  goalId?: string;
}

export async function createMilestoneApi(
  payload: MilestonePayload
): Promise<Milestone> {
  const created = await fetchJson<any>("/api/goals/milestones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseMilestone(created);
}

export async function updateMilestoneApi(
  id: string,
  payload: Partial<MilestonePayload>
): Promise<Milestone> {
  const updated = await fetchJson<any>(`/api/goals/milestones/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return parseMilestone(updated);
}

export async function deleteMilestoneApi(id: string): Promise<void> {
  await fetchJson(`/api/goals/milestones/${id}`, { method: "DELETE" });
}

export interface KeyResultPayload {
  title?: string;
  target?: number;
  current?: number;
  status?: string;
  goalId?: string;
}

export async function createKeyResultApi(
  payload: KeyResultPayload
): Promise<KeyResult> {
  const created = await fetchJson<any>("/api/goals/key-results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseKeyResult(created);
}

export async function updateKeyResultApi(
  id: string,
  payload: Partial<KeyResultPayload>
): Promise<KeyResult> {
  const updated = await fetchJson<any>(`/api/goals/key-results/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return parseKeyResult(updated);
}

export async function deleteKeyResultApi(id: string): Promise<void> {
  await fetchJson(`/api/goals/key-results/${id}`, { method: "DELETE" });
}

// ── Comment API ────────────────────────────────────────────────────────────

export async function fetchComments(taskId: string): Promise<Comment[]> {
  const rows = await fetchJson<Array<any>>(
    `/api/comments?taskId=${encodeURIComponent(taskId)}`,
    { method: "GET" }
  );
  return rows.map(parseComment);
}

export async function createCommentApi(
  payload: Partial<Comment>
): Promise<Comment> {
  const created = await fetchJson<any>("/api/comments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseComment(created);
}

export async function deleteCommentApi(id: string): Promise<void> {
  await fetchJson(`/api/comments/${id}`, { method: "DELETE" });
}

// ── Audit Log API ────────────────────────────────────────────────────────────

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const rows = await fetchJson<Array<any>>("/api/audit-logs", { method: "GET" });
  return rows.map(parseAuditLog);
}

export async function createAuditLogApi(
  payload: Partial<AuditLogEntry>
): Promise<AuditLogEntry> {
  const body = {
    action: payload.action,
    entityType: payload.target,
    entityId: payload.targetId,
    details: payload.details,
    username: payload.username,
  };

  const created = await fetchJson<any>("/api/audit-logs", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseAuditLog(created);
}

// ── Epic API ─────────────────────────────────────────────────────────────────

export async function fetchEpics(): Promise<Epic[]> {
  const rows = await fetchJson<Array<any>>("/api/epics", { method: "GET" });
  return rows.map(parseEpic);
}

export async function createEpicApi(payload: Partial<Epic>): Promise<Epic> {
  const created = await fetchJson<any>("/api/epics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseEpic(created);
}

export async function updateEpicApi(
  id: string,
  payload: Partial<Epic>
): Promise<Epic> {
  const updated = await fetchJson<any>(`/api/epics/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return parseEpic(updated);
}

export async function deleteEpicApi(id: string): Promise<void> {
  await fetchJson(`/api/epics/${id}`, { method: "DELETE" });
}

// ── Import API ───────────────────────────────────────────────────────────────

export interface ImportPayload {
  epics?: any[];
  tasks?: any[];
  requirements?: any[];
  testCases?: any[];
  bugs?: any[];
  goals?: any[];
  auditLogs?: any[];
}

export async function importDataApi(
  payload: ImportPayload
): Promise<{ success: boolean; imported: Record<string, number> }> {
  return fetchJson<{ success: boolean; imported: Record<string, number> }>(
    "/api/import",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

// ── Serialization helpers ──────────────────────────────────────────────────

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseTask(row: any): Task {
  return {
    id: row.id,
    title: row.title || "Untitled Task",
    description: row.description || "",
    status: row.status || "TODO",
    priority: row.priority || "MEDIUM",
    dueDate: row.dueDate || "",
    tags: parseJsonArray(row.tags),
    assignee: row.assignee || "",
    relatedRequirementId: row.relatedRequirementId || "",
    relatedGoalId: row.relatedGoalId || "",
    figmaUrl: row.figmaUrl || "",
    comments: Array.isArray(row.comments)
      ? row.comments.map(parseComment)
      : [],
    createdAt: row.createdAt || new Date().toISOString(),
    epicId: row.epicId || undefined,
  };
}

export function serializeTask(task: Partial<Task>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (task.title !== undefined) body.title = task.title;
  if (task.description !== undefined) body.description = task.description;
  if (task.status !== undefined) body.status = task.status;
  if (task.priority !== undefined) body.priority = task.priority;
  if (task.dueDate !== undefined) body.dueDate = task.dueDate;
  if (task.tags !== undefined) body.tags = task.tags;
  if (task.assignee !== undefined) body.assignee = task.assignee;
  if (task.relatedRequirementId !== undefined)
    body.relatedRequirementId = task.relatedRequirementId;
  if (task.relatedGoalId !== undefined) body.relatedGoalId = task.relatedGoalId;
  if (task.figmaUrl !== undefined) body.figmaUrl = task.figmaUrl;
  if (task.epicId !== undefined) body.epicId = task.epicId;
  return body;
}

export function parseRequirement(row: any): Requirement {
  return {
    id: row.id,
    title: row.title || "Untitled Requirement",
    description: row.description || "",
    source: row.source || "",
    priority: row.priority || "MEDIUM",
    status: row.status || "DRAFT",
    acceptanceCriteria: parseJsonArray(row.acceptanceCriteria),
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
    requester: row.requester || "",
    executor: row.executor || "",
    relatedGoalId: row.relatedGoalId || "",
    epicId: row.epicId || undefined,
  };
}

export function serializeRequirement(
  req: Partial<Requirement>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (req.title !== undefined) body.title = req.title;
  if (req.description !== undefined) body.description = req.description;
  if (req.source !== undefined) body.source = req.source;
  if (req.status !== undefined) body.status = req.status;
  if (req.priority !== undefined) body.priority = req.priority;
  if (req.acceptanceCriteria !== undefined)
    body.acceptanceCriteria = req.acceptanceCriteria;
  if (req.requester !== undefined) body.requester = req.requester;
  if (req.executor !== undefined) body.executor = req.executor;
  if (req.relatedGoalId !== undefined) body.relatedGoalId = req.relatedGoalId;
  if (req.epicId !== undefined) body.epicId = req.epicId;
  return body;
}

export function parseTestCase(row: any): TestCase {
  return {
    id: row.id,
    requirementId: row.relatedRequirementId || "",
    title: row.title || "Untitled Test Case",
    description: row.description || "",
    steps: parseJsonArray(row.steps),
    expectedResult: row.expectedResult || "",
    status: row.status || "PENDING",
    executedAt: row.executedAt || "",
    executor: row.executor || "",
    errorMessage: row.errorMessage || "",
    errorLog: row.errorLog || "",
    actualResult: row.actualResult || "",
    epicId: row.epicId || undefined,
  };
}

export function serializeTestCase(
  tc: Partial<TestCase>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (tc.title !== undefined) body.title = tc.title;
  if (tc.description !== undefined) body.description = tc.description;
  if (tc.status !== undefined) body.status = tc.status;
  if (tc.steps !== undefined) body.steps = tc.steps;
  if (tc.expectedResult !== undefined) body.expectedResult = tc.expectedResult;
  if (tc.requirementId !== undefined)
    body.relatedRequirementId = tc.requirementId;
  if (tc.epicId !== undefined) body.epicId = tc.epicId;
  return body;
}

export function parseBug(row: any): Bug {
  return {
    id: row.id,
    title: row.title || "Untitled Bug",
    description: row.description || "",
    stepsToReproduce: parseJsonArray(row.stepsToReproduce),
    expectedBehavior: row.expectedBehavior || "",
    actualBehavior: row.actualBehavior || "",
    severity: row.severity || "MEDIUM",
    priority: row.priority || "MEDIUM",
    status: row.status || "REPORTED",
    reporter: row.reporter || "",
    assignee: row.assignee || "",
    verifier: row.verifier || "",
    relatedTaskId: row.relatedTaskId || "",
    relatedRequirementId: row.relatedRequirementId || "",
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
    resolvedAt: row.resolvedAt || "",
    verifiedAt: row.verifiedAt || "",
    resolution: row.resolution || "",
    comments: Array.isArray(row.comments)
      ? row.comments.map((c: any) => c as BugComment)
      : [],
    attachments: parseJsonArray(row.attachments),
    epicId: row.epicId || undefined,
  };
}

export function serializeBug(bug: Partial<Bug>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (bug.title !== undefined) body.title = bug.title;
  if (bug.description !== undefined) body.description = bug.description;
  if (bug.severity !== undefined) body.severity = bug.severity;
  if (bug.priority !== undefined) body.priority = bug.priority;
  if (bug.status !== undefined) body.status = bug.status;
  if (bug.stepsToReproduce !== undefined)
    body.stepsToReproduce = bug.stepsToReproduce;
  if (bug.expectedBehavior !== undefined)
    body.expectedBehavior = bug.expectedBehavior;
  if (bug.actualBehavior !== undefined)
    body.actualBehavior = bug.actualBehavior;
  return body;
}

export function parseGoal(row: any): Goal {
  const milestones: Milestone[] = Array.isArray(row.milestones)
    ? row.milestones.map(parseMilestone)
    : [];
  const keyResults: KeyResult[] = Array.isArray(row.keyResults)
    ? row.keyResults.map(parseKeyResult)
    : [];

  return {
    id: row.id,
    title: row.title || "Untitled Goal",
    description: row.description || "",
    type: row.type || "OKR",
    status: row.status || "NOT_STARTED",
    target: row.target || "",
    currentProgress: row.currentProgress || 0,
    startDate: row.startDate || "",
    endDate: row.endDate || "",
    owner: row.owner || "",
    relatedRequirementIds: row.relatedRequirementIds || [],
    relatedTaskIds: row.relatedTaskIds || [],
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
    color: row.color || "#3b82f6",
    epicId: row.epicId || undefined,
    milestones,
    keyResults,
  } as Goal;
}

export function serializeGoal(goal: Partial<Goal>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (goal.title !== undefined) body.title = goal.title;
  if (goal.description !== undefined) body.description = goal.description;
  if (goal.status !== undefined) body.status = goal.status;
  return body;
}

export function parseMilestone(row: any): Milestone {
  return {
    id: row.id,
    goalId: row.goalId || "",
    title: row.title || "Untitled Milestone",
    description: row.description || "",
    dueDate: row.dueDate || "",
    completed: row.status === "DONE" || row.completed === true,
    completedAt: row.completedAt || "",
  };
}

export function parseKeyResult(row: any): KeyResult {
  return {
    id: row.id,
    goalId: row.goalId || "",
    title: row.title || "Untitled Key Result",
    targetValue: row.target ?? 100,
    currentValue: row.current ?? 0,
    unit: row.unit || "",
    status: row.status || "ON_TRACK",
  };
}

export function parseComment(row: any): Comment {
  return {
    id: row.id,
    taskId: row.taskId || "",
    author: row.author || "Unknown",
    content: row.content || "",
    createdAt: row.createdAt || new Date().toISOString(),
  };
}

export function parseAuditLog(row: any): AuditLogEntry {
  return {
    id: row.id,
    timestamp: row.createdAt || new Date().toISOString(),
    action: row.action || "READ",
    target: row.entityType || "SYSTEM",
    targetId: row.entityId || "",
    details: row.details || "",
    username: row.username || "Unknown",
  };
}

export function parseEpic(row: any): Epic {
  return {
    id: row.id,
    title: row.title || "Untitled Epic",
    description: row.description || "",
    color: row.color || "#3b82f6",
    status: row.status || "ACTIVE",
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
  };
}
