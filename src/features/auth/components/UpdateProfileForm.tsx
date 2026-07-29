"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function UpdateProfileForm({ defaultName }: { defaultName: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const response = await updateProfileAction(formData);
          setResult(response);
        });
      }}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={defaultName}
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
        />
      </div>

      {result?.ok ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{result.message}</p>
      ) : null}
      {result && !result.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
}
