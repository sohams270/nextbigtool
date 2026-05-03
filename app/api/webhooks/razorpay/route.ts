import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  // Verify signature if webhook secret is configured
  if (secret && !verifySignature(body, signature, secret)) {
    console.error("[webhook/razorpay] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Helper to get user email from subscription notes
  function getEmail(payload: Record<string, unknown>): string | null {
    try {
      const sub = (payload as { subscription?: { entity?: { notes?: { user_email?: string } } } })
        .subscription?.entity?.notes?.user_email;
      return sub ?? null;
    } catch {
      return null;
    }
  }

  function getUserId(payload: Record<string, unknown>): string | null {
    try {
      const id = (payload as { subscription?: { entity?: { notes?: { supabase_user_id?: string } } } })
        .subscription?.entity?.notes?.supabase_user_id;
      return id ?? null;
    } catch {
      return null;
    }
  }

  function getSubId(payload: Record<string, unknown>): string | null {
    try {
      const id = (payload as { subscription?: { entity?: { id?: string } } })
        .subscription?.entity?.id;
      return id ?? null;
    } catch {
      return null;
    }
  }

  try {
    const { event: eventName, payload } = event;

    // ── Subscription activated / payment charged → upgrade to Core ──────────
    if (eventName === "subscription.activated" || eventName === "subscription.charged") {
      const userId = getUserId(payload);
      const email  = getEmail(payload);
      const subId  = getSubId(payload);

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "core", razorpay_sub_id: subId })
          .eq("id", userId);
        console.log(`[webhook/razorpay] ✓ Core activated via userId: ${userId}`);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({ plan: "core", razorpay_sub_id: subId })
          .eq("email", email);
        console.log(`[webhook/razorpay] ✓ Core activated via email: ${email}`);
      }
    }

    // ── Subscription cancelled / halted / completed → downgrade to Free ─────
    if (
      eventName === "subscription.cancelled" ||
      eventName === "subscription.halted" ||
      eventName === "subscription.completed"
    ) {
      const userId = getUserId(payload);
      const email  = getEmail(payload);

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "free", razorpay_sub_id: null })
          .eq("id", userId);
        console.log(`[webhook/razorpay] ✓ Downgraded via userId: ${userId} (${eventName})`);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({ plan: "free", razorpay_sub_id: null })
          .eq("email", email);
        console.log(`[webhook/razorpay] ✓ Downgraded via email: ${email} (${eventName})`);
      }
    }
  } catch (err) {
    console.error("[webhook/razorpay] Error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
