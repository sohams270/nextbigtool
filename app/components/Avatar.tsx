const COLORS = ["#3B4A6B", "#5A3A4E", "#2E4F3A", "#5A4A2E", "#FF6B35", "#0A0B1A"];

export default function Avatar({
  size = 28,
  letter,
  color,
  index,
}: {
  size?: number;
  letter?: string;
  color?: string;
  index?: number;
}) {
  const bg = color || (index !== undefined ? COLORS[index % COLORS.length] : "#FF6B35");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.42,
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}
