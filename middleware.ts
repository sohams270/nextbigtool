import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// Use Web Crypto API (Edge-compatible) instead of Node's crypto module
async function isValidCmsSession(token: string): Promise<boolean> {
  const username = process.env.CMS_USERNAME;
  const secret   = process.env.CMS_SECRET ?? "fallback-secret";
  if (!username || !token) return false;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(username);

  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, msgData);
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return token === expected;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CMS auth guard ──────────────────────────────────────────────────────
  if (pathname.startsWith("/cms")) {
    const isLoginPage   = pathname === "/cms/login";
    const sessionCookie = request.cookies.get("cms_session")?.value ?? "";
    const authed        = await isValidCmsSession(sessionCookie);

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
