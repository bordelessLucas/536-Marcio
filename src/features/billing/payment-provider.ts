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
  recurring?: boolean;
  customer: {
    name: string;
    document: string;
    email: string;
    phone?: string | null;
  };
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
  status: "pending" | "paid" | "failed" | "canceled" | "past_due";
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

type AsaasCustomer = { id: string };
type AsaasPayment = {
  id: string;
  invoiceUrl: string;
  subscription?: string | null;
  externalReference?: string | null;
};
type AsaasSubscription = { id: string };
type AsaasList<T> = { data: T[] };

export class AsaasPaymentProvider implements PaymentProvider {
  readonly name = "asaas";
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookToken: string | undefined;

  constructor() {
    const environment = (process.env.ASAAS_ENVIRONMENT ?? "sandbox").toLowerCase();
    const production = environment === "production";
    this.baseUrl = production
      ? "https://api.asaas.com/v3"
      : "https://api-sandbox.asaas.com/v3";
    this.apiKey = production
      ? process.env.ASAAS_PRODUCTION_API_KEY ?? process.env.ASAAS_API_KEY ?? ""
      : process.env.ASAAS_SANDBOX_API_KEY ?? process.env.ASAAS_API_KEY ?? "";
    this.webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!this.apiKey) {
      throw new Error(
        `Chave da API Asaas não configurada para o ambiente ${environment}.`,
      );
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        access_token: this.apiKey,
        "User-Agent": "CotaCondo/1.0",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | { errors?: Array<{ description?: string }>; message?: string }
      | T
      | null;
    if (!response.ok) {
      const errorBody = body as
        | { errors?: Array<{ description?: string }>; message?: string }
        | null;
      const details =
        errorBody?.errors?.map((item) => item.description).filter(Boolean).join("; ") ||
        errorBody?.message ||
        `HTTP ${response.status}`;
      throw new Error(`Asaas: ${details}`);
    }
    return body as T;
  }

  private async getOrCreateCustomer(input: CreateCheckoutInput): Promise<string> {
    const document = input.customer.document.replace(/\D/g, "");
    if (document.length !== 11 && document.length !== 14) {
      throw new Error(
        "CPF/CNPJ da organização é obrigatório e deve ser válido para cobrar via Asaas.",
      );
    }

    const query = new URLSearchParams({
      externalReference: input.organizationId,
      limit: "1",
    });
    const existing = await this.request<AsaasList<AsaasCustomer>>(
      `/customers?${query.toString()}`,
    );
    if (existing.data[0]?.id) return existing.data[0].id;

    const customer = await this.request<AsaasCustomer>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.customer.name,
        cpfCnpj: document,
        email: input.customer.email,
        mobilePhone: input.customer.phone?.replace(/\D/g, "") || undefined,
        externalReference: input.organizationId,
        notificationDisabled: false,
      }),
    });
    return customer.id;
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const customerId = await this.getOrCreateCustomer(input);
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDate = nextDueDate.toISOString().slice(0, 10);
    const value = input.amountCents / 100;

    if (input.recurring) {
      const existingQuery = new URLSearchParams({
        externalReference: input.checkoutId,
        limit: "1",
      });
      const existing = await this.request<AsaasList<AsaasSubscription>>(
        `/subscriptions?${existingQuery.toString()}`,
      );
      const subscription =
        existing.data[0] ??
        (await this.request<AsaasSubscription>("/subscriptions", {
          method: "POST",
          body: JSON.stringify({
            customer: customerId,
            billingType: "UNDEFINED",
            value,
            nextDueDate: dueDate,
            cycle: "MONTHLY",
            description: input.description,
            externalReference: input.checkoutId,
          }),
        }));

      // A primeira cobrança é criada logo após a assinatura. Pequenos retries
      // evitam redirecionar antes de a fatura ficar disponível no Asaas.
      let firstPayment: AsaasPayment | undefined;
      for (let attempt = 0; attempt < 4 && !firstPayment; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        }
        const payments = await this.request<AsaasList<AsaasPayment>>(
          `/subscriptions/${subscription.id}/payments?limit=1`,
        );
        firstPayment = payments.data[0];
      }
      if (!firstPayment?.invoiceUrl) {
        throw new Error("Asaas não retornou a primeira fatura da assinatura.");
      }

      return {
        externalId: subscription.id,
        checkoutUrl: firstPayment.invoiceUrl,
        provider: this.name,
      };
    }

    const existingQuery = new URLSearchParams({
      externalReference: input.checkoutId,
      limit: "1",
    });
    const existing = await this.request<AsaasList<AsaasPayment>>(
      `/payments?${existingQuery.toString()}`,
    );
    const payment =
      existing.data[0] ??
      (await this.request<AsaasPayment>("/payments", {
        method: "POST",
        body: JSON.stringify({
          customer: customerId,
          billingType: "UNDEFINED",
          value,
          dueDate,
          description: input.description,
          externalReference: input.checkoutId,
        }),
      }));
    return {
      externalId: payment.id,
      checkoutUrl: payment.invoiceUrl,
      provider: this.name,
    };
  }

  parseWebhook(payload: unknown, signature?: string | null): WebhookParseResult {
    if (this.webhookToken && signature !== this.webhookToken) {
      throw new Error("Token do webhook Asaas inválido");
    }

    const body = (payload ?? {}) as {
      id?: string;
      event?: string;
      payment?: {
        id?: string;
        subscription?: string | null;
        externalReference?: string | null;
      };
    };
    if (!body.id || !body.event || !body.payment?.id) {
      throw new Error("Webhook Asaas inválido");
    }

    const paidEvents = new Set([
      "PAYMENT_CONFIRMED",
      "PAYMENT_RECEIVED",
      "PAYMENT_RECEIVED_IN_CASH",
    ]);
    const canceledEvents = new Set([
      "PAYMENT_DELETED",
      "PAYMENT_REFUNDED",
      "PAYMENT_REFUND_IN_PROGRESS",
      "PAYMENT_CHARGEBACK_REQUESTED",
      "PAYMENT_CHARGEBACK_DISPUTE",
    ]);
    const failedEvents = new Set([
      "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
      "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
    ]);

    let status: WebhookParseResult["status"] = "pending";
    if (paidEvents.has(body.event)) status = "paid";
    else if (body.event === "PAYMENT_OVERDUE") status = "past_due";
    else if (canceledEvents.has(body.event)) status = "canceled";
    else if (failedEvents.has(body.event)) status = "failed";

    return {
      eventId: body.id,
      eventType: body.event,
      externalCheckoutId: body.payment.subscription ?? body.payment.id,
      status,
      raw: payload,
    };
  }
}

let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const name = (process.env.PAYMENT_PROVIDER ?? "sandbox").toLowerCase();
  if (name === "asaas") {
    cached = new AsaasPaymentProvider();
    return cached;
  }
  if (name !== "sandbox") {
    throw new Error(`PAYMENT_PROVIDER=${name} não suportado.`);
  }
  cached = new SandboxPaymentProvider();
  return cached;
}
