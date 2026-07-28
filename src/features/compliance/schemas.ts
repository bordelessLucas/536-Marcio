import { z } from "zod";

export const complianceUploadSchema = z.object({
  documentType: z.string().trim().min(2, "Informe o tipo do documento."),
  validUntil: z.string().min(1, "Informe a validade."),
});

export const complianceReviewSchema = z.object({
  documentId: z.string().min(1),
  decision: z.enum(["aprovado", "negada"]),
  reviewNotes: z.string().trim().optional(),
});
