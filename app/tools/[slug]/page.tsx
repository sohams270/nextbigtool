import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import UpvoteButton from "@/app/components/UpvoteButton";
import CommentSection from "./CommentSection";
import CopyLinkButton from "./CopyLinkButton";

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
      .from("upvotes")
      .select("tool_id")
      .eq("tool_id", tool.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isUpvoted = !!vote;
  }

  const tags = ((tool.tool_tags ?? []) as any[])
    .map((tt: any) => tt.tags?.name)
    .filter(Boolean) as string[];

  const categoryName = (tool.categories as any)?.name ?? null;

  // Screenshots: from the JSON array stored on the tool row
  const shots: string[] = Array.isArray(tool.screenshots)
    ? (tool.screenshots as string[]).filter(Boolean)
    : [];

  // Logo
  let logoSrc: string | null = tool.logo_url;
  if (!logoSrc && tool.website_url) {
    try {
      const domain = new URL(tool.website_url).hostname.replace(/^www\./, "");
      logoSrc = `https://logo.clearbit.com/${domain}`;
    } catch { /* no-op */ }
  }

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

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f6f6f4" }}>
      <TopNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f10 0%, #1a1012 50%, #0f1318 100%)",
        position: "relative",
        overflow: "hidden",
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

        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>
          {/* Back link */}
          <div style={{ paddingTop: 24 }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "rgba(255,255,255,0.45)", textDecoration: "none", fontWeight: 500,
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Back to all tools
            </Link>
          </div>

          {/* Hero content */}
          <div style={{ padding: "32px 0 40px", display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            {/* Logo */}
            <div style={{
              width: 96, height: 96, borderRadius: 22, flexShrink: 0,
              border: "1.5px solid rgba(255,255,255,0.1)",
              overflow: "hidden", background: logoSrc ? "#fff" : `hsl(${tool.name.charCodeAt(0) * 7 % 360},60%,50%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, fontWeight: 800, color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
              position: "relative",
            }}>
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={`${tool.name} logo`} style={{
                  position: "absolute", top: "-15%", left: "-15%",
                  width: "130%", height: "130%", objectFit: "cover",
                }} />
              ) : tool.name[0].toUpperCase()}
            </div>

            {/* Name + tagline + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 10 }}>
                {categoryName && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}>
                    {categoryName}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, ...pb }}>
                  {pricingLabel(tool.pricing)}
                </span>
                {tags.slice(0, 3).map((t) => (
                  <span key={t} style={{
                    fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>{t}</span>
                ))}
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", margin: "0 0 10px", lineHeight: 1.1 }}>
                {tool.name}
              </h1>
              {tool.tagline && (
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.55, maxWidth: 560 }}>
                  {tool.tagline}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignItems: "flex-end" }}>
              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 22px", borderRadius: 11,
                  background: "#FF6B35", color: "#fff",
                  fontSize: 13, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
                  whiteSpace: "nowrap" as const,
                }}>
                  Visit website
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </a>
              )}
              <UpvoteButton
                toolId={tool.id}
                userId={user?.id ?? null}
                initialCount={tool.upvote_count}
                initialActive={isUpvoted}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1060, margin: "0 auto", width: "100%", padding: "28px 24px 80px", boxSizing: "border-box" as const }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* ── LEFT ──────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* About */}
            {tool.description && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "26px 28px" }}>
                <SectionHeader icon={
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                } iconBg="#fff7f4" iconBorder="#ffe4d9" title="About" />
                <p style={{ fontSize: 14.5, color: "#3a3a45", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>
                  {tool.description}
                </p>
              </div>
            )}

            {/* Classification */}
            {(categoryName || tags.length > 0) && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "26px 28px" }}>
                <SectionHeader icon={
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                } iconBg="#f5f3ff" iconBorder="#ddd6fe" title="Classification" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {categoryName && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Category</div>
                      <span style={{
                        display: "inline-block", fontSize: 12, fontWeight: 600,
                        padding: "5px 14px", borderRadius: 20,
                        background: "#f0f0fe", color: "#4f46e5",
                        border: "1px solid #c7d2fe",
                      }}>
                        {categoryName}
                      </span>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Use Cases</div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7 }}>
                        {tags.map(t => (
                          <span key={t} style={{
                            fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 20,
                            background: "#f5f5f3", color: "#3a3a45", border: "1px solid #e8e8e6",
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Screenshots */}
            {shots.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "26px 28px" }}>
                <SectionHeader icon={
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                } iconBg="#f0f9ff" iconBorder="#bae6fd" title="Product Screenshots" />
                <div style={{
                  display: "grid",
                  gridTemplateColumns: shots.length === 1 ? "1fr" : "repeat(2, 1fr)",
                  gap: 12,
                }}>
                  {shots.map((url, i) => (
                    <div key={i} style={{
                      borderRadius: 10, overflow: "hidden",
                      border: "1px solid #e8e8e6", background: "#f9f9f7",
                      gridColumn: shots.length === 1 || (shots.length === 3 && i === 0) ? "1 / -1" : undefined,
                      aspectRatio: shots.length === 1 ? "16 / 9" : "4 / 3",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Video */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "26px 28px" }}>
              <SectionHeader icon={
                <svg width={13} height={13} viewBox="0 0 24 24" fill="#FF6B35"><path d="M8 5v14l11-7z"/></svg>
              } iconBg="#fff7f4" iconBorder="#ffe4d9" title="Product Video" />
              {tool.demo_url ? (
                isVideoUrl(tool.demo_url) ? (
                  <video
                    controls
                    style={{ width: "100%", borderRadius: 10, border: "1px solid #e8e8e6", background: "#000", display: "block" }}
                  >
                    <source src={tool.demo_url} />
                  </video>
                ) : (
                  <a
                    href={tool.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12,
                      background: "linear-gradient(135deg, #0f0f10 0%, #1c1c1f 100%)",
                      textDecoration: "none",
                      border: "1px solid #2a2a2f",
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 11,
                      background: "#FF6B35",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(255,107,53,0.35)",
                    }}>
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
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "16px", borderRadius: 12,
                  background: "#fafaf8", border: "1px dashed #e0e0dd",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: "#f0f0ee", border: "1px solid #e8e8e6",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
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
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "26px 28px" }}>
              <CommentSection toolId={tool.id} userId={user?.id ?? null} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Stats card */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 14 }}>
                  Product info
                </div>
              </div>
              <div>
                {/* Upvotes tile */}
                <div style={{
                  margin: "0 14px 14px",
                  padding: "12px 14px", borderRadius: 10,
                  background: "linear-gradient(135deg, #fff7f4, #fff0eb)",
                  border: "1px solid #ffd9cc",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>Upvotes</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#FF6B35", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width={13} height={13} viewBox="0 0 12 12" fill="#FF6B35"><path d="M6 2L10 8H2L6 2Z"/></svg>
                    {tool.upvote_count}
                  </span>
                </div>
                {/* Meta rows */}
                <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow label="Pricing" value={pricingLabel(tool.pricing)} />
                  {categoryName && <InfoRow label="Category" value={categoryName} />}
                  {tool.created_at && (
                    <InfoRow label="Listed" value={new Date(tool.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
                  )}
                </div>
              </div>
            </div>

            {/* Website CTA */}
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 0", borderRadius: 12,
                  background: "#FF6B35", color: "#fff",
                  fontSize: 13, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
                }}
              >
                Visit website
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
              </a>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 12 }}>
                  Links
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {socialLinks.map(({ label, href, svgPath }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 9,
                      border: "1px solid #e8e8e6", background: "#fafaf8",
                      textDecoration: "none", color: "#0f0f10",
                      fontSize: 12, fontWeight: 600,
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                        <path d={svgPath} />
                      </svg>
                      {label}
                      <svg style={{ marginLeft: "auto", opacity: 0.35 }} width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share — copy link only */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#9090a0", marginBottom: 12 }}>
                Share
              </div>
              <CopyLinkButton slug={tool.slug} />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function SectionHeader({
  icon, iconBg, iconBorder, title,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: iconBg, border: `1px solid ${iconBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
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
