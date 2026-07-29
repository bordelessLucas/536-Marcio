import { createHash, randomUUID } from "crypto";
import type { Plan, Subscription } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getPaymentProvider } from "@/features/billing/payment-provider";

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function yearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function makeIdempotencyKey(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 40);
}

export async function getActiveSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId, status: { in: ["active", "past_due"] } },
    include: { plan: true, pendingPlan: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function applyPendingDowngrades(): Promise<number> {
  const now = new Date();
  const due = await prisma.subscription.findMany({
    where: {
      cancelAtPeriodEnd: true,
      pendingPlanId: { not: null },
      currentPeriodEnd: { lte: now },
      status: "active",
    },
    include: { plan: true, pendingPlan: true },
  });

  for (const sub of due) {
    if (!sub.pendingPlanId || !sub.pendingPlan) continue;
    await activatePlanChange({
      organizationId: sub.organizationId,
      toPlanId: sub.pendingPlanId,
      changeType: "downgrade_effective",
      userId: null,
      immediate: true,
      subscription: sub,
    });
  }
  return due.length;
}

export async function activatePlanChange(input: {
  organizationId: string;
  toPlanId: string;
  changeType: string;
  userId: string | null;
  immediate: boolean;
  subscription?: (Subscription & { plan: Plan; pendingPlan: Plan | null }) | null;
  checkoutId?: string;
  prorationCents?: number;
}) {
  const toPlan = await prisma.plan.findUniqueOrThrow({ where: { id: input.toPlanId } });
  const current =
    input.subscription ??
    (await prisma.subscription.findFirst({
      where: { organizationId: input.organizationId },
      include: { plan: true, pendingPlan: true },
      orderBy: { createdAt: "desc" },
    }));

  const now = new Date();
  const periodEnd = addMonths(now, 1);

  if (
    !input.immediate &&
    current &&
    current.plan.priceCents > toPlan.priceCents
  ) {
    // Downgrade: agenda para fim do ciclo (inclui Free)
    await prisma.subscription.update({
      where: { id: current.id },
      data: {
        cancelAtPeriodEnd: true,
        pendingPlanId: toPlan.id,
        currentPeriodEnd: current.currentPeriodEnd ?? periodEnd,
      },
    });
    await prisma.subscriptionChange.create({
      data: {
        organizationId: input.organizationId,
        fromPlanId: current.planId,
        toPlanId: toPlan.id,
        changeType: "downgrade_scheduled",
        effectiveAt: current.currentPeriodEnd ?? periodEnd,
        checkoutId: input.checkoutId,
        prorationCents: input.prorationCents ?? 0,
        notes: "Efetiva no fim do ciclo",
      },
    });
    await writeAuditLog({
      userId: input.userId,
      action: "subscription.downgrade_scheduled",
      entityType: "organization",
      entityId: input.organizationId,
      metadata: { toPlan: toPlan.slug, effectiveAt: current.currentPeriodEnd ?? periodEnd },
    });
    return { status: "scheduled" as const, plan: toPlan };
  }

  // Upgrade / free / activate immediate
  if (current) {
    await prisma.subscription.update({
      where: { id: current.id },
      data: {
        planId: toPlan.id,
        status: "active",
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        pendingPlanId: null,
        endsAt: null,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        organizationId: input.organizationId,
        planId: toPlan.id,
        status: "active",
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  await prisma.subscriptionChange.create({
    data: {
      organizationId: input.organizationId,
      fromPlanId: current?.planId ?? null,
      toPlanId: toPlan.id,
      changeType: input.changeType,
      effectiveAt: now,
      checkoutId: input.checkoutId,
      prorationCents: input.prorationCents ?? 0,
    },
  });

  await writeAuditLog({
    userId: input.userId,
    action: "subscription.activated",
    entityType: "organization",
    entityId: input.organizationId,
    metadata: { plan: toPlan.slug, changeType: input.changeType },
  });

  await prisma.domainEvent.create({
    data: {
      type: "subscription.activated",
      entityType: "organization",
      entityId: input.organizationId,
      organizationId: input.organizationId,
      payload: JSON.stringify({ planSlug: toPlan.slug, changeType: input.changeType }),
    },
  });

  return { status: "active" as const, plan: toPlan };
}

export async function createPlanCheckout(input: {
  organizationId: string;
  userId: string;
  planSlug: string;
  kind?: "plan" | "migration";
  metadata?: Record<string, unknown>;
}) {
  await applyPendingDowngrades();

  const plan = await prisma.plan.findFirst({
    where: { slug: input.planSlug, isActive: true },
  });
  if (!plan) throw new Error("Plano não encontrado.");

  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: input.organizationId },
  });

  const current = await getActiveSubscription(input.organizationId);
  const isUpgrade =
    !current ||
    plan.priceCents > current.plan.priceCents ||
    (current.plan.isFree && !plan.isFree);

  // Free → ativa sem gateway (upgrade) ou agenda downgrade
  if (plan.isFree && plan.priceCents === 0) {
    if (input.kind === "migration") {
      throw new Error("Migração para Administradora Free não é permitida.");
    }
    const result = await activatePlanChange({
      organizationId: input.organizationId,
      toPlanId: plan.id,
      changeType: isUpgrade ? "upgrade_free" : "downgrade_free",
      userId: input.userId,
      immediate: isUpgrade,
    });
    return {
      checkoutId: null as string | null,
      checkoutUrl: isUpgrade
        ? "/app/meu-plano?activated=1"
        : "/app/meu-plano?downgrade=scheduled",
      activated: result.status === "active",
      scheduled: result.status === "scheduled",
      plan,
      result,
    };
  }

  // Downgrade pago → agenda sem cobrança imediata
  if (current && !isUpgrade && plan.priceCents < current.plan.priceCents) {
    const result = await activatePlanChange({
      organizationId: input.organizationId,
      toPlanId: plan.id,
      changeType: "downgrade_scheduled",
      userId: input.userId,
      immediate: false,
    });
    return {
      checkoutId: null as string | null,
      checkoutUrl: "/app/meu-plano?downgrade=scheduled",
      activated: false as const,
      scheduled: true as const,
      plan,
      result,
    };
  }

  const idempotencyKey = makeIdempotencyKey([
    input.organizationId,
    plan.id,
    input.kind ?? "plan",
    yearMonth(),
    randomUUID(),
  ]);

  const checkout = await prisma.paymentCheckout.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      kind: input.kind === "migration" ? "migration" : "plan",
      planId: plan.id,
      status: "pending",
      amountCents: plan.priceCents,
      idempotencyKey,
      metadataJson: JSON.stringify({
        planSlug: plan.slug,
        orgType: org.type,
        ...(input.metadata ?? {}),
      }),
    },
  });

  const provider = getPaymentProvider();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await provider.createCheckout({
    amountCents: plan.priceCents,
    description: `Assinatura ${plan.name}`,
    organizationId: input.organizationId,
    checkoutId: checkout.id,
    idempotencyKey,
    successUrl: `${base}/checkout/sucesso?checkout=${checkout.id}`,
    cancelUrl: `${base}/checkout?plan=${plan.slug}&canceled=1`,
  });

  await prisma.paymentCheckout.update({
    where: { id: checkout.id },
    data: { externalId: session.externalId, provider: session.provider },
  });

  // Marca subscription como pending até webhook
  if (current) {
    await prisma.subscription.update({
      where: { id: current.id },
      data: { status: current.status === "active" ? "active" : "pending" },
    });
  } else {
    await prisma.subscription.create({
      data: {
        organizationId: input.organizationId,
        planId: plan.id,
        status: "pending",
      },
    });
  }

  await writeAuditLog({
    userId: input.userId,
    action: "checkout.created",
    entityType: "payment_checkout",
    entityId: checkout.id,
    metadata: { planSlug: plan.slug, amountCents: plan.priceCents },
  });

  return {
    checkoutId: checkout.id,
    checkoutUrl: session.checkoutUrl,
    activated: false as const,
    plan,
  };
}

