"use client";

import { useState, useRef, useEffect } from "react";
import Pill from "./Pill";
import AuthModal from "./AuthModal";
import SmartSearch from "./SmartSearch";
import { createClient } from "@/utils/supabase/client";

const STATS = [
  ["1,248", "Tools Listed"],
  ["8.4k",  "Community"],
  ["920",   "Launched / mo"],
  ["14.2k", "Newsletter"],
] as const;

const PHRASES = [
  "Builders Launch.",
  "Buyers Discover.",
  "Founders Ship.",
  "Products Get Found.",
  "Ideas Take Off.",
];

type Phase = "typing" | "pausing" | "deleting";

function useTypewriter(phrases: string[]) {
  const [text, setText]   = useState("");
  const [idx, setIdx]     = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const current = phrases[idx];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), 110);
      } else {
        t = setTimeout(() => setPhase("deleting"), 2800);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText((p) => p.slice(0, -1)), 60);
      } else {
        setIdx((i) => (i + 1) % phrases.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(t);
  }, [text, idx, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos]   = useState({ x: 420, y: -80 });
  const [gridOff, setGridOff]   = useState({ x: 0, y: 0 });
  const [entered, setEntered]   = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userId, setUserId]     = useState<string | null | undefined>(undefined);

  const phrase = useTypewriter(PHRASES);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  function handleLaunchClick() {
    if (userId) {
      window.location.href = "/dashboard/submit";
    } else {
      setShowAuth(true);
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    setGlowPos({ x: rx, y: ry });
    setGridOff({
      x: ((rx / rect.width)  - 0.5) * 28,
      y: ((ry / rect.height) - 0.5) * 28,
    });
    if (!entered) setEntered(true);
  }

  return (
    <>
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        background: "#0A0B1A",
        color: "#fff",
        padding: "54px 40px 36px",
        textAlign: "center",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* Moving grid */}
      <div
        style={{
          position: "absolute",
          inset: "-40px",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          backgroundPosition: `${gridOff.x}px ${gridOff.y}px`,
          transition: "background-position 0.1s ease-out",
          pointerEvents: "none",
        }}
      />

      {/* Cursor-following orange glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.42) 0%, rgba(255,107,53,0.12) 40%, transparent 70%)",
          transform: `translate(${glowPos.x - 280}px, ${glowPos.y - 280}px)`,
          transition: entered ? "transform 0.07s ease-out" : "none",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Pill color="orangeSolid" size="xs" style={{ marginBottom: 18 }}>
          ✦ 1,200+ tools and growing every day
        </Pill>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            maxWidth: 720,
            margin: "0 auto 12px",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.9)" }}>Where </span>
          <span style={{ color: "#FF6B35" }}>{phrase}</span>
          <span className="caret" style={{ background: "#FF6B35" }} />
        </h1>

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            fontWeight: 500,
            margin: 0,
          }}
        >
          Find the next big thing before it goes mainstream. Or launch your product to an audience that gets it.
        </p>

        {/* Smart Search */}
        <div style={{ maxWidth: 520, margin: "22px auto" }}>
          <SmartSearch placeholder="Describe what you're looking for…" />
        </div>

        {/* CTA buttons replacing stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
          <div className="launch-btn-wrap" onClick={handleLaunchClick} style={{ cursor: "pointer" }}>
            <div className="launch-btn-inner" style={{ pointerEvents: "none" }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Launch Your Product
            </div>
          </div>

          <a href="#how-it-works" style={{ textDecoration: "none" }}>
            <div
              style={{ height: 40, padding: "0 20px", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", cursor: "pointer", whiteSpace: "nowrap", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLDivElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.22)"; (e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,0.85)"; }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
              </svg>
              How it Works
            </div>
          </a>
        </div>

        {/* Stats — kept but removed, replaced above. Keep structure for spacing ref */}
        <div style={{ display: "none" }}>
          {STATS.map(([n, l], i) => (
            <div
              key={l}
              style={{
                padding: "0 22px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.14)" : "none",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800 }}>{n}</div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {showAuth && (
      <AuthModal
        onClose={() => setShowAuth(false)}
        title="Launch your product"
        subtitle="Submit in a few simple steps and reach thousands of early adopters."
        defaultMode="signup"
      />
    )}
  </>
  );
}
