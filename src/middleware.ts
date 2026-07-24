import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cotacondo_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "cotacondo-dev-secret-change-me-in-production-32chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAppRoute = pathname.startsWith("/app");
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (isAppRoute) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/acesse";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, getSecretKey());
      return NextResponse.next();
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/acesse";
      url.searchParams.set("next", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
