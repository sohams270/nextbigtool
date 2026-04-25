"use client";

/**
 * ToolLogoImg — client component that renders a tool logo image.
 * Falls back gracefully (hides img) if the URL 404s or fails to load.
 */
export default function ToolLogoImg({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
