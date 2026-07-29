"use server";

import { revalidatePath } from "next/cache";
import { OrganizationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { toPublicErrorMessage } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import { storeProposalConditionAttachment } from "@/lib/storage";
import {
  acceptInviteSchema,
  declineInviteSchema,
  submitProposalSchema,
} from "@/features/opportunities/schemas";
import {
  assertSupplierCanAccessCategory,
  consumeSupplierFranchiseInTx,
  getSupplierFranchiseBalance,
} from "@/features/supplier/franchise";
import { markOverdueCompliance } from "@/features/compliance/expire";

export type ActionResult = { ok: boolean; message?: string; proposalId?: string };

async function requireSupplier() {
  return requireAuthorizedSession({
    types: [OrganizationType.fornecedor],
    href: "/app/oportunidades",
  });
}

export async function declineInviteAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSupplier();
    const parsed = declineInviteSchema.safeParse({
      inviteId: formData.get("inviteId"),
      reason: formData.get("reason") || undefined,
    });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const invite = await prisma.quotationInvite.findFirst({
      where: {
        id: parsed.data.inviteId,
        supplierOrgId: session.organizationId,
        status: "pendente",
      },
    });
    if (!invite) return { ok: false, message: "Oportunidade não encontrada." };

    await prisma.quotationInvite.update({
      where: { id: invite.id },
      data: {
        status: "declinado",
        declineReason: parsed.data.reason || null,
        declinedAt: new Date(),
      },
    });

    await prisma.domainEvent.create({
      data: {
        type: "invite.declined",
        entityType: "quotation_invite",
        entityId: invite.id,
        organizationId: session.organizationId,
        payload: JSON.stringify({ reason: parsed.data.reason ?? null }),
      },
    });

    await writeAuditLog({
      userId: session.userId,
      action: "invite.declined",
      entityType: "quotation_invite",
      entityId: invite.id,
    });

    // Refill: declínio libera slot até a meta máxima de propostas/convites.
    const { runDistributionEngine } = await import("@/features/distribution/engine");
    await runDistributionEngine(invite.quotationId);

    revalidatePath("/app/oportunidades");
    revalidatePath(`/app/cotacoes/${invite.quotationId}`);
    revalidatePath("/app");
    return { ok: true, message: "Oportunidade declinada." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function acceptInviteAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSupplier();
    const parsed = acceptInviteSchema.safeParse({
      inviteId: formData.get("inviteId"),
    });
    if (!parsed.success) return { ok: false, message: "Dados inválidos" };

    const invite = await prisma.quotationInvite.findFirst({
      where: {
        id: parsed.data.inviteId,
        supplierOrgId: session.organizationId,
        status: "pendente",
      },
      include: { quotation: true },
    });
    if (!invite) return { ok: false, message: "Oportunidade não encontrada." };

    try {
      await assertSupplierCanAccessCategory(
        session.organizationId,
        invite.quotation.categoryId,
      );
    } catch {
      return {
        ok: false,
        message: "Categoria fora do seu pacote. Ajuste em Meu Plano ou faça upgrade.",
      };
    }

    await markOverdueCompliance(session.organizationId);
    const overdue = await prisma.complianceDocument.count({
      where: { organizationId: session.organizationId, status: "em_atraso" },
    });
    if (overdue > 0) {
      return {
        ok: false,
        message: "Há documentos em atraso. Regularize o compliance antes de aceitar.",
      };
    }

    const balance = await getSupplierFranchiseBalance(session.organizationId);
    if (!balance.canSubmitProposal) {
      return {
        ok: false,
        message: "Limite mensal do plano Free esgotado (1 cotação/mês). Faça upgrade.",
      };
    }

    await prisma.quotationInvite.update({
      where: { id: invite.id },
      data: { status: "aceito", acceptedAt: new Date() },
    });

    revalidatePath("/app/oportunidades");
    return { ok: true, message: "Oportunidade aceita. Envie a proposta." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function submitProposalAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSupplier();
    const inviteId = String(formData.get("inviteId") ?? "");

    const conditionCount = Number(formData.get("conditionCount") ?? 0);
    const conditions: Array<{ amountCents: number; paymentTerms: string }> = [];
    for (let i = 0; i < conditionCount; i += 1) {
      const amountRaw = String(formData.get(`amount_${i}`) ?? "").replace(",", ".");
      const amountNumber = Number(amountRaw);
      const amountCents = Math.round(amountNumber * 100);
      conditions.push({
        amountCents,
        paymentTerms: String(formData.get(`paymentTerms_${i}`) ?? ""),
      });
    }

    const parsed = submitProposalSchema.safeParse({ inviteId, conditions });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const invite = await prisma.quotationInvite.findFirst({
      where: {
        id: inviteId,
        supplierOrgId: session.organizationId,
        status: { in: ["pendente", "aceito"] },
      },
      include: { quotation: true, proposal: true },
    });
    if (!invite) return { ok: false, message: "Oportunidade não encontrada." };
    if (invite.proposal) return { ok: false, message: "Já existe proposta para este convite." };

    if (
      invite.quotation.invitesPaused ||
      invite.quotation.proposalsCount >= invite.quotation.maxProposals
    ) {
      return {
        ok: false,
        message: "Esta cotação atingiu o máximo de propostas e não recebe mais envios.",
      };
    }

    if (!["aberta", "em_negociacao"].includes(invite.quotation.status)) {
      return { ok: false, message: "Cotação não está aberta para propostas." };
    }

    try {
      await assertSupplierCanAccessCategory(
        session.organizationId,
        invite.quotation.categoryId,
      );
    } catch {
      return {
        ok: false,
        message: "Categoria fora do seu pacote. Ajuste em Meu Plano ou faça upgrade.",
      };
    }

    await markOverdueCompliance(session.organizationId);
    const overdue = await prisma.complianceDocument.count({
      where: { organizationId: session.organizationId, status: "em_atraso" },
    });
    if (overdue > 0) {
      return {
        ok: false,
        message: "Há documentos em atraso. Regularize o compliance antes de enviar proposta.",
      };
    }

    const proposal = await prisma.$transaction(async (tx) => {
      const locked = await tx.quotation.findUnique({ where: { id: invite.quotationId } });
      if (
        !locked ||
        locked.invitesPaused ||
        locked.proposalsCount >= locked.maxProposals
      ) {
        throw new Error("QUOTATION_MAX_REACHED");
      }

      await consumeSupplierFranchiseInTx(tx, session.organizationId);

      if (invite.status === "pendente") {
        await tx.quotationInvite.update({
          where: { id: invite.id },
          data: { status: "aceito", acceptedAt: new Date() },
        });
      }

      const created = await tx.proposal.create({
        data: {
          inviteId: invite.id,
          organizationId: session.organizationId,
          quotationId: invite.quotationId,
          status: "enviada",
          createdByUserId: session.userId,
        },
      });

      for (const [index, condition] of parsed.data.conditions.entries()) {
        const createdCondition = await tx.proposalCondition.create({
          data: {
            proposalId: created.id,
            amountCents: condition.amountCents,
            paymentTerms: condition.paymentTerms,
            sortOrder: index,
          },
        });

        const file = formData.get(`attachment_${index}`);
        if (file instanceof File && file.size > 0) {
          const stored = await storeProposalConditionAttachment({
            organizationId: session.organizationId,
            proposalId: created.id,
            conditionIndex: index,
            file,
          });
          await tx.proposalConditionAttachment.create({
            data: {
              conditionId: createdCondition.id,
              fileName: stored.fileName,
              storagePath: stored.storagePath,
              contentType: stored.contentType,
              sizeBytes: stored.sizeBytes,
            },
          });
        }
      }

      await tx.quotation.update({
        where: { id: invite.quotationId },
        data: { proposalsCount: { increment: 1 } },
      });

      await tx.domainEvent.create({
        data: {
          type: "proposal.submitted",
          entityType: "proposal",
          entityId: created.id,
          organizationId: session.organizationId,
          payload: JSON.stringify({
            quotationId: invite.quotationId,
            conditions: parsed.data.conditions.length,
          }),
        },
      });

      return created;
    });

    const {
      emitMinProposalsIfReached,
      pauseQuotationInvitesIfMaxReached,
    } = await import("@/features/distribution/engine");
    await emitMinProposalsIfReached(invite.quotationId);
    await pauseQuotationInvitesIfMaxReached(invite.quotationId);

    await writeAuditLog({
      userId: session.userId,
      action: "proposal.submitted",
      entityType: "proposal",
      entityId: proposal.id,
    });

    revalidatePath("/app/oportunidades");
    revalidatePath("/app/cotacoes");
    revalidatePath(`/app/cotacoes/${invite.quotationId}`);
    revalidatePath("/app");
    return { ok: true, message: "Proposta enviada.", proposalId: proposal.id };
  } catch (error) {
    if (error instanceof Error && error.message === "SUPPLIER_FRANCHISE_EXHAUSTED") {
      return {
        ok: false,
        message: "Limite mensal do plano Free esgotado (1 cotação/mês). Faça upgrade.",
      };
    }
    if (error instanceof Error && error.message === "QUOTATION_MAX_REACHED") {
      return {
        ok: false,
        message: "Esta cotação atingiu o máximo de propostas e não recebe mais envios.",
      };
    }
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}
