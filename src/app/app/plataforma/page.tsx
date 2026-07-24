import { OrganizationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const session = await getSession();
  if (!session || session.organizationType !== OrganizationType.master_admin) {
    redirect("/app");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Master Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Painel da plataforma</h1>
        <p className="mt-2 text-neutral-600">
          Estrutura do Dia 1 pronta. Parametrizações (franquia, banners, catálogo) entram nos Dias 2 e
          6.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          "Franquia Free global / override por cliente",
          "CRUD de categorias e serviços",
          "Banners da landing (até 10)",
          "WhatsApp e Blog externos",
          "Auditoria de compliance",
          "Migrações e planos",
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-black/5 bg-white/80 p-5 text-sm font-medium">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
