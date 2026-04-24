import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashTopbar from "../components/DashTopbar";
import UpgradeBanner from "../components/UpgradeBanner";
import KPICard from "../components/KPICard";
import PostForm from "../components/PostForm";
import PostCard, { type PostRow } from "../components/PostCard";
import Logo from "../components/Logo";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import Link from "next/link";

const QUICK_ACTIONS = ["Post Update", "Re-Launch", "View Analytics", "Submit New Tool"];

type Tool = {
  id: string;
  name: string;
  tagline: string;
  upvote_count: number;
  view_count: number;
  status: string;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: toolsData } = await supabase
    .from("tools")
    .select("id, name, tagline, upvote_count, view_count, status")
    .eq("submitter_id", user.id)
    .order("upvote_count", { ascending: false });

  const myTools = (toolsData ?? []) as Tool[];
  const approvedTools = myTools.filter((t) => t.status === "approved");

  const { data: postsData } = await supabase
    .from("posts")
    .select(`
      id, type, content, metric_label, metric_value, likes_count, comments_count, created_at,
      profiles ( full_name, username ),
      tools ( name )
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const myPosts = (postsData ?? []) as unknown as PostRow[];

  const totalUpvotes = myTools.reduce((s, t) => s + t.upvote_count, 0);
  const totalViews   = myTools.reduce((s, t) => s + t.view_count, 0);
  const topTool      = myTools[0] ?? null;

  return (
    <>
      <DashTopbar />
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        <UpgradeBanner />

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "16px 0" }}>
          <KPICard
            label="Total Upvotes"
            value={totalUpvotes.toLocaleString()}
            delta={myTools.length ? "across all tools" : "no tools yet"}
            valueColor="#FF6B35"
          />
          <KPICard
            label="Profile Views"
            value={totalViews.toLocaleString()}
            delta={myTools.length ? "across all tools" : "no tools yet"}
          />
          <KPICard label="Followers" value="0"    delta="coming soon" valueColor="#00B87A" />
          <KPICard label="Comments"  value="0"    delta="coming soon" positive={false} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          {/* My Products */}
          <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>My Products</span>
              <Link href="/dashboard/submit">
                <span style={{ fontSize: 10, color: "#FF6B35", fontWeight: 600, cursor: "pointer" }}>+ Add</span>
              </Link>
            </div>

            {myTools.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#A8A8AD" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🚀</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>
                  No tools yet
                </div>
                <div style={{ fontSize: 11, marginBottom: 16 }}>
                  Submit your first tool to start tracking upvotes and views.
                </div>
                <Link href="/dashboard/submit">
                  <Btn variant="primary" size="sm">Submit Your First Tool →</Btn>
                </Link>
              </div>
            ) : (
              myTools.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: i < myTools.length - 1 ? "1px solid #F5F5F5" : "none",
                  }}
                >
                  <Logo size={44} letter={p.name[0]} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</span>
                      {i === 0 && p.status === "approved" && (
                        <Pill color="orange" size="xs">#1 Your Top Tool</Pill>
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#6B6B70", marginTop: 2 }}>{p.tagline}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      {[["Upvotes", p.upvote_count.toLocaleString()], ["Views", p.view_count.toLocaleString()]].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{v}</div>
                          <div style={{ fontSize: 9, color: "#A8A8AD", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Pill
                    color={p.status === "approved" ? "green" : p.status === "pending" ? "orange" : "gray"}
                    size="sm"
                  >
                    {p.status === "approved" ? "Live" : p.status === "pending" ? "Pending" : "Draft"}
                  </Pill>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Interested Users — locked */}
            <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>Interested Users</span>
              <div style={{ textAlign: "center", padding: "18px 8px 8px" }}>
                <div style={{ fontSize: 22 }}>🔒</div>
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700 }}>
                  {topTool ? `${topTool.upvote_count} people upvoted ${topTool.name}` : "Submit a tool to track interest"}
                </div>
                <div style={{ fontSize: 10, color: "#6B6B70", marginTop: 2 }}>Upgrade to Core to message them</div>
              </div>
              <Link href="/pricing">
                <Btn variant="primary" size="sm" full>Upgrade to Unlock</Btn>
              </Link>
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 10 }}>Quick Actions</span>
              {QUICK_ACTIONS.map((t) => (
                <Btn
                  key={t}
                  variant="ghost"
                  size="sm"
                  full
                  style={{ marginBottom: 6, justifyContent: "space-between" }}
                >
                  <span>{t}</span>
                  <span>→</span>
                </Btn>
              ))}
            </div>
          </div>
        </div>

        {/* Build in Public */}
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 16, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>Build in Public</span>
            <span style={{ fontSize: 10, color: "#6B6B70" }}>Visible on the homepage wall</span>
          </div>

          {approvedTools.length === 0 ? (
            <div style={{ fontSize: 11, color: "#A8A8AD", padding: "8px 0" }}>
              You need at least one approved tool to post to the wall.{" "}
              <Link href="/dashboard/submit" style={{ color: "#FF6B35", fontWeight: 600 }}>Submit a tool →</Link>
            </div>
          ) : (
            <>
              <PostForm tools={approvedTools} userId={user.id} />

              {myPosts.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6B6B70", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Your recent posts
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {myPosts.map((p) => (
                      <PostCard key={p.id} post={p} userId={user.id} isLiked={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
