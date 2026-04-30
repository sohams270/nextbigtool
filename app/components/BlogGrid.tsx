"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS, type BlogPost } from "../lib/blog-posts";

const PAGE_SIZE = 6;

/* ── per-category palette ───────────────────────────────────────────────── */
const CAT_META: Record<string, { gradient: string; badge: string; text: string }> = {
  Growth:     { gradient: "linear-gradient(135deg,#FF6B35 0%,#FF4500 100%)",      badge: "rgba(255,107,53,0.15)",  text: "#FF6B35" },
  Strategy:   { gradient: "linear-gradient(135deg,#3B7FFF 0%,#7C3AED 100%)",      badge: "rgba(59,127,255,0.15)",  text: "#3B7FFF" },
  "AI Tools": { gradient: "linear-gradient(135deg,#00C2FF 0%,#0052CC 100%)",      badge: "rgba(0,194,255,0.15)",   text: "#00C2FF" },
  Comparison: { gradient: "linear-gradient(135deg,#00B875 0%,#059669 100%)",      badge: "rgba(0,184,117,0.15)",   text: "#00B875" },
  Sales:      { gradient: "linear-gradient(135deg,#EC4899 0%,#EF4444 100%)",      badge: "rgba(236,72,153,0.15)",  text: "#EC4899" },
  Launch:     { gradient: "linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)",      badge: "rgba(245,158,11,0.15)",  text: "#F59E0B" },
};
const DEFAULT_META = { gradient: "linear-gradient(135deg,#6B7280,#374151)", badge: "rgba(107,114,128,0.15)", text: "#9CA3AF" };

function catMeta(category: string) { return CAT_META[category] ?? DEFAULT_META; }

/* ── Cover image placeholder ────────────────────────────────────────────── */
function CoverArt({ post, height = 200 }: { post: BlogPost; height?: number }) {
  const meta = catMeta(post.category);
  return (
    <div style={{
      height,
      background: meta.gradient,
      borderRadius: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: height * 0.28,
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* subtle noise overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)",
      }} />
      <span style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>
        {post.coverEmoji}
      </span>
    </div>
  );
}

/* ── Category badge ─────────────────────────────────────────────────────── */
function CatBadge({ category }: { category: string }) {
  const m = catMeta(category);
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.04em",
      background: m.badge,
      color: m.text,
      border: `1px solid ${m.text}30`,
      textTransform: "uppercase",
    }}>
      {category}
    </span>
  );
}

/* ── Featured post (horizontal) ─────────────────────────────────────────── */
function FeaturedCard({ post }: { post: BlogPost }) {
  const m = catMeta(post.category);
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="featured-card" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        transition: "box-shadow .2s, border-color .2s",
        cursor: "pointer",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
          (e.currentTarget as HTMLDivElement).style.borderColor = m.text + "55";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
      >
        {/* Cover */}
        <CoverArt post={post} height={280} />

        {/* Content */}
        <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <CatBadge category={post.category} />
            <span style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 500 }}>Featured Post</span>
          </div>
          <h2 style={{
            fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em",
            color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.3,
          }}>
            {post.title}
          </h2>
          <p style={{
            fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65,
            margin: "0 0 20px",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.excerpt}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: m.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                N
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{post.author}</div>
                <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>{post.date} · {post.readTime} read</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: m.text }}>
              Read article →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Regular post card (vertical) ───────────────────────────────────────── */
function PostCard({ post }: { post: BlogPost }) {
  const m = catMeta(post.category);
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex", flexDirection: "column",
        transition: "box-shadow .2s, border-color .2s, transform .2s",
        cursor: "pointer", height: "100%",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)";
          (e.currentTarget as HTMLDivElement).style.borderColor = m.text + "44";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.transform = "none";
        }}
      >
        {/* Cover image */}
        <CoverArt post={post} height={160} />

        {/* Content */}
        <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
          <CatBadge category={post.category} />
          <h3 style={{
            fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
            color: "var(--ink)", margin: "10px 0 8px", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.title}
          </h3>
          <p style={{
            fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6,
            margin: "0 0 14px", flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.excerpt}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: m.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>N</div>
              <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{post.date} · {post.readTime}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: m.text }}>Read →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Main export ────────────────────────────────────────────────────────── */
export default function BlogGrid() {
  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const rest = BLOG_POSTS.filter((p) => !p.featured);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = rest.slice(0, visible);
  const hasMore = visible < rest.length;

  /* Empty state */
  if (BLOG_POSTS.length === 0) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 28px 120px", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "rgba(255,107,53,0.10)", border: "1px solid rgba(255,107,53,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, margin: "0 auto 18px",
        }}>✍️</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
          First post coming soon
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
          We're working on something worth your time. Check back soon for launch strategies, growth playbooks, and founder lessons.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px 80px", width: "100%" }}>
      {/* Featured */}
      <FeaturedCard post={featured} />

      {/* Section divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "40px 0 24px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>
          Recent Articles
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
          {rest.length} articles
        </span>
      </div>

      {/* Grid */}
      <div className="blog-post-grid" style={{ gap: 20 }}>
        {shown.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>

      {/* View More */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            style={{
              padding: "12px 32px",
              borderRadius: 99,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--ink)",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "background .15s, border-color .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-alt)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B35";
              (e.currentTarget as HTMLButtonElement).style.color = "#FF6B35";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
            }}
          >
            View More Articles ({rest.length - visible} remaining)
          </button>
        </div>
      )}

      {/* All shown */}
      {!hasMore && rest.length > 0 && (
        <p style={{ textAlign: "center", marginTop: 36, fontSize: 12, color: "var(--ink-muted)" }}>
          You've read it all — check back soon for more.
        </p>
      )}
    </div>
  );
}
