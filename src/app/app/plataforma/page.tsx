import Link from "next/link";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { Button } from "@/components/ui/Button";

export default async function Page() {
  await requireAuthorizedSession({ href: "/app/plataforma" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Master Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Painel da plataforma</h1>
          <p className="mt-2 text-neutral-600">
            Catálogo oficial liberado no Dia 2. Demais parametrizações avançam nos próximos dias.
          </p>
        </div>
        <Link href="/app/plataforma/catalogo">
          <Button>Abrir catálogo</Button>
        </Link>
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
