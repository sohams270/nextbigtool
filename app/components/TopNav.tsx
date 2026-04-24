"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Btn from "./Btn";
import AuthModal from "./AuthModal";
import { createClient } from "@/utils/supabase/client";

/* ─── tiny inline SVG icons ─────────────────────────────────────────── */
const I = ({ d, fill }: { d: string; fill?: boolean }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons: Record<string, ReactNode> = {
  grid:        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  target:      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>,
  users:       <I d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4a3 3 0 0 1 5.49 0" />,
  monitor:     <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  arrows:      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>,
  trophy:      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M8 21h8M12 17v4M17 3H7l1 10a4 4 0 0 0 8 0l1-10zM4 4H2v4a4 4 0 0 0 4 4M20 4h2v4a4 4 0 0 1-4 4"/></svg>,
  wrench:      <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  hammer:      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9M18 6l-2 2"/><path d="m22 2-7 7"/><path d="M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1"/><path d="M17 3h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/></svg>,
  book:        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  mail:        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
  card:        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  handshake:   <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.36 1.06-1.06a5.4 5.4 0 0 0 0-7.65z"/></svg>,
  heart:       <I d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  faq:         <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  rules:       <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
};

/* ─── mega-menu data ─────────────────────────────────────────────────── */
type MenuItem = { label: string; sub: string; href: string; icon: ReactNode; bg: string; color: string };
type MenuColumn = { heading: string; items: MenuItem[] };

const DISCOVER_COLS: MenuColumn[] = [
  {
    heading: "DISCOVER",
    items: [
      { label: "Featured",     sub: "Today's top picks",    href: "/discover?tab=featured",    icon: Icons.trophy,  bg: "#FEFCE8", color: "#CA8A04" },
      { label: "Categories",   sub: "Browse by topic",      href: "/discover?tab=categories",  icon: Icons.grid,    bg: "#EEF2FF", color: "#4F46E5" },
      { label: "Hall of Fame", sub: "Top rated products",   href: "/discover?tab=hall-of-fame",icon: Icons.arrows,  bg: "#FEF2F2", color: "#DC2626" },
      { label: "Free Tools",   sub: "Developer utilities",  href: "/discover?tab=free",        icon: Icons.wrench,  bg: "#EFF6FF", color: "#2563EB" },
    ],
  },
];

const RESOURCES_ITEMS = [
  { label: "Blog",  sub: "Articles & guides",     href: "/blog",       icon: Icons.book,  bg: "#ECFDF5", color: "#16A34A" },
  { label: "FAQs",  sub: "Common questions",      href: "/faq",        icon: Icons.faq,   bg: "#F9FAFB", color: "#6B7280" },
  { label: "Rules", sub: "Community guidelines",  href: "/rules",      icon: Icons.rules, bg: "#FFF7ED", color: "#EA580C" },
];

/* ─── mega-menu panel ────────────────────────────────────────────────── */
function MegaMenu({ columns }: { columns: MenuColumn[] }) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 12px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fff",
      border: "1px solid #E8E8EC",
      borderRadius: 14,
      boxShadow: "0 16px 48px rgba(0,0,0,0.13)",
      padding: "22px 22px 18px",
      display: "grid",
      gridTemplateColumns: `repeat(${columns.length}, auto)`,
      gap: "0 32px",
      zIndex: 300,
    }}>
      {columns.map((col) => (
        <div key={col.heading}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.09em", color: "#A8A8AD", textTransform: "uppercase", marginBottom: 10 }}>
            {col.heading}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {col.items.map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", minWidth: 200 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1A1A1A", lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "#9B9BA4", marginTop: 1 }}>{item.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── simple dropdown (Resources) ───────────────────────────────────── */
function SimpleDropdown({ items }: { items: MenuItem[] }) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 12px)",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fff",
      border: "1px solid #E8E8EC",
      borderRadius: 12,
      boxShadow: "0 12px 36px rgba(0,0,0,0.11)",
      padding: "8px",
      minWidth: 220,
      zIndex: 300,
    }}>
      {items.map((item) => (
        <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1A1A1A" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#9B9BA4" }}>{item.sub}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── nav item wrapper ───────────────────────────────────────────────── */
function NavItem({ label, href, mega, simple, dark }: {
  label: string; href?: string;
  mega?: MenuColumn[]; simple?: MenuItem[]; dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter() { if (timer.current) clearTimeout(timer.current); setOpen(true); }
  function leave() { timer.current = setTimeout(() => setOpen(false), 150); }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    color: dark ? "rgba(255,255,255,0.9)" : "#1A1A1A",
    userSelect: "none", display: "flex", alignItems: "center", gap: 3,
  };

  if (mega || simple) {
    return (
      <div style={{ position: "relative", padding: "4px 2px" }} onMouseEnter={enter} onMouseLeave={leave}>
        <span style={labelStyle}>
          {label}<span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
        </span>
        {open && mega && <MegaMenu columns={mega} />}
        {open && simple && <SimpleDropdown items={simple} />}
      </div>
    );
  }

  return (
    <Link href={href!} style={{ textDecoration: "none" }}>
      <span style={{ ...labelStyle, padding: "4px 2px" }}>{label}</span>
    </Link>
  );
}

/* ─── TopNav ─────────────────────────────────────────────────────────── */
export default function TopNav({ dark }: { dark?: boolean }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  function openAuthModal(title: string, subtitle: string) {
    setAuthMessage({ title, subtitle });
    setShowAuth(true);
  }

  function handleSubmitClick() {
    if (userId) {
      window.location.href = "/dashboard/submit";
    } else {
      openAuthModal(
        "Launch your product",
        "Sign up in seconds and submit your tool to thousands of early adopters."
      );
    }
  }

  return (
    <>
    <nav style={{
      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#CFCFD4"}`,
      background: dark ? "#0A0B1A" : "#fff",
      flexShrink: 0, position: "relative", zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 32px",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <Image src="/logo.png" alt="Next Big Tool" height={40} width={89} style={{ objectFit: "contain", maxHeight: 40 }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <NavItem label="Discover" mega={DISCOVER_COLS} dark={dark} />

          <Link href="/newsletter" style={{ textDecoration: "none" }}>
            <div className="newsletter-wrap">
              <div className="newsletter-inner">✦ Newsletter</div>
            </div>
          </Link>

          <NavItem label="Resources" simple={RESOURCES_ITEMS} dark={dark} />
          <NavItem label="Pricing" href="/pricing" dark={dark} />
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          <Btn variant={dark ? "invert" : "ghostMuted"} size="sm" onClick={() => setShowAuth(true)}>Sign In</Btn>
          <div className="submit-tool-wrap" onClick={handleSubmitClick} style={{ cursor: "pointer" }}>
              <button className="submit-tool-btn" style={{ pointerEvents: "none" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" style={{display:"none"}}/>
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                </svg>
                Submit Your Tool
              </button>
          </div>
        </div>
      </div>
    </nav>

    {showAuth && (
      <AuthModal
        onClose={() => { setShowAuth(false); setAuthMessage(null); }}
        title={authMessage?.title}
        subtitle={authMessage?.subtitle}
        defaultMode="signup"
      />
    )}
    </>
  );
}
