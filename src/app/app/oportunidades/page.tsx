import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { requireAuthorizedSession } from "@/lib/auth/guards";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/oportunidades" });

  return (
    <PlaceholderPage
      title="Oportunidades"
      description="Painel Kanban e envio de propostas do fornecedor no Dia 3."
    />
  );
}
