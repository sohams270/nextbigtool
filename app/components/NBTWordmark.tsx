/**
 * NBTWordmark — NEXTBIGTOOL brand wordmark, pixel-perfect at any size.
 *
 * The source PNGs (851×315 px) have ~28% transparent padding top & bottom
 * and ~6% left & right. This component crops that whitespace mathematically
 * so the `height` prop controls the *visible text height*, not the full image.
 *
 * Result: text fills the container, no wasted space, infinitely sharp.
 *
 * Props:
 *   height   — desired text height in px (default 26)
 *   dark     — white + orange version for dark backgrounds (default false)
 *   priority — hint browser to preload (use on above-the-fold logos)
 */

// ── Source PNG measurements (in px) ──────────────────────────────────────
// Full image:  851 × 315
// Text region: x ≈ 50–805  →  width ≈ 755 px
//              y ≈ 88–223  →  height ≈ 135 px
const PNG_W   = 851;
const PNG_H   = 315;
const TXT_Y0  = 88;   // top of text in source image
const TXT_H   = 135;  // height of text in source image
const TXT_W   = 755;  // width  of text in source image

// Derived ratios (used in the formula below)
const TEXT_RATIO    = TXT_W / TXT_H;          // ≈ 5.59  — container aspect ratio
const PNG_ASPECT    = PNG_W / PNG_H;           // ≈ 2.70  — full image aspect ratio
const TOP_FRAC      = TXT_Y0 / PNG_H;         // ≈ 0.279 — top padding fraction
const TXT_H_FRAC    = TXT_H  / PNG_H;         // ≈ 0.429 — text height fraction

export default function NBTWordmark({
  height = 26,
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
