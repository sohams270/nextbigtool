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
  title: "Hall of Fame – Top Indie Tools on NextBigTool",
  description: "The NextBigTool Hall of Fame spotlights the best-performing indie products. Permanent placement, evergreen visibility.",
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

/* ── UNO card colour palette — cycles per card ───────────────────────── */
const CARD_PALETTES = [
  { bg: "#D72B2B", oval: "#B01E1E", border: "#FF6B6B", corner: "#fff" },   // red
  { bg: "#1A5FB4", oval: "#0F3D7A", border: "#6BAEFF", corner: "#fff" },   // blue
  { bg: "#2E8B57", oval: "#1A5C38", border: "#6FE0A0", corner: "#fff" },   // green
  { bg: "#D4A017", oval: "#9A7210", border: "#FFD966", corner: "#fff" },   // yellow
  { bg: "#7B2FBE", oval: "#521F80", border: "#C084FC", corner: "#fff" },   // purple
  { bg: "#E07B39", oval: "#A85420", border: "#FDBA74", corner: "#fff" },   // orange
];

function pricingLabel(p: string) {
  const map: Record<string, string> = { free: "Free", freemium: "Freemium", paid: "Paid", contact: "Contact" };
  return map[p] ?? p;
}

export default async function HallOfFamePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select(`inducted_at, tools ( id, slug, name, tagline, logo_url, website_url, pricing, upvote_count, tool_tags ( tags ( name ) ) )`)
    .eq("status", "approved")
    .order("inducted_at", { ascending: false });

  const hofEntries = ((hofRows ?? []) as unknown as HofEntry[]).filter((e) => e.tools);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <DiscoverHero
        badge="🏆 Hall of Fame"
        title="Hall of"
        titleAccent="Fame"
        subtitle="The gold standard of indie tools — permanently recognised, community approved"
        accent="gold"
      />

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>
          <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
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
              <>
                {/* UNO card grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 24,
                }}>
                  {hofEntries.map((entry, i) => {
                    const tool = entry.tools!;
                    const tags = tool.tool_tags.map((tt) => tt.tags?.name).filter(Boolean) as string[];
                    const palette = CARD_PALETTES[i % CARD_PALETTES.length];
                    const inductedDate = entry.inducted_at
                      ? new Date(entry.inducted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                      : null;

                    let logoSrc: string | null = tool.logo_url;
                    if (!logoSrc && tool.website_url) {
                      try { const d = new URL(tool.website_url).hostname.replace(/^www\./, ""); logoSrc = `https://logo.clearbit.com/${d}`; } catch { /* no-op */ }
                    }

                    return (
                      <div key={tool.id} style={{ perspective: "1000px" }}>
                        {/* Card shell */}
                        <div style={{
                          position: "relative",
                          borderRadius: 20,
                          padding: 5,
                          background: `linear-gradient(145deg, ${palette.border}, ${palette.bg}, ${palette.oval})`,
                          boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)`,
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                          className="hof-uno-card"
                        >
                          {/* Inner card */}
                          <div style={{
                            borderRadius: 16,
                            background: palette.bg,
                            overflow: "hidden",
                            position: "relative",
                            minHeight: 300,
                            display: "flex",
                            flexDirection: "column",
                          }}>

                            {/* Background diagonal oval pattern */}
                            <div style={{
                              position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
                            }}>
                              <div style={{
                                position: "absolute",
                                top: "50%", left: "50%",
                                transform: "translate(-50%, -50%) rotate(-30deg)",
                                width: "150%", height: "70%",
                                background: palette.oval,
                                borderRadius: "50%",
                                opacity: 0.6,
                              }} />
                              {/* Subtle noise overlay */}
                              <div style={{
                                position: "absolute", inset: 0,
                                background: "radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%)",
                              }} />
                            </div>

                            {/* ── TOP: inducted badge only ── */}
                            <div style={{
                              position: "relative", zIndex: 2,
                              display: "flex", justifyContent: "flex-end",
                              padding: "12px 12px 0",
                            }}>
                              <div style={{
                                fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 20,
                                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
                                color: "#fff", letterSpacing: "0.06em", border: "1px solid rgba(255,255,255,0.2)",
                              }}>
                                🏆 INDUCTED
                              </div>
                            </div>

                            {/* ── CENTER: large logo ── */}
                            <div style={{
                              position: "relative", zIndex: 2,
                              display: "flex", justifyContent: "center", alignItems: "center",
                              padding: "12px 0 16px",
                              flex: 1,
                            }}>
                              <div style={{
                                width: 120, height: 120,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.95)",
                                border: "5px solid rgba(255,255,255,0.45)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}>
                                {logoSrc ? (
                                  <img src={logoSrc} alt={tool.name} style={{ width: "82%", height: "82%", objectFit: "contain" }} />
                                ) : (
                                  <span style={{ fontSize: 44, fontWeight: 900, color: palette.bg }}>{tool.name[0]}</span>
                                )}
                              </div>
                            </div>

                            {/* ── INFO PANEL (bottom white section) ── */}
                            <div style={{
                              position: "relative", zIndex: 2,
                              background: "rgba(8,9,20,0.92)",
                              backdropFilter: "blur(8px)",
                              padding: "14px 14px 14px",
                              borderTop: `2px solid ${palette.border}`,
                            }}>
                              {/* Tool name */}
                              <div style={{
                                fontSize: 15, fontWeight: 900, color: "#fff",
                                letterSpacing: "-0.02em", marginBottom: 4,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {tool.name}
                              </div>

                              {/* Tagline */}
                              <div style={{
                                fontSize: 10.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.45,
                                marginBottom: 10,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}>
                                {tool.tagline}
                              </div>

                              {/* Tags + pricing row */}
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                                {tags.slice(0, 2).map((tag) => (
                                  <span key={tag} style={{
                                    fontSize: 9, padding: "2px 6px", borderRadius: 20,
                                    background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                  }}>{tag}</span>
                                ))}
                                <span style={{
                                  fontSize: 9, padding: "2px 6px", borderRadius: 20,
                                  background: `${palette.bg}33`, color: palette.border,
                                  border: `1px solid ${palette.border}55`,
                                }}>
                                  {pricingLabel(tool.pricing)}
                                </span>
                              </div>

                              {/* Stats row */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: palette.border }}>
                                  <svg width={9} height={9} viewBox="0 0 12 12" fill={palette.border}><path d="M6 2L10 8H2L6 2Z"/></svg>
                                  {tool.upvote_count} upvotes
                                </div>
                                {inductedDate && (
                                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                                    {inductedDate}
                                  </div>
                                )}
                              </div>

                              {/* Redirect button */}
                              <Link
                                href={`/tools/${tool.slug}`}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                  width: "100%", padding: "8px 0", borderRadius: 10,
                                  background: `linear-gradient(135deg, ${palette.bg}, ${palette.oval})`,
                                  border: `1.5px solid ${palette.border}`,
                                  color: "#fff", fontSize: 11, fontWeight: 800,
                                  textDecoration: "none", letterSpacing: "0.04em",
                                  boxShadow: `0 4px 12px ${palette.bg}66`,
                                  transition: "opacity 0.15s",
                                }}
                              >
                                View Product
                                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M7 17L17 7M9 7h8v8"/>
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 40, padding: "28px", borderRadius: 16, background: "linear-gradient(135deg,#0D0E22,#1A0D2E)", border: "1px solid rgba(255,215,80,0.2)", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>Want to be in the Hall of Fame?</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.5 }}>
                    Submit your tool and apply for Hall of Fame induction. Only the best make it here.
                  </div>
                  <div style={{ maxWidth: 240, margin: "0 auto" }}>
                    <HofUpgradeBtn />
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ alignSelf: "start", position: "sticky", top: 90 }}>
            <DiscoverSidebar />
          </div>
        </div>
      </div>

      <style>{`
        .hof-uno-card:hover {
          transform: translateY(-6px) rotate(1deg);
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2) !important;
        }
      `}</style>

      <Footer />
    </div>
  );
}
