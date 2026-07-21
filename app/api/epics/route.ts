import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const epics = await prisma.epic.findMany({
    where: { userId: session.user.id },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(epics);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    color?: string;
  };

  const { title = "Untitled Epic", description, color = "#3b82f6" } = body;

  const epic = await prisma.epic.create({
    data: {
      title,
      description,
      color,
      userId: session.user.id,
    },
  });

  return NextResponse.json(epic, { status: 201 });
}
