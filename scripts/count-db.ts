import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const counts = {
    user: await prisma.user.count(),
    epic: await prisma.epic.count(),
    task: await prisma.task.count(),
    requirement: await prisma.requirement.count(),
    testCase: await prisma.testCase.count(),
    bug: await prisma.bug.count(),
    goal: await prisma.goal.count(),
    milestone: await prisma.milestone.count(),
    keyResult: await prisma.keyResult.count(),
    comment: await prisma.comment.count(),
    auditLog: await prisma.auditLog.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
