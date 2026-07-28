import { MemberRole, OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { toggleFavoriteSupplierAction } from "@/features/favorites/actions";
import { Button } from "@/components/ui/Button";

export default async function FavoritosPage() {
  const session = await requireAuthorizedSession({
    types: [OrganizationType.administradora],
    roles: [MemberRole.master],
    href: "/app/favoritos",
  });

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: session.organizationId, status: "active" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  let features: { favorites?: boolean } = {};
  try {
    features = JSON.parse(subscription?.plan.featuresJson ?? "{}") as { favorites?: boolean };
  } catch {
    features = {};
  }

  const isPremium =
    Boolean(features.favorites) || subscription?.plan.slug === "adm-premium";

  if (!isPremium) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-neutral-900">Favoritos</h1>
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Favoritar fornecedores é exclusivo do plano Administradora Premium. Faça upgrade para
          liberar a prioridade 1 no motor de distribuição.
        </p>
      </div>
    );
  }

  const [suppliers, favorites] = await Promise.all([
    prisma.organization.findMany({
      where: { type: "fornecedor" },
      orderBy: { name: "asc" },
      include: {
        categories: { include: { category: true } },
        subscriptions: {
          where: { status: "active" },
          include: { plan: true },
          take: 1,
        },
      },
    }),
    prisma.favoriteSupplier.findMany({
      where: { organizationId: session.organizationId },
    }),
  ]);

  const favoriteIds = new Set(favorites.map((item) => item.supplierOrgId));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Premium</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Fornecedores favoritos</h1>
        <p className="mt-2 text-neutral-600">
          Favoritos entram na prioridade 1 do motor de distribuição (categoria + plano pago).
        </p>
      </div>

      <div className="space-y-3">
        {suppliers.map((supplier) => {
          const isFavorite = favoriteIds.has(supplier.id);
          return (
            <div
              key={supplier.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/80 p-4"
            >
              <div>
                <p className="font-semibold text-neutral-900">{supplier.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {supplier.subscriptions[0]?.plan.name ?? "Sem plano"} ·{" "}
                  {supplier.categories.map((link) => link.category.name).join(", ") ||
                    "Sem categorias"}
                </p>
              </div>
              <form
                action={async (formData) => {
                  "use server";
                  await toggleFavoriteSupplierAction(formData);
                }}
              >
                <input type="hidden" name="supplierOrgId" value={supplier.id} />
                <Button type="submit" size="sm" variant={isFavorite ? "secondary" : "primary"}>
                  {isFavorite ? "Remover favorito" : "Favoritar"}
                </Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
