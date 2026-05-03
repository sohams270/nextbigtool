"use client";

/**
 * ProductShowcase — editorial leaderboard section for the homepage.
 *
 * Layout (matches "Product Showcase.html" design handoff):
 *   • Mosaic featured header  — hero card (left) + 2 mini cards (right)
 *   • Editorial ranked rows   — remaining tools in a ranked list
 *
 * Tool logos: shows <img> from logo_url when the user uploaded one at
 * submission time; falls back to a coloured initial-letter badge.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UpvoteButton from "./UpvoteButton";

/* ─── types ──────────────────────────────────────────────────────────── */
export type ShowcaseTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  website_url: string | null;
  pricing: string;
  upvote_count: number;
  featured: boolean;
  tool_tags: { tags: { name: string } | null }[];
};

export type HofEntry = {
  inducted_at: string | null;
  tool: ShowcaseTool;
};

/* ─── logo colour palette (fallback when no logo_url) ──────────────── */
const LOGO_GRADIENTS = [
  "linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)",
  "linear-gradient(135deg,#ef4444 0%,#f97316 100%)",
  "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)",
  "linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)",
  "linear-gradient(135deg,#0d9488 0%,#14b8a6 100%)",
  "linear-gradient(135deg,#10b981 0%,#059669 100%)",
  "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
  "linear-gradient(135deg,#8b5cf6 0%,#3b82f6 100%)",
];

function logoGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return LOGO_GRADIENTS[Math.abs(h) % LOGO_GRADIENTS.length];
}

/* ─── shared helpers ─────────────────────────────────────────────────── */
function tags(t: ShowcaseTool) {
  return t.tool_tags.map((tt) => tt.tags?.name).filter(Boolean) as string[];
}

function pricing(t: ShowcaseTool) {
  return t.pricing ? t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1) : "Free";
}

