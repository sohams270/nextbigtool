"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { id: "dashboard",     label: "Dashboard",     href: "/cms/dashboard",     icon: "▦" },
  { id: "blog",          label: "Blog Posts",     href: "/cms/blog",          icon: "✍️" },
  { id: "press-release", label: "Press Releases", href: "/cms/press-release", icon: "📣" },
];

function SidebarItem({ item, active }: { item: typeof NAV[number]; active: boolean }) {
  return (
    <a href={item.href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 8,
      background: active ? "rgba(255,107,53,0.14)" : "transparent",
      border: active ? "1px solid rgba(255,107,53,0.25)" : "1px solid transparent",
      color: active ? "#FF6B35" : "rgba(255,255,255,0.55)",
      fontSize: 13, fontWeight: active ? 700 : 500,
      textDecoration: "none", transition: "all .15s",
    }}>
      <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
      {item.label}
    </a>
  );
}

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  if (pathname === "/cms/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/cms-auth/logout", { method: "POST" });
    router.push("/cms/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0D0E1F", fontFamily: "inherit" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "#0A0B1A",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
        padding: "20px 12px",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "4px 10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>NBT CMS</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Content Management</div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map(item => (
            <SidebarItem key={item.id} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 12px", borderRadius: 8,
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", marginTop: 8,
            transition: "all .15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,80,80,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#FF6B6B";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,80,80,0.2)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <span style={{ fontSize: 14 }}>⎋</span> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        overflowY: pathname.startsWith("/cms/blog/new") || pathname.startsWith("/cms/blog/edit") ? "hidden" : "auto",
        padding: pathname.startsWith("/cms/blog/new") || pathname.startsWith("/cms/blog/edit") ? 0 : "32px 36px",
        display: "flex",
        flexDirection: "column",
      }}>
        {children}
      </main>
    </div>
  );
}
