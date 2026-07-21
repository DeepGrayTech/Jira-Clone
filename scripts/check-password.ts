import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
  if (!user) {
    console.log("User not found");
    return;
  }
  const testPasswords = ["demo123", "admin123", "password", "demo"];
  for (const pwd of testPasswords) {
    const ok = await compare(pwd, user.passwordHash);
    console.log(`password "${pwd}" matches: ${ok}`);
  }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
