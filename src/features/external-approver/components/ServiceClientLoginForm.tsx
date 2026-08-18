"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { serviceClientLoginAction } from "@/features/external-approver/login-action";

type Props = {
  slug: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
};

export function ServiceClientLoginForm({
  slug,
  displayName,
  primaryColor,
  secondaryColor,
  logoUrl,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100 px-4 py-10"
      style={{ ["--brand-primary" as string]: primaryColor, ["--brand-secondary" as string]: secondaryColor }}
    >
      <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-xl">
        <div className="text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={displayName} className="mx-auto h-14 object-contain" />
          ) : (
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">{displayName}</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Portal seguro do Aprovador Externo — Cota Service
          </p>
        </div>

        <form
          className="mt-8 space-y-4"
          action={(formData) => {
            startTransition(async () => {
              formData.set("slug", slug);
              const result = await serviceClientLoginAction(formData);
              if (!result.ok) {
                setError(result.message ?? "Falha no login.");
                return;
              }
              router.push("/app/aprovador/cotacoes");
              router.refresh();
            });
          }}
        >
          <label className="block text-sm">
            E-mail
            <input
              name="email"
              type="email"
              required
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
          </label>
          <label className="block text-sm">
            Senha
            <input
              name="password"
              type="password"
              required
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
