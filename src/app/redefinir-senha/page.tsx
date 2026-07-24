import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata = { title: "Redefinir senha" };

export default function RedefinirSenhaPage() {
  return (
    <AuthCard title="Nova senha" subtitle="Defina uma senha forte para voltar a acessar.">
      <Suspense fallback={<p className="text-sm text-neutral-500">Carregando...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
