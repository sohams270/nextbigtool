import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import Footer from "../../components/Footer";
import DiscoverSidebar from "../../components/DiscoverSidebar";

export const metadata: Metadata = {
  title: "Browse by Use Case — Next Big Tool",
  description: "Find indie tools organised by use case — marketing, analytics, design, and more.",
};

export const revalidate = 60;

/* ── Static use-case list ─────────────────────────────────────────────── */
const USE_CASES: { name: string; emoji: string; searchTags: string[] }[] = [
  { name: "Content Creation",      emoji: "✍️",  searchTags: ["content", "writing", "blog", "copywriting", "cms"] },
  { name: "Marketing Automation",  emoji: "📢",  searchTags: ["marketing", "automation", "campaign", "ads"] },
  { name: "Analytics & Reporting", emoji: "📊",  searchTags: ["analytics", "reporting", "dashboard", "metrics", "data"] },
  { name: "Team Collaboration",    emoji: "👥",  searchTags: ["collaboration", "team", "workspace", "productivity"] },
  { name: "Customer Support",      emoji: "💬",  searchTags: ["support", "helpdesk", "customer", "chat", "crm"] },
  { name: "Project Management",    emoji: "📋",  searchTags: ["project", "management", "tasks", "planning", "kanban"] },
  { name: "Developer Tools",       emoji: "⚙️",  searchTags: ["developer", "api", "code", "devops", "cli"] },
  { name: "Design & Creative",     emoji: "🎨",  searchTags: ["design", "creative", "visual", "ui", "figma"] },
  { name: "SEO & Growth",          emoji: "📈",  searchTags: ["seo", "growth", "traffic", "ranking", "keyword"] },
  { name: "E-commerce",            emoji: "🛒",  searchTags: ["ecommerce", "shop", "store", "payments", "checkout"] },
  { name: "Finance & Invoicing",   emoji: "💰",  searchTags: ["finance", "invoice", "billing", "accounting", "payments"] },
  { name: "Email & Outreach",      emoji: "📧",  searchTags: ["email", "outreach", "newsletter", "cold", "smtp"] },
  { name: "Video & Media",         emoji: "🎥",  searchTags: ["video", "media", "streaming", "recording", "podcast"] },
  { name: "AI & Automation",       emoji: "🤖",  searchTags: ["ai", "automation", "ml", "gpt", "llm", "openai"] },
  { name: "Lead Generation",       emoji: "🎯",  searchTags: ["leads", "generation", "crm", "prospecting", "sales"] },
  { name: "No-code & Low-code",    emoji: "🔧",  searchTags: ["no-code", "low-code", "builder", "nocode", "workflow"] },
];

