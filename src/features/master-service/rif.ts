export type RifComparativeRow = {
  proposalId: string;
  supplierName: string;
  amountCents: number;
  paymentTerms: string;
  vsAverage: "acima" | "abaixo" | "na_media";
  deltaPercent: number;
};

export function buildRifComparative(
  proposals: Array<{
    id: string;
    organization: { name: string };
    conditions: Array<{ amountCents: number; paymentTerms: string }>;
  }>,
): { averageCents: number; rows: RifComparativeRow[]; markdown: string } {
  const priced = proposals
    .map((proposal) => {
      const best = [...proposal.conditions].sort((a, b) => a.amountCents - b.amountCents)[0];
      if (!best) return null;
      return {
        proposalId: proposal.id,
        supplierName: proposal.organization.name,
        amountCents: best.amountCents,
        paymentTerms: best.paymentTerms,
      };
    })
    .filter(Boolean) as Array<{
    proposalId: string;
    supplierName: string;
    amountCents: number;
    paymentTerms: string;
  }>;

  if (priced.length === 0) {
    return {
      averageCents: 0,
      rows: [],
      markdown: "Sem propostas com valores para gerar a Análise RIF.",
    };
  }

  const averageCents = Math.round(
    priced.reduce((sum, row) => sum + row.amountCents, 0) / priced.length,
  );

  const rows: RifComparativeRow[] = priced.map((row) => {
    const deltaPercent =
      averageCents === 0
        ? 0
        : Math.round(((row.amountCents - averageCents) / averageCents) * 1000) / 10;
    const vsAverage: RifComparativeRow["vsAverage"] =
      Math.abs(deltaPercent) < 1 ? "na_media" : deltaPercent > 0 ? "acima" : "abaixo";
    return { ...row, vsAverage, deltaPercent };
  });

  const lines = [
    "## Análise RIF — Relatório de Inteligência de Fornecimento",
    "",
    `Média das propostas: **R$ ${(averageCents / 100).toFixed(2)}**`,
    "",
    "| Fornecedor | Valor | vs média | Condição de pagamento |",
    "|---|---:|---:|---|",
    ...rows.map(
      (row) =>
        `| ${row.supplierName} | R$ ${(row.amountCents / 100).toFixed(2)} | ${row.deltaPercent > 0 ? "+" : ""}${row.deltaPercent}% (${row.vsAverage}) | ${row.paymentTerms} |`,
    ),
    "",
    "### Insights",
    ...rows.map((row) => {
      if (row.vsAverage === "abaixo") {
        return `- **${row.supplierName}** está abaixo da média (${row.deltaPercent}%).`;
      }
      if (row.vsAverage === "acima") {
        return `- **${row.supplierName}** está acima da média (+${row.deltaPercent}%).`;
      }
      return `- **${row.supplierName}** está alinhado à média.`;
    }),
  ];

  return { averageCents, rows, markdown: lines.join("\n") };
}

/** Stub de integração LLM — estrutura pronta para chave plataforma/cliente */
export async function generateAiRifInsights(input: {
  mode: "platform" | "client";
  comparativeMarkdown: string;
}): Promise<string> {
  const source = input.mode === "client" ? "API do cliente" : "API da plataforma";
  return [
    `Insights gerados via ${source} (estrutura preparada para GPT-4).`,
    "Priorize propostas abaixo da média com condições de pagamento compatíveis ao fluxo de caixa do condomínio.",
    "Valide compliance e histórico de SLA antes do aceite final.",
    "",
    "---",
    input.comparativeMarkdown.slice(0, 500),
  ].join("\n");
}
