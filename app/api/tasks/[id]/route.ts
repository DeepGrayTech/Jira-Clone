import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapTask } from "@/lib/api-mappers";

interface Params {
  params: { id: string };
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user.id : null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { comments: true },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTask(task as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    tags?: string[];
    assignee?: string;
    relatedRequirementId?: string;
    figmaUrl?: string;
    epicId?: string;
  };

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate,
      tags: body.tags !== undefined ? JSON.stringify(body.tags) : undefined,
      assignee: body.assignee,
      relatedRequirementId: body.relatedRequirementId,
      figmaUrl: body.figmaUrl,
      epicId: body.epicId,
    },
    include: { comments: true },
  });

  return NextResponse.json(mapTask(task as Record<string, unknown>));
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getSessionUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
