import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapGoal } from "@/lib/api-mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { milestones: true, keyResults: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(goals.map((g) => mapGoal(g as Record<string, unknown>)));
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
  };

  const goal = await prisma.goal.create({
    data: {
      title: body.title || "Untitled Goal",
      description: body.description,
      status: body.status || "NOT_STARTED",
      userId: session.user.id,
    },
    include: { milestones: true, keyResults: true },
  });

  return NextResponse.json(mapGoal(goal as Record<string, unknown>), { status: 201 });
}
