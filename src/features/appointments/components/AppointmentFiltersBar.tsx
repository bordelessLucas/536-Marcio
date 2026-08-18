"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { DateRangePreset } from "@/features/appointments/filters";

type CondominiumOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type Props = {
  condominiums: CondominiumOption[];
  categories: CategoryOption[];
  basePath: string;
};

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "next_30", label: "Próximos 30 dias" },
  { value: "current_month", label: "Mês atual" },
  { value: "next_quarter", label: "Próximo trimestre" },
  { value: "current_year", label: "Ano corrente" },
];

export function AppointmentFiltersBar({ condominiums, categories, basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <form
      className="grid gap-3 rounded-2xl border border-black/5 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const next = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          if (String(value)) next.set(key, String(value));
        }
        router.push(`${basePath}?${next.toString()}`);
      }}
    >
      <label className="text-sm">
        Condomínio
        <select
          name="condominiumId"
          defaultValue={params.get("condominiumId") ?? ""}
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Todos</option>
          {condominiums.map((condo) => (
            <option key={condo.id} value={condo.id}>
              {condo.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Categoria / Serviço
        <select
          name="categoryId"
          defaultValue={params.get("categoryId") ?? ""}
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Atalho de período
        <select
          name="preset"
          defaultValue={params.get("preset") ?? ""}
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Personalizado</option>
          {PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Data inicial
        <input
          name="dateFrom"
          type="date"
          defaultValue={params.get("dateFrom") ?? ""}
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </label>

      <label className="text-sm">
        Data final
        <input
          name="dateTo"
          type="date"
          defaultValue={params.get("dateTo") ?? ""}
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </label>

      <div className="md:col-span-2 xl:col-span-5">
        <button
          type="submit"
          className="rounded-xl bg-[#9333EA] px-4 py-2 text-sm font-semibold text-white"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
