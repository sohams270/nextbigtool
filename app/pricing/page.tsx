"use client";

import { useState } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import Link from "next/link";

/* ─── Toggle ──────────────────────────────────────────────────────────── */
function Toggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 48 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: yearly ? "var(--ink-muted)" : "var(--ink)" }}>Monthly</span>
      <button
        onClick={() => onChange(!yearly)}
        style={{
          width: 48, height: 26, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
          background: "#FF6B35", position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
        aria-label="Toggle billing period"
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: yearly ? "calc(100% - 23px)" : 3,
          transition: "left 0.2s",
        }} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 600, color: yearly ? "var(--ink)" : "var(--ink-muted)" }}>Yearly</span>
      <span style={{
        background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 700,
        padding: "3px 10px", borderRadius: 999, letterSpacing: "0.01em",
      }}>Save 41%</span>
    </div>
  );
}

/* ─── Check icon ──────────────────────────────────────────────────────── */
function Check({ dark }: { dark?: boolean }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
      background: dark ? "rgba(255,255,255,0.15)" : "rgba(0,184,122,0.12)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#00B87A"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-11" />
      </svg>
    </div>
  );
}

/* ─── Table check / dash ──────────────────────────────────────────────── */
function TCheck() {
  return (
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,184,122,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-11" />
      </svg>
    </div>
  );
}
function TDash() {
  return <span style={{ color: "#CFCFD4", fontWeight: 700, fontSize: 16, display: "block", textAlign: "center" }}>—</span>;
}

/* ─── FAQ Accordion ───────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Is the Free plan really free forever?",
    a: "Yes. No credit card required, no trial period. Your product listing stays live permanently on the Free plan.",
  },
  {
    q: "What exactly is the Founder CRM?",
    a: "When someone upvotes or follows your product, you see their name, profile, and can send one follow-up message. Users opt in to this at the point of engagement — so the data is clean and consent-based.",
  },
  {
    q: "What is Hall of Fame placement?",
    a: "The Hall of Fame is a dedicated section showcasing the best products on the platform. Unlike the trending feed which resets, Hall of Fame is permanent — giving you evergreen visibility that compounds over time.",
  },
  {
    q: "Can I switch between monthly and yearly on Core?",
    a: "Yes. Start monthly at $49/month and switch to yearly at $29/month anytime. Savings apply immediately to your next billing cycle.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", margin: "0 0 32px", color: "var(--ink)" }}>Common questions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{ border: "1px solid #e5e5e3", borderRadius: 12, overflow: "hidden" }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%", background: open === i ? "var(--surface-alt)" : "var(--surface)", border: "none",
                padding: "20px 20px", display: "flex", justifyContent: "space-between",
                alignItems: "center", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", paddingRight: 16 }}>{item.q}</span>
              <span style={{ fontSize: 16, color: "var(--ink-muted)", flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 20px", background: "var(--surface-alt)" }}>
                <p style={{ fontSize: 13, color: "#6b6b78", lineHeight: 1.65, margin: 0 }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────── */
