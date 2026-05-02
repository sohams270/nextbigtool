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
          background: hovered ? "#0D0E22" : "#0A0B1A",
          border: `1px solid ${hovered ? "rgba(255,107,53,0.5)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 16,
          padding: "24px 24px 20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          boxShadow: hovered
            ? "0 0 0 1px rgba(255,107,53,0.2), 0 8px 32px rgba(255,107,53,0.12)"
            : "0 2px 12px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle top gradient line */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: hovered
            ? "linear-gradient(90deg, #FF6B35, #FF3D88)"
            : "linear-gradient(90deg, rgba(255,107,53,0.3), rgba(255,61,136,0.3))",
          transition: "opacity 0.2s",
          borderRadius: "16px 16px 0 0",
        }} />

        {/* Background glow on hover */}
        {hovered && (
          <div style={{
            position: "absolute",
            top: -60, right: -60,
            width: 180, height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        )}

        {/* VS Badge row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          marginTop: 6,
        }}>
          {/* NBT pill */}
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#FF6B35",
            background: "rgba(255,107,53,0.12)",
            border: "1px solid rgba(255,107,53,0.25)",
            borderRadius: 6,
            padding: "3px 8px",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}>
            NextBigTool
          </span>

          {/* VS badge */}
          <span style={{
            fontSize: 9,
            fontWeight: 900,
            color: "rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "2px 7px",
            letterSpacing: "0.1em",
            flexShrink: 0,
          }}>
            VS
          </span>

          {/* Competitor pill */}
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(255,255,255,0.75)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            padding: "3px 8px",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}>
            {competitor}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 12.5,
          color: "rgba(255,255,255,0.45)",
          margin: "0 0 16px",
          lineHeight: 1.65,
          flex: 1,
        }}>
          {description}
        </p>

        {/* Bullets */}
        <ul style={{ margin: "0 0 18px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {bullets.map((b) => (
            <li key={b} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 11.5,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
            }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {b}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: 9,
          background: hovered
            ? "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,61,136,0.15))"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${hovered ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.07)"}`,
          transition: "all 0.2s ease",
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: hovered ? "#FF6B35" : "rgba(255,255,255,0.5)",
            letterSpacing: "0.01em",
            transition: "color 0.2s",
          }}>
            View full comparison
          </span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={hovered ? "#FF6B35" : "rgba(255,255,255,0.4)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s", transform: hovered ? "translateX(2px)" : "none" }}>
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}
