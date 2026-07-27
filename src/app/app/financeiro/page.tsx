import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { requireAuthorizedSession } from "@/lib/auth/guards";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/financeiro" });

  return (
    <PlaceholderPage
      title="Financeiro"
      description="Comissionamento e extratos no Dia 5. Operacional não acessa esta área."
    />
  );
}
