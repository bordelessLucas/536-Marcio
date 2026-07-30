import Link from "next/link";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { listNotifications } from "@/features/notifications/service";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/features/notifications/actions";
import { formAction } from "@/lib/form-action";
import { Button } from "@/components/ui/Button";

export default async function NotificacoesPage() {
  const session = await requireAuthorizedSession({ href: "/app/notificacoes" });
  const items = await listNotifications(session.userId, 80);
  const unread = items.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Alertas</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Notificações</h1>
          <p className="mt-2 text-neutral-600">
            {unread > 0 ? `${unread} não lida(s).` : "Tudo em dia — nenhuma não lida."}
          </p>
        </div>
        {unread > 0 ? (
          <form action={formAction(markAllNotificationsReadAction)}>
            <Button type="submit" variant="secondary" size="sm">
              Marcar todas como lidas
            </Button>
          </form>
        ) : null}
      </div>

      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-black/5 bg-white/80 p-5 text-sm text-neutral-500">
            Nenhuma notificação ainda.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl border border-black/5 bg-white/80 p-4 ${
                item.readAt ? "opacity-70" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {!item.readAt ? (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#C026D3]" />
                    ) : null}
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{item.body}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {item.createdAt.toLocaleString("pt-BR")} · {item.type}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.href ? (
                    <Link href={item.href}>
                      <Button size="sm" variant="secondary">
                        Abrir
                      </Button>
                    </Link>
                  ) : null}
                  {!item.readAt ? (
                    <form action={formAction(markNotificationReadAction)}>
                      <input type="hidden" name="id" value={item.id} />
                      <Button type="submit" size="sm">
                        Marcar lida
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
