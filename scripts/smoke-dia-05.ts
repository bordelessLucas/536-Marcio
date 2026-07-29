import { prisma } from "../src/lib/prisma";
import { can, getPlanGate } from "../src/features/billing/plan-gate";
import {
  createPlanCheckout,
  fulfillCheckoutPaid,
  createCategoryAddonCheckout,
} from "../src/features/billing/subscriptions";
import { FREE_PARTNERSHIP_MESSAGE } from "../src/features/partnerships/messages";
import { recordCommissionFromApproval } from "../src/features/commissions/actions";

async function main() {
  const plans = await prisma.plan.findMany({ where: { isActive: true } });
  if (plans.length < 8) throw new Error(`Esperado ≥8 planos, got ${plans.length}`);
  const admPago = plans.find((p) => p.slug === "adm-pago");
  if (!admPago) throw new Error("Plano adm-pago ausente");
  console.log(`Catálogo OK: ${plans.length} planos`);

  const sindico = await prisma.organization.findFirst({ where: { type: "sindico" } });
  const sindicoUser = await prisma.user.findFirst({
    where: { email: "sindico@demo.cotacondo.com.br" },
  });
  const adm = await prisma.organization.findFirst({ where: { type: "administradora" } });
  const admUser = await prisma.user.findFirst({
    where: { email: "adm.master@demo.cotacondo.com.br" },
  });
  const fornecedor = await prisma.organization.findFirst({ where: { type: "fornecedor" } });
  const fornecedorPro = await prisma.organization.findFirst({
    where: { id: "org_demo_fornecedor_pro" },
  });
  if (!sindico || !sindicoUser || !adm || !admUser || !fornecedor) {
    throw new Error("Orgs demo ausentes");
  }

  // Bloqueio migração Free
  let blocked = false;
  try {
    await createPlanCheckout({
      organizationId: sindico.id,
      userId: sindicoUser.id,
      planSlug: "adm-free",
      kind: "migration",
    });
  } catch (error) {
    blocked = String(error).includes("Free") || String(error).includes("não é permitida");
  }
  if (!blocked) throw new Error("Migração Free deveria ser bloqueada");
  console.log("Migração Free bloqueada OK");

  // Checkout upgrade sandbox
  const checkout = await createPlanCheckout({
    organizationId: sindico.id,
    userId: sindicoUser.id,
    planSlug: "sindico-pago",
    kind: "plan",
  });
  if (!checkout.checkoutId) throw new Error("Checkout pago deveria criar PaymentCheckout");
  await fulfillCheckoutPaid(checkout.checkoutId, sindicoUser.id);
  const gatePago = await getPlanGate(sindico.id);
  if (gatePago?.planSlug !== "sindico-pago") {
    throw new Error(`Esperado sindico-pago, got ${gatePago?.planSlug}`);
  }
  console.log("Checkout → assinatura ativa OK");

  // Parceria trava Free
  const settings = await prisma.platformSettings.findUniqueOrThrow({ where: { id: "default" } });
  if (!settings.partnershipLockEnabled) {
    await prisma.platformSettings.update({
      where: { id: "default" },
      data: { partnershipLockEnabled: true },
    });
  }

  const freePlan = await prisma.plan.findUniqueOrThrow({ where: { slug: "fornecedor-free" } });
  let features: { partnershipEligible?: boolean } = {};
  try {
    features = JSON.parse(freePlan.featuresJson) as { partnershipEligible?: boolean };
  } catch {
    features = {};
  }
  if (features.partnershipEligible) throw new Error("Free não deveria ser partnershipEligible");
  console.log("Mensagem trava:", FREE_PARTNERSHIP_MESSAGE.slice(0, 60) + "…");

  // Parceria com Pro
  if (fornecedorPro) {
    await prisma.partnership.upsert({
      where: {
        administradoraOrgId_supplierOrgId: {
          administradoraOrgId: adm.id,
          supplierOrgId: fornecedorPro.id,
        },
      },
      update: { status: "active" },
      create: {
        administradoraOrgId: adm.id,
        supplierOrgId: fornecedorPro.id,
        status: "active",
      },
    });
    console.log("Parceria Pro OK");
  }

  // Comissão
  const admGate = await getPlanGate(adm.id);
  if (!can(admGate, "commissions")) throw new Error("Adm Premium deveria ter commissions");

  const agreement = await prisma.commissionAgreement.create({
    data: {
      administradoraOrgId: adm.id,
      supplierOrgId: fornecedor.id,
      feeType: "percent",
      feeValue: 5,
      isRecurring: true,
      createdByUserId: admUser.id,
    },
  });

  const entry = await recordCommissionFromApproval({
    administradoraOrgId: adm.id,
    supplierOrgId: fornecedor.id,
    quotationId: "smoke-quotation",
    proposalId: "smoke-proposal",
    conditionId: "smoke-condition",
    volumeCents: 100000,
  });
  if (!entry || entry.commissionCents !== 5000) {
    throw new Error(`Comissão esperada 5000, got ${entry?.commissionCents}`);
  }
  console.log("Ledger comissão OK:", entry.commissionCents);

  // Addon categorias (fornecedor pago)
  const proOrg = await prisma.organization.findUnique({
    where: { id: "org_demo_fornecedor_pro" },
  });
  if (!proOrg) throw new Error("org_demo_fornecedor_pro ausente");

  const existingCats = await prisma.organizationCategory.findMany({
    where: { organizationId: proOrg.id },
    select: { categoryId: true },
  });
  const existingIds = new Set(existingCats.map((c) => c.categoryId));
  const addonCategory = await prisma.serviceCategory.findFirst({
    where: { deletedAt: null, isActive: true, id: { notIn: [...existingIds] } },
  });
  if (!addonCategory) throw new Error("Sem categoria disponível para addon");

  const addon = await createCategoryAddonCheckout({
    organizationId: proOrg.id,
    userId: admUser.id,
    quantity: 1,
    categoryIds: [addonCategory.id],
  });
  await fulfillCheckoutPaid(addon.checkoutId, admUser.id);
  const link = await prisma.organizationCategory.findFirst({
    where: { organizationId: proOrg.id, categoryId: addonCategory.id, isAddon: true },
  });
  if (!link) throw new Error("Addon de categoria não persistiu");
  console.log("Addon categoria OK:", addon.total);

  // PlanGate features
  if (!can(admGate, "partnerships") || !can(admGate, "favorites")) {
    throw new Error("PlanGate Premium incompleto");
  }
  console.log("PlanGate Premium OK");

  await prisma.commissionAgreement.delete({ where: { id: agreement.id } }).catch(() => undefined);

  console.log("SMOKE DIA 5 OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
