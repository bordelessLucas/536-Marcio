import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Z]/, "Inclua ao menos 1 letra maiúscula")
    .regex(/[0-9]/, "Inclua ao menos 1 número"),
  organizationName: z.string().min(2, "Informe o nome da empresa/condomínio"),
  organizationType: z.enum(["fornecedor", "sindico", "administradora"]),
  document: z.string().optional(),
  privacyAccepted: z.boolean().refine((value) => value === true, {
    message: "É necessário aceitar a política de privacidade",
  }),
});

export const confirmEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Z]/, "Inclua ao menos 1 letra maiúscula")
    .regex(/[0-9]/, "Inclua ao menos 1 número"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
