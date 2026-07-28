import { prisma } from "@/lib/prisma";
import { currentYearMonth } from "@/features/quotations/franchise";

export type SupplierFranchiseBalance = {
  yearMonth: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  isUnlimited: boolean;
  canSubmitProposal: boolean;
};

function resolveLimit(input: {
  overrideQuota: number | null | undefined;
  hasOverride: boolean;
  planQuota: number | null | undefined;
  globalFreeQuota: number | null | undefined;
}): number | null {
  if (input.hasOverride) {
    return input.overrideQuota ?? null;
  }
  if (input.planQuota !== undefined) {
    return input.planQuota;
  }
  return input.globalFreeQuota ?? 1;
}

async function loadContext(organizationId: string, yearMonth: string) {
  const [settings, override, subscription, usage] = await Promise.all([
    prisma.platformSettings.findUnique({ where: { id: "default" } }),
    prisma.planOverride.findUnique({ where: { organizationId } }),
    prisma.subscription.findFirst({
      where: { organizationId, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.franchiseUsage.findUnique({
      where: { organizationId_yearMonth: { organizationId, yearMonth } },
    }),
  ]);

  const limit = resolveLimit({
    hasOverride: Boolean(override),
    overrideQuota: override?.monthlyQuota,
    planQuota: subscription ? subscription.plan.monthlyQuota : undefined,
    globalFreeQuota: settings?.freeQuotaFornecedor,
  });

  return { limit, used: usage?.usedCount ?? 0, subscription, settings, override };
}

function toBalance(yearMonth: string, limit: number | null, used: number): SupplierFranchiseBalance {
  const isUnlimited = limit === null;
  const remaining = isUnlimited ? null : Math.max(limit - used, 0);
  return {
    yearMonth,
    limit,
    used,
    remaining,
    isUnlimited,
    canSubmitProposal: isUnlimited || (remaining ?? 0) > 0,
  };
}

export async function getSupplierFranchiseBalance(
  organizationId: string,
): Promise<SupplierFranchiseBalance> {
  const yearMonth = currentYearMonth();
  const { limit, used } = await loadContext(organizationId, yearMonth);
  return toBalance(yearMonth, limit, used);
}

export type SupplierPlanInfo = {
  planName: string;
  planSlug: string;
  isFree: boolean;
  monthlyQuota: number | null;
  categoriesIncluded: number;
  categoryIds: string[];
  categories: Array<{ id: string; name: string; slug: string; isIncluded: boolean }>;
  franchise: SupplierFranchiseBalance;
  priceCents: number;
};

export async function getSupplierPlanInfo(organizationId: string): Promise<SupplierPlanInfo> {
  const yearMonth = currentYearMonth();
  const { limit, used, subscription } = await loadContext(organizationId, yearMonth);
  const franchise = toBalance(yearMonth, limit, used);

  const plan = subscription?.plan;
  let features: { categoriesIncluded?: number } = {};
  try {
    features = JSON.parse(plan?.featuresJson ?? "{}") as { categoriesIncluded?: number };
  } catch {
    features = {};
  }

  const links = await prisma.organizationCategory.findMany({
    where: { organizationId },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    planName: plan?.name ?? "Fornecedor Free",
    planSlug: plan?.slug ?? "fornecedor-free",
    isFree: plan?.isFree ?? true,
    monthlyQuota: limit,
    categoriesIncluded: features.categoriesIncluded ?? 1,
    categoryIds: links.map((link) => link.categoryId),
    categories: links.map((link) => ({
      id: link.category.id,
      name: link.category.name,
      slug: link.category.slug,
      isIncluded: link.isIncluded,
    })),
    franchise,
    priceCents: plan?.priceCents ?? 0,
  };
}

export async function assertSupplierCanAccessCategory(
  organizationId: string,
  categoryId: string,
): Promise<void> {
  const link = await prisma.organizationCategory.findUnique({
    where: {
      organizationId_categoryId: { organizationId, categoryId },
    },
  });
  if (!link) {
    throw new Error("CATEGORY_NOT_IN_PLAN");
  }
}

export async function consumeSupplierFranchiseInTx(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  organizationId: string,
): Promise<void> {
  const yearMonth = currentYearMonth();
  const [settings, override, subscription, usage] = await Promise.all([
    tx.platformSettings.findUnique({ where: { id: "default" } }),
    tx.planOverride.findUnique({ where: { organizationId } }),
    tx.subscription.findFirst({
      where: { organizationId, status: "active" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    tx.franchiseUsage.findUnique({
      where: { organizationId_yearMonth: { organizationId, yearMonth } },
    }),
  ]);

  const limit = resolveLimit({
    hasOverride: Boolean(override),
    overrideQuota: override?.monthlyQuota,
    planQuota: subscription ? subscription.plan.monthlyQuota : undefined,
    globalFreeQuota: settings?.freeQuotaFornecedor,
  });

  const used = usage?.usedCount ?? 0;
  if (limit !== null && used >= limit) {
    throw new Error("SUPPLIER_FRANCHISE_EXHAUSTED");
  }

  await tx.franchiseUsage.upsert({
    where: { organizationId_yearMonth: { organizationId, yearMonth } },
    create: { organizationId, yearMonth, usedCount: 1 },
    update: { usedCount: { increment: 1 } },
  });
}
