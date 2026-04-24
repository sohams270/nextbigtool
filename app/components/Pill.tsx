import { ReactNode, CSSProperties } from "react";

type PillColor = "gray" | "orange" | "orangeSolid" | "green" | "blue" | "outline" | "dark";
type PillSize = "xs" | "sm" | "md";

const colors: Record<PillColor, { bg: string; fg: string; border: string }> = {
  gray:        { bg: "#F5F5F5",  fg: "#1A1A1A", border: "#CFCFD4" },
  orange:      { bg: "#FFE3D6",  fg: "#FF6B35", border: "#FF6B35" },
  orangeSolid: { bg: "#FF6B35",  fg: "#fff",    border: "#FF6B35" },
  green:       { bg: "#D8F5E8",  fg: "#007A52", border: "#00B87A" },
  blue:        { bg: "#DDE9FF",  fg: "#2558C9", border: "#3B7FFF" },
  outline:     { bg: "transparent", fg: "#1A1A1A", border: "#1A1A1A" },
  dark:        { bg: "#0A0B1A", fg: "#fff",    border: "#0A0B1A" },
};

const sizes: Record<PillSize, { padding: string; fontSize: string }> = {
  xs: { padding: "1px 6px",  fontSize: "9px"  },
  sm: { padding: "2px 8px",  fontSize: "10px" },
  md: { padding: "4px 10px", fontSize: "11px" },
};

export default function Pill({
  children,
  color = "gray",
  size = "sm",
  style,
}: {
  children: ReactNode;
  color?: PillColor;
  size?: PillSize;
  style?: CSSProperties;
}) {
  const c = colors[color];
  const s = sizes[size];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.fg,
        fontWeight: 600,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        ...s,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
