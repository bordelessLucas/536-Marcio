"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { declineInviteAction } from "@/features/opportunities/actions";

type Props = {
  inviteId: string;
};

export function DeclineInviteForm({ inviteId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Declinar
      </Button>
    );
  }

  return (
    <form
      className="space-y-2 rounded-xl border border-black/10 bg-white p-3"
      action={(formData) => {
        startTransition(async () => {
          const result = await declineInviteAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Erro");
            return;
          }
          setOpen(false);
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="inviteId" value={inviteId} />
      <textarea
        name="reason"
        rows={2}
        placeholder="Motivo (opcional)"
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" variant="danger" size="sm" disabled={pending}>
          {pending ? "..." : "Confirmar declínio"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
