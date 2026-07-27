import Link from "next/link";
import { MemberRole, OrganizationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { profileLabel } from "@/features/navigation/menu";
import { getDashboardKpis } from "@/features/quotations/kpis";
import { Button } from "@/components/ui/Button";

export default async function AppHomePage() {
  const session = await getSession();
  if (!session) redirect("/acesse");

  const label = profileLabel(session.organizationType, session.role);
  const isSolicitante =
    session.organizationType === OrganizationType.sindico ||
    session.organizationType === OrganizationType.administradora;
  const kpis = await getDashboardKpis({
    organizationId: session.organizationId,
    organizationType: session.organizationType,
  });

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

  const cards = isSolicitante
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
    : session.organizationType === OrganizationType.fornecedor
      ? [
          { title: "Oportunidades", value: "0", hint: "Dia 3" },
          { title: "Propostas enviadas", value: "0", hint: "Dia 3" },
          { title: "Aprovadas", value: "0" },
          { title: "Recusadas", value: "0" },
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
        {isSolicitante ? (
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
