import { z } from "zod";

export const selectCategoriesSchema = z.object({
  categoryIds: z.array(z.string().min(1)).min(1, "Selecione ao menos uma categoria."),
});
