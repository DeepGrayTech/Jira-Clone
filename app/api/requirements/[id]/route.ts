import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapRequirement } from "@/lib/api-mappers";

interface Params { params: { id: string }; }

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requirement = await prisma.requirement.findFirst({
    where: { id: params.id, userId },
  });
  if (!requirement) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapRequirement(requirement as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.requirement.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    acceptanceCriteria?: string[];
    requester?: string;
    executor?: string;
    epicId?: string;
  };

  const requirement = await prisma.requirement.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate,
      acceptanceCriteria: body.acceptanceCriteria !== undefined ? JSON.stringify(body.acceptanceCriteria) : undefined,
      requester: body.requester,
      executor: body.executor,
      epicId: body.epicId,
    },
  });

  return NextResponse.json(mapRequirement(requirement as Record<string, unknown>));
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.requirement.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.requirement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
