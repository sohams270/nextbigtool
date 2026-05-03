import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import DodoPayments from "dodopayments";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile, error: fetchErr } = await admin
    .from("profiles")
    .select("dodo_sub_id")
    .eq("id", user.id)
    .single();

  if (fetchErr || !profile?.dodo_sub_id) {
    // No Dodo sub found — just downgrade locally
    await admin.from("profiles").update({ plan: "free" }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  }

  try {
    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_API_KEY!,
      environment: "live_mode",
    });

    // Cancel at end of current billing period
    await dodo.subscriptions.update(profile.dodo_sub_id, {
      cancel_at_next_billing_date: true,
      cancel_reason: "cancelled_by_customer",
    });
  } catch (err) {
    console.error("[cancel-subscription] Dodo error:", err);
    // Still downgrade locally so UX is not stuck
  }

  // Downgrade immediately in DB; webhook will confirm later
  const { error } = await admin
    .from("profiles")
    .update({ plan: "free", dodo_sub_id: null })
    .eq("id", user.id);

  if (error) {
    console.error("[cancel-subscription] Supabase error:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[cancel-subscription] ✓ Cancelled: ${user.email}`);
  return NextResponse.json({ ok: true });
}
