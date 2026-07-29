"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Mascot } from "@/components/brand/Mascot";
import { logoutAction } from "@/features/auth/actions";
import { getNavItemsForSession, profileLabel } from "@/features/navigation/menu";
import type { MemberRole, OrganizationType } from "@prisma/client";
import { cn } from "@/lib/cn";

type AppShellProps = {
  children: React.ReactNode;
  banner?: React.ReactNode;
  session: {
    name: string;
    email: string;
    organizationName: string;
    organizationType: OrganizationType;
    role: MemberRole;
  };
};

function isActivePath(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, session, banner }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = getNavItemsForSession({
    organizationType: session.organizationType,
    role: session.role,
  });
  const profile = profileLabel(session.organizationType, session.role);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
              active
                ? "bg-fuchsia-50 text-[#9333EA]"
                : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(192,38,211,0.07),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(6,182,212,0.07),transparent_32%),#fafafa]">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[200px] shrink-0 flex-col border-r border-black/5 bg-white/80 px-3 py-4 backdrop-blur-xl md:flex">
          <Logo href="/app" className="mb-4 h-7" />
          <p className="mb-3 truncate rounded-md bg-black/[0.03] px-2 py-1 text-[11px] font-semibold text-neutral-600">
            {profile}
          </p>
          {nav}
          <form action={logoutAction} className="mt-3 border-t border-black/5 pt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-800"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-[220px] flex-col bg-white px-3 py-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Logo href="/app" className="h-7" />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-neutral-600 hover:bg-black/[0.04]"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-3 truncate rounded-md bg-black/[0.03] px-2 py-1 text-[11px] font-semibold text-neutral-600">
                {profile}
              </p>
              {nav}
              <form action={logoutAction} className="mt-3 border-t border-black/5 pt-3">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-neutral-500 hover:bg-black/[0.04]"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/5 bg-white/75 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-neutral-700 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{session.organizationName}</p>
                <p className="truncate text-xs text-neutral-500">{session.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-neutral-900">{session.name}</p>
                <p className="text-xs text-neutral-500">{profile}</p>
              </div>
              <Mascot variant="avatar" className="h-9 w-9" />
            </div>
          </header>
          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
            {banner}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
