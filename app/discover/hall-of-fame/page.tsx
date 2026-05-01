import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";
import HofUpgradeBtn from "../../components/HofUpgradeBtn";
import DiscoverHero from "../../components/DiscoverHero";

export const metadata: Metadata = {
  title: "Hall of Fame — Next Big Tool",
  description: "The best indie tools, permanently inducted by the NextBigTool community.",
};

export const revalidate = 60;

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; website_url: string | null;
  pricing: string; upvote_count: number;
  tool_tags: { tags: { name: string } | null }[];
};

type HofEntry = {
  inducted_at: string | null;
  tools: ToolRow | null;
};

export default async function HallOfFamePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select(`inducted_at, tools ( id, slug, name, tagline, logo_url, website_url, pricing, upvote_count, tool_tags ( tags ( name ) ) )`)
    .eq("status", "approved")
    .order("inducted_at", { ascending: false });

  const hofEntries = ((hofRows ?? []) as unknown as HofEntry[]).filter((e) => e.tools);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <DiscoverHero
        badge="🏆 Hall of Fame"
        title="Hall of"
        titleAccent="Fame"
        subtitle={`${hofEntries.length} product${hofEntries.length !== 1 ? "s" : ""} · Permanently inducted · Curated by NextBigTool editors`}
        accent="gold"
      />

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>All Inductees</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{hofEntries.length} products</span>
            </div>

            {hofEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>No Inductees Yet</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 24 }}>
                  The first Hall of Fame products will appear here once inducted by our editors.
                </div>
                <HofUpgradeBtn />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {hofEntries.map((entry, i) => {
                  const tool = entry.tools!;
                  const tags = tool.tool_tags.map((tt) => tt.tags?.name).filter(Boolean) as string[];
                  const isTop3 = i < 3;

                  let logoSrc: string | null = tool.logo_url;
                  if (!logoSrc && tool.website_url) {
                    try { const d = new URL(tool.website_url).hostname.replace(/^www\./, ""); logoSrc = `https://logo.clearbit.com/${d}`; } catch { /* no-op */ }
                  }

                  return (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: "none" }}>
                      <div
                        className={isTop3 ? "discover-hof-row-premium" : "discover-hof-row-std"}
                        style={{
                          display: "flex", alignItems: "center", gap: 16,
                          padding: "18px 20px", borderRadius: 14,
                          background: isTop3 ? "linear-gradient(135deg,#0D0E22,#15102A)" : "var(--surface)",
                          border: isTop3 ? "1px solid rgba(255,215,0,0.28)" : "1px solid var(--border)",
                          position: "relative", overflow: "hidden",
                        }}
                      >
                        {isTop3 && (
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#FFD700,#FFA500,#FFD700)" }} />
                        )}
                        <div style={{ fontSize: 22, flexShrink: 0, width: 32, textAlign: "center" }}>
                          {i < 3 ? medals[i] : (
                            <span style={{ fontSize: 12, fontWeight: 700, color: isTop3 ? "rgba(255,215,0,0.7)" : "var(--ink-muted)" }}>#{i + 1}</span>
                          )}
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: isTop3 ? "rgba(255,215,0,0.1)" : "var(--surface-alt)", border: isTop3 ? "1.5px solid rgba(255,215,0,0.3)" : "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: isTop3 ? "#FFD700" : "var(--ink-muted)" }}>
                          {logoSrc
                            ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            : tool.name[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: isTop3 ? "#fff" : "var(--ink)" }}>{tool.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(255,215,0,0.15)", color: isTop3 ? "#FFD700" : "#9a6a00", border: "1px solid rgba(255,215,0,0.3)", letterSpacing: "0.03em" }}>
                              🏆 Inducted
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: isTop3 ? "rgba(255,255,255,0.55)" : "var(--ink-2)", marginBottom: 8, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.tagline}</div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: isTop3 ? "rgba(255,255,255,0.07)" : "var(--surface-alt)", color: isTop3 ? "rgba(255,255,255,0.4)" : "var(--ink-muted)", border: `1px solid ${isTop3 ? "rgba(255,255,255,0.1)" : "var(--border)"}` }}>{tag}</span>
                            ))}
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: isTop3 ? "rgba(255,255,255,0.05)" : "var(--surface-alt)", color: isTop3 ? "rgba(255,215,0,0.7)" : "#9a6a00", border: "1px solid rgba(255,215,0,0.2)", textTransform: "capitalize" }}>{tool.pricing}</span>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: isTop3 ? "rgba(255,215,0,0.9)" : "var(--ink)" }}>
                            ▲ <span>{tool.upvote_count}</span>
                          </div>
                          {entry.inducted_at && (
                            <div style={{ fontSize: 10, color: isTop3 ? "rgba(255,255,255,0.3)" : "var(--ink-muted)" }}>
                              {new Date(entry.inducted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {hofEntries.length > 0 && (
              <div style={{ marginTop: 32, padding: "24px", borderRadius: 14, background: "linear-gradient(135deg,#0D0E22,#1A0D2E)", border: "1px solid rgba(255,215,80,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>Want to be in the Hall of Fame?</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.5 }}>
                  Submit your tool and apply for Hall of Fame induction. Only the best make it here.
                </div>
                <div style={{ maxWidth: 240, margin: "0 auto" }}>
                  <HofUpgradeBtn />
                </div>
              </div>
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
