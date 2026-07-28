import { prisma } from "@/lib/prisma";
import { getFranchiseBalance } from "@/features/quotations/franchise";
import { getSupplierFranchiseBalance } from "@/features/supplier/franchise";
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

export type SupplierDashboardKpis = {
  pendingOpportunities: number;
  proposalsSent: number;
  approved: number;
  rejected: number;
  overdueDocuments: number;
  franchiseRemaining: number | null;
  franchiseLimit: number | null;
  franchiseUsed: number;
  isUnlimited: boolean;
  canSubmitProposal: boolean;
};

export async function getDashboardKpis(input: {
  organizationId: string;
  organizationType: OrganizationType;
}): Promise<DashboardKpis> {
  const franchise = await getFranchiseBalance(input.organizationId);

  const [openQuotations, approved, rejected, proposalsReceived] = await Promise.all([
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "aberta" },
    }),
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "aprovada" },
    }),
    prisma.quotation.count({
      where: { organizationId: input.organizationId, status: "recusada" },
    }),
    prisma.proposal.count({
      where: { quotation: { organizationId: input.organizationId } },
    }),
  ]);

  return {
    openQuotations,
    proposalsReceived,
    approved,
    rejected,
    franchiseRemaining: franchise.remaining,
    franchiseLimit: franchise.limit,
    franchiseUsed: franchise.used,
    isUnlimited: franchise.isUnlimited,
    canCreateQuotation: franchise.canCreate,
  };
}

export async function getSupplierDashboardKpis(
  organizationId: string,
): Promise<SupplierDashboardKpis> {
  const franchise = await getSupplierFranchiseBalance(organizationId);

  const [pendingOpportunities, proposalsSent, approved, rejected, overdueDocuments] =
    await Promise.all([
      prisma.quotationInvite.count({
        where: { supplierOrgId: organizationId, status: "pendente" },
      }),
      prisma.proposal.count({
        where: { organizationId, status: "enviada" },
      }),
      prisma.proposal.count({
        where: { organizationId, status: "aprovada" },
      }),
      prisma.proposal.count({
        where: { organizationId, status: "recusada" },
      }),
      prisma.complianceDocument.count({
        where: { organizationId, status: "em_atraso" },
      }),
    ]);

  return {
    pendingOpportunities,
    proposalsSent,
    approved,
    rejected,
    overdueDocuments,
    franchiseRemaining: franchise.remaining,
    franchiseLimit: franchise.limit,
    franchiseUsed: franchise.used,
    isUnlimited: franchise.isUnlimited,
    canSubmitProposal: franchise.canSubmitProposal,
  };
}
