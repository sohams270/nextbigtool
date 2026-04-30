import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { createHmac } from "crypto";

function isValidCmsSession(token: string): boolean {
  const username = process.env.CMS_USERNAME;
  const secret   = process.env.CMS_SECRET ?? "fallback-secret";
  if (!username) return false;
  const expected = createHmac("sha256", secret).update(username).digest("hex");
  return token === expected;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CMS auth guard ──────────────────────────────────────────────────────
  if (pathname.startsWith("/cms")) {
    const isLoginPage = pathname === "/cms/login";
    const sessionCookie = request.cookies.get("cms_session")?.value ?? "";
    const authed = isValidCmsSession(sessionCookie);

    if (!isLoginPage && !authed) {
      return NextResponse.redirect(new URL("/cms/login", request.url));
    }
    if (isLoginPage && authed) {
      return NextResponse.redirect(new URL("/cms/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── Supabase session refresh (all other routes) ─────────────────────────
  const { supabaseResponse } = createClient(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
