export default function KPICard({
  label,
  value,
  delta,
  positive = true,
  valueColor,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: valueColor || "var(--ink)",
          letterSpacing: "-0.02em",
          marginTop: 4,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 2, fontSize: 10, fontWeight: 600, color: positive ? "#00B87A" : "var(--ink-faint)" }}>
        {delta}
      </div>
    </div>
  );
}
