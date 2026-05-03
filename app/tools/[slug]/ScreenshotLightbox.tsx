"use client";

import { useState, useEffect, useCallback } from "react";

export default function ScreenshotLightbox({ shots }: { shots: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive(i => (i !== null ? (i - 1 + shots.length) % shots.length : null)), [shots.length]);
  const next = useCallback(() => setActive(i => (i !== null ? (i + 1) % shots.length : null)), [shots.length]);

  useEffect(() => {
    if (active === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    if (active !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: shots.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
        {shots.map((url, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            style={{
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--border)",
              background: "var(--surface-dim)",
              gridColumn: shots.length === 1 || (shots.length === 3 && i === 0) ? "1 / -1" : undefined,
              aspectRatio: shots.length === 1 ? "16 / 9" : "4 / 3",
              cursor: "zoom-in",
              position: "relative",
            }}
            onMouseEnter={e => {
              (e.currentTarget.querySelector(".zoom-hint") as HTMLElement | null)?.style &&
              ((e.currentTarget.querySelector(".zoom-hint") as HTMLElement).style.opacity = "1");
            }}
            onMouseLeave={e => {
              (e.currentTarget.querySelector(".zoom-hint") as HTMLElement | null)?.style &&
              ((e.currentTarget.querySelector(".zoom-hint") as HTMLElement).style.opacity = "0");
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
            {/* Zoom hint overlay */}
            <div
              className="zoom-hint"
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.18s",
                pointerEvents: "none",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {active !== null && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {/* Close */}
          <button
            onClick={close}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)", border: "none",
              color: "#fff", cursor: "pointer", fontSize: 20, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >×</button>

          {/* Prev */}
          {shots.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}

          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "88vh", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shots[active]}
              alt={`Screenshot ${active + 1}`}
              style={{
                maxWidth: "90vw", maxHeight: "88vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                display: "block",
              }}
            />
            {/* Counter */}
            {shots.length > 1 && (
              <div style={{
                position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)",
                fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap",
              }}>
                {active + 1} / {shots.length}
              </div>
            )}
          </div>

          {/* Next */}
          {shots.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
