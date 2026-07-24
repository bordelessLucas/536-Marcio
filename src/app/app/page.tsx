import { MemberRole, OrganizationType } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { profileLabel } from "@/features/navigation/menu";
import { redirect } from "next/navigation";

export default async function AppHomePage() {
  const session = await getSession();
  if (!session) redirect("/acesse");

  const label = profileLabel(session.organizationType, session.role);

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

  const items = highlights[session.organizationType] ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Dashboard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">Olá, {session.name}</h1>
        <p className="mt-2 text-neutral-500">
          Você está em <span className="font-semibold text-neutral-800">{session.organizationName}</span>{" "}
          como <span className="font-semibold text-neutral-800">{label}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["Cotações abertas", "Propostas", "Saldo do mês"].map((title) => (
          <div
            key={title}
            className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur"
          >
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">—</p>
            <p className="mt-1 text-xs text-neutral-400">KPIs reais no Dia 2</p>
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
