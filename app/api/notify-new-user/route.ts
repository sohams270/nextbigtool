import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Zoho SMTP transporter — credentials come from env vars
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.in",       // use smtp.zoho.com if your account is on .com
    port: 465,
    secure: true,               // SSL
    auth: {
      user: process.env.ZOHO_EMAIL,    // soham@nextbigtool.com
      pass: process.env.ZOHO_PASSWORD, // Zoho app-specific password
    },
  });
}

export async function POST(request: Request) {
  // Guard: only allow internal calls with the shared secret
  const authHeader = request.headers.get("x-internal-secret");
  if (authHeader !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string; name?: string; id?: string; signedUpAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email = "unknown", name = "—", id = "—", signedUpAt = new Date().toISOString() } = body;

  const formatted = new Date(signedUpAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"NBT Alerts" <${process.env.ZOHO_EMAIL}>`,
      to: "soham@nextbigtool.com",
      subject: `🎉 New signup: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <div style="display:inline-block;background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B35;letter-spacing:0.06em;text-transform:uppercase;">
              ✦ New Signup
            </div>
          </div>

          <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">
            Someone just joined Next Big Tool 🚀
          </h1>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;">
            ${formatted} (IST)
          </p>

          <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;">
            <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
              <td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;width:36%;">Email</td>
              <td style="padding:12px 16px;font-size:13px;color:#fff;font-weight:600;">${email}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
              <td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;">Name</td>
              <td style="padding:12px 16px;font-size:13px;color:#fff;">${name}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;">User ID</td>
              <td style="padding:12px 16px;font-size:12px;color:rgba(255,255,255,0.55);font-family:monospace;">${id}</td>
            </tr>
          </table>

          <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.3);">
            This is an automated alert from Next Big Tool. Only you receive this.
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-new-user] SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
