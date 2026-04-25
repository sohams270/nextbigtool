import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };

const HOF_ENTRIES = [
  { initial: "P", bg: "#4f46e5", name: "PromptCraft", desc: "AI prompt library", tags: ["AI Tools"], upvotes: 312, rank: "01", medal: "🥇" },
  { initial: "R", bg: "#ff6a3d", name: "Raycast",     desc: "macOS launcher",   tags: ["Developer"], upvotes: 287, rank: "02", medal: "🥈" },
  { initial: "L", bg: "#0a7a4f", name: "Linear",      desc: "Issue tracker",    tags: ["SaaS"],      upvotes: 251, rank: "03", medal: "🥉" },
];

export default async function HallOfFamePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Core feature</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>🏆 Induct in Hall of Fame</h1>
        <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>A permanent, curated showcase of the best products on NextBigTool. Visible on the homepage forever.</p>
      </div>

      {/* Locked wrap */}
      <div style={{ position: "relative" }}>
        {/* Blurred preview */}
        <div style={{ filter: "blur(4px)", userSelect: "none" as const }}>
          {/* HoF grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
            {HOF_ENTRIES.map((e) => (
              <div key={e.rank} style={{
                ...card,
                background: "linear-gradient(135deg,#fffdf5,#fff8e6)",
                border: "1.5px solid #f0e6c0",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: e.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                    {e.initial}
                  </div>
                  <span style={{ fontSize: 22 }}>{e.medal}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10" }}>{e.name}</div>
                  <div style={{ fontSize: 12.5, color: "#9090a0" }}>{e.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {e.tags.map(t => (
                    <span key={t} style={{ padding: "2px 8px", borderRadius: 20, background: "#f1f1ee", fontSize: 11, color: "#6b6b78" }}>{t}</span>
                  ))}
                  <span style={{ padding: "2px 8px", borderRadius: 20, background: "#fff0eb", fontSize: 11, fontWeight: 700, color: "#c04400" }}>▲ {e.upvotes}</span>
                </div>
                <div style={{ position: "absolute", bottom: 12, right: 14, fontSize: 28, fontWeight: 900, color: "rgba(0,0,0,0.05)", letterSpacing: "-0.04em" }}>
                  #{e.rank}
                </div>
              </div>
            ))}
          </div>

          {/* Submit form preview */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 4px" }}>Submit your product to Hall of Fame</h2>
            <p style={{ fontSize: 13, color: "#9090a0", margin: "0 0 16px" }}>Permanent placement. No expiry. Reviewed by the NBT editorial team.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>Product</label>
                <input placeholder="Select product" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#3a3a45", display: "block", marginBottom: 5 }}>Why it deserves Hall of Fame</label>
                <input placeholder="One paragraph pitch" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(246,246,244,0.72)",
          backdropFilter: "blur(2px)",
          borderRadius: 14,
          textAlign: "center",
          padding: 32,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 16,
            background: "linear-gradient(135deg,#ffd700,#ff8c00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>🏆</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f0f10", marginBottom: 8 }}>Hall of Fame is a Core feature</div>
          <div style={{ fontSize: 13.5, color: "#6b6b78", maxWidth: 400, lineHeight: 1.6, marginBottom: 20 }}>
            Make your product stand out permanently. Homepage placement, badge on your listing, priority in newsletter features.
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <Link href="/dashboard/plan" style={{
              background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", borderRadius: 9,
              padding: "0 20px", height: 40, fontSize: 13.5, fontWeight: 700, color: "#fff",
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Upgrade to Core — $79/mo</Link>
            <Link href="/dashboard/plan" style={{
              background: "transparent", border: "1px solid #d8d8d4", borderRadius: 9,
              padding: "0 16px", height: 40, fontSize: 13.5, fontWeight: 600, color: "#3a3a45",
              display: "inline-flex", alignItems: "center", textDecoration: "none",
            }}>Talk to us</Link>
          </div>
          <div style={{ fontSize: 11.5, color: "#9090a0", fontFamily: "monospace" }}>
            $79/mo · 7-day editorial review · unlimited duration
          </div>
        </div>
      </div>
    </main>
  );
}
