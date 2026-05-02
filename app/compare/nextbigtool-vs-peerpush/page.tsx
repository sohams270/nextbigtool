import type { Metadata } from "next";
import ComparePageLayout from "@/app/components/ComparePageLayout";

export const metadata: Metadata = {
  title: "NextBigTool vs PeerPush (2026) — Which Platform Should Indie Founders Choose?",
  description: "A detailed, honest comparison of NextBigTool and PeerPush. Two product discovery platforms, two different philosophies. Find out which one is right for your launch.",
};

const TOC = [
  { id: "two-definitions",      text: "Two Different Definitions of Discovery" },
  { id: "feature-comparison",   text: "Feature Comparison at a Glance" },
  { id: "build-in-public-wall", text: "The Build-in-Public Wall" },
  { id: "founder-crm",          text: "The Founder CRM" },
  { id: "pricing",              text: "How the Pricing Models Compare" },
  { id: "wins-and-falls-short", text: "Where Each Platform Wins and Falls Short" },
  { id: "right-for-you",        text: "Which Platform Is Right for You?" },
  { id: "bottom-line",          text: "The Honest Bottom Line" },
];

const cellBase: React.CSSProperties = {
  padding: "11px 14px",
  borderBottom: "1px solid var(--border)",
  fontSize: 14,
  color: "var(--ink-2)",
  verticalAlign: "top",
  lineHeight: 1.5,
};

const thStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "var(--ink-muted)",
  background: "var(--surface-alt)",
  borderBottom: "2px solid var(--border)",
  textAlign: "left" as const,
};

const rows: [string, string, string][] = [
  ["Free product listing",          "Yes, lifetime, instant",               "Queue-based (free tier waits)"],
  ["High authority backlink",       "DR 70+ on free plan",                  "DR 73 on paid plans only"],
  ["Sustained feed",                "Yes, no daily reset",                  "Partial"],
  ["Build-in-Public feed",          "NextBigTool only",                     "Not available"],
  ["Founder CRM",                   "Core plan",                            "Not available"],
  ["Message interested users",      "Core plan (1x per user)",              "Not available"],
  ["Hall of Fame placement",        "Core plan",                            "Yes"],
  ["Press Release written for you", "Core plan",                            "Not available"],
  ["Newsletter included",           "14k+ subscribers",                     "Newsletter available"],
  ["Unlimited product listings",    "Core plan",                            "Yes (pay per product)"],
  ["AI / MCP integration",          "Not yet",                              "MCP + API + AI Agents"],
  ["Product rating system",         "No",                                   "Yes"],
  ["Discount / deal listings",      "No",                                   "Yes"],
  ["CSV data export",               "Core plan",                            "No"],
  ["Money-back guarantee",          "7-day on Core",                        "No"],
];

const nbtPositive = new Set([
  "Yes, lifetime, instant", "DR 70+ on free plan", "Yes, no daily reset",
  "NextBigTool only", "Core plan", "Core plan (1x per user)",
  "14k+ subscribers", "7-day on Core",
]);

