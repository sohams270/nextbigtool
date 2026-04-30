"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── types ───────────────────────────────────────────────────────────────── */
type Nomination = {
  id: string;
  tool_id: string;
  pitch: string | null;
  status: "pending" | "approved" | "rejected";
  inducted_at: string | null;
  created_at: string;
  tools: { name: string; logo_url: string | null; tagline: string } | null;
};
type Tool = { id: string; name: string; tagline: string; logo_url: string | null };

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* ── Status badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:  { bg: "rgba(245,158,11,0.1)", fg: "#b45309", label: "In Review" },
    approved: { bg: "rgba(255,215,0,0.15)", fg: "#9a6a00", label: "🏆 Inducted" },
    rejected: { bg: "rgba(220,38,38,0.08)", fg: "#dc2626", label: "Not inducted" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" as const }}>
      {s.label}
    </span>
  );
}

const FREE_NOMINATION_LIMIT = 5;

/* ── Free limit gate (shown after 5 nominations) ─────────────────────────── */
function FreeLimitGate({ used }: { used: number }) {
  return (
    <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-muted)", marginBottom: 6 }}>
          <span>{used} / {FREE_NOMINATION_LIMIT} free nominations used</span>
          <span style={{ color: "#dc2626", fontWeight: 700 }}>Limit reached</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, background: "#dc2626", width: "100%" }} />
        </div>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
        background: "linear-gradient(135deg,#ffd700,#ff8c00)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>🏆</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>
        Free nomination limit reached
      </div>
      <p style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.6, margin: "0 0 18px" }}>
        You&apos;ve used all {FREE_NOMINATION_LIMIT} free nominations. Upgrade to{" "}
        <b style={{ color: "var(--ink)" }}>Core</b> for unlimited nominations, plus Hall of Fame badge, homepage placement, and press release.
      </p>
      <Link href="/dashboard/plan" style={{
        display: "inline-block", padding: "10px 22px",
        background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        color: "#fff", textDecoration: "none",
        boxShadow: "0 4px 14px rgba(255,61,136,0.3)",
      }}>
        Upgrade to Core →
      </Link>
    </div>
  );
}

