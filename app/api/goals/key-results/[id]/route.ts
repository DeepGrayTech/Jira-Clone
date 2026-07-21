import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapKeyResult } from "@/lib/api-mappers";

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
    target?: number;
    current?: number;
    status?: string;
  };

  const keyResult = await prisma.keyResult.findFirst({
    where: { id, goal: { userId: session.user.id } },
  });
  if (!keyResult) {
    return NextResponse.json({ error: "KeyResult not found" }, { status: 404 });
  }

  const updated = await prisma.keyResult.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.target !== undefined && { target: body.target }),
      ...(body.current !== undefined && { current: body.current }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(mapKeyResult(updated as Record<string, unknown>));
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
  const keyResult = await prisma.keyResult.findFirst({
    where: { id, goal: { userId: session.user.id } },
  });
  if (!keyResult) {
    return NextResponse.json({ error: "KeyResult not found" }, { status: 404 });
  }

  await prisma.keyResult.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
