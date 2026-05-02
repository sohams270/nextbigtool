"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  slug: string;
  competitor: string;
  description: string;
  bullets: string[];
};

export default function CompareCard({ slug, competitor, description, bullets }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/compare/${slug}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "var(--surface)",
          border: `1px solid ${hovered ? "#FF6B35" : "var(--border)"}`,
          borderRadius: 14,
          padding: "24px 26px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: hovered ? "0 4px 20px rgba(255,107,53,0.1)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: "pointer",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
          NextBigTool vs {competitor}
        </h2>

        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
          {description}
        </p>

        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {bullets.map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--ink-muted)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF6B35", flexShrink: 0, marginTop: 5 }} />
              {b}
            </li>
          ))}
        </ul>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#FF6B35", marginTop: 4 }}>
          View full comparison
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}
