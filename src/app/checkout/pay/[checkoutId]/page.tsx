import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/features/billing/plan-gate";
import {
  cancelSandboxPaymentAction,
  confirmSandboxPaymentAction,
} from "@/features/billing/actions";
import { formAction } from "@/lib/form-action";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageProps = { params: Promise<{ checkoutId: string }> };

export default async function SandboxPayPage({ params }: PageProps) {
  const { checkoutId } = await params;
  const checkout = await prisma.paymentCheckout.findUnique({
    where: { id: checkoutId },
    include: { plan: true },
  });
  if (!checkout) notFound();

  if (checkout.status === "paid") {
    return (
      <Container className="py-16">
        <p className="text-lg">Este checkout já foi pago.</p>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Container className="py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Gateway Sandbox
          </p>
          <h1 className="mt-3 text-2xl font-bold">Confirmar pagamento</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Simulação de Stripe/Asaas/Pagar.me — nenhum cartão real é cobrado.
          </p>
          <div className="mt-6 space-y-2 rounded-2xl bg-white/5 p-4 text-sm">
            <p>
              <span className="text-neutral-400">Item:</span>{" "}
              {checkout.plan?.name ??
                (checkout.kind === "category_addon"
                  ? `Categorias adicionais × ${checkout.quantity}`
                  : checkout.kind === "custom"
                    ? (() => {
                        try {
                          const meta = JSON.parse(checkout.metadataJson || "{}") as {
                            description?: string;
                          };
                          return meta.description || "Cobrança personalizada";
                        } catch {
                          return "Cobrança personalizada";
                        }
                      })()
                    : checkout.kind)}
            </p>
            <p>
              <span className="text-neutral-400">Valor:</span>{" "}
              {formatPriceCents(checkout.amountCents)}
            </p>
            <p>
              <span className="text-neutral-400">Provider:</span> {checkout.provider}
            </p>
            <p className="break-all text-xs text-neutral-500">ID: {checkout.externalId}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <form action={formAction(confirmSandboxPaymentAction)}>
              <input type="hidden" name="checkoutId" value={checkout.id} />
              <Button type="submit" className="w-full">
                Confirmar pagamento (sandbox)
              </Button>
            </form>
            <form action={formAction(cancelSandboxPaymentAction)}>
              <input type="hidden" name="checkoutId" value={checkout.id} />
              <Button type="submit" variant="secondary" className="w-full">
                Cancelar
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
