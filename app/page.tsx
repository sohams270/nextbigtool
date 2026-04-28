import { Suspense } from "react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import { createClient } from "@/utils/supabase/server";
import TopNav from "./components/TopNav";
import ProductShowcase from "./components/ProductShowcase";
import BuildInPublicWall from "./components/BuildInPublicWall";
import { type HofEntry } from "./components/ProductShowcase";
import PostStoryWallButton from "./components/PostStoryWallButton";
import HeroSection from "./components/HeroSection";
import Pill from "./components/Pill";
import Btn from "./components/Btn";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import FilterBar from "./components/FilterBar";
import SubmissionNudge, { type NudgeSubmission } from "./components/SubmissionNudge";

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

type SearchParams = Promise<{ sort?: string; price?: string; category?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { sort = "trending", price = "all", category = "" } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // ── Fetch tags for the category dropdown ──────────────────────────────
  const { data: tagsData } = await supabase
    .from("tags")
    .select("name")
    .order("name");
  const categories = (tagsData ?? []).map((t: { name: string }) => t.name);

  // ── Build tools query ─────────────────────────────────────────────────
  let toolQuery = supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, logo_url, pricing, upvote_count, featured,
      tool_tags ( tags ( name ) )
    `)
    .eq("status", "approved");

  // Price filter
  if (price && price !== "all") {
    toolQuery = toolQuery.eq("pricing", price);
  }

  // Category filter: look up tag → get matching tool IDs
  if (category) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("name", category)
      .maybeSingle();

    if (tagRow) {
      const { data: toolTagRows } = await supabase
        .from("tool_tags")
        .select("tool_id")
        .eq("tag_id", tagRow.id);
      const ids = (toolTagRows ?? []).map((r: { tool_id: string }) => r.tool_id);
      if (ids.length > 0) {
        toolQuery = toolQuery.in("id", ids);
      } else {
        // No tools in this category — force empty result
        toolQuery = toolQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
      }
    }
  }

  // Sort order
  switch (sort) {
    case "new":
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      toolQuery = toolQuery
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });
      break;
    case "activity":
      toolQuery = toolQuery.order("created_at", { ascending: false });
      break;
    case "top":
    case "hof":
    case "trending":
    default:
      toolQuery = toolQuery.order("upvote_count", { ascending: false });
      break;
  }

  const { data: allTools } = await toolQuery.limit(15);
  const tools = (allTools ?? []) as unknown as ToolRow[];

  // For non-hof sorts, put featured tools first
  const sortedTools = sort === "hof"
    ? tools
    : [
        ...tools.filter((t) => t.featured),
        ...tools.filter((t) => !t.featured),
      ];

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

  // ── User's own submissions (for nudge banner) ─────────────────────────
  let userSubmissions: NudgeSubmission[] = [];
  if (user) {
    const { data: myTools } = await supabase
      .from("tools")
      .select("id, name, slug, status, upvote_count, logo_url")
      .eq("submitter_id", user.id)
      .in("status", ["approved", "pending"])
      .order("created_at", { ascending: false })
      .limit(3);

    if (myTools && myTools.length > 0) {
      // Fetch today's upvote counts for the user's tools
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const myToolIds = myTools.map((t: { id: string }) => t.id);

      const { data: todayVotes } = await supabase
        .from("upvotes")
        .select("tool_id")
        .in("tool_id", myToolIds)
        .gte("created_at", todayStart.toISOString());

      const todayByTool = (todayVotes ?? []).reduce<Record<string, number>>((acc, v: { tool_id: string }) => {
        acc[v.tool_id] = (acc[v.tool_id] ?? 0) + 1;
        return acc;
      }, {});

      userSubmissions = myTools.map((t: { id: string; name: string; slug: string; status: string; upvote_count: number; logo_url: string | null }) => ({
        ...t,
        todayUpvotes: todayByTool[t.id] ?? 0,
      }));
    }
  }

  // ── Hall of Fame inducted tools ───────────────────────────────────────
  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select("inducted_at, tools(id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name)))")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false })
    .limit(3);

  const hofEntries: HofEntry[] = (hofRows ?? [])
    .filter((r: any) => r.tools)
    .map((r: any) => ({ inducted_at: r.inducted_at, tool: r.tools as any }));

  // Posts are now fetched client-side by <BuildInPublicWall />

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <HeroSection />

      {/* Filter bar — client component, needs Suspense for useSearchParams */}
      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar categories={categories} />
      </Suspense>

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
          {/* Feed */}
          <div>
            {/* Hall of Fame heading */}
            {sort === "hof" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 16, padding: "12px 16px",
                background: "linear-gradient(135deg,#0D0E22,#1A0D2E)",
                borderRadius: 12, border: "1px solid rgba(255,215,0,0.2)",
              }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 800,
                    background: "linear-gradient(90deg,#FFD700,#FFA500)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>Hall of Fame</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
                    All-time top products by community upvotes
                  </div>
                </div>
              </div>
            )}

            {/* Active filters summary */}
            {(category || price !== "all") && (
              <div style={{
                display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap",
              }}>
                {category && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20,
                    background: "var(--orange-soft)", border: "1px solid rgba(255,107,53,0.3)",
                    fontSize: 11, fontWeight: 700, color: "#FF6B35",
                  }}>
                    Category: {category}
                  </span>
                )}
                {price !== "all" && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20,
                    background: "var(--surface-alt)", border: "1px solid var(--border)",
                    fontSize: 11, fontWeight: 700, color: "var(--ink-2)",
                  }}>
                    Pricing: {price.charAt(0).toUpperCase() + price.slice(1)}
                  </span>
                )}
              </div>
            )}

            {/* Founder nudge — only shown to signed-in users with submissions */}
            <SubmissionNudge submissions={userSubmissions} />

            <ProductShowcase
              tools={sortedTools}
              userId={user?.id ?? null}
              userUpvotedIds={userUpvotedIds}
              hofEntries={hofEntries}
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
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 130, height: 130, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,180,0,0.18) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, rgba(255,215,80,0.2), rgba(255,140,0,0.15))",
                border: "1px solid rgba(255,215,80,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 10, fontSize: 18,
              }}>🏆</div>
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
              <a href="/contact" style={{ textDecoration: "none", display: "block" }}>
                <button style={{
                  width: "100%",
                  background: "linear-gradient(135deg, rgba(255,215,80,0.15), rgba(255,140,0,0.1))",
                  border: "1px solid rgba(255,215,80,0.45)",
                  borderRadius: 8, padding: "8px 0",
                  fontSize: 11, fontWeight: 700,
                  color: "#FFD700", cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
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
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,127,255,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: "22px 24px 20px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

            {/* Client component — handles fetching, pagination, and rendering */}
            <BuildInPublicWall userId={user?.id ?? null} />
          </div>

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

function FilterBarSkeleton() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 40px", borderBottom: "1px solid var(--border)",
      background: "var(--surface)", height: 45,
    }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[80, 72, 90, 68, 110].map((w, i) => (
          <div key={i} style={{ width: w, height: 28, borderRadius: 20, background: "var(--surface-alt)" }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[40, 50, 72, 44, 88].map((w, i) => (
          <div key={i} style={{ width: w, height: 28, borderRadius: 20, background: "var(--surface-alt)" }} />
        ))}
      </div>
    </div>
  );
}
