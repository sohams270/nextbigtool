"use client";

/**
 * NBTWordmark — NEXTBIGTOOL brand wordmark.
 *
 * Source PNGs are 3168×792 (4:1 ratio).
 *
 * Props:
 *   height   — rendered logo height in px (default 48)
 *   dark     — true  → always show white logo (for permanently dark surfaces)
 *              false → always show black logo
 *              undefined (default) → auto-switch via CSS [data-theme="dark"]
 *   priority — preload hint for above-the-fold use
 */

const ASPECT = 3168 / 792; // 4.0
const IMG_STYLE: React.CSSProperties = {
  display: "block",
  objectFit: "contain",
  flexShrink: 0,
  imageRendering: "-webkit-optimize-contrast" as React.CSSProperties["imageRendering"],
};

export default function NBTWordmark({
  height = 48,
  dark,
  priority = false,
}: {
  height?: number;
  dark?: boolean;
  priority?: boolean;
}) {
  const width = Math.round(height * ASPECT);
  const fp = priority ? "high" : "auto";

  // Explicitly dark surface (sidebar, footer) — always white logo
  if (dark === true) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo-white.png" alt="NextBigTool" width={width} height={height}
        fetchPriority={fp} style={{ ...IMG_STYLE, width, height }} />
    );
  }

  // Explicitly light surface — always black logo
  if (dark === false) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo.png" alt="NextBigTool" width={width} height={height}
        fetchPriority={fp} style={{ ...IMG_STYLE, width, height }} />
    );
  }

  // Auto mode (dark prop not passed) — CSS handles switching based on [data-theme="dark"]
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="NextBigTool" width={width} height={height}
        fetchPriority={fp} className="nbt-logo-light"
        style={{ ...IMG_STYLE, width, height }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-white.png" alt="" width={width} height={height}
        fetchPriority={fp} className="nbt-logo-dark"
        style={{ ...IMG_STYLE, width, height }} />
    </span>
  );
}
