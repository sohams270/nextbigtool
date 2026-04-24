const BG_COLORS = [
  "#0A0B1A", "#3B4A6B", "#5A3A4E", "#2E4F3A",
  "#5A4A2E", "#4A2E5A", "#2E4A5A",
];

export default function Logo({
  size = 44,
  letter,
  bg,
}: {
  size?: number;
  letter?: string;
  bg?: string;
}) {
  const color = bg || BG_COLORS[((letter || "X").charCodeAt(0)) % BG_COLORS.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.42,
        fontFamily: "inherit",
        flexShrink: 0,
        border: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      {letter || "□"}
    </div>
  );
}
