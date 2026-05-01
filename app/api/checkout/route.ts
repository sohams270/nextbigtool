import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import DodoPayments from "dodopayments";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: "live_mode",
});

const PRODUCTS: Record<string, string> = {
  monthly: process.env.DODO_PRODUCT_MONTHLY!,
  yearly:  process.env.DODO_PRODUCT_YEARLY!,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nextbigtool.com";

export async function GET(request: NextRequest) {
  const interval = request.nextUrl.searchParams.get("interval") ?? "monthly";

  // Require auth
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const productId = PRODUCTS[interval] ?? PRODUCTS.monthly;

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email!,
        name: (user.user_metadata?.full_name as string | undefined) ?? undefined,
      },
      // stored in subscription.metadata — used by webhook to identify the user
      metadata: { supabase_user_id: user.id },
      return_url: `${SITE_URL}/dashboard/plan?upgraded=1`,
      cancel_url:  `${SITE_URL}/dashboard/plan`,
    });

    if (!session.checkout_url) {
      console.error("[checkout] No checkout_url in response:", session);
      return NextResponse.redirect(new URL("/dashboard/plan?error=no_url", request.url));
    }

    return NextResponse.redirect(session.checkout_url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout] Dodo error:", msg);
    const url = new URL("/dashboard/plan", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("msg", msg.slice(0, 200));
    return NextResponse.redirect(url);
  }
}
