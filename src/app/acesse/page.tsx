import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Acesse" };

export default function AcessePage() {
  return (
    <AuthCard
      title="Acesse sua conta"
      subtitle="Entre para gerenciar cotações, propostas e sua organização."
    >
      <Suspense fallback={<p className="text-sm text-neutral-500">Carregando formulário...</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
