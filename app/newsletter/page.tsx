import TopNav from "../components/TopNav";

const PAST_ISSUES = [
  { num: "012", title: "5 AI tools disrupting productivity in 2025", date: "Apr 14, 2025", readers: "14.2k" },
  { num: "011", title: "The no-code revolution: 6 tools to watch", date: "Apr 7, 2025", readers: "13.8k" },
  { num: "010", title: "From idea to $10k MRR: Founder stories", date: "Mar 31, 2025", readers: "13.1k" },
  { num: "009", title: "Developer tools that save hours every week", date: "Mar 24, 2025", readers: "12.6k" },
];

const FEATURES = [
  { icon: "⚡", title: "Weekly drops, no spam", desc: "Every Monday morning — 5 tools worth your time, nothing more." },
  { icon: "🎯", title: "Founder spotlights", desc: "Real stories from builders who shipped and what they learned." },
  { icon: "📈", title: "Trend reports", desc: "What categories are hot, what's fading, and what's next." },
  { icon: "🔒", title: "Early access", desc: "Subscribers get first look at new tools before they go public." },
];

export default function NewsletterPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      {/* Hero */}
      <div
        style={{
          background: "#0A0B1A", color: "#fff",
          padding: "60px 32px 50px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.4)", borderRadius: 99, padding: "4px 12px", fontSize: 10, fontWeight: 700, color: "#FF6B35", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ✦ 14,200+ subscribers
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 14px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            The Founder's Weekly
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: "0 auto 32px", maxWidth: 480 }}>
            5 hand-picked tools every Monday. Founder spotlights. Trend reports. No fluff, no spam — just signal.
          </p>

          {/* Signup form */}
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", background: "#fff", borderRadius: 10, padding: 4, gap: 4 }}>
            <input
              type="email"
              placeholder="name@company.com"
              style={{
                flex: 1, border: "none", outline: "none", padding: "0 14px",
                fontSize: 12, fontFamily: "inherit", background: "transparent",
                color: "#1A1A1A",
              }}
            />
            <button
              style={{
                background: "#FF6B35", color: "#fff", border: "none",
                borderRadius: 7, padding: "10px 20px", fontSize: 11,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe Free →
            </button>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>
            Unsubscribe any time. We hate spam too.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 32px", width: "100%" }}>
        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 40 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "#6B6B70", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Past issues */}
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Past Issues</span>
            <span style={{ fontSize: 11, color: "#6B6B70" }}>View all →</span>
          </div>
          {PAST_ISSUES.map((issue, i) => (
            <div
              key={issue.num}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 0",
                borderBottom: i < PAST_ISSUES.length - 1 ? "1px solid #F5F5F5" : "none",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#6B6B70", flexShrink: 0 }}>
                #{issue.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{issue.title}</div>
                <div style={{ fontSize: 10, color: "#6B6B70", marginTop: 2 }}>{issue.date} · {issue.readers} readers</div>
              </div>
              <span style={{ fontSize: 11, color: "#FF6B35", fontWeight: 600, cursor: "pointer" }}>Read →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
