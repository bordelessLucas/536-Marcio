import { MemberRole, OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  registerReferralRewardAction,
} from "@/features/referrals/actions";
import { formAction } from "@/lib/form-action";
import { formatPriceCents } from "@/features/billing/money";
import { Button } from "@/components/ui/Button";

export default async function IndicacoesPage() {
  const session = await requireAuthorizedSession({
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
    href: "/app/indicacoes",
  });

  let user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  if (!user.referralCode) {
    const code = `CC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    user = await prisma.user.update({
      where: { id: session.userId },
      data: { referralCode: code },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralLink = `${baseUrl}/cadastro?ref=${user.referralCode}`;

  const [referrals, rewards] = await Promise.all([
    prisma.user.findMany({
      where: { referredByUserId: session.userId },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.referralReward.findMany({
      where: { referrerUserId: session.userId },
      include: { referred: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRewards = rewards.reduce((sum, item) => sum + item.amountCents, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Partner</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Indicações</h1>
        <p className="mt-2 text-neutral-600">
          Link personalizado com rastreabilidade e registro de ganhos recorrentes ou abatimentos.
        </p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <p className="text-sm text-neutral-500">Seu link de indicação</p>
        <p className="mt-2 break-all font-mono text-sm font-semibold text-[#9333EA]">{referralLink}</p>
        <p className="mt-2 text-xs text-neutral-500">Código: {user.referralCode}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Indicados</p>
          <p className="mt-2 text-3xl font-bold">{referrals.length}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <p className="text-sm text-neutral-500">Ganhos / abatimentos</p>
          <p className="mt-2 text-3xl font-bold">{formatPriceCents(totalRewards)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Indicados rastreados</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {referrals.length === 0 ? (
            <li className="text-neutral-500">Nenhuma indicação ainda.</li>
          ) : (
            referrals.map((item) => (
              <li key={item.id} className="rounded-xl border border-black/5 px-3 py-2">
                {item.name} · {item.email} · {item.createdAt.toLocaleDateString("pt-BR")}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Registrar ganho / abatimento</h2>
        <form action={formAction(registerReferralRewardAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Indicado
            <select name="referredUserId" required className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3">
              <option value="">Selecione</option>
              {referrals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Tipo
            <select name="kind" className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3">
              <option value="recurring_credit">Crédito recorrente</option>
              <option value="discount">Abatimento</option>
              <option value="commission_share">Share de comissão</option>
            </select>
          </label>
          <label className="text-sm">
            Valor (R$)
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <label className="text-sm">
            Notas
            <input name="notes" className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3" />
          </label>
          <Button type="submit">Registrar</Button>
        </form>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Histórico</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {rewards.map((item) => (
            <li key={item.id} className="rounded-xl border border-black/5 px-3 py-2">
              {item.referred.name} · {item.kind} · {formatPriceCents(item.amountCents)}
              {item.yearMonth ? ` · ${item.yearMonth}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
