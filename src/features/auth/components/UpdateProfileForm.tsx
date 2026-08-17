"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function UpdateProfileForm({ defaultName }: { defaultName: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-5"
      action={(formData) => {
        startTransition(async () => {
          const response = await updateProfileAction(formData);
          setResult(response);
        });
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-neutral-800" htmlFor="name">
          Nome de exibição
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={defaultName}
          aria-describedby="name-help"
          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 hover:border-black/20 focus:border-[#9333EA]/40 focus:ring-4 focus:ring-[#9333EA]/10"
        />
        <p id="name-help" className="mt-2 text-xs leading-5 text-neutral-500">
          Este nome aparece no cabeçalho, nas cotações e no histórico de atividades.
        </p>
      </div>

      {result?.ok ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {result.message}
        </p>
      ) : null}
      {result && !result.ok ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="min-w-36 active:translate-y-px">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
