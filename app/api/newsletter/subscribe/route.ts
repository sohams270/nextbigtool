import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, source = "sidebar" } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, subscribed")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.subscribed) {
        return NextResponse.json({ error: "You're already subscribed!" }, { status: 409 });
      }
      // Re-subscribe if they previously unsubscribed
      await supabase
        .from("newsletter_subscribers")
        .update({ subscribed: true, subscribed_at: new Date().toISOString(), unsubscribed_at: null })
        .eq("id", existing.id);
    } else {
      await supabase.from("newsletter_subscribers").insert({
        email,
        source,
        subscribed: true,
        subscribed_at: new Date().toISOString(),
      });
    }

    // Notify admin via email
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
      });

      await transporter.sendMail({
        from: `"NBT Alerts" <${process.env.ZOHO_EMAIL}>`,
        to: "soham@nextbigtool.com",
        subject: `📧 New newsletter subscriber: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:28px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
            <div style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#818cf8;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:16px;">
              📧 Newsletter Subscriber
            </div>
            <h2 style="font-size:18px;font-weight:800;margin:0 0 4px;letter-spacing:-0.02em;">New subscriber joined</h2>
            <p style="font-size:12px;color:rgba(255,255,255,0.4);margin:0 0 20px;">
              ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
            </p>
            <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;width:30%">Email</td><td style="padding:10px 16px;font-size:13px;color:#fff">${email}</td></tr>
              <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Source</td><td style="padding:10px 16px;font-size:13px;color:#fff">${source}</td></tr>
            </table>
            <a href="https://www.nextbigtool.com/admin" style="display:inline-block;padding:10px 22px;background:#818cf8;color:#fff;border-radius:99px;font-size:12px;font-weight:700;text-decoration:none;">
              View in Admin →
            </a>
            <div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.25);">
              Automated alert from Next Big Tool.
            </div>
          </div>`,
      });
    } catch (mailErr) {
      console.error("[newsletter] email notification failed:", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter/subscribe]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
