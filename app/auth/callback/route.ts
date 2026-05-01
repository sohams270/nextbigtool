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

      // Send email notification for brand-new signups only
      if (isNewUser) {
        try {
          const nodemailer = (await import("nodemailer")).default;
          const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
          });
          const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "—";
          const formatted = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });
          await transporter.sendMail({
            from: `"NBT Alerts" <${process.env.ZOHO_EMAIL}>`,
            to: "soham@nextbigtool.com",
            subject: `🎉 New signup: ${user.email}`,
            html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
        <div style="margin-bottom:20px;"><div style="display:inline-block;background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B35;letter-spacing:0.06em;text-transform:uppercase;">✦ New Signup</div></div>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">Someone just joined Next Big Tool 🚀</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;">${formatted} IST</p>
        <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;">
          <tr style="border-bottom:1px solid rgba(255,255,255,0.07);"><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;width:30%">Email</td><td style="padding:12px 16px;font-size:13px;color:#fff;font-weight:600;">${user.email}</td></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.07);"><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Name</td><td style="padding:12px 16px;font-size:13px;color:#fff;">${displayName}</td></tr>
          <tr><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">User ID</td><td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.55);font-family:monospace;">${user.id}</td></tr>
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.3);">Automated alert from Next Big Tool.</div>
      </div>`,
          });
        } catch (err) {
          console.error("[auth/callback] signup email failed:", err);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`);
}
