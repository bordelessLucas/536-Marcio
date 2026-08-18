import { MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function requireExternalApprover() {
  const session = await requireAuthorizedSession({
    roles: [MemberRole.external_approver],
  });
  return session;
}

export async function getExternalApproverCondominiumIds(userId: string, organizationId: string) {
  const scopes = await prisma.externalApproverScope.findMany({
    where: { userId, organizationId },
    select: { condominiumId: true },
  });
  return scopes.map((scope) => scope.condominiumId);
}

export async function getExternalApproverQuotationOrThrow(
  userId: string,
  organizationId: string,
  quotationId: string,
) {
  const condominiumIds = await getExternalApproverCondominiumIds(userId, organizationId);
  if (condominiumIds.length === 0) {
    throw new Error("Sem condomínios vinculados.");
  }

  const quotation = await prisma.quotation.findFirst({
    where: {
      id: quotationId,
      organizationId,
      condominiumId: { in: condominiumIds },
      serviceClientId: { not: null },
      masterAcceptedAt: { not: null },
      rifVisibleToClient: true,
    },
    include: { externalApproval: true },
  });

  if (!quotation) {
    throw new Error("Cotação não encontrada ou indisponível.");
  }

  return quotation;
}

export async function assertExternalApproverCanAccessQuotation(
  userId: string,
  organizationId: string,
  quotationId: string,
) {
  try {
    return await getExternalApproverQuotationOrThrow(userId, organizationId, quotationId);
  } catch {
    redirect("/app/aprovador/cotacoes");
  }
}
