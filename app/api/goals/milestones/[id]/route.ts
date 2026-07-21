import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapMilestone } from "@/lib/api-mappers";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = (await request.json()) as {
    title?: string;
    dueDate?: string;
    status?: string;
  };

  const milestone = await prisma.milestone.findFirst({
    where: { id, goal: { userId: session.user.id } },
  });
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(mapMilestone(updated as Record<string, unknown>));
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const milestone = await prisma.milestone.findFirst({
    where: { id, goal: { userId: session.user.id } },
  });
  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  await prisma.milestone.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
