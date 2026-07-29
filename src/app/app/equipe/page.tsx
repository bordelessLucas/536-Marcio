import { MemberRole, OrganizationType } from "@prisma/client";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { inviteTeamMemberAction } from "@/features/referrals/actions";
import { formAction } from "@/lib/form-action";
import { Button } from "@/components/ui/Button";

export default async function EquipePage() {
  const session = await requireAuthorizedSession({
    types: [OrganizationType.administradora],
    href: "/app/equipe",
  });

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: session.organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const canInvite = session.role === MemberRole.master;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Equipe</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Usuários da administradora</h1>
        <p className="mt-2 text-neutral-600">
          Master convida operacionais e outros masters. Indicações rastreadas via link de partner.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Papel</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium">{member.user.name}</td>
                <td className="px-4 py-3 text-neutral-600">{member.user.email}</td>
                <td className="px-4 py-3 capitalize">{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canInvite ? (
        <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
          <h2 className="font-semibold">Convidar usuário</h2>
          <form action={formAction(inviteTeamMemberAction)} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Nome
              <input name="name" required className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3" />
            </label>
            <label className="text-sm">
              E-mail
              <input
                name="email"
                type="email"
                required
                className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3"
              />
            </label>
            <label className="text-sm">
              Papel
              <select name="role" className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3">
                <option value="operational">Operacional</option>
                <option value="master">Master</option>
              </select>
            </label>
            <div className="flex items-end">
              <Button type="submit">Enviar convite</Button>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Apenas o Master pode convidar usuários.</p>
      )}
    </div>
  );
}
