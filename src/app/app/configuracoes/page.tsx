import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UpdateProfileForm } from "@/features/auth/components/UpdateProfileForm";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/acesse");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Configurações</h1>
        <p className="mt-2 text-neutral-600">
          Dados da conta. Alterações de perfil são registradas em auditoria.
        </p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <p className="text-sm text-neutral-500">E-mail</p>
        <p className="mt-1 font-medium text-neutral-900">{user.email}</p>
        <div className="mt-5">
          <UpdateProfileForm defaultName={user.name} />
        </div>
      </div>
    </div>
  );
}
