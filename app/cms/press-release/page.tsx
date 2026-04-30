export default function CmsPressReleasePage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3B7FFF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            Publishing
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Press Releases
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Publish press releases that appear on the public Press Release page.
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 18px", borderRadius: 8,
          background: "#3B7FFF", border: "none",
          color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          + New Press Release
        </button>
      </div>

      {/* Empty state */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "64px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(59,127,255,0.12)",
          border: "1px solid rgba(59,127,255,0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, margin: "0 auto 16px",
        }}>📣</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
          No press releases yet
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 320, margin: "0 auto" }}>
          Click "New Press Release" above to publish your first announcement.
        </div>
      </div>
    </div>
  );
}
