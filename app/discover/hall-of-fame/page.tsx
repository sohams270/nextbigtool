import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";
import HofUpgradeBtn from "../../components/HofUpgradeBtn";

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
    .select(`
      inducted_at,
      tools (
        id, slug, name, tagline, logo_url, website_url, pricing, upvote_count,
        tool_tags ( tags ( name ) )
      )
    `)
    .eq("status", "approved")
    .order("inducted_at", { ascending: false });

  const hofEntries = ((hofRows ?? []) as unknown as HofEntry[]).filter((e) => e.tools);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Premium dark/gold header ──────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0D0E22 0%,#1A0D2E 50%,#0D0E22 100%)",
        padding: "44px 28px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Starfield dots */}
        {[
          { top: "15%", left: "5%",  s: 2 }, { top: "8%",  left: "30%", s: 1.5 },
          { top: "25%", left: "60%", s: 1 }, { top: "12%", left: "80%", s: 2 },
          { top: "60%", left: "90%", s: 1.5 }, { top: "70%", left: "15%", s: 1 },
          { top: "80%", left: "45%", s: 2 }, { top: "50%", left: "70%", s: 1 },
          { top: "35%", left: "20%", s: 1.5 }, { top: "90%", left: "75%", s: 1 },
        ].map((star, i) => (
          <div key={i} style={{
            position: "absolute", top: star.top, left: star.left,
            width: star.s, height: star.s, borderRadius: "50%",
            background: "rgba(255,215,80,0.5)", pointerEvents: "none",
          }} />
        ))}
        {/* Radial glows */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,180,0,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,rgba(255,215,80,0.2),rgba(255,140,0,0.15))",
            border: "1px solid rgba(255,215,80,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 16px",
          }}>🏆</div>
          <h1 style={{
            fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em",
            margin: "0 0 10px",
            background: "linear-gradient(90deg,#FFD700,#FFA500,#FFD700)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200%",
          }}>
            Hall of Fame
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 4px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Permanently inducted · Curated by NextBigTool editors
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,215,80,0.6)", margin: 0 }}>
            {hofEntries.length} product{hofEntries.length !== 1 ? "s" : ""} in the Hall of Fame
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          {/* ── Hall of Fame entries ──────────────────────────────────── */}
          <div>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                All Inductees
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                {hofEntries.length} products
              </span>
            </div>

            {hofEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                  No Inductees Yet
                </div>
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

                  let logoSrc: string | null = tool.logo_url;
                  if (!logoSrc && tool.website_url) {
                    try {
                      const d = new URL(tool.website_url).hostname.replace(/^www\./, "");
                      logoSrc = `https://logo.clearbit.com/${d}`;
                    } catch { /* no-op */ }
                  }

                  const isTop3 = i < 3;

                  return (
                    <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "18px 20px", borderRadius: 14,
                        background: isTop3
                          ? "linear-gradient(135deg,#0D0E22,#15102A)"
                          : "var(--surface)",
                        border: isTop3
                          ? "1px solid rgba(255,215,0,0.28)"
                          : "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                        transition: "box-shadow .15s, border-color .15s",
                      }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = isTop3
                            ? "0 6px 28px rgba(255,215,0,0.15)"
                            : "0 4px 16px rgba(0,0,0,0.08)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = isTop3
                            ? "rgba(255,215,0,0.5)"
                            : "rgba(255,215,0,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                          (e.currentTarget as HTMLDivElement).style.borderColor = isTop3
                            ? "rgba(255,215,0,0.28)"
                            : "var(--border)";
                        }}
                      >
                        {/* Gold top accent for top-3 */}
                        {isTop3 && (
                          <div style={{
                            position: "absolute", top: 0, left: 0, right: 0,
                            height: 2,
                            background: "linear-gradient(90deg,#FFD700,#FFA500,#FFD700)",
                          }} />
                        )}

                        {/* Medal / rank */}
                        <div style={{
                          fontSize: 22, flexShrink: 0,
                          width: 32, textAlign: "center",
                        }}>
                          {medals[i] ?? (
                            <span style={{
                              fontSize: 12, fontWeight: 700,
                              color: isTop3 ? "rgba(255,215,0,0.7)" : "var(--ink-muted)",
                            }}>
                              #{i + 1}
                            </span>
                          )}
                        </div>

                        {/* Logo */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 12, overflow: "hidden",
                          flexShrink: 0,
                          background: isTop3 ? "rgba(255,215,0,0.1)" : "var(--surface-alt)",
                          border: isTop3
                            ? "1.5px solid rgba(255,215,0,0.3)"
                            : "1px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, fontWeight: 800,
                          color: isTop3 ? "#FFD700" : "var(--ink-muted)",
                        }}>
                          {logoSrc
                            ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            : tool.name[0]}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{
                              fontSize: 15, fontWeight: 800,
                              color: isTop3 ? "#fff" : "var(--ink)",
                            }}>
                              {tool.name}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              padding: "2px 8px", borderRadius: 20,
                              background: "rgba(255,215,0,0.15)",
                              color: isTop3 ? "#FFD700" : "#9a6a00",
                              border: "1px solid rgba(255,215,0,0.3)",
                              letterSpacing: "0.03em",
                            }}>
                              🏆 Inducted
                            </span>
                          </div>
                          <div style={{
                            fontSize: 12.5, color: isTop3 ? "rgba(255,255,255,0.55)" : "var(--ink-2)",
                            marginBottom: 8, lineHeight: 1.4,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {tool.tagline}
                          </div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} style={{
                                fontSize: 10, padding: "1px 7px", borderRadius: 20,
                                background: isTop3 ? "rgba(255,255,255,0.07)" : "var(--surface-alt)",
                                color: isTop3 ? "rgba(255,255,255,0.4)" : "var(--ink-muted)",
                                border: `1px solid ${isTop3 ? "rgba(255,255,255,0.1)" : "var(--border)"}`,
                              }}>
                                {tag}
                              </span>
                            ))}
                            <span style={{
                              fontSize: 10, padding: "1px 7px", borderRadius: 20,
                              background: isTop3 ? "rgba(255,255,255,0.05)" : "var(--surface-alt)",
                              color: isTop3 ? "rgba(255,215,0,0.7)" : "#9a6a00",
                              border: `1px solid ${isTop3 ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.2)"}`,
                              textTransform: "capitalize",
                            }}>
                              {tool.pricing}
                            </span>
                          </div>
                        </div>

                        {/* Right side: votes + date */}
                        <div style={{
                          flexShrink: 0, display: "flex", flexDirection: "column",
                          alignItems: "flex-end", gap: 6,
                        }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontSize: 13, fontWeight: 700,
                            color: isTop3 ? "rgba(255,215,0,0.9)" : "var(--ink)",
                          }}>
                            ▲ <span>{tool.upvote_count}</span>
                          </div>
                          {entry.inducted_at && (
                            <div style={{
                              fontSize: 10,
                              color: isTop3 ? "rgba(255,255,255,0.3)" : "var(--ink-muted)",
                            }}>
                              {new Date(entry.inducted_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* CTA to get inducted */}
            {hofEntries.length > 0 && (
              <div style={{
                marginTop: 32, padding: "24px 24px", borderRadius: 14,
                background: "linear-gradient(135deg,#0D0E22,#1A0D2E)",
                border: "1px solid rgba(255,215,80,0.2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>
                  Want to be in the Hall of Fame?
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.5 }}>
                  Submit your tool and apply for Hall of Fame induction. Only the best make it here.
                </div>
                <div style={{ maxWidth: 240, margin: "0 auto" }}>
                  <HofUpgradeBtn />
                </div>
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
