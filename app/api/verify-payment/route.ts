import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    await request.json();

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // Verify HMAC signature
  const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    console.error("[verify-payment] Signature mismatch");
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Upgrade the user and store subscription ID
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ plan: "core", razorpay_sub_id: razorpay_subscription_id })
    .eq("id", user.id);

  if (error) {
    console.error("[verify-payment] Supabase error:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  console.log(`[verify-payment] ✓ Upgraded to core: ${user.email}`);
  return NextResponse.json({ ok: true });
}