/* ─── ProductLogo ────────────────────────────────────────────────────── */
function ProductLogo({
  tool,
  size,
  radius,
}: {
  tool: ShowcaseTool;
  size: number;
  radius: number;
}) {
  const [failed, setFailed] = useState(false);
  const fs = Math.round(size * 0.42);

  // Priority: explicit logo_url → Clearbit from website_url → gradient badge
  let src: string | null = null;
  if (!failed) {
    if (tool.logo_url) {
      src = tool.logo_url;
    } else if (tool.website_url) {
      try {
        const domain = new URL(tool.website_url).hostname.replace(/^www\./, "");
        src = `https://logo.clearbit.com/${domain}`;
      } catch {
        src = null;
      }
    }
  }

  if (src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          flexShrink: 0,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.06)",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: Math.round(size * 0.1),
          boxSizing: "border-box",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${tool.name} logo`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: logoGradient(tool.name),
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: fs,
        letterSpacing: "-0.04em",
        flexShrink: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 1px 2px rgba(0,0,0,.06)",
      }}
    >
      {tool.name[0].toUpperCase()}
    </div>
  );
}

/* ─── chip atoms ─────────────────────────────────────────────────────── */
function CatChip({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 6,
      background: "var(--surface)", color: "var(--ink-2)",
      border: "1px solid var(--border)", letterSpacing: ".01em",
      whiteSpace: "nowrap" as const,
    }}>
      {label}
    </span>
  );
}

function PriceChip({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 600,
      padding: "3px 8px", borderRadius: 6,
      background: "#eaf6ec", color: "#15703f",
      border: "1px solid #cfe9d6",
      whiteSpace: "nowrap" as const,
    }}>
      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 12l5 5 9-11" />
      </svg>
      {label}
    </span>
  );
}

/* ─── icon buttons ───────────────────────────────────────────────────── */
function RedirectBtn({ subtle = false, href }: { subtle?: boolean; href?: string }) {
  const style: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 9,
    background: subtle ? "var(--surface)" : "var(--ink)",
    color: subtle ? "var(--ink)" : "var(--bg)",
    border: subtle ? "1px solid var(--border)" : "none",
    display: "grid", placeItems: "center",
    flexShrink: 0, cursor: "pointer",
    transition: "transform .15s, background .15s",
    textDecoration: "none",
  };
  const inner = (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
  if (href) {
    return <Link href={href} aria-label="View tool details" style={style} target="_blank" rel="noopener noreferrer">{inner}</Link>;
  }
  return <button aria-label="View tool details" style={style}>{inner}</button>;
}

function CommentBtn({ count }: { count: number }) {
  return (
    <button aria-label={`${count} comments`} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "7px 12px", borderRadius: 10,
      background: "var(--surface)", border: "1px solid var(--border)",
      fontWeight: 600, fontSize: 13, color: "var(--ink-muted)",
      cursor: "pointer", fontFamily: "inherit",
      transition: "border-color .15s",
    }}>
      <svg aria-hidden="true" width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
      {count}
    </button>
  );
}


/* ─── BadgeFeatured ──────────────────────────────────────────────────── */
function BadgeFeatured() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10.5, fontWeight: 700,
      padding: "3px 8px", borderRadius: 999,
      background: "linear-gradient(90deg,#ff6a3d 0%,#ff3d88 100%)",
      color: "#fff",
      letterSpacing: ".04em", textTransform: "uppercase" as const,
      boxShadow: "0 2px 8px rgba(255,106,61,.25)",
      whiteSpace: "nowrap" as const,
    }}>
      <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
      </svg>
      Featured
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* HALL OF FAME CARD                                                       */
/* ─────────────────────────────────────────────────────────────────────── */
function HofCard({ entry, rank }: {
  entry: HofEntry; rank: number; userId: string | null; isUpvoted: boolean;
}) {
  const t = tags(entry.tool);
  const meta = t.slice(0, 2).map(s => s.toUpperCase()).join(" · ");

  return (
    <article
      style={{
        background: [
          "linear-gradient(rgba(255,215,0,0.038) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(255,215,0,0.038) 1px, transparent 1px)",
          "linear-gradient(145deg, #0D0E22 0%, #1A0D2E 55%, #0D0E22 100%)",
        ].join(", "),
        backgroundSize: "26px 26px, 26px 26px, 100% 100%",
        border: "1.5px solid rgba(255,215,0,0.35)",
        borderRadius: 16,
        padding: "18px 18px 16px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
        transition: "box-shadow .15s, transform .15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(255,215,0,0.18), 0 2px 16px rgba(0,0,0,0.35)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.35)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Gold top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />

      {/* Corner radial glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 130, height: 130, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,180,0,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Rank watermark */}
      <div style={{ position: "absolute", top: 12, right: 14, fontSize: 10.5, fontWeight: 800, color: "rgba(255,215,0,0.75)", letterSpacing: "0.05em" }}>
        #{String(rank).padStart(2, "0")}
      </div>

      {/* Logo + name + PREMIUM badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10, paddingTop: 6 }}>
        <ProductLogo tool={entry.tool} size={46} radius={11} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const, marginBottom: 3 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              <Link href={`/tools/${entry.tool.slug}`} style={{ color: "#ffffff", textDecoration: "none" }}>{entry.tool.name}</Link>
            </h3>
            <span style={{
              fontSize: 8.5, fontWeight: 800, padding: "2px 6px", borderRadius: 20,
              background: "rgba(255,215,0,0.12)", color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.38)", letterSpacing: "0.07em", textTransform: "uppercase" as const,
            }}>PREMIUM</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {entry.tool.tagline}
          </p>
        </div>
      </div>

      {/* Category meta */}
      {meta && (
        <div style={{ fontSize: 9.5, fontWeight: 600, color: "rgba(255,215,0,0.45)", letterSpacing: "0.07em", marginBottom: 14 }}>
          {meta}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6"/></svg>
          {entry.tool.upvote_count}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
          0
        </div>
        <Link href={`/tools/${entry.tool.slug}`} target="_blank" rel="noopener noreferrer" style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 13px", borderRadius: 8,
          background: "linear-gradient(90deg,rgba(255,215,0,0.16),rgba(255,140,0,0.1))",
          border: "1px solid rgba(255,215,0,0.42)",
          fontSize: 11.5, fontWeight: 700, color: "#FFD700", textDecoration: "none",
        }}>
          Visit
          <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </Link>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MOSAIC FEATURED SECTION                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

function MosaicHero({
  tool, rank, userId, isUpvoted,
}: {
  tool: ShowcaseTool; rank: number; userId: string | null; isUpvoted: boolean;
}) {
  const t = tags(tool);
  return (
    <article style={{
      background: "var(--surface)",
      border: "1.5px solid transparent",
      backgroundImage: "linear-gradient(var(--surface),var(--surface)), linear-gradient(135deg,#ff6a3d,#ff3d88)",
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
      borderRadius: 18,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 1px 0 rgba(15,15,16,.03), 0 14px 36px rgba(255,106,61,.10)",
    }}>
      {/* Gradient art strip */}
      <div style={{
        height: 8,
        background: "linear-gradient(90deg,#ff6a3d 0%,#ff3d88 100%)",
        flexShrink: 0,
      }} />

      {/* Body */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <ProductLogo tool={tool} size={64} radius={16} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
                {tool.name}
              </h3>
              <BadgeFeatured />
              <RedirectBtn href={`/tools/${tool.slug}`} />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-muted)", fontWeight: 500 }}>
              #{rank} · {pricing(tool)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)",
          margin: 0, flex: 1,
        }}>
          {tool.tagline}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {t.slice(0, 3).map((c) => <CatChip key={c} label={c} />)}
          <PriceChip label={pricing(tool)} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <UpvoteButton
            toolId={tool.id}
            userId={userId}
            initialCount={tool.upvote_count}
            initialActive={isUpvoted}
            size="md"
          />
          <CommentBtn count={0} />
        </div>
      </div>
    </article>
  );
}

function MosaicMini({
  tool, rank, userId, isUpvoted,
}: {
  tool: ShowcaseTool; rank: number; userId: string | null; isUpvoted: boolean;
}) {
  const t = tags(tool);
  return (
    <article className="showcase-mini" style={{
      display: "grid",
      gridTemplateColumns: "28px 44px 1fr auto",
      gap: 12,
      alignItems: "center",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "14px 16px",
      transition: "border-color .15s, transform .15s",
    }}>
      {/* Rank */}
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 22, fontWeight: 800,
        letterSpacing: "-0.04em",
        color: "var(--ink)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {String(rank).padStart(2, "0")}
      </span>

      <ProductLogo tool={tool} size={44} radius={11} />

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--ink)", margin: 0 }}>
            {tool.name}
          </h4>
        </div>
        <p style={{
          fontSize: 12.5, color: "var(--ink-muted)", margin: "2px 0 6px",
          lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
        }}>
          {tool.tagline}
        </p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
          {t.slice(0, 2).map((c) => <CatChip key={c} label={c} />)}
          <PriceChip label={pricing(tool)} />
        </div>
      </div>

      {/* Stats */}
      <div className="showcase-stats" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <UpvoteButton
          toolId={tool.id}
          userId={userId}
          initialCount={tool.upvote_count}
          initialActive={isUpvoted}
          size="sm"
        />
        <span className="showcase-comment-btn"><CommentBtn count={0} /></span>
        <span className="showcase-redirect-btn"><RedirectBtn subtle href={`/tools/${tool.slug}`} /></span>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* RANKED ROW                                                              */
/* ─────────────────────────────────────────────────────────────────────── */
function RankedRow({
  tool, rank, userId, isUpvoted, compact = false,
}: {
  tool: ShowcaseTool; rank: number; userId: string | null; isUpvoted: boolean; compact?: boolean;
}) {
  const t = tags(tool);
  const router = useRouter();

  if (compact) {
    return (
      <li
        className="showcase-ranked-row-compact"
        onClick={() => router.push(`/tools/${tool.slug}`)}
        style={{
          display: "grid",
          gridTemplateColumns: "40px 36px 1fr auto",
          gap: 12,
          alignItems: "center",
          padding: "9px 16px",
          borderBottom: "1px solid var(--border)",
          transition: "background .15s",
          cursor: "pointer",
        }}
      >
        {/* Rank + trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 17, fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}>
            {String(rank).padStart(2, "0")}
          </span>
        </div>

        <ProductLogo tool={tool} size={36} radius={9} />

        {/* Body — name + single tag row, no description */}
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px" }}>
            <Link href={`/tools/${tool.slug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{tool.name}</Link>
          </h4>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
            {t.slice(0, 2).map((c) => <CatChip key={c} label={c} />)}
            <PriceChip label={pricing(tool)} />
          </div>
        </div>

        {/* Stats */}
        <div className="showcase-stats" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div onClick={(e) => e.stopPropagation()}>
            <UpvoteButton
              toolId={tool.id}
              userId={userId}
              initialCount={tool.upvote_count}
              initialActive={isUpvoted}
              size="sm"
            />
          </div>
          <span className="showcase-redirect-btn"><RedirectBtn subtle href={`/tools/${tool.slug}`} /></span>
        </div>
      </li>
    );
  }

  return (
    <li
      className="showcase-ranked-row"
      onClick={() => router.push(`/tools/${tool.slug}`)}
      style={{
        display: "grid",
        gridTemplateColumns: "56px 52px 1fr auto",
        gap: 18,
        alignItems: "center",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        transition: "background .15s",
        cursor: "pointer",
      }}
    >
      {/* Rank + trend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 26, fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--ink)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 0.9,
        }}>
          {String(rank).padStart(2, "0")}
        </span>
      </div>

      <ProductLogo tool={tool} size={48} radius={12} />

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" as const, marginBottom: 2 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>
            <Link href={`/tools/${tool.slug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{tool.name}</Link>
          </h4>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "4px 0 8px", lineHeight: 1.45 }}>
          {tool.tagline}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {t.slice(0, 3).map((c) => <CatChip key={c} label={c} />)}
          <PriceChip label={pricing(tool)} />
        </div>
      </div>

      {/* Stats */}
      <div className="showcase-stats" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="showcase-comment-btn"><CommentBtn count={0} /></span>
        <div onClick={(e) => e.stopPropagation()}>
          <UpvoteButton
            toolId={tool.id}
            userId={userId}
            initialCount={tool.upvote_count}
            initialActive={isUpvoted}
            size="sm"
          />
        </div>
        <span className="showcase-redirect-btn"><RedirectBtn subtle href={`/tools/${tool.slug}`} /></span>
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MAIN EXPORT                                                             */
/* ─────────────────────────────────────────────────────────────────────── */
export default function ProductShowcase({
  tools,
  userId,
  userUpvotedIds,
  hofEntries = [],
  sort = "trending",
  price = "all",
}: {
  tools: ShowcaseTool[];
  userId: string | null;
  userUpvotedIds: string[];
  hofEntries?: HofEntry[];
  sort?: string;
  price?: string;
}) {
  if (tools.length === 0 && hofEntries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-muted)", fontSize: 14 }}>
        No tools yet — be the first to submit yours!
      </div>
    );
  }

  const [hero, mini1, mini2, ...rest] = tools;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Hall of Fame section ─────────────────────────────────── */}
      {hofEntries.length > 0 && (
        <div>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ marginBottom: 6 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.07em",
                  textTransform: "uppercase" as const,
                  padding: "3px 10px", borderRadius: 20,
                  background: "rgba(255,215,0,0.15)", color: "#9a6a00",
                  border: "1px solid rgba(255,215,0,0.35)",
                }}>
                  🏆 All-Time Greats
                </span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)", margin: 0 }}>
                Hall of Fame
              </h2>
            </div>
            <Link href="/discover?tab=hall-of-fame" style={{ fontSize: 12.5, fontWeight: 600, color: "#ff6a3d", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {/* 3-col gold grid */}
          <div className="showcase-hof-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {hofEntries.slice(0, 3).map((entry, i) => (
              <HofCard
                key={entry.tool.id}
                entry={entry}
                rank={i + 1}
                userId={userId}
                isUpvoted={userUpvotedIds.includes(entry.tool.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Featured Tools section ───────────────────────────────── */}
      {tools.length > 0 && (
        <div>
          {/* Section header */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            gap: 24, padding: "0 4px 14px",
            borderBottom: "1px solid var(--border)", flexWrap: "wrap" as const, marginBottom: 16,
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontSize: 11, fontWeight: 600, color: "var(--ink-2)",
                letterSpacing: ".06em", textTransform: "uppercase" as const, marginBottom: 8,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#16a34a",
                  display: "inline-block", animation: "nbt-pulse 2s infinite",
                }} />
                Live ranking · updated just now
              </div>
              <h2 style={{
                fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em",
                lineHeight: 1.05, color: "var(--ink)", margin: 0,
              }}>
                {sort === "new"
                  ? price === "free" ? "Free Tools Added Today"
                  : price === "freemium" ? "Freemium Tools Added Today"
                  : price === "paid" ? "Paid Tools Added Today"
                  : "New Tool Additions"
                  : sort === "top"
                  ? price === "free" ? "Top Free Tools"
                  : price === "freemium" ? "Top Freemium Tools"
                  : price === "paid" ? "Top Paid Tools"
                  : "Top Voted Tools"
                  : price === "free" ? "Best Free Tools"
                  : price === "freemium" ? "Best Freemium Tools"
                  : price === "paid" ? "Best Paid Tools"
                  : "Featured Tools"}
              </h2>
              <p style={{ margin: "6px 0 0", color: "var(--ink-muted)", fontSize: 13 }}>
                {sort === "new"
                  ? price === "free" ? "The latest free indie tools — no credit card, no catch"
                  : price === "freemium" ? "The latest freemium tools — start free, upgrade when ready"
                  : price === "paid" ? "The latest paid tools added to the platform"
                  : "The latest indie tools added to the platform"
                  : sort === "top"
                  ? price === "free" ? "The highest-upvoted free tools, ranked by the community"
                  : price === "freemium" ? "The highest-upvoted freemium tools, ranked by the community"
                  : price === "paid" ? "The highest-upvoted paid tools, ranked by the community"
                  : "The highest-upvoted tools of all time, ranked by the community"
                  : price === "free" ? "Discover the best free tools — handpicked and ranked by builders"
                  : price === "freemium" ? "Freemium tools worth trying — start for free, scale as you grow"
                  : price === "paid" ? "Premium tools builders are betting on — tried, tested, upvoted"
                  : "Hand-picked tools, ranked by builders"}
              </p>
            </div>
            <div style={{ display: "inline-flex", padding: 3, background: "var(--surface-alt)", borderRadius: 10, gap: 2 }}>
              {["Today", "Week", "Month"].map((label, i) => (
                <button key={label} style={{
                  fontSize: 12, padding: "6px 12px", borderRadius: 8,
                  color: i === 0 ? "var(--ink)" : "var(--ink-muted)",
                  fontWeight: 600,
                  background: i === 0 ? "var(--surface)" : "transparent",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,.06)" : "none",
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Ranked list — same layout as Trending */}
          <ol style={{
            display: "flex", flexDirection: "column", gap: 0,
            border: "1px solid var(--border)", borderRadius: 16,
            background: "var(--surface)", overflow: "hidden",
            listStyle: "none", margin: 0, padding: 0,
          }}>
            {[hero, mini1, mini2].filter((t): t is ShowcaseTool => !!t).map((t, i) => (
              <RankedRow
                key={t.id} tool={t} rank={i + 1}
                userId={userId} isUpvoted={userUpvotedIds.includes(t.id)}
              />
            ))}
          </ol>
        </div>
      )}

      {/* ── Trending This Week ───────────────────────────────────── */}
      {rest.length > 0 && (
        <div>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, fontWeight: 700, color: "#16a34a",
                letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                Trending This Week
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
                Climbing the charts
              </h3>
            </div>
            <Link href="/discover/categories" style={{ fontSize: 12.5, fontWeight: 600, color: "#ff6a3d", textDecoration: "none" }}>
              See all →
            </Link>
          </div>

          {/* Compact ranked rows — up to 10 */}
          <ol style={{
            display: "flex", flexDirection: "column", gap: 0,
            border: "1px solid var(--border)", borderRadius: 16,
            background: "var(--surface)", overflow: "hidden",
            listStyle: "none", margin: 0, padding: 0,
          }}>
            {rest.slice(0, 10).map((t, i) => (
              <RankedRow
                key={t.id} tool={t} rank={i + 4}
                userId={userId} isUpvoted={userUpvotedIds.includes(t.id)}
                compact
              />
            ))}
            <style>{`ol li:last-child { border-bottom: none !important; }`}</style>
          </ol>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 8px" }}>
        <Link href="/discover/categories" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 24px", borderRadius: 999,
          background: "var(--ink)", color: "var(--bg)",
          fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>
          See all tools
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <style>{`
        @keyframes nbt-pulse {
          0%{box-shadow:0 0 0 0 rgba(22,163,74,.45)}
          70%{box-shadow:0 0 0 7px rgba(22,163,74,0)}
          100%{box-shadow:0 0 0 0 rgba(22,163,74,0)}
        }
      `}</style>
    </div>
  );
}
