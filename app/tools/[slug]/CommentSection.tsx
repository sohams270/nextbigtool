"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/app/components/AuthModal";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; avatar_url: string | null; username: string | null } | null;
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

function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "?")[0].toUpperCase();
  const colors = ["#7c3aed", "#ef4444", "#3b82f6", "#0d9488", "#f59e0b", "#ec4899"];
  const bg = colors[initial.charCodeAt(0) % colors.length];

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "grid", placeItems: "center",
      color: "#fff", fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

export default function CommentSection({ toolId, userId }: { toolId: string; userId: string | null }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    fetchComments();
    if (userId) {
      supabase.from("profiles").select("full_name, avatar_url").eq("id", userId).single()
        .then(({ data }) => {
          if (data) setCurrentUser({ id: userId, ...data });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, userId]);

  async function fetchComments() {
    setLoading(true);
    // tool_comments.user_id → auth.users (no direct FK to profiles),
    // so we fetch comments first, then look up profiles separately.
    const { data: rows } = await supabase
      .from("tool_comments")
      .select("id, content, created_at, user_id")
      .eq("tool_id", toolId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rows || rows.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(rows.map((r: any) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, username")
      .in("id", userIds);

    const profileMap: Record<string, any> = {};
    for (const p of profiles ?? []) profileMap[p.id] = p;

    const normalized = rows.map((row: any) => ({
      ...row,
      profiles: profileMap[row.user_id] ?? null,
    }));
    setComments(normalized as Comment[]);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!userId) { setShowAuth(true); return; }
    const text = draft.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("tool_comments")
      .insert({ tool_id: toolId, user_id: userId, content: text })
      .select("id, content, created_at, user_id")
      .single();
    if (!error && data) {
      // Attach the current user's profile we already have in state
      const normalized = {
        ...(data as any),
        profiles: currentUser
          ? { full_name: currentUser.full_name, avatar_url: currentUser.avatar_url, username: null }
          : null,
      };
      setComments((prev) => [normalized as Comment, ...prev]);
      setDraft("");
      // Notify tool owner — fire and forget
      fetch("/api/notify-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "comment",
          toolId,
          comment: text,
          commenterName: currentUser?.full_name ?? "Someone",
        }),
      }).catch(() => {});
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("tool_comments").delete().eq("id", id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 20px" }}>
        Comments <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-muted)" }}>({comments.length})</span>
      </h2>

      {/* Comment input */}
      <div style={{
        border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px",
        background: "var(--surface)", marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Avatar src={currentUser?.avatar_url} name={currentUser?.full_name || "You"} size={34} />
          <div style={{ flex: 1 }}>
            <textarea
              placeholder={userId ? "Share your thoughts…" : "Sign in to leave a comment"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => { if (!userId) setShowAuth(true); }}
              maxLength={1000}
              rows={3}
              style={{
                width: "100%", border: "none", outline: "none",
                fontSize: 13, lineHeight: 1.6, color: "var(--ink)",
                background: "transparent", resize: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{draft.length}/1000</span>
              <button
                onClick={handleSubmit}
                disabled={submitting || !draft.trim()}
                style={{
                  padding: "7px 18px", borderRadius: 8,
                  background: draft.trim() ? "#FF6B35" : "var(--surface-alt)",
                  color: draft.trim() ? "#fff" : "var(--ink-muted)",
                  border: "none", fontSize: 12, fontWeight: 700,
                  cursor: draft.trim() ? "pointer" : "default",
                  fontFamily: "inherit", transition: "background 0.15s",
                }}
              >
                {submitting ? "Posting…" : "Post comment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-muted)", fontSize: 13 }}>Loading…</div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "36px 0",
          color: "var(--ink-muted)", fontSize: 13, lineHeight: 1.6,
        }}>
          No comments yet — be the first!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {comments.map((c, i) => {
            const profile = c.profiles;
            const displayName = profile?.full_name || profile?.username || "Anonymous";
            const isOwn = c.user_id === userId;
            return (
              <div key={c.id} style={{
                display: "flex", gap: 12, padding: "16px 0",
                borderBottom: i < comments.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <Avatar src={profile?.avatar_url} name={displayName} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{displayName}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{timeAgo(c.created_at)}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: 0, wordBreak: "break-word" }}>
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          title="Join the conversation"
          subtitle="Sign in to leave a comment and connect with the community."
        />
      )}
    </div>
  );
}
