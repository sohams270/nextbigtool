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

  const supabase = createClient(cookieStore);

  // Don't count if the visitor is the tool's own submitter
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: tool } = await supabase
      .from("tools")
      .select("submitter_id")
      .eq("id", id)
      .maybeSingle();
    if (tool?.submitter_id === user.id) {
      return NextResponse.json({ ok: true, counted: false });
    }
  }

  // Increment view_count via RPC
  await supabase.rpc("increment_view_count", { tool_id: id });

  // Log this view for time-series chart (best-effort, ignore errors)
  await supabase.from("tool_view_logs").insert({ tool_id: id }).then(() => {});

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
