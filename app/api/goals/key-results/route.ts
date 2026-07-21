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
    title?: string;
    target?: number;
    current?: number;
    status?: string;
    goalId?: string;
  };

  if (!body.goalId) {
    return NextResponse.json({ error: "goalId is required" }, { status: 400 });
  }

  const goal = await prisma.goal.findFirst({
    where: { id: body.goalId, userId: session.user.id },
  });
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const keyResult = await prisma.keyResult.create({
    data: {
      title: body.title || "Untitled Key Result",
      target: body.target ?? 100,
      current: body.current ?? 0,
      status: body.status || "TODO",
      goalId: body.goalId,
    },
  });

  return NextResponse.json(keyResult, { status: 201 });
}
