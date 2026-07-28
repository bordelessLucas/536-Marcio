export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "APP_ERROR",
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toPublicErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return "Sessão expirada. Faça login novamente.";
  }

  if (
    error instanceof Error &&
    (error as Error & { firebaseCode?: string }).firebaseCode
  ) {
    return error.message;
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
