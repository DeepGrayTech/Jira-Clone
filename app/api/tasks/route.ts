import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapTask } from "@/lib/api-mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    include: { comments: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(tasks.map((t) => mapTask(t as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const task = await prisma.task.create({
    data: {
      title: body.title || "Untitled Task",
      description: body.description,
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      dueDate: body.dueDate,
      tags: JSON.stringify(body.tags || []),
      assignee: body.assignee,
      relatedRequirementId: body.relatedRequirementId,
      figmaUrl: body.figmaUrl,
      epicId: body.epicId || null,
      userId: session.user.id,
    },
    include: { comments: true },
  });

  return NextResponse.json(mapTask(task as Record<string, unknown>), { status: 201 });
}
