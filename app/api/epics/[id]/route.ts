import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

interface Params { params: { id: string }; }

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const epic = await prisma.epic.findFirst({
    where: { id: params.id, userId },
    include: { tasks: true, requirements: true },
  });
  if (!epic) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(epic);
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.epic.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    color?: string;
  };

  const epic = await prisma.epic.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      color: body.color,
    },
    include: { tasks: true, requirements: true },
  });

  return NextResponse.json(epic);
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.epic.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prisma schema 使用 onDelete: Cascade，删除 Epic 会级联删除关联的 tasks/requirements
  await prisma.epic.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
