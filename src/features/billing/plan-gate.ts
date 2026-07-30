import { prisma } from "@/lib/prisma";

export type PlanFeatureKey =
  | "whitelabel"
  | "favorites"
  | "partnerships"
  | "commissions"
  | "sla"
  | "crm"
  | "partnershipEligible";

export type PlanFeatures = Partial<Record<PlanFeatureKey, boolean>> & {
  categoriesIncluded?: number;
  segmentsIncluded?: number;
  allowExtraCategoriesFree?: boolean;
};

export type PlanGateContext = {
  organizationId: string;
  planSlug: string;
  planName: string;
  isFree: boolean;
  monthlyQuota: number | null;
  priceCents: number;
  features: PlanFeatures;
  overrideFeatures: PlanFeatures;
  subscriptionStatus: string;
};

function parseFeatures(json: string | null | undefined): PlanFeatures {
  try {
    return JSON.parse(json || "{}") as PlanFeatures;
  } catch {
    return {};
  }
}

export async function getPlanGate(organizationId: string): Promise<PlanGateContext | null> {
  const [subscription, override] = await Promise.all([
    prisma.subscription.findFirst({
      where: { organizationId, status: { in: ["active", "past_due", "pending"] } },
      include: { plan: true, pendingPlan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.planOverride.findUnique({ where: { organizationId } }),
  ]);

  if (!subscription) return null;

  const planFeatures = parseFeatures(subscription.plan.featuresJson);
  const overrideFeatures = parseFeatures(override?.featuresJson);

  return {
    organizationId,
    planSlug: subscription.plan.slug,
    planName: subscription.plan.name,
    isFree: subscription.plan.isFree,
    monthlyQuota: override?.monthlyQuota ?? subscription.plan.monthlyQuota,
    priceCents: subscription.plan.priceCents,
    features: { ...planFeatures, ...overrideFeatures },
    overrideFeatures,
    subscriptionStatus: subscription.status,
  };
}

export function can(gate: PlanGateContext | null, feature: PlanFeatureKey): boolean {
  if (!gate) return false;
  if (gate.subscriptionStatus !== "active" && gate.subscriptionStatus !== "past_due") {
    // past_due still has features until canceled; pending does not unlock paid features
    if (gate.subscriptionStatus === "pending") return false;
  }
  return Boolean(gate.features[feature]);
}

export function getQuota(gate: PlanGateContext | null): number | null {
  if (!gate) return 0;
  return gate.monthlyQuota;
}

export function getCategoriesIncluded(gate: PlanGateContext | null): number {
  if (!gate) return 1;
  return gate.features.categoriesIncluded ?? (gate.isFree ? 1 : 3);
}

export async function listActivePlans(audience?: "solicitante" | "fornecedor") {
  return prisma.plan.findMany({
    where: {
      isActive: true,
      ...(audience ? { audience } : { audience: { in: ["solicitante", "fornecedor"] } }),
    },
    orderBy: [{ audience: "asc" }, { sortOrder: "asc" }, { priceCents: "asc" }],
  });
}

export { formatPriceCents } from "@/features/billing/money";
