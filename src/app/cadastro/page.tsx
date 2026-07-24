import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = { title: "Cadastro" };

export default function CadastroPage() {
  return (
    <AuthCard
      title="Criar conta"
      subtitle="Escolha o perfil, confirme o e-mail em duas etapas e comece a usar a plataforma."
    >
      <RegisterForm />
    </AuthCard>
  );
}
