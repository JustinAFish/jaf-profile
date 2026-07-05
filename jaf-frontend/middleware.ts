import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicRoutes = [
  "/",
  "/chat/sign-in",
  "/chat/sign-up",
  "/chat/callback",
  "/auth/callback",
  "/api/contact",
];

function isPublicPath(pathname: string) {
  return publicRoutes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function mergeSetCookies(from: NextResponse, to: NextResponse) {
  const headersWithGetSetCookie = from.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies = headersWithGetSetCookie.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    to.headers.append("set-cookie", cookie);
  }
}

export default async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (isPublicPath(pathname)) {
    return response;
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (pathname.startsWith("/api/") && !token) {
    const unauthorized = NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mergeSetCookies(response, unauthorized);
    return unauthorized;
  }

  // Authentication for /chat is enforced on the client; middleware still refreshes the session cookie above.
  if (pathname.startsWith("/chat")) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
