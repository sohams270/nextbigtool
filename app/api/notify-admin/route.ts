import { NextResponse } from "next/server";
import { sendEmail, EMAIL_FROM } from "@/utils/email";

type NotifyPayload =
  | { type: "tool_submission";   toolName: string; tagline: string; plan: string; website: string; contactEmail: string; founderName: string }
  | { type: "hof_nomination";    toolName: string; pitch: string; founderName: string }
  | { type: "newsletter_request"; headline: string; story: string; link?: string; founderName: string }
  | { type: "blog_request";      companyName: string; headline: string; story: string; link?: string; founderName: string };

const META: Record<string, { emoji: string; label: string; color: string }> = {
  tool_submission:    { emoji: "🛠️", label: "New Tool Submission",         color: "#FF6B35" },
  hof_nomination:     { emoji: "🏆", label: "Hall of Fame Nomination",     color: "#F59E0B" },
  newsletter_request: { emoji: "📰", label: "Newsletter Featuring Request", color: "#3B7FFF" },
  blog_request:       { emoji: "✍️", label: "Blog Post Request",            color: "#00B875" },
};

function row(label: string, value: string) {
  return `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
      <td style="padding:11px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;width:36%;white-space:nowrap;">${label}</td>
      <td style="padding:11px 16px;font-size:13px;color:#fff;">${value}</td>
    </tr>`;
}

function buildHtml(payload: NotifyPayload, meta: typeof META[string]) {
  let rows = "";

  if (payload.type === "tool_submission") {
    rows = [
      row("Tool Name",    payload.toolName),
      row("Tagline",      payload.tagline),
      row("Plan",         payload.plan),
      row("Website",      `<a href="${payload.website}" style="color:${meta.color}">${payload.website}</a>`),
      row("Contact",      payload.contactEmail),
      row("Founder",      payload.founderName),
    ].join("");
  } else if (payload.type === "hof_nomination") {
    rows = [
      row("Tool",         payload.toolName),
      row("Founder",      payload.founderName),
      row("Pitch",        payload.pitch),
    ].join("");
  } else if (payload.type === "newsletter_request") {
    rows = [
      row("Founder",      payload.founderName),
      row("Headline",     payload.headline),
      row("Story",        payload.story),
      ...(payload.link ? [row("Link", `<a href="${payload.link}" style="color:${meta.color}">${payload.link}</a>`)] : []),
    ].join("");
  } else if (payload.type === "blog_request") {
    rows = [
      row("Company",      payload.companyName),
      row("Founder",      payload.founderName),
      row("Headline",     payload.headline),
      row("Story",        payload.story),
      ...(payload.link ? [row("Link", `<a href="${payload.link}" style="color:${meta.color}">${payload.link}</a>`)] : []),
    ].join("");
  }

  const adminUrl = "https://www.nextbigtool.com/admin";

  return `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;background:${meta.color}22;border:1px solid ${meta.color}66;border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:${meta.color};letter-spacing:0.06em;text-transform:uppercase;">
          ${meta.emoji} ${meta.label}
        </div>
      </div>

      <h1 style="font-size:20px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">
        Action required in your admin panel
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 24px;">
        ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
      </p>

      <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;margin-bottom:24px;">
        ${rows}
      </table>

      <a href="${adminUrl}" style="display:inline-block;padding:10px 24px;background:${meta.color};color:#fff;border-radius:99px;font-size:12px;font-weight:700;text-decoration:none;">
        Review in Admin Panel →
      </a>

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.25);">
        Automated alert from Next Big Tool. Only you receive this.
      </div>
    </div>`;
}

export async function POST(request: Request) {
  // Lightweight key check — prevents random internet requests
  const key = request.headers.get("x-internal-secret");
  if (key !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: NotifyPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const meta = META[payload.type];
  if (!meta) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

  const subjects: Record<string, string> = {
    tool_submission:    `🛠️ New tool submitted: ${"toolName" in payload ? payload.toolName : ""}`,
    hof_nomination:     `🏆 HoF nomination: ${"toolName" in payload ? payload.toolName : ""}`,
    newsletter_request: `📰 Newsletter request: ${"headline" in payload ? payload.headline : ""}`,
    blog_request:       `✍️ Blog request: ${"headline" in payload ? payload.headline : ""}`,
  };

  try {
    await sendEmail({
      to: "soham@nextbigtool.com",
      subject: subjects[payload.type],
      html: buildHtml(payload, meta),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-admin] email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
