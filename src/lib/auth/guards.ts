import { redirect } from "next/navigation";
import type { MemberRole, OrganizationType } from "@prisma/client";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { canAccessHref } from "@/features/navigation/menu";

export async function requireAuthorizedSession(options?: {
  types?: OrganizationType[];
  roles?: MemberRole[];
  href?: string;
}): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/acesse?next=/app");
  }

  if (options?.href && !canAccessHref(options.href, session, { checkFeatures: false })) {
    redirect("/app");
  }

  if (options?.types && !options.types.includes(session.organizationType)) {
    redirect("/app");
  }

  if (options?.roles && !options.roles.includes(session.role)) {
    redirect("/app");
  }

  return session;
}
