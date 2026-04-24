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
        background: "#fff",
        borderBottom: "1px solid #CFCFD4",
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: "#6B6B70", marginTop: 1 }}>{subtitle}</div>
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
