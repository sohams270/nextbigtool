/**
 * NBTWordmark — NEXTBIGTOOL brand wordmark, pixel-perfect at any size.
 *
 * The source PNGs (3960×990 px) have ~6% transparent padding top & bottom
 * and ~2–3% left & right. This component crops that whitespace mathematically
 * so the `height` prop controls the *visible logo height*, not the full image.
 *
 * Result: logo fills the container, no wasted space, crisp at any size.
 *
 * Props:
 *   height   — desired logo height in px (default 32)
 *   dark     — white + orange version for dark backgrounds (default false)
 *   priority — hint browser to preload (use on above-the-fold logos)
 */

// ── Source PNG measurements (in px) ──────────────────────────────────────
// Full image:  3960 × 990
// Logo region: x ≈ 105–3855  →  width ≈ 3750 px
//              y ≈ 55–935    →  height ≈ 880 px
const PNG_W   = 3960;
const PNG_H   = 990;
const TXT_Y0  = 55;   // top of logo content in source image
const TXT_H   = 880;  // height of logo content in source image
const TXT_W   = 3750; // width  of logo content in source image

// Derived ratios (used in the formula below)
const TEXT_RATIO    = TXT_W / TXT_H;          // ≈ 5.59  — container aspect ratio
const PNG_ASPECT    = PNG_W / PNG_H;           // ≈ 2.70  — full image aspect ratio
const TOP_FRAC      = TXT_Y0 / PNG_H;         // ≈ 0.279 — top padding fraction
const TXT_H_FRAC    = TXT_H  / PNG_H;         // ≈ 0.429 — text height fraction

export default function NBTWordmark({
  height = 32,
  dark = false,
  priority = false,
}: {
  height?: number;
  dark?: boolean;
  priority?: boolean;
}) {
  // Container dimensions: sized so the visible text fills `height` px exactly
  const containerW = Math.round(height * TEXT_RATIO);

  // Full PNG rendered at containerW wide → its display height:
  const pngH = Math.round(containerW / PNG_ASPECT);   // = containerW * PNG_H / PNG_W

  // Text spans within the rendered PNG:
  const textTop = pngH * TOP_FRAC;          // top edge of text in px
  const textH   = pngH * TXT_H_FRAC;        // text height in px

  // Crop so text is vertically centred in the `height` container:
  const topClip = Math.round(textTop - (height - textH) / 2);

  return (
    <div
      style={{
        width: containerW,
        height,
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        display: "block",
      }}
    >
      {/*
        Plain <img> on a /public file — no domain config needed, loads instantly.
        The PNG is 851 px wide; at typical nav sizes (containerW ≈ 140–160 px)
        it's rendered at ~6× downscale, which is >2× on any retina display.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? "/logo-white.png" : "/logo.png"}
        alt="NextBigTool"
        width={containerW}
        height={pngH}
        fetchPriority={priority ? "high" : "auto"}
        style={{
          position: "absolute",
          top: -topClip,
          left: 0,
          width: containerW,
          height: pngH,
          display: "block",
        }}
      />
    </div>
  );
}
