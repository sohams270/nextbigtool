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
import Image from "next/image";
import UpvoteButton from "./UpvoteButton";

/* ─── types ──────────────────────────────────────────────────────────── */
export type ShowcaseTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  pricing: string;
  upvote_count: number;
  featured: boolean;
  tool_tags: { tags: { name: string } | null }[];
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
  const fs = Math.round(size * 0.42);

  if (tool.logo_url) {
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
        }}
      >
        <Image
          src={tool.logo_url}
          alt={`${tool.name} logo`}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          unoptimized
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
      background: "#fff", color: "#3a3a3d",
      border: "1px solid #e3e3e0", letterSpacing: ".01em",
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
    background: subtle ? "#fff" : "#0f0f10",
    color: subtle ? "#0f0f10" : "#fff",
    border: subtle ? "1px solid #e3e3e0" : "none",
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
    return <Link href={href} style={style} target="_blank" rel="noopener noreferrer">{inner}</Link>;
  }
  return <button style={style}>{inner}</button>;
}

function CommentBtn({ count }: { count: number }) {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "7px 12px", borderRadius: 10,
      background: "#fff", border: "1px solid #e3e3e0",
      fontWeight: 600, fontSize: 13, color: "#5c5c63",
      cursor: "pointer", fontFamily: "inherit",
      transition: "border-color .15s",
    }}>
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
      {count}
    </button>
  );
}

