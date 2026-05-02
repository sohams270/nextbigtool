import { NextRequest, NextResponse } from "next/server";
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

function buildEmailHtml(tool: {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  pricing: string;
  pricing_amount: string | null;
  category: string | null;
  use_cases: string[];
  logo_url: string | null;
}) {
  const toolUrl = `https://www.nextbigtool.com/tools/${tool.slug}`;

  const pricingLabel = tool.pricing === "free"
    ? "Free"
    : tool.pricing === "freemium"
    ? "Freemium"
    : tool.pricing_amount
    ? `Paid · ~$${tool.pricing_amount}/mo`
    : "Paid";

  const logoHtml = tool.logo_url
    ? `<img src="${tool.logo_url}" alt="${tool.name}" width="48" height="48" style="border-radius:10px;object-fit:contain;display:block;" />`
    : `<div style="width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,#FF6B35,#ff3d88);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;">${tool.name[0]}</div>`;

  const useCasesHtml = tool.use_cases.length
    ? tool.use_cases.slice(0, 4).map(uc =>
        `<span style="display:inline-block;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.65);margin:0 4px 4px 0;">${uc}</span>`
      ).join("")
    : `<span style="font-size:12px;color:rgba(255,255,255,0.35);">—</span>`;

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">

      <!-- Logo -->
      <div style="margin-bottom:24px;">
        <a href="https://www.nextbigtool.com" style="display:inline-block;text-decoration:none;">
          <img src="https://www.nextbigtool.com/logo-white.png" alt="NextBigTool" width="150" style="display:block;height:auto;" />
        </a>
      </div>

      <!-- Badge -->
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;background:rgba(255,107,53,0.15);border:1px solid rgba(255,107,53,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B35;letter-spacing:0.06em;text-transform:uppercase;">
          🚀 New Tool Just Launched
        </div>
      </div>

      <!-- Headline -->
      <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.2;">
        Meet <span style="color:#FF6B35;">${tool.name}</span> — just listed on NextBigTool
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;line-height:1.6;">
        ${tool.tagline}
      </p>

      <!-- Tool card -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">

        <!-- Tool header -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          ${logoHtml}
          <div>
            <div style="font-size:16px;font-weight:800;color:#fff;">${tool.name}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-top:2px;">${tool.tagline}</div>
          </div>
        </div>

        <!-- Divider -->
        <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:16px;"></div>

        <!-- Details table -->
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.05em;width:36%;vertical-align:top;">About</td>
            <td style="padding:7px 0;font-size:12px;color:rgba(255,255,255,0.75);line-height:1.6;">${tool.description?.slice(0, 200) ?? "—"}${(tool.description?.length ?? 0) > 200 ? "…" : ""}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Category</td>
            <td style="padding:7px 0;font-size:12px;color:rgba(255,255,255,0.75);">${tool.category ?? "—"}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Pricing</td>
            <td style="padding:7px 0;">
              <span style="display:inline-block;background:${tool.pricing === "free" ? "rgba(0,184,122,0.15)" : tool.pricing === "freemium" ? "rgba(59,127,255,0.15)" : "rgba(139,92,246,0.15)"};border:1px solid ${tool.pricing === "free" ? "rgba(0,184,122,0.35)" : tool.pricing === "freemium" ? "rgba(59,127,255,0.35)" : "rgba(139,92,246,0.35)"};border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;color:${tool.pricing === "free" ? "#00B87A" : tool.pricing === "freemium" ? "#3B7FFF" : "#8B5CF6"};">
                ${pricingLabel}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0;font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Use Cases</td>
            <td style="padding:7px 0;">${useCasesHtml}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <a href="${toolUrl}" style="display:block;text-align:center;padding:14px 24px;background:linear-gradient(90deg,#FF6B35,#ff3d88);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.01em;">
        View ${tool.name} on NextBigTool →
      </a>

      <!-- Footer -->
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
        You're receiving this because you're part of the <a href="https://www.nextbigtool.com" style="color:#FF6B35;text-decoration:none;">NextBigTool</a> community.
        Not interested? You can ignore future emails.
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  // Guard with internal secret
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { toolId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { toolId } = body;
  if (!toolId) return NextResponse.json({ error: "Missing toolId" }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch full tool details including category and use cases
  const { data: tool } = await supabase
    .from("tools")
    .select(`
      id, name, slug, tagline, description, pricing, pricing_amount, logo_url,
      categories(name),
      tool_tags(tags(name))
    `)
    .eq("id", toolId)
    .maybeSingle();

  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const category = (tool as any).categories?.name ?? null;
  const use_cases: string[] = ((tool as any).tool_tags ?? [])
    .map((tt: any) => tt?.tags?.name)
    .filter(Boolean);

  const toolData = {
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline ?? "",
    description: tool.description ?? "",
    pricing: tool.pricing ?? "free",
    pricing_amount: (tool as any).pricing_amount ?? null,
    category,
    use_cases,
    logo_url: tool.logo_url ?? null,
  };

  // Collect all recipient emails:
  // 1. Signed-up users (from profiles)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .not("email", "is", null);

  // 2. Newsletter subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("subscribed", true);

  // Deduplicate emails
  const allEmails = new Set<string>();
  for (const p of profiles ?? []) if (p.email) allEmails.add(p.email.toLowerCase());
  for (const s of subscribers ?? []) if (s.email) allEmails.add(s.email.toLowerCase());

  const recipients = [...allEmails];
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const html = buildEmailHtml(toolData);
  const subject = `🚀 [NextBigTool] ${toolData.name} just launched — check it out!`;

  const transporter = createTransporter();

  // Send in batches of 20 to avoid SMTP timeouts
  const BATCH = 20;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(email =>
        transporter.sendMail({
          from: `"NextBigTool" <${process.env.ZOHO_EMAIL}>`,
          to: email,
          subject,
          html,
        })
      )
    );
    sent += batch.length;
  }

  return NextResponse.json({ ok: true, sent });
}
