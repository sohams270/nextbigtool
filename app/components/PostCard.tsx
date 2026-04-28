"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "./AuthModal";

/* ── type metadata ──────────────────────────────────────────────────────── */
const TYPE_META: Record<string, { label: string; accent: string; bg: string; bgDark: string }> = {
  milestone: { label: "Milestone", accent: "#FF6B35", bg: "rgba(255,107,53,0.10)", bgDark: "rgba(255,107,53,0.15)" },
  update:    { label: "Update",    accent: "#3B7FFF", bg: "rgba(59,127,255,0.10)", bgDark: "rgba(59,127,255,0.15)" },
  funding:   { label: "Funding",   accent: "#00B87A", bg: "rgba(0,184,122,0.10)", bgDark: "rgba(0,184,122,0.15)" },
  launch:    { label: "Launch",    accent: "#8B5CF6", bg: "rgba(139,92,246,0.10)", bgDark: "rgba(139,92,246,0.15)" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── exported type ──────────────────────────────────────────────────────── */
export type PostRow = {
  id: string;
  type: string;
  content: string;
  metric_label: string | null;
  metric_value: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    username: string | null;
    avatar_url?: string | null;
    company?: string | null;
    role?: string | null;
  } | null;
  tools: { name: string } | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
};

/* ── Avatar helper ──────────────────────────────────────────────────────── */
function AuthorAvatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#FF6B35","#3B7FFF","#00B87A","#8B5CF6","#F59E0B","#EC4899"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const bg = colors[Math.abs(h) % colors.length];

  if (url) {
    return (
      <img
        src={url} alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.35), fontWeight: 700, color: "#fff",
      border: "2px solid var(--border)",
    }}>
      {initials}
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────────── */
export default function PostCard({
  post,
  userId,
  isLiked: initialIsLiked = false,
}: {
  post: PostRow;
  userId: string | null;
  isLiked?: boolean;
}) {
  const [liked, setLiked]               = useState(initialIsLiked);
  const [likesCount, setLikesCount]     = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState<Comment[]>([]);
  const [commentText, setCommentText]   = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsCount, setCommentsCount]   = useState(post.comments_count);
  const [showAuth, setShowAuth]         = useState(false);
  const [likeLoading, setLikeLoading]   = useState(false);
  const [likeAnim, setLikeAnim]         = useState(false);

  const supabase = createClient();
  const meta       = TYPE_META[post.type] ?? TYPE_META.update;
  const authorName = post.profiles?.full_name ?? post.profiles?.username ?? "Founder";
  const avatarUrl  = post.profiles?.avatar_url ?? null;
  const company    = post.profiles?.company ?? null;
  const role       = post.profiles?.role ?? null;
  const byline     = [company, role].filter(Boolean).join(" · ");

  async function handleLike() {
    if (!userId) { setShowAuth(true); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    if (liked) {
      setLiked(false); setLikesCount(n => n - 1);
      await supabase.from("post_likes").delete().match({ user_id: userId, post_id: post.id });
    } else {
      setLiked(true); setLikesCount(n => n + 1);
      await supabase.from("post_likes").insert({ user_id: userId, post_id: post.id });
    }
    setLikeLoading(false);
  }

  async function handleToggleComments() {
    setShowComments(v => !v);
    if (!commentsLoaded) {
      const { data } = await supabase
        .from("post_comments")
        .select("id, content, created_at, profiles(full_name, username)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })
        .limit(20);
      setComments((data ?? []) as unknown as Comment[]);
      setCommentsLoaded(true);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setShowAuth(true); return; }
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    const { data } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, author_id: userId, content: commentText.trim() })
      .select("id, content, created_at, profiles(full_name, username)")
      .single();
    if (data) {
      setComments(prev => [...prev, data as unknown as Comment]);
      setCommentsCount(n => n + 1);
    }
    setCommentText("");
    setCommentLoading(false);
  }

  return (
    <>
      <div className="post-card" style={{
        background: "var(--surface)",
        borderRadius: 14,
        border: "1px solid var(--border)",
        overflow: "hidden",
        transition: "box-shadow 0.18s, transform 0.18s",
        position: "relative",
      }}>
        {/* Type accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: 3, background: meta.accent, borderRadius: "14px 0 0 14px",
          flexShrink: 0,
        }} />

        {/* Main content */}
        <div style={{ padding: "16px 18px 14px 20px" }}>

          {/* Author row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginBottom: 12 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <AuthorAvatar url={avatarUrl} name={authorName} size={40} />
              {/* Live dot */}
              <div className="pulse" style={{
                position: "absolute", bottom: 1, right: 1,
                width: 9, height: 9, borderRadius: "50%",
                background: "#00B87A", border: "2px solid var(--surface)",
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
                  {authorName}
                </span>
                {/* Type badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
                  padding: "2px 8px", borderRadius: 20,
                  background: meta.bg, color: meta.accent,
                  border: `1px solid ${meta.accent}33`,
                }}>
                  {meta.label}
                </span>
                {post.tools && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 600,
                    color: "var(--ink-muted)",
                    background: "var(--surface-alt)",
                    padding: "1px 7px", borderRadius: 20,
                    border: "1px solid var(--border)",
                  }}>
                    {post.tools.name}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                {byline && (
                  <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{byline}</span>
                )}
                {byline && <span style={{ fontSize: 10, color: "var(--border)" }}>·</span>}
                <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Metric callout */}
          {post.metric_label && post.metric_value && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(0,184,122,0.08)",
              border: "1px solid rgba(0,184,122,0.3)",
              borderRadius: 10, padding: "7px 14px",
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#00B87A", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {post.metric_label}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#00B87A", letterSpacing: "-0.02em" }}>
                {post.metric_value}
              </span>
            </div>
          )}

          {/* Content */}
          <p style={{
            fontSize: 13.5, lineHeight: 1.65,
            color: "var(--ink)", margin: 0,
            wordBreak: "break-word" as const,
          }}>
            {post.content}
          </p>
        </div>

        {/* Action bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "10px 18px 12px 20px",
          borderTop: "1px solid var(--border-faint)",
        }}>
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className="post-action-btn"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: liked ? meta.bg : "transparent",
              border: liked ? `1px solid ${meta.accent}44` : "1px solid transparent",
              borderRadius: 8, padding: "5px 10px",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: liked ? meta.accent : "var(--ink-muted)",
              fontFamily: "inherit",
              transform: likeAnim ? "scale(1.18)" : "scale(1)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24"
              fill={liked ? meta.accent : "none"}
              stroke={liked ? meta.accent : "currentColor"}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{likesCount > 0 ? likesCount : ""} {likesCount === 1 ? "like" : likesCount > 1 ? "likes" : "Like"}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleToggleComments}
            className="post-action-btn"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: showComments ? "var(--surface-alt)" : "transparent",
              border: showComments ? "1px solid var(--border)" : "1px solid transparent",
              borderRadius: 8, padding: "5px 10px",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: showComments ? "var(--ink)" : "var(--ink-muted)",
              fontFamily: "inherit", transition: "all 0.15s ease",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{commentsCount > 0 ? commentsCount : ""} {commentsCount === 1 ? "comment" : commentsCount > 1 ? "comments" : "Comment"}</span>
          </button>
        </div>

        {/* Comments drawer */}
        {showComments && (
          <div style={{
            borderTop: "1px solid var(--border-faint)",
            background: "var(--surface-alt)",
            padding: "14px 18px 16px 20px",
          }}>
            {comments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {comments.map((c) => {
                  const cName = c.profiles?.full_name ?? c.profiles?.username ?? "User";
                  return (
                    <div key={c.id} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <AuthorAvatar url={null} name={cName} size={28} />
                      <div style={{
                        flex: 1, background: "var(--surface)",
                        borderRadius: 10, padding: "8px 12px",
                        border: "1px solid var(--border-faint)",
                      }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{cName}</span>
                          <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{timeAgo(c.created_at)}</span>
                        </div>
                        <p style={{ fontSize: 12.5, margin: "4px 0 0", color: "var(--ink)", lineHeight: 1.5 }}>{c.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {comments.length === 0 && commentsLoaded && (
              <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: "0 0 12px" }}>
                No comments yet — be the first to reply.
              </p>
            )}

            <form onSubmit={handleComment} style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  flex: 1, padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 9, fontSize: 12.5,
                  fontFamily: "inherit", outline: "none",
                  background: "var(--surface)", color: "var(--ink)",
                  transition: "border-color 0.15s",
                }}
                placeholder={userId ? "Write a reply…" : "Sign in to comment"}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onFocus={() => { if (!userId) setShowAuth(true); }}
                readOnly={!userId}
              />
              {userId && (
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  style={{
                    padding: "8px 16px",
                    background: commentLoading || !commentText.trim() ? "var(--border)" : "#FF6B35",
                    color: "#fff", border: "none", borderRadius: 9,
                    fontSize: 12, fontWeight: 700,
                    cursor: commentLoading || !commentText.trim() ? "default" : "pointer",
                    fontFamily: "inherit", transition: "background 0.15s",
                  }}
                >
                  Reply
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      <style>{`
        .post-card:hover {
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        @media (prefers-color-scheme: dark) {
          .post-card:hover {
            box-shadow: 0 4px 24px rgba(0,0,0,0.35);
          }
        }
        .post-action-btn:hover {
          background: var(--surface-alt) !important;
          border-color: var(--border) !important;
          color: var(--ink) !important;
        }
      `}</style>
    </>
  );
}
