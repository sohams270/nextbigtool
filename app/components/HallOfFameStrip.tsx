import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

type HofTool = {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  slug: string;
  inducted_at: string | null;
};

function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function HallOfFameStrip() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select("inducted_at, tools(id, name, tagline, logo_url, slug)")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false })
    .limit(8);

  if (!hofRows || hofRows.length === 0) return null;

  const tools: (HofTool & { inducted_at: string | null })[] = (hofRows as any[]).map(r => ({
    ...(r.tools as HofTool),
    inducted_at: r.inducted_at,
  }));

  return (
    <div style={{
      maxWidth: 1160, margin: "28px auto 0", padding: "0 40px", boxSizing: "border-box" as const,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg,#ffd700,#ff8c00)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>🏆</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              Hall of Fame
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>
              Permanently inducted · Best of NextBigTool
            </div>
          </div>
        </div>
        <Link href="/discover?tab=hall-of-fame" style={{
          fontSize: 11.5, fontWeight: 600, color: "#ff6a3d",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
        }}>
          View all →
        </Link>
      </div>

      {/* Horizontal scroll strip */}
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 6,
        scrollbarWidth: "none" as const,
      }}>
        {tools.map(tool => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <div style={{
              width: 180,
              background: "var(--surface)",
              border: "1.5px solid rgba(255,215,0,0.35)",
              borderRadius: 12,
              padding: "14px 14px 12px",
              position: "relative",
              overflow: "hidden",
              transition: "box-shadow 0.15s, transform 0.1s",
              cursor: "pointer",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(255,215,0,0.15)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              {/* Gold shimmer top border */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)",
              }} />

              {/* Logo */}
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 10,
                background: tool.logo_url ? "transparent" : `hsl(${(tool.name.charCodeAt(0)) * 7 % 360},60%,50%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "#fff", overflow: "hidden",
                border: "1.5px solid rgba(255,215,0,0.3)",
              }}>
                {tool.logo_url
                  ? <img src={tool.logo_url} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : tool.name[0]}
              </div>

              {/* Name + tagline */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 3, letterSpacing: "-0.01em" }}>
                {tool.name}
              </div>
              <div style={{
                fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4, marginBottom: 10,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
              }}>
                {tool.tagline}
              </div>

              {/* Inducted badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                fontSize: 10, fontWeight: 700, color: "#9a6a00",
              }}>
                🏆 {tool.inducted_at ? fmtMonth(tool.inducted_at) : "Inducted"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
