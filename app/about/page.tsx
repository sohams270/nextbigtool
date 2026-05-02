import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import AuthTriggerButton from "@/app/components/AuthTriggerButton";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "About NextBigTool – Built for Founders & Tool Buyers",
  description: "Learn how NextBigTool helps indie founders get lasting visibility and helps buyers find the right tools before they go mainstream.",
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

export default async function AboutPage() {
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
        background: "linear-gradient(135deg, #0f0f10 0%, #1a1012 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 30% 50%, rgba(255,107,53,0.10) 0%, transparent 70%)",
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
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              Back to home
            </Link>
          </div>
          <div style={{ padding: "28px 0 36px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(255,107,53,0.15)", color: "#FF6B35",
              border: "1px solid rgba(255,107,53,0.3)", marginBottom: 14,
            }}>
              Our Story
            </span>
            <h1 style={{
              fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em",
              color: "#fff", margin: "0 0 10px", lineHeight: 1.1,
            }}>
              Where Indie Founders Launch.<br />Where Buyers Discover.
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
              A product discovery platform built for two kinds of people — the founder who ships,
              and the buyer who wants to find it first.
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
                                <img src={lSrc} alt={t.name} style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
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
                              <img src={lSrc} alt={t.name} style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
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

            {/* Intro */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.8, margin: "0 0 16px", fontWeight: 500 }}>
                Next Big Tool is a product discovery and launch platform built for two kinds of people: the indie founder who has spent months building something worth knowing about, and the buyer or operator who wants to find that product before it goes mainstream.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 16px" }}>
                Most launch platforms were built for the moment, not for what comes after it. You get 24 hours of visibility, a spike of traffic, and then silence. The feed resets. Your product disappears. The people who showed genuine interest are invisible to you, and you have no way to reach them.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
                We built Next Big Tool to fix that.
              </p>
            </div>

            {/* What we believe */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <SectionHeader
                icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                iconBg="var(--surface-alt)" iconBorder="var(--border)" accentColor="#7c3aed"
                title="What we believe"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "The best products are built by people who care deeply about the problem they are solving, not by teams with the biggest marketing budgets.",
                  "Discovery should be earned through relevance and quality, not through gaming an algorithm on a single calendar day.",
                  "When someone shows genuine interest in what you built, you deserve to know who they are.",
                ].map((belief, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: 8 }} />
                    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, margin: 0 }}>{belief}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What we built */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <SectionHeader
                icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
                iconBg="#fff7f4" iconBorder="#ffe4d9" accentColor="#FF6B35"
                title="What we built"
              />
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 14px" }}>
                Next Big Tool is a place where indie founders can list their products and stay visible long after launch day. Founders build in public, post milestones and updates, and grow a following from within the platform. Buyers browse a curated, growing directory of tools across every category, follow the ones they find interesting, and discover what is worth knowing about before it becomes obvious.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 14px" }}>
                For founders on our Core plan, the Founder CRM turns every upvote and follow into an actionable contact. You can see who showed interest — with their name, email, company, and designation — and send a single follow-up message. It is the closest thing to a warm lead that a launch platform has ever offered.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0 }}>
                We also believe that great products deserve press. Every Core founder gets one professionally written and distributed press release about their product, because the story behind what you built matters as much as the product itself.
              </p>
            </div>

            {/* Who we are */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <SectionHeader
                icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                iconBg="#f0f9ff" iconBorder="#bae6fd" accentColor="#0ea5e9"
                title="Who we are"
              />
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 14px" }}>
                Next Big Tool was built by a small team that has spent years working in B2B SaaS, growth, and content strategy. We have sat on both sides of this problem — as founders who launched products and got little traction, and as operators who spent hours trying to find the right tool for the right job.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0 }}>
                We are not backed by venture capital. We are not optimising for scale at the expense of quality. We are building something we would have wanted ourselves.
              </p>
            </div>

            {/* Where we are going */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <SectionHeader
                icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg>}
                iconBg="#f0fdf4" iconBorder="#bbf7d0" accentColor="#00B87A"
                title="Where we are going"
              />
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 14px" }}>
                Next Big Tool is early. The community is growing, the directory is expanding, and the features are being built in real time. If you are an indie founder who ships things and wants a platform that compounds in your favour, this is for you. If you are someone who loves finding great tools before they go viral, this is for you too.
              </p>
              <a
                href="https://nextbigtool.com"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}
              >
                nextbigtool.com
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
              </a>
            </div>

            {/* CTA box */}
            <CtaBox />
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="tool-page-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Add Your Tool */}
            <AddYourToolBox />

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
                  { label: "Hall of Fame", href: "/discover?tab=hall-of-fame" },
                  { label: "Contact us", href: "/contact" },
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

function SectionHeader({ icon, iconBg, iconBorder, accentColor, title }: {
  icon: React.ReactNode; iconBg: string; iconBorder: string; accentColor: string; title: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{title}</h2>
    </div>
  );
}

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
