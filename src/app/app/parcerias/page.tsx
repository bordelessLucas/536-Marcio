import { MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { PlaceholderPage } from "@/components/app/PlaceholderPage";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const session = await getSession();
  if (!session || session.role !== MemberRole.master) {
    redirect("/app");
  }

  return (
    <PlaceholderPage
      title="Parcerias"
      description="Gestão de parcerias e Growth Loop no Dia 5 (somente Master da Administradora)."
    />
  );
}
