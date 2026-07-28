"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitProposalAction } from "@/features/opportunities/actions";

type Props = {
  inviteId: string;
  canSubmit: boolean;
  blockMessage?: string;
};

type ConditionDraft = {
  amount: string;
  paymentTerms: string;
};

export function ProposalForm({ inviteId, canSubmit, blockMessage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [conditions, setConditions] = useState<ConditionDraft[]>([
    { amount: "", paymentTerms: "" },
    { amount: "", paymentTerms: "" },
  ]);

  function updateCondition(index: number, patch: Partial<ConditionDraft>) {
    setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  if (!canSubmit) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {blockMessage ?? "Envio bloqueado pelo plano ou compliance."}
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-black/5 bg-white/80 p-5"
      action={(formData) => {
        startTransition(async () => {
          const result = await submitProposalAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Erro ao enviar");
            setMessage(null);
            return;
          }
          setError(null);
          setMessage(result.message ?? "Enviada");
          router.refresh();
        });
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-neutral-900">Enviar proposta</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            setConditions((prev) => [...prev, { amount: "", paymentTerms: "" }])
          }
        >
          + Condição
        </Button>
      </div>
      <input type="hidden" name="inviteId" value={inviteId} />
      <input type="hidden" name="conditionCount" value={conditions.length} />

      <div className="space-y-3">
        {conditions.map((condition, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-black/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Condição {index + 1}
            </p>
            <input
              name={`amount_${index}`}
              required
              type="number"
              min="0.01"
              step="0.01"
              value={condition.amount}
              onChange={(e) => updateCondition(index, { amount: e.target.value })}
              placeholder="Valor (R$)"
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
            <input
              name={`paymentTerms_${index}`}
              required
              value={condition.paymentTerms}
              onChange={(e) => updateCondition(index, { paymentTerms: e.target.value })}
              placeholder="Condição de pagamento"
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
            <input
              type="file"
              name={`attachment_${index}`}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="block w-full text-sm"
            />
            {conditions.length > 1 ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() =>
                  setConditions((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remover condição
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar proposta"}
      </Button>
    </form>
  );
}
