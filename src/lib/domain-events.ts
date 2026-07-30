import { prisma } from "@/lib/prisma";
import { createNotification, notifyOrgMembers } from "@/features/notifications/service";
import { sendTemplatedEmail } from "@/features/notifications/email-provider";
import { creditReferralOnPaidUpgrade } from "@/features/referrals/rewards";

type EmitInput = {
  type: string;
  entityType: string;
  entityId: string;
  organizationId?: string | null;
  payload?: Record<string, unknown>;
};

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export async function emitDomainEvent(input: EmitInput) {
  const event = await prisma.domainEvent.create({
    data: {
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      organizationId: input.organizationId ?? null,
      payload: input.payload ? JSON.stringify(input.payload) : null,
    },
  });

  await dispatchDomainEvent({
    type: event.type,
    entityType: event.entityType,
    entityId: event.entityId,
    organizationId: event.organizationId,
    payload: input.payload ?? {},
  });

  return event;
}

export async function dispatchDomainEvent(input: {
  type: string;
  entityType: string;
  entityId: string;
  organizationId?: string | null;
  payload: Record<string, unknown>;
}) {
  const payload = input.payload;
  const quotationId = asString(payload.quotationId) ?? (input.entityType === "quotation" ? input.entityId : undefined);
  const hrefQuotation = quotationId ? `/app/cotacoes/${quotationId}` : undefined;

  switch (input.type) {
    case "proposal.submitted": {
      const quotation = quotationId
        ? await prisma.quotation.findUnique({ where: { id: quotationId } })
        : null;
      const orgId = quotation?.organizationId ?? asString(payload.solicitanteOrgId);
      if (orgId) {
        await notifyOrgMembers(orgId, {
          type: input.type,
          title: "Nova proposta recebida",
          body: asString(payload.summary) ?? "Um fornecedor enviou uma proposta para sua cotação.",
          href: quotationId ? `/app/cotacoes/${quotationId}` : hrefQuotation,
          metadata: payload,
        });
      }
      break;
    }
    case "quotation.min_proposals_reached": {
      const orgId = input.organizationId;
      if (orgId) {
        await notifyOrgMembers(orgId, {
          type: input.type,
          title: "Meta mínima de propostas atingida",
          body: "Sua cotação já tem propostas suficientes para comparação.",
          href: hrefQuotation,
          metadata: payload,
        });
        const members = await prisma.organizationMember.findMany({
          where: { organizationId: orgId },
          include: { user: true },
        });
        for (const member of members) {
          await sendTemplatedEmail({
            toEmail: member.user.email,
            subject: "CotaCondo — meta mínima de propostas atingida",
            bodyText: `Olá ${member.user.name},\n\nA cotação ${asString(payload.code) ?? quotationId ?? ""} atingiu a meta mínima de propostas. Acesse o comparativo para negociar ou aprovar.\n`,
            template: "min_proposals_reached",
            metadata: { quotationId, organizationId: orgId },
          });
        }
      }
      break;
    }
    case "negotiation.started":
    case "negotiation.message": {
      const targets = [asString(payload.solicitanteOrgId), asString(payload.supplierOrgId)].filter(
        Boolean,
      ) as string[];
      for (const orgId of targets) {
        await notifyOrgMembers(orgId, {
          type: input.type,
          title: input.type === "negotiation.started" ? "Negociação iniciada" : "Nova mensagem na negociação",
          body: asString(payload.preview) ?? "Há uma atualização na negociação da cotação.",
          href: hrefQuotation,
          metadata: payload,
        });
      }
      break;
    }
    case "quotation.approved": {
      if (input.organizationId) {
        await notifyOrgMembers(input.organizationId, {
          type: input.type,
          title: "Cotação aprovada",
          body: "Uma proposta foi aprovada e as demais foram encerradas.",
          href: hrefQuotation,
          metadata: payload,
        });
      }
      const supplierOrgId = asString(payload.supplierOrgId);
      if (supplierOrgId) {
        await notifyOrgMembers(supplierOrgId, {
          type: input.type,
          title: "Sua proposta foi aprovada",
          body: "Parabéns — a proposta foi escolhida pelo solicitante.",
          href: "/app/oportunidades",
          metadata: payload,
        });
        const suppliers = await prisma.organizationMember.findMany({
          where: { organizationId: supplierOrgId },
          include: { user: true },
        });
        for (const member of suppliers) {
          await sendTemplatedEmail({
            toEmail: member.user.email,
            subject: "CotaCondo — proposta aprovada",
            bodyText: `Olá ${member.user.name},\n\nSua proposta foi aprovada na cotação ${quotationId ?? ""}.\n`,
            template: "quotation_approved",
            metadata: payload,
          });
        }
      }
      break;
    }
    case "quotation.finalized_others":
    case "quotation.finalizada_outros":
    case "quotation.outros": {
      if (input.organizationId) {
        await notifyOrgMembers(input.organizationId, {
          type: input.type,
          title: "Cotação finalizada (Outros)",
          body: asString(payload.providerName)
            ? `Finalizada com fornecedor externo: ${asString(payload.providerName)}.`
            : "A cotação foi encerrada no fluxo Outros.",
          href: hrefQuotation,
          metadata: payload,
        });
      }
      break;
    }
    case "quotation.status_changed": {
      if (input.organizationId) {
        await notifyOrgMembers(input.organizationId, {
          type: input.type,
          title: "Status da cotação atualizado",
          body: `Novo status: ${asString(payload.status) ?? "atualizado"}.`,
          href: hrefQuotation,
          metadata: payload,
        });
      }
      break;
    }
    case "quotation.invite_created": {
      const supplierOrgId = asString(payload.supplierOrgId) ?? input.organizationId;
      if (supplierOrgId) {
        await notifyOrgMembers(supplierOrgId, {
          type: input.type,
          title: "Convite de cotação",
          body: "Você foi convidado a enviar uma proposta.",
          href: "/app/oportunidades",
          metadata: payload,
        });
        const members = await prisma.organizationMember.findMany({
          where: { organizationId: supplierOrgId },
          include: { user: true },
        });
        for (const member of members) {
          await sendTemplatedEmail({
            toEmail: member.user.email,
            subject: "CotaCondo — novo convite de cotação",
            bodyText: `Olá ${member.user.name},\n\nHá uma nova oportunidade de cotação aguardando sua proposta ou declínio.\n`,
            template: "quotation_invite",
            metadata: payload,
          });
        }
      }
      break;
    }
    case "compliance.updated": {
      const orgId = input.organizationId;
      if (orgId) {
        await notifyOrgMembers(orgId, {
          type: input.type,
          title: "Compliance atualizado",
          body: asString(payload.message) ?? "Há uma atualização nos seus documentos de compliance.",
          href: "/app/compliance",
          metadata: payload,
        });
      }
      const masters = await prisma.organization.findMany({
        where: { type: "master_admin" },
        select: { id: true },
      });
      for (const masterOrg of masters) {
        await notifyOrgMembers(masterOrg.id, {
          type: input.type,
          title: "Compliance — revisão",
          body: asString(payload.message) ?? "Documento de compliance atualizado na fila.",
          href: "/app/plataforma/compliance",
          metadata: payload,
        });
      }
      await sendComplianceEmails(payload, orgId);
      break;
    }
    case "commission.recorded":
    case "commission.created":
    case "commission.expected": {
      const admOrgId = asString(payload.administradoraOrgId) ?? input.organizationId;
      if (admOrgId) {
        await notifyOrgMembers(admOrgId, {
          type: input.type,
          title: "Nova comissão registrada",
          body: `Expectativa de R$ ${((asNumber(payload.commissionCents) ?? 0) / 100).toFixed(2)} na comissão.`,
          href: "/app/financeiro",
          metadata: payload,
          mastersOnly: true,
        });
      }
      break;
    }
    case "subscription.activated": {
      await creditReferralOnPaidUpgrade({
        organizationId: input.organizationId ?? asString(payload.organizationId),
        planSlug: asString(payload.planSlug),
      });
      break;
    }
    default:
      break;
  }
}

async function sendComplianceEmails(payload: Record<string, unknown>, orgId?: string | null) {
  if (!orgId) return;
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true },
  });
  for (const member of members) {
    await sendTemplatedEmail({
      toEmail: member.user.email,
      subject: "CotaCondo — atualização de compliance",
      bodyText: `Olá ${member.user.name},\n\n${asString(payload.message) ?? "Seu compliance foi atualizado."}\n`,
      template: "compliance_updated",
      metadata: payload,
    });
  }
}

/** Reprocessa eventos ainda não notificados (smoke / backfill leve). */
export async function createNotificationForUser(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  organizationId?: string;
}) {
  return createNotification(input);
}
