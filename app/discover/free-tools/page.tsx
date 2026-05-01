import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";

export const metadata: Metadata = {
  title: "Free Tools — Next Big Tool",
  description: "Browse all free indie tools — no credit card, no trial, just free.",
};

export const revalidate = 60;

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; website_url: string | null;
  pricing: string; upvote_count: number;
  tool_tags: { tags: { name: string } | null }[];
  categories: { name: string } | null;
};

export default async function FreeToolsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: toolRows } = await supabase
    .from("tools")
    .select(`
      id, slug, name, tagline, logo_url, website_url, pricing, upvote_count,
      tool_tags ( tags ( name ) ),
      categories ( name )
    `)
    .eq("status", "approved")
    .eq("pricing", "free")
    .order("upvote_count", { ascending: false });

  const tools = (toolRows ?? []) as unknown as ToolRow[];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#FF6B35 0%,#FF4500 100%)",
        padding: "36px 28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: "rgba(255,255,255,0.18)", marginBottom: 12,
            fontSize: 11, fontWeight: 700, color: "#fff",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            🎁 Free Forever
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em", margin: "0 0 8px",
          }}>
            Free Tools
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0 }}>
            {tools.length} free tool{tools.length !== 1 ? "s" : ""} · No credit card required
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          {/* ── Tool list ────────────────────────────────────────────── */}
          <div>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                All Free Tools
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                {tools.length} tools
              </span>
            </div>

            {tools.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                  No Free Tools Yet
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                  Be the first to list a free tool on NextBigTool!
                </div>
                <Link
                  href="/dashboard/submit"
                  style={{
                    display: "inline-block", padding: "10px 24px", borderRadius: 8,
                    background: "#FF6B35", color: "#fff",
                    textDecoration: "none", fontSize: 13, fontWeight: 700,
                  }}
                >
                  Submit Your Tool →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tools.map((tool, i) => {
                  const tags = tool.tool_tags
                    .map((tt) => tt.tags?.name)
                    .filter(Boolean) as string[];
                  const category = tool.categories?.name;

                  let logoSrc: string | null = tool.logo_url;
                  if (!logoSrc && tool.website_url) {
                    try {
                      const d = new URL(tool.website_url).hostname.replace(/^www\./, "");
                      logoSrc = `https://logo.clearbit.com/${d}`;
                    } catch { /* no-op */ }
                  }

                  return (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px", borderRadius: 12,
                        background: "var(--surface)", border: "1px solid var(--border)",
                        transition: "box-shadow .15s, border-color .15s",
                      }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "#FF6B3555";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                        }}
                      >
                        {/* Rank */}
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: "var(--ink-muted)", width: 24,
                          textAlign: "center", flexShrink: 0,
                        }}>
                          #{i + 1}
                        </span>

                        {/* Logo */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 10, overflow: "hidden",
                          flexShrink: 0, background: "var(--surface-alt)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontWeight: 700, color: "var(--ink-muted)",
                        }}>
                          {logoSrc
                            ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            : tool.name[0]}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                              {tool.name}
                            </span>
                            {/* Free badge */}
                            <span style={{
                              fontSize: 9, fontWeight: 800, padding: "1px 7px",
                              borderRadius: 20, letterSpacing: "0.04em",
                              background: "rgba(255,107,53,0.12)",
                              color: "#FF6B35",
                              border: "1px solid rgba(255,107,53,0.25)",
                              textTransform: "uppercase",
                            }}>
                              FREE
                            </span>
                          </div>
                          <div style={{
                            fontSize: 12, color: "var(--ink-2)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {tool.tagline}
                          </div>
                          {(category || tags.length > 0) && (
                            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                              {category && (
                                <span style={{
                                  fontSize: 10, padding: "1px 7px", borderRadius: 20,
                                  background: "var(--surface-alt)", color: "var(--ink-muted)",
                                  border: "1px solid var(--border)",
                                }}>
                                  {category}
                                </span>
                              )}
                              {tags.slice(0, 2).map((tag) => (
                                <span key={tag} style={{
                                  fontSize: 10, padding: "1px 7px", borderRadius: 20,
                                  background: "var(--surface-alt)", color: "var(--ink-muted)",
                                  border: "1px solid var(--border)",
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Upvotes */}
                        <div style={{
                          flexShrink: 0, display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 2,
                          padding: "6px 10px", borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--surface-alt)",
                          minWidth: 48,
                        }}>
                          <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>▲</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                            {tool.upvote_count}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
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
