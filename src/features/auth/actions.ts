"use server";

import { MemberRole, OrganizationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppError, toPublicErrorMessage } from "@/lib/errors";
import { writeAuditLog } from "@/lib/audit";
import {
  generateNumericCode,
  generateResetToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  buildSessionForUser,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth/session";
import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

export type ActionResult = {
  ok: boolean;
  message?: string;
  devCode?: string;
  resetToken?: string;
};

function planSlugForType(type: OrganizationType): string {
  switch (type) {
    case OrganizationType.fornecedor:
      return "fornecedor-free";
    case OrganizationType.administradora:
      return "adm-free";
    case OrganizationType.sindico:
    default:
      return "sindico-free";
  }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      organizationName: formData.get("organizationName"),
      organizationType: formData.get("organizationType"),
      document: formData.get("document") || undefined,
      privacyAccepted: formData.get("privacyAccepted") === "on" || formData.get("privacyAccepted") === "true",
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const data = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return { ok: false, message: "Já existe uma conta com este e-mail." };
    }

    const passwordHash = await hashPassword(data.password);
    const organizationType = data.organizationType as OrganizationType;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        privacyAcceptedAt: new Date(),
        consentRecords: {
          create: {
            type: "privacy_policy",
            accepted: true,
          },
        },
        memberships: {
          create: {
            role: MemberRole.master,
            organization: {
              create: {
                name: data.organizationName,
                document: data.document || null,
                type: organizationType,
              },
            },
          },
        },
      },
      include: { memberships: true },
    });

    const organizationId = user.memberships[0]?.organizationId;
    if (organizationId) {
      const plan = await prisma.plan.findUnique({ where: { slug: planSlugForType(organizationType) } });
      if (plan) {
        await prisma.subscription.create({
          data: {
            organizationId,
            planId: plan.id,
            status: "active",
          },
        });
      }
    }

    const code = generateNumericCode(6);
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    await writeAuditLog({
      userId: user.id,
      action: "auth.register",
      entityType: "user",
      entityId: user.id,
      metadata: { organizationType },
    });

    // Em produção: enviar e-mail. No Dia 1 (local): devolver código em dev.
    return {
      ok: true,
      message: "Cadastro realizado. Confirme o código enviado ao e-mail.",
      devCode: process.env.NEXT_PUBLIC_APP_ENV !== "production" ? code : undefined,
    };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function confirmEmailAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = confirmEmailSchema.safeParse({
      email: formData.get("email"),
      code: formData.get("code"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: false, message: "Não foi possível confirmar o cadastro." };
    }

    const token = await prisma.emailToken.findFirst({
      where: {
        userId: user.id,
        code: parsed.data.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return { ok: false, message: "Código inválido ou expirado." };
    }

    await prisma.$transaction([
      prisma.emailToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    await writeAuditLog({
      userId: user.id,
      action: "auth.email_confirmed",
      entityType: "user",
      entityId: user.id,
    });

    const sessionPayload = await buildSessionForUser(user.id);
    if (sessionPayload) {
      const jwt = await createSessionToken(sessionPayload);
      await setSessionCookie(jwt);
      redirect("/app");
    }

    return { ok: true, message: "E-mail confirmado. Faça login." };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Next.js redirect throws; rethrow digest redirects
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      await writeAuditLog({
        action: "auth.login_failed",
        metadata: { emailDomain: email.split("@")[1] ?? "unknown" },
      });
      return { ok: false, message: "E-mail ou senha inválidos." };
    }

    if (!user.emailVerifiedAt) {
      return {
        ok: false,
        message: "Confirme seu e-mail antes de acessar. Use a tela de confirmação.",
      };
    }

    const sessionPayload = await buildSessionForUser(user.id);
    if (!sessionPayload) {
      throw new AppError("Conta sem organização vinculada.", "NO_ORG", 400);
    }

    const jwt = await createSessionToken(sessionPayload);
    await setSessionCookie(jwt);

    await writeAuditLog({
      userId: user.id,
      action: "auth.login_success",
      entityType: "user",
      entityId: user.id,
    });

    redirect(safeAppPath(formData.get("next")));
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) {
      throw error;
    }
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

function safeAppPath(value: FormDataEntryValue | null): string {
  const path = String(value ?? "/app");
  if (path.startsWith("/app") && !path.startsWith("//") && !path.includes("://")) {
    return path;
  }
  return "/app";
}

export async function logoutAction() {
  const { getSession } = await import("@/lib/auth/session");
  const session = await getSession();
  if (session) {
    await writeAuditLog({
      userId: session.userId,
      action: "auth.logout",
      entityType: "user",
      entityId: session.userId,
    });
  }
  await clearSessionCookie();
  redirect("/acesse");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // Resposta genérica (não vazar existência do e-mail)
    const generic = {
      ok: true,
      message: "Se o e-mail existir, enviaremos um link de recuperação.",
    };

    if (!user) {
      return generic;
    }

    const token = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await writeAuditLog({
      userId: user.id,
      action: "auth.password_reset_requested",
      entityType: "user",
      entityId: user.id,
    });

    return {
      ...generic,
      resetToken: process.env.NEXT_PUBLIC_APP_ENV !== "production" ? token : undefined,
    };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    }

    const reset = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
    });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return { ok: false, message: "Link de recuperação inválido ou expirado." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const usedAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: reset.userId, usedAt: null },
        data: { usedAt },
      }),
    ]);

    await writeAuditLog({
      userId: reset.userId,
      action: "auth.password_reset_completed",
      entityType: "user",
      entityId: reset.userId,
    });

    return { ok: true, message: "Senha atualizada. Faça login." };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}

export async function resendConfirmationAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = String(formData.get("email") ?? "").toLowerCase();
    if (!email.includes("@")) {
      return { ok: false, message: "E-mail inválido" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { ok: true, message: "Se o e-mail existir, enviamos um novo código." };
    }

    if (user.emailVerifiedAt) {
      return { ok: true, message: "Este e-mail já está confirmado. Faça login." };
    }

    const code = generateNumericCode(6);
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    return {
      ok: true,
      message: "Novo código gerado.",
      devCode: process.env.NEXT_PUBLIC_APP_ENV !== "production" ? code : undefined,
    };
  } catch (error) {
    return { ok: false, message: toPublicErrorMessage(error) };
  }
}
