import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import AuthTriggerButton from "@/app/components/AuthTriggerButton";
import FaqAccordion from "@/app/components/FaqAccordion";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Next Big Tool",
  description:
    "Got questions about Next Big Tool? Find answers about how the platform works, how to submit your product, pricing, the Founder CRM, and more.",
};

const FAQ_SECTIONS = [
  {
    section: "About the Platform",
    items: [
      {
        q: "What is Next Big Tool?",
        a: "Next Big Tool is a product discovery and launch platform where indie founders list their software products and buyers discover tools worth knowing about. It is built for founders who want visibility that lasts beyond a single launch day, and for buyers who want to find great products before they go mainstream.",
      },
      {
        q: "How is Next Big Tool different from Product Hunt?",
        a: "Product Hunt is a 24-hour daily competition. Your product gets one window of visibility and then the feed resets. Next Big Tool does not reset. Your listing stays live and keeps accumulating upvotes, followers, and engagement over time. We also offer features Product Hunt does not, including the Founder CRM, which shows founders who specifically engaged with their product, and the Build in Public wall, which gives founders a space to share ongoing updates and keep their audience engaged between launches.",
      },
      {
        q: "Can users browse without creating an account?",
        a: "Yes. The discovery feed, categories, and product pages are all publicly visible. You only need an account to upvote, follow, or comment on products.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. We use Supabase for secure data storage with encryption in transit and at rest. We do not sell your data to third parties. You can read our full Privacy Policy for details.",
      },
    ],
  },
  {
    section: "Submitting a Product",
    items: [
      {
        q: "Is it free to list my product?",
        a: "Yes. You can list one product completely free, forever. No credit card required. Free listings include a high authority backlink, basic analytics, and 5 posts on the Build in Public wall.",
      },
      {
        q: "How do I submit my product?",
        a: "Create an account, go to your dashboard, and click Submit Your Tool. Enter your product URL and the system will prompt you to fill in your product details including name, tagline, description, category, logo, and screenshots. Once submitted, your listing enters a review queue. Most submissions are reviewed within 24 hours.",
      },
      {
        q: "Who reviews my submission?",
        a: "Every submission is reviewed manually by the Next Big Tool team before going live. We check that the product is real, accessible, and accurately described. This keeps the platform high quality for buyers.",
      },
      {
        q: "How long does review take?",
        a: "We aim to review all submissions within 24 hours. If your submission requires additional information, we will email you.",
      },
      {
        q: "Why was my submission rejected?",
        a: "Common reasons include an inaccessible product URL, a description that does not match the actual product, missing required fields, or a duplicate listing. You will always receive a specific rejection reason by email, along with guidance on how to resubmit.",
      },
      {
        q: "Do I need to verify that I own the product I submit?",
        a: "You must confirm via checkbox during submission that you are the founder or an authorised representative of the product. We also manually review every submission, which serves as our primary quality check. Submitting a product you do not own is a permanent ban offence.",
      },
    ],
  },
  {
    section: "Pricing & Plans",
    items: [
      {
        q: "What do I get with the Core plan?",
        a: "The Core plan gives you the Founder CRM, Hall of Fame placement, one professionally written and distributed press release, unlimited product listings, unlimited Build in Public posts, and CSV data export. It is priced at $49/month or $29/month on the yearly plan.",
      },
      {
        q: "Can I cancel my Core subscription?",
        a: "Yes. You can cancel at any time from your dashboard. You keep access until the end of your current billing period. We also offer a 7-day money-back guarantee if you change your mind shortly after subscribing.",
      },
    ],
  },
  {
    section: "Features",
    items: [
      {
        q: "What is the Build in Public wall?",
        a: "The Build in Public wall is a timeline on your product page where you can post updates, milestones, changelogs, and progress posts. These updates also appear in the global Activity Feed on the homepage, keeping your product visible to the entire Next Big Tool community on an ongoing basis.",
      },
      {
        q: "What is the Founder CRM?",
        a: "The Founder CRM is a Core plan feature that shows you the profile data of everyone who has upvoted or engaged with your product, including their name, email address, company, and job title. You can send each person one follow-up message directly through the platform. It turns passive interest into a real opportunity for conversation.",
      },
      {
        q: "What is Hall of Fame placement?",
        a: "The Hall of Fame is a permanent, curated section of Next Big Tool that showcases standout products. Unlike the trending feed, Hall of Fame listings do not expire. Core plan founders are eligible for consideration based on community engagement and product quality.",
      },
      {
        q: "What is the Press Release feature?",
        a: "Core plan subscribers receive one professionally written press release about their product. You provide a brief, we write it, you approve it, and we publish and distribute it. It is customisable and factually grounded in your product story.",
      },
    ],
  },
  {
    section: "Discovery & Ranking",
    items: [
      {
        q: "How do products get ranked?",
        a: "Trending products are ranked by upvote count and engagement within a time window. New Today shows the most recently listed products. Top All Time ranks by total upvotes. The Hall of Fame is manually curated by our team.",
      },
      {
        q: "What does upvoting a product mean?",
        a: "Upvoting a product signals that you find it interesting, useful, or worth sharing. It contributes to the product's visibility on the platform. When you upvote a product, you also consent to sharing your basic profile information (name, email, company, designation) with the founder of that product if they are on the Core plan.",
      },
    ],
  },
  {
    section: "Contact & Support",
    items: [
      {
        q: "How do I contact the team?",
        a: "Email contact@nextbigtool.com for general enquiries. For founder support, reach out to soham@nextbigtool.com.",
      },
    ],
  },
];

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

export default async function FaqPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  const hofIds = new Set(hofTools.map(t => t.id));
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
        background: "linear-gradient(135deg, #0f0f10 0%, #121020 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.10) 0%, transparent 70%)",
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
              background: "rgba(124,58,237,0.15)", color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.3)", marginBottom: 14,
            }}>
              FAQ
            </span>
            <h1 style={{
              fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em",
              color: "#fff", margin: "0 0 10px", lineHeight: 1.1,
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
              Everything you need to know about how Next Big Tool works.
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
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.8, margin: 0, fontWeight: 500 }}>
                Got questions? Below you will find answers to the most common things founders and users ask about Next Big Tool — how it works, what you get, and how to get the most out of it.
              </p>
            </div>

            {/* FAQ Accordion (client component) */}
            <FaqAccordion sections={FAQ_SECTIONS} />

            {/* Still have questions card */}
            <div style={{
              background: "linear-gradient(135deg, #0f0f10 0%, #101520 100%)",
              border: "1px solid rgba(59,127,255,0.25)",
              borderRadius: 16, padding: "22px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              flexWrap: "wrap" as const,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Still have questions?</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  We are happy to help. Reach out to{" "}
                  <a href="mailto:hello@nextbigtool.com" style={{ color: "#3B7FFF", textDecoration: "none", fontWeight: 600 }}>contact@nextbigtool.com</a>
                </div>
              </div>
              <Link href="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "10px 18px", borderRadius: 10,
                background: "#3B7FFF", color: "#fff",
                fontSize: 12, fontWeight: 700, textDecoration: "none",
                whiteSpace: "nowrap" as const,
                boxShadow: "0 4px 14px rgba(59,127,255,0.35)",
              }}>
                Contact us
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>

            {/* CTA box */}
            <CtaBox />
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div className="tool-page-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

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
                  { label: "Rules", href: "/rules" },
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

/* ── Sub-components ─────────────────────────────────────────────────────── */

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
