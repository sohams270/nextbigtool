"use client";

/**
 * NBTWordmark — NEXTBIGTOOL brand wordmark.
 *
 * Simple, sharp image render. The source PNGs are 3168×792 (4:1 ratio).
 * Transparent padding is ~5% top/bottom and ~2% left/right — negligible
 * on any coloured background, so no cropping math needed.
 *
 * Props:
 *   height   — rendered logo height in px (default 48)
 *   dark     — white wordmark for dark backgrounds (default false)
 *   priority — preload hint for above-the-fold use (default false)
 */

const ASPECT = 3168 / 792; // 4.0

export default function NBTWordmark({
  height = 48,
  dark = false,
  priority = false,
}: {
  height?: number;
  dark?: boolean;
  priority?: boolean;
}) {
  const width = Math.round(height * ASPECT);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? "/logo-white.png" : "/logo.png"}
      alt="NextBigTool"
      width={width}
      height={height}
      fetchPriority={priority ? "high" : "auto"}
      style={{
        display: "block",
        width,
        height,
        objectFit: "contain",
        flexShrink: 0,
        imageRendering: "crisp-edges",
      }}
    />
  );
}
