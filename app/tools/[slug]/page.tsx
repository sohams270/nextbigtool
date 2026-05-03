import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import UpvoteButton from "@/app/components/UpvoteButton";
import UpvoteBox from "@/app/components/UpvoteBox";
import CommentSection from "./CommentSection";
import CopyLinkButton from "./CopyLinkButton";
import ViewTracker from "@/app/components/ViewTracker";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

/* ── Per-tool Open Graph metadata ─────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: tool } = await supabase
    .from("tools")
    .select("name, tagline, description, logo_url, website_url")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!tool) {
    return { title: "Tool not found — Next Big Tool" };
  }

  // Use uploaded logo, or fall back to Clearbit favicon
  let image = tool.logo_url;
  if (!image && tool.website_url) {
    try {
      const domain = new URL(tool.website_url).hostname.replace(/^www\./, "");
      image = `https://logo.clearbit.com/${domain}`;
    } catch { /* no-op */ }
  }

  const title = `${tool.name} — Next Big Tool`;
  const description = tool.tagline
    ?? tool.description?.slice(0, 155)
    ?? `Discover ${tool.name} on Next Big Tool.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.nextbigtool.com/tools/${slug}`,
      siteName: "Next Big Tool",
      ...(image ? { images: [{ url: image, width: 400, height: 400, alt: tool.name }] } : {}),
      type: "website",
    },
    twitter: {
      card: image ? "summary" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

function pricingLabel(p: string) {
  const map: Record<string, string> = { free: "Free", freemium: "Freemium", paid: "Paid", contact: "Contact" };
  return map[p] ?? p;
}

function pricingBadge(p: string): React.CSSProperties {
  if (p === "free")     return { background: "rgba(34,197,94,0.18)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" };
  if (p === "freemium") return { background: "rgba(34,197,94,0.18)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" };
  if (p === "paid")     return { background: "rgba(251,191,36,0.18)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" };
  return { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" };
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const { data: tool, error: toolErr } = await supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, description, website_url, logo_url, pricing,
      status, upvote_count, demo_url, created_at, submitter_id, screenshots, video_links,
      twitter_url, linkedin_url, youtube_url, instagram_url,
      tool_tags ( tags ( name ) ),
      categories ( name )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (toolErr || !tool) notFound();

  let isUpvoted = false;
  if (user) {
    const { data: vote } = await supabase
      .from("upvotes").select("tool_id")
      .eq("tool_id", tool.id).eq("user_id", user.id).maybeSingle();
    isUpvoted = !!vote;
  }

  // Hall of Fame — top 3
  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select("inducted_at, tools(id, name, tagline, logo_url, slug, website_url)")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false })
    .limit(3);

  type HofTool = { id: string; name: string; tagline: string; logo_url: string | null; slug: string; website_url: string | null; inducted_at: string | null };
  const hofTools: HofTool[] = (hofRows ?? []).map((r: any) => ({
    ...(r.tools as HofTool),
    inducted_at: r.inducted_at,
  }));

  // Featured tools — approved, not in HoF, not the current tool, by upvote_count
  const hofIds = new Set(hofTools.map(t => t.id));
  const { data: featuredRows } = await supabase
    .from("tools")
    .select("id, name, tagline, logo_url, slug, website_url")
    .eq("status", "approved")
    .neq("id", tool.id)
    .order("upvote_count", { ascending: false })
    .limit(20);

  type FeaturedTool = { id: string; name: string; tagline: string; logo_url: string | null; slug: string; website_url: string | null };
  const featuredTools: FeaturedTool[] = (featuredRows ?? [])
    .filter((t: any) => !hofIds.has(t.id))
    .slice(0, 5) as FeaturedTool[];

  const tags = ((tool.tool_tags ?? []) as any[])
    .map((tt: any) => tt.tags?.name).filter(Boolean) as string[];

  const categoryName = (tool.categories as any)?.name ?? null;
  const shots: string[] = Array.isArray(tool.screenshots)
    ? (tool.screenshots as string[]).filter(Boolean) : [];

  // YouTube video links
  const videoLinks: string[] = Array.isArray(tool.video_links)
    ? (tool.video_links as string[]).filter(Boolean) : [];

  function getYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
      if (u.hostname.includes("youtube.com")) {
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
        return u.searchParams.get("v");
      }
    } catch { /* no-op */ }
    return null;
  }

  // Logo helper
  function getLogoSrc(logoUrl: string | null, websiteUrl: string | null): string | null {
    if (logoUrl) return logoUrl;
    if (websiteUrl) {
      try {
        const domain = new URL(websiteUrl).hostname.replace(/^www\./, "");
        return `https://logo.clearbit.com/${domain}`;
      } catch { return null; }
    }
    return null;
  }

  const logoSrc = getLogoSrc(tool.logo_url, tool.website_url);

  // Social links — only fields actually collected at submission
  type SocialLink = { label: string; href: string; viewBox?: string; svgContent: React.ReactNode };
  const socialLinks: SocialLink[] = [];

  if (tool.twitter_url) socialLinks.push({
    label: "Twitter / X",
    href: tool.twitter_url.startsWith("http") ? tool.twitter_url : `https://twitter.com/${tool.twitter_url.replace(/^@/, "")}`,
    svgContent: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />,
  });
  if (tool.linkedin_url) socialLinks.push({
    label: "LinkedIn",
    href: tool.linkedin_url,
    svgContent: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" />,
  });
  if (tool.youtube_url) socialLinks.push({
    label: "YouTube",
    href: tool.youtube_url,
    svgContent: <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor" />,
  });
  if (tool.instagram_url) socialLinks.push({
    label: "Instagram",
    href: tool.instagram_url.startsWith("http") ? tool.instagram_url : `https://instagram.com/${tool.instagram_url.replace(/^@/, "")}`,
    svgContent: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor" />,
  });

  const pb = pricingBadge(tool.pricing);
  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <ViewTracker toolId={tool.id} />
      <TopNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f10 0%, #1a1012 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(255,107,53,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ paddingTop: 24 }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "rgba(255,255,255,0.45)", textDecoration: "none", fontWeight: 500,
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Back to all tools
            </Link>
          </div>

          <div className="tool-hero-inner" style={{ padding: "28px 0 36px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            {/* Logo */}
            <div style={{
              width: 88, height: 88, borderRadius: 20, flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,0.1)", overflow: "hidden",
              background: logoSrc ? "#fff" : `hsl(${tool.name.charCodeAt(0) * 7 % 360},60%,50%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, fontWeight: 800, color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
              position: "relative",
            }}>
              {logoSrc
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoSrc} alt={`${tool.name} logo`} style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
                : tool.name[0].toUpperCase()}
            </div>

            {/* Name / tagline / badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 10 }}>
                {categoryName && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.14)" }}>
                    {categoryName}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, ...pb }}>
                  {pricingLabel(tool.pricing)}
                </span>
                {tags.slice(0, 3).map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>{t}</span>
                ))}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", margin: "0 0 8px", lineHeight: 1.1 }}>
                {tool.name}
              </h1>
              {tool.tagline && (
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.55, maxWidth: 520 }}>
                  {tool.tagline}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="tool-hero-ctas" style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignItems: "flex-end" }}>
              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 11,
                  background: "#FF6B35", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(255,107,53,0.4)", whiteSpace: "nowrap" as const,
                }}>
                  Visit website
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </a>
              )}
              <UpvoteButton toolId={tool.id} userId={user?.id ?? null} initialCount={tool.upvote_count} initialActive={isUpvoted} size="md" />

              {/* Social icon buttons — only shown if at least one is filled */}
              {(tool.twitter_url || tool.linkedin_url || tool.youtube_url || tool.instagram_url) && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {tool.twitter_url && (
                    <a href={tool.twitter_url.startsWith("http") ? tool.twitter_url : `https://twitter.com/${tool.twitter_url.replace(/^@/, "")}`}
                      target="_blank" rel="noopener noreferrer" title="Twitter / X"
                      style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", transition: "background 0.15s" }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  )}
                  {tool.linkedin_url && (
                    <a href={tool.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                      style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {tool.youtube_url && (
                    <a href={tool.youtube_url} target="_blank" rel="noopener noreferrer" title="YouTube"
                      style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                  {tool.instagram_url && (
                    <a href={tool.instagram_url.startsWith("http") ? tool.instagram_url : `https://instagram.com/${tool.instagram_url.replace(/^@/, "")}`}
                      target="_blank" rel="noopener noreferrer" title="Instagram"
                      style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN CONTENT ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "28px 24px 80px", boxSizing: "border-box" as const }}>
        <div className="tool-page-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <div className="tool-page-left-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Hall of Fame */}
            <div style={{ background: "var(--surface)", border: "1.5px solid rgba(255,215,0,0.4)", borderRadius: 16, overflow: "hidden" }}>
              {/* Gold top bar */}
              <div style={{ height: 3, background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>Hall of Fame</span>
                  </div>
                  <Link href="/discover?tab=hall-of-fame" style={{ fontSize: 10, fontWeight: 700, color: "#ff6a3d", textDecoration: "none" }}>
                    View all →
                  </Link>
                </div>

                {hofTools.length === 0 ? (
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", textAlign: "center", padding: "10px 0" }}>No inductees yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {hofTools.map(t => {
                      const lSrc = getLogoSrc(t.logo_url, t.website_url);
                      return (
                        <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: "none" }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 10px", borderRadius: 10, background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)" }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, overflow: "hidden", position: "relative", background: lSrc ? "#fff" : `hsl(${t.name.charCodeAt(0) * 7 % 360},60%,50%)`, border: "1px solid rgba(255,215,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                              {lSrc
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={lSrc} alt={t.name} style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
                                : t.name[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                              <div style={{ fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{t.tagline}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Featured Tools */}
            {featuredTools.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>
                  Featured Tools
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {featuredTools.map(t => {
                    const lSrc = getLogoSrc(t.logo_url, t.website_url);
                    return (
                      <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--border-faint)" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, overflow: "hidden", position: "relative", background: lSrc ? "#fff" : `hsl(${t.name.charCodeAt(0) * 7 % 360},60%,50%)`, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                            {lSrc
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={lSrc} alt={t.name} style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
                              : t.name[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{t.tagline}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* About */}
            {tool.description && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>} iconBg="#fff7f4" iconBorder="#ffe4d9" title="About" />
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{tool.description}</p>
              </div>
            )}

            {/* Classification */}
            {(categoryName || tags.length > 0) && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>} iconBg="#f5f3ff" iconBorder="#ddd6fe" title="Classification" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {categoryName && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 7 }}>Category</div>
                      <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 13px", borderRadius: 20, background: "#f0f0fe", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                        {categoryName}
                      </span>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 7 }}>Use Cases</div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                        {tags.map(t => (
                          <span key={t} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "var(--surface-alt)", color: "var(--ink-2)", border: "1px solid var(--border)" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* YouTube Videos */}
            {videoLinks.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader
                  icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                  iconBg="#fff0f0" iconBorder="#ffc9c9" title="Product Videos"
                />
                <div style={{ display: "grid", gridTemplateColumns: videoLinks.length === 1 ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {videoLinks.map((link, i) => {
                    const videoId = getYouTubeId(link);
                    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
                    return (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", position: "relative", aspectRatio: "16/9", textDecoration: "none", flexShrink: 0 }}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={`Video ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width={40} height={40} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </div>
                        )}
                        {/* Play button overlay */}
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)", transition: "background 0.15s" }}>
                          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        {/* YouTube badge */}
                        <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.75)", borderRadius: 6, padding: "3px 7px", backdropFilter: "blur(4px)" }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Watch on YouTube</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Screenshots */}
            {shots.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>} iconBg="#f0f9ff" iconBorder="#bae6fd" title="Product Screenshots" />
                <div style={{ display: "grid", gridTemplateColumns: shots.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
                  {shots.map((url, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-dim)", gridColumn: shots.length === 1 || (shots.length === 3 && i === 0) ? "1 / -1" : undefined, aspectRatio: shots.length === 1 ? "16 / 9" : "4 / 3" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Video */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
              <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="#FF6B35"><path d="M8 5v14l11-7z"/></svg>} iconBg="#fff7f4" iconBorder="#ffe4d9" title="Product Video" />
              {tool.demo_url ? (
                isVideoUrl(tool.demo_url) ? (
                  <video controls style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", background: "#000", display: "block" }}>
                    <source src={tool.demo_url} />
                  </video>
                ) : (
                  <a href={tool.demo_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg, #0f0f10 0%, #1c1c1f 100%)", textDecoration: "none", border: "1px solid #2a2a2f" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(255,107,53,0.35)" }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Watch demo video</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{tool.demo_url}</div>
                    </div>
                    <svg style={{ flexShrink: 0 }} width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                  </a>
                )
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 12, background: "var(--surface-dim)", border: "1px dashed var(--border)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--surface-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-muted)" }}>Not updated yet</div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>The maker hasn&apos;t added a demo video.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px" }}>
              <CommentSection toolId={tool.id} userId={user?.id ?? null} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="tool-page-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Product info */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>Product info</div>
              </div>
              <div>
                <UpvoteBox
                  toolId={tool.id}
                  userId={user?.id ?? null}
                  initialCount={tool.upvote_count}
                  initialActive={isUpvoted}
                />
                <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
                  <InfoRow label="Pricing" value={pricingLabel(tool.pricing)} />
                  {categoryName && <InfoRow label="Category" value={categoryName} />}
                  {tool.created_at && <InfoRow label="Listed" value={new Date(tool.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })} />}
                </div>
              </div>
            </div>

            {/* Visit website */}
            {tool.website_url && (
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 0", borderRadius: 12, background: "#FF6B35", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>
                Visit website
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
              </a>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 10 }}>Links</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {socialLinks.map(({ label, href, svgContent }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface-dim)", textDecoration: "none", color: "var(--ink)", fontSize: 12, fontWeight: 600 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24">{svgContent}</svg>
                      {label}
                      <svg style={{ marginLeft: "auto", opacity: 0.35 }} width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share — standout box */}
            <div style={{
              background: "linear-gradient(135deg, #0f0f10 0%, #1e1210 100%)",
              border: "1.5px solid rgba(255,107,53,0.35)",
              borderRadius: 16, padding: "16px",
              boxShadow: "0 4px 20px rgba(255,107,53,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)" }}>Share</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px", lineHeight: 1.5 }}>
                Know someone who&apos;d love this tool? Share it!
              </p>
              <CopyLinkButton slug={tool.slug} />
            </div>

            {/* Latest from Blog */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fff7f4", border: "1px solid #ffe4d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>Latest from Blog</span>
                </div>
                <Link href="/blog" style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
                  View all →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {latestPosts.map((post, i) => (
                  <Link key={post.slug} href="/blog" style={{ textDecoration: "none" }}>
                    <div style={{ paddingBottom: i < latestPosts.length - 1 ? 12 : 0, borderBottom: i < latestPosts.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                            {post.title}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.4, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                            {post.excerpt}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{post.date} · {post.readTime} read</div>
                        </div>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M7 17L17 7M9 7h8v8"/></svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function SectionHeader({ icon, iconBg, iconBorder, title }: { icon: React.ReactNode; iconBg: string; iconBorder: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}
