import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapTestCase } from "@/lib/api-mappers";

interface Params { params: { id: string }; }

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const testCase = await prisma.testCase.findFirst({
    where: { id: params.id, userId },
  });
  if (!testCase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapTestCase(testCase as Record<string, unknown>));
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.testCase.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    status?: string;
    steps?: string[];
    expectedResult?: string;
    relatedRequirementId?: string;
    epicId?: string | null;
  };

  const testCase = await prisma.testCase.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      status: body.status,
      steps: body.steps !== undefined ? JSON.stringify(body.steps) : undefined,
      expectedResult: body.expectedResult,
      relatedRequirementId: body.relatedRequirementId,
      epicId: body.epicId,
    },
  });

  return NextResponse.json(mapTestCase(testCase as Record<string, unknown>));
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.testCase.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.testCase.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
