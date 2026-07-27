import { prisma } from "@/lib/prisma";
import { getFranchiseBalance } from "@/features/quotations/franchise";
import type { OrganizationType } from "@prisma/client";

export type DashboardKpis = {
  openQuotations: number;
  proposalsReceived: number;
  approved: number;
  rejected: number;
  franchiseRemaining: number | null;
  franchiseLimit: number | null;
  franchiseUsed: number;
  isUnlimited: boolean;
  canCreateQuotation: boolean;
};

export async function getDashboardKpis(input: {
  organizationId: string;
  organizationType: OrganizationType;
}): Promise<DashboardKpis> {
  const franchise = await getFranchiseBalance(input.organizationId);

  const [openQuotations, approved, rejected] = await Promise.all([
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "aberta" },
    }),
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "aprovada" },
    }),
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "recusada" },
    }),
  ]);

  // Propostas entram no Dia 3 — placeholder zero por enquanto.
  return {
    openQuotations,
    proposalsReceived: 0,
    approved,
    rejected,
    franchiseRemaining: franchise.remaining,
    franchiseLimit: franchise.limit,
    franchiseUsed: franchise.used,
    isUnlimited: franchise.isUnlimited,
    canCreateQuotation: franchise.canCreate,
  };
}
