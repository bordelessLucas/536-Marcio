import Link from "next/link";
import { OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getSupplierPlanInfo } from "@/features/supplier/franchise";
import { SupplierCategoriesForm } from "@/features/supplier/components/SupplierCategoriesForm";
import { Button } from "@/components/ui/Button";

export default async function MeuPlanoPage() {
  const session = await requireAuthorizedSession({
    types: [OrganizationType.fornecedor],
    href: "/app/meu-plano",
  });

  const [plan, catalog] = await Promise.all([
    getSupplierPlanInfo(session.organizationId),
    prisma.serviceCategory.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Meu Plano</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">{plan.planName}</h1>
        <p className="mt-2 text-neutral-600">
          Visão somente leitura dos limites + seleção de categorias inclusas. Checkout de upgrade no
          Dia 5.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Cotações internas / mês</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {plan.franchise.isUnlimited ? "∞" : plan.monthlyQuota}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Usadas {plan.franchise.used}
            {plan.franchise.isUnlimited ? "" : ` de ${plan.franchise.limit}`}
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Categorias inclusas</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{plan.categoriesIncluded}</p>
          <p className="mt-1 text-xs text-neutral-400">
            Adicionais sob demanda (modelo escalável)
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Valor</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {plan.priceCents === 0
              ? "Grátis"
              : `R$ ${(plan.priceCents / 100).toFixed(2).replace(".", ",")}`}
          </p>
          <p className="mt-1 text-xs text-neutral-400">{plan.isFree ? "Plano Free" : "Plano pago"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Categorias do pacote</h2>
        <div className="mt-4">
          <SupplierCategoriesForm
            categories={catalog}
            selectedIds={plan.categoryIds}
            maxIncluded={plan.categoriesIncluded}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
        <div>
          <p className="font-semibold text-amber-900">Precisa de mais cotações ou categorias?</p>
          <p className="mt-1 text-sm text-amber-800">
            Intermediário e Premium liberam quotas maiores. Checkout no Dia 5.
          </p>
        </div>
        <Link href="/app/meu-plano#upgrade">
          <Button type="button">Upgrade (em breve)</Button>
        </Link>
      </div>
    </div>
  );
}
