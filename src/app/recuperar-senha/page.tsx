import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link seguro para redefinir o acesso.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
