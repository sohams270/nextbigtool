"use client";

import Link from "next/link";

export type GatedFeature = "crm" | "blog" | "hof" | "bip";

const FEATURES: Record<GatedFeature, {
  emoji: string;
  title: string;
  tagline: string;
  benefits: string[];
}> = {
  bip: {
    emoji: "📢",
    title: "Build in Public",
    tagline: "You've used all 5 free posts. Keep the momentum going.",
    benefits: [
      "Unlimited Build in Public posts on Core",
      "Posts surface in the global Activity Feed on the homepage",
      "Milestone, launch, funding & update post types",
      "Post performance stats — likes, comments, top tags",
    ],
  },
  crm: {
    emoji: "👥",
    title: "Founder's CRM",
    tagline: "Know exactly who wants your product — and reach out.",
    benefits: [
      "Name, email, company & role of every upvoter",
      "Filter & sort by tool, date, or company",
      "Export all leads as CSV or Excel",
      "New leads added automatically as you get upvotes",
    ],
  },
  blog: {
    emoji: "✍️",
    title: "Press Release",
    tagline: "Get a professionally written PR story about your product.",
    benefits: [
      "1 full press release per month, written by our editors",
      "High-authority backlink to your site",
      "Published and distributed on Next Big Tool",
      "Shareable, indexable, and SEO-ready",
    ],
  },
  hof: {
    emoji: "🏆",
    title: "Hall of Fame",
    tagline: "Permanent showcase placement — no expiry, ever.",
    benefits: [
      "Listed in the Hall of Fame section on the homepage",
      "Gold HoF badge on your product listing page",
      "Featured on the dedicated /discover Hall of Fame page",
      "Priority placement in newsletter features",
    ],
  },
};

export default function UpgradeModal({
  feature,
  onClose,
}: {
  feature: GatedFeature;
  onClose: () => void;
}) {
  const f = FEATURES[feature];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,11,26,0.65)",
          zIndex: 2000,
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal card */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2001,
        width: "min(92vw, 440px)",
        background: "#111118",
        border: "1.5px solid rgba(255,106,61,0.3)",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
      }}>
        {/* Glow strip */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#ff6a3d,#ff3d88,#a855f7,#ff6a3d)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />

        <style>{`@keyframes shimmer { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }`}</style>

        <div style={{ padding: "28px 28px 24px" }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 28, height: 28, borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)", fontSize: 14,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>

          {/* Icon + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(255,106,61,0.2),rgba(255,61,136,0.2))",
              border: "1px solid rgba(255,106,61,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>{f.emoji}</div>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, background: "linear-gradient(90deg,rgba(255,106,61,0.2),rgba(255,61,136,0.2))", border: "1px solid rgba(255,106,61,0.3)", marginBottom: 4 }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="#ff6a3d" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#ff6a3d", letterSpacing: "0.06em", textTransform: "uppercase" }}>Core feature</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{f.title}</div>
            </div>
          </div>

          {/* Tagline */}
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: "0 0 20px" }}>
            {f.tagline}
          </p>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
            {f.benefits.map(b => (
              <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  background: "rgba(0,184,122,0.15)", border: "1px solid rgba(0,184,122,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11"/></svg>
                </div>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Price note */}
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 18,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Core plan</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
              $29 <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>/mo yearly · $49/mo monthly</span>
            </span>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href="/api/checkout?interval=monthly"
              style={{
                flex: 1, textAlign: "center",
                padding: "11px 0", borderRadius: 11,
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                color: "#fff", fontSize: 13.5, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 18px rgba(255,61,136,0.35)",
              }}
            >
              Upgrade to Core →
            </a>
            <Link
              href="/pricing"
              onClick={onClose}
              style={{
                padding: "11px 16px", borderRadius: 11,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600,
                textDecoration: "none", whiteSpace: "nowrap" as const,
              }}
            >
              Compare plans
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
