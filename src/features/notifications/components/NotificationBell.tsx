"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";

type NotificationBellProps = {
  unreadCount: number;
};

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative">
      <Link
        href="/app/notificacoes"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-neutral-700 hover:bg-black/[0.04]"
        aria-label={unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[#C026D3] px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
      {open && unreadCount > 0 ? (
        <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-black/5 bg-white p-3 text-xs shadow-lg">
          {unreadCount} não lida{unreadCount === 1 ? "" : "s"}. Abrir central.
        </div>
      ) : null}
    </div>
  );
}
