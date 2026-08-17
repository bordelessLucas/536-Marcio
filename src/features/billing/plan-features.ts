import type { PlanFeatures } from "@/features/billing/plan-gate";

const FEATURE_LABELS: Record<string, string> = {
  whitelabel: "Comparativo whitelabel com a sua marca",
  favorites: "Fornecedores favoritos por categoria",
  partnerships: "Gestão de parcerias com fornecedores",
  commissions: "Comissionamento por fornecedor",
  sla: "SLA e acompanhamento das solicitações",
  crm: "CRM de oportunidades",
  partnershipEligible: "Elegível a parcerias com administradoras",
  cotaService: "Operação conduzida pela equipe CotaCondo",
  rif: "Análise RIF comparativa de propostas",
  managedQuotation: "Cotação gerenciada de ponta a ponta",
  vip: "Banner patrocinado e campanhas VIP",
};

const BASE_FEATURES: Record<"solicitante" | "fornecedor", string[]> = {
  solicitante: [
    "Cadastro de condomínios e abertura de cotações",
    "Comparativo de propostas na plataforma",
    "Negociação e aprovação online",
  ],
  fornecedor: [
    "Recebimento de cotações por categoria",
    "Propostas com múltiplas condições e anexos",
    "Funil de oportunidades e compliance",
  ],
};

/** Planos com preço zerado que não são gratuitos são negociados caso a caso. */
export function isConsultOnlyPlan(plan: { isFree: boolean; priceCents: number }): boolean {
  return !plan.isFree && plan.priceCents === 0;
}

export function parsePlanFeatures(featuresJson: string | null | undefined): PlanFeatures {
  try {
    return JSON.parse(featuresJson || "{}") as PlanFeatures;
  } catch {
    return {};
  }
}

export function describePlanFeatures(input: {
  featuresJson: string | null | undefined;
  monthlyQuota: number | null;
  audience: string;
}): string[] {
  const features = parsePlanFeatures(input.featuresJson);
  const audience = input.audience === "fornecedor" ? "fornecedor" : "solicitante";
  const items = [...BASE_FEATURES[audience]];

  items.push(
    input.monthlyQuota == null
      ? "Franquia mensal ilimitada"
      : `Até ${input.monthlyQuota} cotações por mês`,
  );

  if (features.categoriesIncluded) {
    items.push(
      features.categoriesIncluded === 1
        ? "1 categoria de atuação incluída"
        : `${features.categoriesIncluded} categorias de atuação incluídas`,
    );
  }

  for (const [key, label] of Object.entries(FEATURE_LABELS)) {
    if (features[key as keyof PlanFeatures] === true) items.push(label);
  }

  return items;
}
