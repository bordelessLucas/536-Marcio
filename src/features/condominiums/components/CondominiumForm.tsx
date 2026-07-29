"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  createCondominiumAction,
  updateCondominiumAction,
} from "@/features/condominiums/actions";

export type CondominiumFormValues = {
  id: string;
  name: string;
  address: string;
  document: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  towers: number | null;
  units: number | null;
};

type Props = {
  initial?: CondominiumFormValues | null;
  onCancelEdit?: () => void;
};

export function CondominiumForm({ initial = null, onCancelEdit }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  return (
    <form
      className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-5"
      action={(formData) => {
        startTransition(async () => {
          const result = isEdit
            ? await updateCondominiumAction(formData)
            : await createCondominiumAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Erro ao salvar");
            setMessage(null);
            return;
          }
          setError(null);
          setMessage(result.message ?? "Salvo");
          onCancelEdit?.();
          router.refresh();
        });
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">
          {isEdit ? "Editar condomínio" : "Novo condomínio"}
        </h2>
        {isEdit && onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm font-medium text-neutral-500 hover:underline"
          >
            Cancelar
          </button>
        ) : null}
      </div>
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <input
        name="name"
        required
        defaultValue={initial?.name ?? ""}
        placeholder="Nome"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <input
        name="address"
        required
        defaultValue={initial?.address ?? ""}
        placeholder="Endereço"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <input
        name="document"
        defaultValue={initial?.document ?? ""}
        placeholder="CNPJ"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <input
        name="contactName"
        defaultValue={initial?.contactName ?? ""}
        placeholder="Contato"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <input
        name="contactEmail"
        type="email"
        defaultValue={initial?.contactEmail ?? ""}
        placeholder="E-mail"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <input
        name="contactPhone"
        defaultValue={initial?.contactPhone ?? ""}
        placeholder="Telefone"
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="towers"
          type="number"
          min={1}
          defaultValue={initial?.towers ?? ""}
          placeholder="Torres"
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
        <input
          name="units"
          type="number"
          min={1}
          defaultValue={initial?.units ?? ""}
          placeholder="Unidades"
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </div>
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando..." : isEdit ? "Atualizar" : "Cadastrar"}
      </Button>
    </form>
  );
}
