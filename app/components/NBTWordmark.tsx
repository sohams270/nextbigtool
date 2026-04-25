/**
 * NBTWordmark — the NEXTBIGTOOL brand wordmark as an inline SVG.
 *
 * Fully vector, infinitely scalable, no PNG blur.
 * The "E" in NEXT is replaced by the brand orange chevron ">".
 *
 * Props:
 *   height  – rendered height in px (width scales automatically)
 *   dark    – true on dark backgrounds (renders text in white)
 */
export default function NBTWordmark({
  height = 28,
  dark = false,
}: {
  height?: number;
  dark?: boolean;
}) {
  const textColor = dark ? "#ffffff" : "#0f0f10";
  // viewBox is 330 × 50; aspect ratio ≈ 6.6
  const width = Math.round((height / 50) * 330);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 330 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NextBigTool"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* ── "N" ─────────────────────────────────────────────────── */}
      <text
        x="0"
        y="41"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
        fontWeight="800"
        fontSize="44"
        fill={textColor}
        letterSpacing="-1"
      >
        N
      </text>

      {/* ── Orange chevron ">" replacing the E ──────────────────── */}
      {/* Top arm + bottom arm of the chevron — thick strokes match Inter 800 weight */}
      <polyline
        points="37,7 64,25 37,43"
        stroke="#FF6B35"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── "XTBIGTOOL" ─────────────────────────────────────────── */}
      <text
        x="71"
        y="41"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
        fontWeight="800"
        fontSize="44"
        fill={textColor}
        letterSpacing="-1"
      >
        XTBIGTOOL
      </text>
    </svg>
  );
}
