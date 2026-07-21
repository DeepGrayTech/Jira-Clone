import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.auditLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    username?: string;
  };

  const auditLog = await prisma.auditLog.create({
    data: {
      action: body.action,
      entityType: body.entityType,
      entityId: body.entityId,
      details: body.details,
      username: body.username || session.user.name || session.user.email || "Unknown",
      userId: session.user.id,
    },
  });

  return NextResponse.json(auditLog, { status: 201 });
}
