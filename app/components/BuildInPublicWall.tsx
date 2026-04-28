"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import PostCard, { type PostRow } from "./PostCard";

const PAGE_SIZE = 6;

export default function BuildInPublicWall({ userId }: { userId: string | null }) {
  const supabase = createClient();

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);

    // Count total
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });
    setTotal(count ?? 0);

    // Fetch page of raw posts
    const { data: rawPosts } = await supabase
      .from("posts")
      .select("id, type, content, metric_label, metric_value, likes_count, comments_count, created_at, author_id, tool_id")
      .order("created_at", { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

    if (!rawPosts || rawPosts.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Enrich with profiles and tools
    const authorIds = [...new Set(rawPosts.map((r) => r.author_id as string))];
    const toolIds   = [...new Set(rawPosts.map((r) => r.tool_id as string).filter(Boolean))];

    const [{ data: profileRows }, { data: toolRows }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, username, avatar_url, company, role").in("id", authorIds),
      toolIds.length > 0
        ? supabase.from("tools").select("id, name").in("id", toolIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    const profileMap = Object.fromEntries((profileRows ?? []).map((pr) => [pr.id, pr]));
    const toolMap    = Object.fromEntries((toolRows ?? []).map((t) => [t.id, t]));

    const enriched: PostRow[] = rawPosts.map((r) => ({
      id:            r.id,
      type:          r.type,
      content:       r.content,
      metric_label:  r.metric_label,
      metric_value:  r.metric_value,
      likes_count:   r.likes_count,
      comments_count: r.comments_count,
      created_at:    r.created_at,
      profiles:      profileMap[r.author_id] ?? null,
      tools:         r.tool_id ? (toolMap[r.tool_id] ?? null) : null,
    }));

    setPosts(enriched);

    // Fetch liked post IDs for this user on this page
    if (userId && enriched.length > 0) {
      const postIds = enriched.map((ep) => ep.id);
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds);
      setLikedIds((likes ?? []).map((l: { post_id: string }) => l.post_id));
    }

    setLoading(false);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  function goTo(p: number) {
    setPage(p);
    // Scroll wall into view
    document.getElementById("bip-wall")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="bip-wall">
      {loading ? (
        /* Skeleton */
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0 20px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: 90, borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: 22,
          }}>🔥</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
            No posts yet — be the first founder to share
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", maxWidth: 340, margin: "0 auto" }}>
            Submit your tool and post milestones, funding news, and updates directly to this wall.
          </div>
        </div>
      ) : (
        <>
          {/* Post list — vertical, single column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 4 }}>
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                userId={userId}
                isLiked={likedIds.includes(p.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, padding: "18px 0 4px",
            }}>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: page === 0 ? "transparent" : "rgba(255,255,255,0.07)",
                  color: page === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
                  cursor: page === 0 ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← Previous
              </button>

              {/* Page numbers */}
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const near = Math.abs(i - page) <= 2;
                  if (!near && i !== 0 && i !== totalPages - 1) {
                    if (i === 1 && page > 3) return <span key={i} style={{ color: "rgba(255,255,255,0.3)", lineHeight: "30px", padding: "0 2px" }}>…</span>;
                    if (i === totalPages - 2 && page < totalPages - 4) return <span key={i} style={{ color: "rgba(255,255,255,0.3)", lineHeight: "30px", padding: "0 2px" }}>…</span>;
                    if (!near) return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      style={{
                        width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 600,
                        border: i === page ? "1px solid #FF6B35" : "1px solid rgba(255,255,255,0.1)",
                        background: i === page ? "rgba(255,107,53,0.15)" : "transparent",
                        color: i === page ? "#FF6B35" : "rgba(255,255,255,0.5)",
                        cursor: i === page ? "default" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: page >= totalPages - 1 ? "transparent" : "rgba(255,255,255,0.07)",
                  color: page >= totalPages - 1 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
                  cursor: page >= totalPages - 1 ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
