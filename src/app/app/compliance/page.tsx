import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { requireAuthorizedSession } from "@/lib/auth/guards";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/compliance" });

  return (
    <PlaceholderPage
      title="Compliance"
      description="Central documental semestral do fornecedor no Dia 3."
    />
  );
}
