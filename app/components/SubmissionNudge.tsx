/**
 * SubmissionNudge — shown above the homepage feed for signed-in founders.
 * Displays each of the user's products (pending or live) with today's upvote
 * count and a direct link to the product page or dashboard.
 *
 * Rendered as a pure server component — receives pre-fetched data from page.tsx.
 */

import Link from "next/link";
import ToolLogoImg from "./ToolLogoImg";

export type NudgeSubmission = {
  id: string;
  name: string;
  slug: string;
  status: string;
  upvote_count: number;
  logo_url: string | null;
  todayUpvotes: number;
};

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

function StatusBadge({ status }: { status: string }) {
  const isLive = status === "approved";
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 999,
      background: isLive ? "rgba(0,184,122,0.12)" : "rgba(245,158,11,0.12)",
      color: isLive ? "#00B87A" : "#b45309",
      letterSpacing: "0.02em",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    }}>
      {isLive ? "● Live" : "⏳ Pending review"}
    </span>
  );
}

function ProductLogo({ sub }: { sub: NudgeSubmission }) {
  if (sub.logo_url) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 8, overflow: "hidden",
        flexShrink: 0, border: "1px solid rgba(0,0,0,0.06)",
        background: "var(--surface-alt)",
      }}>
        <ToolLogoImg src={sub.logo_url} alt={`${sub.name} logo`} size={32} />
      </div>
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
      background: logoGradient(sub.name),
      display: "grid", placeItems: "center",
      color: "#fff", fontWeight: 800, fontSize: 14,
      letterSpacing: "-0.04em",
    }}>
      {sub.name[0].toUpperCase()}
    </div>
  );
}

function SubmissionRow({ sub }: { sub: NudgeSubmission }) {
  const isLive = sub.status === "approved";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 10,
      background: "var(--surface)",
      border: "1px solid var(--border-faint)",
    }}>
      <ProductLogo sub={sub} />

      {/* Name + status */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "var(--ink)",
          whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {sub.name}
        </span>
        <StatusBadge status={sub.status} />
      </div>

      {/* Upvote stats — only shown for live products */}
      {isLive && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, color: "var(--ink-muted)",
          whiteSpace: "nowrap" as const, flexShrink: 0,
        }}>
          <svg width={10} height={10} viewBox="0 0 12 12" fill="#FF6B35">
            <path d="M6 2L10 8H2L6 2Z" />
          </svg>
          <span style={{ fontWeight: 700, color: "var(--ink)" }}>{sub.todayUpvotes}</span>
          <span>today</span>
          <span style={{ color: "var(--border)", margin: "0 1px" }}>·</span>
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>{sub.upvote_count}</span>
          <span>total</span>
        </div>
      )}

      {/* CTA */}
      <Link
        href={isLive ? `/tools/${sub.slug}` : "/dashboard/products"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 700, color: "#FF6B35",
          textDecoration: "none", whiteSpace: "nowrap" as const,
          padding: "5px 10px", borderRadius: 7,
          border: "1px solid rgba(255,107,53,0.25)",
          background: "rgba(255,107,53,0.06)",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        {isLive ? "View live →" : "Track status →"}
      </Link>
    </div>
  );
}

export default function SubmissionNudge({ submissions }: { submissions: NudgeSubmission[] }) {
  if (submissions.length === 0) return null;

  const liveCount = submissions.filter((s) => s.status === "approved").length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const summaryParts: string[] = [];
  if (liveCount > 0) summaryParts.push(`${liveCount} live`);
  if (pendingCount > 0) summaryParts.push(`${pendingCount} pending review`);

  return (
    <div style={{
      borderRadius: 12,
      background: "linear-gradient(135deg, rgba(255,107,53,0.04) 0%, rgba(255,107,53,0.01) 100%)",
      border: "1px solid rgba(255,107,53,0.2)",
      padding: "12px 14px",
      marginBottom: 16,
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14 }}>🚀</span>
          <span style={{
            fontSize: 11, fontWeight: 800, color: "#FF6B35",
            textTransform: "uppercase" as const, letterSpacing: "0.07em",
          }}>
            Your Products
          </span>
          <span style={{
            fontSize: 10, fontWeight: 500, color: "var(--ink-muted)",
            letterSpacing: "0.01em",
          }}>
            — {summaryParts.join(", ")}
          </span>
        </div>
        <Link
          href="/dashboard"
          style={{
            fontSize: 11, fontWeight: 600,
            color: "var(--ink-muted)", textDecoration: "none",
          }}
        >
          Dashboard →
        </Link>
      </div>

      {/* Product rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {submissions.map((sub) => (
          <SubmissionRow key={sub.id} sub={sub} />
        ))}
      </div>
    </div>
  );
}
