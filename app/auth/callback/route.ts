import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createTransporter, EMAIL_FROM } from "@/utils/email";

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
      await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

      // Detect new signup: created_at and last_sign_in_at are within 10 seconds of each other
      const createdAt     = new Date(user.created_at).getTime();
      const lastSignIn    = new Date(user.last_sign_in_at ?? user.created_at).getTime();
      const isNewUser     = Math.abs(createdAt - lastSignIn) < 10_000;

      // Send emails for brand-new signups only
      if (isNewUser) {
        try {
          const transporter = createTransporter();
          const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
          const firstName = displayName.split(" ")[0] || "there";
          const formatted = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });

          // 1. Admin alert to Soham
          await transporter.sendMail({
            from: EMAIL_FROM,
            to: "soham@nextbigtool.com",
            subject: `🎉 New signup: ${user.email}`,
            html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
        <div style="margin-bottom:20px;"><div style="display:inline-block;background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B35;letter-spacing:0.06em;text-transform:uppercase;">✦ New Signup</div></div>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">Someone just joined Next Big Tool 🚀</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;">${formatted} IST</p>
        <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;">
          <tr style="border-bottom:1px solid rgba(255,255,255,0.07);"><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;width:30%">Email</td><td style="padding:12px 16px;font-size:13px;color:#fff;font-weight:600;">${user.email}</td></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.07);"><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Name</td><td style="padding:12px 16px;font-size:13px;color:#fff;">${displayName || "—"}</td></tr>
          <tr><td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">User ID</td><td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.55);font-family:monospace;">${user.id}</td></tr>
        </table>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.3);">Automated alert from Next Big Tool.</div>
      </div>`,
          });

          // 2. Welcome email to the new user
          await transporter.sendMail({
            from: `"Soham from NextBigTool" <soham@nextbigtool.com>`,
            to: user.email!,
            subject: "Welcome to NextBigTool 🚀 — here's where to start",
            html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0A0B1A;padding:28px 36px;">
            <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">NextBigTool</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            <p style="margin:0 0 8px;font-size:15px;color:#111827;">Hi ${firstName},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Welcome to NextBigTool — glad you're here.
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
              This is a platform built for founders and builders who are serious about getting their tools discovered. Here's what you can do right now:
            </p>

            <!-- Feature 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#f9fafb;border-radius:10px;padding:18px 20px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">📦 Submit your tool</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">List your product in front of early adopters actively looking for new tools. It takes less than 5 minutes.</p>
                </td>
              </tr>
            </table>

            <!-- Feature 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#f9fafb;border-radius:10px;padding:18px 20px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">📣 Build in Public</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Share your journey — wins, lessons, milestones. The community here pays attention.</p>
                </td>
              </tr>
            </table>

            <!-- Feature 3 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f9fafb;border-radius:10px;padding:18px 20px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">🔍 Discover tools</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Browse 33 categories of indie and startup tools. You might find your next favourite product.</p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#FF6B35;border-radius:8px;">
                  <a href="https://nextbigtool.com/dashboard" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Go to your dashboard →</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
              If you have any questions, just reply to this email — I read every one.
            </p>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:0 36px 36px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
              — Soham<br>
              Founder, NextBigTool<br>
              <a href="https://nextbigtool.com" style="color:#FF6B35;text-decoration:none;">nextbigtool.com</a>
              &nbsp;·&nbsp;
              <a href="https://www.linkedin.com/in/soham-marketing/" style="color:#FF6B35;text-decoration:none;">LinkedIn</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              You're receiving this because you signed up at nextbigtool.com.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
