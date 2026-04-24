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
};

/* ─── shared dash styles ─── */
const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #ececea",
  borderRadius: 14, padding: 20,
};
const pageHead: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  marginBottom: 24,
};
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const,
  letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4,
};
const h1: React.CSSProperties = {
  fontSize: 22, fontWeight: 800, color: "#0f0f10",
  letterSpacing: "-0.02em", margin: "0 0 4px",
};
const sub: React.CSSProperties = { fontSize: 13, color: "#6b6b78", margin: 0 };
const btnPrimary: React.CSSProperties = {
  background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
  border: "none", borderRadius: 9, padding: "0 18px", height: 36,
  fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
  textDecoration: "none",
};
const btnOutline: React.CSSProperties = {
  background: "transparent", border: "1px solid #d8d8d4",
  borderRadius: 9, padding: "0 14px", height: 34,
  fontSize: 12, fontWeight: 600, color: "#3a3a45", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
  textDecoration: "none",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: toolsData } = await supabase
    .from("tools")
    .select("id, name, tagline, upvote_count, view_count, status")
    .eq("submitter_id", user.id)
    .order("upvote_count", { ascending: false });

  const myTools = (toolsData ?? []) as Tool[];
  const totalUpvotes = myTools.reduce((s, t) => s + (t.upvote_count ?? 0), 0);
  const totalViews   = myTools.reduce((s, t) => s + (t.view_count ?? 0), 0);
  const liveTools    = myTools.filter(t => t.status === "approved").length;

  const displayName = user.user_metadata?.full_name?.split(" ")[0]
    || user.email?.split("@")[0]
    || "there";

  const kpis = [
    { label: "Total Upvotes",  value: totalUpvotes.toLocaleString(), delta: "across all products",  color: "#ff6a3d" },
    { label: "Profile Views",  value: totalViews.toLocaleString(),   delta: "all-time",             color: "#3b7fff" },
    { label: "Live Products",  value: liveTools.toString(),          delta: `of ${myTools.length} submitted`, color: "#00b87a" },
    { label: "Followers",      value: "—",                           delta: "coming soon",           color: "#9090a0" },
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
        <Link href="/dashboard/submit" style={btnPrimary}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add new product
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#9090a0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11.5, color: "#9090a0", marginTop: 6 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart placeholder + activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10" }}>Engagement over time</div>
              <div style={{ fontSize: 12, color: "#9090a0", marginTop: 2 }}>Upvotes, views, and comments across all products</div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9090a0" }}>
              <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#ff6a3d", display: "inline-block" }}/>Upvotes
              </span>
              <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#ff3d88", display: "inline-block" }}/>Views
              </span>
              <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#0e0e10", display: "inline-block" }}/>Comments
              </span>
            </div>
          </div>
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" style={{ width: "100%", height: 160 }}>
            <defs>
              <linearGradient id="gOrange" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ff6a3d" stopOpacity=".25"/>
                <stop offset="1" stopColor="#ff6a3d" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,140 L60,120 L120,130 L180,90 L240,100 L300,70 L360,80 L420,50 L480,60 L540,30 L600,40 L600,160 L0,160 Z" fill="url(#gOrange)"/>
            <path d="M0,140 L60,120 L120,130 L180,90 L240,100 L300,70 L360,80 L420,50 L480,60 L540,30 L600,40" fill="none" stroke="#ff6a3d" strokeWidth="2"/>
            <path d="M0,150 L60,142 L120,147 L180,125 L240,133 L300,115 L360,120 L420,100 L480,108 L540,88 L600,92" fill="none" stroke="#ff3d88" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="M0,155 L60,150 L120,152 L180,142 L240,147 L300,136 L360,140 L420,128 L480,132 L540,120 L600,124" fill="none" stroke="#0e0e10" strokeWidth="1.5" strokeDasharray="2 3"/>
          </svg>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10" }}>Activity</div>
            <span style={{ fontSize: 12, color: "#9090a0" }}>Recent</span>
          </div>
          {myTools.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#9090a0", fontSize: 12 }}>
              No activity yet — submit your first product!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: `${totalUpvotes} total upvotes on your products`, time: "All time" },
                { label: `${totalViews.toLocaleString()} profile views`, time: "All time" },
                { label: `${myTools.length} product${myTools.length !== 1 ? "s" : ""} submitted`, time: "Lifetime" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {a.label}
                    <div style={{ fontSize: 11, color: "#9090a0", marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Products preview */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10" }}>My Products</div>
          <Link href="/dashboard/products" style={{ fontSize: 12, color: "#ff6a3d", fontWeight: 600, textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        {myTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9090a0" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f0f10", marginBottom: 4 }}>No products yet</div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>Submit your first product to start tracking engagement.</div>
            <Link href="/dashboard/submit" style={btnPrimary}>Submit Your First Product →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {myTools.slice(0, 3).map((t, i) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 0",
                borderBottom: i < Math.min(myTools.length, 3) - 1 ? "1px solid #ececea" : "none",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `hsl(${i * 60 + 20},80%,55%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#fff",
                }}>
                  {t.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f0f10" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#9090a0", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tagline}</div>
                </div>
                <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#ff6a3d" }}>{t.upvote_count ?? 0}</div>
                    <div style={{ fontSize: 10, color: "#9090a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upvotes</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#3b7fff" }}>{t.view_count ?? 0}</div>
                    <div style={{ fontSize: 10, color: "#9090a0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Views</div>
                  </div>
                </div>
                <div style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: t.status === "approved" ? "#e6f9f1" : t.status === "pending" ? "#fff5ec" : "#f1f1ee",
                  color: t.status === "approved" ? "#0a7a4f" : t.status === "pending" ? "#b05a00" : "#6b6b78",
                }}>
                  {t.status === "approved" ? "Live" : t.status === "pending" ? "Pending" : "Draft"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
