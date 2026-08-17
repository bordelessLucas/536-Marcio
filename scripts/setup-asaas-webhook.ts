/**
 * Cria ou atualiza o webhook de pagamentos no Asaas.
 * Requer NEXT_PUBLIC_APP_URL público (HTTPS), ASAAS_WEBHOOK_TOKEN e a chave
 * correspondente a ASAAS_ENVIRONMENT.
 */

type AsaasWebhook = { id: string; url: string };
type AsaasList<T> = { data: T[] };

const environment = (process.env.ASAAS_ENVIRONMENT ?? "sandbox").toLowerCase();
const production = environment === "production";
const apiKey = production
  ? process.env.ASAAS_PRODUCTION_API_KEY ?? process.env.ASAAS_API_KEY
  : process.env.ASAAS_SANDBOX_API_KEY ?? process.env.ASAAS_API_KEY;
const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!apiKey) throw new Error(`Chave Asaas ausente para ${environment}.`);
if (!webhookToken) throw new Error("ASAAS_WEBHOOK_TOKEN ausente.");
if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL ausente.");
const accessToken = apiKey;
const webhookAuthToken = webhookToken;

const parsedUrl = new URL(appUrl);
if (parsedUrl.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(parsedUrl.hostname)) {
  throw new Error("NEXT_PUBLIC_APP_URL deve ser uma URL pública HTTPS.");
}

const baseUrl = production
  ? "https://api.asaas.com/v3"
  : "https://api-sandbox.asaas.com/v3";
const webhookUrl = new URL("/api/webhooks/asaas", parsedUrl).toString();
const events = [
  "PAYMENT_CREATED",
  "PAYMENT_UPDATED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_RECEIVED_IN_CASH",
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "PAYMENT_REFUND_IN_PROGRESS",
  "PAYMENT_CHARGEBACK_REQUESTED",
  "PAYMENT_CHARGEBACK_DISPUTE",
  "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
];

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: accessToken,
      "User-Agent": "CotaCondo/1.0",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    throw new Error(`Asaas HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

async function main() {
  const webhooks = await asaas<AsaasList<AsaasWebhook>>("/webhooks");
  const existing = webhooks.data.find((webhook) => webhook.url === webhookUrl);
  const payload = JSON.stringify({
    name: "CotaCondo Pagamentos",
    url: webhookUrl,
    enabled: true,
    interrupted: false,
    authToken: webhookAuthToken,
    sendType: "SEQUENTIALLY",
    events,
  });

  if (existing) {
    await asaas(`/webhooks/${existing.id}`, { method: "PUT", body: payload });
    console.log(`Webhook Asaas atualizado (${environment}).`);
  } else {
    await asaas("/webhooks", { method: "POST", body: payload });
    console.log(`Webhook Asaas criado (${environment}).`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
