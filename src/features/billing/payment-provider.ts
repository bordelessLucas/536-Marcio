export type CreateCheckoutInput = {
  amountCents: number;
  currency?: string;
  description: string;
  organizationId: string;
  checkoutId: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult = {
  externalId: string;
  checkoutUrl: string;
  provider: string;
};

export type WebhookParseResult = {
  eventId: string;
  eventType: string;
  externalCheckoutId: string;
  status: "paid" | "failed" | "canceled" | "past_due";
  raw: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  parseWebhook(payload: unknown, signature?: string | null): WebhookParseResult;
}

export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = "sandbox";

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const externalId = `sandbox_${input.checkoutId}`;
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      externalId,
      checkoutUrl: `${base}/checkout/pay/${input.checkoutId}`,
      provider: this.name,
    };
  }

  parseWebhook(payload: unknown): WebhookParseResult {
    const body = (payload ?? {}) as {
      eventId?: string;
      eventType?: string;
      externalCheckoutId?: string;
      status?: "paid" | "failed" | "canceled" | "past_due";
    };

    if (!body.eventId || !body.externalCheckoutId || !body.status) {
      throw new Error("Webhook sandbox inválido");
    }

    return {
      eventId: body.eventId,
      eventType: body.eventType ?? `checkout.${body.status}`,
      externalCheckoutId: body.externalCheckoutId,
      status: body.status,
      raw: payload,
    };
  }
}

let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const name = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();
  // Pluggable: Stripe/Asaas/Pagar.me podem implementar PaymentProvider depois.
  if (name !== "sandbox") {
    console.warn(`PAYMENT_PROVIDER=${name} sem adapter; usando sandbox.`);
  }
  cached = new SandboxPaymentProvider();
  return cached;
}
