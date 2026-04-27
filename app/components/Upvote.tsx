export default function Upvote({
  count = 0,
  active,
  size = "md",
}: {
  count?: number;
  active?: boolean;
  size?: "sm" | "md";
}) {
  const small = size === "sm";
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        padding: small ? "6px 8px" : "8px 12px",
        border: `1px solid ${active ? "#FF6B35" : "var(--border)"}`,
        borderRadius: 6,
        background: active ? "var(--orange-soft)" : "var(--surface)",
        color: active ? "#FF6B35" : "var(--ink)",
        minWidth: small ? 40 : 52,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <svg width={small ? 10 : 12} height={small ? 10 : 12} viewBox="0 0 12 12" fill="none">
        <path d="M6 2L10 8H2L6 2Z" fill={active ? "#FF6B35" : "currentColor"} />
      </svg>
      <span style={{ fontSize: small ? 10 : 12, fontWeight: 700 }}>{count}</span>
    </div>
  );
}
