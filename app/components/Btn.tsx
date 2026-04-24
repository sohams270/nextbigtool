"use client";
import { ReactNode, CSSProperties } from "react";

type BtnVariant = "primary" | "ghost" | "ghostMuted" | "dark" | "invert";
type BtnSize = "sm" | "md" | "lg";

const variants: Record<BtnVariant, { bg: string; color: string; border: string }> = {
  primary:   { bg: "#FF6B35", color: "#fff",    border: "#FF6B35" },
  ghost:     { bg: "transparent", color: "#1A1A1A", border: "#1A1A1A" },
  ghostMuted:{ bg: "transparent", color: "#6B6B70", border: "#CFCFD4" },
  dark:      { bg: "#0A0B1A", color: "#fff",    border: "#0A0B1A" },
  invert:    { bg: "#fff",    color: "#1A1A1A", border: "#fff" },
};

const sizes: Record<BtnSize, { padding: string; fontSize: string; height: string }> = {
  sm: { padding: "0 10px", fontSize: "10px", height: "26px" },
  md: { padding: "0 14px", fontSize: "11px", height: "32px" },
  lg: { padding: "0 18px", fontSize: "12px", height: "38px" },
};

export default function Btn({
  children,
  variant = "ghost",
  size = "md",
  full,
  style,
  onClick,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  full?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 6,
        fontWeight: 600,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        cursor: "pointer",
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        width: full ? "100%" : "auto",
        transition: "opacity 0.15s",
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}
