import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthorizedSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

const TIMELINE = [
  { key: "aberta", label: "Aberta" },
  { key: "em_negociacao", label: "Em negociação" },
  { key: "aprovada", label: "Aprovada / Encerrada" },
] as const;

export default async function CotacaoDetalhePage({ params }: PageProps) {
  const session = await requireAuthorizedSession({ href: "/app/cotacoes" });
  const { id } = await params;

  const quotation = await prisma.quotation.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      condominium: true,
      category: true,
      serviceItem: true,
      attachments: true,
    },
  });
  if (!quotation) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/app/cotacoes" className="text-sm text-[#9333EA] hover:underline">
          ← Voltar
        </Link>
        <p className="mt-3 font-mono text-sm font-semibold text-[#9333EA]">{quotation.publicId}</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">
          {quotation.category.name} · {quotation.serviceItem.name}
        </h1>
        <p className="mt-2 text-neutral-600">{quotation.condominium.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
          <p className="text-xs text-neutral-500">Status</p>
          <p className="mt-1 font-semibold capitalize">{quotation.status.replace("_", " ")}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
          <p className="text-xs text-neutral-500">Urgência</p>
          <p className="mt-1 font-semibold capitalize">{quotation.urgency}</p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/80 p-4">
          <p className="text-xs text-neutral-500">Metas de propostas</p>
          <p className="mt-1 font-semibold">
            min {quotation.minProposals} · máx {quotation.maxProposals}
          </p>
        </div>
      </div>

      {(quotation.serviceItem.isMandatory || quotation.serviceItem.periodicityHint) && (
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {quotation.serviceItem.isMandatory ? <strong>Serviço obrigatório. </strong> : null}
          {quotation.serviceItem.periodicityHint
            ? `Periodicidade: ${quotation.serviceItem.periodicityHint}.`
            : null}
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="text-lg font-semibold">Descrição</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{quotation.description}</p>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="text-lg font-semibold">Anexos</h2>
        {quotation.attachments.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Nenhum anexo.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {quotation.attachments.map((file) => (
              <li key={file.id} className="flex justify-between gap-4 border-b border-black/5 py-2">
                <span>{file.fileName}</span>
                <span className="text-neutral-500">{Math.round(file.sizeBytes / 1024)} KB</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="text-lg font-semibold">Timeline de status</h2>
        <ol className="mt-4 space-y-3">
          {TIMELINE.map((step, index) => {
            const active =
              quotation.status === step.key ||
              (step.key === "aprovada" &&
                ["aprovada", "recusada", "cancelada", "encerrada"].includes(quotation.status));
            return (
              <li key={step.key} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    active
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#9333EA] text-xs font-bold text-white"
                      : "flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500"
                  }
                >
                  {index + 1}
                </span>
                <span className={active ? "font-semibold text-neutral-900" : "text-neutral-500"}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
