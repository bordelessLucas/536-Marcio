import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria"),
  colorToken: z.string().min(2, "Informe a cor/token"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const serviceItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2, "Informe o nome do serviço"),
  isMandatory: z.boolean().default(false),
  periodicityHint: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
