"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          try {
            const response = await loginAction(formData);
            if (response && !response.ok) {
              setResult(response);
              return;
            }
            router.push("/app");
            router.refresh();
          } catch {
            router.push("/app");
            router.refresh();
          }
        });
      }}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
          placeholder="voce@empresa.com.br"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none ring-fuchsia-200 focus:ring-2"
          placeholder="••••••••"
        />
      </div>

      {result && !result.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/recuperar-senha" className="text-[#9333EA] hover:underline">
          Esqueci a senha
        </Link>
        <Link href="/cadastro" className="font-medium text-neutral-800 hover:underline">
          Criar conta
        </Link>
      </div>
    </form>
  );
}
