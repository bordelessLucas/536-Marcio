"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uploadComplianceDocumentAction } from "@/features/compliance/actions";

const DOC_TYPES = [
  "Certidão Negativa Federal",
  "Certidão Negativa Estadual",
  "Certidão Negativa Municipal",
  "FGTS",
  "INSS",
  "Alvará de funcionamento",
  "Outro",
];

type Props = {
  replacesId?: string;
};

export function ComplianceUploadForm({ replacesId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function onFileChange(files: FileList | null) {
    const file = files?.[0];
    setFileName(file ? file.name : null);
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-5"
      action={(formData) => {
        startTransition(async () => {
          const result = await uploadComplianceDocumentAction(formData);
          if (!result.ok) {
            setError(result.message ?? "Erro no upload");
            setMessage(null);
            return;
          }
          setError(null);
          setMessage(result.message ?? "Enviado");
          setFileName(null);
          if (fileRef.current) fileRef.current.value = "";
          router.refresh();
        });
      }}
    >
      <h2 className="text-lg font-semibold text-neutral-900">
        {replacesId ? "Renovar documento" : "Enviar documento"}
      </h2>
      {replacesId ? <input type="hidden" name="replacesId" value={replacesId} /> : null}
      <select
        name="documentType"
        required
        className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Tipo do documento
        </option>
        {DOC_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-neutral-500">Validade do documento</span>
        <input
          type="date"
          name="validUntil"
          required
          className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm"
        />
      </label>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-500">Arquivo do documento</span>
        <label
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const files = event.dataTransfer.files;
            if (fileRef.current && files.length > 0) {
              const transfer = new DataTransfer();
              transfer.items.add(files[0]);
              fileRef.current.files = transfer.files;
              onFileChange(transfer.files);
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            isDragging
              ? "border-[#9333EA] bg-[#9333EA]/5"
              : fileName
                ? "border-emerald-300 bg-emerald-50/60"
                : "border-black/15 bg-black/[0.02] hover:border-[#9333EA]/50 hover:bg-[#9333EA]/5"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <FileUp className="h-5 w-5 text-[#9333EA]" aria-hidden />
          </span>
          {fileName ? (
            <>
              <span className="text-sm font-semibold text-neutral-900">Arquivo selecionado</span>
              <span className="max-w-full truncate px-2 text-sm text-emerald-800">{fileName}</span>
              <span className="text-xs text-neutral-500">Clique ou arraste para trocar</span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-neutral-900">
                Clique para enviar o arquivo
              </span>
              <span className="text-xs text-neutral-500">ou arraste e solte aqui</span>
              <span className="text-xs text-neutral-400">PDF, JPG ou PNG · máx. 10MB</span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            name="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={(event) => onFileChange(event.target.files)}
          />
        </label>
        <p className="text-xs text-neutral-500">Validade semestral recomendada.</p>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
