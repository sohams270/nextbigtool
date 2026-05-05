import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, EMAIL_FROM } from "@/utils/email";

function buildEmailHtml(post: {
  title: string;
  slug: string;
  excerpt: string;
  seo_description: string;
  featured_image_url: string | null;
  author: string;
  read_time: string;
}) {
  const postUrl = `https://www.nextbigtool.com/blog/${post.slug}`;
  const excerpt = post.seo_description?.trim() || post.excerpt?.trim() || "";

  const imageHtml = post.featured_image_url
    ? `<div style="margin-bottom:24px;border-radius:10px;overflow:hidden;">
        <a href="${postUrl}" style="display:block;text-decoration:none;">
          <img src="${post.featured_image_url}" alt="${post.title}" width="100%" style="display:block;max-height:260px;object-fit:cover;border-radius:10px;" />
        </a>
      </div>`
    : "";

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
        <div style="display:inline-block;background:rgba(59,127,255,0.15);border:1px solid rgba(59,127,255,0.4);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:#3B7FFF;letter-spacing:0.06em;text-transform:uppercase;">
          ✍️ New Blog Post
        </div>
      </div>

      <!-- Headline -->
      <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.25;">
        <a href="${postUrl}" style="color:#fff;text-decoration:none;">${post.title}</a>
      </h1>

      <!-- Meta -->
      <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:0 0 20px;">
        By <strong style="color:rgba(255,255,255,0.55);">${post.author}</strong> · ${post.read_time} read
      </p>

      <!-- Featured image -->
      ${imageHtml}

      <!-- Excerpt -->
      ${excerpt ? `<p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0 0 28px;line-height:1.7;">${excerpt}</p>` : ""}

      <!-- CTA -->
      <a href="${postUrl}" style="display:block;text-align:center;padding:14px 24px;background:linear-gradient(90deg,#FF6B35,#ff3d88);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.01em;">
        Read the full article →
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

  let body: { postId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { postId } = body;
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const supabase = createAdminClient();

  // Fetch blog post details
  const { data: post } = await supabase
    .from("cms_blog_posts")
    .select("id, title, slug, excerpt, seo_description, featured_image_url, author, read_time")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Collect all recipient emails:
  // 1. Signed-up users — emails live in auth.users, NOT profiles.email (which is NULL for most)
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  // 2. Newsletter subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("subscribed", true);

  // Deduplicate
  const allEmails = new Set<string>();
  for (const u of authData?.users ?? []) if (u.email) allEmails.add(u.email.toLowerCase());
  for (const s of subscribers ?? []) if (s.email) allEmails.add(s.email.toLowerCase());

  const recipients = [...allEmails];
  if (recipients.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const html = buildEmailHtml(post);
  const subject = `New Blog Alert on NextBigTool 🚨: ${post.title}`;

  // Send in batches of 20
  const BATCH = 20;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(email => sendEmail({ to: email, subject, html }))
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        const msg = result.reason?.message ?? String(result.reason);
        errors.push(msg);
        console.error("[notify-new-blog] send failed:", msg);
      }
    }
  }

  return NextResponse.json({ ok: true, sent, failed, errors: errors.slice(0, 5) });
}