export async function createCategoryAddonCheckout(input: {
  organizationId: string;
  userId: string;
  quantity: number;
  categoryIds: string[];
}) {
  if (input.quantity < 1) throw new Error("Quantidade inválida.");
  if (input.categoryIds.length !== input.quantity) {
    throw new Error("Selecione exatamente a quantidade de categorias.");
  }

  const settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  const unitPrice = settings?.categoryAddonPriceCents ?? 2900;
  const total = unitPrice * input.quantity;

  const idempotencyKey = makeIdempotencyKey([
    input.organizationId,
    "addon",
    input.categoryIds.sort().join(","),
    randomUUID(),
  ]);

  const checkout = await prisma.paymentCheckout.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      kind: "category_addon",
      status: "pending",
      amountCents: total,
      quantity: input.quantity,
      idempotencyKey,
      metadataJson: JSON.stringify({
        categoryIds: input.categoryIds,
        unitPriceCents: unitPrice,
      }),
    },
  });

  await prisma.categoryAddonPurchase.create({
    data: {
      organizationId: input.organizationId,
      quantity: input.quantity,
      unitPriceCents: unitPrice,
      totalCents: total,
      checkoutId: checkout.id,
      status: "pending",
    },
  });

  const provider = getPaymentProvider();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await provider.createCheckout({
    amountCents: total,
    description: `Categorias adicionais × ${input.quantity}`,
    organizationId: input.organizationId,
    checkoutId: checkout.id,
    idempotencyKey,
    successUrl: `${base}/checkout/sucesso?checkout=${checkout.id}`,
    cancelUrl: `${base}/app/meu-plano?addon=canceled`,
  });

  await prisma.paymentCheckout.update({
    where: { id: checkout.id },
    data: { externalId: session.externalId, provider: session.provider },
  });

  return { checkoutId: checkout.id, checkoutUrl: session.checkoutUrl, unitPrice, total };
}

