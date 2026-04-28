"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── types ───────────────────────────────────────────────────────────────── */
type Issue = {
  id: string;
  number: number;
  title: string;
  status: "sent" | "scheduled" | "draft";
  sent_at: string | null;
  subscribers_count: number | null;
  open_rate: number | null;
  click_rate: number | null;
  live_url: string | null;
};

type Tool = { id: string; name: string };
type Profile = { plan: string; full_name: string | null };

const PLAN_ORDER = ["free", "basic", "core"];
const canFeature = (plan: string) => plan === "basic" || plan === "core";


const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtDay(iso: string) {
  return {
    day:   new Date(iso).getDate(),
    month: new Date(iso).toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

/* ── StatusBadge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    sent:      { bg: "rgba(0,184,122,0.1)", fg: "#00875A", label: "Sent" },
    scheduled: { bg: "rgba(245,158,11,0.1)", fg: "#b45309", label: "Upcoming" },
    draft:     { bg: "var(--surface-alt)", fg: "var(--ink-muted)", label: "Draft" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" as const }}>
      {s.label}
    </span>
  );
}

/* ── Plan gate overlay ───────────────────────────────────────────────────── */
function FreeGate() {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "28px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
        Newsletter featuring is a paid feature
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
        Upgrade to <b style={{ color: "var(--ink)" }}>Basic</b> to submit your story for editorial review, or <b style={{ color: "var(--ink)" }}>Core</b> for a guaranteed weekly placement slot.
      </p>
      <Link href="/dashboard/plan" style={{
        display: "inline-block", padding: "10px 24px",
        background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        color: "#fff", textDecoration: "none",
      }}>
        View plans →
      </Link>
    </div>
  );
}

/* ── Submit form ─────────────────────────────────────────────────────────── */
function SubmitForm({ tools, plan, userId }: { tools: Tool[]; plan: string; userId: string }) {
  const supabase = createClient();
  const isCore   = plan === "core";

  const [toolId, setToolId]       = useState(tools[0]?.id ?? "");
  const [headline, setHeadline]   = useState("");
  const [story, setStory]         = useState("");
  const [link, setLink]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const HEADLINE_MAX = 80;
  const STORY_MAX    = 280;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!headline.trim() || !story.trim()) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("newsletter_submissions").insert({
      user_id:  userId,
      tool_id:  toolId || null,
      headline: headline.trim(),
      story:    story.trim(),
      link:     link.trim() || null,
    });

    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setHeadline(""); setStory(""); setLink("");
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Submission received!</div>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
          The editorial team will review your submission and notify you if it&apos;s included in the next issue.
        </p>
        <button
          onClick={() => setSuccess(false)}
          style={{ fontSize: 12, color: "#ff6a3d", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
        >
          Submit another update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Plan badge */}
      {isCore ? (
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 9, background: "rgba(255,106,61,0.08)", border: "1px solid rgba(255,106,61,0.2)" }}>
          <span style={{ fontSize: 13 }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#ff6a3d" }}>Core plan — weekly placement slot</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 9, background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>Basic plan — editorial review, not guaranteed</span>
        </div>
      )}

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
          No approved products found. <Link href="/dashboard/submit" style={{ color: "#ff6a3d", fontWeight: 600, textDecoration: "none" }}>Submit a tool →</Link>
        </div>
      )}

      {/* Headline */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>Headline</label>
          <span style={{ fontSize: 10.5, color: headline.length > HEADLINE_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {headline.length}/{HEADLINE_MAX}
          </span>
        </div>
        <input
          required
          maxLength={HEADLINE_MAX}
          placeholder="e.g. PromptCraft hits 1,000 DAUs"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px",
            borderRadius: 8, border: `1.5px solid ${headline.length > HEADLINE_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            background: "var(--surface)", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Story */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>
            Story <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>· 2–3 sentences</span>
          </label>
          <span style={{ fontSize: 10.5, color: story.length > STORY_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {story.length}/{STORY_MAX}
          </span>
        </div>
        <textarea
          required
          rows={3}
          maxLength={STORY_MAX}
          placeholder="Why is this interesting to NextBigTool readers?"
          value={story}
          onChange={e => setStory(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px",
            borderRadius: 8, border: `1.5px solid ${story.length > STORY_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            resize: "vertical" as const, background: "var(--surface)", boxSizing: "border-box" as const,
          }}
        />
      </div>

      {/* Link (optional) */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 5 }}>
          Link <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>· optional, 1 max</span>
        </label>
        <input
          type="url"
          placeholder="https://…"
          value={link}
          onChange={e => setLink(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px",
            borderRadius: 8, border: "1.5px solid var(--border)",
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
        disabled={submitting || !headline.trim() || !story.trim() || headline.length > HEADLINE_MAX || story.length > STORY_MAX}
        style={{
          width: "100%",
          background: (submitting || !headline.trim() || !story.trim()) ? "var(--border)" : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
          border: "none", borderRadius: 9, padding: "11px 0",
          fontSize: 13, fontWeight: 700, color: "#fff",
          cursor: (submitting || !headline.trim() || !story.trim()) ? "default" : "pointer",
          fontFamily: "inherit", transition: "opacity 0.15s",
        }}
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}

/* ── How it works card ───────────────────────────────────────────────────── */
function HowItWorks({ plan }: { plan: string }) {
  const tiers = [
    {
      name: "Free",
      icon: "○",
      color: "var(--ink-faint)",
      bg: "var(--surface-alt)",
      border: "var(--border)",
      active: plan === "free",
      perks: ["Read past issues", "Like & comment on posts"],
      locked: "No newsletter featuring",
    },
    {
      name: "Basic",
      icon: "◑",
      color: "#3B7FFF",
      bg: "rgba(59,127,255,0.06)",
      border: "rgba(59,127,255,0.25)",
      active: plan === "basic",
      perks: ["Submit story for review", "Editorial team picks the best", "Not guaranteed placement"],
      locked: null,
    },
    {
      name: "Core",
      icon: "✦",
      color: "#ff6a3d",
      bg: "rgba(255,106,61,0.06)",
      border: "rgba(255,106,61,0.3)",
      active: plan === "core",
      perks: ["Weekly placement slot", "Priority editorial review", "Guaranteed inclusion"],
      locked: null,
    },
  ];

  return (
    <div style={{
      ...card,
      padding: "20px 20px 18px",
      background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 15 }}>📬</span>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>
          How featuring works
        </h3>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18, paddingLeft: 4 }}>
        {[
          { n: "1", text: "Submit by Wednesday 6pm PT" },
          { n: "2", text: "Editorial review within 48h" },
          { n: "3", text: "Included in Thursday's issue if approved" },
          { n: "4", text: "Track opens & clicks from this dashboard" },
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

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", margin: "0 0 16px" }} />

      {/* Plan tiers */}
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 10 }}>
        Access by plan
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tiers.map(t => (
          <div key={t.name} style={{
            padding: "10px 13px", borderRadius: 10,
            background: t.active ? t.bg : "transparent",
            border: `1px solid ${t.active ? t.border : "var(--border-faint)"}`,
            transition: "all 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: t.color }}>{t.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: t.active ? "var(--ink)" : "var(--ink-muted)" }}>
                {t.name}
              </span>
              {t.active && (
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                  Your plan
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 19 }}>
              {t.perks.map(p => (
                <div key={p} style={{ fontSize: 11.5, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: t.color, fontSize: 10 }}>✓</span> {p}
                </div>
              ))}
              {t.locked && (
                <div style={{ fontSize: 11.5, color: "var(--ink-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10 }}>✕</span> {t.locked}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plan === "free" && (
        <Link href="/dashboard/plan" style={{
          display: "block", textAlign: "center", marginTop: 14,
          padding: "9px 0", borderRadius: 9,
          background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
          fontSize: 12.5, fontWeight: 700, color: "#fff", textDecoration: "none",
        }}>
          Upgrade to feature →
        </Link>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function NewsletterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId]   = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tools, setTools]     = useState<Tool[]>([]);
  const [issues, setIssues]   = useState<Issue[]>([]);
  const [issueFilter, setIssueFilter] = useState<"all" | "mine">("all");
  const [mySubmittedIssueIds, setMySubmittedIssueIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const isAdmin = user.email === "sohams270@gmail.com";

      // Profile + plan
      supabase.from("profiles").select("full_name, plan")
        .eq("id", user.id).single()
        .then(({ data }) => setProfile({
          full_name: data?.full_name ?? null,
          plan: isAdmin ? "core" : (data?.plan ?? "free"),
        }));

      // Approved tools
      supabase.from("tools").select("id, name")
        .eq("submitter_id", user.id).eq("status", "approved")
        .then(({ data }) => setTools((data ?? []) as Tool[]));

      // Newsletter issues
      supabase.from("newsletter_issues").select("*")
        .order("number", { ascending: false }).limit(10)
        .then(({ data }) => setIssues((data ?? []) as Issue[]));

      // Issues where user has a submission
      supabase.from("newsletter_submissions").select("issue_id")
        .eq("user_id", user.id)
        .then(({ data }) => setMySubmittedIssueIds(
          (data ?? []).map((r: { issue_id: string | null }) => r.issue_id).filter(Boolean) as string[]
        ));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = profile?.plan ?? "free";

  const displayIssues = issueFilter === "mine"
    ? issues.filter(i => mySubmittedIssueIds.includes(i.id))
    : issues;

  const upcomingIssue = issues.find(i => i.status === "scheduled");

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Weekly Digest</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Newsletter</h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Past issues sent by the NextBigTool team — and submit your story to be featured.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* ── Issues list ────────────────────────────────────────────── */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-faint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Past issues</h2>
            <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 9, padding: 3 }}>
              {(["all", "mine"] as const).map(f => (
                <button key={f} onClick={() => setIssueFilter(f)} style={{
                  padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                  cursor: "pointer", border: "none", fontFamily: "inherit",
                  background: issueFilter === f ? "var(--surface)" : "transparent",
                  color: issueFilter === f ? "var(--ink)" : "var(--ink-muted)",
                  boxShadow: issueFilter === f ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                }}>
                  {f === "all" ? "All issues" : "My submissions"}
                </button>
              ))}
            </div>
          </div>

          {displayIssues.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-muted)", fontSize: 13 }}>
              {issueFilter === "mine" ? "You haven't been included in any issue yet." : "No issues found."}
            </div>
          ) : (
            displayIssues.map((issue, idx) => {
              const dateInfo = issue.sent_at ? fmtDay(issue.sent_at) : null;
              const isLast = idx === displayIssues.length - 1;
              return (
                <div key={issue.id} style={{
                  padding: "16px 20px",
                  borderBottom: isLast ? "none" : "1px solid var(--border-faint)",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  {/* Date column */}
                  <div style={{ width: 44, flexShrink: 0, textAlign: "center" }}>
                    {dateInfo ? (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{dateInfo.day}</div>
                        <div style={{ fontSize: 9.5, color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.05em" }}>{dateInfo.month}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>TBD</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--ink-faint)", fontVariantNumeric: "tabular-nums" }}>
                        #{issue.number}
                      </span>
                      <b style={{ fontSize: 14, color: "var(--ink)" }}>{issue.title}</b>
                      <StatusBadge status={issue.status} />
                    </div>
                    {issue.status === "sent" && issue.subscribers_count ? (
                      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-muted)" }}>
                        <span>📤 Sent to <b style={{ color: "var(--ink)" }}>{issue.subscribers_count.toLocaleString()}</b></span>
                        {issue.open_rate != null && (
                          <span>👁 Open rate: <b style={{ color: "var(--ink)" }}>{issue.open_rate}%</b></span>
                        )}
                        {issue.click_rate != null && (
                          <span>🖱 Click rate: <b style={{ color: "var(--ink)" }}>{issue.click_rate}%</b></span>
                        )}
                      </div>
                    ) : issue.status === "scheduled" ? (
                      <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                        Submissions close Wed · Editorial review this week
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Draft — not yet scheduled</div>
                    )}
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {issue.status === "sent" && issue.live_url ? (
                      <a
                        href={issue.live_url}
                        target="_blank" rel="noreferrer"
                        style={{
                          padding: "6px 14px", borderRadius: 8,
                          border: "1px solid var(--border)", fontSize: 12, fontWeight: 600,
                          color: "var(--ink-2)", textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "var(--surface)",
                        }}
                      >
                        Live link ↗
                      </a>
                    ) : issue.status === "scheduled" && canFeature(plan) ? (
                      <button
                        onClick={() => document.getElementById("submit-form-anchor")?.scrollIntoView({ behavior: "smooth" })}
                        style={{
                          background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                          border: "none", borderRadius: 8, padding: "6px 14px",
                          fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Submit update
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }} id="submit-form-anchor">

          {/* Submit card */}
          <div style={{ ...card, padding: "20px 20px 22px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Submit an update
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "0 0 18px", lineHeight: 1.55 }}>
              Got a launch, milestone, or story? The NBT editorial team reviews for the next issue.
            </p>

            {!profile ? (
              <div style={{ height: 80, background: "var(--surface-alt)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            ) : !canFeature(plan) ? (
              <FreeGate />
            ) : userId ? (
              <SubmitForm tools={tools} plan={plan} userId={userId} />
            ) : null}
          </div>

          {/* How featuring works */}
          <HowItWorks plan={plan} />
        </aside>
      </div>
    </main>
  );
}
