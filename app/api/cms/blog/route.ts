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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Next Big Tool",
      url: "https://www.nextbigtool.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.nextbigtool.com/favicon-192x192.png",
      },
    },
    datePublished: post.publish_date ?? new Date().toISOString(),
    dateModified: post.updated_at ?? new Date().toISOString(),
    url: `https://www.nextbigtool.com/blog/${post.slug}`,
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
    .from("cms_blog_posts")
    .select(
      `
      id, title, slug, excerpt, author, status, featured, publish_date,
      read_time, created_at, updated_at, category_id,
      cms_blog_categories(id, name, slug)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
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
  if (!baseSlug) baseSlug = "post-" + Date.now();

  // Check slug collision
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("cms_blog_posts")
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
    featured_image_url: body.featured_image_url ?? null,
    author: body.author ?? "The NBT Team",
    author_id: body.author_id ?? null,
    category_id: body.category_id ?? null,
    tags: body.tags ?? [],
    status: body.status ?? "draft",
    featured: body.featured ?? false,
    allow_comments: body.allow_comments ?? true,
    publish_date: publishDate,
    seo_title: body.seo_title ?? "",
    seo_description: body.seo_description ?? "",
    seo_index: body.seo_index ?? true,
    read_time: readTime,
    updated_at: new Date().toISOString(),
  };

  // Build structured_data for published posts
  const structured_data =
    body.status === "published"
      ? buildStructuredData({
          ...postData,
          updated_at: postData.updated_at,
        })
      : null;

  const { data, error } = await supabase
    .from("cms_blog_posts")
    .insert({ ...postData, structured_data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
