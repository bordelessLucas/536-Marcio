import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cotacondo_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET inválido");
  }
  return new TextEncoder().encode(secret);
}

function redirectToLogin(request: NextRequest, pathname: string, clearCookie = false) {
  const url = request.nextUrl.clone();
  url.pathname = "/acesse";
  url.searchParams.set("next", pathname);
  const response = NextResponse.redirect(url);
  if (clearCookie) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAppRoute = pathname.startsWith("/app");
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isAppRoute) {
    if (!token) {
      return redirectToLogin(request, pathname);
    }

    try {
      await jwtVerify(token, getSecretKey());
      return NextResponse.next();
    } catch {
      return redirectToLogin(request, pathname, true);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
