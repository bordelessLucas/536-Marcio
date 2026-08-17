export const SUPPLIER_PIPELINE_STAGES = [
  "nova",
  "em_andamento",
  "proposta_enviada",
  "negociacao",
  "ganha",
  "perdida",
] as const;

export type SupplierPipelineStageValue = (typeof SUPPLIER_PIPELINE_STAGES)[number];

export const SUPPLIER_PIPELINE_META: Record<
  SupplierPipelineStageValue,
  { label: string; description: string; accent: string; surface: string }
> = {
  nova: {
    label: "Novas",
    description: "Convites recebidos",
    accent: "bg-sky-500",
    surface: "bg-sky-50/60",
  },
  em_andamento: {
    label: "Em andamento",
    description: "Em preparação",
    accent: "bg-amber-500",
    surface: "bg-amber-50/60",
  },
  proposta_enviada: {
    label: "Propostas enviadas",
    description: "Aguardando retorno",
    accent: "bg-violet-500",
    surface: "bg-violet-50/60",
  },
  negociacao: {
    label: "Em negociação",
    description: "Condições em revisão",
    accent: "bg-fuchsia-500",
    surface: "bg-fuchsia-50/60",
  },
  ganha: {
    label: "Ganhas",
    description: "Negócios aprovados",
    accent: "bg-emerald-500",
    surface: "bg-emerald-50/60",
  },
  perdida: {
    label: "Perdidas",
    description: "Encerradas sem venda",
    accent: "bg-rose-500",
    surface: "bg-rose-50/60",
  },
};

export function isSupplierPipelineStage(value: string): value is SupplierPipelineStageValue {
  return SUPPLIER_PIPELINE_STAGES.includes(value as SupplierPipelineStageValue);
}

export function deriveSupplierPipelineStage(input: {
  savedStage?: string | null;
  inviteStatus: string;
  proposalStatus?: string | null;
}): SupplierPipelineStageValue {
  if (input.savedStage && isSupplierPipelineStage(input.savedStage)) {
    return input.savedStage;
  }
  if (input.inviteStatus === "declinado" || input.inviteStatus === "expirado") return "perdida";
  if (input.proposalStatus === "recusada") return "perdida";
  if (input.proposalStatus === "aprovada") return "ganha";
  if (input.proposalStatus === "em_negociacao") return "negociacao";
  if (input.proposalStatus === "enviada") return "proposta_enviada";
  if (input.inviteStatus === "aceito") return "em_andamento";
  return "nova";
}
