import TopNav from "../components/TopNav";
import Btn from "../components/Btn";
import Pill from "../components/Pill";
import Link from "next/link";

type Feature = [label: string, star?: boolean];

function PriceCard({
  tier, price, unit, features, cta, ctaHref = "/auth/login",
  highlight, headerBg, headerColor,
}: {
  tier: string; price: string; unit: string; features: Feature[];
  cta: string; ctaHref?: string; highlight?: boolean;
  headerBg?: string; headerColor?: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${highlight ? "#FF6B35" : "#CFCFD4"}`,
        borderRadius: 14, background: "#fff",
        overflow: "hidden", position: "relative",
        display: "flex", flexDirection: "column",
        boxShadow: highlight ? "0 8px 32px rgba(255,107,53,0.18)" : "none",
        transform: highlight ? "translateY(-6px)" : "none",
      }}
    >
      {highlight && (
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#FF6B35", padding: "3px 12px", borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", zIndex: 1, border: "1px solid #FFE3D6" }}>
          ★ Best value
        </div>
      )}
      <div style={{ background: headerBg || "#F5F5F5", padding: highlight ? "36px 24px 22px" : "22px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: headerColor || "#6B6B70" }}>{tier}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", color: headerColor || "#1A1A1A" }}>{price}</span>
          <span style={{ fontSize: 11, color: headerColor ? "rgba(255,255,255,0.7)" : "#6B6B70", whiteSpace: "nowrap" }}>{unit}</span>
        </div>
      </div>

      <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 20 }}>
          {features.map(([label, star]) => (
            <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: star ? "#FFE3D6" : "rgba(0,184,122,0.12)", color: star ? "#FF6B35" : "#00B87A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>
                {star ? "★" : "✓"}
              </div>
              <span style={{ fontSize: 12, lineHeight: 1.4 }}>{label}</span>
            </div>
          ))}
        </div>
        <Link href={ctaHref} style={{ textDecoration: "none" }}>
          <Btn variant={highlight ? "primary" : "ghost"} size="lg" full>{cta}</Btn>
        </Link>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. Downgrades take effect at the next billing cycle." },
  { q: "Is Basic a one-time fee?", a: "Yes — Basic is a one-time payment per product, not a subscription." },
  { q: "What counts as a 'product' on Core?", a: "Any tool you've submitted to the platform. Core gives you unlimited listings under one subscription." },
  { q: "Do you offer refunds?", a: "7-day refund on Basic. Core is month-to-month — cancel anytime, no refunds for partial months." },
];

export default function PricingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      {/* Hero */}
      <div style={{ background: "#0A0B1A", color: "#fff", padding: "52px 32px 44px", textAlign: "center" }}>
        <Pill color="orangeSolid" size="xs" style={{ marginBottom: 16 }}>Simple pricing</Pill>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
          Plans for every stage of building
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          Start free. Upgrade when interest starts compounding.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px", width: "100%" }}>
        {/* Pricing cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "end", marginBottom: 48 }}>
          <PriceCard
            tier="Free"
            price="$0"
            unit="/ forever"
            features={[
              ["List 1 product"],
              ["Basic analytics (upvotes + views)"],
              ["Public profile & badges"],
              ["Newsletter distribution"],
            ]}
            cta="Get Started Free"
            ctaHref="/auth/login"
          />
          <PriceCard
            tier="Basic"
            price="$29"
            unit="/ one-time per product"
            features={[
              ["Everything in Free"],
              ["Featured for 48h on launch"],
              ["Build-in-public posts"],
              ["Re-launch option"],
              ["Hall of Fame eligibility"],
              ["Priority review"],
            ]}
            cta="Upgrade to Basic"
            ctaHref="/auth/login"
          />
          <PriceCard
            tier="Core"
            price="$79"
            unit="/ month · unlimited"
            headerBg="#FF6B35"
            headerColor="#fff"
            highlight
            features={[
              ["Everything in Basic"],
              ["Founder CRM — see who's interested", true],
              ["One follow-up per interested user", true],
              ["Unlimited products", true],
              ["Weekly digest placement", true],
            ]}
            cta="Upgrade to Core →"
            ctaHref="/auth/login"
          />
        </div>

        {/* Feature comparison table */}
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", padding: "12px 20px", background: "#F5F5F5", borderBottom: "1px solid #CFCFD4" }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6B6B70" }}>Feature</span>
            {["Free", "Basic", "Core"].map((t) => (
              <span key={t} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: t === "Core" ? "#FF6B35" : "#6B6B70", textAlign: "center" }}>{t}</span>
            ))}
          </div>
          {[
            ["Tool listings", "1", "1", "Unlimited"],
            ["Analytics", "Basic", "Basic", "Full"],
            ["Featured placement", "—", "48h", "48h"],
            ["Build in Public posts", "—", "✓", "✓"],
            ["Founder CRM", "—", "—", "✓"],
            ["Follow-up users", "—", "—", "1 per user"],
            ["Weekly digest", "—", "—", "✓"],
            ["Priority review", "—", "✓", "✓"],
          ].map(([feature, free, basic, core], i) => (
            <div key={feature} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px", padding: "11px 20px", borderBottom: i < 7 ? "1px solid #F5F5F5" : "none" }}>
              <span style={{ fontSize: 11.5 }}>{feature}</span>
              {[free, basic, core].map((val, j) => (
                <span key={j} style={{ fontSize: 11, textAlign: "center", color: val === "—" ? "#CFCFD4" : val === "✓" ? "#00B87A" : "#1A1A1A", fontWeight: val === "✓" || val === "—" ? 700 : 500 }}>{val}</span>
              ))}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 12, padding: "6px 24px 12px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, padding: "16px 0 4px" }}>Common Questions</div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} style={{ padding: "14px 0", borderTop: i > 0 ? "1px solid #F5F5F5" : "1px solid #F5F5F5" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{item.q}</div>
              <div style={{ fontSize: 11, color: "#6B6B70", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
          <div style={{ padding: "14px 0", borderTop: "1px solid #F5F5F5" }}>
            <span style={{ fontSize: 11, color: "#6B6B70" }}>More questions? </span>
            <Link href="/faq" style={{ fontSize: 11, color: "#FF6B35", fontWeight: 600 }}>Read the full FAQ →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
