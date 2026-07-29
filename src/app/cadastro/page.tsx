import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = { title: "Cadastro" };

type PageProps = {
  searchParams: Promise<{ tipo?: string; ref?: string }>;
};

export default async function CadastroPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Criar conta"
      subtitle="Escolha o perfil, confirme o e-mail em duas etapas e comece a usar a plataforma."
    >
      <RegisterForm defaultType={params.tipo} referralCode={params.ref} />
    </AuthCard>
  );
}
