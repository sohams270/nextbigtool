import type { Metadata } from "next";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import BlogGrid from "../components/BlogGrid";

export const metadata: Metadata = {
  title: "Blog — Next Big Tool",
  description: "Guides, strategies, and founder insights from the team behind Next Big Tool. Learn how to launch, grow, and monetize your SaaS.",
};

export default function BlogPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "56px 32px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 80% at 50% -10%, rgba(255,107,53,0.12), transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 99,
            background: "rgba(255,107,53,0.1)",
            border: "1px solid rgba(255,107,53,0.25)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "#FF6B35", textTransform: "uppercase",
            marginBottom: 16,
          }}>
            ✍️ The NBT Blog
          </div>

          <h1 style={{
            fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em",
            margin: "0 0 14px", lineHeight: 1.1,
            color: "var(--ink)",
          }}>
            Built by founders,{" "}
            <span style={{
              background: "linear-gradient(90deg, #FF6B35, #FF4500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              for founders.
            </span>
          </h1>

          <p style={{
            fontSize: 14, color: "var(--ink-2)", maxWidth: 520,
            margin: "0 auto", lineHeight: 1.7, fontWeight: 400,
          }}>
            Real strategies on launching, growing, and monetizing your product —
            written by the team behind Next Big Tool.
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 28, marginTop: 28,
          }}>
            {[
              { label: "Articles", value: "12+" },
              { label: "Categories", value: "6" },
              { label: "Avg. read time", value: "6 min" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 500, marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Blog grid ────────────────────────────────────────────────────── */}
      <BlogGrid />

      <Footer />
    </div>
  );
}
