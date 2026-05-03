"use client";

import { useState } from "react";
import type { HofEntry } from "./ProductShowcase";

/* ─── gradient palette per rank ─────────────────────────────────────── */
const CARD_GRADIENTS = [
  "linear-gradient(160deg,#B8860B 0%,#DAA520 40%,#8B6914 100%)",   // #1 deep gold
  "linear-gradient(160deg,#6B7280 0%,#9CA3AF 40%,#4B5563 100%)",   // #2 silver
  "linear-gradient(160deg,#92400E 0%,#B45309 40%,#78350F 100%)",   // #3 bronze
  "linear-gradient(160deg,#7C3AED 0%,#A855F7 40%,#5B21B6 100%)",   // rest — purple
  "linear-gradient(160deg,#0369A1 0%,#0EA5E9 40%,#075985 100%)",
  "linear-gradient(160deg,#047857 0%,#10B981 40%,#065F46 100%)",
  "linear-gradient(160deg,#B91C1C 0%,#EF4444 40%,#991B1B 100%)",
  "linear-gradient(160deg,#92400E 0%,#F59E0B 40%,#78350F 100%)",
];
function cardGradient(i: number) { return CARD_GRADIENTS[Math.min(i, CARD_GRADIENTS.length - 1)]; }

function CardLogo({ tool, gradient }: { tool: any; gradient: string }) {
  const [failed, setFailed] = useState(false);
  let src: string | null = null;
  if (!failed) {
    if (tool.logo_url) src = tool.logo_url;
    else if (tool.website_url) {
      try { src = `https://logo.clearbit.com/${new URL(tool.website_url).hostname.replace(/^www\./, "")}`; }
      catch { /* no-op */ }
    }
  }
  return (
    <div style={{
      width: 88, height: 88, borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", padding: 10, boxSizing: "border-box",
      flexShrink: 0,
    }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={() => setFailed(true)} />
      ) : (
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 900, color: "#fff",
        }}>
          {tool.name?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

function HofCard({ entry, rank }: { entry: HofEntry; rank: number }) {
  const t = entry.tool as any;
  const gradient = cardGradient(rank - 1);
  const tagList: string[] = (t.tool_tags ?? []).map((tt: any) => tt.tags?.name).filter(Boolean);
  const pricing = t.pricing ? t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1) : null;
  const inductedDate = entry.inducted_at
    ? new Date(entry.inducted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <a href={`/tools/${t.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          transition: "transform 0.18s, box-shadow 0.18s",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 48px rgba(0,0,0,0.55)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)";
        }}
      >
        {/* ── Top: gradient section with logo ── */}
        <div style={{
          background: gradient,
          padding: "20px 16px 28px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          position: "relative",
        }}>
          {/* INDUCTED badge */}
          <div style={{
            position: "absolute", top: 12, right: 12,
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 99,
            background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
            fontSize: 9, fontWeight: 800, color: "#FFD700",
            letterSpacing: "0.07em", textTransform: "uppercase",
            border: "1px solid rgba(255,215,0,0.4)",
          }}>
            🏆 INDUCTED
          </div>

          {/* Rank badge */}
          <div style={{
            position: "absolute", top: 12, left: 12,
            width: 26, height: 26, borderRadius: "50%",
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            #{rank}
          </div>

          {/* Logo circle */}
          <CardLogo tool={t} gradient={gradient} />
        </div>

        {/* ── Bottom: dark info section ── */}
        <div style={{
          background: "#111118",
          padding: "16px 14px 14px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* Name + tagline */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
              {t.name}
            </div>
            <div style={{
              fontSize: 11.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
            }}>
              {t.tagline}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
            {tagList.slice(0, 2).map((tag: string) => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 500,
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                {tag}
              </span>
            ))}
            {pricing && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: "2px 8px", borderRadius: 6,
                background: "#eaf6ec", color: "#15703f",
                border: "1px solid #cfe9d6",
              }}>
                {pricing}
              </span>
            )}
          </div>

          {/* Upvotes + date */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,215,0,0.85)" }}>
              ▲ {t.upvote_count ?? 0} upvotes
            </span>
            {inductedDate && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{inductedDate}</span>
            )}
          </div>

          {/* CTA button */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "9px 0",
            textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff",
            letterSpacing: "0.01em",
          }}>
            View Product ↗
          </div>
        </div>
      </div>
    </a>
  );
}

export default function HofSortGrid({ entries }: { entries: HofEntry[] }) {
  return (
    <>
      <style>{`
        .hof-sort-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 960px) { .hof-sort-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 680px) { .hof-sort-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 440px) { .hof-sort-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Section header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
            padding: "3px 10px", borderRadius: 20,
            background: "rgba(255,215,0,0.15)", color: "#9a6a00",
            border: "1px solid rgba(255,215,0,0.35)",
          }}>🏆 All-Time Greats</span>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: "0 0 4px" }}>
          Hall of Fame
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-muted)" }}>
          {entries.length} inducted tool{entries.length !== 1 ? "s" : ""} — ranked by induction date
        </p>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-muted)", fontSize: 14 }}>
          No tools inducted yet.
        </div>
      ) : (
        <div className="hof-sort-grid">
          {entries.map((entry, i) => (
            <HofCard key={entry.tool.id} entry={entry} rank={i + 1} />
          ))}
        </div>
      )}
    </>
  );
}
