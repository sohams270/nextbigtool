export default function CmsDashboard() {
  const cards = [
    { icon: "✍️", label: "Blog Posts",     href: "/cms/blog",          desc: "Write and publish blog articles", color: "#FF6B35" },
    { icon: "📣", label: "Press Releases",  href: "/cms/press-release", desc: "Publish press releases",          color: "#3B7FFF" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Welcome back
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          NBT Content Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Manage your blog posts and press releases from here.
        </p>
      </div>

      {/* Quick access cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 640 }}>
        {cards.map(card => (
          <a key={card.label} href={card.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "24px 20px",
              cursor: "pointer", transition: "border-color .15s, background .15s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = card.color + "55";
                (e.currentTarget as HTMLDivElement).style.background = card.color + "0D";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: card.color + "20",
                border: `1px solid ${card.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, marginBottom: 14,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{card.desc}</div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: card.color }}>
                Open →
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
