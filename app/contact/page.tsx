import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import AuthTriggerButton from "@/app/components/AuthTriggerButton";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "Contact NextBigTool – Get in Touch",
  description: "Have a question or want to list your product? Reach out to the NextBigTool team. We're here to help founders and buyers.",
};

type HofTool = {
  id: string; name: string; tagline: string;
  logo_url: string | null; slug: string; website_url: string | null;
};
type FeaturedTool = {
  id: string; name: string; tagline: string;
  logo_url: string | null; slug: string; website_url: string | null;
};

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

const CONTACT_CATEGORIES = [
  {
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    iconBg: "#fff7f4", iconBorder: "#ffe4d9",
    label: "For founders",
    body: "If you have submitted a product and have a question about its status, your plan, or your dashboard, reach out and include your registered email and product name so we can look things up quickly.",
    email: "contact@nextbigtool.com",
    emailLabel: "contact@nextbigtool.com",
  },
  {
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3B7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
    iconBg: "#eff6ff", iconBorder: "#bfdbfe",
    label: "For support",
    body: "If something is not working as expected on the platform, describe what you are seeing, what you expected to see, and your browser or device if relevant.",
    email: "contact@nextbigtool.com",
    emailLabel: "contact@nextbigtool.com",
  },
  {
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    iconBg: "#f5f3ff", iconBorder: "#ddd6fe",
    label: "For press and media",
    body: "If you are writing about the indie founder ecosystem, product discovery, or the build-in-public movement and want to talk to us, reach out.",
    email: "soham@nextbigtool.com",
    emailLabel: "soham@nextbigtool.com",
  },
  {
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    iconBg: "#f0fdf4", iconBorder: "#bbf7d0",
    label: "For partnerships and sponsorships",
    body: "If you want to reach our community of indie founders and early adopters through a newsletter placement, sponsored listing, or other partnership, reach out.",
    email: "soham@nextbigtool.com",
    emailLabel: "soham@nextbigtool.com",
  },
];

