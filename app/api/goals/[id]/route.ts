import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapGoal } from "@/lib/api-mappers";

interface Params { params: { id: string }; }

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await prisma.goal.findFirst({
    where: { id: params.id, userId },
    include: { milestones: true, keyResults: true },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapGoal(goal as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    status?: string;
  };

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
    },
    include: { milestones: true, keyResults: true },
  });

  return NextResponse.json(mapGoal(goal as Record<string, unknown>));
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
