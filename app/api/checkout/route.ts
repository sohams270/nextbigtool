import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  const rzp = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const PLANS: Record<string, string> = {
    monthly: process.env.RAZORPAY_PLAN_MONTHLY!,
    yearly:  process.env.RAZORPAY_PLAN_YEARLY!,
  };
  // Auth check
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval = "monthly" } = await request.json().catch(() => ({}));
  const planId = PLANS[interval] ?? PLANS.monthly;

  try {
    const subscription = await rzp.subscriptions.create({
      plan_id:     planId,
      total_count: 120,          // 10 years — effectively ongoing
      quantity:    1,
      customer_notify: 1,
      notes: {
        supabase_user_id: user.id,
        user_email:       user.email ?? "",
        interval,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId:          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout/razorpay] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
