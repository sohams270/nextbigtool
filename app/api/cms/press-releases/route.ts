import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function calcReadTime(content: string): string {
  const text = content.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function buildStructuredData(post: {
  title: string;
  excerpt: string;
  author: string;
  publish_date?: string | null;
  updated_at?: string;
  slug: string;
  featured_image_url?: string | null;
  tags?: string[];
  content: string;
  company_name?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: post.company_name || "Next Big Tool",
      url: "https://www.nextbigtool.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.nextbigtool.com/favicon-192x192.png",
      },
    },
    datePublished: post.publish_date ?? new Date().toISOString(),
    dateModified: post.updated_at ?? new Date().toISOString(),
    url: `https://www.nextbigtool.com/press-release/${post.slug}`,
    image:
      post.featured_image_url ??
      "https://www.nextbigtool.com/favicon-192x192.png",
    keywords: (post.tags ?? []).join(", "),
    articleBody: stripHtml(post.content),
  };
}

function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get("cms_session");
  return !!session && session.value.trim() !== "";
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cms_press_releases")
    .select(
      "id, title, slug, excerpt, author, status, featured, publish_date, company_name, read_time, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pressReleases: data });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createAdminClient();

  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Build slug — ensure uniqueness
  let baseSlug = body.slug?.trim() || slugify(title);
  if (!baseSlug) baseSlug = "release-" + Date.now();

  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("cms_press_releases")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const content = body.content ?? "";
  const readTime = calcReadTime(content);

  const publishDate =
    body.status === "published"
      ? body.publish_date || new Date().toISOString()
      : body.publish_date ?? null;

  const postData = {
    title,
    slug,
    content,
    excerpt: body.excerpt ?? "",
    company_name: body.company_name ?? "",
    company_url: body.company_url ?? "",
    contact_name: body.contact_name ?? "",
    contact_email: body.contact_email ?? "",
    featured_image_url: body.featured_image_url ?? null,
    author: body.author ?? "The NBT Team",
    tags: body.tags ?? [],
    status: body.status ?? "draft",
    featured: body.featured ?? false,
    publish_date: publishDate,
    seo_title: body.seo_title ?? "",
    seo_description: body.seo_description ?? "",
    seo_index: body.seo_index ?? true,
    read_time: readTime,
    updated_at: new Date().toISOString(),
  };

  const structured_data =
    body.status === "published"
      ? buildStructuredData({
          ...postData,
          updated_at: postData.updated_at,
        })
      : null;

  const { data, error } = await supabase
    .from("cms_press_releases")
    .insert({ ...postData, structured_data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pressRelease: data }, { status: 201 });
}
