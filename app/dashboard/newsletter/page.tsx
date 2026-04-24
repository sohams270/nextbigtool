import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };

type Issue = {
  id: string;
  number: number;
  title: string;
  status: string;
  sent_at: string | null;
  subscribers_count: number | null;
  open_rate: number | null;
  live_url: string | null;
  featured_products: string[] | null;
};

export default async function NewsletterPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Try to fetch newsletter issues, fall back to mock data
  const { data: issuesData } = await supabase
    .from("newsletter_issues")
    .select("*")
    .order("number", { ascending: false })
    .limit(10);

  const issues = (issuesData ?? []) as Issue[];

  // Mock data if no real issues
  const displayIssues = issues.length > 0 ? issues : [
    { id: "1", number: 43, title: "Issue #43 · Upcoming", status: "scheduled", sent_at: "2026-04-25T00:00:00Z", subscribers_count: null, open_rate: null, live_url: null, featured_products: null },
    { id: "2", number: 42, title: "Issue #42 · AI tools you missed", status: "sent", sent_at: "2026-04-18T00:00:00Z", subscribers_count: 14208, open_rate: 42, live_url: "#", featured_products: null },
    { id: "3", number: 41, title: "Issue #41 · Developer launches of the week", status: "sent", sent_at: "2026-04-11T00:00:00Z", subscribers_count: 13980, open_rate: 39, live_url: "#", featured_products: null },
    { id: "4", number: 40, title: "Issue #40 · Design tools roundup", status: "sent", sent_at: "2026-04-04T00:00:00Z", subscribers_count: 13820, open_rate: 44, live_url: "#", featured_products: null },
  ];

  const statusStyle = (s: string) =>
    s === "sent"      ? { bg: "#e6f9f1", fg: "#0a7a4f" } :
    s === "scheduled" ? { bg: "#fff5ec", fg: "#b05a00" } :
                        { bg: "#f1f1ee", fg: "#6b6b78" };

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Weekly Digest</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Newsletter</h1>
          <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>Track newsletters sent by the NextBigTool team — and submit updates to be included.</p>
        </div>
        <button style={{
          background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 9,
          padding: "0 18px", height: 36, fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Submit for next issue
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Subscribers", value: "14,208", delta: "▲ 4.8%" },
          { label: "Avg. open rate", value: "42%", delta: "▲ 1.1%" },
          { label: "Issues sent", value: "42", delta: "Every Thursday" },
          { label: "Your mentions", value: "3", delta: "across 2 issues" },
        ].map((k) => (
          <div key={k.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#9090a0", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.03em", lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: k.delta.startsWith("▲") ? "#0a7a4f" : "#9090a0", marginTop: 6 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Issues list */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #ececea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: 0 }}>Recent issues</h2>
            <div style={{ display: "flex", background: "#f1f1ee", borderRadius: 9, padding: 3 }}>
              {["All", "Included me"].map((t, i) => (
                <div key={t} style={{ padding: "4px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: i === 0 ? "#fff" : "transparent", color: i === 0 ? "#0f0f10" : "#6b6b78" }}>{t}</div>
              ))}
            </div>
          </div>

          {displayIssues.map((issue) => {
            const sc = statusStyle(issue.status);
            const date = issue.sent_at ? new Date(issue.sent_at) : null;
            const day = date?.getDate();
            const month = date?.toLocaleDateString("en-US", { month: "short" });
            return (
              <div key={issue.id} style={{ padding: "16px 20px", borderBottom: "1px solid #f5f5f3", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f0f10", lineHeight: 1 }}>{day ?? "–"}</div>
                  <div style={{ fontSize: 10, color: "#9090a0", fontWeight: 600, textTransform: "uppercase" as const }}>{month ?? ""}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <b style={{ fontSize: 14, color: "#0f0f10" }}>{issue.title}</b>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.fg }}>
                      {issue.status === "sent" ? "Sent" : issue.status === "scheduled" ? "Scheduled" : "Draft"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9090a0" }}>
                    {issue.status === "sent" && issue.subscribers_count ? (
                      <>Sent to {issue.subscribers_count.toLocaleString()} subscribers · {issue.open_rate}% open</>
                    ) : issue.status === "scheduled" ? (
                      <>Submissions close Wed · Review this week</>
                    ) : "Draft — not yet scheduled"}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {issue.status === "sent" && issue.live_url ? (
                    <a href={issue.live_url} target="_blank" rel="noreferrer" style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4", fontSize: 11.5, fontWeight: 600, color: "#3a3a45", textDecoration: "none" }}>
                      Live link ↗
                    </a>
                  ) : issue.status === "scheduled" ? (
                    <button style={{ background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 11.5, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                      Submit update
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f0f10", margin: "0 0 4px" }}>Submit an update</h3>
            <p style={{ fontSize: 12.5, color: "#9090a0", margin: "0 0 16px", lineHeight: 1.5 }}>
              Got a launch, milestone, or story? The NBT editorial team will review for the next issue.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>Related product</label>
                <select style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, color: "#0f0f10", background: "#fff", fontFamily: "inherit" }}>
                  <option>Select a product…</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>Headline</label>
                <input placeholder="e.g. PromptCraft hits 1,000 DAUs" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, color: "#0f0f10", fontFamily: "inherit", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>
                  Story <span style={{ color: "#9090a0", fontWeight: 400 }}>· 2–3 sentences</span>
                </label>
                <textarea rows={3} placeholder="Why is this interesting to NextBigTool readers?" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, color: "#0f0f10", fontFamily: "inherit", outline: "none", resize: "vertical" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>Link (optional)</label>
                <input placeholder="https://…" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, color: "#0f0f10", fontFamily: "inherit", outline: "none" }} />
              </div>
              <button style={{ width: "100%", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 9, padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                Submit for review
              </button>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>How featuring works</h3>
            <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#6b6b78", lineHeight: 1.7 }}>
              <li>Submit by Wednesday 6pm PT</li>
              <li>Editorial review within 48h</li>
              <li>Included in Thursday&apos;s issue if approved</li>
              <li>Track opens / clicks from this dashboard</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
