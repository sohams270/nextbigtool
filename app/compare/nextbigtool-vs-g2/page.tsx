import type { Metadata } from "next";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NextBigTool vs G2 | NextBigTool",
  description: "Compare NextBigTool vs G2. See which platform is better for indie founders and product discovery.",
};

export default function ComparePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF6B35", marginBottom: 16 }}>
            Coming Soon
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--ink)", margin: "0 0 14px" }}>
            NextBigTool vs G2
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7 }}>
            A detailed comparison is on the way. We&apos;re putting together an honest, side-by-side breakdown to help you decide.
          </p>
          <Link href="/compare" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>
            ← Back to all comparisons
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
