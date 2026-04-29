import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile / tablet blocking overlay — hidden on desktop via CSS */}
      <div className="dashboard-mobile-block" style={{
        display: "none",
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#0A0B1A",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🖥️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Desktop Only
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 320, margin: "0 0 28px" }}>
          The Dashboard is designed for desktop and can only be accessed on a larger screen. Please open it on your laptop or desktop.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 10,
            background: "#FF6B35", color: "#fff",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
          }}
        >
          Go to Homepage
        </a>
      </div>

      {/* Actual dashboard — visible on desktop only via CSS */}
      <div className="dashboard-desktop-only" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {children}
        </div>
      </div>
    </>
  );
}
