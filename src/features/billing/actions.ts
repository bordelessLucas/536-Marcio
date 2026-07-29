"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrganizationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { toPublicErrorMessage } from "@/lib/errors";
import {
  createCategoryAddonCheckout,
  createPlanCheckout,
  fulfillCheckoutPaid,
  markCheckoutFailed,
} from "@/features/billing/subscriptions";
import { z } from "zod";

export type ActionResult = { ok: boolean; message?: string; checkoutUrl?: string };

const startCheckoutSchema = z.object({
  planSlug: z.string().min(1),
});

export async function startPlanCheckoutAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { ok: false, message: "Faça login para contratar o plano." };
    }

    const parsed = startCheckoutSchema.safeParse({
      planSlug: formData.get("planSlug"),
    });
    if (!parsed.success) return { ok: false, message: "Plano inválido." };

    const result = await createPlanCheckout({
      organizationId: session.organizationId,
      userId: session.userId,
      planSlug: parsed.data.planSlug,
      kind: "plan",
    });

    revalidatePath("/app/meu-plano");
    if (result.checkoutUrl) {
      redirect(result.checkoutUrl);
    }
    return { ok: true, message: "Plano atualizado.", checkoutUrl: result.checkoutUrl };
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function confirmSandboxPaymentAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    const checkoutId = String(formData.get("checkoutId") ?? "");
    if (!checkoutId) return { ok: false, message: "Checkout inválido." };

    const checkout = await prisma.paymentCheckout.findUnique({ where: { id: checkoutId } });
    if (!checkout) return { ok: false, message: "Checkout não encontrado." };
    if (session && checkout.organizationId !== session.organizationId) {
      return { ok: false, message: "Checkout de outra organização." };
    }

    await fulfillCheckoutPaid(checkoutId, session?.userId);
    revalidatePath("/app/meu-plano");
    revalidatePath("/app");
    redirect(`/checkout/sucesso?checkout=${checkoutId}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function cancelSandboxPaymentAction(formData: FormData): Promise<ActionResult> {
  try {
    const checkoutId = String(formData.get("checkoutId") ?? "");
    await markCheckoutFailed(checkoutId, "canceled");
    redirect(`/checkout?canceled=1`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function startCategoryAddonCheckoutAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAuthorizedSession({
      types: [OrganizationType.fornecedor],
      href: "/app/meu-plano",
    });

    const quantity = Number(formData.get("quantity") ?? 0);
    const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
    const result = await createCategoryAddonCheckout({
      organizationId: session.organizationId,
      userId: session.userId,
      quantity,
      categoryIds,
    });

    redirect(result.checkoutUrl);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function requestDowngradeAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, message: "Faça login." };

    const planSlug = String(formData.get("planSlug") ?? "");
    const result = await createPlanCheckout({
      organizationId: session.organizationId,
      userId: session.userId,
      planSlug,
      kind: "plan",
    });

    revalidatePath("/app/meu-plano");
    return {
      ok: true,
      message: "scheduled" in result && result.scheduled
        ? "Downgrade agendado para o fim do ciclo."
        : "Solicitação processada.",
      checkoutUrl: result.checkoutUrl,
    };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}
