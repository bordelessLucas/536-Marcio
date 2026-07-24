"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const response = await resetPasswordAction(formData);
          setResult(response);
        });
      }}
    >
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
        />
      </div>

      {result?.ok ? (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {result.message}{" "}
          <Link href="/acesse" className="font-semibold underline">
            Ir para login
          </Link>
        </div>
      ) : null}

      {result && !result.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending || !token}>
        {pending ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
