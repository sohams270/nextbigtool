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

      // Ensure a profile row exists for this user so OnboardingGate can query it.
      // upsert with ignoreDuplicates means we won't clobber existing profile data.
      await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`);
}
