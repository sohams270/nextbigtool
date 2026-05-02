"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export type ActivityItem = {
  id: string;
  type: "tool_added" | "hof_inducted" | "bip_post";
  timestamp: string;
  title: string;
  description: string;
  href: string;
  emoji: string;
  badge: string;
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  "New Launch":      { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  "Hall of Fame":    { bg: "rgba(255,215,0,0.12)",    color: "#FFD700" },
  "Build in Public": { bg: "rgba(0,184,122,0.12)",    color: "#00B87A" },
};

function formatTimeAgo(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeedClient({
  initialActivities,
}: {
  initialActivities: ActivityItem[];
}) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [newCount, setNewCount] = useState(0);
  const [, setTick] = useState(0); // forces re-render every minute to refresh timestamps

  // Re-render timestamps every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const prepend = useCallback((item: ActivityItem) => {
    setActivities(prev => {
      if (prev.some(a => a.id === item.id)) return prev; // dedup
      return [item, ...prev];
    });
    setNewCount(n => n + 1);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // ── tools: new approved tool ──────────────────────────────────────────
    const toolsSub = supabase
      .channel("realtime:tools")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tools", filter: "status=eq.approved" },
        (payload) => {
          const t = payload.new as { id: string; name: string; slug: string; tagline: string; created_at: string };
          prepend({
            id: `tool-${t.id}`,
            type: "tool_added",
            timestamp: t.created_at,
            title: `New tool launched: ${t.name}`,
            description: t.tagline ?? "",
            href: `/tools/${t.slug}`,
            emoji: "🚀",
            badge: "New Launch",
          });
        }
      )
      .subscribe();

    // ── tools: status changed to approved ────────────────────────────────
    const toolsUpdateSub = supabase
      .channel("realtime:tools-update")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tools" },
        (payload) => {
          const t = payload.new as { id: string; name: string; slug: string; tagline: string; status: string; created_at: string };
          if (t.status !== "approved") return;
          const old = payload.old as { status?: string };
          if (old?.status === "approved") return; // already was approved
          prepend({
            id: `tool-${t.id}`,
            type: "tool_added",
            timestamp: t.created_at,
            title: `New tool launched: ${t.name}`,
            description: t.tagline ?? "",
            href: `/tools/${t.slug}`,
            emoji: "🚀",
            badge: "New Launch",
          });
        }
      )
      .subscribe();

    // ── hall_of_fame: new induction ───────────────────────────────────────
    const hofSub = supabase
      .channel("realtime:hall_of_fame")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hall_of_fame" },
        async (payload) => {
          const h = payload.new as { id: string; tool_id: string; inducted_at: string };
          // Fetch tool name+slug
          const { data: tool } = await supabase
            .from("tools")
            .select("name, slug")
            .eq("id", h.tool_id)
            .maybeSingle();
          if (!tool) return;
          prepend({
            id: `hof-${h.id}`,
            type: "hof_inducted",
            timestamp: h.inducted_at,
            title: `${tool.name} inducted into Hall of Fame`,
            description: "Recognised as one of the best indie tools",
            href: `/tools/${tool.slug}`,
            emoji: "🏆",
            badge: "Hall of Fame",
          });
        }
      )
      .subscribe();

    // ── posts: new Build in Public post ──────────────────────────────────
    const postsSub = supabase
      .channel("realtime:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const p = payload.new as { id: string; content: string; tool_id: string; created_at: string };
          const { data: tool } = p.tool_id
            ? await supabase.from("tools").select("name, slug").eq("id", p.tool_id).maybeSingle()
            : { data: null };
          prepend({
            id: `post-${p.id}`,
            type: "bip_post",
            timestamp: p.created_at,
            title: tool ? `${tool.name} posted an update` : "A founder posted an update",
            description: typeof p.content === "string" ? p.content.slice(0, 120) : "",
            href: tool ? `/tools/${tool.slug}` : "/",
            emoji: "📝",
            badge: "Build in Public",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(toolsSub);
      supabase.removeChannel(toolsUpdateSub);
      supabase.removeChannel(hofSub);
      supabase.removeChannel(postsSub);
    };
  }, [prepend]);

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-muted)", fontSize: 14 }}>
        No recent activity yet.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, marginBottom: 20,
        padding: "12px 16px", borderRadius: 12,
        background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00B87A", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Activity Feed</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 1 }}>
              Latest launches, inductions, and founder updates
            </div>
          </div>
        </div>
        {newCount > 0 && (
          <div
            onClick={() => setNewCount(0)}
            style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 10px", borderRadius: 99,
              background: "rgba(0,184,122,0.15)",
              color: "#00B87A",
              border: "1px solid rgba(0,184,122,0.3)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            +{newCount} new
          </div>
        )}
      </div>

      {/* Feed items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activities.map((item, idx) => {
          const colors = BADGE_COLORS[item.badge] ?? { bg: "rgba(255,255,255,0.08)", color: "var(--ink-2)" };
          const isNew = idx < newCount;
          return (
            <a key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                background: isNew ? "rgba(0,184,122,0.04)" : "var(--surface)",
                border: `1px solid ${isNew ? "rgba(0,184,122,0.25)" : "var(--border)"}`,
                transition: "border-color 0.15s, background 0.15s",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: colors.bg, border: `1px solid ${colors.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17,
                }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </span>
                    <span style={{
                      flexShrink: 0, fontSize: 9, fontWeight: 700,
                      padding: "2px 7px", borderRadius: 99,
                      background: colors.bg, color: colors.color,
                      border: `1px solid ${colors.color}33`,
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  {item.description && (
                    <div style={{
                      fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: isNew ? "#00B87A" : "var(--ink-muted)", flexShrink: 0, marginTop: 2, fontWeight: isNew ? 700 : 400 }}>
                  {isNew ? "just now" : formatTimeAgo(item.timestamp)}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
