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
          { label: "Franquia Free global / override por cliente", href: null },
          { label: "CRUD de categorias e serviços", href: "/app/plataforma/catalogo" },
          { label: "Fila de compliance", href: "/app/plataforma/compliance" },
          { label: "Banners da landing (até 10)", href: null },
          { label: "WhatsApp e Blog externos", href: null },
          { label: "Migrações e planos", href: null },
        ].map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-black/5 bg-white/80 p-5 text-sm font-medium hover:border-[#9333EA]/30"
            >
              {item.label}
            </Link>
          ) : (
            <div key={item.label} className="rounded-2xl border border-black/5 bg-white/80 p-5 text-sm font-medium">
              {item.label}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
