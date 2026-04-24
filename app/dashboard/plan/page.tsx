import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "/ month",
    desc: "For makers exploring NextBigTool.",
    current: true,
    highlight: false,
    features: [
      { text: "Up to 3 product listings",              ok: true },
      { text: "1 Build-in-Public post / month",        ok: true },
      { text: "Basic analytics (upvote totals)",       ok: true },
      { text: "No upvoter identities",                 ok: false },
      { text: "No Hall of Fame",                       ok: false },
    ],
    cta: "Your current plan",
    ctaDisabled: true,
  },
  {
    id: "core",
    name: "Core",
    price: "$12",
    per: "/ month",
    desc: "For founders serious about launching.",
    current: false,
    highlight: true,
    badge: "Most popular",
    features: [
      { text: "Unlimited product listings",            ok: true },
      { text: "Unlimited Build-in-Public posts",       ok: true },
      { text: "See who upvoted (name + email)",        ok: true },
      { text: "CSV export + CRM sync",                 ok: true },
      { text: "Priority newsletter review",            ok: true },
    ],
    cta: "Upgrade to Core →",
    ctaDisabled: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$49",
    per: "/ month",
    desc: "For teams aiming for the Hall of Fame.",
    current: false,
    highlight: false,
    features: [
      { text: "Everything in Core",                    ok: true },
      { text: "Hall of Fame induction (permanent)",    ok: true },
      { text: "Homepage placement + badge",            ok: true },
      { text: "Dedicated launch support",              ok: true },
      { text: "Team seats (up to 5)",                  ok: true },
    ],
    cta: "Upgrade to Premium →",
    ctaDisabled: false,
  },
];

const COMPARISON = [
  { feature: "Product listings",    free: "3",  core: "∞", premium: "∞" },
  { feature: "BIP posts / month",   free: "1",  core: "∞", premium: "∞" },
  { feature: "Upvoter identities",  free: "—",  core: "✓", premium: "✓", coreBold: true, premiumBold: true },
  { feature: "Hall of Fame",        free: "—",  core: "—", premium: "✓", premiumBold: true },
  { feature: "Team seats",          free: "1",  core: "1", premium: "5" },
];

export default async function PlanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Billing</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>My Plan</h1>
          <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>
            You&apos;re on the <b style={{ color: "#0f0f10" }}>Free</b> plan. Upgrade to unlock upvoter tracking, unlimited posts, and Hall of Fame.
          </p>
        </div>
        <div style={{ display: "flex", background: "#f1f1ee", borderRadius: 9, padding: 3 }}>
          {["Monthly", "Yearly · save 20%"].map((t, i) => (
            <div key={t} style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", background: i === 0 ? "#fff" : "transparent", color: i === 0 ? "#0f0f10" : "#6b6b78", boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {PLANS.map((plan) => (
          <div key={plan.id} style={{
            borderRadius: 14, padding: 24, position: "relative",
            background: plan.highlight ? "#0f0f10" : "#fff",
            border: plan.current ? "2px solid #ececea" : plan.highlight ? "none" : "1.5px solid #ececea",
            boxShadow: plan.highlight ? "0 8px 32px rgba(0,0,0,0.18)" : "none",
          }}>
            {plan.badge && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" as const }}>
                {plan.badge}
              </div>
            )}
            {plan.current && (
              <div style={{ position: "absolute", top: -12, left: 20, background: "#f1f1ee", border: "1px solid #ececea", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#6b6b78" }}>
                Current
              </div>
            )}
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: plan.highlight ? "#fff" : "#0f0f10" }}>{plan.name}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: plan.highlight ? "#fff" : "#0f0f10", letterSpacing: "-0.03em" }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: plan.highlight ? "#8a8a90" : "#9090a0" }}>{plan.per}</span>
            </div>
            <p style={{ fontSize: 13, color: plan.highlight ? "#8a8a90" : "#6b6b78", margin: "0 0 20px", lineHeight: 1.5 }}>{plan.desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f) => (
                <li key={f.text} style={{ display: "flex", gap: 8, fontSize: 13, color: plan.highlight ? (f.ok ? "#eaeaea" : "#8a8a90") : (f.ok ? "#0f0f10" : "#9090a0") }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.ok ? (plan.highlight ? "#ff6a3d" : "#0a7a4f") : "#d0d0d0"} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                    {f.ok ? <path d="M5 12l5 5 9-11"/> : <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>}
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>
            <button disabled={plan.ctaDisabled} style={{
              width: "100%", borderRadius: 9, padding: "10px 0",
              fontSize: 13.5, fontWeight: 700, cursor: plan.ctaDisabled ? "default" : "pointer",
              background: plan.ctaDisabled ? "#f1f1ee" : plan.highlight ? "linear-gradient(90deg,#ff6a3d,#ff3d88)" : "transparent",
              color: plan.ctaDisabled ? "#9090a0" : plan.highlight ? "#fff" : "#0f0f10",
              border: plan.highlight || plan.ctaDisabled ? "none" : "1.5px solid #d8d8d4",
            } as React.CSSProperties}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Billing */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 4px" }}>Billing &amp; invoices</h2>
          <p style={{ fontSize: 13, color: "#9090a0", margin: "0 0 16px" }}>Manage your payment method and download past receipts.</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #ececea" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 38, height: 26, borderRadius: 4, background: "#0e0e10", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: ".1em" }}>VISA</div>
              <div>
                <b style={{ fontSize: 13 }}>•••• 4242</b>
                <div style={{ fontSize: 11.5, color: "#9090a0" }}>Expires 08/27</div>
              </div>
            </div>
            <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#3a3a45" }}>Update</button>
          </div>
          <div style={{ padding: "14px 0", fontSize: 13, color: "#9090a0" }}>
            No invoices yet — you&apos;re on the Free plan.
          </div>
        </div>

        {/* Comparison table */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 14px" }}>Plan comparison</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 0", textAlign: "left", color: "#9090a0", fontWeight: 600, fontSize: 11 }}>Feature</th>
                <th style={{ padding: "8px 0", textAlign: "center", color: "#9090a0", fontWeight: 600, fontSize: 11 }}>Free</th>
                <th style={{ padding: "8px 0", textAlign: "center", color: "#9090a0", fontWeight: 600, fontSize: 11 }}>Core</th>
                <th style={{ padding: "8px 0", textAlign: "center", color: "#9090a0", fontWeight: 600, fontSize: 11 }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} style={{ borderTop: "1px solid #f5f5f3" }}>
                  <td style={{ padding: "10px 0", color: "#3a3a45" }}>{row.feature}</td>
                  <td style={{ padding: "10px 0", textAlign: "center", color: row.free === "—" ? "#d0d0d0" : "#0f0f10", fontWeight: 700 }}>{row.free}</td>
                  <td style={{ padding: "10px 0", textAlign: "center", color: row.core === "✓" ? "#0a7a4f" : row.core === "—" ? "#d0d0d0" : "#0f0f10", fontWeight: row.coreBold ? 800 : 700 }}>{row.core}</td>
                  <td style={{ padding: "10px 0", textAlign: "center", color: row.premium === "✓" ? "#0a7a4f" : row.premium === "—" ? "#d0d0d0" : "#0f0f10", fontWeight: row.premiumBold ? 800 : 700 }}>{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
