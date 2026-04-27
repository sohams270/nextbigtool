"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostCard, { type PostRow } from "@/app/components/PostCard";

const ADMIN_EMAIL = "sohams270@gmail.com";

/* ── types ───────────────────────────────────────────────────────────── */
type Tool = { id: string; name: string };

type MyPost = {
  id: string;
  content: string;
  type: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  tools?: { name: string } | null;
};

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
  plan: string;
};

/* ── constants ───────────────────────────────────────────────────────── */
const PLAN_LIMITS: Record<string, number> = { free: 1, basic: 5, core: Infinity };
const PLAN_LABELS: Record<string, string> = { free: "Free", basic: "Basic", core: "Core" };

const TAG_TO_TYPE: Record<string, string> = {
  "#Milestone": "milestone",
  "#Launch":    "launch",
  "#Funding":   "funding",
  "#Update":    "update",
  "#Idea":      "update",
};

const TAGS = ["#Milestone", "#Launch", "#Update", "#Funding", "#Idea"];

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 20,
};

/* ── helpers ─────────────────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getRangeStart(range: "7d" | "30d" | "1y"): Date {
  const ms = range === "7d" ? 7 : range === "30d" ? 30 : 365;
  return new Date(Date.now() - ms * 24 * 60 * 60 * 1000);
}

/* ── AvatarOrInitials ────────────────────────────────────────────────── */
function AvatarOrInitials({
  avatarUrl, initials, size = 36,
}: { avatarUrl: string | null; initials: string; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", flexShrink: 0,
          border: "1.5px solid var(--border)",
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#ff6a3d,#ff3d88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.36), fontWeight: 700, color: "#fff",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ── MyPostCard ──────────────────────────────────────────────────────── */
function MyPostCard({
  post, avatarUrl, displayName, company, role, initials,
}: {
  post: MyPost;
  avatarUrl: string | null;
  displayName: string;
  company: string | null;
  role: string | null;
  initials: string;
}) {
  const byline = [company, role].filter(Boolean).join(" · ");
  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <AvatarOrInitials avatarUrl={avatarUrl} initials={initials} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <b style={{ fontSize: 13.5, color: "var(--ink)" }}>{displayName}</b>
            {post.tools && (
              <span style={{
                padding: "2px 8px", borderRadius: 20,
                background: "var(--surface-alt)",
                fontSize: 11, fontWeight: 600, color: "var(--ink-muted)",
              }}>
                {(post.tools as { name: string }).name}
              </span>
            )}
          </div>
          {byline && (
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 1 }}>{byline}</div>
          )}
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 1 }}>
            {timeAgo(post.created_at)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", marginBottom: 8 }}>
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              padding: "2px 8px", borderRadius: 6,
              background: "var(--surface-alt)",
              fontSize: 11, color: "var(--ink-muted)",
            }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{
        display: "flex", gap: 16, fontSize: 12, color: "var(--ink-muted)",
        borderTop: "1px solid var(--border-faint)", paddingTop: 10,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.likes_count ?? 0} likes
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {post.comments_count ?? 0} comments
        </span>
      </div>
    </div>
  );
}

