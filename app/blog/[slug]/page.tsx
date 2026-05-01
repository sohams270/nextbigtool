import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import ShareButton from "../../components/blog/ShareButton";
import TableOfContents from "../../components/blog/TableOfContents";
import LaunchCTABox from "../../components/blog/LaunchCTABox";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

/* ── H2 extraction & ID injection ──────────────────────────────────────── */
function extractH2s(html: string): { id: string; text: string }[] {
  const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  return matches.map((m) => {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return { id, text };
  });
}

function injectH2Ids(html: string, tocItems: { id: string; text: string }[]): string {
  let result = html;
  tocItems.forEach(({ id, text }) => {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`<h2([^>]*)>${escaped}</h2>`, "i"),
      `<h2$1 id="${id}" style="scroll-margin-top:90px">${text}</h2>`
    );
  });
  return result;
}

/* ── Data fetching ──────────────────────────────────────────────────────── */
async function getPost(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("cms_blog_posts")
    .select(`*, cms_blog_categories(id, name, slug), cms_authors(id, name, bio, linkedin_url, avatar_url)`)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelatedPosts(currentSlug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("cms_blog_posts")
    .select("id, title, slug, featured_image_url, publish_date, created_at")
    .eq("status", "published")
    .neq("slug", currentSlug)
    .order("publish_date", { ascending: false })
    .limit(3);
  return data ?? [];
}

async function getPressReleases() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
      .from("cms_press_releases")
      .select("id, title, slug, excerpt, company_name, publish_date, created_at")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

/* ── Metadata ───────────────────────────────────────────────────────────── */
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

/* ── Mini components ────────────────────────────────────────────────────── */
function RelatedPostCard({ post }: { post: Record<string, unknown> }) {
  const title = post.title as string;
  const slug = post.slug as string;
  const featuredImageUrl = post.featured_image_url as string | null;
  const date = post.publish_date
    ? new Date(post.publish_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <a
      href={`/blog/${slug}`}
      style={{
        textDecoration: "none",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {featuredImageUrl ? (
        <img
          src={featuredImageUrl}
          alt={title}
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 8,
          flexShrink: 0,
          background: "linear-gradient(135deg,#FF6B35 0%,#ff3d88 100%)",
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--ink)",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          marginBottom: 4,
        }}>
          {title}
        </div>
        {date && (
          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{date}</div>
        )}
      </div>
    </a>
  );
}

function PressReleaseCard({ pr }: { pr: Record<string, unknown> }) {
  const title = pr.title as string;
  const slug = pr.slug as string;
  const excerpt = pr.excerpt as string | null;
  const companyName = pr.company_name as string | null;
  const date = pr.publish_date
    ? new Date(pr.publish_date as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <a
      href={`/press-release/${slug}`}
      style={{
        textDecoration: "none",
        display: "block",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px",
        transition: "box-shadow 0.15s",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
        {companyName ?? "Press Release"}
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--ink)",
        lineHeight: 1.4,
        marginBottom: 6,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {title}
      </div>
      {excerpt && (
        <div style={{
          fontSize: 12,
          color: "var(--ink-muted)",
          lineHeight: 1.5,
          marginBottom: 8,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {excerpt}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {date && <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{date}</span>}
        <span style={{ fontSize: 12, fontWeight: 600, color: "#FF6B35" }}>Read →</span>
      </div>
    </a>
  );
}

/* ── LinkedIn icon ──────────────────────────────────────────────────────── */
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* ── Page ───────────────────────────────────────────────────────────────── */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, relatedPosts, pressReleases] = await Promise.all([
    getPost(slug),
    getRelatedPosts(slug),
    getPressReleases(),
  ]);

  if (!post) notFound();

  const category = post.cms_blog_categories as { name: string; slug: string } | null;
  const authorObj = post.cms_authors as { name: string; bio: string; linkedin_url: string; avatar_url: string } | null;
  const authorName = authorObj?.name ?? post.author ?? "The NBT Team";
  const authorBio = authorObj?.bio || post.author_bio || "";
  const authorLinkedin = authorObj?.linkedin_url || post.author_linkedin_url || "";
  const authorAvatar = authorObj?.avatar_url || post.author_avatar_url || "";

  const publishDate = post.publish_date
    ? new Date(post.publish_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const postUrl = `https://www.nextbigtool.com/blog/${slug}`;
  const rawContent: string = post.content ?? "";
  const tocItems = extractH2s(rawContent);
  const processedContent = injectH2Ids(rawContent, tocItems);

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

      {/* ── HERO ── */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 0",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}>
          <div className="blog-post-hero">
            {/* Left: meta */}
            <div>
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12, color: "var(--ink-muted)" }}>
                <a href="/blog" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Blog</a>
                {category && (
                  <>
                    <span>›</span>
                    <a href={`/blog?category=${category.slug}`} style={{ color: "var(--ink-muted)", textDecoration: "none" }}>
                      {category.name}
                    </a>
                  </>
                )}
              </div>

              {/* Category badge */}
              {category && (
                <div style={{ marginBottom: 14 }}>
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
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                lineHeight: 1.2,
                margin: "0 0 20px",
              }}>
                {post.title}
              </h1>

              {/* Meta row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Avatar + name + date */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#FF6B35,#FF4500)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}>
                      {authorName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                      {authorName}
                    </div>
                    {publishDate && (
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{publishDate}</div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <span style={{ width: 1, height: 20, background: "var(--border)", display: "inline-block" }} />

                {/* Read time */}
                <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>
                  {post.read_time ?? "5 min"} read
                </span>

                {/* Divider */}
                <span style={{ width: 1, height: 20, background: "var(--border)", display: "inline-block" }} />

                {/* Share button */}
                <ShareButton url={postUrl} />
              </div>
            </div>

            {/* Right: featured image */}
            <div className="blog-post-hero-image">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  style={{
                    width: "100%",
                    height: 280,
                    objectFit: "cover",
                    borderRadius: 16,
                    display: "block",
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: 280,
                  borderRadius: 16,
                  background: "linear-gradient(135deg,rgba(255,107,53,0.15) 0%,rgba(255,61,136,0.15) 100%)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                }}>
                  📝
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-COLUMN BODY ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px 80px", width: "100%" }}>
        <div className="blog-post-layout">

          {/* LEFT: Table of contents */}
          <div className="blog-post-layout-left">
            <TableOfContents items={tocItems} />
          </div>

          {/* CENTER: Article */}
          <article>
            <div
              className="tiptap-editor blog-post-content"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Tags */}
            {post.tags && (post.tags as string[]).length > 0 && (
              <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink-muted)",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}>
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

            {/* Author Bio */}
            {(authorBio || authorLinkedin) && (
              <div style={{
                marginTop: 40,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}>
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#FF6B35,#FF4500)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}>
                    {authorName[0].toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                    {authorName}
                  </div>
                  {authorBio && (
                    <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 8 }}>
                      {authorBio}
                    </div>
                  )}
                  {authorLinkedin && (
                    <a
                      href={authorLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#0A66C2",
                        textDecoration: "none",
                      }}
                    >
                      <LinkedInIcon /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Press Releases */}
            {pressReleases.length > 0 && (
              <section style={{ marginTop: 48 }}>
                <h2 style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em",
                  marginBottom: 20,
                }}>
                  Read the Press Releases
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {(pressReleases as Record<string, unknown>[]).map((pr) => (
                    <PressReleaseCard key={pr.id as string} pr={pr} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* RIGHT: Sidebar */}
          <aside className="blog-post-layout-right">
            {/* CTA Box */}
            <LaunchCTABox />

            {/* You Might Also Like */}
            {relatedPosts.length > 0 && (
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
                  marginBottom: 4,
                }}>
                  You Might Also Like
                </div>
                <div>
                  {(relatedPosts as Record<string, unknown>[]).map((p) => (
                    <RelatedPostCard key={p.id as string} post={p} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
