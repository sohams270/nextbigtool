"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notifyAdmin } from "@/app/lib/notifyAdmin";

/* ── types ───────────────────────────────────────────────────────────────── */
type BlogRequest = {
  id: string;
  company_name: string;
  headline: string;
  story: string;
  link: string | null;
  status: "pending" | "approved" | "rejected" | "published";
  blog_url: string | null;
  created_at: string;
};

type Tool = { id: string; name: string };
type Profile = { plan: string; full_name: string | null };

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ── StatusBadge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: "rgba(245,158,11,0.1)",  fg: "#b45309",  label: "In Review" },
    approved:  { bg: "rgba(59,127,255,0.1)",  fg: "#3b7fff",  label: "Approved" },
    rejected:  { bg: "rgba(220,38,38,0.08)",  fg: "#dc2626",  label: "Rejected" },
    published: { bg: "rgba(0,184,122,0.1)",   fg: "#00875A",  label: "Published" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" as const }}>
      {s.label}
    </span>
  );
}

/* ── Core gate overlay ───────────────────────────────────────────────────── */
function CoreGate() {
  return (
    <div style={{ ...card, padding: "28px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
        Featured Blog is a Core plan feature
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
        Upgrade to <b style={{ color: "var(--ink)" }}>Core</b> to trigger a high-authority PR blog post written about your company — with a backlink included.
      </p>
      <Link href="/dashboard/plan" style={{
        display: "inline-block", padding: "10px 24px",
        background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        color: "#fff", textDecoration: "none",
      }}>
        Upgrade to Core →
      </Link>
    </div>
  );
}

/* ── Submit form ─────────────────────────────────────────────────────────── */
function SubmitForm({ tools, userId, existingRequest }: {
  tools: Tool[];
  userId: string;
  existingRequest: BlogRequest | null;
}) {
  const supabase = createClient();

  const [toolId,      setToolId]      = useState(tools[0]?.id ?? "");
  const [companyName, setCompanyName] = useState("");
  const [headline,    setHeadline]    = useState("");
  const [story,       setStory]       = useState("");
  const [link,        setLink]        = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  const COMPANY_MAX = 100;
  const HEADLINE_MAX = 120;
  const STORY_MAX    = 600;

  // If already submitted this month, show status instead
  if (existingRequest && !success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 9, background: "rgba(255,106,61,0.08)", border: "1px solid rgba(255,106,61,0.2)" }}>
          <span style={{ fontSize: 13 }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6a3d" }}>Core plan — 1 featured blog post per month</span>
        </div>
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{existingRequest.headline}</span>
            <StatusBadge status={existingRequest.status} />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Submitted {fmtDate(existingRequest.created_at)}</div>
          {existingRequest.status === "published" && existingRequest.blog_url && (
            <a href={existingRequest.blog_url} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10,
              padding: "6px 14px", borderRadius: 8,
              border: "1px solid var(--border)", fontSize: 12, fontWeight: 600,
              color: "var(--ink-2)", textDecoration: "none", background: "var(--surface)",
            }}>
              Read post ↗
            </a>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: 0, lineHeight: 1.6 }}>
          You've used your monthly slot. Your next slot resets on the 1st of next month.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !headline.trim() || !story.trim()) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("blog_post_requests").insert({
      user_id:      userId,
      tool_id:      toolId || null,
      company_name: companyName.trim(),
      headline:     headline.trim(),
      story:        story.trim(),
      link:         link.trim() || null,
    });

    setSubmitting(false);
    if (err) { setError(err.message); return; }

    // Notify admin of blog post request
    notifyAdmin({
      type:        "blog_request",
      founderName: userId ?? "Unknown",
      companyName: companyName.trim(),
      headline:    headline.trim(),
      story:       story.trim(),
      ...(link.trim() ? { link: link.trim() } : {}),
    });

    setSuccess(true);
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Request received!</div>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: 0 }}>
          The editorial team will review and publish your blog post within 48 hours. You'll see the live link here once it's live.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Plan badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 9, background: "rgba(255,106,61,0.08)", border: "1px solid rgba(255,106,61,0.2)" }}>
        <span style={{ fontSize: 13 }}>✦</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6a3d" }}>Core plan — 1 featured blog post per month</span>
      </div>

      {/* Product selector */}
      {tools.length > 0 ? (
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 5 }}>Related product</label>
          <select
            value={toolId}
            onChange={e => setToolId(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--ink)", background: "var(--surface)", fontFamily: "inherit", outline: "none" }}
          >
            <option value="">No specific product</option>
            {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ padding: "10px 12px", borderRadius: 9, background: "var(--surface-alt)", border: "1px solid var(--border)", fontSize: 12.5, color: "var(--ink-muted)" }}>
          No approved products yet. <Link href="/dashboard/products" style={{ color: "#ff6a3d", fontWeight: 600, textDecoration: "none" }}>Add your tool →</Link>
        </div>
      )}

      {/* Company name */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>Company / product name</label>
          <span style={{ fontSize: 10.5, color: companyName.length > COMPANY_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {companyName.length}/{COMPANY_MAX}
          </span>
        </div>
        <input
          required
          maxLength={COMPANY_MAX}
          placeholder="e.g. PromptCraft"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: `1.5px solid ${companyName.length > COMPANY_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            background: "var(--surface)", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Headline */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>Blog headline</label>
          <span style={{ fontSize: 10.5, color: headline.length > HEADLINE_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {headline.length}/{HEADLINE_MAX}
          </span>
        </div>
        <input
          required
          maxLength={HEADLINE_MAX}
          placeholder="e.g. How PromptCraft is redefining AI workflows for founders"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: `1.5px solid ${headline.length > HEADLINE_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            background: "var(--surface)", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Story */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>
            Your story <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>· what should the blog cover?</span>
          </label>
          <span style={{ fontSize: 10.5, color: story.length > STORY_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {story.length}/{STORY_MAX}
          </span>
        </div>
        <textarea
          required
          rows={5}
          maxLength={STORY_MAX}
          placeholder="Tell us about your product, your journey, key milestones, and what makes you unique. The editorial team will craft the full blog from this."
          value={story}
          onChange={e => setStory(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: `1.5px solid ${story.length > STORY_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            resize: "vertical" as const, background: "var(--surface)", boxSizing: "border-box" as const,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Link (optional) */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 5 }}>
          Reference link <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>· optional</span>
        </label>
        <input
          type="url"
          placeholder="https://…"
          value={link}
          onChange={e => setLink(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: "1.5px solid var(--border)",
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            background: "var(--surface)", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {error && (
        <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", fontSize: 12, color: "#dc2626" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !companyName.trim() || !headline.trim() || !story.trim()}
        style={{
          width: "100%",
          background: (submitting || !companyName.trim() || !headline.trim() || !story.trim())
            ? "var(--border)"
            : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
          border: "none", borderRadius: 9, padding: "11px 0",
          fontSize: 13, fontWeight: 700, color: "#fff",
          cursor: (submitting || !companyName.trim() || !headline.trim() || !story.trim()) ? "default" : "pointer",
          fontFamily: "inherit", transition: "opacity 0.15s",
        }}
      >
        {submitting ? "Submitting…" : "Trigger Featured Blog Post"}
      </button>
    </form>
  );
}

/* ── How it works ────────────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <div style={{
      ...card,
      padding: "20px 20px 18px",
      background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 15 }}>✍️</span>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
          How featuring works
        </h3>
      </div>

      {/* What you get */}
      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,106,61,0.07)", border: "1px solid rgba(255,106,61,0.2)", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6a3d", marginBottom: 8 }}>What you get</div>
        {[
          "1 full blog post per month, written by our editors",
          "High-authority backlink pointing to your site",
          "Acts as your PR story — shareable & indexable",
          "Published on the NextBigTool blog",
        ].map(p => (
          <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
            <span style={{ color: "#ff6a3d", fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
            {p}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 10 }}>
        Process
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { n: "1", text: "Submit your story — company, headline, context" },
          { n: "2", text: "Editorial review within 24h" },
          { n: "3", text: "Full blog post written & published within 48h" },
          { n: "4", text: "Live link appears on this dashboard" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#ff6a3d,#ff3d88)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff",
            }}>{s.n}</div>
            <span style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: "22px" }}>{s.text}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />

      <div style={{ fontSize: 11.5, color: "var(--ink-faint)", lineHeight: 1.6 }}>
        <b style={{ color: "var(--ink-muted)" }}>Note:</b> 1 blog post per calendar month. Slots reset on the 1st. The editorial team may request edits before publishing.
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId,   setUserId]   = useState<string | null>(null);
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [tools,    setTools]    = useState<Tool[]>([]);
  const [requests, setRequests] = useState<BlogRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const isAdmin = user.email === "sohams270@gmail.com";

      Promise.all([
        supabase.from("profiles").select("full_name, plan").eq("id", user.id).single(),
        supabase.from("tools").select("id, name").eq("submitter_id", user.id).eq("status", "approved"),
        supabase.from("blog_post_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]).then(([profileRes, toolsRes, reqRes]) => {
        setProfile({
          full_name: profileRes.data?.full_name ?? null,
          plan: isAdmin ? "core" : (profileRes.data?.plan ?? "free"),
        });
        setTools((toolsRes.data ?? []) as Tool[]);
        setRequests((reqRes.data ?? []) as BlogRequest[]);
        setLoading(false);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = profile?.plan ?? "free";
  const isCore = plan === "core";

  // Most recent request this calendar month
  const now = new Date();
  const thisMonthRequest = requests.find(r => {
    const d = new Date(r.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }) ?? null;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Core Feature</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          Featured Blog Post
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Get a high-authority PR blog post written about your company — 1 per month, with a backlink included.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Sidebar (left) ──────────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Submit card */}
          <div style={{ ...card, padding: "20px 20px 22px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Submit your story
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "0 0 18px", lineHeight: 1.55 }}>
              Our editors will craft a full blog post about your company, product, or milestone.
            </p>

            {loading ? (
              <div style={{ height: 80, background: "var(--surface-alt)", borderRadius: 8 }} />
            ) : !isCore ? (
              <CoreGate />
            ) : userId ? (
              <SubmitForm tools={tools} userId={userId} existingRequest={thisMonthRequest} />
            ) : null}
          </div>

          {/* How it works */}
          <HowItWorks />
        </aside>

        {/* ── Past posts list ─────────────────────────────────────────── */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-faint)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Your blog posts</h2>
          </div>

          {loading ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
              Loading…
            </div>
          ) : !isCore ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Core plan only</div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px" }}>Upgrade to Core to unlock featured blog posts.</p>
              <Link href="/dashboard/plan" style={{
                padding: "8px 20px", borderRadius: 9,
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                fontSize: 12.5, fontWeight: 700, color: "#fff", textDecoration: "none",
              }}>
                View plans →
              </Link>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✍️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>No blog posts yet</div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
                Submit your story on the right to trigger your first featured post.
              </p>
            </div>
          ) : (
            requests.map((req, idx) => (
              <div key={req.id} style={{
                padding: "18px 20px",
                borderBottom: idx < requests.length - 1 ? "1px solid var(--border-faint)" : "none",
                display: "flex", alignItems: "flex-start", gap: 16,
              }}>
                {/* Date */}
                <div style={{ width: 44, flexShrink: 0, textAlign: "center", paddingTop: 2 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                    {new Date(req.created_at).getDate()}
                  </div>
                  <div style={{ fontSize: 9.5, color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.05em" }}>
                    {new Date(req.created_at).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                    <b style={{ fontSize: 14, color: "var(--ink)" }}>{req.headline}</b>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 6 }}>
                    {req.company_name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    {req.story}
                  </div>
                </div>

                {/* Action */}
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  {req.status === "published" && req.blog_url ? (
                    <a
                      href={req.blog_url}
                      target="_blank" rel="noreferrer"
                      style={{
                        padding: "6px 14px", borderRadius: 8,
                        border: "1px solid var(--border)", fontSize: 12, fontWeight: 600,
                        color: "var(--ink-2)", textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: "var(--surface)",
                      }}
                    >
                      Read post ↗
                    </a>
                  ) : req.status === "pending" ? (
                    <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>Awaiting review</span>
                  ) : req.status === "approved" ? (
                    <span style={{ fontSize: 11.5, color: "#3b7fff" }}>Writing in progress</span>
                  ) : (
                    <span style={{ fontSize: 11.5, color: "#dc2626" }}>Not approved</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
