import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ConfirmEmailForm } from "@/features/auth/components/ConfirmEmailForm";

export const metadata = { title: "Confirmar e-mail" };

export default function ConfirmarPage() {
  return (
    <AuthCard
      title="Confirmação em duas etapas"
      subtitle="Digite o código de 6 dígitos para ativar sua conta."
    >
      <Suspense fallback={<p className="text-sm text-neutral-500">Carregando...</p>}>
        <ConfirmEmailForm />
      </Suspense>
    </AuthCard>
  );
}
