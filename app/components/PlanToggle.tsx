"use client";

import { useState } from "react";
import Link from "next/link";

function Check({ dark }: { dark?: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
      background: dark ? "rgba(255,255,255,0.18)" : "rgba(0,184,122,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#00B87A"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-11" />
      </svg>
    </div>
  );
}

type Plan = {
  id: string;
  label: string;
  price: string;
  priceYearly?: string;
  per: string;
  perYearly?: string;
  subPrice?: (yearly: boolean) => React.ReactNode;
  desc: string;
  bodyText: string;
  features: string[];
  featuresHeader?: string;
  cta: string;
  ctaHref: string;
  isCurrent?: boolean;
  isCore?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    label: "FREE",
    price: "$0",
    per: "forever",
    desc: "Forever free. No credit card needed.",
    bodyText: "Perfect for exploring the platform and sharing your first product with the world.",
    features: [
      "List 1 product",
      "Lifetime free listing",
      "High authority backlink",
      "1 post on Build in Public wall",
      "Basic analytics (upvotes + comments)",
    ],
    cta: "Current plan",
    ctaHref: "/dashboard/plan",
    isCurrent: true,
  },
  {
    id: "basic",
    label: "BASIC",
    price: "$19",
    per: "one-time per product",
    desc: "One-time per product. Pay once, keep forever.",
    bodyText: "For founders who want more visibility and a boost on launch day.",
    featuresHeader: "EVERYTHING IN FREE, PLUS",
    features: [
      "Featured for 48 hours on launch",
      "Featured in weekly newsletter (once)",
      "Re-launch option",
      "5 posts on Build in Public wall",
      "CSV export of your data",
    ],
    cta: "Upgrade to Basic →",
    ctaHref: "/dashboard/plan",
  },
  {
    id: "core",
    label: "CORE",
    price: "$79",
    priceYearly: "$9",
    per: "/month",
    perYearly: "/month",
    subPrice: (yearly: boolean) =>
      yearly
        ? <span style={{ fontSize: 12, color: "#d1fae5", fontWeight: 600 }}>Billed as $108/year</span>
        : <span style={{ fontSize: 12, color: "#d1fae5", fontWeight: 600 }}>Or $9/month billed yearly — save $840/year.</span>,
    desc: "",
    bodyText: "For serious builders turning discovery into real pipeline and traction.",
    featuresHeader: "EVERYTHING IN BASIC, PLUS",
    features: [
      "One follow-up message per interested user",
      "Weekly newsletter placement",
      "Unlimited product listings",
      "Unlimited Build in Public posts",
      "1 featured blog post written about you",
    ],
    cta: "Upgrade to Core →",
    ctaHref: "/dashboard/plan",
    isCore: true,
  },
];

const COMPARISON = [
  { feature: "Products listed",            free: "1",         basic: "1",       core: "Unlimited" },
  { feature: "Build in Public posts",       free: "1",         basic: "5",       core: "Unlimited" },
  { feature: "Featured on homepage",        free: "—",         basic: "48 hours", core: "48 hours" },
  { feature: "Newsletter placement",        free: "—",         basic: "Once",    core: "Weekly" },
  { feature: "Founder CRM",                free: "—",         basic: "—",       core: "✓" },
  { feature: "Hall of Fame placement",      free: "—",         basic: "—",       core: "✓" },
  { feature: "CSV export",                 free: "—",         basic: "✓",       core: "✓" },
  { feature: "Basic analytics",            free: "✓",         basic: "✓",       core: "✓" },
];

