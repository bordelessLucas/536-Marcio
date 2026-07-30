export type ProposalAnalysisHint = {
  /** Reserva para scores futuros (IA / regras). */
  score?: number | null;
  labels?: string[];
  priceEvaluation?: {
    proposedCents: number;
    averageCents: number;
    percentDelta: number;
    position: "acima" | "abaixo" | "dentro";
    evaluatedAt: string;
  };
  notes?: string;
};

export function parseProposalMetadata(raw: string | null | undefined): ProposalAnalysisHint {
  try {
    return JSON.parse(raw || "{}") as ProposalAnalysisHint;
  } catch {
    return {};
  }
}

export function regionHintFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1]! : parts[0] ?? null;
}

export type PriceEvaluationResult = {
  proposedCents: number;
  averageCents: number;
  percentDelta: number;
  position: "acima" | "abaixo" | "dentro";
  sampleSize: number;
  source: "quotation" | "service_history";
};

/** ±5% = dentro da média. */
export function evaluatePriceAgainstAverage(
  proposedCents: number,
  samples: number[],
): Omit<PriceEvaluationResult, "source" | "sampleSize"> & { sampleSize: number } | null {
  if (!Number.isFinite(proposedCents) || proposedCents <= 0) return null;
  if (samples.length === 0) return null;
  const averageCents = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
  if (averageCents <= 0) return null;
  const percentDelta = ((proposedCents - averageCents) / averageCents) * 100;
  const position =
    Math.abs(percentDelta) <= 5 ? "dentro" : percentDelta > 0 ? "acima" : "abaixo";
  return {
    proposedCents,
    averageCents,
    percentDelta: Math.round(percentDelta * 10) / 10,
    position,
    sampleSize: samples.length,
  };
}
