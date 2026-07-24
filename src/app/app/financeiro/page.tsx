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
      title="Financeiro"
      description="Comissionamento e extratos no Dia 5. Operacional não acessa esta área."
    />
  );
}
