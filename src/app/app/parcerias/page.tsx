import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { requireAuthorizedSession } from "@/lib/auth/guards";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/parcerias" });

  return (
    <PlaceholderPage
      title="Parcerias"
      description="Gestão de parcerias e Growth Loop no Dia 5 (somente Master da Administradora)."
    />
  );
}
