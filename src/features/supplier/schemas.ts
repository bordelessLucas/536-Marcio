import { z } from "zod";

export const selectCategorySegmentsSchema = z.object({
  links: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        serviceItemId: z.string().min(1),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
      }),
    )
    .min(1, "Selecione ao menos uma categoria e um segmento."),
});