/* ─── TrendChip ──────────────────────────────────────────────────────── */
function TrendChip({ delta }: { delta: number }) {
  const hot = delta >= 10;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 10.5, fontWeight: 700,
      color: hot ? "#b91c1c" : "#15703f",
      background: hot ? "#fde8e8" : "#eaf6ec",
      padding: "2px 6px", borderRadius: 5,
      letterSpacing: ".02em",
    }}>
      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M6 15l6-6 6 6" />
      </svg>
      +{delta}
    </span>
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
      background: "#fff",
      border: "1.5px solid transparent",
      backgroundImage: "linear-gradient(#fff,#fff), linear-gradient(135deg,#ff6a3d,#ff3d88)",
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
              <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#0f0f10", margin: 0 }}>
                {tool.name}
              </h3>
              <BadgeFeatured />
              <RedirectBtn href={`/tools/${tool.slug}`} />
            </div>
            <div style={{ fontSize: 12.5, color: "#8a8a90", fontWeight: 500 }}>
              #{rank} · {pricing(tool)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 15, lineHeight: 1.6, color: "#3a3a3d",
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
    <article style={{
      display: "grid",
      gridTemplateColumns: "28px 44px 1fr auto",
      gap: 12,
      alignItems: "center",
      background: "#fff",
      border: "1px solid #ececea",
      borderRadius: 14,
      padding: "14px 16px",
      transition: "border-color .15s, transform .15s",
    }}>
      {/* Rank */}
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 22, fontWeight: 800,
        letterSpacing: "-0.04em",
        color: "#0f0f10",
        fontVariantNumeric: "tabular-nums",
      }}>
        {String(rank).padStart(2, "0")}
      </span>

      <ProductLogo tool={tool} size={44} radius={11} />

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "#0f0f10", margin: 0 }}>
            {tool.name}
          </h4>
        </div>
        <p style={{
          fontSize: 12.5, color: "#5c5c63", margin: "2px 0 6px",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        <UpvoteButton
          toolId={tool.id}
          userId={userId}
          initialCount={tool.upvote_count}
          initialActive={isUpvoted}
          size="sm"
        />
        <CommentBtn count={0} />
        <RedirectBtn subtle href={`/tools/${tool.slug}`} />
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* RANKED ROW                                                              */
/* ─────────────────────────────────────────────────────────────────────── */
function RankedRow({
  tool, rank, delta = 0, userId, isUpvoted,
}: {
  tool: ShowcaseTool; rank: number; delta?: number; userId: string | null; isUpvoted: boolean;
}) {
  const t = tags(tool);
  return (
    <li style={{
      display: "grid",
      gridTemplateColumns: "56px 52px 1fr auto",
      gap: 18,
      alignItems: "center",
      padding: "18px 22px",
      borderBottom: "1px solid #ececea",
      transition: "background .15s",
      cursor: "pointer",
    }}>
      {/* Rank + trend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 26, fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "#0f0f10",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 0.9,
        }}>
          {String(rank).padStart(2, "0")}
        </span>
        <TrendChip delta={delta} />
      </div>

      <ProductLogo tool={tool} size={48} radius={12} />

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" as const, marginBottom: 2 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "#0f0f10", margin: 0 }}>
            {tool.name}
          </h4>
        </div>
        <p style={{ fontSize: 13.5, color: "#3a3a3d", margin: "4px 0 8px", lineHeight: 1.45 }}>
          {tool.tagline}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {t.slice(0, 3).map((c) => <CatChip key={c} label={c} />)}
          <PriceChip label={pricing(tool)} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CommentBtn count={0} />
        <UpvoteButton
          toolId={tool.id}
          userId={userId}
          initialCount={tool.upvote_count}
          initialActive={isUpvoted}
          size="sm"
        />
        <RedirectBtn subtle href={`/tools/${tool.slug}`} />
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
}: {
  tools: ShowcaseTool[];
  userId: string | null;
  userUpvotedIds: string[];
}) {
  if (tools.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "64px 0",
        color: "#8a8a90", fontSize: 14,
      }}>
        No tools yet — be the first to submit yours!
      </div>
    );
  }

  // Split: hero + 2 mini cards in mosaic, rest in ranked rows
  const [hero, mini1, mini2, ...rest] = tools;
  const miniCards = [mini1, mini2].filter(Boolean);

  // Synthetic deltas for ranking trend (real data could come from DB later)
  const DELTAS = [24, 18, 12, 9, 7, 5, 4, 3, 2, 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Section header ───────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 24,
        padding: "0 4px 12px",
        borderBottom: "1px solid #e3e3e0",
        flexWrap: "wrap" as const,
      }}>
        <div>
          {/* Live eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11, fontWeight: 600, color: "#3a3a3d",
            letterSpacing: ".06em", textTransform: "uppercase" as const,
            marginBottom: 8,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#16a34a",
              boxShadow: "0 0 0 0 rgba(22,163,74,.5)",
              animation: "pulse 2s infinite",
              display: "inline-block",
            }} />
            Live ranking · updated just now
          </div>
          <h2 style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 30, fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.05,
            color: "#0f0f10", margin: 0,
          }}>
            Today&rsquo;s Top Tools
          </h2>
          <p style={{ margin: "6px 0 0", color: "#8a8a90", fontSize: 13 }}>
            {tools.length} launches · ranked by upvotes
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "inline-flex", padding: 3,
            background: "#ececea", borderRadius: 10, gap: 2,
          }}>
            {["Today", "Week", "Month"].map((label, i) => (
              <button key={label} style={{
                fontSize: 12, padding: "6px 12px", borderRadius: 8,
                color: i === 0 ? "#0f0f10" : "#5c5c63",
                fontWeight: 600,
                background: i === 0 ? "#fff" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,.06)" : "none",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mosaic featured ──────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: miniCards.length > 0 ? "1.5fr 1fr" : "1fr",
        gap: 16,
        alignItems: "stretch",
      }}>
        {/* Hero */}
        {hero && (
          <MosaicHero
            tool={hero}
            rank={1}
            userId={userId}
            isUpvoted={userUpvotedIds.includes(hero.id)}
          />
        )}

        {/* Mini cards stacked right */}
        {miniCards.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {miniCards.map((t, i) => (
              <MosaicMini
                key={t.id}
                tool={t}
                rank={i + 2}
                userId={userId}
                isUpvoted={userUpvotedIds.includes(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Trending sub-header ──────────────────────────────────── */}
      {rest.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 4px 2px",
          marginTop: 4,
        }}>
          <h3 style={{
            fontSize: 18, fontWeight: 800,
            letterSpacing: "-0.01em", color: "#0f0f10",
            margin: 0,
          }}>
            Trending This Week
          </h3>
          <Link href="/discover" style={{
            fontSize: 12.5, fontWeight: 600,
            color: "#ff6a3d", textDecoration: "none",
          }}>
            See all →
          </Link>
        </div>
      )}

      {/* ── Ranked rows ──────────────────────────────────────────── */}
      {rest.length > 0 && (
        <ol style={{
          display: "flex", flexDirection: "column", gap: 0,
          border: "1px solid #ececea", borderRadius: 16,
          background: "#fff", overflow: "hidden",
          listStyle: "none", margin: 0, padding: 0,
        }}>
          {rest.map((t, i) => (
            <RankedRow
              key={t.id}
              tool={t}
              rank={i + 4}
              delta={DELTAS[i + 3] ?? 1}
              userId={userId}
              isUpvoted={userUpvotedIds.includes(t.id)}
            />
          ))}
          {/* Remove bottom border on last row */}
          <style>{`ol li:last-child { border-bottom: none !important; }`}</style>
        </ol>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 8px" }}>
        <Link href="/discover" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 24px", borderRadius: 999,
          background: "#0f0f10", color: "#fff",
          fontSize: 13, fontWeight: 600,
          textDecoration: "none",
          transition: "transform .15s, background .15s",
        }}>
          See all tools
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Pulse keyframe (injected once per page) */}
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
