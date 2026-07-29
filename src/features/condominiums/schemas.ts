import { z } from "zod";
import { isValidCnpj, onlyDigits } from "@/lib/cnpj";

const optionalPositiveInt = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}, z.number().int().positive().optional());

export const condominiumSchema = z.object({
  name: z.string().min(2, "Informe o nome do condomínio"),
  address: z.string().min(5, "Informe o endereço"),
  document: z
    .string()
    .optional()
    .transform((value) => (value ? onlyDigits(value) : undefined))
    .refine((value) => !value || isValidCnpj(value), { message: "CNPJ inválido" }),
  contactName: z.string().optional(),
  contactEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  towers: optionalPositiveInt,
  units: optionalPositiveInt,
});

export type CondominiumInput = z.infer<typeof condominiumSchema>;
