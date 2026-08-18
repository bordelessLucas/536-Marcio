"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createServiceAppointmentAction } from "@/features/appointments/actions";
import { formAction } from "@/lib/form-action";

type CondominiumOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };
type ServiceItemOption = { id: string; name: string; categoryId: string };

type Props = {
  condominiums: CondominiumOption[];
  categories: CategoryOption[];
  serviceItems: ServiceItemOption[];
};

export function AppointmentCreateForm({
  condominiums,
  categories,
  serviceItems,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await formAction(createServiceAppointmentAction)(formData);
          router.refresh();
        });
      }}
      className="grid gap-3 rounded-2xl border border-black/5 bg-white/80 p-5 md:grid-cols-2"
    >
      <h2 className="md:col-span-2 font-semibold">Registrar novo compromisso</h2>

      <label className="text-sm">
        Condomínio *
        <select
          name="condominiumId"
          required
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Selecione</option>
          {condominiums.map((condo) => (
            <option key={condo.id} value={condo.id}>
              {condo.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Categoria / Serviço *
        <select
          name="categoryId"
          required
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm md:col-span-2">
        Segmento (opcional)
        <select name="serviceItemId" className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm">
          <option value="">—</option>
          {serviceItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Data do compromisso *
        <input
          name="appointmentDate"
          type="date"
          required
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </label>

      <label className="text-sm">
        Antecedência para disparo *
        <select
          name="leadMode"
          defaultValue="days_30"
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="exact_date">Selecionar dia na agenda</option>
          <option value="days_15">15 dias antes</option>
          <option value="days_30">30 dias antes</option>
          <option value="days_60">60 dias antes</option>
          <option value="days_90">90 dias antes</option>
        </select>
      </label>

      <label className="text-sm md:col-span-2">
        Data exata do disparo (quando &quot;Selecionar dia na agenda&quot;)
        <input
          name="leadExactDate"
          type="date"
          className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </label>

      <label className="text-sm md:col-span-2">
        Observações
        <textarea
          name="notes"
          rows={2}
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Registrando..." : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
