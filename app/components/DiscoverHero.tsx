"use client";

import { useRef, useEffect } from "react";

interface DiscoverHeroProps {
  badge: string;
  title: string;
  /** The part of the title rendered in the accent gradient */
  titleAccent?: string;
  subtitle: string;
  /** Optional breadcrumb link shown above the badge */
  breadcrumb?: React.ReactNode;
  /** "orange" (default) or "gold" for Hall of Fame */
  accent?: "orange" | "gold";
}

export default function DiscoverHero({
  badge,
  title,
  titleAccent,
  subtitle,
  breadcrumb,
  accent = "orange",
}: DiscoverHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);

  const isGold = accent === "gold";
  const glowColor = isGold
    ? "rgba(255,215,0,0.32) 0%, rgba(255,180,0,0.10) 40%, transparent 70%"
    : "rgba(255,107,53,0.38) 0%, rgba(255,107,53,0.10) 40%, transparent 70%";
  const ambientColor = isGold
    ? "radial-gradient(ellipse, rgba(255,215,0,0.13) 0%, transparent 70%)"
    : "radial-gradient(ellipse, rgba(255,107,53,0.14) 0%, transparent 70%)";
  const badgeBg    = isGold ? "rgba(255,215,0,0.1)"  : "rgba(255,107,53,0.12)";
  const badgeBorder= isGold ? "rgba(255,215,0,0.28)" : "rgba(255,107,53,0.28)";
  const badgeColor = isGold ? "#FFD700"               : "#FF6B35";
  const gradientText = isGold
    ? "linear-gradient(90deg, #FFD700 20%, #FFA500 80%)"
    : "linear-gradient(90deg, #FF6B35 20%, #FF8C5A 80%)";

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
        padding: "52px 32px 44px",
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
          position: "absolute", inset: "-40px",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          backgroundPosition: "0px 0px",
          pointerEvents: "none",
        }}
      />

      {/* Cursor-following glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute", top: 0, left: 0,
          width: 560, height: 560, borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor})`,
          transform: "translate(140px, -280px)",
          opacity: 0, pointerEvents: "none",
          willChange: "transform", transition: "opacity 0.3s",
        }}
      />

      {/* Static ambient glow */}
      <div style={{
        position: "absolute", top: "-80px", left: "50%",
        transform: "translateX(-50%)",
        width: 600, height: 300,
        background: ambientColor,
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        {breadcrumb && (
          <div style={{ marginBottom: 14 }}>{breadcrumb}</div>
        )}

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 99,
          background: badgeBg, border: `1px solid ${badgeBorder}`,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: badgeColor, textTransform: "uppercase",
          marginBottom: 20,
        }}>
          {badge}
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em",
          margin: "0 0 16px", lineHeight: 1.15, color: "#fff",
        }}>
          {titleAccent ? (
            <>
              {title}{" "}
              <span style={{ background: gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {titleAccent}
              </span>
            </>
          ) : (
            <span style={{ background: gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {title}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.55)",
          maxWidth: 480, margin: "0 auto",
          lineHeight: 1.7, fontWeight: 400,
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
