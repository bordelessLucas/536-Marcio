import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { getSession } from "@/lib/auth/session";
import { getUnreadCount } from "@/features/notifications/service";
import { getPlanGate } from "@/features/billing/plan-gate";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/acesse?next=/app");
  }

  const [unreadNotifications, gate] = await Promise.all([
    getUnreadCount(session.userId),
    getPlanGate(session.organizationId),
  ]);

  return (
    <AppShell
      session={{
        name: session.name,
        email: session.email,
        organizationName: session.organizationName,
        organizationType: session.organizationType,
        role: session.role,
      }}
      unreadNotifications={unreadNotifications}
      features={
        gate && ["active", "past_due"].includes(gate.subscriptionStatus)
          ? gate.features
          : undefined
      }
    >
      {children}
    </AppShell>
  );
}
