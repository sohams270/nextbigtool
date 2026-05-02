import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Pill from "./Pill";
import HofUpgradeBtn from "./HofUpgradeBtn";
import NewsletterForm from "./NewsletterForm";

export default async function DiscoverSidebar() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  /* ── Browse Categories with live counts ─────────────────────────────── */
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

  const liveCategories = (catRows ?? [])
    .map((c: { id: string; name: string }) => ({
      id: c.id,
      name: c.name,
      count: countByCategory[c.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  /* ── Hall of Fame sidebar entries (top 3) ────────────────────────────── */
  const { data: hofRows } = await supabase
    .from("hall_of_fame")
    .select("inducted_at, tools(id, slug, name, logo_url, website_url, upvote_count)")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false })
    .limit(3);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hofEntries = (hofRows ?? []).filter((r: any) => r.tools);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Browse Categories ─────────────────────────────────────────── */}
      <div style={{
        border: "1px solid var(--border)", borderRadius: 10,
        padding: 14, background: "var(--surface)",
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 12, color: "var(--ink)" }}>
          Browse Categories
        </span>
        {liveCategories.length === 0 ? (
          <p style={{ fontSize: 11, color: "var(--ink-muted)", margin: 0 }}>No categories yet.</p>
        ) : (
          liveCategories.slice(0, 7).map(({ id, name, count }) => (
            <Link
              key={id}
              href={`/discover/categories?cat=${encodeURIComponent(name)}`}
              style={{
                textDecoration: "none", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                padding: "6px 0", borderBottom: "1px solid var(--border-faint)",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink)" }}>{name}</span>
              <Pill color="gray" size="xs">{count}</Pill>
            </Link>
          ))
        )}
        {liveCategories.length > 7 && (
          <Link
            href="/discover/categories"
            style={{ fontSize: 10, color: "#FF6B35", fontWeight: 600, display: "block", marginTop: 10, textDecoration: "none" }}
          >
            View All →
          </Link>
        )}
      </div>

      {/* ── Hall of Fame ──────────────────────────────────────────────── */}
      {hofEntries.length > 0 && (
        <div style={{
          borderRadius: 10,
          border: "1px solid rgba(255,215,0,0.3)",
          background: "linear-gradient(145deg,#0D0E22,#1A0D2E)",
        }}>
          <div style={{ padding: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 10, color: "#FFD700" }}>
              🏆 Hall of Fame
            </span>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {hofEntries.map((entry: any, i: number) => {
              const t = entry.tools;
              let logoSrc: string | null = t.logo_url;
              if (!logoSrc && t.website_url) {
                try {
                  const d = new URL(t.website_url).hostname.replace(/^www\./, "");
                  logoSrc = `https://logo.clearbit.com/${d}`;
                } catch { /* no-op */ }
              }
              return (
                <a
                  key={t.id}
                  href={`/tools/${t.slug}`}
                  style={{
                    textDecoration: "none", display: "flex", alignItems: "center",
                    gap: 8, padding: "6px 0",
                    borderBottom: i < hofEntries.length - 1
                      ? "1px solid rgba(255,255,255,0.07)" : "none",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, overflow: "hidden", flexShrink: 0,
                    background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#FFD700",
                  }}>
                    {logoSrc
                      ? <img src={logoSrc} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : t.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,215,0,0.6)" }}>▲ {t.upvote_count}</div>
                  </div>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{medals[i] ?? "🏅"}</span>
                </a>
              );
            })}
            <a
              href="/discover/hall-of-fame"
              style={{ fontSize: 10, color: "rgba(255,215,0,0.7)", fontWeight: 600, display: "block", marginTop: 10, textDecoration: "none" }}
            >
              View all →
            </a>
          </div>
        </div>
      )}

      {/* ── Newsletter ────────────────────────────────────────────────── */}
      <div style={{ background: "#0A0B1A", borderRadius: 10, padding: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", display: "block", marginBottom: 4 }}>
          The Founder's Weekly
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 10 }}>
          Hand-picked indie tools worth your attention — no spam, unsubscribe anytime.
        </span>
        <NewsletterForm source="discover-sidebar" dark />
      </div>

      {/* ── Hall of Fame Promo ────────────────────────────────────────── */}
      <div style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        background: "linear-gradient(145deg, #0D0E22 0%, #1A0D2E 60%, #0D0E22 100%)",
        padding: "18px 16px 16px", border: "1px solid rgba(255,215,80,0.2)",
      }}>
        {[
          { top: "12%", left: "8%",  size: 2   },
          { top: "22%", left: "88%", size: 1.5 },
          { top: "55%", left: "92%", size: 2   },
          { top: "75%", left: "6%",  size: 1.5 },
          { top: "40%", left: "50%", size: 1   },
          { top: "85%", left: "75%", size: 1.5 },
          { top: "8%",  left: "60%", size: 1   },
          { top: "65%", left: "30%", size: 1   },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", top: s.top, left: s.left,
            width: s.size, height: s.size, borderRadius: "50%",
            background: "rgba(255,215,80,0.6)", pointerEvents: "none",
          }} />
        ))}
        <div style={{
          position: "absolute", top: -30, right: -30, width: 130, height: 130,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,180,0,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(255,215,80,0.2), rgba(255,140,0,0.15))",
          border: "1px solid rgba(255,215,80,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 10, fontSize: 18,
        }}>🏆</div>
        <div style={{
          fontSize: 12, fontWeight: 800, marginBottom: 6, lineHeight: 1.3,
          background: "linear-gradient(90deg, #FFD700, #FFA500, #FFD700)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundSize: "200%",
        }}>
          Place your product in Hall of Fame
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
          Make your product stand out from the crowd — at all times.
        </div>
        <HofUpgradeBtn />
      </div>

    </div>
  );
}
