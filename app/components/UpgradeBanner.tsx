import Btn from "./Btn";
import Pill from "./Pill";

export default function UpgradeBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(100deg, #0A0B1A 0%, #1A1A3A 50%, #2A1F3F 100%)",
        color: "#fff",
        borderRadius: 14,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,53,0.35), transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ flex: 1, position: "relative" }}>
        <Pill color="orangeSolid" size="xs" style={{ marginBottom: 8 }}>Core Plan</Pill>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginTop: 4 }}>
          Unlock the Founder CRM — See who&apos;s interested in your product
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
          86 people are following Replai. Each one can get a single follow-up from you.
        </div>
      </div>
      <Btn variant="primary" size="md">Upgrade to Core →</Btn>
    </div>
  );
}