/* ── Submit form ─────────────────────────────────────────────────────────── */
function SubmitForm({ tools, userId, nominations }: {
  tools: Tool[];
  userId: string;
  nominations: Nomination[];
}) {
  const supabase = createClient();
  const nominatedToolIds = new Set(nominations.map(n => n.tool_id));

  const availableTools = tools.filter(t => !nominatedToolIds.has(t.id));

  const [toolId,     setToolId]     = useState(availableTools[0]?.id ?? "");
  const [pitch,      setPitch]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const PITCH_MAX = 280;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!toolId || !pitch.trim()) return;
    setSubmitting(true); setError("");

    const { error: err } = await supabase.from("hall_of_fame").insert({
      user_id: userId,
      tool_id: toolId,
      pitch:   pitch.trim(),
    });

    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
  }

  if (availableTools.length === 0 && nominations.length > 0) {
    return (
      <div style={{ padding: "16px", borderRadius: 10, background: "var(--surface-alt)", border: "1px solid var(--border)", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>
        All your approved products have been nominated. Track their status on the right.
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div style={{ padding: "12px 14px", borderRadius: 9, background: "var(--surface-alt)", border: "1px solid var(--border)", fontSize: 12.5, color: "var(--ink-muted)" }}>
        No approved products yet. <Link href="/dashboard/products" style={{ color: "#ff6a3d", fontWeight: 600, textDecoration: "none" }}>Add your tool →</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Nomination submitted!</div>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, margin: 0 }}>
          The editorial team will review your nomination. You'll see the status update on the right.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Core badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 9, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)" }}>
        <span style={{ fontSize: 13 }}>🏆</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#9a6a00" }}>Core plan — permanent Hall of Fame placement</span>
      </div>

      {/* Product selector */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 5 }}>Select product to nominate</label>
        <select
          required
          value={toolId}
          onChange={e => setToolId(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 13, color: "var(--ink)", background: "var(--surface)", fontFamily: "inherit", outline: "none" }}
        >
          {availableTools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Pitch */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>
            Why it deserves Hall of Fame
          </label>
          <span style={{ fontSize: 10.5, color: pitch.length > PITCH_MAX ? "#dc2626" : "var(--ink-faint)" }}>
            {pitch.length}/{PITCH_MAX}
          </span>
        </div>
        <textarea
          required
          rows={4}
          maxLength={PITCH_MAX}
          placeholder="What makes this product exceptional? Key milestones, community impact, unique value…"
          value={pitch}
          onChange={e => setPitch(e.target.value)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: `1.5px solid ${pitch.length > PITCH_MAX ? "#dc2626" : "var(--border)"}`,
            fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            resize: "vertical" as const, background: "var(--surface)", boxSizing: "border-box" as const, lineHeight: 1.6,
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
        disabled={submitting || !toolId || !pitch.trim()}
        style={{
          width: "100%",
          background: (submitting || !toolId || !pitch.trim()) ? "var(--border)" : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
          border: "none", borderRadius: 9, padding: "11px 0",
          fontSize: 13, fontWeight: 700, color: "#fff",
          cursor: (submitting || !toolId || !pitch.trim()) ? "default" : "pointer",
          fontFamily: "inherit", transition: "opacity 0.15s",
        }}
      >
        {submitting ? "Submitting…" : "Nominate for Hall of Fame"}
      </button>
    </form>
  );
}

/* ── What you get card ───────────────────────────────────────────────────── */
function WhatYouGet() {
  return (
    <div style={{
      ...card,
      padding: "20px 20px 18px",
      background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>✦</span>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0 }}>What you get</h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {[
          { icon: "🏠", title: "Homepage strip", desc: "Your product appears in the Hall of Fame section on the NextBigTool homepage — visible to every visitor, forever." },
          { icon: "🏆", title: "HoF badge on listing", desc: "A permanent gold Hall of Fame badge shows on your tool's listing page." },
          { icon: "🔗", title: "Dedicated HoF page", desc: "Featured on /discover?tab=hall-of-fame — the curated showcase of the best products." },
          { icon: "📰", title: "Newsletter priority", desc: "Inducted products get priority placement in newsletter features." },
        ].map(p => (
          <div key={p.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{p.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 0 14px" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>Process</div>
        {[
          { n: "1", text: "Nominate your product with a pitch" },
          { n: "2", text: "Editorial team reviews within 7 days" },
          { n: "3", text: "If approved — inducted permanently" },
          { n: "4", text: "Appears on homepage + HoF page immediately" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#ffd700,#ff8c00)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#fff",
            }}>{s.n}</div>
            <span style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: "20px" }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function HallOfFamePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId,      setUserId]      = useState<string | null>(null);
  const [plan,        setPlan]        = useState<string>("free");
  const [tools,       setTools]       = useState<Tool[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      const isAdmin = user.email === "sohams270@gmail.com";

      Promise.all([
        supabase.from("profiles").select("plan").eq("id", user.id).single(),
        supabase.from("tools").select("id, name, tagline, logo_url").eq("submitter_id", user.id).eq("status", "approved"),
        supabase.from("hall_of_fame").select("id, tool_id, pitch, status, inducted_at, created_at, tools(name, logo_url, tagline)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]).then(([profileRes, toolsRes, nomRes]) => {
        setPlan(isAdmin ? "core" : (profileRes.data?.plan ?? "free"));
        setTools((toolsRes.data ?? []) as Tool[]);
        setNominations((nomRes.data ?? []) as unknown as Nomination[]);
        setLoading(false);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isCore = plan === "core";
  const freeAtLimit = !isCore && nominations.length >= FREE_NOMINATION_LIMIT;
  const nominationsLeft = isCore ? null : Math.max(0, FREE_NOMINATION_LIMIT - nominations.length);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)" }}>
            Hall of Fame
          </div>
          {!isCore && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, background: freeAtLimit ? "rgba(220,38,38,0.08)" : "rgba(255,215,0,0.1)", border: `1px solid ${freeAtLimit ? "rgba(220,38,38,0.2)" : "rgba(255,215,0,0.3)"}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: freeAtLimit ? "#dc2626" : "#9a6a00" }}>
                {freeAtLimit ? "Limit reached" : `${nominationsLeft} nomination${nominationsLeft !== 1 ? "s" : ""} left`}
              </span>
            </div>
          )}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          🏆 Hall of Fame
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Permanent, curated showcase of the best products on NextBigTool — homepage visibility, forever.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Left: Submit + What you get ──────────────────────────────── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "20px 20px 22px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              Nominate your product
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "0 0 18px", lineHeight: 1.55 }}>
              Get permanent placement in the Hall of Fame — no expiry, no re-submission needed.
            </p>

            {loading ? (
              <div style={{ height: 80, background: "var(--surface-alt)", borderRadius: 8 }} />
            ) : freeAtLimit ? (
              <FreeLimitGate used={nominations.length} />
            ) : userId ? (
              <SubmitForm tools={tools} userId={userId} nominations={nominations} />
            ) : null}
          </div>

          <WhatYouGet />
        </aside>

        {/* ── Right: Nominations history ───────────────────────────────── */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-faint)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Your nominations</h2>
            {!isCore && nominations.length > 0 && (
              <span style={{ fontSize: 11, color: freeAtLimit ? "#dc2626" : "var(--ink-muted)", fontWeight: 600 }}>
                {nominations.length} / {FREE_NOMINATION_LIMIT} used
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>Loading…</div>
          ) : nominations.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>No nominations yet</div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
                {freeAtLimit
                  ? "Upgrade to Core to submit more nominations."
                  : "Submit a nomination on the left to get your product into the Hall of Fame."}
              </p>
            </div>
          ) : (
            nominations.map((nom, idx) => (
              <div key={nom.id} style={{
                padding: "18px 20px",
                borderBottom: idx < nominations.length - 1 ? "1px solid var(--border-faint)" : "none",
                display: "flex", alignItems: "flex-start", gap: 16,
              }}>
                {/* Logo */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: nom.tools?.logo_url ? "transparent" : `hsl(${(nom.tools?.name.charCodeAt(0) ?? 0) * 7 % 360},60%,50%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#fff", overflow: "hidden",
                  border: nom.status === "approved" ? "2px solid #ffd700" : "1px solid var(--border)",
                }}>
                  {nom.tools?.logo_url
                    ? <img src={nom.tools.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (nom.tools?.name[0] ?? "?")}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                    <b style={{ fontSize: 14, color: "var(--ink)" }}>{nom.tools?.name}</b>
                    <StatusBadge status={nom.status} />
                    {nom.status === "approved" && nom.inducted_at && (
                      <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>Inducted {fmtMonth(nom.inducted_at)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 6 }}>{nom.tools?.tagline}</div>
                  {nom.pitch && (
                    <div style={{
                      fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.5,
                      padding: "7px 10px", borderRadius: 7,
                      background: "var(--surface-alt)", borderLeft: "2px solid var(--border)",
                    }}>
                      {nom.pitch}
                    </div>
                  )}
                </div>

                {/* Trophy for inducted */}
                {nom.status === "approved" && (
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg,#ffd700,#ff8c00)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>🏆</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
