import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/utils/supabase/admin";

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD,
    },
  });
}

const NBT_LOGO = `<div style="margin-bottom:24px;"><a href="https://www.nextbigtool.com" style="display:inline-block;text-decoration:none;"><img src="https://www.nextbigtool.com/logo-white.png" alt="NextBigTool" width="160" style="display:block;height:auto;" /></a></div>`;

function buildUpvoteHtml(toolName: string, toolSlug: string) {
  const toolUrl = `https://www.nextbigtool.com/tools/${toolSlug}`;
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
      ${NBT_LOGO}
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B35;letter-spacing:0.06em;text-transform:uppercase;">
          🔺 New Upvote
        </div>
      </div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">
        Someone upvoted <span style="color:#FF6B35;">${toolName}</span>!
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;line-height:1.6;">
        Your product is getting traction on NextBigTool. Keep sharing it to get more eyes on it.
      </p>
      <a href="${toolUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#FF6B35,#ff3d88);color:#fff;text-decoration:none;border-radius:9px;font-weight:700;font-size:13px;">
        View your product →
      </a>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.3);">
        You're receiving this because you listed <strong style="color:rgba(255,255,255,0.5);">${toolName}</strong> on <a href="https://www.nextbigtool.com" style="color:#FF6B35;text-decoration:none;">NextBigTool</a>.
      </div>
    </div>
  `;
}

function buildCommentHtml(toolName: string, toolSlug: string, comment: string, commenterName: string) {
  const toolUrl = `https://www.nextbigtool.com/tools/${toolSlug}`;
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
      ${NBT_LOGO}
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#8B5CF6;letter-spacing:0.06em;text-transform:uppercase;">
          💬 New Comment
        </div>
      </div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;">
        New comment on <span style="color:#8B5CF6;">${toolName}</span>
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 20px;">
        <strong style="color:rgba(255,255,255,0.7);">${commenterName}</strong> left a comment on your NextBigTool listing:
      </p>
      <div style="background:rgba(255,255,255,0.05);border-left:3px solid #8B5CF6;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:28px;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;">
        ${comment}
      </div>
      <a href="${toolUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#8B5CF6,#6366f1);color:#fff;text-decoration:none;border-radius:9px;font-weight:700;font-size:13px;">
        Reply to comment →
      </a>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.3);">
        You're receiving this because you listed <strong style="color:rgba(255,255,255,0.5);">${toolName}</strong> on <a href="https://www.nextbigtool.com" style="color:#FF6B35;text-decoration:none;">NextBigTool</a>.
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  let body: {
    type: "upvote" | "comment";
    toolId: string;
    comment?: string;
    commenterName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { type, toolId, comment, commenterName } = body;
  if (!type || !toolId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Use admin client to bypass RLS — needed to read other users' profile emails
  const supabase = createAdminClient();

  // Fetch tool + owner
  const { data: tool } = await supabase
    .from("tools")
    .select("name, slug, submitter_id")
    .eq("id", toolId)
    .maybeSingle();

  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  // Get owner's email from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", tool.submitter_id)
    .maybeSingle();

  if (!profile?.email) return NextResponse.json({ ok: true, skipped: "no owner email" });

  try {
    const transporter = createTransporter();

    if (type === "upvote") {
      await transporter.sendMail({
        from: `"Next Big Tool" <${process.env.ZOHO_EMAIL}>`,
        to: profile.email,
        subject: `🔺 [NextBigTool] ${tool.name} just received an upvote!`,
        html: buildUpvoteHtml(tool.name, tool.slug),
      });
    } else if (type === "comment") {
      await transporter.sendMail({
        from: `"Next Big Tool" <${process.env.ZOHO_EMAIL}>`,
        to: profile.email,
        subject: `💬 [NextBigTool] New comment on ${tool.name}`,
        html: buildCommentHtml(tool.name, tool.slug, comment ?? "", commenterName ?? "Someone"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-owner] SMTP error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
