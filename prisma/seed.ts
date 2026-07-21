import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });
  if (existingAdmin) {
    console.log("Admin user already exists. Skipping.");
  } else {
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        username: "admin",
        passwordHash: await hash("admin123", 10),
        role: "ADMIN",
      },
    });
    console.log(`Created admin user: ${adminUser.email} (${adminUser.id})`);
  }

  const existing = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });
  if (existing) {
    console.log("Demo user already exists. Skipping seed.");
    return;
  }

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@example.com",
      username: "demo",
      passwordHash: await hash("demo123", 10),
      role: "USER",
    },
  });
  console.log(`Created demo user: ${demoUser.email} (${demoUser.id})`);

  // Seed demo data for the new demo user
  const userId = demoUser.id;

  const epic = await prisma.epic.create({
    data: {
      title: "🚀 V1.0 产品发布",
      description: "包含核心需求、测试和缺陷修复的初始版本目标。",
      color: "#3b82f6",
      userId,
    },
  });

  const task = await prisma.task.create({
    data: {
      title: "设计登录页面",
      description: "完成登录/注册页的高保真设计稿并输出切图。",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: "2026-08-15",
      tags: JSON.stringify(["UI", "设计", "登录"]),
      assignee: "设计师 A",
      epicId: epic.id,
      userId,
    },
  });

  await prisma.task.create({
    data: {
      title: "实现 NextAuth 认证",
      description: "接入 CredentialsProvider 并配置 JWT session。",
      status: "TODO",
      priority: "HIGH",
      dueDate: "2026-08-20",
      tags: JSON.stringify(["后端", "认证", "NextAuth"]),
      assignee: "后端 B",
      userId,
    },
  });

  const requirement = await prisma.requirement.create({
    data: {
      title: "用户可以通过邮箱注册账号",
      description: "注册时需要校验邮箱格式和唯一性，并返回友好的错误提示。",
      status: "REVIEW",
      priority: "HIGH",
      dueDate: "2026-08-18",
      acceptanceCriteria: JSON.stringify([
        "邮箱格式校验正确",
        "重复邮箱返回 409 错误",
        "注册成功后自动跳转到登录页",
      ]),
      requester: "产品经理",
      executor: "后端 B",
      epicId: epic.id,
      userId,
    },
  });

  await prisma.testCase.create({
    data: {
      title: "注册接口：邮箱重复场景",
      description: "使用已注册邮箱调用 /api/auth/register 应返回 409。",
      status: "TODO",
      steps: JSON.stringify([
        "调用 POST /api/auth/register 注册 demo@example.com",
        "再次调用同一接口",
      ]),
      expectedResult: "第二次请求返回 { error: \"User already exists\" } 与状态码 409",
      relatedRequirementId: requirement.id,
      userId,
    },
  });

  await prisma.bug.create({
    data: {
      title: "登录页在低分辨率下按钮错位",
      description: "在 1366x768 分辨率下，登录按钮超出卡片边界。",
      severity: "MEDIUM",
      priority: "MEDIUM",
      stepsToReproduce: JSON.stringify([
        "打开登录页",
        "将浏览器窗口调整为 1366x768",
      ]),
      expectedBehavior: "按钮保持在卡片内部",
      actualBehavior: "按钮右侧超出卡片",
      userId,
    },
  });

  const goal = await prisma.goal.create({
    data: {
      title: "Q3 提升交付效率",
      description: "通过流程优化和工具落地，减少需求交付周期。",
      status: "ON_TRACK",
      userId,
    },
  });

  await prisma.milestone.create({
    data: {
      title: "完成认证模块",
      dueDate: "2026-08-30",
      status: "TODO",
      goalId: goal.id,
    },
  });

  await prisma.keyResult.create({
    data: {
      title: "需求平均交付天数从 10 天降至 7 天",
      target: 7,
      current: 10,
      status: "ON_TRACK",
      goalId: goal.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "设计稿已更新，请确认切图规范。",
      taskId: task.id,
      author: "设计师 A",
      userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SEED",
      entityType: "SYSTEM",
      entityId: "system",
      details: "Demo user seeded with sample project data",
      username: "system",
      userId,
    },
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
