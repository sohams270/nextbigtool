/**
 * NBTWordmark — renders the official NEXTBIGTOOL brand logo.
 *
 * Uses the actual brand PNG files (transparent background):
 *   /logo.png        — black text + orange chevron (light backgrounds)
 *   /logo-white.png  — white text + orange chevron (dark backgrounds)
 *
 * The logo PNG is 851×315 px. Pass `height` to control display size;
 * width is calculated automatically from the aspect ratio.
 *
 * Props:
 *   height  — display height in px (default 38)
 *   dark    — use white-text version for dark backgrounds (default false)
 *   priority — pass true for above-the-fold images (e.g. nav bar)
 */
import Image from "next/image";

const ASPECT = 851 / 315; // ≈ 2.70

export default function NBTWordmark({
  height = 38,
  dark = false,
  priority = false,
}: {
  height?: number;
  dark?: boolean;
  priority?: boolean;
}) {
  const width = Math.round(height * ASPECT);

  return (
    <Image
      src={dark ? "/logo-white.png" : "/logo.png"}
      alt="NextBigTool"
      width={width}
      height={height}
      priority={priority}
      style={{ objectFit: "contain", display: "block", flexShrink: 0 }}
    />
  );
}
