"use client";

import Link from "next/link";
import Logo from "./Logo";
import Pill from "./Pill";
import Upvote from "./Upvote";
import UpvoteButton from "./UpvoteButton";

export default function ProductCard({
  rank,
  name,
  tagline,
  tags,
  votes,
  comments = 0,
  badge,
  badgeColor = "orange",
  featured,
  logoLetter,
  toolId,
  slug,
  userId,
  isUpvoted = false,
}: {
  rank?: string;
  name: string;
  tagline: string;
  tags: string[];
  votes: number;
  comments?: number;
  badge?: string;
  badgeColor?: "orange" | "green";
  featured?: boolean;
  logoLetter?: string;
  toolId?: string;
  slug?: string;
  userId?: string | null;
  isUpvoted?: boolean;
}) {
  const href = slug ? `/tools/${slug}` : toolId ? `/tools/${toolId}` : undefined;

  const card = (
    <div
      className="card-hover"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: featured ? "16px 18px" : "12px 16px",
        border: "none",
        borderRadius: 8,
        background: "#fff",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Rank number */}
      {rank && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#A8A8AD",
            fontFamily: "var(--font-mono, monospace)",
            width: 18,
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {rank.replace("#", "")}
        </span>
      )}

      {/* Logo */}
      <Logo size={featured ? 52 : 42} letter={logoLetter || name[0]} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
          <span className="product-name" style={{ fontSize: featured ? 14 : 13, fontWeight: 700, color: "#1A1A1A", transition: "color 0.15s" }}>{name}</span>
          <svg className="product-redirect-icon" width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          {badge && <Pill color={badgeColor} size="xs">{badge}</Pill>}
        </div>
        <div style={{ fontSize: 11, color: "#6B6B70", fontWeight: 400, marginBottom: 6, lineHeight: 1.4 }}>
          {tagline}
        </div>
        {tags.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#A8A8AD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span style={{ fontSize: 10, color: "#A8A8AD", fontWeight: 500 }}>
              {tags.join(" · ")}
            </span>
          </div>
        )}
      </div>

      {/* Right: comments + upvote */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Comments box */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: featured ? "8px 12px" : "6px 8px",
            border: "1px solid #CFCFD4",
            borderRadius: 6,
            background: "#fff",
            minWidth: featured ? 52 : 40,
          }}
        >
          <svg width={featured ? 12 : 10} height={featured ? 12 : 10} viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontSize: featured ? 12 : 10, fontWeight: 600, color: "#6B6B70" }}>{comments}</span>
        </div>

        {/* Upvote */}
        {toolId !== undefined ? (
          <UpvoteButton
            toolId={toolId}
            userId={userId ?? null}
            initialCount={votes}
            initialActive={isUpvoted}
            size={featured ? "md" : "sm"}
          />
        ) : (
          <Upvote count={votes} active={featured} size={featured ? "md" : "sm"} />
        )}
      </div>
    </div>
  );

  const wrapped = href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      {card}
    </Link>
  ) : card;

  if (featured) {
    return <div className="featured-card-wrap">{wrapped}</div>;
  }
  return <div className="bw-card-wrap">{wrapped}</div>;
}
