import TopNav from "./TopNav";
import Footer from "./Footer";
import TableOfContents from "./blog/TableOfContents";
import LaunchCTABox from "./blog/LaunchCTABox";
import Link from "next/link";

type TocItem = { id: string; text: string };

interface ComparePageLayoutProps {
  /** Competitor name, e.g. "Product Hunt" */
  competitor: string;
  /** Hero headline — shown large above the content */
  headline: string;
  /** Short subtitle under the headline */
  subtitle: string;
  /** TOC items — must match the id= attributes on your H2 elements */
  tocItems: TocItem[];
  children: React.ReactNode;
}

export default function ComparePageLayout({
  competitor,
  headline,
  subtitle,
  tocItems,
  children,
}: ComparePageLayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── Hero ── */}
      <section style={{
        background: "#0A0B1A",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "52px 32px 44px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid background */}
        <div style={{
          position: "absolute", inset: "-40px",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          pointerEvents: "none",
        }} />

        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "-80px", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(255,107,53,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 14 }}>
            <Link href="/compare" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 6l-6 6 6 6"/>
              </svg>
              All Comparisons
            </Link>
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 99,
            background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.28)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "#FF6B35", textTransform: "uppercase",
            marginBottom: 20,
          }}>
            ⚡ Platform Comparison
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900,
            letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.15, color: "#fff",
          }}>
            <span style={{
              background: "linear-gradient(90deg, #FF6B35 20%, #FF8C5A 80%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              NextBigTool
            </span>
            {" vs "}
            <span style={{ color: "#fff" }}>{competitor}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.55)",
            maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 400,
          }}>
            {subtitle}
          </p>
        </div>
      </section>

      {/* ── 3-column body ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px 80px", width: "100%", boxSizing: "border-box" }}>
        <div className="blog-post-layout">

          {/* LEFT: Table of contents */}
          <div className="blog-post-layout-left">
            <TableOfContents items={tocItems} />
          </div>

          {/* CENTER: Content */}
          <article className="compare-article">
            {children}
          </article>

          {/* RIGHT: Launch CTA */}
          <aside className="blog-post-layout-right">
            <LaunchCTABox />
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}
