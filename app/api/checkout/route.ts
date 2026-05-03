import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import DodoPayments from "dodopayments";

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval = "monthly" } = await request.json().catch(() => ({}));

  const productId = interval === "yearly"
    ? process.env.DODO_PRODUCT_YEARLY!
    : process.env.DODO_PRODUCT_MONTHLY!;

  const dodo = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: "live_mode",
  });

  try {
    const subscription = await dodo.subscriptions.create({
      billing: { country: "IN" },
      customer: { email: user.email!, name: user.user_metadata?.full_name ?? undefined },
      product_id: productId,
      quantity: 1,
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/plan?upgraded=1`,
      metadata: {
        supabase_user_id: user.id,
        user_email: user.email ?? "",
        interval,
      },
    });

    if (!subscription.payment_link) {
      throw new Error("No payment link returned from Dodo");
    }

    return NextResponse.json({ paymentLink: subscription.payment_link });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout/dodo] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