/* ── PlanSidebar ─────────────────────────────────────────────────────── */
function PlanSidebar({
  plan, postsUsed, postsLimit,
}: { plan: string; postsUsed: number; postsLimit: number }) {
  const isCore = plan === "core";
  const isBasic = plan === "basic";
  const remaining = postsLimit === Infinity ? Infinity : Math.max(0, postsLimit - postsUsed);
  const pct = postsLimit === Infinity ? 100 : Math.min(100, (postsUsed / postsLimit) * 100);

  return (
    <div style={{
      background: "linear-gradient(135deg,#0f0f10,#1e1e2a)",
      borderRadius: 14, padding: 20, color: "#fff",
      border: isCore ? "1px solid rgba(255,106,61,0.25)" : "none",
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
        borderRadius: 20, padding: "3px 10px",
        fontSize: 10, fontWeight: 700, marginBottom: 10,
      }}>
        ✦ Core plan
      </div>

      {isCore ? (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
            You&apos;re all set 🎉
          </h3>
          <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
            You have <b style={{ color: "#c0c0cc" }}>unlimited posts</b> on Core.
            Share milestones, launches, and updates as often as you want.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {["Unlimited Build-in-Public posts", "See who upvoted each post", "Full CRM & analytics"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M5 12l5 5 9-11"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "#fff" }}>
            Post as often as you want
          </h3>

          {/* Usage bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 11, color: "#8a8a90", marginBottom: 5,
            }}>
              <span>{postsUsed} / {postsLimit} posts used</span>
              <span style={{ color: remaining === 0 ? "#ff6a6a" : "#8a8a90" }}>
                {remaining === 0 ? "Limit reached" : `${remaining} left`}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: remaining === 0 ? "#dc2626" : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                width: `${pct}%`, transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
            {isBasic
              ? remaining > 0
                ? <><b style={{ color: "#c0c0cc" }}>{remaining} post{remaining !== 1 ? "s" : ""} remaining</b> on Basic. Upgrade to Core for unlimited posts plus upvoter tracking.</>
                : <>You&apos;ve used all <b style={{ color: "#c0c0cc" }}>5 Basic posts</b>. Upgrade to Core to keep building in public.</>
              : remaining > 0
                ? <>Your Free plan includes <b style={{ color: "#c0c0cc" }}>1 post total</b>. Upgrade to Core for unlimited posts and upvoter tracking.</>
                : <>You&apos;ve used your free post. <b style={{ color: "#c0c0cc" }}>Upgrade to Core</b> to keep sharing your journey.</>
            }
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Unlimited Build-in-Public posts", "See who upvoted each post", "Scheduled posts & analytics"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M5 12l5 5 9-11"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <Link href="/dashboard/plan" style={{
            display: "block", textAlign: "center",
            background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
            borderRadius: 9, padding: "9px 0",
            fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
          }}>
            Upgrade to Core
          </Link>
        </>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function BuildInPublicPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId]   = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tools, setTools]     = useState<Tool[]>([]);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [wallPosts, setWallPosts] = useState<PostRow[]>([]);

  const [text, setText]               = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [activeTab, setActiveTab]     = useState<"mine" | "wall">("mine");
  const [perfRange, setPerfRange]     = useState<"7d" | "30d" | "1y">("30d");
  const [typeFilter, setTypeFilter]   = useState<string>("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const isAdmin = user.email === ADMIN_EMAIL;

      // Profile
      supabase
        .from("profiles")
        .select("full_name, avatar_url, company, role, plan")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          setProfile({
            full_name:  data?.full_name  ?? null,
            avatar_url: data?.avatar_url ?? null,
            company:    data?.company    ?? null,
            role:       data?.role       ?? null,
            plan:       isAdmin ? "core" : (data?.plan ?? "free"),
          });
        });

      // Tools
      supabase
        .from("tools")
        .select("id, name")
        .eq("submitter_id", user.id)
        .eq("status", "approved")
        .then(({ data }) => {
          setTools((data ?? []) as Tool[]);
          if (data?.[0]) setSelectedTool(data[0].id);
        });

      // ALL user posts (no limit — needed for accurate stats)
      supabase
        .from("posts")
        .select("id, content, type, tags, likes_count, comments_count, created_at, tools(name)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMyPosts((data ?? []) as unknown as MyPost[]));

      // Wall posts — with author profiles
      supabase
        .from("posts")
        .select(`
          id, type, content, metric_label, metric_value,
          likes_count, comments_count, created_at,
          profiles ( full_name, username, avatar_url, company, role ),
          tools ( name )
        `)
        .order("created_at", { ascending: false })
        .limit(30)
        .then(({ data }) => setWallPosts((data ?? []) as unknown as PostRow[]));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived values ─────────────────────────────────────────────── */
  const plan       = profile?.plan ?? "free";
  const planLimit  = PLAN_LIMITS[plan] ?? 1;
  const canPost    = plan === "core" || myPosts.length < planLimit;
  const postsRemaining = planLimit === Infinity ? null : Math.max(0, planLimit - myPosts.length);

  const filteredPosts = useMemo(() => {
    const start = getRangeStart(perfRange);
    return myPosts.filter(p => new Date(p.created_at) >= start);
  }, [myPosts, perfRange]);

  const perfStats = useMemo(() => ({
    totalPosts:    filteredPosts.length,
    totalLikes:    filteredPosts.reduce((s, p) => s + (p.likes_count    ?? 0), 0),
    totalComments: filteredPosts.reduce((s, p) => s + (p.comments_count ?? 0), 0),
  }), [filteredPosts]);

  const topTagLabel = useMemo(() => {
    const freq = myPosts.flatMap(p => p.tags ?? []).reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1; return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [myPosts]);

  const displayName = profile?.full_name?.split(" ")[0] ?? "You";
  const initials    = (profile?.full_name ?? "Y").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Feed filtering by type
  const visibleMyPosts = typeFilter === "all"
    ? myPosts.slice(0, 20)
    : myPosts.filter(p => p.type === typeFilter).slice(0, 20);

  const visibleWallPosts = typeFilter === "all"
    ? wallPosts
    : wallPosts.filter(p => p.type === typeFilter);

  /* ── Post submit ────────────────────────────────────────────────── */
  async function handlePost() {
    if (!text.trim() || !userId || !canPost) return;
    setSubmitting(true);

    const postType = selectedTags.length > 0
      ? (TAG_TO_TYPE[selectedTags[0]] ?? "update")
      : "update";

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: userId,
        tool_id:   selectedTool || null,
        content:   text.trim(),
        tags:      selectedTags,
        type:      postType,
      })
      .select()
      .single();

    if (!error && data) {
      setMyPosts(prev => [data as unknown as MyPost, ...prev]);
      setText("");
      setSelectedTags([]);
    }
    setSubmitting(false);
  }

  /* ── Plan badge in composer header ─────────────────────────────── */
  function ComposerBadge() {
    if (plan === "core") return (
      <span style={{
        padding: "3px 9px", borderRadius: 20,
        background: "rgba(255,106,61,0.12)", color: "#ff6a3d",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        ✦ Core · Unlimited
      </span>
    );
    if (postsRemaining === 0) return (
      <span style={{
        padding: "3px 9px", borderRadius: 20,
        background: "rgba(220,38,38,0.1)", color: "#dc2626",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        {PLAN_LABELS[plan]} · Limit reached
      </span>
    );
    return (
      <span style={{
        padding: "3px 9px", borderRadius: 20,
        background: "#fff5ec", color: "#b05a00",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        {PLAN_LABELS[plan]} · {postsRemaining} post{postsRemaining !== 1 ? "s" : ""} left
      </span>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>
            Social · Build in Public Wall
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
            Build In Public
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            Share milestones, funding, launches, and updates with the NextBigTool community.
          </p>
        </div>
        {/* Tab toggle */}
        <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 9, padding: 3 }}>
          {(["mine", "wall"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "none",
              background: activeTab === t ? "var(--surface)" : "transparent",
              color: activeTab === t ? "var(--ink)" : "var(--ink-muted)",
              boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              {t === "mine" ? "My posts" : "Public wall"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* ── Left column ─────────────────────────────────────────── */}
        <div>
          {/* Composer */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <AvatarOrInitials avatarUrl={profile?.avatar_url ?? null} initials={initials} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{displayName}</div>
                {(profile?.company || profile?.role) && (
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                    {[profile.company, profile.role].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                  Posting to <b>Build in Public Wall</b>
                  {tools.length > 0 && (
                    <select
                      value={selectedTool}
                      onChange={(e) => setSelectedTool(e.target.value)}
                      style={{ marginLeft: 6, fontSize: 11, border: "none", background: "transparent", color: "#ff6a3d", fontWeight: 600, cursor: "pointer" }}
                    >
                      {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <ComposerBadge />
            </div>

            {/* Limit reached warning */}
            {!canPost && (
              <div style={{
                padding: "10px 14px", borderRadius: 9, marginBottom: 10,
                background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)",
                fontSize: 12.5, color: "#dc2626", lineHeight: 1.5,
              }}>
                You&apos;ve reached your {PLAN_LABELS[plan]} plan posting limit.{" "}
                <Link href="/dashboard/plan" style={{ color: "#ff6a3d", fontWeight: 700, textDecoration: "none" }}>
                  Upgrade to Core →
                </Link>
              </div>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!canPost}
              placeholder={canPost
                ? "What shipped today? Share a milestone, funding round, or launch…"
                : "Upgrade to Core to keep posting…"
              }
              style={{
                width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
                padding: "10px 12px", fontSize: 13.5, lineHeight: 1.5,
                resize: "vertical" as const, minHeight: 80,
                fontFamily: "inherit", outline: "none",
                color: "var(--ink)", background: canPost ? "var(--surface)" : "var(--surface-alt)",
                opacity: canPost ? 1 : 0.6, boxSizing: "border-box" as const,
              }}
            />

            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, margin: "8px 0" }}>
              {TAGS.map(tag => (
                <button key={tag} onClick={() => {
                  if (!canPost) return;
                  setSelectedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  );
                }} style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                  cursor: canPost ? "pointer" : "default",
                  border: selectedTags.includes(tag) ? "1.5px solid #ff6a3d" : "1.5px solid var(--border)",
                  background: selectedTags.includes(tag) ? "#fff0eb" : "var(--surface-alt)",
                  color: selectedTags.includes(tag) ? "#c04400" : "var(--ink-muted)",
                }}>
                  {tag}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={{
                padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                background: "transparent", fontSize: 12, fontWeight: 600,
                color: "var(--ink-muted)", cursor: "pointer",
              }}>
                Save draft
              </button>
              <button
                onClick={handlePost}
                disabled={submitting || !text.trim() || !canPost}
                style={{
                  background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                  border: "none", borderRadius: 8, padding: "6px 16px",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  cursor: (submitting || !text.trim() || !canPost) ? "not-allowed" : "pointer",
                  opacity: (submitting || !text.trim() || !canPost) ? 0.6 : 1,
                }}
              >
                {submitting ? "Posting…" : "Post update"}
              </button>
            </div>
          </div>

          {/* Type filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
            {[
              { label: "All",        value: "all" },
              { label: "Milestones", value: "milestone" },
              { label: "Updates",    value: "update" },
              { label: "Funding",    value: "funding" },
              { label: "Launches",   value: "launch" },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: "pointer",
                  border: typeFilter === value ? "1.5px solid #ff6a3d" : "1.5px solid var(--border)",
                  background: typeFilter === value ? "#fff0eb" : "var(--surface)",
                  color: typeFilter === value ? "#c04400" : "var(--ink-muted)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Posts feed */}
          {activeTab === "mine" ? (
            visibleMyPosts.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: "36px 20px", color: "var(--ink-muted)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No posts yet</div>
                <div style={{ fontSize: 12 }}>
                  {typeFilter === "all"
                    ? "Share your first build-in-public update above!"
                    : `No ${typeFilter} posts yet. Try a different filter.`}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleMyPosts.map((p) => (
                  <MyPostCard
                    key={p.id}
                    post={p}
                    avatarUrl={profile?.avatar_url ?? null}
                    displayName={displayName}
                    company={profile?.company ?? null}
                    role={profile?.role ?? null}
                    initials={initials}
                  />
                ))}
              </div>
            )
          ) : (
            visibleWallPosts.length === 0 ? (
              <div style={{ ...card, textAlign: "center", padding: "36px 20px", color: "var(--ink-muted)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📢</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Wall is empty</div>
                <div style={{ fontSize: 12 }}>Be the first to post a milestone or update!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleWallPosts.map((p) => (
                  <PostCard key={p.id} post={p} userId={userId} />
                ))}
              </div>
            )
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Plan CTA */}
          <PlanSidebar plan={plan} postsUsed={myPosts.length} postsLimit={planLimit} />

          {/* Post performance */}
          <div style={card}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 14,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                Post performance
              </h3>
              {/* Time range selector */}
              <div style={{
                display: "flex", background: "var(--surface-alt)",
                borderRadius: 7, padding: 2, gap: 1,
              }}>
                {(["7d", "30d", "1y"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setPerfRange(r)}
                    style={{
                      padding: "3px 7px", borderRadius: 5,
                      fontSize: 10.5, fontWeight: 600,
                      cursor: "pointer", border: "none",
                      background: perfRange === r ? "var(--surface)" : "transparent",
                      color: perfRange === r ? "var(--ink)" : "var(--ink-muted)",
                      boxShadow: perfRange === r ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {r === "7d" ? "7d" : r === "30d" ? "30d" : "1y"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  label: "Total posts",
                  value: perfStats.totalPosts,
                  display: perfStats.totalPosts.toString(),
                },
                {
                  label: "Total likes",
                  value: perfStats.totalLikes,
                  display: perfStats.totalLikes > 0 ? perfStats.totalLikes.toString() : "—",
                },
                {
                  label: "Total comments",
                  value: perfStats.totalComments,
                  display: perfStats.totalComments > 0 ? perfStats.totalComments.toString() : "—",
                },
                {
                  label: "Top tag",
                  value: 1,
                  display: topTagLabel,
                },
              ].map(({ label, display }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", fontSize: 13,
                }}>
                  <span style={{ color: "var(--ink-muted)" }}>{label}</span>
                  <b style={{ color: display === "—" ? "var(--ink-faint)" : "var(--ink)", fontWeight: 700 }}>
                    {display}
                  </b>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 14, paddingTop: 12,
              borderTop: "1px solid var(--border-faint)",
              fontSize: 10.5, color: "var(--ink-faint)", textAlign: "center",
            }}>
              {perfRange === "7d" ? "Last 7 days" : perfRange === "30d" ? "Last 30 days" : "Last 12 months"}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
