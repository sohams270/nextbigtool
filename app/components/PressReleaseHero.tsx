"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

export default function PressReleaseHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${rx - 280}px, ${ry - 280}px)`;
        glowRef.current.style.opacity = "1";
      }
      if (gridRef.current) {
        const gx = ((rx / rect.width)  - 0.5) * 28;
        const gy = ((ry / rect.height) - 0.5) * 28;
        gridRef.current.style.backgroundPosition = `${gx}px ${gy}px`;
      }
    }

    function onLeave() {
      if (glowRef.current) glowRef.current.style.opacity = "0";
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        background: "#0A0B1A",
        color: "#fff",
        padding: "64px 32px 56px",
        textAlign: "center",
        overflow: "hidden",
        cursor: "default",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Moving grid */}
      <div
        ref={gridRef}
        style={{
          position: "absolute",
          inset: "-40px",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          backgroundPosition: "0px 0px",
          pointerEvents: "none",
        }}
      />

      {/* Cursor-following orange glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: 560, height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.38) 0%, rgba(255,107,53,0.10) 40%, transparent 70%)",
          transform: "translate(140px, -280px)",
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform",
          transition: "opacity 0.3s",
        }}
      />

      {/* Static ambient glow */}
      <div style={{
        position: "absolute",
        top: "-80px", left: "50%",
        transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(255,107,53,0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 99,
          background: "rgba(255,107,53,0.12)",
          border: "1px solid rgba(255,107,53,0.28)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "#FF6B35", textTransform: "uppercase" as const,
          marginBottom: 20,
        }}>
          📣 Press Release
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 42, fontWeight: 900, letterSpacing: "-0.03em",
          margin: "0 0 16px", lineHeight: 1.12, color: "#fff",
        }}>
          Make Your{" "}
          <span style={{
            background: "linear-gradient(90deg, #FF6B35 20%, #FF8C5A 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Launch Official
          </span>
        </h1>

        {/* Subline */}
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.58)",
          maxWidth: 520, margin: "0 auto 40px",
          lineHeight: 1.7, fontWeight: 400,
        }}>
          A press release on Next Big Tool puts your product in front of the right people
          — builders who buy, share, and spread the word.
        </p>

        {/* Core CTA box */}
        <div style={{
          background: "rgba(255,107,53,0.08)",
          border: "1px solid rgba(255,107,53,0.3)",
          borderRadius: 16,
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          textAlign: "left",
          maxWidth: 620,
          margin: "0 auto",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 800, color: "#fff",
              marginBottom: 6, lineHeight: 1.3,
            }}>
              Become a Core Member to Spread Your Story
            </div>
            <div style={{
              fontSize: 12, color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
            }}>
              Core members can publish press releases directly to our community of founders
              and early adopters. One upgrade, maximum reach.
            </div>
          </div>
          <Link
            href="/pricing"
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 99,
              background: "#FF6B35",
              color: "#fff",
              fontSize: 12, fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap" as const,
              transition: "background .15s, transform .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#e85a26";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#FF6B35";
              (e.currentTarget as HTMLAnchorElement).style.transform = "none";
            }}
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