export default function PeerPushComparePage() {
  return (
    <ComparePageLayout
      competitor="PeerPush"
      headline="NextBigTool vs PeerPush"
      subtitle="Two product discovery platforms, two different philosophies. An honest, side-by-side breakdown to help you decide where your indie product belongs."
      tocItems={TOC}
    >
      <p>
        If you are an indie founder deciding where to list your product, NextBigTool and PeerPush will both come up in your research. They look similar on the surface: both are product directories with upvoting, both have communities, both offer paid plans for more visibility. But spend a little time with each, and you will find they are solving different problems.
      </p>
      <p>
        PeerPush is built around getting your product found fast, by people and increasingly by AI agents and search engines. It is a high-traffic directory with strong SEO authority (DR 73) and a paid promotion model that puts your product in front of a large audience quickly.
      </p>
      <p>
        NextBigTool is built around what happens after your product gets found. It is a platform for indie founders who want sustained visibility, the ability to build in public, and the ability to know who showed up and actually reach them. The difference is between a megaphone and a sales pipeline.
      </p>

      {/* Section 1 */}
      <h2 id="two-definitions">Two Different Definitions of Discovery</h2>

      <h3>NextBigTool: The Long Game Platform</h3>
      <p>
        Built for indie founders who want sustained discovery, build-in-public visibility, and direct access to people genuinely interested in their product. List your product once, stay visible forever.
      </p>

      <h3>PeerPush: The High-Traffic Directory</h3>
      <p>
        A fast-moving discovery platform with 340k+ monthly visitors, strong SEO authority, and a promotion model designed to give your product immediate and wide exposure.
      </p>

      {/* Section 2 */}
      <h2 id="feature-comparison">Feature Comparison at a Glance</h2>
      <p>Here is everything that matters, side by side.</p>

      <div style={{ overflowX: "auto", margin: "0 0 28px", borderRadius: 10, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={thStyle}>Feature</th>
              <th style={{ ...thStyle, color: "#FF6B35" }}>NextBigTool</th>
              <th style={thStyle}>PeerPush</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([feature, nbt, peer], i) => {
              const isNbtGood = nbtPositive.has(nbt);
              return (
                <tr key={i} style={{ background: i % 2 === 1 ? "var(--surface-alt)" : "transparent" }}>
                  <td style={{ ...cellBase, fontWeight: 600, color: "var(--ink)" }}>{feature}</td>
                  <td style={{ ...cellBase, color: isNbtGood ? "#00B875" : "var(--ink-muted)", fontWeight: isNbtGood ? 600 : 400 }}>
                    {isNbtGood ? "✓ " : ""}{nbt}
                  </td>
                  <td style={cellBase}>{peer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3 */}
      <h2 id="build-in-public-wall">The Build-in-Public Wall: NextBigTool's Biggest Moat</h2>
      <p>
        Every product listed on NextBigTool gets a living timeline. Founders post milestones, MRR updates, changelogs, funding news, and product launches directly on their product page. These updates surface on a global Build-in-Public Wall on the homepage, filtered by Milestones, Updates, Funding, and Launches.
      </p>
      <p>
        This is not a social feed bolted on as an afterthought. It is the core reason NextBigTool listings stay alive long after the initial submit. When a founder posts an update, followers get notified. That creates a compounding loop: the more you ship and share, the more visible you become.
      </p>
      <p>
        Directories are static. A build-in-public feed makes your listing dynamic. PeerPush has no equivalent feature.
      </p>
      <p>
        PeerPush has community engagement mechanics including upvotes, comments, and PeerPush points, and those are valuable. But once your promoted window ends, there is no native mechanism to keep your product visible through ongoing updates.
      </p>

      {/* Section 4 */}
      <h2 id="founder-crm">The Founder CRM: Turning Upvotes Into Pipeline</h2>
      <p>
        On almost every product discovery platform, when someone upvotes or follows your product, that signal disappears. You know your upvote count went up. You do not know who that person is, what they do, or whether they were a potential customer, a journalist, or just someone browsing.
      </p>
      <p>
        NextBigTool's Core plan changes that. Founders get a dashboard showing everyone who upvoted or interacted with their product, including name, email, company name, and designation. Users opt into this at the point of engagement, so the data is consent-based and clean. Founders can then send each interested user a single follow-up message.
      </p>
      <p>
        A thousand upvotes is a vanity metric. Knowing that 47 of those upvotes came from CTOs at mid-size SaaS companies is a pipeline.
      </p>
      <p>
        PeerPush shows you aggregate engagement metrics. It does not give you the identity of who engaged. If you want to convert interest into conversations, NextBigTool's Core plan is the only platform in this space that makes that possible.
      </p>

      {/* Section 5 */}
      <h2 id="pricing">How the Pricing Models Compare</h2>
      <p>
        The two platforms have fundamentally different pricing philosophies. NextBigTool is subscription-based with a genuinely free tier: instant listing, no queue. PeerPush is one-time payment per product, with the free tier meaning you wait in line behind paid users.
      </p>

      <h3>NextBigTool Pricing</h3>
      <ul>
        <li><strong>Free: $0 forever.</strong> No credit card. Instant listing. Includes 1 product, lifetime listing, DR 70+ backlink, 5 Build-in-Public posts, and basic analytics.</li>
        <li><strong>Core: $49/month</strong> (or $29/month billed yearly, saving $240/year). Includes unlimited listings, Founder CRM with full contact data, 1x message per interested user, Hall of Fame placement, 1 press release written and distributed, unlimited Build-in-Public posts, CSV export, and a 7-day money-back guarantee.</li>
      </ul>

      <h3>PeerPush Pricing</h3>
      <ul>
        <li><strong>Free: $0.</strong> You wait in queue behind paid users. No backlink on free.</li>
        <li><strong>Launch Now: $35 one-time.</strong> Skip the queue, instant approval, DR 73 backlink, auto-generated product video.</li>
        <li><strong>7-day Promoted: $89 one-time.</strong> Around 20,000 estimated impressions with featured placement for 7 days.</li>
        <li><strong>30-day Promoted: $189 one-time.</strong> Around 100,000 estimated impressions with featured placement for 30 days.</li>
      </ul>

      <p>
        For founders with multiple products or those playing the long game, NextBigTool's subscription model is more economical. For a one-time launch blast, PeerPush's one-time fee is lower friction.
      </p>

      {/* Section 6 */}
      <h2 id="wins-and-falls-short">Where Each Platform Wins and Falls Short</h2>

      <h3>NextBigTool: Strengths</h3>
      <ul>
        <li>Free tier is genuinely free: instant listing, no queue</li>
        <li>Build-in-Public feed keeps products visible long-term</li>
        <li>Founder CRM is unique: no other directory offers full contact data of who engaged</li>
        <li>Press release included with Core with real distribution value</li>
        <li>High-authority backlink on the free plan</li>
        <li>7-day money-back guarantee on Core</li>
        <li>Unlimited products on Core subscription</li>
      </ul>

      <h3>NextBigTool: Limitations</h3>
      <ul>
        <li>Earlier-stage platform with a smaller existing audience than PeerPush</li>
        <li>No AI / MCP integration yet</li>
        <li>No product rating system</li>
      </ul>

      <h3>PeerPush: Strengths</h3>
      <ul>
        <li>340k+ monthly visitors and a larger existing traffic base</li>
        <li>DR 73 backlink with strong SEO authority</li>
        <li>MCP server, API, and AI agent integration</li>
        <li>Auto-generated product video included on paid plans</li>
        <li>One-time fee model with no recurring commitment</li>
        <li>Product rating system</li>
        <li>Discount and deal listings supported</li>
      </ul>

      <h3>PeerPush: Limitations</h3>
      <ul>
        <li>Free tier means waiting in a queue behind paid users</li>
        <li>No Founder CRM: interest signals are invisible to founders</li>
        <li>No Build-in-Public feed, so visibility fades when the promoted window ends</li>
        <li>No money-back guarantee</li>
      </ul>

      {/* Section 7 */}
      <h2 id="right-for-you">Which Platform Is Right for You?</h2>
      <p>Neither platform is objectively better. They serve different goals. Here is a practical guide.</p>

      <h3>Choose NextBigTool if...</h3>
      <ul>
        <li>You want your listing to stay active and visible long after launch day</li>
        <li>You build in public and want a platform that rewards that behavior</li>
        <li>You care about knowing who showed interest in your product</li>
        <li>You want to turn discovery signals into actual conversations</li>
        <li>You have multiple products and want one subscription that covers all of them</li>
        <li>You want a press release written and distributed as part of your launch</li>
        <li>You value a platform built specifically for indie founders and SaaS builders</li>
      </ul>

      <h3>Choose PeerPush if...</h3>
      <ul>
        <li>You want maximum immediate exposure on launch day</li>
        <li>You prefer a one-time payment with no recurring commitment</li>
        <li>AI discoverability and MCP integration matter for your product</li>
        <li>You want a product video generated automatically</li>
        <li>You are testing the waters with a single promoted launch</li>
        <li>Your product benefits from deal or discount visibility</li>
      </ul>

      {/* Section 8 */}
      <h2 id="bottom-line">The Honest Bottom Line</h2>
      <p>
        PeerPush is a solid platform with real traffic, strong SEO authority, and a fast path to visibility. If you want to get your product in front of a large audience quickly and you are comfortable with a one-time fee per launch, it delivers on that promise.
      </p>
      <p>
        But if you are an indie founder playing the long game, building in public, iterating in the open, and genuinely trying to turn discovery into traction, NextBigTool is built for that. The Build-in-Public wall keeps your product alive after the launch. The Founder CRM turns interest signals into something you can actually act on. And the free tier gives you a real listing with a real backlink, with no queue and no credit card.
      </p>
      <p>
        The two platforms are not mutually exclusive. Many founders will launch on both. But if you are choosing where to build your launch home, NextBigTool is the platform built for what comes after day one.
      </p>

      {/* CTA */}
      <div style={{
        marginTop: 40, padding: "28px 32px", borderRadius: 16,
        background: "linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(255,107,53,0.03) 100%)",
        border: "1px solid rgba(255,107,53,0.2)", textAlign: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 8, letterSpacing: "-0.02em" }}>
          Submit your tool free at NextBigTool
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
          No credit card. No queue. Instant listing with a DR 70+ backlink.
        </p>
        <a
          href="/dashboard/products"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 10,
            background: "#FF6B35", color: "#fff",
            textDecoration: "none", fontSize: 14, fontWeight: 700,
          }}
        >
          List Your Tool Free
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

    </ComparePageLayout>
  );
}
