import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    epics?: any[];
    tasks?: any[];
    requirements?: any[];
    testCases?: any[];
    bugs?: any[];
    goals?: any[];
    auditLogs?: any[];
  };

  const userId = session.user.id;
  const result = {
    epics: 0,
    tasks: 0,
    requirements: 0,
    testCases: 0,
    bugs: 0,
    goals: 0,
    auditLogs: 0,
  };

  try {
    await prisma.$transaction(async (tx) => {
      if (body.epics?.length) {
        await tx.epic.createMany({
          data: body.epics.map((e) => ({
            title: e.title || "Untitled Epic",
            description: e.description || null,
            color: e.color || "#3b82f6",
            userId,
          })),
        });
        result.epics = body.epics.length;
      }

      if (body.tasks?.length) {
        await tx.task.createMany({
          data: body.tasks.map((t) => ({
            title: t.title || "Untitled Task",
            description: t.description || null,
            status: t.status || "TODO",
            priority: t.priority || "MEDIUM",
            dueDate: t.dueDate || null,
            tags: JSON.stringify(t.tags || []),
            assignee: t.assignee || null,
            relatedRequirementId: t.relatedRequirementId || null,
            figmaUrl: t.figmaUrl || null,
            epicId: t.epicId || null,
            userId,
          })),
        });
        result.tasks = body.tasks.length;
      }

      if (body.requirements?.length) {
        await tx.requirement.createMany({
          data: body.requirements.map((r) => ({
            title: r.title || "Untitled Requirement",
            description: r.description || null,
            status: r.status || "TODO",
            priority: r.priority || "MEDIUM",
            dueDate: r.dueDate || null,
            acceptanceCriteria: JSON.stringify(r.acceptanceCriteria || []),
            requester: r.requester || null,
            executor: r.executor || null,
            epicId: r.epicId || null,
            userId,
          })),
        });
        result.requirements = body.requirements.length;
      }

      if (body.testCases?.length) {
        await tx.testCase.createMany({
          data: body.testCases.map((tc) => ({
            title: tc.title || "Untitled Test Case",
            description: tc.description || null,
            status: tc.status || "TODO",
            steps: JSON.stringify(tc.steps || []),
            expectedResult: tc.expectedResult || null,
            relatedRequirementId: tc.relatedRequirementId || null,
            userId,
          })),
        });
        result.testCases = body.testCases.length;
      }

      if (body.bugs?.length) {
        await tx.bug.createMany({
          data: body.bugs.map((b) => ({
            title: b.title || "Untitled Bug",
            description: b.description || null,
            severity: b.severity || "MEDIUM",
            priority: b.priority || "MEDIUM",
            stepsToReproduce: JSON.stringify(b.stepsToReproduce || []),
            expectedBehavior: b.expectedBehavior || null,
            actualBehavior: b.actualBehavior || null,
            userId,
          })),
        });
        result.bugs = body.bugs.length;
      }

      if (body.goals?.length) {
        // Goals are inserted one by one to include nested milestones/keyResults
        for (const g of body.goals) {
          await tx.goal.create({
            data: {
              title: g.title || "Untitled Goal",
              description: g.description || null,
              status: g.status || "ACTIVE",
              userId,
              milestones: {
                create: (g.milestones || []).map((m: any) => ({
                  title: m.title || "Untitled Milestone",
                  dueDate: m.dueDate || null,
                  status: m.status || "TODO",
                })),
              },
              keyResults: {
                create: (g.keyResults || []).map((k: any) => ({
                  title: k.title || "Untitled Key Result",
                  // Accept both export field names (targetValue/currentValue) and API names (target/current)
                  target: k.target ?? k.targetValue ?? 100,
                  current: k.current ?? k.currentValue ?? 0,
                  status: k.status || "TODO",
                })),
              },
            },
          });
        }
        result.goals = body.goals.length;
      }

      if (body.auditLogs?.length) {
        await tx.auditLog.createMany({
          data: body.auditLogs.map((a) => ({
            action: a.action || "IMPORT",
            entityType: a.entityType || "UNKNOWN",
            entityId: a.entityId || "",
            details: a.details || "",
            username: a.username || session.user?.name || session.user?.email || "Unknown",
            userId,
          })),
        });
        result.auditLogs = body.auditLogs.length;
      }
    });

    return NextResponse.json({ success: true, imported: result });
  } catch (error) {
    console.error("[import] error:", error);
    return NextResponse.json(
      { success: false, message: "Import failed" },
      { status: 500 }
    );
  }
}
