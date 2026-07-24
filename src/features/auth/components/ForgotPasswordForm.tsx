"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const response = await forgotPasswordAction(formData);
          setResult(response);
        });
      }}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
          E-mail da conta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
        />
      </div>

      {result?.ok ? (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <p>{result.message}</p>
          {result.resetToken ? (
            <p className="mt-2 break-all text-xs">
              Token local:{" "}
              <Link
                className="font-semibold text-[#9333EA] underline"
                href={`/redefinir-senha?token=${result.resetToken}`}
              >
                abrir redefinição
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {result && !result.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar link de recuperação"}
      </Button>
    </form>
  );
}
