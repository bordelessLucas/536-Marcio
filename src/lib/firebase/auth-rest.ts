/**
 * Firebase Auth via Identity Toolkit REST (plano Spark — sem exigir Admin para login/signup).
 * A API key pública (NEXT_PUBLIC_FIREBASE_API_KEY) é o fluxo oficial do client SDK.
 */

const IDENTITY_TOOLKIT = "https://identitytoolkit.googleapis.com/v1";

function apiKey(): string {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY não configurada.");
  }
  return key;
}

export type FirebaseAuthUser = {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
};

type FirebaseErrorBody = {
  error?: { message?: string; errors?: Array<{ message?: string }> };
};

function mapFirebaseError(message: string): string {
  switch (message) {
    case "EMAIL_EXISTS":
      return "Já existe uma conta com este e-mail no Firebase.";
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
    case "INVALID_LOGIN_CREDENTIALS":
      return "E-mail ou senha inválidos.";
    case "USER_DISABLED":
      return "Esta conta está desabilitada.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Muitas tentativas. Tente novamente em instantes.";
    case "WEAK_PASSWORD : Password should be at least 6 characters":
    case "WEAK_PASSWORD":
      return "Senha muito fraca (mínimo 6 caracteres no Firebase).";
    case "OPERATION_NOT_ALLOWED":
      return "Login e-mail/senha não está habilitado no Firebase.";
    default:
      return "Falha na autenticação Firebase.";
  }
}

async function postAuth<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${IDENTITY_TOOLKIT}/${path}?key=${apiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T & FirebaseErrorBody;
  if (!response.ok || data.error?.message) {
    const code = data.error?.message ?? "UNKNOWN";
    const error = new Error(mapFirebaseError(code));
    (error as Error & { firebaseCode?: string }).firebaseCode = code;
    throw error;
  }
  return data;
}

export async function firebaseSignInWithPassword(
  email: string,
  password: string,
): Promise<FirebaseAuthUser> {
  return postAuth<FirebaseAuthUser>("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function firebaseSignUp(
  email: string,
  password: string,
): Promise<FirebaseAuthUser> {
  return postAuth<FirebaseAuthUser>("accounts:signUp", {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function firebaseUpdatePassword(
  idToken: string,
  newPassword: string,
): Promise<FirebaseAuthUser> {
  return postAuth<FirebaseAuthUser>("accounts:update", {
    idToken,
    password: newPassword,
    returnSecureToken: true,
  });
}

export async function firebaseSendPasswordResetEmail(email: string): Promise<void> {
  await postAuth("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}

export function isFirebaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
}
