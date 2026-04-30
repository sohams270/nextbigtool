import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("cms_blog_posts")
    .select(`*, cms_blog_categories(id, name, slug)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    robots: post.seo_index ? "index, follow" : "noindex, nofollow",
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.featured_image_url ? [post.featured_image_url] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const category = (post.cms_blog_categories as { name: string; slug: string } | null);
  const publishDate = post.publish_date
    ? new Date(post.publish_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* Structured data */}
      {post.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structured_data) }}
        />
      )}

      {/* Hero image */}
      {post.featured_image_url && (
        <div style={{ width: "100%", maxHeight: 480, overflow: "hidden" }}>
          <img
            src={post.featured_image_url}
            alt={post.title}
            style={{ width: "100%", height: 480, objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* Article */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "48px 28px 80px", width: "100%" }}>
        {/* Category badge */}
        {category && (
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              background: "rgba(255,107,53,0.1)",
              color: "#FF6B35",
              border: "1px solid rgba(255,107,53,0.25)",
              textTransform: "uppercase",
            }}>
              {category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(24px, 5vw, 40px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          lineHeight: 1.2,
          margin: "0 0 20px",
        }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: "1px solid var(--border)",
        }}>
          {/* Author avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#FF6B35,#FF4500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}>
              {(post.author ?? "N")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                {post.author ?? "The NBT Team"}
              </div>
              {publishDate && (
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{publishDate}</div>
              )}
            </div>
          </div>

          {/* Read time */}
          <span style={{
            fontSize: 11,
            color: "var(--ink-muted)",
            background: "var(--surface-alt)",
            padding: "3px 10px",
            borderRadius: 99,
          }}>
            {post.read_time ?? "5 min"} read
          </span>
        </div>

        {/* Content */}
        <div
          className="tiptap-editor blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Tags
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(post.tags as string[]).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "var(--surface-alt)",
                    color: "var(--ink-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
