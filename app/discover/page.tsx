import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TopNav from "../components/TopNav";
import ProductCard from "../components/ProductCard";
import Pill from "../components/Pill";

const FILTER_TABS = [
  { label: "Featured", tab: "featured" },
  { label: "Categories", tab: "categories" },
  { label: "Hall of Fame", tab: "hall-of-fame" },
  { label: "Free Tools", tab: "free" },
  { label: "All Tools", tab: "" },
];

const CATEGORIES = [
  "AI Tools", "Developer", "Marketing", "Design",
  "Productivity", "Finance", "No-code", "Analytics",
];

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; pricing: string; upvote_count: number; featured: boolean;
  tool_tags: { tags: { name: string } | null }[];
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string }>;
}) {
  const { tab = "", category } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("tools")
    .select("id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name))")
    .eq("status", "approved")
    .order("upvote_count", { ascending: false });

  if (tab === "featured") query = query.eq("featured", true);
  if (tab === "free") query = query.eq("pricing", "free");
  if (tab === "hall-of-fame") query = query.gte("upvote_count", 100);

  const { data } = await query.limit(30);
  const tools = (data ?? []) as unknown as ToolRow[];

  let userUpvotedIds: string[] = [];
  if (user && tools.length > 0) {
    const { data: votes } = await supabase
      .from("upvotes").select("tool_id")
      .eq("user_id", user.id).in("tool_id", tools.map((t) => t.id));
    userUpvotedIds = (votes ?? []).map((v: { tool_id: string }) => v.tool_id);
  }

  function getTagNames(t: ToolRow) {
    const tags = t.tool_tags.map((tt) => tt.tags?.name).filter(Boolean) as string[];
    const pricing = t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1);
    return [...tags.slice(0, 2), pricing];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      {/* Header */}
      <div style={{ background: "#0A0B1A", color: "#fff", padding: "40px 0 32px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Discover Tools
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          Browse {tools.length}+ tools curated for builders and buyers.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #CFCFD4" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", gap: 6, paddingTop: 10, paddingBottom: 10 }}>
          {FILTER_TABS.map(({ label, tab: t }) => (
            <a key={t} href={`/discover${t ? `?tab=${t}` : ""}`} style={{ textDecoration: "none" }}>
              <Pill color={tab === t ? "orangeSolid" : "gray"} size="sm">{label}</Pill>
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 32px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 24 }}>
          {/* Tool grid */}
          <div>
            {tab === "categories" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>◆ {cat}</span>
                      <span style={{ fontSize: 11, color: "#FF6B35", fontWeight: 600 }}>See all →</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {tools.slice(0, 3).map((p, i) => (
                        <ProductCard
                          key={`${cat}-${p.id}`}
                          rank={`#${i + 1}`}
                          name={p.name} tagline={p.tagline}
                          tags={getTagNames(p)} votes={p.upvote_count}
                          logoLetter={p.name[0]}
                          toolId={p.id} userId={user?.id ?? null}
                          isUpvoted={userUpvotedIds.includes(p.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tools.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#A8A8AD", fontSize: 12 }}>
                    No tools found in this category yet.
                  </div>
                ) : (
                  tools.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      rank={`#${i + 1}`}
                      name={p.name} tagline={p.tagline}
                      tags={getTagNames(p)} votes={p.upvote_count}
                      logoLetter={p.name[0]}
                      badge={tab === "hall-of-fame" ? "🏆" : p.featured ? "Featured" : undefined}
                      toolId={p.id} userId={user?.id ?? null}
                      isUpvoted={userUpvotedIds.includes(p.id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ border: "1px solid #CFCFD4", borderRadius: 10, padding: 16, background: "#fff" }}>
              <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 12 }}>Browse by Category</span>
              {CATEGORIES.map((cat) => (
                <a key={cat} href={`/discover?tab=categories&category=${encodeURIComponent(cat)}`} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#1A1A1A" }}>◆ {cat}</span>
                    <span style={{ fontSize: 10, color: "#6B6B70" }}>→</span>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ background: "#0A0B1A", borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", display: "block", marginBottom: 6 }}>
                Submit Your Tool
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12 }}>
                Reach 14k+ founders and buyers on day one.
              </span>
              <a href="/dashboard/submit" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", background: "#FF6B35", color: "#fff", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Submit Your Tool →
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