export default function PlanToggle() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? "#9090a0" : "#0f0f10" }}>Monthly</span>
        <button
          onClick={() => setYearly(!yearly)}
          style={{
            width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", padding: 2,
            background: "#FF6B35", position: "relative", flexShrink: 0,
          }}
          aria-label="Toggle billing period"
        >
          <div style={{
            width: 20, height: 20, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 2, left: yearly ? "calc(100% - 22px)" : 2,
            transition: "left 0.2s",
          }} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? "#0f0f10" : "#9090a0" }}>Yearly</span>
        <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999 }}>Save 89%</span>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {PLANS.map((plan) => {
          const price = plan.isCore ? (yearly ? plan.priceYearly! : plan.price) : plan.price;
          const per = plan.isCore ? (yearly ? plan.perYearly! : plan.per) : plan.per;

          return (
            <div key={plan.id} style={{
              borderRadius: 14, padding: 24, position: "relative",
              background: plan.isCore ? "#FF6B35" : plan.isCurrent ? "#f9f9f7" : "#fff",
              border: plan.isCurrent ? "2px solid #e5e5e3" : plan.isCore ? "none" : "1.5px solid #e5e5e3",
              display: "flex", flexDirection: "column",
            }}>
              {plan.isCore && (
                <div style={{ position: "absolute", top: 16, right: 16, background: "#fff", color: "#FF6B35", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>
                  ★ BEST VALUE
                </div>
              )}
              {plan.isCurrent && (
                <div style={{ display: "inline-flex", alignSelf: "flex-start", background: "#f1f1ee", border: "1px solid #e5e5e3", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: "#6b6b78", marginBottom: 12 }}>
                  Current plan
                </div>
              )}

              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: plan.isCore ? "rgba(255,255,255,0.7)" : "#9090a0", marginBottom: 8 }}>
                {plan.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: plan.isCore ? "#fff" : "#0f0f10" }}>{price}</span>
                {per && <span style={{ fontSize: 13, color: plan.isCore ? "rgba(255,255,255,0.7)" : "#9090a0" }}>{per}</span>}
              </div>
              {plan.isCore && plan.subPrice && (
                <div style={{ marginBottom: 12 }}>{plan.subPrice(yearly)}</div>
              )}
              {plan.desc && <div style={{ fontSize: 12, color: plan.isCore ? "rgba(255,255,255,0.8)" : "#6b6b78", marginBottom: 12 }}>{plan.desc}</div>}
              <p style={{ fontSize: 12, color: plan.isCore ? "rgba(255,255,255,0.85)" : "#3a3a45", lineHeight: 1.55, margin: "0 0 16px" }}>{plan.bodyText}</p>

              {plan.isCore && (
                <div style={{ background: "#0f0f10", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>★ CORE EXCLUSIVES</div>
                  {[
                    { title: "Founder CRM", desc: "See exactly who upvoted or followed your product." },
                    { title: "Hall of Fame Placement", desc: "Permanent evergreen visibility." },
                  ].map((ex) => (
                    <div key={ex.title} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{ex.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>{ex.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {plan.featuresHeader && (
                <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: plan.isCore ? "rgba(255,255,255,0.5)" : "#9090a0", marginBottom: 10 }}>
                  {plan.featuresHeader}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <Check dark={plan.isCore} />
                    <span style={{ fontSize: 12, color: plan.isCore ? "rgba(255,255,255,0.9)" : "#3a3a45", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.isCurrent ? (
                <button disabled style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "1.5px solid #e5e5e3", background: "#f1f1ee", fontSize: 13, fontWeight: 700, color: "#9090a0", cursor: "default", fontFamily: "inherit" }}>
                  Current plan
                </button>
              ) : plan.isCore ? (
                <Link href={plan.ctaHref} style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "none", background: "#fff", fontSize: 13, fontWeight: 700, color: "#FF6B35", cursor: "pointer", fontFamily: "inherit" }}>
                    {plan.cta}
                  </button>
                </Link>
              ) : (
                <Link href={plan.ctaHref} style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "1.5px solid #FF6B35", background: "transparent", fontSize: 13, fontWeight: 700, color: "#FF6B35", cursor: "pointer", fontFamily: "inherit" }}>
                    {plan.cta}
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e3", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "#f9f9f7", borderBottom: "1px solid #e5e5e3" }}>
          <div style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Feature</div>
          {["Free", "Basic", "Core"].map((t) => (
            <div key={t} style={{ padding: "12px 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: t === "Core" ? "#FF6B35" : "#9090a0", textAlign: "center", borderLeft: "1px solid #e5e5e3" }}>
              {t}
            </div>
          ))}
        </div>
        {COMPARISON.map((row, i) => (
          <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderTop: "1px solid #f5f5f3" }}>
            <div style={{ padding: "11px 20px", fontSize: 12.5, color: "#3a3a45" }}>{row.feature}</div>
            {[row.free, row.basic, row.core].map((val, j) => (
              <div key={j} style={{ padding: "11px 12px", textAlign: "center", borderLeft: "1px solid #f5f5f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {val === "✓" ? (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(0,184,122,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11" /></svg>
                  </div>
                ) : val === "—" ? (
                  <span style={{ color: "#CFCFD4", fontWeight: 700 }}>—</span>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 600, color: j === 2 && (val === "Unlimited" || val === "Weekly") ? "#FF6B35" : "#3a3a45" }}>{val}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
