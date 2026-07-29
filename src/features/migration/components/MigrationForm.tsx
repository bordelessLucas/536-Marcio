"use client";

import { formatPriceCents } from "@/features/billing/money";
import { requestMigrationAction, type ActionResult } from "@/features/migration/actions";
import { Button } from "@/components/ui/Button";
import { useState, useTransition } from "react";

type PlanOption = {
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  isFree: boolean;
};

export function MigrationForm({ plans }: { plans: PlanOption[] }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const response = await requestMigrationAction(formData);
          setResult(response);
        });
      }}
    >
      <div className="space-y-3">
        {plans.map((plan) => (
          <label
            key={plan.slug}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${
              plan.isFree
                ? "border-red-200 bg-red-50/60"
                : "border-black/5 bg-white/80 hover:border-[#9333EA]/30"
            }`}
          >
            <input
              type="radio"
              name="planSlug"
              value={plan.slug}
              disabled={plan.isFree}
              className="mt-1"
              required={!plan.isFree}
            />
            <div>
              <p className="font-semibold text-neutral-900">{plan.name}</p>
              <p className="text-sm text-neutral-600">{plan.description}</p>
              <p className="mt-1 font-medium">{formatPriceCents(plan.priceCents)}/mês</p>
              {plan.isFree ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  Bloqueado: migração para Administradora Free não é permitida.
                </p>
              ) : null}
            </div>
          </label>
        ))}
      </div>

      {result && !result.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Processando..." : "Continuar para checkout"}
      </Button>
    </form>
  );
}
