import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapRequirement } from "@/lib/api-mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requirements = await prisma.requirement.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(requirements.map((r) => mapRequirement(r as Record<string, unknown>)));
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
    acceptanceCriteria?: string[];
    requester?: string;
    executor?: string;
    epicId?: string;
  };

  const requirement = await prisma.requirement.create({
    data: {
      title: body.title || "Untitled Requirement",
      description: body.description,
      status: body.status || "DRAFT",
      priority: body.priority || "MEDIUM",
      dueDate: body.dueDate,
      acceptanceCriteria: JSON.stringify(body.acceptanceCriteria || []),
      requester: body.requester,
      executor: body.executor,
      epicId: body.epicId || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(mapRequirement(requirement as Record<string, unknown>), { status: 201 });
}
