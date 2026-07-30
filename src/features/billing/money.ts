export function formatPriceCents(cents: number): string {
  if (cents === 0) return "Grátis";
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/** Pró-rata linear pelo restante do ciclo mensal (MVP). */
export function calculateProrationCents(input: {
  fromPriceCents: number;
  toPriceCents: number;
  periodStart: Date;
  periodEnd: Date;
  asOf?: Date;
}): number {
  const asOf = input.asOf ?? new Date();
  const totalMs = input.periodEnd.getTime() - input.periodStart.getTime();
  if (totalMs <= 0) return 0;
  const remainingMs = Math.max(0, input.periodEnd.getTime() - asOf.getTime());
  const fraction = Math.min(1, remainingMs / totalMs);
  const delta = input.toPriceCents - input.fromPriceCents;
  return Math.round(delta * fraction);
}
