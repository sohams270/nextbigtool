import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

type Tool = {
  id: string;
  name: string;
  tagline: string;
  upvote_count: number;
  view_count: number;
  status: string;
  logo_url: string | null;
  website_url: string | null;
};

/* ─── shared dash styles ─── */
const card: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 20,
};
const pageHead: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  marginBottom: 24,
};
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const,
  letterSpacing: "0.08em", color: "var(--ink-muted)" as string, marginBottom: 4,
};
const h1: React.CSSProperties = {
  fontSize: 22, fontWeight: 800, color: "var(--ink)" as string,
  letterSpacing: "-0.02em", margin: "0 0 4px",
};
const sub: React.CSSProperties = { fontSize: 13, color: "var(--ink-muted)" as string, margin: 0 };
const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
  border: "none", borderRadius: 9, padding: "0 18px", height: 36,
  fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
  textDecoration: "none",
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildSeriesPath(
  buckets: number[],
  maxV: number,
  viewBox = { w: 600, h: 160 }
): { line: string; area: string } {
  const n = buckets.length;
  const PAD = { t: 10, b: 20 };
  const chartH = viewBox.h - PAD.t - PAD.b;

  const points = buckets.map((v, i) => {
    const x = n === 1 ? viewBox.w / 2 : (i / (n - 1)) * viewBox.w;
    const y = PAD.t + chartH * (1 - v / maxV);
    return [x, y] as [number, number];
  });

  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${d} L${last[0].toFixed(1)},${viewBox.h} L${first[0].toFixed(1)},${viewBox.h} Z`;

  return { line: d, area };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: toolsData } = await supabase
    .from("tools")
    .select("id, name, tagline, upvote_count, view_count, status, logo_url, website_url")
    .eq("submitter_id", user.id)
    .order("upvote_count", { ascending: false });

  const myTools    = (toolsData ?? []) as Tool[];
  const totalUpvotes = myTools.reduce((s, t) => s + (t.upvote_count ?? 0), 0);
  const totalViews   = myTools.reduce((s, t) => s + (t.view_count ?? 0), 0);
  const liveTools    = myTools.filter(t => t.status === "approved").length;
  const myToolIds    = myTools.map(t => t.id);

  /* ── chart history (14 days) ── */
  const DAYS = 14;
  const upvoteBuckets: number[] = Array(DAYS).fill(0);
  const viewBuckets: number[]   = Array(DAYS).fill(0);

  const dayLabels: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayLabels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }

  let recentUpvotes: { created_at: string; tool_id: string }[] = [];

  if (myToolIds.length > 0) {
    const since = new Date();
    since.setDate(since.getDate() - (DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [{ data: histUpvotes }, { data: histViews }, { data: recentData }] = await Promise.all([
      supabase
        .from("upvotes")
        .select("created_at, tool_id")
        .in("tool_id", myToolIds)
        .gte("created_at", since.toISOString()),
      supabase
        .from("tool_view_logs")
        .select("created_at")
        .in("tool_id", myToolIds)
        .gte("created_at", since.toISOString()),
      supabase
        .from("upvotes")
        .select("created_at, tool_id")
        .in("tool_id", myToolIds)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    (histUpvotes ?? []).forEach(row => {
      const idx = DAYS - 1 - Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000);
      if (idx >= 0 && idx < DAYS) upvoteBuckets[idx]++;
    });

    (histViews ?? []).forEach(row => {
      const idx = DAYS - 1 - Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000);
      if (idx >= 0 && idx < DAYS) viewBuckets[idx]++;
    });

    recentUpvotes = recentData ?? [];
  }

  const globalMax = Math.max(...upvoteBuckets, ...viewBuckets, 1);
  const upvotePaths = buildSeriesPath(upvoteBuckets, globalMax);
  const viewPaths   = buildSeriesPath(viewBuckets,   globalMax);

  const toolMap = Object.fromEntries(myTools.map(t => [t.id, t.name]));

  const displayName = user.user_metadata?.full_name?.split(" ")[0]
    || user.email?.split("@")[0]
    || "there";

  const kpis = [
    { label: "Total Upvotes", value: totalUpvotes.toLocaleString(), delta: "across all products", color: "#ff6a3d" },
    { label: "Profile Views", value: totalViews.toLocaleString(),   delta: "all-time",            color: "#3b7fff" },
    { label: "Live Products", value: liveTools.toString(),          delta: `of ${myTools.length} submitted`, color: "#00b87a" },
  ];

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Page head */}
      <div style={pageHead}>
        <div>
          <div style={eyebrow}>Overview</div>
          <h1 style={h1}>Welcome back, {displayName} 👋</h1>
          <p style={sub}>Here&apos;s a snapshot of your products and activity.</p>
        </div>
        <Link href="/dashboard/products" style={btnPrimary}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add new product
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 6 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Engagement over time</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Daily upvotes &amp; profile views across all your products — last 14 days</div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11, color: "var(--ink-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 24, height: 3, borderRadius: 2, background: "#ff6a3d", display: "inline-block" }}/>Upvotes
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 24, height: 3, borderRadius: 2, background: "#3b7fff", display: "inline-block" }}/>Views
              </span>
            </div>
          </div>

          {/* Chart */}
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" style={{ width: "100%", height: 140 }}>
            <defs>
              <linearGradient id="gOrange" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ff6a3d" stopOpacity=".22"/>
                <stop offset="1" stopColor="#ff6a3d" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="gBlue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#3b7fff" stopOpacity=".18"/>
                <stop offset="1" stopColor="#3b7fff" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Zero-state flat lines when no data at all */}
            {upvoteBuckets.every(v => v === 0) && viewBuckets.every(v => v === 0) ? (
              <>
                <path d="M0,140 L600,140" fill="none" stroke="#ff6a3d" strokeWidth="2" opacity="0.4" strokeDasharray="4 4"/>
                <path d="M0,140 L600,140" fill="none" stroke="#3b7fff" strokeWidth="2" opacity="0.4" strokeDasharray="4 4"/>
              </>
            ) : (
              <>
                {/* View area + line (behind upvotes) */}
                <path d={viewPaths.area} fill="url(#gBlue)"/>
                <path d={viewPaths.line} fill="none" stroke="#3b7fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"/>
                {/* Upvote area + line (on top) */}
                <path d={upvotePaths.area} fill="url(#gOrange)"/>
                <path d={upvotePaths.line} fill="none" stroke="#ff6a3d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </>
            )}
          </svg>

          {/* X-axis labels: first, middle, last */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-muted)", marginTop: 6, paddingTop: 4, borderTop: "1px solid var(--border-faint)" }}>
            <span>{dayLabels[0]}</span>
            <span>{dayLabels[Math.floor(DAYS / 2)]}</span>
            <span>{dayLabels[DAYS - 1]}</span>
          </div>
        </div>

        {/* Activity feed */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Activity</div>
            <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>Recent</span>
          </div>
          {recentUpvotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink-muted)", fontSize: 12, lineHeight: 1.6 }}>
              {myTools.length === 0
                ? "Submit your first product to start seeing activity here."
                : "No upvotes yet — share your product to get started!"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentUpvotes.map((ev, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                    ▲
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4, minWidth: 0 }}>
                    <span style={{ color: "var(--ink)" }}>New upvote on </span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{toolMap[ev.tool_id] ?? "your product"}</span>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>{timeAgo(ev.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Products preview */}
      <div style={card}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>My Products</div>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
            Want to remove a tool?{" "}
            <a href="mailto:soham@nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
              soham@nextbigtool.com
            </a>
          </div>
        </div>
        {myTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-muted)" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No products yet</div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>Submit your first product to start tracking engagement.</div>
            <Link href="/dashboard/products" style={btnPrimary}>Submit Your First Product →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {myTools.slice(0, 5).map((t, i) => {
              // Logo: uploaded → Clearbit → gradient badge
              let logoSrc: string | null = t.logo_url ?? null;
              if (!logoSrc && t.website_url) {
                try {
                  const domain = new URL(t.website_url).hostname.replace(/^www\./, "");
                  logoSrc = `https://logo.clearbit.com/${domain}`;
                } catch { logoSrc = null; }
              }
              const gradients = ["linear-gradient(135deg,#7c3aed,#ec4899)","linear-gradient(135deg,#ef4444,#f97316)","linear-gradient(135deg,#3b82f6,#6366f1)","linear-gradient(135deg,#0ea5e9,#06b6d4)","linear-gradient(135deg,#10b981,#059669)"];

              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0",
                  borderBottom: i < Math.min(myTools.length, 5) - 1 ? "1px solid var(--border-faint)" : "none",
                }}>
                  {/* Logo */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    overflow: "hidden", position: "relative",
                    background: logoSrc ? "#fff" : gradients[i % gradients.length],
                    border: logoSrc ? "1px solid rgba(0,0,0,0.08)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "#fff",
                  }}>
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoSrc} alt={t.name}
                        style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }}
                      />
                    ) : t.name[0]}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tagline}</div>
                  </div>

                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#ff6a3d" }}>{t.upvote_count ?? 0}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upvotes</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#3b7fff" }}>{t.view_count ?? 0}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Views</div>
                    </div>
                  </div>

                  <div style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: t.status === "approved" ? "rgba(0,184,122,0.12)" : t.status === "pending" ? "rgba(255,106,61,0.12)" : "var(--surface-alt)",
                    color: t.status === "approved" ? "#00b87a" : t.status === "pending" ? "#b05a00" : "var(--ink-muted)",
                  }}>
                    {t.status === "approved" ? "Live" : t.status === "pending" ? "Pending" : "Draft"}
                  </div>

                  {/* Edit button — only for approved/live tools */}
                  {t.status === "approved" && (
                    <Link href={`/dashboard/edit/${t.id}`} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 8,
                      border: "1px solid var(--border)", background: "var(--surface)",
                      fontSize: 12, fontWeight: 600, color: "var(--ink)",
                      textDecoration: "none", flexShrink: 0,
                      transition: "border-color 0.15s",
                    }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
