import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const cookieStore = await cookies();
  const cookieName = `nbt_viewed_${id}`;

  // Already counted this tool from this browser in the last 24 h → skip
  if (cookieStore.get(cookieName)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  // Increment view_count via RPC
  const supabase = createClient(cookieStore);
  await supabase.rpc("increment_view_count", { tool_id: id });

  // Set cookie for 24 hours so the same browser doesn't count again
  const res = NextResponse.json({ ok: true, counted: true });
  res.cookies.set(cookieName, "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    sameSite: "lax",
  });
  return res;
}
