"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateSupplierCategoriesAction } from "@/features/supplier/actions";

type CategoryOption = { id: string; name: string };

type Props = {
  categories: CategoryOption[];
  selectedIds: string[];
  maxIncluded: number;
};

export function SupplierCategoriesForm({ categories, selectedIds, maxIncluded }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= maxIncluded) return prev;
      return [...prev, id];
    });
  }

  return (
    <form
      className="space-y-4"
      action={() => {
        startTransition(async () => {
          const formData = new FormData();
          for (const id of selected) formData.append("categoryIds", id);
          const result = await updateSupplierCategoriesAction(formData);
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
      <p className="text-sm text-neutral-600">
        Selecione até <strong>{maxIncluded}</strong> categoria(s) inclusa(s) no plano.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((category) => {
          const checked = selected.includes(category.id);
          const disabled = !checked && selected.length >= maxIncluded;
          return (
            <label
              key={category.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                checked ? "border-[#9333EA]/40 bg-[#9333EA]/5" : "border-black/10 bg-white"
              } ${disabled ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(category.id)}
              />
              {category.name}
            </label>
          );
        })}
      </div>
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      <Button type="submit" disabled={pending || selected.length === 0}>
        {pending ? "Salvando..." : "Salvar categorias"}
      </Button>
    </form>
  );
}
