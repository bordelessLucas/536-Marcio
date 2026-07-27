import {
  MemberRole,
  OrganizationType,
  PlanAudience,
  PrismaClient,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      passwordHash: input.passwordHash,
      emailVerifiedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      emailVerifiedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
  });
}

async function ensureOrgMembership(input: {
  userId: string;
  organizationId: string;
  role: MemberRole;
}) {
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: input.userId,
        organizationId: input.organizationId,
      },
    },
    update: { role: input.role },
    create: {
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
    },
  });
}

async function ensureActiveSubscription(organizationId: string, planSlug: string) {
  const plan = await prisma.plan.findUniqueOrThrow({ where: { slug: planSlug } });
  const existing = await prisma.subscription.findFirst({
    where: { organizationId, status: "active" },
  });
  if (!existing) {
    await prisma.subscription.create({
      data: { organizationId, planId: plan.id, status: "active" },
    });
  }
}

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {
      freeQuotaSolicitante: 15,
      freeQuotaFornecedor: 1,
      reminderDaysJson: "[5,10]",
      partnershipLockEnabled: true,
    },
    create: {
      id: "default",
      freeQuotaSolicitante: 15,
      freeQuotaFornecedor: 1,
      reminderDaysJson: "[5,10]",
      partnershipLockEnabled: true,
    },
  });

  await prisma.marketingSettings.upsert({
    where: { id: "default" },
    update: {
      whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/5500000000000",
      blogUrl: process.env.NEXT_PUBLIC_BLOG_URL ?? "https://blog.cotacondo.com.br",
    },
    create: {
      id: "default",
      whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/5500000000000",
      blogUrl: process.env.NEXT_PUBLIC_BLOG_URL ?? "https://blog.cotacondo.com.br",
    },
  });

  const plans = [
    {
      slug: "sindico-free",
      name: "Síndico Free",
      audience: PlanAudience.solicitante,
      isFree: true,
      monthlyQuota: 15,
      priceCents: 0,
      featuresJson: JSON.stringify({ whitelabel: false }),
    },
    {
      slug: "sindico-pago",
      name: "Síndico Pago",
      audience: PlanAudience.solicitante,
      isFree: false,
      monthlyQuota: 50,
      priceCents: 9900,
      featuresJson: JSON.stringify({ whitelabel: true }),
    },
    {
      slug: "adm-free",
      name: "Administradora Free",
      audience: PlanAudience.solicitante,
      isFree: true,
      monthlyQuota: 15,
      priceCents: 0,
      featuresJson: JSON.stringify({ whitelabel: true, partnerships: false }),
    },
    {
      slug: "adm-premium",
      name: "Administradora Premium",
      audience: PlanAudience.solicitante,
      isFree: false,
      monthlyQuota: null,
      priceCents: 29900,
      featuresJson: JSON.stringify({
        whitelabel: true,
        partnerships: true,
        favorites: true,
        commissions: true,
        sla: true,
      }),
    },
    {
      slug: "fornecedor-free",
      name: "Fornecedor Free",
      audience: PlanAudience.fornecedor,
      isFree: true,
      monthlyQuota: 1,
      priceCents: 0,
      featuresJson: JSON.stringify({ categoriesIncluded: 1, crm: false }),
    },
    {
      slug: "fornecedor-pro",
      name: "Fornecedor Intermediário",
      audience: PlanAudience.fornecedor,
      isFree: false,
      monthlyQuota: 30,
      priceCents: 14900,
      featuresJson: JSON.stringify({ categoriesIncluded: 3, partnershipEligible: true }),
    },
    {
      slug: "fornecedor-premium",
      name: "Fornecedor Premium",
      audience: PlanAudience.fornecedor,
      isFree: false,
      monthlyQuota: null,
      priceCents: 24900,
      featuresJson: JSON.stringify({ categoriesIncluded: 10, crm: true, partnershipEligible: true }),
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  const passwordHash = await bcrypt.hash("Demo@123456", 12);

  const platformOrg = await prisma.organization.upsert({
    where: { id: "org_platform_master" },
    update: { name: "CotaCondo Plataforma", type: OrganizationType.master_admin },
    create: {
      id: "org_platform_master",
      name: "CotaCondo Plataforma",
      type: OrganizationType.master_admin,
    },
  });

  const sindicoOrg = await prisma.organization.upsert({
    where: { id: "org_demo_sindico" },
    update: { name: "Condomínio Demo Sol", type: OrganizationType.sindico },
    create: {
      id: "org_demo_sindico",
      name: "Condomínio Demo Sol",
      type: OrganizationType.sindico,
    },
  });

  const fornecedorOrg = await prisma.organization.upsert({
    where: { id: "org_demo_fornecedor" },
    update: { name: "Serviços Prediais Demo LTDA", type: OrganizationType.fornecedor },
    create: {
      id: "org_demo_fornecedor",
      name: "Serviços Prediais Demo LTDA",
      type: OrganizationType.fornecedor,
    },
  });

  const admOrg = await prisma.organization.upsert({
    where: { id: "org_demo_adm" },
    update: { name: "Administradora Premium Demo", type: OrganizationType.administradora },
    create: {
      id: "org_demo_adm",
      name: "Administradora Premium Demo",
      type: OrganizationType.administradora,
    },
  });

  const demos = [
    {
      email: "admin@cotacondo.com.br",
      name: "Master Admin",
      organizationId: platformOrg.id,
      role: MemberRole.master,
      planSlug: "sindico-free",
    },
    {
      email: "sindico@demo.cotacondo.com.br",
      name: "Síndico Demo",
      organizationId: sindicoOrg.id,
      role: MemberRole.master,
      planSlug: "sindico-free",
    },
    {
      email: "fornecedor@demo.cotacondo.com.br",
      name: "Fornecedor Demo",
      organizationId: fornecedorOrg.id,
      role: MemberRole.master,
      planSlug: "fornecedor-free",
    },
    {
      email: "adm.master@demo.cotacondo.com.br",
      name: "Adm Master Demo",
      organizationId: admOrg.id,
      role: MemberRole.master,
      planSlug: "adm-premium",
    },
    {
      email: "adm.operacional@demo.cotacondo.com.br",
      name: "Adm Operacional Demo",
      organizationId: admOrg.id,
      role: MemberRole.operational,
      planSlug: "adm-premium",
    },
  ] as const;

  for (const demo of demos) {
    const user = await upsertUser({
      email: demo.email,
      name: demo.name,
      passwordHash,
    });
    await ensureOrgMembership({
      userId: user.id,
      organizationId: demo.organizationId,
      role: demo.role,
    });
    await ensureActiveSubscription(demo.organizationId, demo.planSlug);

    const existingConsent = await prisma.consentRecord.findFirst({
      where: { userId: user.id, type: "privacy_policy" },
    });
    if (!existingConsent) {
      await prisma.consentRecord.create({
        data: {
          userId: user.id,
          type: "privacy_policy",
          accepted: true,
        },
      });
    }
  }

  const { seedOfficialCatalog } = await import("../src/features/catalog/seed");
  const catalog = await seedOfficialCatalog();
  console.log(`Catálogo seed: ${catalog.categoryCount} categorias / ${catalog.itemCount} serviços`);

  console.log("Seed concluído. Senha das contas demo: Demo@123456");
  for (const demo of demos) {
    console.log(` - ${demo.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
