import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Razorpay from "razorpay";

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch subscription ID from profile
  const admin = createAdminClient();
  const { data: profile, error: fetchErr } = await admin
    .from("profiles")
    .select("razorpay_sub_id")
    .eq("id", user.id)
    .single();

  if (fetchErr || !profile?.razorpay_sub_id) {
    // No Razorpay sub found — just downgrade locally
    await admin.from("profiles").update({ plan: "free" }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  }

  try {
    // Cancel at end of current billing period (cancel_at_cycle_end = 1)
    await rzp.subscriptions.cancel(profile.razorpay_sub_id, true);
  } catch (err) {
    console.error("[cancel-subscription] Razorpay error:", err);
    // Still downgrade locally so UX is not stuck
  }

  // Downgrade immediately in DB; webhook will confirm later
  const { error } = await admin
    .from("profiles")
    .update({ plan: "free", razorpay_sub_id: null })
    .eq("id", user.id);

  if (error) {
    console.error("[cancel-subscription] Supabase error:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[cancel-subscription] ✓ Cancelled: ${user.email}`);
  return NextResponse.json({ ok: true });
}
