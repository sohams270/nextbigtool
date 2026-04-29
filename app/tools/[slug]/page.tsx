import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import UpvoteButton from "@/app/components/UpvoteButton";
import CommentSection from "./CommentSection";
import CopyLinkButton from "./CopyLinkButton";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

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
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const { data: tool, error: toolErr } = await supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, description, website_url, logo_url, pricing,
      status, upvote_count, maker_comment, demo_url, twitter_url,
      github_url, contact_email, created_at, submitter_id, screenshots,
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

  // Social links
  type SocialLink = { label: string; href: string; svgPath: string };
  const socialLinks: SocialLink[] = [];
  if (tool.twitter_url) socialLinks.push({
    label: "Twitter / X",
    href: tool.twitter_url.startsWith("http") ? tool.twitter_url : `https://twitter.com/${tool.twitter_url.replace(/^@/, "")}`,
    svgPath: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  });
  if (tool.github_url) socialLinks.push({
    label: "GitHub",
    href: tool.github_url,
    svgPath: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
  });

  const pb = pricingBadge(tool.pricing);
  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f6f6f4" }}>
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

          <div style={{ padding: "28px 0 36px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const }}>
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
                ? <img src={logoSrc} alt={`${tool.name} logo`} style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignItems: "flex-end" }}>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN CONTENT ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "28px 24px 80px", boxSizing: "border-box" as const }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Hall of Fame */}
            <div style={{ background: "#fff", border: "1.5px solid rgba(255,215,0,0.4)", borderRadius: 16, overflow: "hidden" }}>
              {/* Gold top bar */}
              <div style={{ height: 3, background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.01em" }}>Hall of Fame</span>
                  </div>
                  <Link href="/discover?tab=hall-of-fame" style={{ fontSize: 10, fontWeight: 700, color: "#ff6a3d", textDecoration: "none" }}>
                    View all →
                  </Link>
                </div>

                {hofTools.length === 0 ? (
                  <div style={{ fontSize: 11, color: "#9090a0", textAlign: "center", padding: "10px 0" }}>No inductees yet</div>
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
                                ? <img src={lSrc} alt={t.name} style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
                                : t.name[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f0f10", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                              <div style={{ fontSize: 10, color: "#9090a0", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{t.tagline}</div>
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
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 12 }}>
                  Featured Tools
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {featuredTools.map(t => {
                    const lSrc = getLogoSrc(t.logo_url, t.website_url);
                    return (
                      <Link key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f3f3f1" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, overflow: "hidden", position: "relative", background: lSrc ? "#fff" : `hsl(${t.name.charCodeAt(0) * 7 % 360},60%,50%)`, border: "1px solid #e8e8e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                            {lSrc
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={lSrc} alt={t.name} style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
                              : t.name[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f0f10", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: "#9090a0", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{t.tagline}</div>
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
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>} iconBg="#fff7f4" iconBorder="#ffe4d9" title="About" />
                <p style={{ fontSize: 14, color: "#3a3a45", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{tool.description}</p>
              </div>
            )}

            {/* Classification */}
            {(categoryName || tags.length > 0) && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>} iconBg="#f5f3ff" iconBorder="#ddd6fe" title="Classification" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {categoryName && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 7 }}>Category</div>
                      <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 13px", borderRadius: 20, background: "#f0f0fe", color: "#4f46e5", border: "1px solid #c7d2fe" }}>
                        {categoryName}
                      </span>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 7 }}>Use Cases</div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                        {tags.map(t => (
                          <span key={t} style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "#f5f5f3", color: "#3a3a45", border: "1px solid #e8e8e6" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Screenshots */}
            {shots.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "24px 26px" }}>
                <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>} iconBg="#f0f9ff" iconBorder="#bae6fd" title="Product Screenshots" />
                <div style={{ display: "grid", gridTemplateColumns: shots.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
                  {shots.map((url, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e8e8e6", background: "#f9f9f7", gridColumn: shots.length === 1 || (shots.length === 3 && i === 0) ? "1 / -1" : undefined, aspectRatio: shots.length === 1 ? "16 / 9" : "4 / 3" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Video */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "24px 26px" }}>
              <SectionHeader icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="#FF6B35"><path d="M8 5v14l11-7z"/></svg>} iconBg="#fff7f4" iconBorder="#ffe4d9" title="Product Video" />
              {tool.demo_url ? (
                isVideoUrl(tool.demo_url) ? (
                  <video controls style={{ width: "100%", borderRadius: 10, border: "1px solid #e8e8e6", background: "#000", display: "block" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderRadius: 12, background: "#fafaf8", border: "1px dashed #e0e0dd" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "#f0f0ee", border: "1px solid #e8e8e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#c0c0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#9090a0" }}>Not updated yet</div>
                    <div style={{ fontSize: 11, color: "#b0b0b8", marginTop: 2 }}>The maker hasn&apos;t added a demo video.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "24px 26px" }}>
              <CommentSection toolId={tool.id} userId={user?.id ?? null} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Product info */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 12 }}>Product info</div>
              </div>
              <div>
                <div style={{ margin: "0 12px 12px", padding: "11px 13px", borderRadius: 10, background: "linear-gradient(135deg, #fff7f4, #fff0eb)", border: "1px solid #ffd9cc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>Upvotes</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#FF6B35", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width={13} height={13} viewBox="0 0 12 12" fill="#FF6B35"><path d="M6 2L10 8H2L6 2Z"/></svg>
                    {tool.upvote_count}
                  </span>
                </div>
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
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 10 }}>Links</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {socialLinks.map(({ label, href, svgPath }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9, border: "1px solid #e8e8e6", background: "#fafaf8", textDecoration: "none", color: "#0f0f10", fontSize: 12, fontWeight: 600 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><path d={svgPath} /></svg>
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
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fff7f4", border: "1px solid #ffe4d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.01em" }}>Latest from Blog</span>
                </div>
                <Link href="/blog" style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
                  View all →
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {latestPosts.map((post, i) => (
                  <Link key={post.slug} href="/blog" style={{ textDecoration: "none" }}>
                    <div style={{ paddingBottom: i < latestPosts.length - 1 ? 12 : 0, borderBottom: i < latestPosts.length - 1 ? "1px solid #f3f3f1" : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#0f0f10", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                            {post.title}
                          </div>
                          <div style={{ fontSize: 10, color: "#9090a0", lineHeight: 1.4, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                            {post.excerpt}
                          </div>
                          <div style={{ fontSize: 10, color: "#b0b0b8" }}>{post.date} · {post.readTime} read</div>
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
      <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", color: "#0f0f10", margin: 0 }}>{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, color: "#9090a0", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f0f10" }}>{value}</span>
    </div>
  );
}
