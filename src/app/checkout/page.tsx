import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { formatPriceCents, listActivePlans } from "@/features/billing/plan-gate";
import { formAction } from "@/lib/form-action";
import { startPlanCheckoutAction } from "@/features/billing/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PublicHeader } from "@/components/marketing/PublicHeader";

type PageProps = {
  searchParams: Promise<{ plan?: string; canceled?: string }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const planSlug = params.plan?.trim();
  const session = await getSession();

  if (!planSlug) {
    const plans = await listActivePlans();
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2f8,_#eff6ff_45%,_#f0fdfa)]">
        <PublicHeader />
        <Container className="py-12">
          <h1 className="text-3xl font-bold text-neutral-900">Escolha um plano</h1>
          <p className="mt-2 text-neutral-600">Deep-link: /checkout?plan=adm-premium</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/checkout?plan=${plan.slug}`}
                className="rounded-2xl border border-black/5 bg-white/90 p-5 hover:border-[#9333EA]/40"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9333EA]">
                  {plan.audience}
                </p>
                <h2 className="mt-2 text-xl font-bold">{plan.name}</h2>
                <p className="mt-2 text-2xl font-semibold">{formatPriceCents(plan.priceCents)}/mês</p>
                <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  const plan = await prisma.plan.findFirst({
    where: { slug: planSlug, isActive: true },
  });
  if (!plan) {
    return (
      <div className="min-h-screen p-10">
        <p>Plano não encontrado.</p>
        <Link href="/checkout" className="text-[#9333EA] underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  if (!session) {
    redirect(`/acesse?next=${encodeURIComponent(`/checkout?plan=${plan.slug}`)}`);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf2f8,_#eff6ff_45%,_#f0fdfa)]">
      <PublicHeader />
      <Container className="py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/5 bg-white/90 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">
            Contratação do plano
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">{plan.name}</h1>
          <p className="mt-2 text-neutral-600">{plan.description}</p>
          <p className="mt-6 text-4xl font-bold text-neutral-900">
            {formatPriceCents(plan.priceCents)}
            <span className="text-base font-medium text-neutral-500"> / mês</span>
          </p>
          {params.canceled ? (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Pagamento cancelado. Você pode tentar novamente.
            </p>
          ) : null}
          <p className="mt-4 text-sm text-neutral-500">
            Conta: {session.email} · {session.organizationName}
          </p>
          <form action={formAction(startPlanCheckoutAction)} className="mt-8 space-y-3">
            <input type="hidden" name="planSlug" value={plan.slug} />
            <Button type="submit" className="w-full">
              {plan.isFree ? "Ativar plano Free" : "Ir para pagamento"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-neutral-400">
            Gateway sandbox · features liberadas após confirmação do pagamento
          </p>
        </div>
      </Container>
    </div>
  );
}
