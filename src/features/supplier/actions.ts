"use server";

import { revalidatePath } from "next/cache";
import { OrganizationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { toPublicErrorMessage } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import { selectCategoriesSchema } from "@/features/supplier/schemas";
import { getSupplierPlanInfo } from "@/features/supplier/franchise";

export type ActionResult = { ok: boolean; message?: string };

export async function updateSupplierCategoriesAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireAuthorizedSession({
      types: [OrganizationType.fornecedor],
      href: "/app/meu-plano",
    });

    const rawIds = formData.getAll("categoryIds").map(String).filter(Boolean);
    const parsed = selectCategoriesSchema.safeParse({ categoryIds: rawIds });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const plan = await getSupplierPlanInfo(session.organizationId);
    if (parsed.data.categoryIds.length > plan.categoriesIncluded) {
      return {
        ok: false,
        message: `Seu plano permite até ${plan.categoriesIncluded} categoria(s). Faça upgrade para adicionar mais.`,
      };
    }

    const categories = await prisma.serviceCategory.findMany({
      where: {
        id: { in: parsed.data.categoryIds },
        isActive: true,
        deletedAt: null,
      },
    });
    if (categories.length !== parsed.data.categoryIds.length) {
      return { ok: false, message: "Uma ou mais categorias são inválidas." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.organizationCategory.deleteMany({
        where: { organizationId: session.organizationId },
      });
      await tx.organizationCategory.createMany({
        data: parsed.data.categoryIds.map((categoryId) => ({
          organizationId: session.organizationId,
          categoryId,
          isIncluded: true,
        })),
      });
    });

    await writeAuditLog({
      userId: session.userId,
      action: "supplier.categories.updated",
      entityType: "organization",
      entityId: session.organizationId,
      metadata: { categoryIds: parsed.data.categoryIds },
    });

    revalidatePath("/app/meu-plano");
    revalidatePath("/app");
    return { ok: true, message: "Categorias do plano atualizadas." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}
