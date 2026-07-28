"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  approveConditionAction,
  approveOthersAction,
  sendNegotiationMessageAction,
  startNegotiationAction,
} from "@/features/negotiation/actions";

export type CompareRow = {
  proposalId: string;
  conditionId: string;
  supplierName: string;
  status: string;
  amountCents: number;
  paymentTerms: string;
  attachmentName: string | null;
  createdAt: string;
};

type Message = {
  id: string;
  proposalId: string;
  body: string;
  authorLabel: string;
  createdAt: string;
};

type Props = {
  quotationId: string;
  quotationStatus: string;
  invitesPaused: boolean;
  minProposals: number;
  maxProposals: number;
  proposalsCount: number;
  rows: CompareRow[];
  messages: Message[];
  invites: Array<{
    id: string;
    supplierName: string;
    status: string;
    tier: number;
    reason: string | null;
  }>;
  otherCompanyName: string | null;
  otherFinalAmountCents: number | null;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function QuotationComparePanel({
  quotationId,
  quotationStatus,
  invitesPaused,
  minProposals,
  maxProposals,
  proposalsCount,
  rows,
  messages,
  invites,
  otherCompanyName,
  otherFinalAmountCents,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sort, setSort] = useState<"amount" | "date">("amount");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [activeCondition, setActiveCondition] = useState<string | null>(null);
  const [message, setMessage] = useState("Gostaríamos de negociar melhores condições.");
  const [chatBody, setChatBody] = useState("");
  const [chatProposalId, setChatProposalId] = useState<string>("");
  const [othersOpen, setOthersOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOpen = ["aberta", "em_negociacao"].includes(quotationStatus);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    if (sort === "amount") {
      copy.sort((a, b) => a.amountCents - b.amountCents);
    } else {
      copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return copy;
  }, [rows, sort]);

  const selectedProposalIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([id]) => id);

  const progressPct = Math.min(100, Math.round((proposalsCount / Math.max(maxProposals, 1)) * 100));

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.message ?? "Erro");
        setFeedback(null);
        return;
      }
      setError(null);
      setFeedback(result.message ?? "OK");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Progresso de propostas</h2>
            <p className="mt-1 text-sm text-neutral-600">
              {proposalsCount} de {maxProposals} (mínimo {minProposals})
            </p>
          </div>
          {invitesPaused || proposalsCount >= maxProposals ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              Recebimento pausado (meta máxima)
            </span>
          ) : null}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(135deg,#E11D8A,#9333EA,#3B82F6)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Convites distribuídos</h2>
        {invites.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Nenhum convite ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 py-2"
              >
                <span className="font-medium">{invite.supplierName}</span>
                <span className="text-neutral-500">
                  Tier {invite.tier} · {invite.status}
                  {invite.reason ? ` · ${invite.reason}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">Comparativo de propostas</h2>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as "amount" | "date")}
            className="h-10 rounded-xl border border-black/10 px-3 text-sm"
          >
            <option value="amount">Ordenar por valor</option>
            <option value="date">Ordenar por data</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-black/5 text-neutral-500">
              <tr>
                <th className="px-2 py-2 font-medium">Sel.</th>
                <th className="px-2 py-2 font-medium">Fornecedor</th>
                <th className="px-2 py-2 font-medium">Valor</th>
                <th className="px-2 py-2 font-medium">Pagamento</th>
                <th className="px-2 py-2 font-medium">Anexo</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.conditionId} className="border-b border-black/5">
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[row.proposalId])}
                      onChange={(event) =>
                        setSelected((prev) => ({
                          ...prev,
                          [row.proposalId]: event.target.checked,
                        }))
                      }
                      disabled={!isOpen}
                    />
                  </td>
                  <td className="px-2 py-3 font-medium">{row.supplierName}</td>
                  <td className="px-2 py-3">{formatMoney(row.amountCents)}</td>
                  <td className="px-2 py-3">{row.paymentTerms}</td>
                  <td className="px-2 py-3 text-neutral-500">{row.attachmentName ?? "—"}</td>
                  <td className="px-2 py-3 capitalize">{row.status.replace("_", " ")}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className={`text-xs font-semibold ${
                        activeCondition === row.conditionId
                          ? "text-emerald-700"
                          : "text-[#9333EA] hover:underline"
                      }`}
                      onClick={() => setActiveCondition(row.conditionId)}
                      disabled={!isOpen}
                    >
                      {activeCondition === row.conditionId ? "Selecionada" : "Selecionar"}
                    </button>
                  </td>
                </tr>
              ))}
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-8 text-center text-neutral-500">
                    Nenhuma proposta/condição para comparar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {isOpen ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending || selectedProposalIds.length === 0}
              onClick={() => {
                const formData = new FormData();
                for (const id of selectedProposalIds) formData.append("proposalIds", id);
                formData.set("message", message);
                run(() => startNegotiationAction(formData));
              }}
            >
              Negociar selecionadas
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending || !activeCondition}
              onClick={() => {
                const row = rows.find((item) => item.conditionId === activeCondition);
                if (!row) return;
                const formData = new FormData();
                formData.set("proposalId", row.proposalId);
                formData.set("conditionId", row.conditionId);
                run(() => approveConditionAction(formData));
              }}
            >
              Aprovar condição selecionada
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setOthersOpen((value) => !value)}
            >
              Aprovar Outros
            </Button>
          </div>
        ) : null}

        {isOpen ? (
          <div className="mt-3">
            <label className="text-xs font-medium text-neutral-500">Mensagem de negociação</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        ) : null}

        {othersOpen && isOpen ? (
          <form
            className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4"
            action={(formData) => run(() => approveOthersAction(formData))}
          >
            <p className="text-sm font-semibold text-amber-900">Finalizar fora da plataforma</p>
            <input type="hidden" name="quotationId" value={quotationId} />
            <input
              name="companyName"
              required
              placeholder="Nome da empresa"
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
            <input
              name="finalAmount"
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Valor final (R$)"
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            />
            <Button type="submit" size="sm" disabled={pending}>
              Confirmar Outros
            </Button>
          </form>
        ) : null}

        {quotationStatus === "finalizada_outros" && otherCompanyName ? (
          <p className="mt-4 rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
            Finalizada — Outros: {otherCompanyName}
            {otherFinalAmountCents != null ? ` · ${formatMoney(otherFinalAmountCents)}` : ""}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Canal de negociação</h2>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma mensagem ainda.</p>
          ) : (
            messages.map((item) => (
              <div key={item.id} className="rounded-xl bg-black/[0.03] px-3 py-2 text-sm">
                <p className="text-xs text-neutral-500">
                  {item.authorLabel} · {new Date(item.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-neutral-800">{item.body}</p>
              </div>
            ))
          )}
        </div>
        {quotationStatus === "em_negociacao" ? (
          <form
            className="mt-4 space-y-2"
            action={(formData) => {
              run(async () => {
                const result = await sendNegotiationMessageAction(formData);
                if (result.ok) setChatBody("");
                return result;
              });
            }}
          >
            <select
              name="proposalId"
              required
              value={chatProposalId}
              onChange={(event) => setChatProposalId(event.target.value)}
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
            >
              <option value="">Proposta para mensagem</option>
              {[...new Set(rows.map((row) => row.proposalId))].map((proposalId) => {
                const row = rows.find((item) => item.proposalId === proposalId)!;
                return (
                  <option key={proposalId} value={proposalId}>
                    {row.supplierName}
                  </option>
                );
              })}
            </select>
            <textarea
              name="body"
              required
              value={chatBody}
              onChange={(event) => setChatBody(event.target.value)}
              rows={2}
              placeholder="Escreva uma mensagem..."
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" disabled={pending}>
              Enviar mensagem
            </Button>
          </form>
        ) : null}
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {feedback ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{feedback}</p>
      ) : null}
    </div>
  );
}
