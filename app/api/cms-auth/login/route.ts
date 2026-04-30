import { NextResponse } from "next/server";

async function makeSessionToken(username: string): Promise<string> {
  const secret  = process.env.CMS_SECRET ?? "fallback-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(username));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUser = process.env.CMS_USERNAME;
  const validPass = process.env.CMS_PASSWORD;

  if (!validUser || !validPass) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 500 });
  }

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await makeSessionToken(username);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("cms_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
