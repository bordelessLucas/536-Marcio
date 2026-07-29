import Link from "next/link";
import { OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { togglePartnershipLockAction } from "@/features/partnerships/actions";
import { reviewMigrationAction } from "@/features/migration/actions";
import { formAction } from "@/lib/form-action";

export default async function Page() {
  await requireAuthorizedSession({
    types: [OrganizationType.master_admin],
    href: "/app/plataforma",
  });

  const [settings, migrations] = await Promise.all([
    prisma.platformSettings.findUnique({ where: { id: "default" } }),
    prisma.organizationMigration.findMany({
      where: { status: { in: ["pending_payment", "pending_review", "approved"] } },
      include: {
        targetPlan: true,
        organization: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Master Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Painel da plataforma</h1>
          <p className="mt-2 text-neutral-600">
            Catálogo, compliance, trava de parcerias e migrações.
          </p>
        </div>
        <Link href="/app/plataforma/catalogo">
          <Button>Abrir catálogo</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "CRUD de categorias e serviços", href: "/app/plataforma/catalogo" },
          { label: "Fila de compliance", href: "/app/plataforma/compliance" },
          { label: "Banners e links da landing", href: "/app/plataforma/banners" },
          { label: "Migrações", href: "/app/plataforma/migracoes" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-black/5 bg-white/80 p-5 text-sm font-medium hover:border-[#9333EA]/30"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="font-semibold">Trava Growth Loop (parcerias)</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Quando ativa, só fornecedores Intermediário+ podem ser vinculados.
        </p>
        <form action={formAction(togglePartnershipLockAction)} className="mt-4 flex items-center gap-3">
          <input type="hidden" name="enabled" value={settings?.partnershipLockEnabled ? "false" : "true"} />
          <Button type="submit" size="sm" variant="secondary">
            {settings?.partnershipLockEnabled ? "Desativar trava" : "Ativar trava"}
          </Button>
          <span className="text-sm text-neutral-500">
            Status: {settings?.partnershipLockEnabled ? "ativa" : "desativada"}
          </span>
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          Franquia Free solicitante: {settings?.freeQuotaSolicitante ?? 15} · Addon categoria:{" "}
          R$ {((settings?.categoryAddonPriceCents ?? 2900) / 100).toFixed(2)}
        </p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Migrações recentes</h2>
          <Link href="/app/plataforma/migracoes" className="text-sm text-[#9333EA]">
            Ver todas
          </Link>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {migrations.length === 0 ? (
            <li className="text-neutral-500">Nenhuma migração.</li>
          ) : (
            migrations.map((item) => (
              <li key={item.id} className="rounded-xl border border-black/5 px-3 py-2">
                {item.organization.name} → {item.targetPlan.name} · {item.status}
                {item.status === "pending_review" ? (
                  <form action={formAction(reviewMigrationAction)} className="mt-2 flex gap-2">
                    <input type="hidden" name="migrationId" value={item.id} />
                    <Button type="submit" name="decision" value="approve" size="sm">
                      Aprovar
                    </Button>
                    <Button
                      type="submit"
                      name="decision"
                      value="reject"
                      size="sm"
                      variant="secondary"
                    >
                      Rejeitar
                    </Button>
                  </form>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
