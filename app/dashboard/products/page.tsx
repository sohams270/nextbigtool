import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

type Tool = {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  url: string | null;
  upvote_count: number;
  view_count: number;
  status: string;
  plan: string | null;
  submitted_at: string | null;
  tags: string[] | null;
};

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: toolsData } = await supabase
    .from("tools")
    .select("id, name, tagline, description, url, upvote_count, view_count, status, plan, submitted_at, tags")
    .eq("submitter_id", user.id)
    .order("submitted_at", { ascending: false });

  const tools = (toolsData ?? []) as Tool[];
  const live   = tools.filter(t => t.status === "approved");
  const draft  = tools.filter(t => t.status === "draft" || t.status === "pending");

  const statusLabel = (s: string) => s === "approved" ? "Live" : s === "pending" ? "Pending" : "Draft";
  const statusColor = (s: string) =>
    s === "approved" ? { bg: "#e6f9f1", fg: "#0a7a4f" } :
    s === "pending"  ? { bg: "#fff5ec", fg: "#b05a00" } :
                       { bg: "#f1f1ee", fg: "#6b6b78" };

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Products</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>My Products</h1>
          <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>Manage, edit, and track the products you&apos;ve submitted to NextBigTool.</p>
        </div>
        <Link href="/dashboard/submit" style={{
          background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 9,
          padding: "0 18px", height: 36, fontSize: 12.5, fontWeight: 700, color: "#fff",
          display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add new product
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", background: "#f1f1ee", borderRadius: 9, padding: 3, gap: 2 }}>
          {[`All (${tools.length})`, `Live (${live.length})`, `Draft (${draft.length})`].map((t, i) => (
            <div key={t} style={{
              padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: i === 0 ? "#fff" : "transparent",
              color: i === 0 ? "#0f0f10" : "#6b6b78",
              boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Products list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tools.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", marginBottom: 6 }}>No products yet</div>
              <div style={{ fontSize: 13, color: "#9090a0", marginBottom: 20 }}>
                Submit your first product to reach thousands of early adopters.
              </div>
              <Link href="/dashboard/submit" style={{
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 9, padding: "0 20px",
                height: 38, fontSize: 13, fontWeight: 700, color: "#fff",
                display: "inline-flex", alignItems: "center", textDecoration: "none",
              }}>Submit Your First Product →</Link>
            </div>
          ) : (
            tools.map((t) => {
              const sc = statusColor(t.status);
              const launchDate = t.submitted_at
                ? new Date(t.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : null;
              return (
                <div key={t.id} style={{
                  ...card,
                  display: "flex", alignItems: "center", gap: 14,
                  borderStyle: t.status === "draft" ? "dashed" : "solid",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: t.status === "draft" ? "#f1f1ee" : `hsl(${t.name.charCodeAt(0) * 5 % 360},65%,55%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: t.status === "draft" ? "#9090a0" : "#fff",
                  }}>
                    {t.status === "draft" ? "?" : t.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10" }}>{t.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.fg }}>
                        {statusLabel(t.status)}
                      </span>
                      {t.plan === "featured" && (
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fff0eb", color: "#c04400" }}>Featured</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b6b78", marginBottom: 4 }}>{t.tagline}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                      {(t.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} style={{ padding: "2px 8px", borderRadius: 6, background: "#f1f1ee", fontSize: 11, color: "#6b6b78" }}>{tag}</span>
                      ))}
                      {launchDate && <span style={{ fontSize: 11, color: "#9090a0" }}>· Submitted {launchDate}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                    {t.status !== "draft" ? (
                      <>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#ff6a3d" }}>{t.upvote_count ?? 0}</div>
                          <div style={{ fontSize: 10, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Upvotes</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#3b7fff" }}>{t.view_count ?? 0}</div>
                          <div style={{ fontSize: 10, color: "#9090a0", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Views</div>
                        </div>
                      </>
                    ) : (
                      <Link href="/dashboard/submit" style={{
                        padding: "6px 14px", borderRadius: 8, border: "1px solid #d8d8d4",
                        fontSize: 12, fontWeight: 600, color: "#3a3a45", textDecoration: "none",
                      }}>Resume →</Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upgrade card */}
          <div style={{
            background: "linear-gradient(135deg,#0f0f10 0%,#1e1e2a 100%)",
            borderRadius: 14, padding: 20, color: "#fff",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
              borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, marginBottom: 10,
            }}>✦ Upgrade to Core</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>See who upvoted your product</h3>
            <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
              Unlock the Interested Users panel and turn upvoters into leads with emails and company data.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Upvoter usernames & emails", "Company & title enrichment", "Export as CSV or to your CRM"].map((f) => (
                <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><path d="M5 12l5 5 9-11"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/plan" style={{
              display: "block", textAlign: "center", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
              borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none",
            }}>See plans →</Link>
            <div style={{ fontSize: 11, color: "#6b6b78", textAlign: "center", marginTop: 8 }}>From $12 / month</div>
          </div>

          {/* Quick tips */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Quick tips</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, color: "#6b6b78", lineHeight: 1.5 }}>
              <li>• Clear, benefit-led first line out-performs feature lists by ~40%.</li>
              <li>• Launch on Tuesday/Wednesday for best visibility.</li>
              <li>• Add 3 categories — products with tags get 2.3× more views.</li>
              <li>• Respond to comments within 6h to boost ranking.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
