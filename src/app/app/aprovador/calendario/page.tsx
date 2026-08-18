import { renderCalendarPage } from "@/features/appointments/calendar-page";
import { requireExternalApprover } from "@/features/external-approver/guards";

type PageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ExternalApproverCalendarPage({ searchParams }: PageProps) {
  await requireExternalApprover();
  return renderCalendarPage({
    searchParams,
    basePath: "/app/aprovador/calendario",
    title: "Calendário de Compromissos",
    subtitle: "Agendas compartilhadas com a administradora e o Master Service.",
    allowCreate: true,
  });
}
