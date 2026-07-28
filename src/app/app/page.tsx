import Link from "next/link";
import { MemberRole, OrganizationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { profileLabel } from "@/features/navigation/menu";
import {
  getDashboardKpis,
  getSupplierDashboardKpis,
} from "@/features/quotations/kpis";
import { markOverdueCompliance } from "@/features/compliance/expire";
import { Button } from "@/components/ui/Button";

export default async function AppHomePage() {
  const session = await getSession();
  if (!session) redirect("/acesse");

  const label = profileLabel(session.organizationType, session.role);
  const isSolicitante =
    session.organizationType === OrganizationType.sindico ||
    session.organizationType === OrganizationType.administradora;
  const isFornecedor = session.organizationType === OrganizationType.fornecedor;

  if (isFornecedor) {
    await markOverdueCompliance(session.organizationId);
  }

  const kpis = isFornecedor
    ? null
    : await getDashboardKpis({
        organizationId: session.organizationId,
        organizationType: session.organizationType,
      });
  const supplierKpis = isFornecedor
    ? await getSupplierDashboardKpis(session.organizationId)
    : null;

  const highlights: Record<string, string[]> = {
    [OrganizationType.sindico]: [
      "Cadastre condomínios e abra cotações com franquia mensal",
      "Compare propostas e finalize na plataforma",
      "Acompanhe saldo de cotações do mês no dashboard",
    ],
    [OrganizationType.fornecedor]: [
      "Receba oportunidades por categoria",
      "Envie propostas com múltiplas condições",
      "Mantenha compliance documental em dia",
    ],
    [OrganizationType.administradora]:
      session.role === MemberRole.master
        ? [
            "Gestão de condomínios e cotações da carteira",
            "Acesso a parcerias, comissões e financeiro",
            "Analytics e SLA (módulos Premium)",
          ]
        : [
            "Gestão operacional de condomínios e cotações",
            "Negociação e aprovação de propostas",
            "Sem acesso às telas financeiras (restrito ao Master)",
          ],
    [OrganizationType.master_admin]: [
      "Parametrize franquias, planos e lembretes",
      "Gerencie banners, WhatsApp e catálogo",
      "Audite compliance e migrações de perfil",
    ],
  };

  const cards = isSolicitante && kpis
    ? [
        { title: "Cotações abertas", value: String(kpis.openQuotations) },
        { title: "Propostas recebidas", value: String(kpis.proposalsReceived) },
        {
          title: "Aprovadas / Recusadas",
          value: `${kpis.approved} / ${kpis.rejected}`,
        },
        {
          title: "Saldo do mês",
          value: kpis.isUnlimited ? "∞" : String(kpis.franchiseRemaining ?? 0),
          hint: kpis.isUnlimited
            ? "Franquia ilimitada"
            : `Usadas ${kpis.franchiseUsed} de ${kpis.franchiseLimit}`,
        },
      ]
    : supplierKpis
      ? [
          {
            title: "Oportunidades",
            value: String(supplierKpis.pendingOpportunities),
            hint: "Pendentes",
          },
          { title: "Propostas enviadas", value: String(supplierKpis.proposalsSent) },
          { title: "Aprovadas", value: String(supplierKpis.approved) },
          {
            title: "Saldo do mês",
            value: supplierKpis.isUnlimited
              ? "∞"
              : String(supplierKpis.franchiseRemaining ?? 0),
            hint: supplierKpis.isUnlimited
              ? "Ilimitado"
              : `Usadas ${supplierKpis.franchiseUsed} de ${supplierKpis.franchiseLimit}`,
          },
        ]
      : [
          { title: "Categorias", value: "13", hint: "Seed oficial" },
          { title: "Serviços", value: "110", hint: "Seed oficial" },
          { title: "Franquia Free", value: "15" },
          { title: "Overrides", value: "—", hint: "Dia 6" },
        ];

  const items = highlights[session.organizationType] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">Olá, {session.name}</h1>
          <p className="mt-2 text-neutral-500">
            Você está em <span className="font-semibold text-neutral-800">{session.organizationName}</span>{" "}
            como <span className="font-semibold text-neutral-800">{label}</span>.
          </p>
        </div>
        {isSolicitante && kpis ? (
          kpis.canCreateQuotation ? (
            <Link href="/app/cotacoes/nova">
              <Button>Nova cotação</Button>
            </Link>
          ) : (
            <div className="text-right">
              <Button disabled>Nova cotação</Button>
              <p className="mt-2 max-w-xs text-xs text-amber-700">
                Franquia esgotada. Faça upgrade para liberar novas cotações.
              </p>
            </div>
          )
        ) : null}
        {isFornecedor ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/app/oportunidades">
              <Button>Oportunidades</Button>
            </Link>
            <Link href="/app/compliance">
              <Button variant="secondary">Compliance</Button>
            </Link>
          </div>
        ) : null}
        {session.organizationType === OrganizationType.master_admin ? (
          <Link href="/app/plataforma/catalogo">
            <Button>Gerenciar catálogo</Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur"
          >
            <p className="text-sm text-neutral-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">{card.value}</p>
            {"hint" in card && card.hint ? (
              <p className="mt-1 text-xs text-neutral-400">{card.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      {supplierKpis && supplierKpis.overdueDocuments > 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {supplierKpis.overdueDocuments} documento(s) em atraso.{" "}
          <Link href="/app/compliance" className="font-semibold underline">
            Regularizar compliance
          </Link>
        </div>
      ) : null}

      {isFornecedor ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/app/oportunidades?view=lista&status=pendente" className="font-semibold text-[#9333EA] hover:underline">
            Ver pendentes →
          </Link>
          <Link href="/app/meu-plano" className="font-semibold text-[#9333EA] hover:underline">
            Meu Plano →
          </Link>
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">O que este perfil pode fazer</h2>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-neutral-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9333EA]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
