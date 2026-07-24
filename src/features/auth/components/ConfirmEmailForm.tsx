"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  confirmEmailAction,
  resendConfirmationAction,
  type ActionResult,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function ConfirmEmailForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const devCodeParam = searchParams.get("devCode") ?? "";
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(
    devCodeParam
      ? { ok: true, message: "Código de desenvolvimento gerado.", devCode: devCodeParam }
      : null,
  );

  return (
    <div className="space-y-4">
      {result?.devCode ? (
        <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-900">
          <p className="font-semibold">Ambiente local — código de confirmação</p>
          <p className="mt-1 font-mono text-2xl tracking-[0.3em]">{result.devCode}</p>
          <p className="mt-1 text-xs opacity-80">Em produção este código chega por e-mail.</p>
        </div>
      ) : null}

      <form
        className="space-y-4"
        action={(formData) => {
          startTransition(async () => {
            try {
              const response = await confirmEmailAction(formData);
              if (response && !response.ok) {
                setResult(response);
              }
            } catch {
              // redirect após confirmação
            }
          });
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={emailParam}
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="code">
            Código de 6 dígitos
          </label>
          <input
            id="code"
            name="code"
            required
            maxLength={6}
            defaultValue={devCodeParam}
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-center font-mono text-lg tracking-[0.4em] outline-none ring-fuchsia-200 focus:ring-2"
          />
        </div>

        {result && !result.ok ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Confirmando..." : "Confirmar e entrar"}
        </Button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            const response = await resendConfirmationAction(formData);
            setResult(response);
          });
        }}
      >
        <input type="hidden" name="email" value={emailParam} />
        <Button type="submit" variant="secondary" className="w-full" disabled={pending || !emailParam}>
          Reenviar código
        </Button>
      </form>
    </div>
  );
}
