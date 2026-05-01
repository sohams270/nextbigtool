import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createAdminClient } from "@/utils/supabase/admin";

// Route must receive raw body for signature verification
export const runtime = "nodejs";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: "live_mode",
  webhookKey: process.env.DODO_WEBHOOK_SECRET || undefined,
});

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Parse & optionally verify the event
  let event;
  try {
    if (process.env.DODO_WEBHOOK_SECRET) {
      const headers = Object.fromEntries(request.headers.entries());
      event = dodo.webhooks.unwrap(body, {
        headers,
        key: process.env.DODO_WEBHOOK_SECRET,
      });
    } else {
      // No secret configured yet — skip verification (safe for local dev only)
      event = dodo.webhooks.unsafeUnwrap(body);
    }
  } catch (err) {
    console.error("[webhook/dodo] Failed to parse event:", err);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // ── Subscription became active → upgrade to Core ──────────────────────────
    if (event.type === "subscription.active") {
      const email = event.data.customer.email;
      const { error } = await supabase
        .from("profiles")
        .update({ plan: "core" })
        .eq("email", email);

      if (error) throw error;
      console.log(`[webhook/dodo] ✓ Upgraded to core: ${email}`);
    }

    // ── Subscription ended → downgrade to Free ────────────────────────────────
    if (
      event.type === "subscription.cancelled" ||
      event.type === "subscription.expired" ||
      event.type === "subscription.failed"
    ) {
      const email = event.data.customer.email;
      const { error } = await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("email", email);

      if (error) throw error;
      console.log(`[webhook/dodo] ✓ Downgraded to free: ${email} (${event.type})`);
    }
  } catch (err) {
    console.error("[webhook/dodo] Supabase update error:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
