"use client";
import { useState, useEffect, useMemo, useRef } from "react";
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

type Draft = { text: string; tags: string[]; toolId: string };

/* ── constants ───────────────────────────────────────────────────────── */
const PLAN_LIMITS: Record<string, number> = { free: 5, core: Infinity };
const PLAN_LABELS: Record<string, string> = { free: "Free", core: "Core" };

const TAG_TO_TYPE: Record<string, string> = {
  "#Milestone": "milestone",
  "#Launch":    "launch",
  "#Funding":   "funding",
  "#Update":    "update",
  "#Idea":      "update",
  "#NeedHelp":  "update",
};

const TAGS = ["#Milestone", "#Launch", "#Update", "#Funding", "#Idea", "#NeedHelp"];

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

function draftKey(uid: string) { return `bip-draft-${uid}`; }

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
  post: MyPost; avatarUrl: string | null; displayName: string;
  company: string | null; role: string | null; initials: string;
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
              <span style={{ padding: "2px 8px", borderRadius: 20, background: "var(--surface-alt)", fontSize: 11, fontWeight: 600, color: "var(--ink-muted)" }}>
                {(post.tools as { name: string }).name}
              </span>
            )}
          </div>
          {byline && <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 1 }}>{byline}</div>}
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 1 }}>{timeAgo(post.created_at)}</div>
        </div>
      </div>

      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", marginBottom: 8 }}>{post.content}</div>

      {post.tags && post.tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
          {post.tags.map(tag => (
            <span key={tag} style={{ padding: "2px 8px", borderRadius: 6, background: "var(--surface-alt)", fontSize: 11, color: "var(--ink-muted)" }}>{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--ink-muted)", borderTop: "1px solid var(--border-faint)", paddingTop: 10 }}>
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
function PlanSidebar({ plan, postsUsed, postsLimit }: { plan: string; postsUsed: number; postsLimit: number }) {
  const isCore  = plan === "core";
  const remaining = postsLimit === Infinity ? Infinity : Math.max(0, postsLimit - postsUsed);
  const pct = postsLimit === Infinity ? 100 : Math.min(100, (postsUsed / postsLimit) * 100);

  return (
    <div style={{
      background: "linear-gradient(135deg,#0f0f10,#1e1e2a)",
      borderRadius: 14, padding: 20, color: "#fff",
      border: isCore ? "1px solid rgba(255,106,61,0.25)" : "none",
    }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, marginBottom: 10 }}>
        ✦ Core plan
      </div>

      {isCore ? (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>You&apos;re all set 🎉</h3>
          <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
            You have <b style={{ color: "#c0c0cc" }}>unlimited posts</b> on Core. Share milestones, launches, and updates as often as you want.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {["Unlimited Build-in-Public posts", "See who upvoted each post", "Full CRM & analytics"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><path d="M5 12l5 5 9-11"/></svg>
                {f}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "#fff" }}>Post as often as you want</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8a90", marginBottom: 5 }}>
              <span>{postsUsed} / {postsLimit} posts used</span>
              <span style={{ color: remaining === 0 ? "#ff6a6a" : "#8a8a90" }}>
                {remaining === 0 ? "Limit reached" : `${remaining} left`}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: remaining === 0 ? "#dc2626" : "linear-gradient(90deg,#ff6a3d,#ff3d88)", width: `${pct}%`, transition: "width 0.4s ease" }} />
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
            {remaining > 0
              ? <>Your Free plan includes <b style={{ color: "#c0c0cc" }}>5 posts total</b>. Upgrade to Core for unlimited posts and upvoter tracking.</>
              : <>You&apos;ve used all 5 free posts. <b style={{ color: "#c0c0cc" }}>Upgrade to Core</b> to keep sharing your journey.</>
            }
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Unlimited Build-in-Public posts", "See who upvoted each post", "Scheduled posts & analytics"].map(f => (
              <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><path d="M5 12l5 5 9-11"/></svg>
                {f}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/plan" style={{ display: "block", textAlign: "center", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none" }}>
            Upgrade to Core
          </Link>
        </>
      )}
    </div>
  );
}

