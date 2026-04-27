"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tool = { id: string; name: string };
type Post = {
  id: string;
  content: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  tools?: { name: string } | null;
};

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 };

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TAGS = ["#Milestone", "#Launch", "#Update", "#Funding", "#Idea"];

export default function BuildInPublicPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; user_metadata?: Record<string, string> } | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"mine" | "wall">("mine");
  const [wallPosts, setWallPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUser(user as { id: string; user_metadata?: Record<string, string> });

      // Load user tools
      supabase.from("tools").select("id, name").eq("submitter_id", user.id).eq("status", "approved").then(({ data }) => {
        setTools((data ?? []) as Tool[]);
        if (data?.[0]) setSelectedTool(data[0].id);
      });

      // Load user posts
      supabase.from("posts")
        .select("id, content, tags, likes_count, comments_count, created_at, tools(name)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => setPosts((data ?? []) as unknown as Post[]));

      // Load wall posts
      supabase.from("posts")
        .select("id, content, tags, likes_count, comments_count, created_at, tools(name)")
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => setWallPosts((data ?? []) as unknown as Post[]));
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePost() {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("posts").insert({
      author_id: user.id,
      tool_id: selectedTool || null,
      content: text.trim(),
      tags: selectedTags,
      type: "update",
    }).select().single();
    if (!error && data) {
      setPosts(prev => [data as unknown as Post, ...prev]);
      setText("");
      setSelectedTags([]);
    }
    setSubmitting(false);
  }

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || user?.user_metadata?.email?.split("@")[0] || "You";
  const initials = displayName.slice(0, 2).toUpperCase();

  const displayPosts = activeTab === "mine" ? posts : wallPosts;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Social · Build in Public Wall</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Build In Public</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>Share milestones, funding, launches, and updates with the NextBigTool community.</p>
        </div>
        <div style={{ display: "flex", background: "var(--surface-alt)", borderRadius: 9, padding: 3 }}>
          {(["mine", "wall"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
              background: activeTab === t ? "#fff" : "transparent",
              color: activeTab === t ? "var(--ink)" : "var(--ink-muted)",
              boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              {t === "mine" ? "My posts" : "Public wall"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          {/* Composer */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{displayName}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                  Posting to <b>Build in Public Wall</b>
                  {tools.length > 0 && (
                    <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)} style={{ marginLeft: 6, fontSize: 11, border: "none", background: "transparent", color: "#ff6a3d", fontWeight: 600, cursor: "pointer" }}>
                      {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              {posts.length === 0 && (
                <span style={{ padding: "3px 8px", borderRadius: 20, background: "#fff5ec", color: "#b05a00", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>
                  Free · 1 post left
                </span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What shipped today? Share a milestone, funding round, or launch…"
              style={{
                width: "100%", border: "1.5px solid #ececea", borderRadius: 10, padding: "10px 12px",
                fontSize: 13.5, lineHeight: 1.5, resize: "vertical" as const, minHeight: 80,
                fontFamily: "inherit", outline: "none", color: "var(--ink)",
              }}
            />
            {/* Tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, margin: "8px 0" }}>
              {TAGS.map(tag => (
                <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                  border: selectedTags.includes(tag) ? "1.5px solid #ff6a3d" : "1.5px solid #ececea",
                  background: selectedTags.includes(tag) ? "#fff0eb" : "#f9f9f8",
                  color: selectedTags.includes(tag) ? "#c04400" : "var(--ink-muted)",
                }}>
                  {tag}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", cursor: "pointer" }}>
                Save draft
              </button>
              <button onClick={handlePost} disabled={submitting || !text.trim()} style={{
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 8,
                padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer",
                opacity: submitting || !text.trim() ? 0.6 : 1,
              }}>
                {submitting ? "Posting…" : "Post update"}
              </button>
            </div>
          </div>

          {/* Feed filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
            {["All", "Milestones", "Updates", "Funding", "Launches"].map((f, i) => (
              <button key={f} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: i === 0 ? "1.5px solid #ff6a3d" : "1.5px solid #ececea",
                background: i === 0 ? "#fff0eb" : "#fff",
                color: i === 0 ? "#c04400" : "var(--ink-muted)",
              }}>{f}</button>
            ))}
          </div>

          {/* Posts */}
          {displayPosts.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: "36px 20px", color: "var(--ink-muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No posts yet</div>
              <div style={{ fontSize: 12 }}>Share your first build-in-public update above!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayPosts.map((p) => (
                <div key={p.id} style={card}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <b style={{ fontSize: 13.5 }}>{displayName}</b>
                        {(p.tools as { name: string } | null)?.name && (
                          <span style={{ padding: "2px 8px", borderRadius: 20, background: "var(--surface-alt)", fontSize: 11, fontWeight: 600, color: "var(--ink-muted)" }}>
                            {(p.tools as { name: string }).name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{timeAgo(p.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", marginBottom: 8 }}>{p.content}</div>
                  {p.tags && p.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
                      {p.tags.map(tag => (
                        <span key={tag} style={{ padding: "2px 8px", borderRadius: 6, background: "var(--surface-alt)", fontSize: 11, color: "var(--ink-muted)" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--ink-muted)", borderTop: "1px solid #f5f5f3", paddingTop: 10 }}>
                    <span style={{ cursor: "pointer" }}>▲ {p.likes_count ?? 0} upvotes</span>
                    <span style={{ cursor: "pointer" }}>💬 {p.comments_count ?? 0} comments</span>
                    <span style={{ marginLeft: "auto", color: "#ff6a3d", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      ✦ See upvoters (Core)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg,#0f0f10,#1e1e2a)", borderRadius: 14, padding: 20, color: "#fff" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, marginBottom: 10 }}>✦ Core plan</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>Post as often as you want</h3>
            <p style={{ fontSize: 12.5, color: "#8a8a90", margin: "0 0 14px", lineHeight: 1.5 }}>
              Free accounts are capped at <b style={{ color: "#c0c0cc" }}>1 post / month</b>. Core unlocks unlimited posts plus upvoter tracking.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Unlimited Build-in-Public posts", "See who upvoted each post", "Scheduled posts & analytics"].map(f => (
                <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "#c0c0cc" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6a3d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><path d="M5 12l5 5 9-11"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/plan" style={{ display: "block", textAlign: "center", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none" }}>Upgrade to Core</Link>
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>Post performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Total posts", posts.length.toString()], ["Total views", "—"], ["Avg. engagement", "—"], ["Top tag", posts.flatMap(p => p.tags ?? [])[0] ?? "—"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-muted)" }}>{l}</span>
                  <b style={{ color: "var(--ink)" }}>{v}</b>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
