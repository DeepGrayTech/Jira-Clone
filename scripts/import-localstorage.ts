import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STORAGE_KEYS = {
  tasks: "jira-clone-tasks",
  requirements: "jira-clone-requirements",
  testCases: "jira-clone-test-cases",
  bugs: "jira-clone-bugs",
  goals: "jira-clone-goals",
  epics: "jira-clone-epics",
  milestones: "jira-clone-milestones",
  keyResults: "jira-clone-key-results",
  comments: "jira-clone-comments",
  auditLogs: "jira-clone-audit-logs",
  tagHistory: "jira-clone-tag-history",
};

async function main() {
  const email = process.argv[2] || "demo@example.com";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  console.log(`Target user: ${user.email} (${user.id})`);

  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let data: Record<string, any> = {};
  try {
    data = JSON.parse(input || "{}");
  } catch {
    console.error("Invalid JSON input");
    process.exit(1);
  }

  const userId = user.id;
  const summary = {
    epics: 0,
    goals: 0,
    milestones: 0,
    keyResults: 0,
    tasks: 0,
    requirements: 0,
    testCases: 0,
    bugs: 0,
    comments: 0,
    auditLogs: 0,
  };

  // Epics first
  const epics: any[] = data[STORAGE_KEYS.epics] || [];
  const epicMap = new Map<string, string>();
  for (const epic of epics) {
    if (!epic || !epic.id) continue;
    try {
      const created = await prisma.epic.upsert({
        where: { id: epic.id },
        update: {
          title: epic.title || "Untitled Epic",
          description: epic.description,
          color: epic.color || "#3b82f6",
        },
        create: {
          id: epic.id,
          title: epic.title || "Untitled Epic",
          description: epic.description,
          color: epic.color || "#3b82f6",
          userId,
        },
      });
      epicMap.set(epic.id, created.id);
      summary.epics++;
    } catch (e) {
      console.warn("Epic import failed:", epic.id, e);
    }
  }

  // Goals
  const goals: any[] = data[STORAGE_KEYS.goals] || [];
  const goalMap = new Map<string, string>();
  for (const goal of goals) {
    if (!goal || !goal.id) continue;
    try {
      const created = await prisma.goal.upsert({
        where: { id: goal.id },
        update: {
          title: goal.title || "Untitled Goal",
          description: goal.description,
          status: goal.status || "TODO",
        },
        create: {
          id: goal.id,
          title: goal.title || "Untitled Goal",
          description: goal.description,
          status: goal.status || "TODO",
          userId,
        },
      });
      goalMap.set(goal.id, created.id);
      summary.goals++;
    } catch (e) {
      console.warn("Goal import failed:", goal.id, e);
    }
  }

  // Milestones
  const milestones: any[] = data[STORAGE_KEYS.milestones] || [];
  for (const ms of milestones) {
    if (!ms || !ms.id) continue;
    try {
      await prisma.milestone.upsert({
        where: { id: ms.id },
        update: {
          title: ms.title || "Untitled Milestone",
          dueDate: ms.dueDate,
          status: ms.status || "TODO",
        },
        create: {
          id: ms.id,
          title: ms.title || "Untitled Milestone",
          dueDate: ms.dueDate,
          status: ms.status || "TODO",
          goalId: ms.goalId ? goalMap.get(ms.goalId) || ms.goalId : goalMap.values().next().value || undefined,
        },
      });
      summary.milestones++;
    } catch (e) {
      console.warn("Milestone import failed:", ms.id, e);
    }
  }

  // KeyResults
  const keyResults: any[] = data[STORAGE_KEYS.keyResults] || [];
  for (const kr of keyResults) {
    if (!kr || !kr.id) continue;
    try {
      await prisma.keyResult.upsert({
        where: { id: kr.id },
        update: {
          title: kr.title || "Untitled Key Result",
          target: typeof kr.target === "number" ? kr.target : 0,
          current: typeof kr.current === "number" ? kr.current : 0,
          status: kr.status || "TODO",
        },
        create: {
          id: kr.id,
          title: kr.title || "Untitled Key Result",
          target: typeof kr.target === "number" ? kr.target : 0,
          current: typeof kr.current === "number" ? kr.current : 0,
          status: kr.status || "TODO",
          goalId: kr.goalId ? goalMap.get(kr.goalId) || kr.goalId : goalMap.values().next().value || undefined,
        },
      });
      summary.keyResults++;
    } catch (e) {
      console.warn("KeyResult import failed:", kr.id, e);
    }
  }

  // Tasks
  const tasks: any[] = data[STORAGE_KEYS.tasks] || [];
  for (const task of tasks) {
    if (!task || !task.id) continue;
    try {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {
          title: task.title || "Untitled Task",
          description: task.description,
          status: task.status || "TODO",
          priority: task.priority || "MEDIUM",
          dueDate: task.dueDate,
          tags: Array.isArray(task.tags) ? JSON.stringify(task.tags) : task.tags || "[]",
          assignee: task.assignee,
          relatedRequirementId: task.relatedRequirementId,
          figmaUrl: task.figmaUrl,
          epicId: task.epicId ? epicMap.get(task.epicId) || task.epicId : undefined,
        },
        create: {
          id: task.id,
          title: task.title || "Untitled Task",
          description: task.description,
          status: task.status || "TODO",
          priority: task.priority || "MEDIUM",
          dueDate: task.dueDate,
          tags: Array.isArray(task.tags) ? JSON.stringify(task.tags) : task.tags || "[]",
          assignee: task.assignee,
          relatedRequirementId: task.relatedRequirementId,
          figmaUrl: task.figmaUrl,
          epicId: task.epicId ? epicMap.get(task.epicId) || task.epicId : undefined,
          userId,
        },
      });
      summary.tasks++;
    } catch (e) {
      console.warn("Task import failed:", task.id, e);
    }
  }

  // Requirements
  const requirements: any[] = data[STORAGE_KEYS.requirements] || [];
  for (const req of requirements) {
    if (!req || !req.id) continue;
    try {
      await prisma.requirement.upsert({
        where: { id: req.id },
        update: {
          title: req.title || "Untitled Requirement",
          description: req.description,
          status: req.status || "TODO",
          priority: req.priority || "MEDIUM",
          dueDate: req.dueDate,
          acceptanceCriteria: Array.isArray(req.acceptanceCriteria)
            ? JSON.stringify(req.acceptanceCriteria)
            : req.acceptanceCriteria || "[]",
          requester: req.requester,
          executor: req.executor,
          epicId: req.epicId ? epicMap.get(req.epicId) || req.epicId : undefined,
        },
        create: {
          id: req.id,
          title: req.title || "Untitled Requirement",
          description: req.description,
          status: req.status || "TODO",
          priority: req.priority || "MEDIUM",
          dueDate: req.dueDate,
          acceptanceCriteria: Array.isArray(req.acceptanceCriteria)
            ? JSON.stringify(req.acceptanceCriteria)
            : req.acceptanceCriteria || "[]",
          requester: req.requester,
          executor: req.executor,
          epicId: req.epicId ? epicMap.get(req.epicId) || req.epicId : undefined,
          userId,
        },
      });
      summary.requirements++;
    } catch (e) {
      console.warn("Requirement import failed:", req.id, e);
    }
  }

  // TestCases
  const testCases: any[] = data[STORAGE_KEYS.testCases] || [];
  for (const tc of testCases) {
    if (!tc || !tc.id) continue;
    try {
      await prisma.testCase.upsert({
        where: { id: tc.id },
        update: {
          title: tc.title || "Untitled Test Case",
          description: tc.description,
          status: tc.status || "TODO",
          steps: Array.isArray(tc.steps) ? JSON.stringify(tc.steps) : tc.steps || "[]",
          expectedResult: tc.expectedResult,
          relatedRequirementId: tc.relatedRequirementId,
        },
        create: {
          id: tc.id,
          title: tc.title || "Untitled Test Case",
          description: tc.description,
          status: tc.status || "TODO",
          steps: Array.isArray(tc.steps) ? JSON.stringify(tc.steps) : tc.steps || "[]",
          expectedResult: tc.expectedResult,
          relatedRequirementId: tc.relatedRequirementId,
          userId,
        },
      });
      summary.testCases++;
    } catch (e) {
      console.warn("TestCase import failed:", tc.id, e);
    }
  }

  // Bugs
  const bugs: any[] = data[STORAGE_KEYS.bugs] || [];
  for (const bug of bugs) {
    if (!bug || !bug.id) continue;
    try {
      await prisma.bug.upsert({
        where: { id: bug.id },
        update: {
          title: bug.title || "Untitled Bug",
          description: bug.description,
          severity: bug.severity || "MEDIUM",
          priority: bug.priority || "MEDIUM",
          stepsToReproduce: Array.isArray(bug.stepsToReproduce)
            ? JSON.stringify(bug.stepsToReproduce)
            : bug.stepsToReproduce || "[]",
          expectedBehavior: bug.expectedBehavior,
          actualBehavior: bug.actualBehavior,
        },
        create: {
          id: bug.id,
          title: bug.title || "Untitled Bug",
          description: bug.description,
          severity: bug.severity || "MEDIUM",
          priority: bug.priority || "MEDIUM",
          stepsToReproduce: Array.isArray(bug.stepsToReproduce)
            ? JSON.stringify(bug.stepsToReproduce)
            : bug.stepsToReproduce || "[]",
          expectedBehavior: bug.expectedBehavior,
          actualBehavior: bug.actualBehavior,
          userId,
        },
      });
      summary.bugs++;
    } catch (e) {
      console.warn("Bug import failed:", bug.id, e);
    }
  }

  // Comments
  const comments: any[] = data[STORAGE_KEYS.comments] || [];
  for (const c of comments) {
    if (!c || !c.id) continue;
    try {
      await prisma.comment.create({
        data: {
          id: c.id,
          content: c.content || "",
          taskId: c.taskId,
          author: c.author || "import",
          userId,
        },
      });
      summary.comments++;
    } catch (e) {
      console.warn("Comment import failed:", c.id, e);
    }
  }

  // AuditLogs
  const auditLogs: any[] = data[STORAGE_KEYS.auditLogs] || [];
  for (const log of auditLogs) {
    if (!log || !log.id) continue;
    try {
      await prisma.auditLog.create({
        data: {
          id: log.id,
          action: log.action || "IMPORT",
          entityType: log.entityType || "UNKNOWN",
          entityId: log.entityId || "unknown",
          details: log.details || JSON.stringify(log),
          username: log.username || "import",
          userId,
        },
      });
      summary.auditLogs++;
    } catch (e) {
      console.warn("AuditLog import failed:", log.id, e);
    }
  }

  console.log("Import complete:", JSON.stringify(summary, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
