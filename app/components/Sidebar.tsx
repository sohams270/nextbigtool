"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import NBTWordmark from "./NBTWordmark";
import UpgradeModal, { type GatedFeature } from "./UpgradeModal";

const ADMIN_EMAIL = "sohams270@gmail.com";

const NAV = [
  { id: "overview",   label: "Overview",       href: "/dashboard",                  icon: GridIcon },
  { id: "products",   label: "Add Your Tool",  href: "/dashboard/products",         icon: BoxIcon },
  { id: "bip",        label: "Build In Public",href: "/dashboard/build-in-public",  icon: EditIcon },
  { id: "interested", label: "Founder's CRM",  href: "/dashboard/interested",       icon: UsersIcon,    prime: true, gate: "crm"  as GatedFeature },
  { id: "blog",       label: "Press Release",  href: "/dashboard/blog",             icon: FileTextIcon, prime: true, gate: "blog" as GatedFeature },
  { id: "hof",        label: "Hall of Fame",   href: "/dashboard/hall-of-fame",     icon: TrophyIcon,   prime: true, gate: "hof"  as GatedFeature },
  { id: "plan",       label: "My Plan",        href: "/dashboard/plan",             icon: StarIcon },
  { id: "profile",    label: "My Profile",     href: "/dashboard/profile",          icon: PersonIcon },
  { id: "settings",   label: "Settings",       href: "/dashboard/settings",         icon: GearIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState<string>("free");
  const [upgradeFeature, setUpgradeFeature] = useState<GatedFeature | null>(null);

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      if (user.email === ADMIN_EMAIL) { setUserPlan("core"); return; }
      client.from("profiles").select("plan").eq("id", user.id).single()
        .then(({ data }) => { if (data?.plan) setUserPlan(data.plan); });
    });
  }, []);

  const isCore = userPlan === "core";

  function handleGatedClick(e: React.MouseEvent, gate: GatedFeature) {
    if (!isCore) {
      e.preventDefault();
      setUpgradeFeature(gate);
    }
  }

  const planLabel = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);
  const planColor = userPlan === "core" ? "#ff6a3d" : userPlan === "basic" ? "#3b7fff" : "rgba(255,255,255,0.45)";
  const planBg    = userPlan === "core" ? "rgba(255,106,61,0.15)" : userPlan === "basic" ? "rgba(59,127,255,0.15)" : "rgba(255,255,255,0.06)";
  const planBorder = userPlan === "core" ? "rgba(255,106,61,0.35)" : userPlan === "basic" ? "rgba(59,127,255,0.35)" : "rgba(255,255,255,0.1)";

  return (
    <aside style={{
      width: 224,
      background: "var(--sidebar-bg)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "18px 12px",
      flexShrink: 0,
      minHeight: "100vh",
      position: "sticky",
      top: 0,
    }}>
      <style>{`
        @keyframes gateShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gatePulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0),   0 0 8px 2px rgba(239,68,68,0.15); }
          50%       { box-shadow: 0 0 0 3px rgba(220,38,38,0.15), 0 0 16px 4px rgba(239,68,68,0.35); }
        }
        @keyframes gatePulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,184,122,0),   0 0 8px 2px rgba(16,185,129,0.15); }
          50%       { box-shadow: 0 0 0 3px rgba(0,184,122,0.15), 0 0 16px 4px rgba(16,185,129,0.35); }
        }
        .gate-item-free {
          border-radius: 8px; padding: 8px 10px;
          background: linear-gradient(90deg,rgba(220,38,38,0.22),rgba(239,68,68,0.18),rgba(185,28,28,0.22),rgba(220,38,38,0.22));
          background-size: 300% 100%;
          animation: gateShimmer 3s linear infinite, gatePulseRed 2.5s ease-in-out infinite;
          cursor: pointer; display: flex; align-items: center; gap: 10px; transition: opacity 0.15s;
        }
        .gate-item-core {
          border-radius: 8px; padding: 8px 10px;
          background: linear-gradient(90deg,rgba(0,184,122,0.22),rgba(16,185,129,0.18),rgba(5,150,105,0.22),rgba(0,184,122,0.22));
          background-size: 300% 100%;
          animation: gateShimmer 3s linear infinite, gatePulseGreen 2.5s ease-in-out infinite;
          cursor: pointer; display: flex; align-items: center; gap: 10px; transition: opacity 0.15s;
        }
        .gate-item-free:hover, .gate-item-core:hover { opacity: 0.85; }
      `}</style>

      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", marginBottom: 28, padding: "0 8px", textDecoration: "none" }}>
        <NBTWordmark height={52} dark priority />
      </Link>

      {/* Upgrade modal */}
      {upgradeFeature && (
        <UpgradeModal feature={upgradeFeature} onClose={() => setUpgradeFeature(null)} />
      )}

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const gate = (item as { gate?: GatedFeature }).gate;
          const isPrime = !!(item as { prime?: boolean }).prime;
          const isLocked = !!(item as { locked?: boolean }).locked;
          const needsGate = (isPrime || isLocked) && !!gate;

          if (isPrime) {
            return (
              <Link
                key={item.id}
                href={item.href}
                style={{ textDecoration: "none" }}
                onClick={needsGate ? (e) => handleGatedClick(e, gate!) : undefined}
              >
                <div className={isCore ? "gate-item-core" : "gate-item-free"}>
                  <Icon
                    size={15}
                    color={isCore ? "rgba(0,184,122,0.9)" : "rgba(239,68,68,0.9)"}
                  />
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                    {item.label}
                  </span>
                  {!isCore && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#ef4444", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.04em" }}>
                      CORE
                    </span>
                  )}
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{ textDecoration: "none" }}
              onClick={needsGate ? (e) => handleGatedClick(e, gate!) : undefined}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 8,
                background: active ? "rgba(255,106,61,0.15)" : "transparent",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <Icon size={15} color={active ? "#ff6a3d" : "rgba(255,255,255,0.5)"} />
                <span style={{
                  flex: 1,
                  fontSize: 12.5, fontWeight: active ? 700 : 500,
                  color: active ? "#fff" : "rgba(255,255,255,0.7)",
                  letterSpacing: active ? "-0.01em" : "0",
                }}>
                  {item.label}
                </span>
                {isLocked && !isCore && (
                  <LockIcon size={12} color="rgba(255,255,255,0.3)" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "10px 0 8px" }} />

        {/* Go back to homepage — smaller than nav items */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 7,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.11)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)"}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
              Go back to homepage
            </span>
          </div>
        </Link>

        {/* Current plan — non-clickable, smaller */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 10px", borderRadius: 7,
          background: planBg,
          border: `1px solid ${planBorder}`,
          cursor: "default",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={planColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>Current plan</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: planColor, letterSpacing: "0.02em" }}>
            {planLabel}
          </span>
        </div>
      </nav>
    </aside>
  );
}

/* ─── Icons ─── */
function GridIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function BoxIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function UsersIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function EditIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function MailIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function TrophyIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/>
      <path d="M17 4h2a2 2 0 012 2v2a4 4 0 01-4 4M7 4H5a2 2 0 00-2 2v2a4 4 0 004 4"/>
    </svg>
  );
}
function StarIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function PersonIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function GearIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
function FileTextIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function LockIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 018 0v4"/>
    </svg>
  );
}
