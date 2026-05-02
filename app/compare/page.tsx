import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import CompareHero from "@/app/components/CompareHero";

export const metadata: Metadata = {
  title: "Compare NextBigTool – vs Product Hunt, AppSumo & More",
  description: "See how NextBigTool compares to other product directories and launch platforms. Honest, side-by-side comparisons to help indie founders choose the right platform.",
};

const COMPARISONS = [
  {
    slug: "nextbigtool-vs-peerpush",
    competitor: "PeerPush",
    description: "Community-driven launch platform vs. indie product discovery directory. Compare for your launch strategy.",
    bullets: ["Audience: indie founders vs. general public", "Visibility: ongoing vs. one-time", "Build-in-public: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-product-hunt",
    competitor: "Product Hunt",
    description: "One-day launch spike vs. sustained community visibility. Compare the two most popular ways to launch a product.",
    bullets: ["Visibility: 24 hours vs. ongoing", "Build-in-public: NextBigTool only", "Community rewards: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-find-your-saas",
    competitor: "Find Your SaaS",
    description: "SaaS aggregator directory vs. active indie launch and discovery platform. Compare for lasting traction.",
    bullets: ["Engagement: passive vs. active community", "Founder CRM: NextBigTool only", "Build-in-public: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-g2",
    competitor: "G2",
    description: "Enterprise review platform vs. indie maker community. Compare for your product and audience.",
    bullets: ["Audience: Enterprise vs. indie makers", "Cost: pay-to-play vs. free tier", "AI integration: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-saashub",
    competitor: "SaaSHub",
    description: "SaaS directory vs. product discovery for people and community. Compare features and engagement.",
    bullets: ["Community engagement: NextBigTool only", "Build-in-public: NextBigTool only", "Founder CRM: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-appsumo",
    competitor: "AppSumo",
    description: "Lifetime deals marketplace vs. community product directory. Compare for sustainable growth.",
    bullets: ["Model: deals vs. discovery", "Revenue: deep discounts vs. full price", "Ongoing visibility: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-alternativeto",
    competitor: "AlternativeTo",
    description: "Passive alternatives listing vs. active product community. Compare for sustained discovery.",
    bullets: ["Engagement: passive vs. active community", "Build-in-public: NextBigTool only", "Product updates: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-capterra",
    competitor: "Capterra",
    description: "Enterprise software marketplace vs. community product directory. Compare for your budget and audience.",
    bullets: ["Cost: pay-per-click vs. free tier", "Audience: Enterprise vs. startups", "Community features: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-betalist",
    competitor: "BetaList",
    description: "Pre-launch beta testing vs. any-stage growth platform. Compare for your product stage.",
    bullets: ["Stage: pre-launch only vs. any stage", "Ongoing updates: NextBigTool only", "Growth tracking: NextBigTool only"],
  },
  {
    slug: "nextbigtool-vs-toolfinder",
    competitor: "ToolFinder",
    description: "Curated tool recommendation engine vs. full indie product launch and discovery platform.",
    bullets: ["Launch support: NextBigTool only", "Community engagement: NextBigTool only", "Build-in-public: NextBigTool only"],
  },
];

export default function ComparePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />
      <CompareHero />

      <div style={{ flex: 1, padding: "48px 40px 80px", maxWidth: 1160, margin: "0 auto", width: "100%" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 20,
        }}>
          {COMPARISONS.map((c) => (
            <Link key={c.slug} href={`/compare/${c.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "24px 26px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#FF6B35";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(255,107,53,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                {/* Title */}
                <h2 style={{
                  fontSize: 16, fontWeight: 800, color: "var(--ink)",
                  margin: 0, letterSpacing: "-0.02em",
                }}>
                  NextBigTool vs {c.competitor}
                </h2>

                {/* Description */}
                <p style={{
                  fontSize: 13, color: "var(--ink-muted)",
                  margin: 0, lineHeight: 1.6,
                }}>
                  {c.description}
                </p>

                {/* Bullets */}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {c.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--ink-muted)" }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "#FF6B35", flexShrink: 0, marginTop: 5,
                      }} />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 700, color: "#FF6B35",
                  marginTop: 4,
                }}>
                  View full comparison
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
