import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData?.user) {
      const user = sessionData.user;

      // Check if a profile already exists BEFORE upserting so we can detect new signups
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const isNewUser = !existingProfile;

      // Ensure a profile row exists for this user so OnboardingGate can query it.
      // upsert with ignoreDuplicates means we won't clobber existing profile data.
      await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

      // Fire-and-forget email notification for brand-new signups only
      if (isNewUser && process.env.ZOHO_EMAIL && process.env.INTERNAL_API_SECRET) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
        fetch(`${siteUrl}/api/notify-new-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET,
          },
          body: JSON.stringify({
            email:      user.email ?? "unknown",
            name:       user.user_metadata?.full_name ?? user.user_metadata?.name ?? "—",
            id:         user.id,
            signedUpAt: user.created_at ?? new Date().toISOString(),
          }),
        }).catch((err) => console.error("[notify-new-user] fetch failed:", err));
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`);
}
