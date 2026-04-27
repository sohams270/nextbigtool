import Btn from "./Btn";
import Link from "next/link";

export default function DashTopbar({
  title = "Dashboard",
  subtitle = "Welcome back, Soham.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 1 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghostMuted" size="sm">View Profile</Btn>
        <Link href="/dashboard/submit">
          <Btn variant="primary" size="sm">Submit Tool</Btn>
        </Link>
      </div>
    </div>
  );
}
