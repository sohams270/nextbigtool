import { NextResponse } from "next/server";
import { createHmac } from "crypto";

function makeSessionToken(username: string): string {
  const secret = process.env.CMS_SECRET ?? "fallback-secret";
  return createHmac("sha256", secret).update(username).digest("hex");
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

  const token = makeSessionToken(username);

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
