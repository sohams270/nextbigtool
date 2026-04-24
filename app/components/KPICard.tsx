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
        background: "#fff",
        border: "1px solid #CFCFD4",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B6B70" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: valueColor || "#1A1A1A",
          letterSpacing: "-0.02em",
          marginTop: 4,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 2, fontSize: 10, fontWeight: 600, color: positive ? "#00B87A" : "#A8A8AD" }}>
        {delta}
      </div>
    </div>
  );
}
