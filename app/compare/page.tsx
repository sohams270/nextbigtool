import type { Metadata } from "next";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import CompareHero from "@/app/components/CompareHero";
import CompareCard from "@/app/components/CompareCard";

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

      <div style={{ flex: 1, padding: "48px 40px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {COMPARISONS.map((c) => (
            <CompareCard
              key={c.slug}
              slug={c.slug}
              competitor={c.competitor}
              description={c.description}
              bullets={c.bullets}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
