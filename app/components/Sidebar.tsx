"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NMark from "./NMark";
import Pill from "./Pill";
import Avatar from "./Avatar";

const SECTIONS = [
  { label: "Overview", items: [{ name: "Dashboard", href: "/dashboard" }, { name: "My Products", href: "/dashboard" }] },
  { label: "Grow", items: [{ name: "Interested Users", href: "/dashboard/crm", badge: "New" }, { name: "Build in Public", href: "/dashboard" }, { name: "Analytics", href: "/dashboard" }] },
  { label: "Launch", items: [{ name: "Submit New Tool", href: "/dashboard/submit" }, { name: "Re-Launch", href: "/dashboard" }, { name: "Badges", href: "/dashboard" }] },
  { label: "Account", items: [{ name: "Upgrade Plan", href: "/pricing" }, { name: "Settings", href: "/dashboard" }] },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        background: "#141528",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: 14,
        flexShrink: 0,
        minHeight: "100vh",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 6px", textDecoration: "none" }}>
        <NMark size={20} />
        <span style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>Next Big Tool</span>
      </Link>

      {SECTIONS.map((s) => (
        <div key={s.label} style={{ marginBottom: 14 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
              padding: "0 8px",
              display: "block",
              marginBottom: 4,
            }}
          >
            {s.label}
          </span>
          {s.items.map((item) => {
            const active = pathname === item.href && item.name !== "My Products" && item.name !== "Build in Public" && item.name !== "Analytics" && item.name !== "Re-Launch" && item.name !== "Badges" && item.name !== "Settings"
              || (item.name === "Dashboard" && pathname === "/dashboard")
              || (item.name === "Interested Users" && pathname === "/dashboard/crm")
              || (item.name === "Submit New Tool" && pathname === "/dashboard/submit")
              || (item.name === "Upgrade Plan" && pathname === "/pricing");
            return (
              <Link key={item.name} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 6,
                    marginBottom: 2,
                    background: active ? "rgba(255,107,53,0.14)" : "transparent",
                    borderRight: active ? "2px solid #FF6B35" : "2px solid transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "rgba(255,255,255,0.75)",
                    }}
                  >
                    {item.name}
                  </span>
                  {item.badge && <Pill color="orangeSolid" size="xs">{item.badge}</Pill>}
                </div>
              </Link>
            );
          })}
        </div>
      ))}

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Avatar size={28} letter="S" color="#FF6B35" />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Soham D.</span>
        </div>
        <Pill color="orangeSolid" size="xs">Free</Pill>
      </div>
    </aside>
  );
}
