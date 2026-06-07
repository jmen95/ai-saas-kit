import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// bcrypt hash (cost 12) for the password "demo1234".
const DEMO_PASSWORD_HASH =
  "$2b$12$3mN8G9228KpRiA51Y3UA.u9gPQsl9U/walrNEb36AEwd3/TqsScK.";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: { passwordHash: DEMO_PASSWORD_HASH, name: "Demo User" },
    create: {
      email: "demo@demo.com",
      name: "Demo User",
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: true,
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "demo-workspace" },
    update: { plan: "PRO" },
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      plan: "PRO",
      messagesUsedThisMonth: 12,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId: org.id },
    },
    update: { role: "OWNER" },
    create: { userId: user.id, organizationId: org.id, role: "OWNER" },
  });

  // Replace sample conversations so the seed stays idempotent.
  await prisma.conversation.deleteMany({ where: { organizationId: org.id } });

  await prisma.conversation.create({
    data: {
      title: "Product brainstorming",
      organizationId: org.id,
      messages: {
        create: [
          {
            role: "USER",
            content: "Give me three taglines for an AI note-taking app.",
          },
          {
            role: "ASSISTANT",
            content:
              "1. Think it, we'll keep it.\n2. Your second brain, on autopilot.\n3. Notes that write themselves.",
          },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      title: "Onboarding email",
      organizationId: org.id,
      messages: {
        create: [
          {
            role: "USER",
            content: "Draft a friendly welcome email for new users.",
          },
          {
            role: "ASSISTANT",
            content:
              "Subject: Welcome aboard!\n\nHi there — we're thrilled to have you. Here's how to get started in three quick steps...",
          },
        ],
      },
    },
  });

  console.log("Seeded demo account:");
  console.log("  email:    demo@demo.com");
  console.log("  password: demo1234");
  console.log("  org:      Demo Workspace (PRO)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
