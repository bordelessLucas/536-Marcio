import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/features/billing/plan-gate";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageProps = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const checkout = params.checkout
    ? await prisma.paymentCheckout.findUnique({
        where: { id: params.checkout },
        include: { plan: true },
      })
    : null;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Assinatura ativa
        </p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Pagamento confirmado</h1>
        {checkout ? (
          <p className="mt-3 text-neutral-700">
            {checkout.plan?.name ?? checkout.kind} · {formatPriceCents(checkout.amountCents)}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-neutral-600">
          Features liberadas após confirmação do gateway.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/app/meu-plano">
            <Button>Ver meu plano</Button>
          </Link>
          <Link href="/app">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
