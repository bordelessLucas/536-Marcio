import { MemberRole, OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { can, getPlanGate, formatPriceCents } from "@/features/billing/plan-gate";
import { createCommissionAgreementAction, updateCommissionAgreementAction } from "@/features/commissions/actions";
import { formAction } from "@/lib/form-action";
import { Button } from "@/components/ui/Button";

type PageProps = {
  searchParams: Promise<{
    supplierOrgId?: string;
    yearMonth?: string;
    categoryId?: string;
  }>;
};

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const session = await requireAuthorizedSession({
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
    href: "/app/financeiro",
  });

  const gate = await getPlanGate(session.organizationId);
  if (!can(gate, "commissions")) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Comissionamento disponível no plano Administradora Premium.
        </p>
      </div>
    );
  }

  const filters = await searchParams;
  const yearMonth =
    filters.yearMonth?.trim() ||
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [agreements, entries, partners, categories] = await Promise.all([
    prisma.commissionAgreement.findMany({
      where: { administradoraOrgId: session.organizationId },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commissionEntry.findMany({
      where: {
        administradoraOrgId: session.organizationId,
        yearMonth,
        ...(filters.supplierOrgId ? { supplierOrgId: filters.supplierOrgId } : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.partnership.findMany({
      where: { administradoraOrgId: session.organizationId, status: "active" },
      include: { supplier: true },
    }),
    prisma.serviceCategory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const totalExpected = entries.reduce((sum, item) => sum + item.commissionCents, 0);
  const totalVolume = entries.reduce((sum, item) => sum + item.volumeCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">
          Master · Financeiro
        </p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Comissões e receita</h1>
        <p className="mt-2 text-neutral-600">
          Operacional não acessa esta área. Extrato alimentado após aprovação de cotação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Expectativa ({yearMonth})</p>
          <p className="mt-2 text-3xl font-bold">{formatPriceCents(totalExpected)}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Volume aprovado</p>
          <p className="mt-2 text-3xl font-bold">{formatPriceCents(totalVolume)}</p>
        </div>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-black/5 bg-white/80 p-4">
        <input
          name="yearMonth"
          defaultValue={yearMonth}
          placeholder="AAAA-MM"
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        />
        <select
          name="supplierOrgId"
          defaultValue={filters.supplierOrgId ?? ""}
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Todos fornecedores</option>
          {partners.map((item) => (
            <option key={item.supplierOrgId} value={item.supplierOrgId}>
              {item.supplier.name}
            </option>
          ))}
        </select>
        <select
          name="categoryId"
          defaultValue={filters.categoryId ?? ""}
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Todas categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
      </form>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Extrato do período</h2>
        <div className="mt-3 space-y-2">
          {entries.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem lançamentos neste filtro.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap justify-between gap-2 rounded-xl border border-black/5 px-3 py-2 text-sm"
              >
                <span>
                  {entry.supplier.name} · {entry.status}
                </span>
                <span className="font-medium">
                  {formatPriceCents(entry.commissionCents)} (vol.{" "}
                  {formatPriceCents(entry.volumeCents)})
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Novo acordo de comissão</h2>
        <form action={formAction(createCommissionAgreementAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Fornecedor
            <select
              name="supplierOrgId"
              required
              className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
            >
              <option value="">Selecione</option>
              {partners.map((item) => (
                <option key={item.supplierOrgId} value={item.supplierOrgId}>
                  {item.supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Tipo
            <select name="feeType" className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3">
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Fixo (R$)</option>
            </select>
          </label>
          <label className="text-sm">
            Valor
            <input
              name="feeValue"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <label className="text-sm">
            Duração (meses, 1–12)
            <input
              name="durationMonths"
              type="number"
              min={1}
              max={12}
              className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="isRecurring" />
            Recorrente
          </label>
          <label className="text-sm md:col-span-2">
            Notas
            <input
              name="notes"
              className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <Button type="submit">Cadastrar acordo</Button>
        </form>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Acordos cadastrados (editáveis)</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Ajuste % ou valor quando a negociação mudar — controle real dos ganhos.
        </p>
        <div className="mt-4 space-y-4">
          {agreements.map((item) => (
            <form
              key={item.id}
              action={formAction(updateCommissionAgreementAction)}
              className="grid gap-2 rounded-xl border border-black/5 p-3 md:grid-cols-[1.2fr_0.7fr_0.7fr_auto]"
            >
              <input type="hidden" name="id" value={item.id} />
              <div>
                <p className="font-medium">{item.supplier.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.isRecurring ? "recorrente" : item.durationMonths ? `${item.durationMonths} meses` : "vigente"}
                </p>
              </div>
              <select
                name="feeType"
                defaultValue={item.feeType}
                className="h-10 rounded-xl border border-black/10 px-2 text-sm"
              >
                <option value="percent">%</option>
                <option value="fixed">R$ fixo</option>
              </select>
              <input
                name="feeValue"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={item.feeValue}
                className="h-10 rounded-xl border border-black/10 px-2 text-sm"
              />
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </form>
          ))}
          {agreements.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum acordo ainda.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