/* ── ConfirmPostModal ────────────────────────────────────────────────── */
function ConfirmPostModal({
  onConfirm, onCancel, submitting,
}: { onConfirm: () => void; onCancel: () => void; submitting: boolean }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: "fixed", inset: 0, background: "rgba(10,11,26,0.55)", zIndex: 1000 }}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 1001, width: "min(90vw,420px)",
        background: "var(--surface)", borderRadius: 18,
        padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg,rgba(255,106,61,0.15),rgba(255,61,136,0.15))",
          border: "1px solid rgba(255,106,61,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 24,
        }}>
          📢
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
          Post to Build in Public wall?
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Your update will be <b style={{ color: "var(--ink)" }}>visible to everyone</b> on NextBigTool — on the homepage wall and in the community feed. Make sure it&apos;s ready.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 9,
              border: "1px solid var(--border)", background: "var(--surface)",
              fontSize: 13, fontWeight: 600, color: "var(--ink)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
              background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
              fontSize: 13, fontWeight: 700, color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Posting…" : "Post now →"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function BuildInPublicPage() {
  const router = useRouter();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [userId, setUserId]     = useState<string | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [tools, setTools]       = useState<Tool[]>([]);
  const [myPosts, setMyPosts]   = useState<MyPost[]>([]);
  const [wallPosts, setWallPosts] = useState<PostRow[]>([]);

  const [text, setText]               = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftSaved, setDraftSaved]   = useState(false);
  const [hasDraft, setHasDraft]       = useState(false);
  const [postError, setPostError]     = useState<string | null>(null);

  const [activeTab, setActiveTab]   = useState<"mine" | "wall">("mine");
  const [perfRange, setPerfRange]   = useState<"7d" | "30d" | "1y">("30d");
  const [tagFilter, setTagFilter]   = useState<string>("all");

  /* ── Load data ──────────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const isAdmin = user.email === ADMIN_EMAIL;

      // Restore draft from localStorage
      try {
        const saved = localStorage.getItem(draftKey(user.id));
        if (saved) {
          const d: Draft = JSON.parse(saved);
          if (d.text) { setText(d.text); setHasDraft(true); }
          if (d.tags?.length) setSelectedTags(d.tags);
          if (d.toolId) setSelectedTool(d.toolId);
        }
      } catch (_) {}

      // Profile
      supabase.from("profiles").select("full_name, avatar_url, company, role, plan").eq("id", user.id).single()
        .then(({ data }) => setProfile({
          full_name:  data?.full_name  ?? null,
          avatar_url: data?.avatar_url ?? null,
          company:    data?.company    ?? null,
          role:       data?.role       ?? null,
          plan:       isAdmin ? "core" : (data?.plan ?? "free"),
        }));

      // Tools
      supabase.from("tools").select("id, name").eq("submitter_id", user.id).eq("status", "approved")
        .then(({ data }) => {
          setTools((data ?? []) as Tool[]);
          if (data?.[0]) setSelectedTool(prev => prev || data[0].id);
        });

      // All user posts (no limit for stats)
      supabase.from("posts")
        .select("id, content, type, tags, likes_count, comments_count, created_at, tools(name)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMyPosts((data ?? []) as unknown as MyPost[]));

      // Wall posts with author profiles
      supabase.from("posts")
        .select(`id, type, content, metric_label, metric_value, likes_count, comments_count, created_at,
          profiles ( full_name, username, avatar_url, company, role ), tools ( name )`)
        .order("created_at", { ascending: false })
        .limit(30)
        .then(({ data }) => setWallPosts((data ?? []) as unknown as PostRow[]));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derived ────────────────────────────────────────────────────── */
  const plan      = profile?.plan ?? "free";
  const planLimit = PLAN_LIMITS[plan] ?? 1;
  const canPost   = plan === "core" || myPosts.length < planLimit;
  const postsRemaining = planLimit === Infinity ? null : Math.max(0, planLimit - myPosts.length);

  const filteredForPerf = useMemo(() => {
    const start = getRangeStart(perfRange);
    return myPosts.filter(p => new Date(p.created_at) >= start);
  }, [myPosts, perfRange]);

  const perfStats = useMemo(() => ({
    totalPosts:    filteredForPerf.length,
    totalLikes:    filteredForPerf.reduce((s, p) => s + (p.likes_count    ?? 0), 0),
    totalComments: filteredForPerf.reduce((s, p) => s + (p.comments_count ?? 0), 0),
  }), [filteredForPerf]);

  const topTagLabel = useMemo(() => {
    const freq = myPosts.flatMap(p => p.tags ?? []).reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1; return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [myPosts]);

  // Dynamic tag options from user's actual posts
  const myTagOptions = useMemo(() => {
    const seen = new Set<string>();
    myPosts.forEach(p => (p.tags ?? []).forEach(t => seen.add(t)));
    return Array.from(seen);
  }, [myPosts]);

  const displayName = profile?.full_name?.split(" ")[0] ?? "You";
  const initials    = (profile?.full_name ?? "Y").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Feed filtering
  const visibleMyPosts = useMemo(() => {
    const base = tagFilter === "all"
      ? myPosts
      : myPosts.filter(p => (p.tags ?? []).includes(tagFilter));
    return base.slice(0, 20);
  }, [myPosts, tagFilter]);

  const visibleWallPosts = useMemo(() => {
    return tagFilter === "all"
      ? wallPosts
      : wallPosts.filter(p => {
          // Wall PostRow doesn't have tags, filter by type instead
          return true; // wall shows all
        });
  }, [wallPosts, tagFilter]);

  /* ── Hashtag chip click ─────────────────────────────────────────── */
  function handleTagClick(tag: string) {
    if (!canPost) return;

    const isSelected = selectedTags.includes(tag);
    setSelectedTags(prev =>
      isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
    );

    if (!isSelected) {
      // Append hashtag to textarea text
      const ta = textareaRef.current;
      const current = text;
      const suffix = current.trimEnd().endsWith(tag) ? "" : (current && !current.endsWith(" ") ? " " : "") + tag;
      setText(current + suffix);
      // Keep focus on textarea
      setTimeout(() => ta?.focus(), 0);
    }
  }

  /* ── Draft ──────────────────────────────────────────────────────── */
  function handleSaveDraft() {
    if (!userId) return;
    const draft: Draft = { text, tags: selectedTags, toolId: selectedTool };
    localStorage.setItem(draftKey(userId), JSON.stringify(draft));
    setDraftSaved(true);
    setHasDraft(true);
    setTimeout(() => setDraftSaved(false), 2500);
  }

  function handleDiscardDraft() {
    if (!userId) return;
    localStorage.removeItem(draftKey(userId));
    setText("");
    setSelectedTags([]);
    setHasDraft(false);
  }

  /* ── Post ───────────────────────────────────────────────────────── */
  async function handlePost() {
    if (!text.trim() || !userId || !canPost) return;
    setSubmitting(true);
    setPostError(null);

    const postType = selectedTags.length > 0 ? (TAG_TO_TYPE[selectedTags[0]] ?? "update") : "update";

    // Try insert with tags first; if it fails due to missing column, retry without
    let data: Record<string, unknown> | null = null;
    let error: { message?: string; code?: string } | null = null;

    const insertPayload = {
      author_id: userId,
      tool_id:   selectedTool || null,
      content:   text.trim(),
      type:      postType,
      tags:      selectedTags,
    };

    ({ data, error } = await supabase
      .from("posts")
      .insert(insertPayload)
      .select()
      .single() as unknown as { data: Record<string, unknown> | null; error: { message?: string; code?: string } | null });

    // Graceful fallback: if tags column doesn't exist yet, retry without it
    if (error && (error.message?.includes("tags") || error.code === "42703")) {
      const { tags: _tags, ...payloadWithoutTags } = insertPayload;
      void _tags;
      ({ data, error } = await supabase
        .from("posts")
        .insert(payloadWithoutTags)
        .select()
        .single() as unknown as { data: Record<string, unknown> | null; error: { message?: string; code?: string } | null });
    }

    setSubmitting(false);
    setShowConfirm(false);

    if (error || !data) {
      const msg = error?.message ?? "Unknown error";
      // Surface a friendly message
      if (msg.includes("row-level security") || msg.includes("violates row-level security") || msg.includes("new row violates")) {
        setPostError("Permission denied — make sure you're signed in. If this persists, the admin needs to run the supabase/posts_v2.sql migration.");
      } else {
        setPostError(`Failed to post: ${msg}`);
      }
      return;
    }

    // Clear draft
    localStorage.removeItem(draftKey(userId));
    setHasDraft(false);

    const newPost = data as unknown as MyPost;

    // Add to my posts feed instantly
    setMyPosts(prev => [newPost, ...prev]);

    // Add to wall posts feed (construct PostRow from profile)
    const wallPost: PostRow = {
      id:            String(newPost.id),
      type:          postType,
      content:       String(newPost.content),
      metric_label:  null,
      metric_value:  null,
      likes_count:   0,
      comments_count: 0,
      created_at:    String(newPost.created_at),
      profiles: {
        full_name:  profile?.full_name  ?? null,
        username:   null,
        avatar_url: profile?.avatar_url ?? null,
        company:    profile?.company    ?? null,
        role:       profile?.role       ?? null,
      },
      tools: selectedTool
        ? { name: tools.find(t => t.id === selectedTool)?.name ?? "" }
        : null,
    };
    setWallPosts(prev => [wallPost, ...prev]);

    // Reset composer
    setText("");
    setSelectedTags([]);
    // Switch to "My posts" to show the new post
    setActiveTab("mine");

    // Tell Next.js to revalidate server component data so the homepage
    // wall picks up the new post immediately on next navigation
    router.refresh();
  }

  /* ── Plan badge ─────────────────────────────────────────────────── */
  function ComposerBadge() {
    if (plan === "core") return (
      <span style={{ padding: "3px 9px", borderRadius: 20, background: "rgba(255,106,61,0.12)", color: "#ff6a3d", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        ✦ Core · Unlimited
      </span>
    );
    if (postsRemaining === 0) return (
      <span style={{ padding: "3px 9px", borderRadius: 20, background: "rgba(220,38,38,0.1)", color: "#dc2626", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        {PLAN_LABELS[plan]} · Limit reached
      </span>
    );
    return (
      <span style={{ padding: "3px 9px", borderRadius: 20, background: "#fff5ec", color: "#b05a00", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        {PLAN_LABELS[plan]} · {postsRemaining} post{postsRemaining !== 1 ? "s" : ""} left
      </span>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Confirm modal */}
      {showConfirm && (
        <ConfirmPostModal
          onConfirm={handlePost}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Social · Build in Public Wall</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Build In Public</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>Share milestones, funding, launches, and updates with the NextBigTool community.</p>
        </div>
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
          {/* Post error banner */}
          {postError && (
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10, marginBottom: 12,
              background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)",
              fontSize: 12.5, gap: 8,
            }}>
              <span style={{ color: "#dc2626", display: "flex", alignItems: "flex-start", gap: 7, flex: 1 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {postError}
              </span>
              <button
                onClick={() => setPostError(null)}
                style={{ background: "none", border: "none", fontSize: 14, color: "#dc2626", cursor: "pointer", padding: 0, flexShrink: 0 }}
              >✕</button>
            </div>
          )}

          {/* Draft restored banner */}
          {hasDraft && !draftSaved && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10, marginBottom: 12,
              background: "rgba(59,127,255,0.08)", border: "1px solid rgba(59,127,255,0.25)",
              fontSize: 12.5,
            }}>
              <span style={{ color: "var(--ink)", display: "flex", alignItems: "center", gap: 7 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#3b7fff" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <b style={{ color: "#3b7fff" }}>Draft restored</b> — pick up where you left off.
              </span>
              <button
                onClick={handleDiscardDraft}
                style={{ background: "none", border: "none", fontSize: 12, color: "var(--ink-muted)", cursor: "pointer", padding: "2px 6px", borderRadius: 5 }}
              >
                Discard
              </button>
            </div>
          )}

          {/* Draft saved toast */}
          {draftSaved && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, marginBottom: 12,
              background: "rgba(0,184,122,0.08)", border: "1px solid rgba(0,184,122,0.25)",
              fontSize: 12.5, color: "#00B87A", display: "flex", alignItems: "center", gap: 7,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="2.5"><path d="M5 12l5 5 9-11"/></svg>
              Draft saved — it will be here when you come back.
            </div>
          )}

          {/* Composer */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <AvatarOrInitials avatarUrl={profile?.avatar_url ?? null} initials={initials} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{displayName}</div>
                {(profile?.company || profile?.role) && (
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                    {[profile?.company, profile?.role].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                  Posting to <b>Build in Public Wall</b>
                  {tools.length > 0 && (
                    <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}
                      style={{ marginLeft: 6, fontSize: 11, border: "none", background: "transparent", color: "#ff6a3d", fontWeight: 600, cursor: "pointer" }}>
                      {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <ComposerBadge />
            </div>

            {/* Limit reached warning */}
            {!canPost && (
              <div style={{ padding: "10px 14px", borderRadius: 9, marginBottom: 10, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 12.5, color: "#dc2626", lineHeight: 1.5 }}>
                You&apos;ve reached your {PLAN_LABELS[plan]} plan posting limit.{" "}
                <Link href="/dashboard/plan" style={{ color: "#ff6a3d", fontWeight: 700, textDecoration: "none" }}>Upgrade to Core →</Link>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!canPost}
              placeholder={canPost ? "What shipped today? Share a milestone, funding round, or launch…" : "Upgrade to Core to keep posting…"}
              style={{
                width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
                padding: "10px 12px", fontSize: 13.5, lineHeight: 1.5,
                resize: "vertical" as const, minHeight: 80, fontFamily: "inherit",
                outline: "none", color: "var(--ink)",
                background: canPost ? "var(--surface)" : "var(--surface-alt)",
                opacity: canPost ? 1 : 0.6, boxSizing: "border-box" as const,
              }}
            />

            {/* Hashtag chips — clicking appends to textarea */}
            <div style={{ marginTop: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-faint)", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                Add hashtag
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {TAGS.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      disabled={!canPost}
                      style={{
                        padding: "4px 11px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                        cursor: canPost ? "pointer" : "default",
                        border: active ? "1.5px solid #ff6a3d" : "1.5px solid var(--border)",
                        background: active ? "rgba(255,106,61,0.1)" : "var(--surface-alt)",
                        color: active ? "#ff6a3d" : "var(--ink-muted)",
                        transition: "all 0.15s",
                        userSelect: "none" as const,
                      }}
                    >
                      {active && <span style={{ marginRight: 4 }}>✓</span>}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {/* Selected tags preview */}
              <div style={{ display: "flex", gap: 5, flex: 1 }}>
                {selectedTags.map(t => (
                  <span key={t} style={{ fontSize: 10.5, color: "#ff6a3d", fontWeight: 600 }}>{t}</span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSaveDraft}
                  disabled={!text.trim()}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                    background: "transparent", fontSize: 12, fontWeight: 600,
                    color: "var(--ink-muted)", cursor: text.trim() ? "pointer" : "not-allowed",
                    opacity: text.trim() ? 1 : 0.5,
                  }}
                >
                  Save draft
                </button>
                <button
                  onClick={() => { if (text.trim() && canPost) setShowConfirm(true); }}
                  disabled={!text.trim() || !canPost}
                  style={{
                    background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none",
                    borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#fff",
                    cursor: (!text.trim() || !canPost) ? "not-allowed" : "pointer",
                    opacity: (!text.trim() || !canPost) ? 0.6 : 1,
                  }}
                >
                  Post update
                </button>
              </div>
            </div>
          </div>

          {/* Hashtag filter tabs — dynamic from user's posts */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const, alignItems: "center" }}>
            <span style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginRight: 2 }}>Filter:</span>
            <button
              onClick={() => setTagFilter("all")}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: tagFilter === "all" ? "1.5px solid #ff6a3d" : "1.5px solid var(--border)",
                background: tagFilter === "all" ? "rgba(255,106,61,0.1)" : "var(--surface)",
                color: tagFilter === "all" ? "#ff6a3d" : "var(--ink-muted)",
              }}
            >
              All
            </button>
            {myTagOptions.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: tagFilter === tag ? "1.5px solid #ff6a3d" : "1.5px solid var(--border)",
                  background: tagFilter === tag ? "rgba(255,106,61,0.1)" : "var(--surface)",
                  color: tagFilter === tag ? "#ff6a3d" : "var(--ink-muted)",
                }}
              >
                {tag}
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
                  {tagFilter === "all"
                    ? "Share your first build-in-public update above!"
                    : `No posts tagged ${tagFilter} yet.`}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleMyPosts.map(p => (
                  <MyPostCard
                    key={p.id} post={p}
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
                <div style={{ fontSize: 12 }}>Be the first to post!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleWallPosts.map(p => (
                  <PostCard key={p.id} post={p} userId={userId} />
                ))}
              </div>
            )
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PlanSidebar plan={plan} postsUsed={myPosts.length} postsLimit={planLimit} />

          {/* Post performance */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Post performance</h3>
              <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 7, padding: 2, gap: 1 }}>
                {(["7d", "30d", "1y"] as const).map(r => (
                  <button key={r} onClick={() => setPerfRange(r)} style={{
                    padding: "3px 7px", borderRadius: 5, fontSize: 10.5, fontWeight: 600,
                    cursor: "pointer", border: "none",
                    background: perfRange === r ? "var(--surface)" : "transparent",
                    color: perfRange === r ? "var(--ink)" : "var(--ink-muted)",
                    boxShadow: perfRange === r ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                  }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Total posts",    val: perfStats.totalPosts.toString() },
                { label: "Total likes",    val: perfStats.totalLikes    > 0 ? perfStats.totalLikes.toString()    : "—" },
                { label: "Total comments", val: perfStats.totalComments > 0 ? perfStats.totalComments.toString() : "—" },
                { label: "Top tag",        val: topTagLabel },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-muted)" }}>{label}</span>
                  <b style={{ color: val === "—" ? "var(--ink-faint)" : "var(--ink)" }}>{val}</b>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-faint)", fontSize: 10.5, color: "var(--ink-faint)", textAlign: "center" }}>
              {perfRange === "7d" ? "Last 7 days" : perfRange === "30d" ? "Last 30 days" : "Last 12 months"}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
