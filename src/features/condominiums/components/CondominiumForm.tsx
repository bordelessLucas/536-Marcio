"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createCondominiumAction } from "@/features/condominiums/actions";

export function CondominiumForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-5"
      action={(formData) => {
        startTransition(async () => {
          const result = await createCondominiumAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Erro ao salvar");
            setMessage(null);
            return;
          }
          setError(null);
          setMessage(result.message ?? "Salvo");
          router.refresh();
        });
      }}
    >
      <h2 className="text-lg font-semibold text-neutral-900">Novo condomínio</h2>
      <input name="name" required placeholder="Nome" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      <input name="address" required placeholder="Endereço" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      <input name="document" placeholder="CNPJ" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      <input name="contactName" placeholder="Contato" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      <input name="contactEmail" type="email" placeholder="E-mail" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      <input name="contactPhone" placeholder="Telefone" className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm" />
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando..." : "Cadastrar"}
      </Button>
    </form>
  );
}
