import type { Metadata } from "next";
import ComparePageLayout from "@/app/components/ComparePageLayout";

export const metadata: Metadata = {
  title: "NextBigTool vs SaaSHub (2026) — Which Platform Does More for Indie Founders?",
  description: "NextBigTool vs SaaSHub: both list your product, but only one lets you build in public, see who engaged, and turn discovery into real traction. Here is the honest comparison.",
};

const TOC = [
  { id: "same-start-different-destination", text: "Same Starting Point, Very Different Destinations" },
  { id: "feature-comparison",               text: "Feature Comparison at a Glance" },
  { id: "where-saashub-wins",               text: "Where SaaSHub Wins" },
  { id: "where-nbt-wins",                   text: "Where NextBigTool Wins" },
  { id: "founder-crm",                      text: "The Founder CRM" },
  { id: "pricing",                          text: "How the Costs Compare" },
  { id: "wins-and-falls-short",             text: "Where Each Platform Wins and Falls Short" },
  { id: "right-for-you",                    text: "Which Platform Is Right for You?" },
  { id: "bottom-line",                      text: "The Honest Bottom Line" },
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
  ["Free product listing",          "Yes, instant, no queue",               "Yes, moderated approval required"],
  ["High authority backlink",       "Yes, on free plan",                    "Yes, DR 78 dofollow (free)"],
  ["Build-in-Public feed",          "Yes, NextBigTool only",                "No"],
  ["Founder CRM (who engaged)",     "Yes, Core plan",                       "No"],
  ["Hall of Fame placement",        "Yes, Core plan",                       "No equivalent"],
  ["Press release written for you", "Yes, Core plan",                       "No"],
  ["Alternatives / comparison pages","Yes, comparison pages live",          "Yes, core feature"],
  ["Community upvotes and follows", "Yes",                                  "Limited community mechanics"],
  ["Follower notifications",        "Yes",                                  "No"],
  ["Featured placement pricing",    "$49/month (Core, all features)",       "$99/month (promoted only)"],
  ["Weekly newsletter inclusion",   "Core plan",                            "Random rotation (2 slots/week)"],
  ["Status page / uptime tracking", "No",                                   "Yes"],
  ["CSV data export",               "Yes, Core plan",                       "No"],
  ["Listing approval wait",         "None, instant",                        "Moderated, wait for review"],
];

const nbtPositive = new Set([
  "Yes, instant, no queue", "Yes, on free plan", "Yes, NextBigTool only",
  "Yes, Core plan", "Yes, comparison pages live", "Yes",
  "$49/month (Core, all features)", "Core plan", "None, instant",
]);

