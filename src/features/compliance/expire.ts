import { prisma } from "@/lib/prisma";

/** Marca documentos aprovados/em análise com validade vencida como em_atraso. */
export async function markOverdueCompliance(organizationId?: string): Promise<number> {
  const now = new Date();
  const result = await prisma.complianceDocument.updateMany({
    where: {
      status: { in: ["aprovado", "em_analise"] },
      validUntil: { lt: now },
      ...(organizationId ? { organizationId } : {}),
    },
    data: { status: "em_atraso" },
  });
  return result.count;
}
