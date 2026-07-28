import { prisma } from "../src/lib/prisma";
import { markOverdueCompliance } from "../src/features/compliance/expire";
import {
  consumeSupplierFranchiseInTx,
  getSupplierFranchiseBalance,
  getSupplierPlanInfo,
} from "../src/features/supplier/franchise";
import { currentYearMonth } from "../src/features/quotations/franchise";

async function main() {
  const supplier = await prisma.organization.findFirst({
    where: { type: "fornecedor" },
  });
  if (!supplier) throw new Error("Org fornecedor ausente");

  const user = await prisma.user.findFirst({
    where: { email: "fornecedor@demo.cotacondo.com.br" },
  });
  if (!user) throw new Error("Usuário fornecedor ausente");

  const plan = await getSupplierPlanInfo(supplier.id);
  if (plan.categoryIds.length < 1) {
    throw new Error("Fornecedor sem categoria associada");
  }
  console.log(`Plano OK: ${plan.planName} · ${plan.categoryIds.length} categoria(s)`);

  const past = new Date();
  past.setMonth(past.getMonth() - 7);
  const overdueDoc = await prisma.complianceDocument.create({
    data: {
      organizationId: supplier.id,
      documentType: "Smoke Certidão",
      fileName: "smoke.pdf",
      storagePath: "local://uploads/smoke.pdf",
      validUntil: past,
      status: "aprovado",
    },
  });
  const marked = await markOverdueCompliance(supplier.id);
  const refreshed = await prisma.complianceDocument.findUniqueOrThrow({
    where: { id: overdueDoc.id },
  });
  if (refreshed.status !== "em_atraso") {
    throw new Error(`Esperado em_atraso, got ${refreshed.status} (marked=${marked})`);
  }
  console.log("Compliance expire OK");

  await prisma.complianceDocument.update({
    where: { id: overdueDoc.id },
    data: { status: "aprovado", validUntil: new Date(Date.now() + 180 * 86400000) },
  });

  const inviteToDecline = await prisma.quotationInvite.findFirst({
    where: { supplierOrgId: supplier.id, status: "pendente" },
    orderBy: { createdAt: "asc" },
  });
  if (!inviteToDecline) throw new Error("Invite pendente ausente (rode db:seed)");

  await prisma.quotationInvite.update({
    where: { id: inviteToDecline.id },
    data: {
      status: "declinado",
      declineReason: "Smoke: fora do escopo",
      declinedAt: new Date(),
    },
  });
  const declined = await prisma.quotationInvite.findUniqueOrThrow({
    where: { id: inviteToDecline.id },
  });
  if (declined.status !== "declinado") throw new Error("Declínio falhou");
  console.log("Declinar oportunidade OK");

  const inviteToPropose = await prisma.quotationInvite.findFirst({
    where: { supplierOrgId: supplier.id, status: "pendente" },
  });
  if (!inviteToPropose) throw new Error("Segundo invite pendente ausente");

  await prisma.franchiseUsage.deleteMany({
    where: { organizationId: supplier.id, yearMonth: currentYearMonth() },
  });

  const before = await getSupplierFranchiseBalance(supplier.id);
  console.log("Franquia fornecedor antes:", before);

  const proposal = await prisma.$transaction(async (tx) => {
    await consumeSupplierFranchiseInTx(tx, supplier.id);
    await tx.quotationInvite.update({
      where: { id: inviteToPropose.id },
      data: { status: "aceito", acceptedAt: new Date() },
    });
    const created = await tx.proposal.create({
      data: {
        inviteId: inviteToPropose.id,
        organizationId: supplier.id,
        quotationId: inviteToPropose.quotationId,
        status: "enviada",
        createdByUserId: user.id,
        conditions: {
          create: [
            {
              amountCents: 150000,
              paymentTerms: "30 dias",
              sortOrder: 0,
              attachments: {
                create: {
                  fileName: "condicao-1.pdf",
                  storagePath: "local://uploads/condicao-1.pdf",
                  sizeBytes: 100,
                },
              },
            },
            {
              amountCents: 140000,
              paymentTerms: "à vista 5% desc.",
              sortOrder: 1,
            },
          ],
        },
      },
      include: { conditions: { include: { attachments: true } } },
    });
    await tx.domainEvent.create({
      data: {
        type: "proposal.submitted",
        entityType: "proposal",
        entityId: created.id,
        organizationId: supplier.id,
      },
    });
    return created;
  });

  if (proposal.conditions.length < 2) {
    throw new Error("Proposta deveria ter 2 condições");
  }
  if (proposal.conditions[0].attachments.length < 1) {
    throw new Error("Condição 1 deveria ter anexo");
  }
  console.log("Proposta multi-condição OK");

  const after = await getSupplierFranchiseBalance(supplier.id);
  if (after.canSubmitProposal) {
    throw new Error("Free deveria bloquear após 1 proposta no mês");
  }
  console.log("Trava plano Free OK:", after);

  const proposalsOnQuotation = await prisma.proposal.count({
    where: { quotationId: inviteToPropose.quotationId },
  });
  if (proposalsOnQuotation < 1) {
    throw new Error("Solicitante deveria ver propostas recebidas");
  }
  console.log(`Propostas na cotação: ${proposalsOnQuotation}`);

  console.log("SMOKE DIA 3 OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