export async function fulfillCheckoutPaid(checkoutId: string, userId?: string | null) {
  const checkout = await prisma.paymentCheckout.findUnique({
    where: { id: checkoutId },
    include: { plan: true },
  });
  if (!checkout) throw new Error("Checkout não encontrado.");
  if (checkout.status === "paid") {
    return { alreadyProcessed: true as const, checkout };
  }

  await prisma.paymentCheckout.update({
    where: { id: checkout.id },
    data: { status: "paid", paidAt: new Date() },
  });

  const metadata = JSON.parse(checkout.metadataJson || "{}") as {
    categoryIds?: string[];
    migrationId?: string;
    unitPriceCents?: number;
  };

  if (checkout.kind === "plan" || checkout.kind === "migration") {
    if (!checkout.planId) throw new Error("Checkout sem plano.");
    await activatePlanChange({
      organizationId: checkout.organizationId,
      toPlanId: checkout.planId,
      changeType: checkout.kind === "migration" ? "migration_upgrade" : "upgrade",
      userId: userId ?? checkout.userId,
      immediate: true,
      checkoutId: checkout.id,
      prorationCents: 0,
    });
  }

  if (checkout.kind === "migration" && metadata.migrationId) {
    await completeMigrationAfterPayment(metadata.migrationId, userId ?? checkout.userId);
  }

  if (checkout.kind === "category_addon") {
    const categoryIds = metadata.categoryIds ?? [];
    const unitPrice = metadata.unitPriceCents ?? Math.round(checkout.amountCents / checkout.quantity);
    for (const categoryId of categoryIds) {
      await prisma.organizationCategory.upsert({
        where: {
          organizationId_categoryId: {
            organizationId: checkout.organizationId,
            categoryId,
          },
        },
        update: {
          isAddon: true,
          isIncluded: false,
          unitPriceCents: unitPrice,
          checkoutId: checkout.id,
        },
        create: {
          organizationId: checkout.organizationId,
          categoryId,
          isAddon: true,
          isIncluded: false,
          unitPriceCents: unitPrice,
          checkoutId: checkout.id,
        },
      });
    }
    await prisma.categoryAddonPurchase.updateMany({
      where: { checkoutId: checkout.id },
      data: { status: "paid" },
    });
  }

  await writeAuditLog({
    userId: userId ?? checkout.userId,
    action: "checkout.paid",
    entityType: "payment_checkout",
    entityId: checkout.id,
    metadata: { kind: checkout.kind, amountCents: checkout.amountCents },
  });

  await prisma.domainEvent.create({
    data: {
      type: "checkout.paid",
      entityType: "payment_checkout",
      entityId: checkout.id,
      organizationId: checkout.organizationId,
      payload: checkout.metadataJson,
    },
  });

  return { alreadyProcessed: false as const, checkout };
}

export async function markCheckoutFailed(checkoutId: string, status: "failed" | "canceled" | "past_due") {
  const checkout = await prisma.paymentCheckout.findUnique({ where: { id: checkoutId } });
  if (!checkout || checkout.status === "paid") return checkout;

  await prisma.paymentCheckout.update({
    where: { id: checkoutId },
    data: {
      status: status === "past_due" ? "failed" : status,
      failedAt: new Date(),
    },
  });

  if (status === "past_due") {
    await prisma.subscription.updateMany({
      where: { organizationId: checkout.organizationId, status: "active" },
      data: { status: "past_due" },
    });
  }

  await writeAuditLog({
    action: `checkout.${status}`,
    entityType: "payment_checkout",
    entityId: checkoutId,
  });

  return checkout;
}

async function completeMigrationAfterPayment(migrationId: string, userId?: string | null) {
  const migration = await prisma.organizationMigration.findUnique({
    where: { id: migrationId },
    include: { targetPlan: true },
  });
  if (!migration) return;
  if (migration.status === "approved") return;

  if (migration.targetPlan.isFree) {
    await prisma.organizationMigration.update({
      where: { id: migration.id },
      data: { status: "rejected", reviewNotes: "Bloqueado: plano Free" },
    });
    throw new Error("Migração para Administradora Free é impossível.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: migration.organizationId },
      data: { type: "administradora" },
    });
    await tx.organizationMigration.update({
      where: { id: migration.id },
      data: {
        status: "approved",
        completedAt: new Date(),
        reviewedByUserId: userId,
        reviewNotes: "Auto-aprovado após pagamento",
      },
    });
  });

  await writeAuditLog({
    userId,
    action: "migration.completed",
    entityType: "organization",
    entityId: migration.organizationId,
    metadata: { fromType: migration.fromType, plan: migration.targetPlan.slug },
  });

  if (userId) {
    try {
      const { buildSessionForUser, createSessionToken, setSessionCookie } = await import(
        "@/lib/auth/session"
      );
      const payload = await buildSessionForUser(userId);
      if (payload) {
        await setSessionCookie(await createSessionToken(payload));
      }
    } catch {
      // sessão será atualizada no próximo login
    }
  }
}

export { yearMonth, addMonths };
