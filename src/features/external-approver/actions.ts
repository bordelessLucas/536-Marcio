"use server";

import {
  AppointmentLeadMode,
  AppointmentSource,
  MemberRole,
  ServicePipelineStatus,
  SupplierPipelineStage,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/request-ip";
import { emitDomainEvent } from "@/lib/domain-events";
import { toPublicErrorMessage } from "@/lib/errors";
import {
  getExternalApproverQuotationOrThrow,
  requireExternalApprover,
} from "@/features/external-approver/guards";
import { parseBrDate } from "@/features/appointments/filters";

export type ActionResult = { ok: boolean; message?: string };

function parseNextContractDate(formData: FormData): {
  nextContractDate: Date | null;
  nextContractNotApplicable: boolean;
} {
  const notApplicable = formData.get("nextContractNotApplicable") === "on";
  const rawDate = String(formData.get("nextContractDate") || "").trim();
  const isoDate = rawDate ? new Date(rawDate) : null;
  const brDate = rawDate ? parseBrDate(rawDate) : null;
  const nextContractDate = isoDate && !Number.isNaN(isoDate.getTime()) ? isoDate : brDate;

  return { nextContractDate, nextContractNotApplicable: notApplicable };
}

export async function externalApproveQuotationAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireExternalApprover();
    const quotationId = String(formData.get("quotationId") || "").trim();
    const reason = String(formData.get("reason") || "").trim();
    const { nextContractDate, nextContractNotApplicable } = parseNextContractDate(formData);

    if (!reason || reason.length < 3) {
      return { ok: false, message: "Informe o motivo da aprovação." };
    }
    if (!nextContractNotApplicable && !nextContractDate) {
      return {
        ok: false,
        message: 'Informe a data da próxima contratação ou marque "Não se aplica".',
      };
    }

    const quotation = await getExternalApproverQuotationOrThrow(
      session.userId,
      session.organizationId,
      quotationId,
    );

    if (quotation.externalApproval) {
      return { ok: false, message: "Esta cotação já foi processada." };
    }

    const winningProposalId = quotation.approvedProposalId;
    if (!winningProposalId) {
      return { ok: false, message: "Nenhuma proposta vencedora definida pelo Master Service." };
    }

    const ip = await getRequestIp();

    await prisma.$transaction(async (tx) => {
      const approval = await tx.quotationExternalApproval.create({
        data: {
          quotationId,
          approvedByUserId: session.userId,
          proposalId: winningProposalId,
          reason,
          nextContractDate: nextContractNotApplicable ? null : nextContractDate,
          nextContractNotApplicable,
          ip,
        },
      });

      await tx.proposal.update({
        where: { id: winningProposalId },
        data: { status: "aprovada" },
      });
      await tx.proposal.updateMany({
        where: { quotationId, id: { not: winningProposalId } },
        data: { status: "recusada" },
      });

      const approvedInvite = await tx.quotationInvite.findFirst({
        where: { proposal: { id: winningProposalId } },
        select: { id: true },
      });
      if (approvedInvite) {
        await tx.quotationInvite.update({
          where: { id: approvedInvite.id },
          data: { supplierPipelineStage: SupplierPipelineStage.ganha },
        });
        await tx.quotationInvite.updateMany({
          where: { quotationId, id: { not: approvedInvite.id } },
          data: { supplierPipelineStage: SupplierPipelineStage.perdida },
        });
      }

      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          status: "aprovada",
          servicePipelineStatus: ServicePipelineStatus.aprovada,
          solicitanteAcceptedAt: new Date(),
          contactReleasedAt: new Date(),
        },
      });

      if (!nextContractNotApplicable && nextContractDate) {
        await tx.serviceAppointment.create({
          data: {
            organizationId: quotation.organizationId,
            serviceClientId: quotation.serviceClientId,
            condominiumId: quotation.condominiumId,
            categoryId: quotation.categoryId,
            serviceItemId: quotation.serviceItemId,
            appointmentDate: nextContractDate,
            leadMode: AppointmentLeadMode.days_30,
            source: AppointmentSource.approval,
            quotationId,
            externalApprovalId: approval.id,
            createdByUserId: session.userId,
            notes: `Gerado na aprovação externa — ${reason.slice(0, 120)}`,
          },
        });
      }
    });

    await writeAuditLog({
      userId: session.userId,
      action: "external_approver.approved",
      entityType: "Quotation",
      entityId: quotationId,
      ip,
      metadata: { reason, nextContractNotApplicable },
    });

    await emitDomainEvent({
      type: "service_quotation.external_approved",
      entityType: "Quotation",
      entityId: quotationId,
      organizationId: quotation.organizationId,
      payload: { quotationId, reason },
    });

    revalidatePath("/app/aprovador/cotacoes");
    revalidatePath(`/app/aprovador/cotacoes/${quotationId}`);
    revalidatePath("/app/calendario");
    revalidatePath("/app/service/calendario");
    return { ok: true, message: "Cotação aprovada com sucesso." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function externalRejectQuotationAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireExternalApprover();
    const quotationId = String(formData.get("quotationId") || "").trim();
    const reason = String(formData.get("reason") || "").trim();

    if (!reason || reason.length < 3) {
      return { ok: false, message: "Informe o motivo da recusa." };
    }

    const quotation = await getExternalApproverQuotationOrThrow(
      session.userId,
      session.organizationId,
      quotationId,
    );

    if (quotation.externalApproval) {
      return { ok: false, message: "Esta cotação já foi processada." };
    }

    const ip = await getRequestIp();

    await prisma.$transaction(async (tx) => {
      await tx.quotationExternalApproval.create({
        data: {
          quotationId,
          approvedByUserId: session.userId,
          reason,
          rejected: true,
          rejectionReason: reason,
          nextContractNotApplicable: true,
          ip,
        },
      });
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          status: "recusada",
          servicePipelineStatus: ServicePipelineStatus.recusada,
        },
      });
    });

    await writeAuditLog({
      userId: session.userId,
      action: "external_approver.rejected",
      entityType: "Quotation",
      entityId: quotationId,
      ip,
      metadata: { reason },
    });

    await emitDomainEvent({
      type: "service_quotation.external_rejected",
      entityType: "Quotation",
      entityId: quotationId,
      organizationId: quotation.organizationId,
      payload: { quotationId, reason },
    });

    revalidatePath("/app/aprovador/cotacoes");
    revalidatePath(`/app/aprovador/cotacoes/${quotationId}`);
    return { ok: true, message: "Cotação recusada." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function inviteExternalApproverAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAuthorizedSessionForInvite();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const condominiumIds = formData.getAll("condominiumIds").map(String);

    if (!email.includes("@") || name.length < 2) {
      return { ok: false, message: "Informe nome e e-mail válidos." };
    }
    if (condominiumIds.length === 0) {
      return { ok: false, message: "Selecione ao menos um condomínio." };
    }

    const condos = await prisma.condominium.findMany({
      where: {
        id: { in: condominiumIds },
        organizationId: session.organizationId,
        archivedAt: null,
      },
    });
    if (condos.length !== condominiumIds.length) {
      return { ok: false, message: "Condomínios inválidos." };
    }

    const serviceClient = await prisma.serviceClient.findUnique({
      where: { clientOrgId: session.organizationId },
    });

    const { randomBytes } = await import("crypto");
    const { hashPassword } = await import("@/lib/auth/password");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const tempPassword = `Aprovador@${randomBytes(3).toString("hex")}`;
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: await hashPassword(tempPassword),
          emailVerifiedAt: new Date(),
          referralCode: `CC-${randomBytes(4).toString("hex").toUpperCase()}`,
        },
      });
    }

    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: session.organizationId,
        },
      },
      update: { role: MemberRole.external_approver },
      create: {
        userId: user.id,
        organizationId: session.organizationId,
        role: MemberRole.external_approver,
      },
    });

    for (const condominiumId of condominiumIds) {
      await prisma.externalApproverScope.upsert({
        where: { userId_condominiumId: { userId: user.id, condominiumId } },
        update: {
          organizationId: session.organizationId,
          serviceClientId: serviceClient?.id ?? null,
        },
        create: {
          userId: user.id,
          organizationId: session.organizationId,
          condominiumId,
          serviceClientId: serviceClient?.id ?? null,
        },
      });
    }

    await writeAuditLog({
      userId: session.userId,
      action: "external_approver.invited",
      entityType: "User",
      entityId: user.id,
      metadata: { email, condominiumIds },
    });

    revalidatePath("/app/equipe");
    return { ok: true, message: "Aprovador externo cadastrado." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

async function requireAuthorizedSessionForInvite() {
  const { requireAuthorizedSession } = await import("@/lib/auth/guards");
  const { OrganizationType } = await import("@prisma/client");
  return requireAuthorizedSession({
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
    href: "/app/equipe",
  });
}
