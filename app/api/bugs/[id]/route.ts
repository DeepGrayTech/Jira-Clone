import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapBug } from "@/lib/api-mappers";

interface Params { params: { id: string }; }

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bug = await prisma.bug.findFirst({
    where: { id: params.id, userId },
  });
  if (!bug) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapBug(bug as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.bug.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    resolution?: string;
    resolvedAt?: string;
    verifiedAt?: string;
    comments?: unknown[];
    attachments?: string[];
    epicId?: string | null;
  };

  const bug = await prisma.bug.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      severity: body.severity,
      priority: body.priority,
      status: body.status,
      stepsToReproduce: body.stepsToReproduce !== undefined ? JSON.stringify(body.stepsToReproduce) : undefined,
      expectedBehavior: body.expectedBehavior,
      actualBehavior: body.actualBehavior,
      reporter: body.reporter,
      assignee: body.assignee,
      verifier: body.verifier,
      relatedTaskId: body.relatedTaskId,
      relatedRequirementId: body.relatedRequirementId,
      resolution: body.resolution,
      resolvedAt: body.resolvedAt,
      verifiedAt: body.verifiedAt,
      comments: body.comments !== undefined ? JSON.stringify(body.comments) : undefined,
      attachments: body.attachments !== undefined ? JSON.stringify(body.attachments) : undefined,
      epicId: body.epicId,
    },
  });

  return NextResponse.json(mapBug(bug as Record<string, unknown>));
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.bug.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bug.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
