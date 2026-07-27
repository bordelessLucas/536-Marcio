"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { importCondominiumsAction, type ImportResult } from "@/features/condominiums/actions";

export function ImportCondominiumsForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  return (
    <form
      className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-5"
      action={(formData) => {
        startTransition(async () => {
          const response = await importCondominiumsAction(formData);
          setResult(response);
          if (response.ok) router.refresh();
        });
      }}
    >
      <h2 className="text-lg font-semibold text-neutral-900">Importar CSV</h2>
      <p className="text-sm text-neutral-600">
        Colunas: <code>nome,endereco,cnpj,contato,email,telefone</code>. Máx. 500 linhas / 2MB.
      </p>
      <a
        href="/templates/condominios-template.csv"
        className="inline-block text-sm font-medium text-[#9333EA] hover:underline"
      >
        Baixar template CSV
      </a>
      <input
        name="file"
        type="file"
        accept=".csv,text/csv"
        required
        className="block w-full text-sm"
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Importando..." : "Importar"}
      </Button>
      {result ? (
        <div className="space-y-2 text-sm">
          <p className={result.ok ? "text-emerald-700" : "text-red-700"}>{result.message}</p>
          {result.errors.length > 0 ? (
            <ul className="max-h-40 overflow-auto rounded-xl bg-red-50 p-3 text-red-700">
              {result.errors.slice(0, 20).map((error) => (
                <li key={`${error.line}-${error.message}`}>
                  Linha {error.line}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
