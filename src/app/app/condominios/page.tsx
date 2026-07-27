import Link from "next/link";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { archiveCondominiumAction } from "@/features/condominiums/actions";
import { CondominiumForm } from "@/features/condominiums/components/CondominiumForm";
import { ImportCondominiumsForm } from "@/features/condominiums/components/ImportCondominiumsForm";
import { formatCnpj } from "@/lib/cnpj";

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function CondominiosPage({ searchParams }: PageProps) {
  const session = await requireAuthorizedSession({ href: "/app/condominios" });
  const { q } = await searchParams;
  const query = q?.trim();

  const condominiums = await prisma.condominium.findMany({
    where: {
      organizationId: session.organizationId,
      archivedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { address: { contains: query } },
              { document: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Condomínios</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Carteira da organização</h1>
          <p className="mt-2 text-neutral-600">{condominiums.length} ativos</p>
        </div>
        <Link href="/app/cotacoes/nova" className="text-sm font-semibold text-[#9333EA] hover:underline">
          Abrir nova cotação →
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome, endereço ou CNPJ"
          className="h-11 flex-1 rounded-xl border border-black/10 px-3 text-sm"
        />
        <button type="submit" className="h-11 rounded-xl bg-black/[0.04] px-4 text-sm font-semibold">
          Filtrar
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-black/[0.02] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Endereço</th>
                <th className="px-4 py-3 font-medium">CNPJ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {condominiums.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{item.address}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {item.document ? formatCnpj(item.document) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={async (formData) => {
                        "use server";
                        await archiveCondominiumAction(formData);
                      }}
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-red-600 hover:underline">
                        Arquivar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {condominiums.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum condomínio encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <CondominiumForm />
          <ImportCondominiumsForm />
        </div>
      </div>
    </div>
  );
}
