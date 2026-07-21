import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { mapTestCase } from "@/lib/api-mappers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testCases = await prisma.testCase.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(testCases.map((tc) => mapTestCase(tc as Record<string, unknown>)));
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
    steps?: string[];
    expectedResult?: string;
    relatedRequirementId?: string;
  };

  const testCase = await prisma.testCase.create({
    data: {
      title: body.title || "Untitled Test Case",
      description: body.description,
      status: body.status || "PENDING",
      steps: JSON.stringify(body.steps || []),
      expectedResult: body.expectedResult,
      relatedRequirementId: body.relatedRequirementId,
      userId: session.user.id,
    },
  });

  return NextResponse.json(mapTestCase(testCase as Record<string, unknown>), { status: 201 });
}
