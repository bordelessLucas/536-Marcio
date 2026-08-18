import Link from "next/link";
import { requireExternalApprover } from "@/features/external-approver/guards";
import {
  listExternalApproverQuotations,
  type ExternalQuotationTab,
} from "@/features/external-approver/data";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

const TABS: Array<{ key: ExternalQuotationTab; label: string }> = [
  { key: "pendentes", label: "Pendentes" },
  { key: "aprovadas", label: "Aprovadas" },
  { key: "recusadas", label: "Recusadas" },
];

export default async function ExternalApproverQuotationsPage({ searchParams }: PageProps) {
  const session = await requireExternalApprover();
  const params = await searchParams;
  const tab = (params.tab as ExternalQuotationTab) || "pendentes";
  const activeTab = TABS.some((item) => item.key === tab) ? tab : "pendentes";

  const quotations = await listExternalApproverQuotations({
    userId: session.userId,
    organizationId: session.organizationId,
    tab: activeTab,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Cota Service</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Minhas Cotações</h1>
        <p className="mt-2 text-neutral-600">
          Cotações dos condomínios vinculados ao seu perfil de aprovador externo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={`/app/aprovador/cotacoes?tab=${item.key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === item.key
                ? "bg-[#9333EA] text-white"
                : "bg-white text-neutral-700 ring-1 ring-black/10"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Condomínio</th>
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="px-4 py-3 font-medium">Atualização</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  Nenhuma cotação nesta aba.
                </td>
              </tr>
            ) : (
              quotations.map((quotation) => (
                <tr key={quotation.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/aprovador/cotacoes/${quotation.id}`}
                      className="font-semibold text-[#9333EA]"
                    >
                      {quotation.publicId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{quotation.condominium.name}</td>
                  <td className="px-4 py-3">
                    {quotation.category.name} · {quotation.serviceItem.name}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {quotation.updatedAt.toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
