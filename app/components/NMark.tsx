export default function NMark({ size = 22 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "#FF6B35",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.6,
        fontFamily: "inherit",
        flexShrink: 0,
        letterSpacing: "-0.05em",
      }}
    >
      N
    </div>
  );
}
