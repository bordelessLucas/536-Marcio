export type DateRangePreset = "next_30" | "current_month" | "next_quarter" | "current_year" | "custom";

export type AppointmentFilterInput = {
  condominiumId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  preset?: DateRangePreset;
};

export function resolveDateRange(input: AppointmentFilterInput): { from?: Date; to?: Date } {
  if (input.preset === "custom" || (!input.preset && (input.dateFrom || input.dateTo))) {
    return { from: input.dateFrom, to: input.dateTo };
  }

  const now = new Date();
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  switch (input.preset) {
    case "next_30": {
      const from = startOfDay(now);
      const to = new Date(from);
      to.setDate(to.getDate() + 30);
      return { from, to };
    }
    case "current_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { from, to };
    }
    case "next_quarter": {
      const from = startOfDay(now);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 3);
      return { from, to };
    }
    case "current_year": {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { from, to };
    }
    default:
      return { from: input.dateFrom, to: input.dateTo };
  }
}

export function parseBrDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatBrDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}
