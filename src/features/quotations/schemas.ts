import { z } from "zod";

export const quotationSchema = z.object({
  condominiumId: z.string().min(1, "Selecione o condomínio"),
  categoryId: z.string().min(1, "Selecione a categoria"),
  serviceItemId: z.string().min(1, "Selecione o serviço"),
  urgency: z.enum(["baixa", "media", "alta", "critica"]),
  description: z.string().min(10, "Descreva a necessidade com mais detalhes"),
  minProposals: z.coerce.number().int().min(1).max(50),
  maxProposals: z.coerce.number().int().min(1).max(100),
}).refine((data) => data.maxProposals >= data.minProposals, {
  message: "Máximo de propostas deve ser ≥ mínimo",
  path: ["maxProposals"],
});
