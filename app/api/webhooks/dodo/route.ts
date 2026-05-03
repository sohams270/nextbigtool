import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: "live_mode",
    webhookKey: process.env.DODO_WEBHOOK_SECRET || undefined,
  });

  let event;
  try {
    if (process.env.DODO_WEBHOOK_SECRET) {
      const headers = Object.fromEntries(request.headers.entries());
      event = dodo.webhooks.unwrap(body, {
        headers,
        key: process.env.DODO_WEBHOOK_SECRET,
      });
    } else {
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
      const email      = event.data.customer.email;
      const subId      = (event.data as any).subscription_id ?? null;
      const metadata   = (event.data as any).metadata ?? {};
      const userId     = metadata.supabase_user_id ?? null;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "core", dodo_sub_id: subId })
          .eq("id", userId);
        console.log(`[webhook/dodo] ✓ Core activated via userId: ${userId}`);
      } else {
        await supabase
          .from("profiles")
          .update({ plan: "core", dodo_sub_id: subId })
          .eq("email", email);
        console.log(`[webhook/dodo] ✓ Core activated via email: ${email}`);
      }
    }

    // ── Subscription ended → downgrade to Free ────────────────────────────────
    if (
      event.type === "subscription.cancelled" ||
      event.type === "subscription.expired" ||
      event.type === "subscription.failed"
    ) {
      const email    = event.data.customer.email;
      const metadata = (event.data as any).metadata ?? {};
      const userId   = metadata.supabase_user_id ?? null;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "free", dodo_sub_id: null })
          .eq("id", userId);
        console.log(`[webhook/dodo] ✓ Downgraded via userId: ${userId} (${event.type})`);
      } else {
        await supabase
          .from("profiles")
          .update({ plan: "free", dodo_sub_id: null })
          .eq("email", email);
        console.log(`[webhook/dodo] ✓ Downgraded via email: ${email} (${event.type})`);
      }
    }
  } catch (err) {
    console.error("[webhook/dodo] Supabase update error:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
