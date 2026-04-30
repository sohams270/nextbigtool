import type { Metadata } from "next";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import PressReleaseHero from "../components/PressReleaseHero";

export const metadata: Metadata = {
  title: "Press Release — Next Big Tool",
  description: "Publish a press release and put your product in front of thousands of founders, builders, and early adopters on Next Big Tool.",
};

const BENEFITS = [
  {
    icon: "🎯",
    title: "Targeted reach",
    desc: "Your story lands in front of founders, investors, and early adopters who are actively looking for what you built.",
  },
  {
    icon: "⚡",
    title: "Published within 48 hours",
    desc: "Submit your details and our editorial team reviews and publishes your press release within 48 hours.",
  },
  {
    icon: "🔗",
    title: "SEO-friendly links",
    desc: "Every press release includes a permanent, indexed page that drives organic traffic long after launch day.",
  },
  {
    icon: "📊",
    title: "Real analytics",
    desc: "See exactly how many builders viewed, clicked, and engaged with your press release in real time.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upgrade to Core",
    desc: "Press releases are a Core member feature. Upgrade once and publish as many as you need.",
  },
  {
    step: "02",
    title: "Submit your details",
    desc: "Fill in your announcement — launch, funding, milestone, or feature drop — and send it to our editorial team.",
  },
  {
    step: "03",
    title: "Go live within 48 hours",
    desc: "Our team reviews your submission and publishes it to the NBT community within 48 hours of receipt.",
  },
];

export default function PressReleasePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <PressReleaseHero />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 28px 80px", width: "100%" }}>

        {/* Benefits grid */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              color: "#FF6B35", textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Why Press Releases on NBT
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
              color: "var(--ink)", margin: 0, lineHeight: 1.2,
            }}>
              Built for founders who ship.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {BENEFITS.map((b) => (
              <div key={b.title} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "20px 18px",
              }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{b.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "32px 32px 28px",
          marginBottom: 48,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "#FF6B35", textTransform: "uppercase",
            marginBottom: 6,
          }}>
            How It Works
          </div>
          <h2 style={{
            fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em",
            color: "var(--ink)", margin: "0 0 28px",
          }}>
            Three steps to maximum reach.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
            {HOW_IT_WORKS.map((h, i) => (
              <div key={h.step} style={{
                padding: "0 24px 0 0",
                borderRight: i < HOW_IT_WORKS.length - 1 ? "1px solid var(--border)" : "none",
                marginRight: i < HOW_IT_WORKS.length - 1 ? 24 : 0,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(255,107,53,0.6)",
                  letterSpacing: "0.06em", marginBottom: 8,
                }}>
                  Step {h.step}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  {h.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent press releases — empty state */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>
              Recent Press Releases
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "52px 32px",
            textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,107,53,0.10)",
              border: "1px solid rgba(255,107,53,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, margin: "0 auto 14px",
            }}>
              📣
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
              No press releases yet
            </div>
            <div style={{
              fontSize: 12, color: "var(--ink-muted)",
              maxWidth: 340, margin: "0 auto 20px", lineHeight: 1.6,
            }}>
              Be the first founder to make their launch official on Next Big Tool.
              Upgrade to Core and start publishing.
            </div>
            <a
              href="/pricing"
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "9px 20px", borderRadius: 99,
                background: "#FF6B35", color: "#fff",
                fontSize: 12, fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Upgrade Now →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