/* ── Color palette (cycling) ─────────────────────────────────────────── */
const PALETTE = [
  { gradient: "linear-gradient(135deg,#10B981,#059669)", light: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#10B981" },
  { gradient: "linear-gradient(135deg,#06B6D4,#0891B2)", light: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.3)",  text: "#06B6D4" },
  { gradient: "linear-gradient(135deg,#3B7FFF,#7C3AED)", light: "rgba(59,127,255,0.1)", border: "rgba(59,127,255,0.3)", text: "#3B7FFF" },
  { gradient: "linear-gradient(135deg,#8B5CF6,#6D28D9)", light: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", text: "#8B5CF6" },
  { gradient: "linear-gradient(135deg,#EC4899,#EF4444)", light: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.3)", text: "#EC4899" },
  { gradient: "linear-gradient(135deg,#F59E0B,#D97706)", light: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#F59E0B" },
  { gradient: "linear-gradient(135deg,#FF6B35,#FF4500)", light: "rgba(255,107,53,0.1)", border: "rgba(255,107,53,0.3)", text: "#FF6B35" },
  { gradient: "linear-gradient(135deg,#00B875,#065F46)", light: "rgba(0,184,117,0.1)",  border: "rgba(0,184,117,0.3)",  text: "#00B875" },
];

function palette(i: number) { return PALETTE[i % PALETTE.length]; }

type ToolRow = {
  id: string; slug: string; name: string; tagline: string;
  logo_url: string | null; website_url: string | null;
  pricing: string; upvote_count: number;
};

export default async function UseCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ uc?: string }>;
}) {
  const { uc } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let filteredTools: ToolRow[] = [];
  const selectedUC = uc ? USE_CASES.find((u) => u.name.toLowerCase() === uc.toLowerCase()) : null;

  if (selectedUC) {
    /* ── Search tags table for matching tag IDs ─────────────────────── */
    const tagFilter = selectedUC.searchTags
      .map((t) => `name.ilike.%${t}%`)
      .join(",");

    const { data: matchedTags } = await supabase
      .from("tags")
      .select("id")
      .or(tagFilter)
      .limit(30);

    const tagIds = (matchedTags ?? []).map((t: { id: string }) => t.id);

    if (tagIds.length > 0) {
      const { data: junctionRows } = await supabase
        .from("tool_tags")
        .select("tool_id")
        .in("tag_id", tagIds)
        .limit(60);

      const toolIds = [...new Set((junctionRows ?? []).map((r: { tool_id: string }) => r.tool_id))];

      if (toolIds.length > 0) {
        const { data: toolRows } = await supabase
          .from("tools")
          .select("id, slug, name, tagline, logo_url, website_url, pricing, upvote_count")
          .eq("status", "approved")
          .in("id", toolIds)
          .order("upvote_count", { ascending: false });
        filteredTools = (toolRows ?? []) as ToolRow[];
      }
    }

    /* ── Also try matching by name/tagline/description ───────────────── */
    if (filteredTools.length === 0) {
      const keywordFilter = selectedUC.searchTags
        .slice(0, 3)
        .flatMap((kw) => [
          `name.ilike.%${kw}%`,
          `tagline.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
        ])
        .join(",");

      const { data: fallbackRows } = await supabase
        .from("tools")
        .select("id, slug, name, tagline, logo_url, website_url, pricing, upvote_count")
        .eq("status", "approved")
        .or(keywordFilter)
        .order("upvote_count", { ascending: false })
        .limit(20);
      filteredTools = (fallbackRows ?? []) as ToolRow[];
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#10B981 0%,#0891B2 100%)",
        padding: "36px 28px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
          {uc && (
            <Link
              href="/discover/use-cases"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.75)", textDecoration: "none", marginBottom: 12, fontWeight: 500 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 6l-6 6 6 6"/>
              </svg>
              All Use Cases
            </Link>
          )}
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em", margin: "0 0 8px",
          }}>
            {uc ? (selectedUC ? `${selectedUC.emoji} ${selectedUC.name}` : uc) : "Browse by Use Case"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {uc
              ? `${filteredTools.length} tool${filteredTools.length !== 1 ? "s" : ""} matched this use case`
              : `${USE_CASES.length} use cases · Find the right tool for any job`}
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 28px 80px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          {/* ── Left content ─────────────────────────────────────────── */}
          <div>
            {!uc ? (
              /* Grid of use-case boxes */
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                    All Use Cases
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                    {USE_CASES.length} use cases
                  </span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 14,
                }}>
                  {USE_CASES.map((uc, i) => {
                    const p = palette(i);
                    return (
                      <Link
                        key={uc.name}
                        href={`/discover/use-cases?uc=${encodeURIComponent(uc.name)}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            borderRadius: 12, padding: "18px 16px",
                            background: p.light, border: `1px solid ${p.border}`,
                            cursor: "pointer", transition: "transform .15s, box-shadow .15s",
                            position: "relative", overflow: "hidden",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${p.border}`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "none";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                          }}
                        >
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.gradient }} />
                          <div style={{ fontSize: 22, marginBottom: 8 }}>{uc.emoji}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: p.text, lineHeight: 1.3 }}>
                            {uc.name}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Filtered tool list */
              filteredTools.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    No Tool Listed Here
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    No tools found for this use case yet. Submit yours and be the first!
                  </div>
                  <Link
                    href="/dashboard/submit"
                    style={{
                      display: "inline-block", padding: "10px 24px", borderRadius: 8,
                      background: "#10B981", color: "#fff",
                      textDecoration: "none", fontSize: 13, fontWeight: 700,
                    }}
                  >
                    Submit Your Tool →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredTools.map((tool, i) => {
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
                            (e.currentTarget as HTMLDivElement).style.borderColor = "#10B98155";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", width: 24, textAlign: "center", flexShrink: 0 }}>
                            #{i + 1}
                          </span>
                          <div style={{
                            width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                            background: "var(--surface-alt)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, fontWeight: 700, color: "var(--ink-muted)",
                          }}>
                            {logoSrc
                              ? <img src={logoSrc} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                              : tool.name[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>{tool.name}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tool.tagline}</div>
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "var(--surface-alt)", color: "var(--ink-muted)", border: "1px solid var(--border)", textTransform: "capitalize" }}>
                              {tool.pricing}
                            </span>
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