export default function SaaSHubComparePage() {
  return (
    <ComparePageLayout
      competitor="SaaSHub"
      headline="NextBigTool vs SaaSHub"
      subtitle="Both platforms will list your product. The question is what happens after that. Here is the honest breakdown of where each one takes you."
      tocItems={TOC}
    >
      <p>
        SaaSHub is one of the most respected software directories on the internet. It has been around for years, carries a DR 78 backlink, attracts 856,000 monthly page views, and has built a reputation as a credible, independent place to list and discover SaaS products. For many founders, getting listed on SaaSHub is a standard part of the launch checklist.
      </p>
      <p>
        NextBigTool is a newer platform built around a different idea. A listing should not just sit in a directory: it should grow with every update you post, surface in a community feed, build a following, and give founders visibility into exactly who is paying attention.
      </p>
      <p>
        Both platforms will list your product. The question is what happens after that. This comparison lays out the honest differences so you can decide which one fits what you are actually trying to build.
      </p>

      {/* Section 1 */}
      <h2 id="same-start-different-destination">Same Starting Point, Very Different Destinations</h2>

      <h3>SaaSHub: The Independent Software Marketplace</h3>
      <p>
        SaaSHub describes itself as an independent software marketplace. Its strongest feature for buyers is the alternatives engine: when someone searches for a category of tool or looks at a specific product, SaaSHub surfaces a curated list of alternatives. This makes it a high-intent destination for buyers who are already evaluating options in a category. The platform verifies submissions before listing them, which keeps quality high. Free listings include a dofollow backlink. Featured placement runs at $99 per month and includes homepage rotation, placement on alternatives pages, comparison pages, and two random slots per week in the SaaSHub Weekly newsletter to 18,900 plus subscribers.
      </p>

      <h3>NextBigTool: The Active Discovery Platform</h3>
      <p>
        NextBigTool is built for founders who want sustained visibility, not just a permanent listing. Every product gets a build-in-public feed where founders post milestones, updates, changelogs, and funding news. Those updates surface on a global homepage wall and notify followers. The Core plan adds a Founder CRM showing every person who upvoted or interacted with the listing, with name, email, company, and job title, plus Hall of Fame placement, unlimited listings, and a professionally written press release.
      </p>

      {/* Section 2 */}
      <h2 id="feature-comparison">Feature Comparison at a Glance</h2>
      <p>Everything that matters between the two platforms, compared directly.</p>

      <div style={{ overflowX: "auto", margin: "0 0 28px", borderRadius: 10, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={thStyle}>Feature</th>
              <th style={{ ...thStyle, color: "#FF6B35" }}>NextBigTool</th>
              <th style={thStyle}>SaaSHub</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([feature, nbt, competitor], i) => {
              const isGood = nbtPositive.has(nbt);
              return (
                <tr key={i} style={{ background: i % 2 === 1 ? "var(--surface-alt)" : "transparent" }}>
                  <td style={{ ...cellBase, fontWeight: 600, color: "var(--ink)" }}>{feature}</td>
                  <td style={{ ...cellBase, color: isGood ? "#00B875" : "var(--ink-muted)", fontWeight: isGood ? 600 : 400 }}>
                    {isGood ? "✓ " : ""}{nbt}
                  </td>
                  <td style={cellBase}>{competitor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Section 3 */}
      <h2 id="where-saashub-wins">Where SaaSHub Wins: The Alternatives Engine</h2>
      <p>
        SaaSHub's most powerful feature for founders is something that works quietly in the background: the alternatives engine. When a buyer searches for a tool in your category, or visits a competitor's page, SaaSHub surfaces your product as an alternative. This means your listing is not just waiting to be found: it is actively placed in front of people who are already evaluating options in your space.
      </p>
      <p>
        This is genuinely valuable. It is passive distribution that does not require ongoing founder effort. Once you are listed, SaaSHub's algorithm keeps placing you in relevant alternatives searches for as long as the listing exists.
      </p>
      <p>
        NextBigTool has comparison pages but does not have the same depth of alternatives-driven traffic that SaaSHub has built up over years of SEO authority. This is an honest advantage SaaSHub holds.
      </p>
      <p>
        SaaSHub's alternatives engine is one of the best passive discovery mechanisms in the SaaS directory space. It is a reason to be listed there regardless of what other platforms you use.
      </p>

      {/* Section 4 */}
      <h2 id="where-nbt-wins">Where NextBigTool Wins: Discovery That Grows With You</h2>
      <p>
        SaaSHub is a directory. Once your product is listed, the page is largely static. The platform does not have a mechanism for founders to post ongoing updates, and there is no feed that surfaces founder activity to the broader community. A listing on SaaSHub looks the same on day one as it does on day 365.
      </p>
      <p>
        NextBigTool is different. Founders post milestones, MRR updates, changelog entries, and funding announcements directly on their product page. Those updates surface on the global Build-in-Public Wall on the homepage, filtered by Milestones, Updates, Funding, and Launches. Followers get notified every time something new is posted.
      </p>
      <p>
        This means a NextBigTool listing earns compounding visibility. Every time you ship something and post about it, your product gets a fresh wave of exposure to the people who are already following you and to anyone browsing the homepage wall. SaaSHub gives you no equivalent mechanism.
      </p>
      <p>
        A SaaSHub listing is a permanent address. A NextBigTool listing is a permanent address that also has a front door that opens every time you ship. The more you build, the more your listing works for you.
      </p>

      {/* Section 5 */}
      <h2 id="founder-crm">The Founder CRM: Turning Attention Into Action</h2>
      <p>
        On SaaSHub, when someone visits your product page or clicks through to your site, that signal is invisible to you. SaaSHub does not surface visitor data to founders. You know your listing exists. You do not know who found it.
      </p>
      <p>
        On NextBigTool's Core plan, every person who upvotes or interacts with your product appears in a Founder CRM dashboard. The data includes name, email, company, and job title. Users consent to this at the point of engagement. Founders can then look at that list, identify which interactions are worth following up on, and reach out directly.
      </p>
      <p>
        This is the functional difference between a directory and a pipeline tool. SaaSHub builds presence. NextBigTool builds presence and gives you the data to act on it.
      </p>

      {/* Section 6 */}
      <h2 id="pricing">How the Costs Compare</h2>

      <h3>NextBigTool Pricing</h3>
      <ul>
        <li><strong>Free: $0 forever.</strong> Instant listing with no queue or moderation wait. Includes lifetime listing, high authority backlink, 5 Build-in-Public posts, and basic analytics.</li>
        <li><strong>Core: $49/month</strong> (or $29/month billed yearly, saving $240/year). Includes unlimited listings, Founder CRM with full contact data, Hall of Fame placement, 1 professionally written and distributed press release, unlimited Build-in-Public posts, and CSV export.</li>
      </ul>

      <h3>SaaSHub Pricing</h3>
      <ul>
        <li><strong>Free:</strong> Free listing with dofollow DR 78 backlink. Moderated approval required before going live. Listing includes product description, pricing info, features, and suggested alternatives.</li>
        <li><strong>Featured placement: $99/month.</strong> Includes homepage rotation, placement on relevant alternatives and comparison pages, footer promotion on relevant pages, and random inclusion in two slots of the SaaSHub Weekly newsletter per week.</li>
      </ul>

      <p>
        SaaSHub's featured plan at $99/month gives you promoted placement only. NextBigTool's Core plan at $49/month gives you promoted placement plus Founder CRM, Hall of Fame, press release, unlimited listings, and build-in-public tools. The feature-to-cost ratio is significantly different.
      </p>

      {/* Section 7 */}
      <h2 id="wins-and-falls-short">Where Each Platform Wins and Falls Short</h2>

      <h3>NextBigTool: Strengths</h3>
      <ul>
        <li>Free listing is instant with no moderation queue</li>
        <li>High authority backlink included on the free plan</li>
        <li>Build-in-Public feed creates compounding visibility with every update posted</li>
        <li>Founder CRM gives actionable contact data on everyone who engaged</li>
        <li>Hall of Fame provides permanent, evergreen placement on Core plan</li>
        <li>Press release written and distributed professionally on Core plan</li>
        <li>Core plan covers unlimited products for one subscription</li>
        <li>Featured plan is cheaper than SaaSHub's promoted listing and includes significantly more features</li>
      </ul>

      <h3>NextBigTool: Limitations</h3>
      <ul>
        <li>Newer platform: SaaSHub has significantly more established SEO authority and traffic</li>
        <li>Alternatives engine is not as developed as SaaSHub's</li>
        <li>No status page or uptime tracking feature</li>
        <li>No product review system</li>
      </ul>

      <h3>SaaSHub: Strengths</h3>
      <ul>
        <li>856,000 monthly page views with established SEO authority</li>
        <li>DR 78 dofollow backlink included on the free listing</li>
        <li>Alternatives engine passively places your product in front of high-intent buyers</li>
        <li>Moderated quality control gives the listing credibility</li>
        <li>Status pages and uptime tracking available</li>
        <li>Long-standing reputation as a trusted, independent directory</li>
        <li>18,900 plus newsletter subscribers via SaaSHub Weekly</li>
      </ul>

      <h3>SaaSHub: Limitations</h3>
      <ul>
        <li>Listings are static with no build-in-public feed or update mechanism for founders</li>
        <li>No Founder CRM: visitor and engagement data is invisible to founders</li>
        <li>No follower notifications and no way to re-engage people who found your product</li>
        <li>Free listing requires moderated approval and is not instant</li>
        <li>Featured placement at $99/month gives promotion only with no founder tools</li>
        <li>No Hall of Fame or permanent featured placement beyond the rotating paid slot</li>
        <li>No press release or editorial support</li>
      </ul>

      {/* Section 8 */}
      <h2 id="right-for-you">Which Platform Is Right for You?</h2>
      <p>
        The most honest answer is that many founders should be on both. They serve different purposes and are not mutually exclusive. That said, if you are choosing where to invest your primary launch energy, here is how to think about it.
      </p>

      <h3>Choose NextBigTool if...</h3>
      <ul>
        <li>You build in public and want a platform that rewards ongoing activity with visibility</li>
        <li>You want to know who is paying attention to your product and be able to reach them</li>
        <li>You want a listing that becomes more valuable the more you ship</li>
        <li>You want a press release written and distributed as part of your launch</li>
        <li>You have multiple products and want one subscription that covers all of them</li>
        <li>You want instant listing with no wait for moderation approval</li>
        <li>You want Founder CRM data to turn discovery into pipeline</li>
      </ul>

      <h3>Choose SaaSHub if...</h3>
      <ul>
        <li>You want passive, long-term discovery through the alternatives engine</li>
        <li>You want an established DR 78 backlink from a high-authority directory</li>
        <li>Your buyers are comparison-shopping in your category and SaaSHub ranks for those searches</li>
        <li>You want presence on a platform with proven, established traffic</li>
        <li>You are building a broad directory strategy and SaaSHub is one of many listings</li>
      </ul>

      {/* Section 9 */}
      <h2 id="bottom-line">The Honest Bottom Line</h2>
      <p>
        SaaSHub is a platform worth being on. The alternatives engine, the DR 78 backlink, and the established traffic make it a strong permanent listing for any SaaS product. For passive, long-term SEO-driven discovery, it is one of the better directories available to indie founders.
      </p>
      <p>
        But SaaSHub is a catalog. It does not help you build in public. It does not show you who visited or engaged with your product. It does not give you tools to turn interest into conversations. Once your listing is live, you are largely a passive participant in whatever traffic SaaSHub sends your way.
      </p>
      <p>
        NextBigTool is built for founders who want to be active participants in their own discovery. The Build-in-Public feed keeps your listing alive every time you ship. The Founder CRM turns engagement into data you can act on. The free tier gets you listed immediately with a backlink and analytics. And the Core plan gives you a press release, a Hall of Fame spot, and the contact details of everyone who showed up, all for less than SaaSHub's featured listing alone.
      </p>
      <p>
        If you have to choose one to start with today, choose the platform that grows with you. List on SaaSHub for the passive backlink and alternatives traffic. Build your launch home on NextBigTool.
      </p>

    </ComparePageLayout>
  );
}
