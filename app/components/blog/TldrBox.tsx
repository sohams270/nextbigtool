type Props = { points: string[] };

export default function TldrBox({ points }: Props) {
  if (!points || points.length === 0) return null;

  return (
    <div style={{
      position: "relative",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 32,
      border: "1px solid rgba(255,107,53,0.18)",
      background: "var(--surface)",
    }}>
      {/* Top gradient bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#FF6B35,#ff3d88)" }} />

      <div style={{ padding: "20px 22px 22px" }}>
        {/* TL;DR heading */}
        <div style={{ marginBottom: 14, display: "inline-block" }}>
          <div style={{
            fontSize: 17, fontWeight: 900, letterSpacing: "-0.01em",
            color: "var(--ink)", lineHeight: 1,
          }}>
            TL;DR
          </div>
          <div style={{
            height: 2, marginTop: 4, borderRadius: 2,
            background: "linear-gradient(90deg,#FF6B35,#ff3d88)",
            width: "100%",
          }} />
        </div>

        {/* Bullet points */}
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {points.map((point, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{
                flexShrink: 0, marginTop: 4,
                width: 7, height: 7, borderRadius: "50%",
                background: "linear-gradient(135deg,#FF6B35,#ff3d88)",
                display: "inline-block",
              }} />
              <span style={{
                fontSize: 14, color: "var(--ink-2)",
                lineHeight: 1.6,
              }}>
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
