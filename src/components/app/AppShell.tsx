"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Mascot } from "@/components/brand/Mascot";
import { logoutAction } from "@/features/auth/actions";
import { getNavItemsForSession, profileLabel } from "@/features/navigation/menu";
import type { MemberRole, OrganizationType } from "@prisma/client";
import { cn } from "@/lib/cn";

type AppShellProps = {
  children: React.ReactNode;
  session: {
    name: string;
    email: string;
    organizationName: string;
    organizationType: OrganizationType;
    role: MemberRole;
  };
};

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();
  const items = getNavItemsForSession({
    organizationType: session.organizationType,
    role: session.role,
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(192,38,211,0.08),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(6,182,212,0.08),transparent_35%),#ffffff]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-72 shrink-0 border-r border-black/5 bg-white/70 p-5 backdrop-blur-xl md:flex md:flex-col">
          <Logo href="/app" className="mb-8 h-8" />
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/40">Perfil</p>
          <p className="mb-6 text-sm font-semibold text-neutral-900">
            {profileLabel(session.organizationType, session.role)}
          </p>
          <nav className="flex flex-1 flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-fuchsia-50 text-[#9333EA]"
                      : "text-neutral-700 hover:bg-black/[0.04] hover:text-neutral-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAction} className="mt-4 border-t border-black/5 pt-4">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-black/[0.04]"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-white/60 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{session.organizationName}</p>
              <p className="truncate text-xs text-neutral-500">{session.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-neutral-900">{session.name}</p>
                <p className="text-xs text-neutral-500">
                  {profileLabel(session.organizationType, session.role)}
                </p>
              </div>
              <Mascot variant="avatar" className="h-11 w-11" />
            </div>
          </header>
          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
