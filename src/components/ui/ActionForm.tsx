"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export type ActionFormState = {
  ok: boolean;
  message?: string;
  checkoutUrl?: string | null;
} | null;

type ActionFormProps = {
  action: (state: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  submitLabel: string;
  pendingLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

function SubmitButton({
  label,
  pendingLabel,
  size,
  variant,
  disabled,
  navigating,
}: {
  label: string;
  pendingLabel: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  navigating?: boolean;
}) {
  const { pending } = useFormStatus();
  const busy = pending || navigating;
  return (
    <Button
      type="submit"
      size={size}
      variant={variant}
      className="w-full"
      disabled={busy || disabled}
    >
      {busy ? pendingLabel : label}
    </Button>
  );
}

export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Processando...",
  size,
  variant,
  className,
  disabled,
  children,
}: ActionFormProps) {
  const [state, dispatch] = useActionState(action, null);

  useEffect(() => {
    if (!state?.checkoutUrl) return;
    window.location.assign(state.checkoutUrl);
  }, [state]);

  return (
    <form action={dispatch} className={className}>
      {children}
      <div className="col-span-full">
        <SubmitButton
          label={submitLabel}
          pendingLabel={pendingLabel}
          size={size}
          variant={variant}
          disabled={disabled}
          navigating={Boolean(state?.checkoutUrl)}
        />
        {state?.message ? (
          <p
            role="alert"
            className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${
              state.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
