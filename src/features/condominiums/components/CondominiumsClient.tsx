"use client";

import { useState } from "react";
import { archiveCondominiumAction } from "@/features/condominiums/actions";
import {
  CondominiumForm,
  type CondominiumFormValues,
} from "@/features/condominiums/components/CondominiumForm";
import { ImportCondominiumsForm } from "@/features/condominiums/components/ImportCondominiumsForm";
import { formatCnpj } from "@/lib/cnpj";

type Row = CondominiumFormValues & { address: string };

type Props = {
  condominiums: Row[];
  query?: string;
};

export function CondominiumsClient({ condominiums, query }: Props) {
  const [editing, setEditing] = useState<CondominiumFormValues | null>(null);

  return (
    <>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome, endereço ou CNPJ"
          className="h-11 flex-1 rounded-xl border border-black/10 px-3 text-sm"
        />
        <button type="submit" className="h-11 rounded-xl bg-black/[0.04] px-4 text-sm font-semibold">
          Filtrar
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-black/[0.02] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Endereço</th>
                <th className="px-4 py-3 font-medium">CNPJ</th>
                <th className="px-4 py-3 font-medium">Torres/Unid.</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {condominiums.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{item.address}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {item.document ? formatCnpj(item.document) : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {item.towers ?? "—"} / {item.units ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className="text-[#9333EA] hover:underline"
                        onClick={() =>
                          setEditing({
                            id: item.id,
                            name: item.name,
                            address: item.address,
                            document: item.document,
                            contactName: item.contactName,
                            contactEmail: item.contactEmail,
                            contactPhone: item.contactPhone,
                            towers: item.towers,
                            units: item.units,
                          })
                        }
                      >
                        Editar
                      </button>
                      <form
                        action={async (formData) => {
                          await archiveCondominiumAction(formData);
                        }}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-red-600 hover:underline">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {condominiums.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum condomínio encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <CondominiumForm
            key={editing?.id ?? "new"}
            initial={editing}
            onCancelEdit={editing ? () => setEditing(null) : undefined}
          />
          <ImportCondominiumsForm />
        </div>
      </div>
    </>
  );
}
