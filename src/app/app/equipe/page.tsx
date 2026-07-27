import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { requireAuthorizedSession } from "@/lib/auth/guards";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/equipe" });

  return (
    <PlaceholderPage title="Equipe" description="Gestão de usuários operacionais da administradora." />
  );
}
