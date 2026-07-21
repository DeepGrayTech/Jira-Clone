import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapBug } from "@/lib/api-mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bugs = await prisma.bug.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(bugs.map((b) => mapBug(b as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    severity?: string;
    priority?: string;
    status?: string;
    stepsToReproduce?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    reporter?: string;
    assignee?: string;
    verifier?: string;
    relatedTaskId?: string;
    relatedRequirementId?: string;
    comments?: unknown[];
    attachments?: string[];
    epicId?: string;
  };

  const bug = await prisma.bug.create({
    data: {
      title: body.title || "Untitled Bug",
      description: body.description,
      severity: body.severity || "MEDIUM",
      priority: body.priority || "MEDIUM",
      status: body.status || "REPORTED",
      stepsToReproduce: JSON.stringify(body.stepsToReproduce || []),
      expectedBehavior: body.expectedBehavior,
      actualBehavior: body.actualBehavior,
      reporter: body.reporter || null,
      assignee: body.assignee || null,
      verifier: body.verifier || null,
      relatedTaskId: body.relatedTaskId || null,
      relatedRequirementId: body.relatedRequirementId || null,
      comments: JSON.stringify(body.comments || []),
      attachments: JSON.stringify(body.attachments || []),
      epicId: body.epicId || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(mapBug(bug as Record<string, unknown>), { status: 201 });
}
