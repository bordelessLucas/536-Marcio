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

  const passwordHash = await bcrypt.hash("123456", 12);

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

  const segurosCategory = await prisma.serviceCategory.findUnique({
    where: { slug: "seguros" },
  });
  if (segurosCategory) {
    await prisma.organizationCategory.upsert({
      where: {
        organizationId_categoryId: {
          organizationId: fornecedorOrg.id,
          categoryId: segurosCategory.id,
        },
      },
      update: { isIncluded: true },
      create: {
        organizationId: fornecedorOrg.id,
        categoryId: segurosCategory.id,
        isIncluded: true,
      },
    });
  }

  // Fornecedores extras para o motor de distribuição (Dia 4)
  const fornecedorPro = await prisma.organization.upsert({
    where: { id: "org_demo_fornecedor_pro" },
    update: { name: "Seguros Pro Compliant LTDA", type: OrganizationType.fornecedor },
    create: {
      id: "org_demo_fornecedor_pro",
      name: "Seguros Pro Compliant LTDA",
      type: OrganizationType.fornecedor,
      document: "12345678000199",
    },
  });
  const fornecedorPending = await prisma.organization.upsert({
    where: { id: "org_demo_fornecedor_pending" },
    update: { name: "Seguros Pending Docs LTDA", type: OrganizationType.fornecedor },
    create: {
      id: "org_demo_fornecedor_pending",
      name: "Seguros Pending Docs LTDA",
      type: OrganizationType.fornecedor,
      document: "98765432000111",
    },
  });

  await ensureActiveSubscription(fornecedorPro.id, "fornecedor-pro");
  await ensureActiveSubscription(fornecedorPending.id, "fornecedor-pro");

  if (segurosCategory) {
    for (const orgId of [fornecedorPro.id, fornecedorPending.id]) {
      await prisma.organizationCategory.upsert({
        where: {
          organizationId_categoryId: { organizationId: orgId, categoryId: segurosCategory.id },
        },
        update: { isIncluded: true },
        create: { organizationId: orgId, categoryId: segurosCategory.id, isIncluded: true },
      });
    }

    await prisma.complianceDocument.deleteMany({
      where: { organizationId: { in: [fornecedorPro.id, fornecedorPending.id] } },
    });
    await prisma.complianceDocument.create({
      data: {
        organizationId: fornecedorPro.id,
        documentType: "Certidão Negativa Federal",
        fileName: "cnd-pro.pdf",
        storagePath: "local://uploads/cnd-pro.pdf",
        validUntil: new Date(Date.now() + 180 * 86400000),
        status: "aprovado",
      },
    });
    await prisma.complianceDocument.create({
      data: {
        organizationId: fornecedorPending.id,
        documentType: "Certidão Negativa Federal",
        fileName: "cnd-pending.pdf",
        storagePath: "local://uploads/cnd-pending.pdf",
        validUntil: new Date(Date.now() + 180 * 86400000),
        status: "em_analise",
      },
    });

    await prisma.favoriteSupplier.upsert({
      where: {
        organizationId_supplierOrgId: {
          organizationId: admOrg.id,
          supplierOrgId: fornecedorPro.id,
        },
      },
      update: { categoryId: segurosCategory.id },
      create: {
        organizationId: admOrg.id,
        supplierOrgId: fornecedorPro.id,
        categoryId: segurosCategory.id,
      },
    });
  }

  const condo = await prisma.condominium.upsert({
    where: { id: "condo_demo_sol" },
    update: {
      name: "Residencial Sol Demo",
      address: "Rua das Palmeiras, 100 — São Paulo/SP",
      organizationId: sindicoOrg.id,
      archivedAt: null,
    },
    create: {
      id: "condo_demo_sol",
      organizationId: sindicoOrg.id,
      name: "Residencial Sol Demo",
      address: "Rua das Palmeiras, 100 — São Paulo/SP",
      document: "11222333000181",
      contactName: "Síndico Demo",
      contactEmail: "sindico@demo.cotacondo.com.br",
    },
  });

  const serviceItem = segurosCategory
    ? await prisma.serviceItem.findFirst({
        where: { categoryId: segurosCategory.id, deletedAt: null, isActive: true },
        orderBy: { sortOrder: "asc" },
      })
    : null;

  if (segurosCategory && serviceItem) {
    const quotation = await prisma.quotation.upsert({
      where: { publicId: "COT-DEMO-000001" },
      update: {
        description: "Cotação demo para oportunidades do fornecedor (Dia 3).",
        status: "aberta",
      },
      create: {
        publicId: "COT-DEMO-000001",
        organizationId: sindicoOrg.id,
        condominiumId: condo.id,
        categoryId: segurosCategory.id,
        serviceItemId: serviceItem.id,
        urgency: "media",
        description: "Cotação demo para oportunidades do fornecedor (Dia 3).",
        minProposals: 3,
        maxProposals: 10,
        status: "aberta",
        createdByUserId: (
          await prisma.user.findUniqueOrThrow({
            where: { email: "sindico@demo.cotacondo.com.br" },
          })
        ).id,
      },
    });

    await prisma.quotationInvite.upsert({
      where: {
        quotationId_supplierOrgId: {
          quotationId: quotation.id,
          supplierOrgId: fornecedorOrg.id,
        },
      },
      update: { status: "pendente", declineReason: null, declinedAt: null },
      create: {
        quotationId: quotation.id,
        supplierOrgId: fornecedorOrg.id,
        status: "pendente",
      },
    });

    const quotation2 = await prisma.quotation.upsert({
      where: { publicId: "COT-DEMO-000002" },
      update: {
        description: "Segunda oportunidade demo (Kanban).",
        status: "aberta",
      },
      create: {
        publicId: "COT-DEMO-000002",
        organizationId: sindicoOrg.id,
        condominiumId: condo.id,
        categoryId: segurosCategory.id,
        serviceItemId: serviceItem.id,
        urgency: "alta",
        description: "Segunda oportunidade demo (Kanban).",
        minProposals: 2,
        maxProposals: 8,
        status: "aberta",
        createdByUserId: (
          await prisma.user.findUniqueOrThrow({
            where: { email: "sindico@demo.cotacondo.com.br" },
          })
        ).id,
      },
    });

    await prisma.quotationInvite.upsert({
      where: {
        quotationId_supplierOrgId: {
          quotationId: quotation2.id,
          supplierOrgId: fornecedorOrg.id,
        },
      },
      update: { status: "pendente", declineReason: null, declinedAt: null },
      create: {
        quotationId: quotation2.id,
        supplierOrgId: fornecedorOrg.id,
        status: "pendente",
      },
    });
  }

  console.log("Seed concluído. Senha das contas demo: 123456");
  for (const demo of demos) {
    console.log(` - ${demo.email}`);
  }
  console.log("Sincronize o Firebase Auth com: npm run seed:firebase-auth");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
