/**
 * NBTWordmark — NEXTBIGTOOL brand wordmark, pixel-perfect at any size.
 *
 * The source PNGs (3168×792 px) have ~5% transparent padding top & bottom
 * and ~2% left & right. This component crops that whitespace mathematically
 * so the `height` prop controls the *visible logo height*, not the full image.
 *
 * Result: logo fills the container, no wasted space, crisp at any size.
 *
 * Props:
 *   height   — desired logo height in px (default 40)
 *   dark     — white + orange version for dark backgrounds (default false)
 *   priority — hint browser to preload (use on above-the-fold logos)
 */

// ── Source PNG measurements (in px) ──────────────────────────────────────
// Full image:  3168 × 792
// Logo region: x ≈ 60–3108   →  width ≈ 3048 px
//              y ≈ 40–752    →  height ≈ 712 px
const PNG_W   = 3168;
const PNG_H   = 792;
const TXT_Y0  = 40;   // top of logo content in source image
const TXT_H   = 712;  // height of logo content in source image
const TXT_W   = 3048; // width  of logo content in source image

// Derived ratios
const TEXT_RATIO = TXT_W / TXT_H;   // ≈ 4.28 — container aspect ratio
const PNG_ASPECT = PNG_W / PNG_H;   // = 4.0  — full image aspect ratio
const TOP_FRAC   = TXT_Y0 / PNG_H;  // ≈ 0.051
const TXT_H_FRAC = TXT_H  / PNG_H;  // ≈ 0.899

export default function NBTWordmark({
  height = 40,
  dark = false,
  priority = false,
}: {
  height?: number;
  dark?: boolean;
  priority?: boolean;
}) {
  // Container dimensions: sized so the visible logo fills `height` px exactly
  const containerW = Math.round(height * TEXT_RATIO);

  // Full PNG rendered at containerW wide → its display height:
  const pngH = Math.round(containerW / PNG_ASPECT);

  // Logo spans within the rendered PNG:
  const textTop = pngH * TOP_FRAC;
  const textH   = pngH * TXT_H_FRAC;

  // Crop so logo is vertically centred in the `height` container:
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
