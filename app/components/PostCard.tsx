"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Avatar from "./Avatar";
import Pill from "./Pill";
import AuthModal from "./AuthModal";

const TYPE_META: Record<string, { label: string; color: "orange" | "blue" | "green" | "dark" }> = {
  milestone: { label: "Milestone", color: "orange" },
  update:    { label: "Update",    color: "blue"   },
  funding:   { label: "Funding",   color: "green"  },
  launch:    { label: "Launch",    color: "green"  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export type PostRow = {
  id: string;
  type: string;
  content: string;
  metric_label: string | null;
  metric_value: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
  tools: { name: string } | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
};

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

  const supabase = createClient();
  const meta = TYPE_META[post.type] ?? TYPE_META.update;
  const authorName = post.profiles?.full_name ?? post.profiles?.username ?? "Founder";
  const initials = authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  async function handleLike() {
    if (!userId) { setShowAuth(true); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      setLiked(false); setLikesCount((n) => n - 1);
      await supabase.from("post_likes").delete().match({ user_id: userId, post_id: post.id });
    } else {
      setLiked(true); setLikesCount((n) => n + 1);
      await supabase.from("post_likes").insert({ user_id: userId, post_id: post.id });
    }
    setLikeLoading(false);
  }

  async function handleToggleComments() {
    setShowComments((v) => !v);
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
      setComments((prev) => [...prev, data as unknown as Comment]);
      setCommentsCount((n) => n + 1);
    }
    setCommentText("");
    setCommentLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "7px 10px",
    border: "1px solid #CFCFD4",
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <>
      <div
        style={{
          background: "#F5F5F5",
          borderRadius: 8,
          border: "1px solid #CFCFD4",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "10px 12px" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00B87A", flexShrink: 0, marginTop: 6 }} className="pulse" />
            <Avatar size={26} letter={initials} color="#0A0B1A" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700 }}>{authorName}</span>
                {post.tools && <span style={{ fontSize: 10, color: "#6B6B70" }}>· {post.tools.name}</span>}
                <Pill color={meta.color} size="xs">{meta.label}</Pill>
                <span style={{ fontSize: 9, color: "#A8A8AD" }}>{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* metric highlight */}
          {post.metric_label && post.metric_value && (
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(0,184,122,0.1)", border: "1px solid #00B87A",
                borderRadius: 6, padding: "5px 10px", margin: "8px 0 6px 16px",
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: "#00B87A", textTransform: "uppercase" }}>{post.metric_label}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#00B87A" }}>{post.metric_value}</span>
            </div>
          )}

          {/* content */}
          <p style={{ fontSize: 10.5, margin: "6px 0 0 16px", color: "#1A1A1A", lineHeight: 1.5 }}>{post.content}</p>

          {/* action bar */}
          <div style={{ display: "flex", gap: 14, marginTop: 10, paddingLeft: 16 }}>
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none", padding: 0,
                cursor: "pointer", fontSize: 11, fontWeight: 600,
                color: liked ? "#FF6B35" : "#6B6B70",
                fontFamily: "inherit",
                opacity: likeLoading ? 0.6 : 1,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill={liked ? "#FF6B35" : "none"} stroke={liked ? "#FF6B35" : "#6B6B70"} strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likesCount}</span>
            </button>

            {/* Comment */}
            <button
              onClick={handleToggleComments}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none", padding: 0,
                cursor: "pointer", fontSize: 11, fontWeight: 600,
                color: showComments ? "#0A0B1A" : "#6B6B70",
                fontFamily: "inherit",
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{commentsCount}</span>
            </button>
          </div>
        </div>

        {/* comments section */}
        {showComments && (
          <div style={{ borderTop: "1px solid #E8E8E8", background: "#fff", padding: "10px 12px" }}>
            {comments.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {comments.map((c) => {
                  const cName = c.profiles?.full_name ?? c.profiles?.username ?? "User";
                  const cInit = cName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={c.id} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                      <Avatar size={22} letter={cInit} color="#6B6B70" />
                      <div style={{ flex: 1, background: "#F5F5F5", borderRadius: 6, padding: "6px 10px" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700 }}>{cName}</span>
                        <span style={{ fontSize: 9, color: "#A8A8AD", marginLeft: 6 }}>{timeAgo(c.created_at)}</span>
                        <p style={{ fontSize: 10.5, margin: "3px 0 0", color: "#1A1A1A" }}>{c.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {comments.length === 0 && commentsLoaded && (
              <p style={{ fontSize: 11, color: "#A8A8AD", margin: "0 0 10px" }}>No comments yet. Be the first!</p>
            )}

            <form onSubmit={handleComment} style={{ display: "flex", gap: 6 }}>
              <input
                style={inputStyle}
                placeholder={userId ? "Write a comment…" : "Sign in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={() => { if (!userId) setShowAuth(true); }}
                readOnly={!userId}
              />
              {userId && (
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  style={{
                    padding: "7px 12px",
                    background: "#FF6B35", color: "#fff",
                    border: "none", borderRadius: 6,
                    fontSize: 11, fontWeight: 600,
                    cursor: commentLoading ? "default" : "pointer",
                    opacity: commentLoading || !commentText.trim() ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  Post
                </button>
              )}
            </form>
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
