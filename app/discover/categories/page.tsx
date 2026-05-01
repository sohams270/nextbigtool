import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";

export const metadata: Metadata = {
  title: "Browse by Category — Next Big Tool",
  description: "Explore indie tools sorted by category — find exactly what you need.",
};

export const revalidate = 60;

/* ── Color palette for category boxes ───────────────────────────────── */
const PALETTE = [
  { gradient: "linear-gradient(135deg,#FF6B35,#FF4500)", light: "rgba(255,107,53,0.1)", border: "rgba(255,107,53,0.3)", text: "#FF6B35" },
  { gradient: "linear-gradient(135deg,#3B7FFF,#7C3AED)", light: "rgba(59,127,255,0.1)", border: "rgba(59,127,255,0.3)", text: "#3B7FFF" },
  { gradient: "linear-gradient(135deg,#00C2FF,#0052CC)", light: "rgba(0,194,255,0.1)", border: "rgba(0,194,255,0.3)", text: "#00C2FF" },
  { gradient: "linear-gradient(135deg,#00B875,#059669)", light: "rgba(0,184,117,0.1)", border: "rgba(0,184,117,0.3)", text: "#00B875" },
  { gradient: "linear-gradient(135deg,#EC4899,#EF4444)", light: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.3)", text: "#EC4899" },
  { gradient: "linear-gradient(135deg,#F59E0B,#D97706)", light: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#F59E0B" },
  { gradient: "linear-gradient(135deg,#8B5CF6,#6D28D9)", light: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", text: "#8B5CF6" },
  { gradient: "linear-gradient(135deg,#06B6D4,#0891B2)", light: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.3)", text: "#06B6D4" },
  { gradient: "linear-gradient(135deg,#10B981,#065F46)", light: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#10B981" },
  { gradient: "linear-gradient(135deg,#F97316,#EA580C)", light: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", text: "#F97316" },
];

function palette(i: number) { return PALETTE[i % PALETTE.length]; }

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

  /* ── Fetch categories with tool counts ───────────────────────────────── */
  const { data: catRows } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: toolCatCounts } = await supabase
    .from("tools")
    .select("category_id")
    .eq("status", "approved")
    .not("category_id", "is", null);

  const countByCategory = (toolCatCounts ?? []).reduce<Record<string, number>>(
    (acc, r: { category_id: string }) => {
      acc[r.category_id] = (acc[r.category_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const categories = (catRows ?? [])
    .map((c: { id: string; name: string }) => ({
      id: c.id,
      name: c.name,
      count: countByCategory[c.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  /* ── If a category is selected, fetch its tools ──────────────────────── */
  let filteredTools: ToolRow[] = [];
  let selectedCat: { id: string; name: string } | null = null;

  if (cat) {
    const found = categories.find(
      (c) => c.name.toLowerCase() === cat.toLowerCase()
    );
    if (found) {
      selectedCat = found;
      const { data: toolRows } = await supabase
        .from("tools")
        .select("id, slug, name, tagline, logo_url, website_url, pricing, upvote_count")
        .eq("status", "approved")
        .eq("category_id", found.id)
        .order("upvote_count", { ascending: false });
      filteredTools = (toolRows ?? []) as ToolRow[];
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#3B7FFF 0%,#7C3AED 100%)",
        padding: "36px 28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
          {cat && (
            <Link
              href="/discover/categories"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 12, fontWeight: 500 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 6l-6 6 6 6"/>
              </svg>
              All Categories
            </Link>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            {cat ? (selectedCat?.name ?? cat) : "Browse by Category"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {cat
              ? `${filteredTools.length} tool${filteredTools.length !== 1 ? "s" : ""} in this category`
              : `${categories.length} categories · Find exactly what you need`}
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          {/* ── Left: Category grid OR filtered tool list ─────────────── */}
          <div>
            {!cat ? (
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>All Categories</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{categories.length} categories</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {categories.map((cat, i) => {
                    const p = palette(i);
                    return (
                      <Link key={cat.id} href={`/discover/categories?cat=${encodeURIComponent(cat.name)}`} style={{ textDecoration: "none" }}>
                        <div
                          className="discover-cat-box"
                          style={{
                            borderRadius: 12, padding: "18px 16px",
                            background: p.light, border: `1px solid ${p.border}`,
                            cursor: "pointer", position: "relative", overflow: "hidden",
                          }}
                        >
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.gradient }} />
                          <div style={{ fontSize: 13, fontWeight: 700, color: p.text, marginBottom: 4 }}>{cat.name}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{cat.count} tool{cat.count !== 1 ? "s" : ""}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {categories.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-muted)", fontSize: 14 }}>
                    No categories yet.
                  </div>
                )}
              </>
            ) : (
              filteredTools.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>No Tool Listed Here</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    No approved tools in this category yet. Be the first to submit one!
                  </div>
                  <Link href="/dashboard/submit" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: "#FF6B35", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                    Submit Your Tool →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredTools.map((tool, i) => {
                    let logoSrc: string | null = tool.logo_url;
                    if (!logoSrc && tool.website_url) {
                      try { const d = new URL(tool.website_url).hostname.replace(/^www\./, ""); logoSrc = `https://logo.clearbit.com/${d}`; } catch { /* no-op */ }
                    }
                    return (
                      <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: "none" }}>
                        <div className="discover-tool-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", width: 24, textAlign: "center", flexShrink: 0 }}>#{i + 1}</span>
                          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--ink-muted)" }}>
                            {logoSrc
                              ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              : tool.name[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{tool.name}</div>
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

          {/* ── Right: Sidebar ───────────────────────────────────────── */}
          <div style={{ alignSelf: "start", position: "sticky", top: 90 }}>
            <DiscoverSidebar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
