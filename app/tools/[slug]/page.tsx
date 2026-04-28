import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import UpvoteButton from "@/app/components/UpvoteButton";
import CommentSection from "./CommentSection";

type Props = { params: Promise<{ slug: string }> };

function pricingLabel(p: string) {
  const map: Record<string, string> = { free: "Free", freemium: "Freemium", paid: "Paid", contact: "Contact for pricing" };
  return map[p] ?? p;
}

function pricingColor(p: string) {
  if (p === "free") return { bg: "#eaf6ec", color: "#15703f", border: "#cfe9d6" };
  if (p === "freemium") return { bg: "#eaf6ec", color: "#15703f", border: "#cfe9d6" };
  if (p === "paid") return { bg: "#fff3e0", color: "#b45309", border: "#f5d9a8" };
  return { bg: "var(--surface-alt)", color: "var(--ink-2)", border: "var(--border)" };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const { data: tool } = await supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, description, website_url, logo_url, pricing,
      status, upvote_count, maker_comment, demo_url, twitter_url,
      github_url, contact_email, created_at,
      tool_tags ( tags ( name ) ),
      profiles ( full_name, avatar_url, username )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!tool) notFound();

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

  const submitter = tool.profiles as any;
  const makerName = submitter?.full_name || submitter?.username || null;

  // Clearbit logo fallback
  let logoSrc: string | null = tool.logo_url;
  if (!logoSrc && tool.website_url) {
    try {
      const domain = new URL(tool.website_url).hostname.replace(/^www\./, "");
      logoSrc = `https://logo.clearbit.com/${domain}`;
    } catch { /* no-op */ }
  }

  const pc = pricingColor(tool.pricing);

  // Social + meta links
  const links: { label: string; href: string; icon: string }[] = [];
  if (tool.website_url) links.push({ label: "Website", href: tool.website_url, icon: "🌐" });
  if (tool.twitter_url) links.push({ label: "Twitter / X", href: tool.twitter_url.startsWith("http") ? tool.twitter_url : `https://twitter.com/${tool.twitter_url.replace(/^@/, "")}`, icon: "𝕏" });
  if (tool.github_url)  links.push({ label: "GitHub", href: tool.github_url, icon: "⌥" });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <div style={{ flex: 1, padding: "0 24px 80px", maxWidth: 1060, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Breadcrumb */}
        <div style={{ padding: "20px 0 28px" }}>
          <Link href="/" style={{ fontSize: 12, color: "var(--ink-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to all tools
          </Link>
        </div>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "28px 32px", marginBottom: 24,
          boxShadow: "0 1px 0 rgba(15,15,16,.03)",
        }}>
          <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            {/* Logo */}
            <div style={{
              width: 80, height: 80, borderRadius: 18, flexShrink: 0,
              border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden",
              background: logoSrc ? "var(--surface-alt)" : `hsl(${tool.name.charCodeAt(0) * 7 % 360},60%,50%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}>
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={`${tool.name} logo`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : tool.name[0].toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const, marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: 0 }}>
                  {tool.name}
                </h1>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                  background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`,
                }}>
                  {pricingLabel(tool.pricing)}
                </span>
              </div>
              <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "0 0 12px", lineHeight: 1.5 }}>
                {tool.tagline}
              </p>
              {tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {tags.map((t) => (
                    <span key={t} style={{
                      fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6,
                      background: "var(--surface-alt)", color: "var(--ink-2)", border: "1px solid var(--border)",
                    }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA group */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <UpvoteButton
                toolId={tool.id}
                userId={user?.id ?? null}
                initialCount={tool.upvote_count}
                initialActive={isUpvoted}
                size="md"
              />
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "10px 20px", borderRadius: 10,
                    background: "#FF6B35", color: "#fff",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(255,107,53,0.25)",
                  }}
                >
                  Visit website
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ─────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* About */}
            {tool.description && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)", margin: "0 0 14px" }}>About</h2>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
                  {tool.description}
                </p>
              </div>
            )}

            {/* Demo video */}
            {tool.demo_url && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)", margin: "0 0 14px" }}>Demo</h2>
                <a
                  href={tool.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 10,
                    background: "var(--surface-alt)", border: "1px solid var(--border)",
                    textDecoration: "none", color: "var(--ink)",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, background: "#FF6B35",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Watch demo video</div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>{tool.demo_url}</div>
                  </div>
                  <svg style={{ marginLeft: "auto" }} width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </a>
              </div>
            )}

            {/* Founder's note */}
            {tool.maker_comment && (
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "24px 28px",
                borderLeft: "3px solid #FF6B35",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>
                    Founder&apos;s note
                    {makerName && <span style={{ fontWeight: 500, color: "var(--ink-muted)", marginLeft: 6 }}>from {makerName}</span>}
                  </h2>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
                  &ldquo;{tool.maker_comment}&rdquo;
                </p>
              </div>
            )}

            {/* Comments */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
              <CommentSection toolId={tool.id} userId={user?.id ?? null} />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Info card */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--ink-muted)", margin: "0 0 14px" }}>
                Product info
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row label="Pricing" value={pricingLabel(tool.pricing)} />
                {tags.length > 0 && <Row label="Category" value={tags[0]} />}
                {tool.created_at && (
                  <Row label="Listed" value={new Date(tool.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>Upvotes</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width={11} height={11} viewBox="0 0 12 12" fill="#FF6B35"><path d="M6 2L10 8H2L6 2Z"/></svg>
                    {tool.upvote_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            {links.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--ink-muted)", margin: "0 0 14px" }}>
                  Links
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 9,
                        border: "1px solid var(--border)", background: "var(--surface-alt)",
                        textDecoration: "none", color: "var(--ink)",
                        fontSize: 12, fontWeight: 600,
                        transition: "border-color 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{icon}</span>
                      <span>{label}</span>
                      <svg style={{ marginLeft: "auto", opacity: 0.4 }} width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "var(--ink-muted)", margin: "0 0 14px" }}>
                Share
              </h3>
              <ShareButtons name={tool.name} slug={tool.slug} />
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── small helpers ──────────────────────────────────────────────────────── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function ShareButtons({ name, slug }: { name: string; slug: string }) {
  const url = `https://nextbigtool.vercel.app/tools/${slug}`;
  const text = encodeURIComponent(`Check out ${name} on NextBigTool`);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 9,
          border: "1px solid var(--border)", background: "var(--surface-alt)",
          textDecoration: "none", color: "var(--ink)",
          fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 14 }}>𝕏</span> Share on X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 9,
          border: "1px solid var(--border)", background: "var(--surface-alt)",
          textDecoration: "none", color: "var(--ink)",
          fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 14 }}>in</span> Share on LinkedIn
      </a>
    </div>
  );
}
