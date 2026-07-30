"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createQuotationAction } from "@/features/quotations/actions";

type Option = { id: string; name: string; categoryId?: string; isMandatory?: boolean; periodicityHint?: string | null };

type Props = {
  condominiums: Option[];
  categories: Option[];
  services: Option[];
  canCreate: boolean;
  franchiseLabel: string;
};

export function NewQuotationForm({ condominiums, categories, services, canCreate, franchiseLabel }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [serviceItemId, setServiceItemId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredServices = useMemo(
    () => services.filter((item) => item.categoryId === categoryId),
    [services, categoryId],
  );

  const selectedService = filteredServices.find((item) => item.id === serviceItemId);

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/5 bg-white/80 p-6"
      action={(formData) => {
        startTransition(async () => {
          const result = await createQuotationAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Não foi possível criar a cotação.");
            return;
          }
          router.push(`/app/cotacoes/${result.quotationId}`);
          router.refresh();
        });
      }}
    >
      <div className="rounded-xl bg-fuchsia-50 px-4 py-3 text-sm text-[#7c3aed]">
        Franquia do mês: <strong>{franchiseLabel}</strong>
      </div>

      {!canCreate ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Limite de cotações atingido. Faça upgrade do plano para continuar abrindo cotações.
          <div className="mt-2">
            <a href="/app/configuracoes" className="font-semibold underline">
              Ver planos / upgrade
            </a>
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium">Condomínio</label>
        <select
          name="condominiumId"
          required
          disabled={!canCreate}
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
        >
          <option value="">Selecione...</option>
          {condominiums.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Categoria (mãe)</label>
          <select
            name="categoryId"
            required
            disabled={!canCreate}
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setServiceItemId("");
            }}
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Segmento</label>
          <select
            name="serviceItemId"
            required
            disabled={!canCreate}
            value={serviceItemId}
            onChange={(event) => setServiceItemId(event.target.value)}
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
          >
            <option value="">Selecione...</option>
            {filteredServices.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedService?.isMandatory || selectedService?.periodicityHint ? (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {selectedService.isMandatory ? <strong>Serviço obrigatório. </strong> : null}
          {selectedService.periodicityHint
            ? `Periodicidade sugerida: ${selectedService.periodicityHint}.`
            : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Urgência</label>
          <select
            name="urgency"
            defaultValue="media"
            disabled={!canCreate}
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Propostas mínimas</label>
          <input
            name="minProposals"
            type="number"
            min={1}
            defaultValue={3}
            disabled={!canCreate}
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Propostas máximas</label>
          <input
            name="maxProposals"
            type="number"
            min={1}
            defaultValue={10}
            disabled={!canCreate}
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descrição detalhada</label>
        <textarea
          name="description"
          required
          rows={5}
          disabled={!canCreate}
          className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          placeholder="Descreva escopo, prazos e restrições..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Anexos (até 5, máx. 10MB cada)</label>
        <input
          name="attachments"
          type="file"
          multiple
          disabled={!canCreate}
          className="block w-full text-sm"
        />
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={!canCreate || pending}>
        {pending ? "Abrindo cotação..." : canCreate ? "Abrir cotação" : "Franquia esgotada"}
      </Button>
    </form>
  );
}
