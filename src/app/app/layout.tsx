import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { AppBannerCarousel } from "@/components/app/AppBannerCarousel";
import { getSession } from "@/lib/auth/session";
import { getAppBannersForSession } from "@/features/marketing/banners";
import { getUnreadCount } from "@/features/notifications/service";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/acesse?next=/app");
  }

  const [banners, unreadNotifications] = await Promise.all([
    getAppBannersForSession({
      userId: session.userId,
      organizationType: session.organizationType,
    }),
    getUnreadCount(session.userId),
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
      banner={<AppBannerCarousel banners={banners} />}
    >
      {children}
    </AppShell>
  );
}
