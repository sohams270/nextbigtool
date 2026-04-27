import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TopNav from "./components/TopNav";
import ProductShowcase from "./components/ProductShowcase";
import PostCard, { type PostRow } from "./components/PostCard";
import PostStoryWallButton from "./components/PostStoryWallButton";
import HeroSection from "./components/HeroSection";
import Pill from "./components/Pill";
import Btn from "./components/Btn";
import Logo from "./components/Logo";
import Footer from "./components/Footer";

const CATEGORIES = [
  { name: "AI Tools",     count: 142, icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> },
  { name: "Developer",   count: 98,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { name: "Marketing",   count: 76,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { name: "Design",      count: 64,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> },
  { name: "Productivity",count: 58,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none"/></svg> },
  { name: "Finance",     count: 42,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { name: "No-code",     count: 36,  icon: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M5 9v3a7 7 0 0 0 7 7M19 9v3a7 7 0 0 1-4 6.3"/></svg> },
] as const;

const LEADERBOARD = [
  ["🥇", "PromptBase", 312],
  ["🥈", "Raycast",    287],
  ["🥉", "Linear",     251],
] as const;

const FILTER_TABS = ["Trending", "New Today", "Top All Time", "Activity", "Hall of Fame"];
const PRICE_TABS  = ["All", "Free", "Freemium", "Paid"];

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  pricing: string;
  upvote_count: number;
  featured: boolean;
  tool_tags: { tags: { name: string } | null }[];
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const { data: recentPosts } = await supabase
    .from("posts")
    .select(`
      id, type, content, metric_label, metric_value, likes_count, comments_count, created_at,
      profiles ( full_name, username ),
      tools ( name )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  const posts = (recentPosts ?? []) as unknown as PostRow[];

  let userLikedPostIds: string[] = [];
  if (user && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    userLikedPostIds = (likes ?? []).map((l: { post_id: string }) => l.post_id);
  }

  const { data: allTools } = await supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, logo_url, pricing, upvote_count, featured,
      tool_tags ( tags ( name ) )
    `)
    .eq("status", "approved")
    .order("upvote_count", { ascending: false })
    .limit(9);

  const tools = (allTools ?? []) as unknown as ToolRow[];
  const displayedIds = tools.map((t) => t.id);

  let userUpvotedIds: string[] = [];
  if (user && displayedIds.length > 0) {
    const { data: votes } = await supabase
      .from("upvotes")
      .select("tool_id")
      .eq("user_id", user.id)
      .in("tool_id", displayedIds);
    userUpvotedIds = (votes ?? []).map((v: { tool_id: string }) => v.tool_id);
  }

  // Sort: featured tool first, then by upvote_count desc
  const sortedTools = [
    ...tools.filter((t) => t.featured),
    ...tools.filter((t) => !t.featured),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <HeroSection />

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 40px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {FILTER_TABS.map((t, i) => (
            <Pill key={t} color={i === 0 ? "orangeSolid" : "gray"} size="sm">{t}</Pill>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PRICE_TABS.map((t, i) => (
            <Pill key={t} color={i === 0 ? "outline" : "gray"} size="sm">{t}</Pill>
          ))}
          <div style={{ width: 1, background: "#CFCFD4", height: 16, margin: "0 4px" }} />
          <Btn variant="ghostMuted" size="sm">Category ▾</Btn>
          <Btn variant="ghostMuted" size="sm">Audience ▾</Btn>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 40px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 28,
            maxWidth: 1160,
            margin: "0 auto",
          }}
        >
          {/* Feed — new editorial leaderboard design */}
          <div>
            <ProductShowcase
              tools={sortedTools}
              userId={user?.id ?? null}
              userUpvotedIds={userUpvotedIds}
            />
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, background: "var(--surface)" }}>
              <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 12, color: "var(--ink)" }}>
                Browse Categories
              </span>
              {CATEGORIES.map(({ name, count, icon }) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border-faint)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--surface-alt)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink)" }}>{name}</span>
                  </div>
                  <Pill color="gray" size="xs">{count}</Pill>
                </div>
              ))}
              <span style={{ fontSize: 10, color: "#FF6B35", fontWeight: 600, display: "block", marginTop: 10, cursor: "pointer" }}>
                View all 24 categories →
              </span>
            </div>

            <div className="featured-card-wrap" style={{ borderRadius: 10 }}>
              <div style={{ borderRadius: 8, padding: 14, background: "var(--surface)" }}>
                <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 10, color: "var(--ink)" }}>
                  🏆 Hall of Fame
                </span>
                {LEADERBOARD.map(([medal, name, votes]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                    <Logo size={24} letter={name[0]} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>{name}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>▲ {votes}</div>
                    </div>
                    <span style={{ fontSize: 14 }}>{medal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0A0B1A", borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", display: "block", marginBottom: 4 }}>
                Weekly Digest
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 10 }}>
                The 5 tools worth checking this week. No spam.
              </span>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 8,
                }}
              >
                you@founder.co
              </div>
              <Btn variant="primary" size="sm" full>Subscribe</Btn>
            </div>

            {/* Hall of Fame promo */}
            <div style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "linear-gradient(145deg, #0D0E22 0%, #1A0D2E 60%, #0D0E22 100%)",
              padding: "18px 16px 16px",
              border: "1px solid rgba(255,215,80,0.2)",
            }}>
              {/* Star field dots */}
              {[
                { top: "12%", left: "8%", size: 2 }, { top: "22%", left: "88%", size: 1.5 },
                { top: "55%", left: "92%", size: 2 }, { top: "75%", left: "6%",  size: 1.5 },
                { top: "40%", left: "50%", size: 1 }, { top: "85%", left: "75%", size: 1.5 },
                { top: "8%",  left: "60%", size: 1 }, { top: "65%", left: "30%", size: 1 },
              ].map((s, i) => (
                <div key={i} style={{
                  position: "absolute", top: s.top, left: s.left,
                  width: s.size, height: s.size, borderRadius: "50%",
                  background: "rgba(255,215,80,0.6)", pointerEvents: "none",
                }} />
              ))}

              {/* Gold ambient glow */}
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 130, height: 130, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,180,0,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Trophy icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(255,215,80,0.2), rgba(255,140,0,0.15))",
                border: "1px solid rgba(255,215,80,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10, fontSize: 18,
              }}>
                🏆
              </div>

              {/* Title with gold gradient */}
              <div style={{
                fontSize: 12, fontWeight: 800, marginBottom: 6, lineHeight: 1.3,
                background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundSize: "200%",
              }}>
                Place your product in Hall of Fame
              </div>

              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
                Make your product stand out from the crowd — at all times.
              </div>

              {/* Talk To Us button — gold bordered */}
              <a href="/contact" style={{ textDecoration: "none", display: "block" }}>
                <button style={{
                  width: "100%",
                  background: "linear-gradient(135deg, rgba(255,215,80,0.15), rgba(255,140,0,0.1))",
                  border: "1px solid rgba(255,215,80,0.45)",
                  borderRadius: 8, padding: "8px 0",
                  fontSize: 11, fontWeight: 700,
                  color: "#FFD700", cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                className="hof-talk-btn"
                >
                  ✦ Talk To Us
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Build in Public Wall */}
        <div
          style={{
            position: "relative",
            background: "#0A0B1A",
            borderRadius: 16,
            maxWidth: 1160,
            margin: "36px auto 0",
            overflow: "hidden",
            border: "1px solid rgba(255,107,53,0.2)",
          }}
        >
          {/* Grid texture */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }} />

          {/* Ambient glow top-right */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          {/* Ambient glow bottom-left */}
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,127,255,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: "22px 24px 0" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Live pulse dot */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#00B87A", flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#00B87A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live</span>
                </div>
                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                  Build in Public Wall
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Milestones", "Updates", "Funding", "Launches"].map((tag) => (
                    <span key={tag} style={{
                      fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.45)",
                      background: "rgba(255,255,255,0.07)", borderRadius: 99,
                      padding: "2px 8px", border: "1px solid rgba(255,255,255,0.1)",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 10, color: "#FF6B35", fontWeight: 600, cursor: "pointer" }}>
                See all →
              </span>
            </div>

            {/* Posts or empty state */}
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0 40px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", fontSize: 22,
                }}>🔥</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
                  No posts yet — be the first founder to share
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", maxWidth: 340, margin: "0 auto" }}>
                  Submit your tool and post milestones, funding news, and updates directly to this wall.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    userId={user?.id ?? null}
                    isLiked={userLikedPostIds.includes(p.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer CTA — guests only */}
          {!user && (
            <div style={{
              position: "relative", zIndex: 1,
              margin: "20px 24px 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "16px 0 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                  Have a product story to tell?
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)" }}>
                  Submit your tool to post milestones and updates on this wall.
                </div>
              </div>
              <PostStoryWallButton />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
