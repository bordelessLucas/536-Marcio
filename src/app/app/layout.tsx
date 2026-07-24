import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/acesse?next=/app");
  }

  return (
    <AppShell
      session={{
        name: session.name,
        email: session.email,
        organizationName: session.organizationName,
        organizationType: session.organizationType,
        role: session.role,
      }}
    >
      {children}
    </AppShell>
  );
}
