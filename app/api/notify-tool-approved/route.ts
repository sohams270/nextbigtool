import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createTransporter, EMAIL_FROM } from "@/utils/email";

function buildApprovedHtml(tool: {
  name: string;
  slug: string;
  tagline: string;
  logo_url: string | null;
}) {
  const toolUrl = `https://www.nextbigtool.com/tools/${tool.slug}`;

  const logoHtml = tool.logo_url
    ? `<img src="${tool.logo_url}" alt="${tool.name}" width="52" height="52" style="border-radius:12px;object-fit:contain;display:block;background:#fff;padding:4px;" />`
    : `<div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#FF6B35,#ff3d88);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;">${tool.name[0]}</div>`;

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">

      <!-- Logo -->
      <div style="margin-bottom:24px;background:#0A0B1A;padding:8px 0;border-radius:8px;">
        <a href="https://www.nextbigtool.com" style="display:inline-block;text-decoration:none;">
          <img src="https://www.nextbigtool.com/logo-white.png" alt="NextBigTool" width="150" style="display:block;height:auto;" />
        </a>
      </div>

      <!-- Badge -->
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;background:rgba(0,184,122,0.15);border:1px solid rgba(0,184,122,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#00B87A;letter-spacing:0.06em;text-transform:uppercase;">
          🎉 Your tool is live!
        </div>
      </div>

      <!-- Headline -->
      <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.02em;line-height:1.25;">
        Congrats! <span style="color:#FF6B35;">${tool.name}</span> is now live on NextBigTool 🚀
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px;line-height:1.6;">
        Your submission has been reviewed and approved. It's now publicly listed and discoverable by thousands of builders and founders.
      </p>

      <!-- Tool card -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px 20px;margin-bottom:28px;display:flex;align-items:center;gap:16px;">
        ${logoHtml}
        <div>
          <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px;">${tool.name}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.45);line-height:1.5;">${tool.tagline}</div>
        </div>
      </div>

      <!-- CTA -->
      <a href="${toolUrl}" style="display:block;text-align:center;padding:14px 24px;background:linear-gradient(90deg,#FF6B35,#ff3d88);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.01em;margin-bottom:16px;">
        View your live listing →
      </a>

      <!-- URL hint -->
      <p style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;margin:0 0 28px;word-break:break-all;">
        ${toolUrl}
      </p>

      <!-- Tips -->
      <div style="background:rgba(255,107,53,0.07);border:1px solid rgba(255,107,53,0.2);border-radius:10px;padding:16px 18px;margin-bottom:28px;">
        <div style="font-size:12px;font-weight:700;color:#FF6B35;margin-bottom:10px;letter-spacing:0.04em;text-transform:uppercase;">💡 Make the most of your listing</div>
        <ul style="margin:0;padding:0 0 0 16px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.9;">
          <li>Share your listing link on social media to get upvotes</li>
          <li>Ask your early users to upvote and leave a comment</li>
          <li>Upgrade to Core to unlock Founder CRM and see who upvoted you</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
        You're receiving this because you submitted <strong style="color:rgba(255,255,255,0.4);">${tool.name}</strong> to <a href="https://www.nextbigtool.com" style="color:#FF6B35;text-decoration:none;">NextBigTool</a>.
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

  // Fetch tool + submitter profile
  const { data: tool } = await supabase
    .from("tools")
    .select("name, slug, tagline, logo_url, submitter_id")
    .eq("id", toolId)
    .maybeSingle();

  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  // Get submitter email from auth.users (profiles.email is NULL for most users)
  const { data: authUser } = await supabase.auth.admin.getUserById(tool.submitter_id);
  const submitterEmail = authUser?.user?.email ?? null;

  if (!submitterEmail) {
    return NextResponse.json({ error: "Submitter email not found" }, { status: 404 });
  }

  const html = buildApprovedHtml({
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline ?? "",
    logo_url: tool.logo_url ?? null,
  });

  const transporter = createTransporter();
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: submitterEmail,
    subject: `🎉 ${tool.name} is now live on NextBigTool!`,
    html,
  });

  return NextResponse.json({ ok: true });
}