export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const corePrice = yearly ? "$29" : "$49";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
      <TopNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 80px", width: "100%" }}>

        {/* ── Toggle ── */}
        <Toggle yearly={yearly} onChange={setYearly} />

        {/* ── Section header ── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-muted)", marginBottom: 12 }}>PLANS &amp; PRICING</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--ink)", margin: "0 0 14px" }}>The right plan for every stage</h1>
          <p style={{ fontSize: 16, color: "#6b6b78", margin: 0 }}>From your first launch to building serious traction.</p>
        </div>

        {/* ── Two pricing cards ── */}
        <div className="pricing-grid r-grid-2" style={{ gap: 20, marginBottom: 24, alignItems: "start", maxWidth: 780, margin: "0 auto 24px" }}>

          {/* FREE */}
          <div style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-muted)", marginBottom: 10 }}>FREE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--ink)" }}>$0</span>
            </div>
            <div style={{ fontSize: 13, color: "#6b6b78", marginBottom: 16 }}>Forever free. No credit card needed.</div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 24, margin: "0 0 24px" }}>
              Perfect for exploring the platform and sharing your first product with the world.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {["List 1 product", "Lifetime free listing", "High authority backlink", "5 posts on Build in Public wall", "Basic analytics (upvotes + comments)"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check />
                  <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1.5px solid var(--border)", background: "transparent", fontSize: 14, fontWeight: 700, color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit" }}>
                Get Started Free
              </button>
            </Link>
          </div>

          {/* CORE */}
          <div style={{ background: "#FF6B35", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Best value badge */}
            <div style={{ position: "absolute", top: 20, right: 20, background: "#fff", color: "#FF6B35", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999 }}>
              ★ BEST VALUE
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>CORE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>{corePrice}</span>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>/month</span>
            </div>
            <div style={{ fontSize: 13, color: "#d1fae5", fontWeight: 600, marginBottom: 16 }}>
              {yearly
                ? "Billed as $348/year"
                : "Or $29/month billed yearly — save $240/year."}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: "0 0 20px" }}>
              For serious builders turning discovery into real pipeline and traction.
            </p>

            {/* Core exclusives dark panel */}
            <div style={{ background: "#0f0f10", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>★ CORE EXCLUSIVES</div>
              {[
                { title: "Founder CRM", desc: "See exactly who upvoted or followed your product. Turn interest into pipeline." },
                { title: "Hall of Fame Placement", desc: "Permanent evergreen visibility that compounds over time." },
                { title: "1 Press Release", desc: "A professionally written press release published about your product." },
              ].map((ex) => (
                <div key={ex.title} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{ex.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{ex.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>EVERYTHING IN FREE, PLUS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, flex: 1 }}>
              {["Unlimited product listings", "Unlimited Build in Public posts", "CSV export of your data"].map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check dark />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.45 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/auth/login" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "#fff", fontSize: 14, fontWeight: 700, color: "#FF6B35", cursor: "pointer", fontFamily: "inherit" }}>
                Upgrade to Core →
              </button>
            </Link>
          </div>
        </div>

        {/* ── Guarantee ── */}
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ink-muted)", marginBottom: 72 }}>
          All plans include a 7-day money-back guarantee.{" "}
          <span style={{ margin: "0 8px" }}>·</span>
          <Link href="/contact" style={{ color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>Questions? Chat with us →</Link>
        </div>

        {/* ── Comparison table ── */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 6px" }}>Compare plans in detail</h2>
          <p style={{ fontSize: 14, color: "#6b6b78", margin: "0 0 28px" }}>See exactly what you get with each plan, side by side.</p>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderBottom: "2px solid #e5e5e3" }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>All plans compared</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Full feature breakdown</div>
              </div>
              {/* FREE col header */}
              <div style={{ padding: "20px 16px", borderLeft: "1px solid #e5e5e3", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>FREE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.03em", marginBottom: 2 }}>$0</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 12 }}>forever</div>
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit" }}>
                    Get Started
                  </button>
                </Link>
              </div>
              {/* CORE col header */}
              <div style={{ padding: "20px 16px", borderLeft: "1px solid #e5e5e3", textAlign: "center", background: "rgba(255,107,53,0.05)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF6B35", marginBottom: 4 }}>CORE</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.03em", marginBottom: 2 }}>{corePrice}</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 12 }}>/month · unlimited</div>
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "none", background: "#FF6B35", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                    Start Core
                  </button>
                </Link>
              </div>
            </div>

            {/* Rows */}
            {[
              {
                section: "LISTING",
                rows: [
                  { feature: "Products listed", sub: null, free: "1", core: <span style={{ color: "#FF6B35", fontWeight: 800 }}>Unlimited</span> },
                  { feature: "Lifetime free listing", sub: null, free: <TCheck />, core: <TCheck /> },
                  { feature: "High authority backlink", sub: null, free: <TCheck />, core: <TCheck /> },
                ],
              },
              {
                section: "DISCOVERY & VISIBILITY",
                rows: [
                  { feature: <span><span style={{ color: "#FF6B35" }}>★ </span>Hall of Fame placement</span>, sub: "Evergreen discoverability by everyone", free: <TDash />, core: <TCheck /> },
                ],
              },
              {
                section: "BUILD IN PUBLIC WALL",
                rows: [
                  { feature: "Posts on Build in Public wall", sub: null, free: "5 posts", core: <span style={{ color: "#FF6B35", fontWeight: 800 }}>Unlimited</span> },
                ],
              },
              {
                section: "FOUNDER CRM",
                sectionColor: "#FF6B35",
                rows: [
                  { feature: <span style={{ color: "#FF6B35" }}>★ Complete data of who upvoted or interacted with your product</span>, sub: "Names, email ID, Company name, Designation", free: <TDash />, core: <TCheck /> },
                ],
              },
              {
                section: "PRESS RELEASE",
                sectionColor: "#FF6B35",
                rows: [
                  { feature: <span style={{ color: "#FF6B35" }}>★ 1 Press Release written about your tool (Customizable)</span>, sub: "Published and distributed professionally", free: <TDash />, core: <TCheck /> },
                ],
              },
              {
                section: "ANALYTICS & DATA",
                rows: [
                  { feature: "Basic analytics", sub: "Upvotes and comments", free: <TCheck />, core: <TCheck /> },
                  { feature: "CSV data export", sub: null, free: <TDash />, core: <TCheck /> },
                ],
              },
            ].map((group, gi) => (
              <div key={gi}>
                {/* Section header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: "#f9f9f7", borderTop: "1px solid #e5e5e3" }}>
                  <div style={{ padding: "10px 24px", gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: group.sectionColor || "#6b6b78" }}>
                      {group.section}
                    </span>
                  </div>
                </div>
                {/* Feature rows */}
                {group.rows.map((row, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderTop: "1px solid var(--border-faint)" }}>
                    <div style={{ padding: "14px 24px" }}>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{row.feature}</div>
                      {row.sub && <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>{row.sub}</div>}
                    </div>
                    <div style={{ padding: "14px 16px", borderLeft: "1px solid var(--border-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {typeof row.free === "string" ? <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{row.free}</span> : row.free}
                    </div>
                    <div style={{ padding: "14px 16px", borderLeft: "1px solid var(--border-faint)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,107,53,0.03)" }}>
                      {typeof row.core === "string" ? <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{row.core}</span> : row.core}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <FaqAccordion />
      </div>
      <Footer />
    </div>
  );
}
