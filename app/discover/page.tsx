import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TopNav from "../components/TopNav";
import ProductCard from "../components/ProductCard";
import Pill from "../components/Pill";
import SmartSearch from "../components/SmartSearch";

const FILTER_TABS = [
  { label: "Featured",     tab: "featured" },
  { label: "Categories",   tab: "categories" },
  { label: "Hall of Fame", tab: "hall-of-fame" },
  { label: "Free Tools",   tab: "free" },
  { label: "All Tools",    tab: "" },
];

const CATEGORIES = [
  "AI Tools", "Developer", "Marketing", "Design",
  "Productivity", "Finance", "No-code", "Analytics",
];

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; pricing: string; upvote_count: number;
  featured: boolean; description?: string;
  tool_tags: { tags: { name: string } | null }[];
};

// Stop words (mirrors API route — kept simple here)
const STOP = new Set([
  "a","an","the","is","it","for","to","of","in","on","at","by","i","me",
  "my","we","our","and","or","but","that","this","with","want","need",
  "looking","find","show","me","can","any","some","do","does","has","have",
  "use","used","using","something","tool","app","software","platform",
]);

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; q?: string }>;
}) {
  const { tab = "", category, q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let tools: ToolRow[] = [];
  let isSearchMode = searchQuery.length >= 2;

  if (isSearchMode) {
    /* ── Smart search mode ── */
    const words = searchQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w))
      .slice(0, 6);

    const tokens = words.length > 0 ? words : [searchQuery.toLowerCase()];

    const toolFilter = tokens
      .flatMap((w) => [
        `name.ilike.%${w}%`,
        `tagline.ilike.%${w}%`,
        `description.ilike.%${w}%`,
      ])
      .join(",");

    const { data: toolRows } = await supabase
      .from("tools")
      .select("id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name))")
      .eq("status", "approved")
      .or(toolFilter)
      .order("upvote_count", { ascending: false })
      .limit(30);

    // Tag search for additional results
    const tagFilter = tokens.map((w) => `name.ilike.%${w}%`).join(",");
    const { data: matchedTags } = await supabase
      .from("tags").select("id").or(tagFilter).limit(20);

    let extraTools: ToolRow[] = [];
    if (matchedTags && matchedTags.length > 0) {
      const tagIds = matchedTags.map((t: { id: string }) => t.id);
      const { data: junctionRows } = await supabase
        .from("tool_tags").select("tool_id").in("tag_id", tagIds).limit(30);
      const alreadyFound = new Set((toolRows ?? [] as ToolRow[]).map((t) => (t as ToolRow).id));
      const newIds = [
        ...new Set((junctionRows ?? []).map((r: { tool_id: string }) => r.tool_id)),
      ].filter((id) => !alreadyFound.has(id));
      if (newIds.length > 0) {
        const { data: tagToolRows } = await supabase
          .from("tools")
          .select("id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name))")
          .eq("status", "approved").in("id", newIds)
          .order("upvote_count", { ascending: false }).limit(10);
        extraTools = (tagToolRows ?? []) as unknown as ToolRow[];
      }
    }

    tools = [...(toolRows ?? []) as unknown as ToolRow[], ...extraTools];
  } else {
    /* ── Normal browse mode ── */
    let query = supabase
      .from("tools")
      .select("id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name))")
      .eq("status", "approved")
      .order("upvote_count", { ascending: false });

    if (tab === "featured")     query = query.eq("featured", true);
    if (tab === "free")         query = query.eq("pricing", "free");
    // hall-of-fame is handled separately below
    if (tab !== "hall-of-fame") {
      const { data } = await query.limit(30);
      tools = (data ?? []) as unknown as ToolRow[];
    }
  }

  // Fetch Hall of Fame inducted tools
  type HofEntry = { inducted_at: string | null; tools: ToolRow | null };
  let hofEntries: HofEntry[] = [];
  if (tab === "hall-of-fame") {
    const { data: hofRows } = await supabase
      .from("hall_of_fame")
      .select("inducted_at, tools(id, slug, name, tagline, logo_url, pricing, upvote_count, featured, tool_tags(tags(name)))")
      .eq("status", "approved")
      .order("inducted_at", { ascending: false })
      .limit(50);
    hofEntries = (hofRows ?? []) as unknown as HofEntry[];
    tools = hofEntries.map(e => e.tools).filter(Boolean) as ToolRow[];
  }

  let userUpvotedIds: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolIds: string[] = (tools as any[]).map((t) => t.id as string);
  if (user && toolIds.length > 0) {
    const { data: votes } = await supabase
      .from("upvotes").select("tool_id")
      .eq("user_id", user.id).in("tool_id", toolIds);
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
      <div style={{ background: "#0A0B1A", color: "#fff", padding: "36px 0 0", textAlign: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          {isSearchMode ? `Results for "${searchQuery}"` : "Discover Tools"}
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 20px" }}>
          {isSearchMode
            ? `${tools.length} tool${tools.length !== 1 ? "s" : ""} matched your search`
            : "Browse tools curated for builders and buyers."}
        </p>

        {/* Search bar in header */}
        <div style={{ maxWidth: 540, margin: "0 auto 0", padding: "0 24px 28px" }}>
          <SmartSearch compact />
        </div>
      </div>

      {/* Tabs — hidden in search mode */}
      {!isSearchMode && (
        <div style={{ background: "#fff", borderBottom: "1px solid #CFCFD4" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 32px", display: "flex", gap: 6 }}>
            {FILTER_TABS.map(({ label, tab: t }) => (
              <a key={t} href={`/discover${t ? `?tab=${t}` : ""}`} style={{ textDecoration: "none" }}>
                <Pill color={tab === t ? "orangeSolid" : "gray"} size="sm">{label}</Pill>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Search mode: "back" breadcrumb */}
      {isSearchMode && (
        <div style={{ background: "#fff", borderBottom: "1px solid #CFCFD4", padding: "10px 32px", maxWidth: 1100, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <a href="/discover" style={{ fontSize: 12, color: "#FF6B35", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Back to all tools
          </a>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 32px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 24 }}>
          {/* Tool grid */}
          <div>
            {!isSearchMode && tab === "hall-of-fame" ? (
              /* ── Hall of Fame gold grid ── */
              <div>
                {/* Gold hero banner */}
                <div style={{
                  marginBottom: 20, padding: "20px 22px",
                  background: "linear-gradient(135deg,#0D0E22,#1A0D2E)",
                  borderRadius: 14, border: "1px solid rgba(255,215,0,0.25)",
                  display: "flex", alignItems: "center", gap: 16,
                  position: "relative", overflow: "hidden",
                }}>
                  {[{t:"10%",l:"5%",s:2},{t:"20%",l:"90%",s:1.5},{t:"65%",l:"93%",s:2},{t:"80%",l:"3%",s:1.5},{t:"45%",l:"50%",s:1}].map((d,i) => (
                    <div key={i} style={{ position:"absolute",top:d.t,left:d.l,width:d.s,height:d.s,borderRadius:"50%",background:"rgba(255,215,80,0.5)" }} />
                  ))}
                  <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,rgba(255,215,80,0.2),rgba(255,140,0,0.15))",border:"1px solid rgba(255,215,80,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0 }}>🏆</div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em", background:"linear-gradient(90deg,#FFD700,#FFA500)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                      Hall of Fame
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:3 }}>
                      Permanently inducted · Curated by NextBigTool editors · The best products, forever
                    </div>
                  </div>
                </div>

                {tools.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"60px 0" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🏆</div>
                    <div style={{ fontSize:16, fontWeight:800, color:"#0f0f10", marginBottom:8 }}>No inductees yet</div>
                    <div style={{ fontSize:13, color:"#9090a0" }}>The first Hall of Fame products will appear here once inducted.</div>
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
                    {hofEntries.filter(e => e.tools).map((entry, i) => {
                      const t = entry.tools!;
                      const tags = t.tool_tags.map(tt => tt.tags?.name).filter(Boolean) as string[];
                      return (
                        <a key={t.id} href={`/tools/${t.slug}`} style={{ textDecoration:"none" }}>
                          <div style={{
                            background:"#fff",
                            border:"1.5px solid rgba(255,215,0,0.4)",
                            borderRadius:14, padding:"16px 16px 14px",
                            position:"relative", overflow:"hidden",
                            transition:"box-shadow 0.15s,transform 0.1s",
                          }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 24px rgba(255,215,0,0.18)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="none"; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}
                          >
                            {/* Gold top border */}
                            <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />
                            {/* Rank */}
                            <div style={{ position:"absolute",bottom:12,right:14,fontSize:26,fontWeight:900,color:"rgba(0,0,0,0.04)",letterSpacing:"-0.04em" }}>#{i+1}</div>

                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                              <div style={{
                                width:44,height:44,borderRadius:12,flexShrink:0,
                                background: t.logo_url ? "transparent" : `hsl(${t.name.charCodeAt(0)*7%360},60%,50%)`,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:18,fontWeight:800,color:"#fff",overflow:"hidden",
                                border:"1.5px solid rgba(255,215,0,0.3)",
                              }}>
                                {t.logo_url ? <img src={t.logo_url} alt={t.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : t.name[0]}
                              </div>
                              <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"rgba(255,215,0,0.12)",color:"#9a6a00",border:"1px solid rgba(255,215,0,0.3)" }}>
                                🏆 Inducted
                              </span>
                            </div>

                            <div style={{ fontSize:14,fontWeight:700,color:"#0f0f10",marginBottom:4 }}>{t.name}</div>
                            <div style={{ fontSize:11.5,color:"#6b6b70",lineHeight:1.45,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const,overflow:"hidden" }}>{t.tagline}</div>

                            <div style={{ display:"flex",gap:5,flexWrap:"wrap" as const }}>
                              {tags.slice(0,2).map(tag => (
                                <span key={tag} style={{ padding:"2px 8px",borderRadius:20,background:"#F5F5F5",fontSize:10,color:"#6b6b70" }}>{tag}</span>
                              ))}
                              <span style={{ padding:"2px 8px",borderRadius:20,background:"rgba(255,215,0,0.1)",fontSize:10,fontWeight:700,color:"#9a6a00" }}>
                                ▲ {t.upvote_count}
                              </span>
                            </div>

                            {entry.inducted_at && (
                              <div style={{ marginTop:8,fontSize:10,color:"#9090a0" }}>
                                Inducted {new Date(entry.inducted_at).toLocaleDateString("en-US",{month:"short",year:"numeric"})}
                              </div>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : !isSearchMode && tab === "categories" ? (
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
            ) : tools.length === 0 ? (
              /* Empty state */
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f0f10", marginBottom: 8 }}>
                  No tools found
                </div>
                <div style={{ fontSize: 13, color: "#9090a0", marginBottom: 20, lineHeight: 1.6 }}>
                  {isSearchMode
                    ? <>Try different keywords, or <a href="/discover" style={{ color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>browse all tools</a>.</>
                    : "No tools in this category yet."}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tools.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    rank={`#${i + 1}`}
                    name={p.name} tagline={p.tagline}
                    tags={getTagNames(p)} votes={p.upvote_count}
                    logoLetter={p.name[0]}
                    badge={
                      isSearchMode ? undefined :
                      tab === "hall-of-fame" ? "🏆" :
                      p.featured ? "Featured" : undefined
                    }
                    toolId={p.id} userId={user?.id ?? null}
                    isUpvoted={userUpvotedIds.includes(p.id)}
                  />
                ))}
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

            {/* Popular searches */}
            <div style={{ border: "1px solid #CFCFD4", borderRadius: 10, padding: 16, background: "#fff" }}>
              <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 10 }}>Popular Searches</span>
              {[
                "AI writing assistant",
                "social media scheduler",
                "no-code builder",
                "analytics dashboard",
                "email automation",
              ].map((s) => (
                <a key={s} href={`/discover?q=${encodeURIComponent(s)}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    fontSize: 11, color: "#3a3a45", padding: "6px 0",
                    borderBottom: "1px solid #F5F5F5",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#A8A8AD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    {s}
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
