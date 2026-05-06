import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import AuthTriggerButton from "@/app/components/AuthTriggerButton";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "Listing Rules & Guidelines | NextBigTool",
  description: "Understand the rules for listing your product on NextBigTool. Keep our directory fair, curated, and useful for every buyer.",
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

export default async function RulesPage() {
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
        background: "linear-gradient(135deg, #0f0f10 0%, #101520 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(59,127,255,0.10) 0%, transparent 70%)",
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
              background: "rgba(59,127,255,0.15)", color: "#3B7FFF",
              border: "1px solid rgba(59,127,255,0.3)", marginBottom: 14,
            }}>
              Rules &amp; Guidelines
            </span>
            <h1 style={{
              fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em",
              color: "#fff", margin: "0 0 10px", lineHeight: 1.1,
            }}>
              How Next Big Tool Works
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
              A complete guide for founders and users. Read this before you launch or engage.
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
                  <Link href="/discover/hall-of-fame" style={{ fontSize: 10, fontWeight: 700, color: "#ff6a3d", textDecoration: "none" }}>View all →</Link>
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

            {/* Intro */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.8, margin: "0 0 14px", fontWeight: 500 }}>
                This page is the complete guide to Next Big Tool. Whether you are a founder preparing to submit your product or a user who wants to discover and engage with new tools, read this before you get started.
              </p>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0 }}>
                These rules keep the platform honest, fair, and worth coming back to.
              </p>
            </div>

            {/* Part 1: For Founders */}
            <PartHeader number="Part 1" title="For Founders" color="#FF6B35" />

            <RuleSection title="Who can submit a product?">
              Anyone can submit a product to Next Big Tool, provided they are the founder, owner, or an authorised representative of that product. You must have a legitimate connection to what you are submitting. Submitting a product you do not own or represent is a permanent ban offence.
            </RuleSection>

            <RuleSection title="What kinds of products can be listed?">
              Next Big Tool accepts software products, SaaS tools, apps, browser extensions, developer tools, AI tools, and digital products broadly. We do not accept physical products, services businesses, agencies, or anything that is not a discrete product a user can sign up for or purchase. If you are unsure whether your product qualifies, email{" "}
              <a href="mailto:founders@nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>contact@nextbigtool.com</a>{" "}
              before submitting.
            </RuleSection>

            <RuleSection title="What does the submission process look like?">
              When you submit a product, it enters a Pending Review state. We review every submission manually before it goes live. You will be asked to provide your product URL, name, tagline, description, category, pricing model, logo, and up to five screenshots. You must tick a checkbox confirming you are the legitimate founder or representative of the product. Reviews typically happen within 24 hours. You will receive an email when your product is approved or if it has been rejected with a reason.
            </RuleSection>

            <RuleSection title="What gets a submission rejected?">
              Common rejection reasons include a product URL that is a coming soon page or dead link, a description that does not match what the product actually does, an obvious duplicate of an existing listing, missing required fields, and anything that appears spammy, misleading, or not a genuine product. If your submission is rejected, you will receive a specific reason and an invitation to resubmit once the issue is resolved.
            </RuleSection>

            <RuleSection title="Can I edit my listing after it goes live?">
              Yes. You can update your product name, description, tagline, logo, screenshots, and category from your dashboard at any time. Changes do not require re-review unless we determine the product has fundamentally changed in nature.
            </RuleSection>

            <RuleSection title="How does the upvote system work?">
              Upvotes are the primary signal of a product's popularity on Next Big Tool. Any registered user can upvote a product. Upvotes are public in count but the identities of upvoters are visible only to Core plan founders through the Founder CRM. You cannot upvote your own product. You cannot use multiple accounts to upvote your own product. Any attempt to manipulate the upvote count through bots, fake accounts, or vote-exchange schemes will result in account suspension and removal of the listing.
            </RuleSection>

            <RuleSection title="What is the Build in Public wall?">
              The Build in Public wall is your product's living timeline. You can post updates, ship announcements, milestone posts, MRR updates, changelog notes, and anything else that shows the journey of building your product. Free plan founders get 5 posts. Core plan founders get unlimited posts. These updates appear on your product page and surface in the global Activity Feed on the homepage, giving you ongoing visibility beyond your initial launch.
            </RuleSection>

            <RuleSection title="What is the Hall of Fame?">
              The Hall of Fame is a curated section of Next Big Tool that showcases the platform's standout products. Inclusion is not guaranteed and is based on a combination of community engagement, product quality, and editorial judgement. Core plan founders are eligible for consideration. Free plan founders are not. If you are eligible and your product has strong traction on the platform, we will reach out.
            </RuleSection>

            <RuleSection title="What is the re-launch option?">
              If your product has shipped a major update, pivoted, or significantly improved since your original listing, you can re-launch. A re-launch puts your product back in the new listings feed and treats it as a fresh submission for visibility purposes. Re-launching is available to Core plan founders.
            </RuleSection>

            <RuleSection title="How does the Founder CRM work?">
              When a user upvotes or follows your product, their profile information (name, email, company, and designation) is added to your Founder CRM dashboard, available to Core plan subscribers. You can send each user one follow-up message. This message must be relevant to your product. It must not be spam. It must not be an unsolicited promotion for an unrelated product or service. Misuse of the Founder CRM messaging feature will result in immediate account suspension.
            </RuleSection>

            <RuleSection title="How does the Press Release work?">
              Core plan founders receive one press release written specifically about their product. To get started, you will be asked to fill in a brief about your product, your story, and your key value proposition. Our team writes the press release based on your brief, sends it to you for approval, and publishes and distributes it once you sign off. The press release must be factually accurate. We will not publish press releases containing false or misleading claims.
            </RuleSection>

            {/* Part 2: For Users */}
            <PartHeader number="Part 2" title="For Users and Buyers" color="#3B7FFF" />

            <RuleSection title="Who is Next Big Tool for?">
              Next Big Tool is for anyone who wants to discover new software tools, apps, and products before they go mainstream. This includes operators looking for tools to add to their stack, founders scouting for tools their team needs, investors looking for interesting early-stage products, and curious people who simply love finding new things.
            </RuleSection>

            <RuleSection title="Do I need an account to browse?">
              No. The product discovery feed, categories, and individual product pages are all publicly accessible without an account. You need an account to upvote, follow, or comment on products.
            </RuleSection>

            <RuleSection title="What does upvoting a product mean?">
              Upvoting a product signals that you find it interesting, useful, or worth sharing. It contributes to the product's visibility on the platform. When you upvote a product, you also consent to sharing your basic profile information (name, email, company, designation) with the founder of that product if they are on the Core plan. This is how the Founder CRM works. You can withdraw this consent at any time from your account settings, which will remove your information from any founder's CRM.
            </RuleSection>

            <RuleSection title="What does following a product mean?">
              Following a product means you will receive email notifications when the founder posts a new Build in Public update, ships a major milestone, or re-launches. You can manage your followed products and notification preferences from your account settings.
            </RuleSection>

            <RuleSection title="Can I comment on products?">
              Yes. Registered users can leave comments on any product page. Comments are public. Be respectful, constructive, and relevant. Comments that are abusive, spammy, or off-topic will be removed and the account may be suspended.
            </RuleSection>

            <RuleSection title="How are products ranked?">
              Products in the Trending feed are ranked by upvote count and engagement within a given time period. The New Today feed shows recently listed products in chronological order. The Top All Time feed ranks products by their all-time upvote total. The Hall of Fame is curated by the Next Big Tool team and is not algorithmically ranked.
            </RuleSection>

            <RuleSection title="Can I report a product?">
              If you believe a product listing is fraudulent, misleading, or violates our rules, use the Report button on the product page or email{" "}
              <a href="mailto:support@nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>contact@nextbigtool.com</a>{" "}
              with details. We review every report and take action where needed.
            </RuleSection>

            {/* Part 3: Community Standards */}
            <PartHeader number="Part 3" title="Community Standards" color="#00B87A" />

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px" }}>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 20px" }}>
                Next Big Tool is a community built on trust. The following behaviours will result in account suspension or permanent banning:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  "Creating multiple accounts to manipulate upvotes or rankings.",
                  "Submitting products you do not own or represent.",
                  "Misusing the Founder CRM messaging feature to send spam or unsolicited promotions.",
                  "Leaving fake, paid, or coordinated reviews or comments.",
                  "Harassing, threatening, or abusing other users in any way.",
                  "Scraping the platform without permission.",
                  "Attempting to reverse-engineer or exploit the platform's systems.",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,107,53,0.10)", border: "1px solid rgba(255,107,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0, padding: "16px 18px", background: "var(--surface-dim)", borderRadius: 10, border: "1px solid var(--border)" }}>
                We reserve the right to remove any content, suspend any account, or reject any submission that we believe harms the quality or integrity of the platform, even if it does not explicitly violate a stated rule. We will always provide a reason when we take action against an account.
              </p>
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
                  { label: "FAQs", href: "/faq" },
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

function PartHeader({ number, title, color }: { number: string; title: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 20px", borderRadius: 12,
      background: `${color}0d`, border: `1px solid ${color}30`,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const,
        padding: "3px 10px", borderRadius: 20,
        background: `${color}20`, color,
        border: `1px solid ${color}40`,
      }}>{number}</span>
      <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>{title}</h2>
    </div>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 28px" }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.35 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: 0 }}>{children}</p>
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
