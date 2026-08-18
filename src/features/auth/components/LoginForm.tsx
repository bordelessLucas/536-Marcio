"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, type ActionResult } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";

const DEMO_PASSWORD = "123456";

function isSafeNextPath(path: string): boolean {
  return (
    (path.startsWith("/app") || path.startsWith("/checkout")) &&
    !path.startsWith("//") &&
    !path.includes("://")
  );
}

const DEMO_ACCOUNTS = [
  { email: "sindico@demo.cotacondo.com.br", label: "Síndico" },
  { email: "fornecedor@demo.cotacondo.com.br", label: "Fornecedor" },
  { email: "adm.master@demo.cotacondo.com.br", label: "Adm Master" },
  { email: "adm.operacional@demo.cotacondo.com.br", label: "Adm Operacional" },
  { email: "masterservice@demo.cotacondo.com.br", label: "Master Service" },
  { email: "aprovador@demo.cotacondo.com.br", label: "Aprovador Externo" },
  { email: "admin@cotacondo.com.br", label: "Master Admin" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/app";
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            const destination = isSafeNextPath(nextPath) ? nextPath : "/app";
            router.push(destination);
            router.refresh();
          } catch {
            const destination = isSafeNextPath(nextPath) ? nextPath : "/app";
            router.push(destination);
            router.refresh();
          }
        });
      }}
    >
      <input type="hidden" name="next" value={nextPath} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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

      {process.env.NEXT_PUBLIC_APP_ENV !== "production" ? (
        <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 text-xs text-neutral-600">
          <p className="font-semibold text-neutral-800">
            Contas demo · Firebase Auth (senha: {DEMO_PASSWORD})
          </p>
          <p className="mt-1 text-neutral-500">Clique para preencher e-mail e senha.</p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  className="text-left hover:text-[#9333EA] hover:underline"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(DEMO_PASSWORD);
                    setResult(null);
                  }}
                >
                  {account.email} — {account.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
