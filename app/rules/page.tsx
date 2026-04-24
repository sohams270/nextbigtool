import TopNav from "../components/TopNav";

const RULES = [
  {
    number: "01",
    title: "Tools must be real and live",
    body: "Your tool must be functional and publicly accessible at time of submission. Vaporware, placeholders, or \"coming soon\" pages (without a working product) will be rejected. Early-access and beta tools are fine — just be transparent.",
    icon: "✓",
    color: "#00B87A",
  },
  {
    number: "02",
    title: "One listing per product",
    body: "Each unique product may only be listed once. Duplicate submissions, re-submissions of rejected tools without significant changes, or attempts to game the ranking with multiple listings will result in removal.",
    icon: "①",
    color: "#3B7FFF",
  },
  {
    number: "03",
    title: "No vote manipulation",
    body: "Upvote rings, buying votes, coordinated upvote campaigns, and self-upvoting are all banned. We monitor patterns and will remove tools found to be gaming rankings. Repeat offenders will be permanently banned.",
    icon: "✗",
    color: "#FF6B35",
  },
  {
    number: "04",
    title: "Honest descriptions",
    body: "Your tool listing must accurately represent what the product does. Misleading taglines, inflated claims ('World's #1'), fake social proof, or misrepresented pricing will be grounds for removal.",
    icon: "◎",
    color: "#FF6B35",
  },
  {
    number: "05",
    title: "Build in Public Wall is for founders",
    body: "Only founders with an approved tool can post to the wall. Posts must relate to your product — milestones, updates, launches, funding. No promotional posts for third-party tools or services.",
    icon: "⬡",
    color: "#00B87A",
  },
  {
    number: "06",
    title: "Be respectful in comments",
    body: "Comments that are spammy, abusive, or off-topic will be removed. Founders may not use comments to disparage competitors. We're a community of builders — treat each other accordingly.",
    icon: "♡",
    color: "#3B7FFF",
  },
  {
    number: "07",
    title: "No adult, illegal, or harmful content",
    body: "Tools that facilitate illegal activity, contain adult content, enable harassment, or cause harm will be immediately removed and the account permanently banned.",
    icon: "⚠",
    color: "#1A1A1A",
  },
  {
    number: "08",
    title: "We reserve editorial discretion",
    body: "The Next Big Tool team reserves the right to feature, de-feature, or remove any listing at our discretion. We aim to be fair and consistent, but quality and community health come first.",
    icon: "◈",
    color: "#6B6B70",
  },
];

export default function RulesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      <div style={{ background: "#0A0B1A", color: "#fff", padding: "44px 32px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Community Rules</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          We built this for honest builders. These rules keep the signal high and the community healthy.
        </p>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 32px", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {RULES.map((rule) => (
            <div
              key={rule.number}
              style={{
                background: "#fff", border: "1px solid #CFCFD4",
                borderRadius: 10, padding: "20px 22px",
                display: "flex", gap: 18, alignItems: "flex-start",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: rule.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: rule.color }}>
                {rule.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#A8A8AD", letterSpacing: "0.06em" }}>RULE {rule.number}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{rule.title}</span>
                </div>
                <p style={{ fontSize: 11.5, color: "#6B6B70", lineHeight: 1.65, margin: 0 }}>{rule.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: "18px 22px", background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, fontSize: 11, color: "#6B6B70", lineHeight: 1.7 }}>
          <strong style={{ color: "#1A1A1A" }}>Questions about these rules?</strong>{" "}
          If you're unsure whether your tool or post is within guidelines, reach out before submitting. We'd rather help you get it right than reject you after the fact.{" "}
          <span style={{ color: "#FF6B35", fontWeight: 600, cursor: "pointer" }}>Contact us →</span>
        </div>
      </div>
    </div>
  );
}
