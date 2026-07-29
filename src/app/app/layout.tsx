import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { AppBannerCarousel } from "@/components/app/AppBannerCarousel";
import { getSession } from "@/lib/auth/session";
import { getAppBannersForSession } from "@/features/marketing/banners";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/acesse?next=/app");
  }

  const banners = await getAppBannersForSession({
    userId: session.userId,
    organizationType: session.organizationType,
  });

  return (
    <AppShell
      session={{
        name: session.name,
        email: session.email,
        organizationName: session.organizationName,
        organizationType: session.organizationType,
        role: session.role,
      }}
      banner={<AppBannerCarousel banners={banners} />}
    >
      {children}
    </AppShell>
  );
}