export default async function ContactPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Hall of Fame top 3
  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select("inducted_at, tools(id, name, tagline, logo_url, slug, website_url)")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false })
    .limit(3);

  const hofTools: HofTool[] = (hofRows ?? []).map((r: any) => ({
    ...(r.tools as HofTool),
    inducted_at: r.inducted_at,
  }));

  // Featured tools
  const hofIds = new Set(hofTools.map((t) => t.id));
  const { data: featuredRows } = await supabase
    .from("tools")
    .select("id, name, tagline, logo_url, slug, website_url")
    .eq("status", "approved")
    .order("upvote_count", { ascending: false })
    .limit(20);

  const featuredTools: FeaturedTool[] = (featuredRows ?? [])
    .filter((t: any) => !hofIds.has(t.id))
    .slice(0, 5) as FeaturedTool[];

  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── PAGE HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f10 0%, #111318 50%, #0f0f1a 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 80% at 70% 50%, rgba(59,127,255,0.09) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35,
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
              Back to home
            </Link>
          </div>
          <div style={{ padding: "28px 0 36px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "4px 12px", borderRadius: 20, marginBottom: 14,
              background: "rgba(59,127,255,0.15)", color: "#3B7FFF",
              border: "1px solid rgba(59,127,255,0.3)",
            }}>
              Contact us
            </span>
            <h1 style={{
              fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em",
              color: "#fff", margin: "0 0 10px", lineHeight: 1.1,
            }}>
              Get in Touch
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
              We are a small team and we read every message. Whatever you need, send it our way.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "28px 24px 80px", boxSizing: "border-box" as const }}>
        <div className="tool-page-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>

          {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
          <div className="tool-page-left-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Hall of Fame */}
            <div style={{ background: "var(--surface)", border: "1.5px solid rgba(255,215,0,0.4)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ height: 3, background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>Hall of Fame</span>
                  </div>
                  <Link href="/discover?tab=hall-of-fame" style={{ fontSize: 10, fontWeight: 700, color: "#ff6a3d", textDecoration: "none" }}>View all →</Link>
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
                              {lSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={lSrc} alt={t.name} style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
                              ) : t.name[0]}
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
                            {lSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={lSrc} alt={t.name} style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
                            ) : t.name[0]}
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

            {/* Intro card */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.8, margin: 0, fontWeight: 500 }}>
                We are a small team and we read every message. Whether you have a question about your listing,
                a problem with your account, an idea for the platform, or a partnership you want to explore,
                send it our way.
              </p>
            </div>

            {/* Contact categories */}
            {CONTACT_CATEGORIES.map((cat) => (
              <div key={cat.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: cat.iconBg, border: `1px solid ${cat.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{cat.label}</h2>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, margin: "0 0 14px" }}>
                  {cat.body}
                </p>
                <a
                  href={`mailto:${cat.email}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 9,
                    border: "1px solid var(--border)", background: "var(--surface-dim)",
                    fontSize: 12, fontWeight: 700, color: "var(--ink)", textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {cat.emailLabel}
                </a>
              </div>
            ))}

            {/* Everything else */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>For everything else</h2>
              </div>
              <a
                href="mailto:contact@nextbigtool.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 9,
                  border: "1px solid var(--border)", background: "var(--surface-dim)",
                  fontSize: 12, fontWeight: 700, color: "var(--ink)", textDecoration: "none",
                }}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                contact@nextbigtool.com
              </a>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", margin: "14px 0 0", lineHeight: 1.6 }}>
                We aim to respond within 24 to 48 hours on business days.
              </p>
            </div>

            {/* CTA box */}
            <CtaBox />
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="tool-page-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Add Your Tool */}
            <AddYourToolBox />

            {/* Response time */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>Response Time</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "General enquiries", time: "24–48 hrs" },
                  { label: "Account support", time: "24 hrs" },
                  { label: "Press enquiries", time: "48 hrs" },
                ].map(({ label, time }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 11, color: "var(--ink)", fontWeight: 700, background: "var(--surface-alt)", padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>{time}</span>
                  </div>
                ))}
              </div>
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
                <Link href="/blog" style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>View all →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {latestPosts.map((post, i) => (
                  <Link key={post.slug} href="/blog" style={{ textDecoration: "none" }}>
                    <div style={{ paddingBottom: i < latestPosts.length - 1 ? 12 : 0, borderBottom: i < latestPosts.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{post.title}</div>
                          <div style={{ fontSize: 10, color: "var(--ink-muted)", lineHeight: 1.4, marginBottom: 5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{post.excerpt}</div>
                          <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{post.date} · {post.readTime} read</div>
                        </div>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M7 17L17 7M9 7h8v8"/></svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>Quick Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Browse all tools", href: "/" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "About us", href: "/about" },
                  { label: "Hall of Fame", href: "/discover?tab=hall-of-fame" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface-dim)", textDecoration: "none", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                    {label}
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}><path d="M7 17L17 7M9 7h8v8"/></svg>
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

/* ── Shared sub-components ──────────────────────────────────────────────── */

function AddYourToolBox() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f0f10 0%, #1e1210 100%)",
      border: "1.5px solid rgba(255,107,53,0.35)",
      borderRadius: 16, padding: "18px 16px",
      boxShadow: "0 4px 20px rgba(255,107,53,0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Add Your Tool</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 14px", lineHeight: 1.55 }}>
        List your product on Next Big Tool and get discovered by buyers who are actively looking.
      </p>
      <AuthTriggerButton
        title="Launch your product"
        subtitle="Sign up in seconds and submit your tool to thousands of early adopters."
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "10px 0", borderRadius: 10, width: "100%",
          background: "#FF6B35", color: "#fff",
          fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        Sign up &amp; submit
      </AuthTriggerButton>
    </div>
  );
}

function CtaBox() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f0f10 0%, #1a1012 50%, #0f1318 100%)",
      border: "1.5px solid rgba(255,107,53,0.3)",
      borderRadius: 20, padding: "36px 32px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 8px 40px rgba(255,107,53,0.12)",
      textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,107,53,0.15) 0%, transparent 65%)" }} />
      <div style={{ position: "relative" }}>
        <span style={{
          display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, marginBottom: 14,
          background: "rgba(255,107,53,0.15)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.3)",
        }}>Get started free</span>
        <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 10px", lineHeight: 1.15 }}>
          Ready to Ship Your Tool?
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Join hundreds of indie founders who have already launched on Next Big Tool and started building their audience.
        </p>
        <AuthTriggerButton
          title="Launch your product"
          subtitle="Sign up in seconds and submit your tool to thousands of early adopters."
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px",
            borderRadius: 12, background: "#FF6B35", color: "#fff",
            fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255,107,53,0.4)",
          }}
        >
          Sign up today
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </AuthTriggerButton>
      </div>
    </div>
  );
}
