import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";
import DiscoverHero from "../../components/DiscoverHero";

export const metadata: Metadata = {
  title: "Browse by Category — Next Big Tool",
  description: "Explore indie tools sorted by category — find exactly what you need.",
};

export const revalidate = 60;

/* ── Full canonical category list (mirrors dashboard/products/page.tsx) ── */
const ALL_CATEGORIES = [
  "AI Tools","Analytics & Monitoring","Automation & Workflow","Baby Face",
  "Couple Photo","Creator Economy","Cybersecurity & Privacy","Data & Infrastructure",
  "Design Tools","Developer Tools","E-Commerce","Education & Learning",
  "FinTech","Food & Travel","Future Child","Gaming & Game Dev",
  "Hardware & IoT","Health & Wellness","HR & Recruiting","Legal & Compliance",
  "Mobile Apps","Mock Interview","No-Code / Low-Code","Open Source",
  "Photo Merger","Productivity & Notes","Product Marketing","SEO & Content Marketing",
  "Social Media & Influencer Tools","Video & Audio Tools","Web3 / Blockchain",
  "Website & Landing Page Builders","Writing & Documentation",
];

/* ── 5-colour accent palette (cycling) ─────────────────────────────── */
const ACCENTS = ["#FF6B35","#3B7FFF","#00B875","#8B5CF6","#06B6D4"];
function accent(i: number) { return ACCENTS[i % ACCENTS.length]; }

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; website_url: string | null;
  pricing: string; upvote_count: number;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /* ── Fetch DB categories → id + name ─────────────────────────────────── */
  const { data: dbCats } = await supabase
    .from("categories")
    .select("id, name, slug");

  const nameToId: Record<string, string> = {};
  for (const c of dbCats ?? []) {
    nameToId[(c as { id: string; name: string; slug: string }).name] = (c as { id: string; name: string; slug: string }).id;
  }

  /* ── Count tools per category_id ─────────────────────────────────────── */
  const { data: toolCatCounts } = await supabase
    .from("tools")
    .select("category_id")
    .eq("status", "approved")
    .not("category_id", "is", null);

  const countById = (toolCatCounts ?? []).reduce<Record<string, number>>(
    (acc, r: { category_id: string }) => {
      acc[r.category_id] = (acc[r.category_id] ?? 0) + 1;
      return acc;
    }, {}
  );

  /* ── Build display list from static canonical list ───────────────────── */
  const categories = ALL_CATEGORIES.map((name, i) => {
    const id = nameToId[name];
    return { name, id, count: id ? (countById[id] ?? 0) : 0, accentColor: accent(i) };
  });

  const totalTools = categories.reduce((s, c) => s + c.count, 0);

  /* ── If a category is selected, fetch its tools ──────────────────────── */
  let filteredTools: ToolRow[] = [];
  const selectedCat = cat ? categories.find(c => c.name.toLowerCase() === cat.toLowerCase()) : null;

  if (selectedCat?.id) {
    const { data: toolRows } = await supabase
      .from("tools")
      .select("id, slug, name, tagline, logo_url, website_url, pricing, upvote_count")
      .eq("status", "approved")
      .eq("category_id", selectedCat.id)
      .order("upvote_count", { ascending: false });
    filteredTools = (toolRows ?? []) as ToolRow[];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <DiscoverHero
        badge="🗂️ Browse Categories"
        title={cat ? (selectedCat?.name ?? cat) : "Browse by"}
        titleAccent={cat ? undefined : "Category"}
        subtitle={cat
          ? `${filteredTools.length} tool${filteredTools.length !== 1 ? "s" : ""} in this category`
          : `${ALL_CATEGORIES.length} categories · ${totalTools} tools listed`}
        breadcrumb={cat ? (
          <Link href="/discover/categories" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 500 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            All Categories
          </Link>
        ) : undefined}
      />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          <div>
            {!cat ? (
              /* ── Category grid ─────────────────────────────────────── */
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>All Categories</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{ALL_CATEGORIES.length} categories</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {categories.map((cat) => (
                    <Link key={cat.name} href={`/discover/categories?cat=${encodeURIComponent(cat.name)}`} style={{ textDecoration: "none" }}>
                      <div
                        className="discover-cat-box"
                        style={{
                          borderRadius: 9, padding: "13px 14px 13px 17px",
                          background: "var(--surface)", border: "1px solid var(--border)",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                          position: "relative", overflow: "hidden",
                        }}
                      >
                        {/* Left accent stripe */}
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: cat.accentColor, borderRadius: "9px 0 0 9px" }} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>
                            {cat.count} tool{cat.count !== 1 ? "s" : ""}
                          </div>
                        </div>

                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              /* ── Filtered tool list ────────────────────────────────── */
              !selectedCat?.id ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>No Tool Listed Here</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    No tools in this category yet. Be the first to submit one!
                  </div>
                  <Link href="/dashboard/products" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: "#FF6B35", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                    Submit Your Tool →
                  </Link>
                </div>
              ) : filteredTools.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>No Tool Listed Here</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    No approved tools in this category yet. Be the first!
                  </div>
                  <Link href="/dashboard/products" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: "#FF6B35", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                    Submit Your Tool →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredTools.map((tool, i) => {
                    let logoSrc: string | null = tool.logo_url;
                    if (!logoSrc && tool.website_url) {
                      try { const d = new URL(tool.website_url).hostname.replace(/^www\./, ""); logoSrc = `https://logo.clearbit.com/${d}`; } catch { /* no-op */ }
                    }
                    return (
                      <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: "none" }}>
                        <div className="discover-tool-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", width: 22, textAlign: "center", flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ width: 40, height: 40, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--ink-muted)" }}>
                            {logoSrc ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : tool.name[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 2 }}>{tool.name}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.tagline}</div>
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--surface-alt)", color: "var(--ink-muted)", border: "1px solid var(--border)", textTransform: "capitalize" }}>{tool.pricing}</span>
                            <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 600 }}>▲ {tool.upvote_count}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
          </div>

          <div style={{ alignSelf: "start", position: "sticky", top: 90 }}>
            <DiscoverSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
