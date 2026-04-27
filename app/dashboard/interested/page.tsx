import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 };

const MOCK_ROWS = [
  { initials: "MJ", bg: "linear-gradient(135deg,#4f46e5,#a855f7)", user: "maria.johnson", email: "maria@stripe.com", company: "Stripe", product: "PromptCraft", action: "▲ Upvoted", actionColor: "#ff6a3d", actionBg: "#fff0eb", when: "2m ago" },
  { initials: "SK", bg: "linear-gradient(135deg,#059669,#0ea5e9)", user: "sarahk", email: "sarah@figma.com", company: "Figma", product: "PromptCraft", action: "💬 Commented", actionColor: "#c01a63", actionBg: "#ffe7f1", when: "18m ago" },
  { initials: "DV", bg: "linear-gradient(135deg,#f59e0b,#ef4444)", user: "dvega", email: "d.vega@vercel.com", company: "Vercel", product: "FlowDeck", action: "▲ Upvoted", actionColor: "#ff6a3d", actionBg: "#fff0eb", when: "1h ago" },
  { initials: "JL", bg: "linear-gradient(135deg,#2c2c31,#55555a)", user: "jlee_dev", email: "jlee@linear.app", company: "Linear", product: "PromptCraft", action: "▲ Upvoted", actionColor: "#ff6a3d", actionBg: "#fff0eb", when: "3h ago" },
  { initials: "AM", bg: "linear-gradient(135deg,#ff6a3d,#ff3d88)", user: "anna.m", email: "anna@notion.so", company: "Notion", product: "PromptCraft", action: "💬 Commented", actionColor: "#c01a63", actionBg: "#ffe7f1", when: "5h ago" },
  { initials: "RP", bg: "linear-gradient(135deg,#4f46e5,#a855f7)", user: "rpatel", email: "r.patel@supabase.io", company: "Supabase", product: "FlowDeck", action: "▲ Upvoted", actionColor: "#ff6a3d", actionBg: "#fff0eb", when: "yesterday" },
];

export default async function InterestedPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Leads · Core feature</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Interested Users</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>People who upvoted or commented on your products — with enriched contact info.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled style={{ opacity: 0.45, padding: "0 14px", height: 32, borderRadius: 8, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "not-allowed" }}>
            Export CSV
          </button>
          <Link href="/dashboard/plan" style={{
            background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 8, padding: "0 16px",
            height: 32, fontSize: 12, fontWeight: 700, color: "#fff",
            display: "inline-flex", alignItems: "center", textDecoration: "none",
          }}>Upgrade to unlock</Link>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 9, padding: 3 }}>
          <div style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, background: "var(--surface)", color: "var(--ink)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>All products</div>
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: "var(--surface-alt)", fontSize: 11, fontWeight: 600, color: "var(--ink-muted)" }}>43 total</span>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: "#e6f9f1", fontSize: 11, fontWeight: 600, color: "#0a7a4f" }}>12 new this week</span>
      </div>

      {/* Locked wrap */}
      <div style={{ position: "relative" }}>
        {/* Blurred table */}
        <div style={{ ...card, padding: 0, overflow: "hidden", filter: "blur(4px)", userSelect: "none" as const }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ececea" }}>
                {["", "User", "Email", "Company", "Product", "Action", "When", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", background: "var(--surface-alt)", whiteSpace: "nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f3" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ width: 16, height: 16, border: "1.5px solid #d8d8d4", borderRadius: 4 }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: row.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {row.initials}
                      </div>
                      <b>{row.user}</b>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-muted)" }}>{row.email}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{row.company}</td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-muted)" }}>{row.product}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 20, background: row.actionBg, color: row.actionColor, fontSize: 11, fontWeight: 700 }}>
                      {row.action}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-muted)" }}>{row.when}</td>
                  <td style={{ padding: "12px 16px" }}>⋯</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lock overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(246,246,244,0.7)",
          backdropFilter: "blur(2px)",
          borderRadius: 14,
          textAlign: "center",
          padding: 24,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 14,
            background: "linear-gradient(135deg,#0f0f10,#2a2a35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Unlock Interested Users</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)", maxWidth: 380, lineHeight: 1.6, marginBottom: 16 }}>
            See the name, email, and company of everyone who upvotes or comments on your products. Available on Core and Premium plans.
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Link href="/dashboard/plan" style={{
              background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 9,
              padding: "0 20px", height: 38, fontSize: 13, fontWeight: 700, color: "#fff",
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Upgrade to Core — $79/mo</Link>
            <Link href="/dashboard/plan" style={{
              background: "transparent", border: "1px solid #d8d8d4", borderRadius: 9,
              padding: "0 16px", height: 38, fontSize: 13, fontWeight: 600, color: "var(--ink-2)",
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Compare plans</Link>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-muted)", fontFamily: "monospace" }}>
            Your data is waiting · 43 contacts pending reveal
          </div>
        </div>
      </div>
    </main>
  );
}
