import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Acesse" };

export default function AcessePage() {
  return (
    <AuthCard
      title="Acesse sua conta"
      subtitle="Entre para gerenciar cotações, propostas e sua organização."
    >
      <LoginForm />
      <div className="mt-6 rounded-2xl border border-black/5 bg-black/[0.02] p-4 text-xs text-neutral-600">
        <p className="font-semibold text-neutral-800">Contas demo (senha: Demo@123456)</p>
        <ul className="mt-2 space-y-1">
          <li>sindico@demo.cotacondo.com.br</li>
          <li>fornecedor@demo.cotacondo.com.br</li>
          <li>adm.master@demo.cotacondo.com.br</li>
          <li>adm.operacional@demo.cotacondo.com.br</li>
          <li>admin@cotacondo.com.br</li>
        </ul>
      </div>
    </AuthCard>
  );
}
