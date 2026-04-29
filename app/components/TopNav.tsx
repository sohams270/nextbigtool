"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import NBTWordmark from "./NBTWordmark";
import { createClient } from "@/utils/supabase/client";

/* ─── types ──────────────────────────────────────────────────────────── */
type DDItem = {
  label: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

type HeroPanel = {
  eyebrow: string;
  heading: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
};

/* ─── icon helpers ───────────────────────────────────────────────────── */
const Svg = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconFeatured = () => (
  <Svg><path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/></Svg>
);
const IconCategories = () => (
  <Svg><rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/></Svg>
);
const IconHoF = () => (
  <Svg><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM5 4H3v3a3 3 0 003 3M19 4h2v3a3 3 0 01-3 3"/></Svg>
);
const IconFreeTools = () => (
  <Svg><path d="M14.7 6.3a4 4 0 105.3 5.3L21 11l-8 8-7 1 1-7 8-8 1.7 1.3z"/></Svg>
);
const IconBlog = () => (
  <Svg><path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 16h14"/></Svg>
);
const IconFAQ = () => (
  <Svg><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01"/></Svg>
);
const IconRules = () => (
  <Svg><path d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v6h6M8 14h8M8 18h5"/></Svg>
);
const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconRocket = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 3s4.5.5 6.5 2.5S23.5 12 23.5 12s-7 .5-10 3.5-3.5 6-3.5 6-2-2-4.5-2S3 16.5 3 16.5s3.5 0 6.5-3 5-10 5-10z"/>
    <circle cx="16" cy="10" r="1.3"/>
  </svg>
);

/* ─── menu data ──────────────────────────────────────────────────────── */
const DISCOVER_ITEMS: DDItem[] = [
  { label: "Featured",     sub: "Today's top picks",    href: "/discover?tab=featured",     icon: <IconFeatured />,   iconBg: "#fff1e6", iconColor: "#ff6a3d" },
  { label: "Categories",   sub: "Browse by topic",      href: "/discover?tab=categories",   icon: <IconCategories />, iconBg: "#f1f2ff", iconColor: "#5b6bff" },
  { label: "Hall of Fame", sub: "Top rated products",   href: "/discover?tab=hall-of-fame", icon: <IconHoF />,        iconBg: "#fff1f5", iconColor: "#ff3d88" },
  { label: "Free Tools",   sub: "Developer utilities",  href: "/discover?tab=free",         icon: <IconFreeTools />,  iconBg: "#f0f6ff", iconColor: "#3d7aff" },
];

const DISCOVER_HERO: HeroPanel = {
  eyebrow:  "Featured this week",
  heading:  "The 12 tools shipping AI agents builders actually use",
  sub:      "Curated picks, updated every Monday.",
  ctaLabel: "Read the roundup",
  ctaHref:  "/discover?tab=featured",
};

const RESOURCES_ITEMS: DDItem[] = [
  { label: "Blog",  sub: "Articles & guides",    href: "/blog",  icon: <IconBlog />,  iconBg: "#ecfaf0", iconColor: "#15a35a" },
  { label: "FAQs",  sub: "Common questions",     href: "/faq",   icon: <IconFAQ />,   iconBg: "#f3f3f1", iconColor: "#3a3a3d" },
  { label: "Rules", sub: "Community guidelines", href: "/rules", icon: <IconRules />, iconBg: "#fff1e6", iconColor: "#ff6a3d" },
];

const RESOURCES_HERO: HeroPanel = {
  eyebrow:  "New in the blog",
  heading:  "A founder's field guide to launching on a directory",
  sub:      "Six tactics that moved the needle in 2026.",
  ctaLabel: "Read the guide",
  ctaHref:  "/blog",
};

/* ─── Split-with-Hero dropdown ───────────────────────────────────────── */
function SplitDropdown({ items, hero }: { items: DDItem[]; hero: HeroPanel }) {
  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 14px)",
      left: "50%",
      transform: "translateX(-50%)",
      width: 560,
      background: "var(--surface)",
      borderRadius: 18,
      boxShadow: "0 1px 0 rgba(15,15,16,.04), 0 20px 50px rgba(15,15,16,.18)",
      border: "1px solid var(--border)",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      zIndex: 400,
    }}>
      {/* Left – item list */}
      <div style={{ padding: "18px 18px 14px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--ink-faint)", fontWeight: 700, padding: "0 6px 10px" }}>
          {items === DISCOVER_ITEMS ? "Discover" : "Resources"}
        </div>
        {items.map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <div
              className="nav-dd-item"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 8px", borderRadius: 10, cursor: "pointer", transition: "background .12s" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: item.iconBg, color: item.iconColor, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right – gradient hero panel */}
      <div style={{
        background: "linear-gradient(135deg,#ff6a3d 0%,#ff3d88 100%)",
        color: "#fff",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Radial highlight */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 10%, rgba(255,255,255,0.28), transparent 45%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, opacity: 0.9, fontWeight: 700 }}>
            {hero.eyebrow}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, marginTop: 10, letterSpacing: "-0.01em" }}>
            {hero.heading}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 8, lineHeight: 1.5 }}>
            {hero.sub}
          </div>
        </div>
        <Link href={hero.ctaHref} style={{ textDecoration: "none", position: "relative" }}>
          <button style={{
            padding: "9px 14px", borderRadius: 10, background: "#fff", color: "#0f0f10",
            border: "none", fontWeight: 600, fontSize: 12.5, display: "inline-flex", alignItems: "center",
            gap: 6, marginTop: 16, cursor: "pointer", transition: "transform .15s", fontFamily: "inherit",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
          >
            {hero.ctaLabel}
            <IconArrow />
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Rail button with optional dropdown ────────────────────────────── */
function RailDropBtn({
  label, items, hero, featured, href,
}: {
  label: string;
  items?: DDItem[];
  hero?: HeroPanel;
  featured?: boolean;
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter() { if (timer.current) clearTimeout(timer.current); setOpen(true); }
  function leave() { timer.current = setTimeout(() => setOpen(false), 150); }

  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "7px 13px", borderRadius: 999, border: "none",
    background: featured ? "var(--surface)" : "transparent",
    boxShadow: featured ? "0 1px 2px rgba(15,15,16,.08)" : "none",
    color: "var(--ink)",
    fontWeight: featured ? 600 : 500, fontSize: 13,
    whiteSpace: "nowrap" as const,
    cursor: "pointer", fontFamily: "inherit",
    transition: "background .15s",
  };

  if (href && !items) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        <button style={btnStyle}>
          {featured && <span style={{ color: "#ff6a3d" }}><IconPlus /></span>}
          {label}
        </button>
      </Link>
    );
  }

  return (
    <div style={{ position: "relative" }} onMouseEnter={enter} onMouseLeave={leave}>
      <button style={btnStyle}
        onMouseEnter={(e) => { if (!featured) (e.currentTarget as HTMLButtonElement).style.background = "var(--border-faint)"; }}
        onMouseLeave={(e) => { if (!featured) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        {label}
        <span style={{ opacity: 0.55 }}><IconChevron /></span>
      </button>
      {open && items && hero && <SplitDropdown items={items} hero={hero} />}
    </div>
  );
}

/* ─── Notification types ──────────────────────────────────────────────── */
type NotifItem = { id: string; icon: string; text: string; time: string; ts: number };

/* ─── TopNav ─────────────────────────────────────────────────────────── */
export default function TopNav({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth]   = useState(false);
  const [authMessage, setAuthMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [userId, setUserId]       = useState<string | null | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInitial, setUserInitial] = useState<string>("");
  const [userName, setUserName]   = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userPlan, setUserPlan]   = useState<string>("free");

  // dropdowns
  const [notifOpen, setNotifOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const notifTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // notifications
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading]   = useState(false);
  const [notifFetched, setNotifFetched]   = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);

  // sign-out
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut]                 = useState(false);

  const ADMIN_EMAIL_NAV = "sohams270@gmail.com";

  async function fetchProfile(uid: string, email: string) {
    const client = createClient();
    const { data } = await client.from("profiles").select("avatar_url, full_name, plan").eq("id", uid).single();
    if (data?.avatar_url) setAvatarUrl(`${data.avatar_url}?t=${Date.now()}`);
    else setAvatarUrl(null);
    if (data?.full_name) setUserName(data.full_name);
    const plan = email === ADMIN_EMAIL_NAV ? "core" : (data?.plan ?? "free");
    setUserPlan(plan);
  }

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (!user) return;
      const name = user.user_metadata?.full_name || user.email || "";
      setUserInitial(name[0]?.toUpperCase() || "U");
      setUserName(name);
      setUserEmail(user.email ?? "");
      fetchProfile(user.id, user.email ?? "");
    });

    // Re-fetch profile when user saves changes on the profile page
    const handler = () => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (user) fetchProfile(user.id, user.email ?? "");
      });
    };
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (notifOpen && !notifFetched) fetchNotifications();
  }, [notifOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchNotifications() {
    setNotifLoading(true);
    const client = createClient();
    const since  = new Date(Date.now() - 7 * 86400000).toISOString();
    const items: NotifItem[] = [];

    const [toolsRes, upvotesRes, postsRes] = await Promise.allSettled([
      client.from("tools").select("id, name, created_at").eq("status", "approved")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(6),
      client.from("upvotes").select("created_at, tool_id, tools(name)")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(6),
      client.from("posts").select("id, content, created_at, type")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(6),
    ]);

    if (toolsRes.status === "fulfilled") {
      (toolsRes.value.data ?? []).forEach((t: { id: string; name: string; created_at: string }) => {
        items.push({ id: `tool-${t.id}`, icon: "🚀", text: `${t.name} just launched on NextBigTool`, time: t.created_at, ts: new Date(t.created_at).getTime() });
      });
    }
    if (upvotesRes.status === "fulfilled") {
      (upvotesRes.value.data ?? []).forEach((u: { created_at: string; tool_id: string; tools: { name: string }[] | { name: string } | null }) => {
        const toolsField = u.tools;
        const toolName = Array.isArray(toolsField) ? (toolsField[0]?.name ?? "a product") : (toolsField?.name ?? "a product");
        items.push({ id: `upvote-${u.tool_id}-${u.created_at}`, icon: "▲", text: `${toolName} received a new upvote`, time: u.created_at, ts: new Date(u.created_at).getTime() });
      });
    }
    if (postsRes.status === "fulfilled") {
      (postsRes.value.data ?? []).forEach((p: { id: string; content: string; created_at: string; type: string }) => {
        const typeLabel = p.type === "milestone" ? "shared a milestone" : p.type === "funding" ? "announced funding" : p.type === "launch" ? "launched" : "posted an update";
        items.push({ id: `post-${p.id}`, icon: "📝", text: `A founder ${typeLabel} on the Build in Public wall`, time: p.created_at, ts: new Date(p.created_at).getTime() });
      });
    }

    const sorted = items.sort((a, b) => b.ts - a.ts).slice(0, 10);
    setNotifications(sorted);
    setUnreadCount(sorted.length);
    setNotifFetched(true);
    setNotifLoading(false);
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  async function handleSignOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    setShowSignOutConfirm(false);
    setUserId(null);
    setSigningOut(false);
    router.push("/");
    router.refresh();
  }

  function openAuthModal(title: string, subtitle: string) {
    setAuthMessage({ title, subtitle });
    setShowAuth(true);
  }

  function handleSubmitClick() {
    if (userId) {
      window.location.href = "/dashboard/products";
    } else {
      openAuthModal("Launch your product", "Sign up in seconds and submit your tool to thousands of early adopters.");
    }
  }

  function hoverEnter(set: (v: boolean) => void, timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
    if (timer.current) clearTimeout(timer.current);
    set(true);
  }
  function hoverLeave(set: (v: boolean) => void, timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
    timer.current = setTimeout(() => set(false), 180);
  }

  const isSignedIn = userId != null && userId !== undefined;

  const navBg    = "var(--surface)";
  const navBorder = "var(--border)";
  const railBg   = "var(--surface-alt)";
  const railTxt  = "var(--ink)";

  return (
    <>
      <nav style={{
        background: navBg,
        borderBottom: `1px solid ${navBorder}`,
        flexShrink: 0, position: "sticky", top: 0, zIndex: 200,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 28px",
          height: 60,
          display: "flex", alignItems: "center",
        }}>

          {/* ── Logo (left zone, flex:1) ── */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Link href="/" aria-label="NextBigTool home" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <NBTWordmark height={56} dark={dark} priority />
            </Link>
          </div>

          {/* ── Pill Rail (center zone, hidden on mobile) ── */}
          <div className="nav-desktop-links" style={{
            alignItems: "center",
            background: railBg,
            borderRadius: 999, padding: 3, gap: 1,
            color: railTxt,
            flexShrink: 0,
          }}>
            <RailDropBtn label="Discover"   items={DISCOVER_ITEMS}  hero={DISCOVER_HERO} />
            <RailDropBtn label="Press Release" featured href="/newsletter" />
            <RailDropBtn label="Resources"  items={RESOURCES_ITEMS} hero={RESOURCES_HERO} />
            <RailDropBtn label="Pricing"    href="/pricing" />
          </div>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className="nav-mobile-trigger"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 6,
              display: "none", alignItems: "center", justifyContent: "center",
              color: "var(--ink)", borderRadius: 8,
            }}
          >
            {mobileMenuOpen ? (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            )}
          </button>

          {/* ── Actions (right zone, flex:1, right-aligned) ── */}
          <style>{`
            @keyframes rainbowSpin {
              0%   { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
            .dash-btn-wrap {
              position: relative;
              border-radius: 999px;
              padding: 2px;
              background: linear-gradient(90deg,#ff6a3d,#ff3d88,#a855f7,#3b82f6,#06b6d4,#00b87a,#ff6a3d,#ff3d88);
              background-size: 200% 200%;
              animation: rainbowSpin 2.4s linear infinite;
              box-shadow: 0 0 14px 2px rgba(168,85,247,0.35), 0 0 28px 4px rgba(255,61,136,0.2);
            }
            .dash-btn-inner {
              display: inline-flex; align-items: center; gap: 6px;
              padding: 6px 14px; border-radius: 999px;
              background: var(--surface);
              font-weight: 700; font-size: 13px; color: var(--ink);
              cursor: pointer; font-family: inherit; border: none;
              white-space: nowrap;
              transition: background .15s;
            }
            .dash-btn-inner:hover { background: var(--surface-alt); }
          `}</style>
          <div className="nav-desktop-links" style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>
            {isSignedIn ? (
              /* Signed-in: Dashboard + Bell + Settings */
              <>
                {/* 1. Dashboard — rainbow glow */}
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <div className="dash-btn-wrap">
                    <button className="dash-btn-inner">
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </button>
                  </div>
                </Link>

                {/* 2. Notifications bell */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => hoverEnter(setNotifOpen, notifTimer)}
                  onMouseLeave={() => hoverLeave(setNotifOpen, notifTimer)}
                >
                  <button style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "1px solid var(--border)", background: "var(--surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", transition: "background .15s",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-alt)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)"}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                      <div style={{
                        position: "absolute", top: -2, right: -2,
                        width: 16, height: 16, borderRadius: "50%",
                        background: "#ff3d88", border: "2px solid var(--surface)",
                        fontSize: 9, fontWeight: 800, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}
                  </button>

                  {notifOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 10px)", right: 0,
                      width: 340, background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: 16,
                      boxShadow: "0 20px 50px rgba(15,15,16,.18)", zIndex: 400,
                      overflow: "hidden",
                    }}>
                      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-faint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Alerts</div>
                        {unreadCount > 0 && (
                          <button onClick={() => setUnreadCount(0)} style={{ fontSize: 11, color: "#ff6a3d", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifLoading ? (
                          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>
                            Loading…
                          </div>
                        ) : notifications.length === 0 ? (
                          <div style={{ padding: "28px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
                            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>No new alerts this week</div>
                          </div>
                        ) : notifications.map((n, i) => (
                          <div key={n.id} style={{
                            display: "flex", gap: 10, padding: "11px 16px",
                            borderBottom: i < notifications.length - 1 ? "1px solid var(--border-faint)" : "none",
                            transition: "background .12s",
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                          >
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                              {n.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.4 }}>{n.text}</div>
                              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 3 }}>{timeAgo(n.time)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Settings / profile */}
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => hoverEnter(setSettingsOpen, settingsTimer)}
                  onMouseLeave={() => hoverLeave(setSettingsOpen, settingsTimer)}
                >
                  <button style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "1px solid var(--border)", background: "var(--surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", overflow: "hidden", padding: 0, transition: "background .15s",
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>
                        {userInitial}
                      </div>
                    )}
                  </button>

                  {settingsOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 10px)", right: 0,
                      width: 230, background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: 16,
                      boxShadow: "0 20px 50px rgba(15,15,16,.18)", zIndex: 400,
                      overflow: "hidden",
                    }}>
                      {/* Profile card */}
                      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-faint)", display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid var(--border)" }}>
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                              {userInitial}
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userName || "My Account"}
                          </div>
                          <div style={{ fontSize: 11, marginTop: 1, fontWeight: 700, color: userPlan === "core" ? "#ff6a3d" : userPlan === "basic" ? "#3b7fff" : "var(--ink-muted)" }}>
                            {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} plan
                          </div>
                        </div>
                      </div>

                      {/* My Profile */}
                      <div style={{ padding: "6px 6px 4px" }}>
                        <Link href="/dashboard/profile" style={{ textDecoration: "none" }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 9,
                            padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                            fontSize: 13, fontWeight: 600, color: "var(--ink)", transition: "background .12s",
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                          >
                            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            My Profile
                          </div>
                        </Link>

                        <div style={{ height: 1, background: "var(--border-faint)", margin: "4px 4px" }} />

                        {/* Sign out */}
                        <div
                          onClick={() => { setSettingsOpen(false); setShowSignOutConfirm(true); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 9,
                            padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                            fontSize: 13, fontWeight: 600, color: "#dc2626", transition: "background .12s",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(220,38,38,0.06)"}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                        >
                          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                          </svg>
                          Sign out
                        </div>
                      </div>

                      {/* FAQs small link */}
                      <div style={{ padding: "6px 16px 10px", borderTop: "1px solid var(--border-faint)" }}>
                        <Link href="/faq" style={{ fontSize: 11, color: "var(--ink-muted)", textDecoration: "none", fontWeight: 500 }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#ff6a3d"}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-muted)"}
                        >
                          FAQs & Help →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Signed-out: Sign in + Submit Your Tool (rainbow) */
              <>
                <button
                  onClick={() => openAuthModal("Welcome back", "Sign in to your NextBigTool account.")}
                  style={{
                    padding: "8px 16px", borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontWeight: 500, fontSize: 13,
                    color: "var(--ink)",
                    whiteSpace: "nowrap" as const, cursor: "pointer", fontFamily: "inherit",
                    transition: "background .15s, border-color .15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.13)" : "#f6f6f4"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.08)" : "#fff"; }}
                >
                  Sign in
                </button>
                <div className="dash-btn-wrap" onClick={handleSubmitClick} style={{ cursor: "pointer" }}>
                  <button className="dash-btn-inner" style={{ gap: 7 }}>
                    <IconRocket />
                    Submit Your Tool
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen drawer ── */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, bottom: 0,
          background: "var(--surface)", zIndex: 199,
          overflowY: "auto", padding: "20px 20px 40px",
          display: "flex", flexDirection: "column", gap: 4,
          borderTop: "1px solid var(--border)",
        }}>
          {/* Nav links */}
          {[
            { label: "Discover", href: "/discover" },
            { label: "Press Release", href: "/newsletter" },
            { label: "Blog", href: "/blog" },
            { label: "FAQs", href: "/faq" },
            { label: "Pricing", href: "/pricing" },
            { label: "Hall of Fame", href: "/discover?tab=hall-of-fame" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "block", padding: "13px 14px", borderRadius: 10,
                fontSize: 15, fontWeight: 600, color: "var(--ink)",
                textDecoration: "none", borderBottom: "1px solid var(--border-faint)",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ height: 12 }} />

          {/* CTA buttons */}
          {isSignedIn ? (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "14px 0", borderRadius: 12,
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                border: "none", fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal("Welcome back", "Sign in to your NextBigTool account."); }}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  fontSize: 14, fontWeight: 600, color: "var(--ink)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleSubmitClick(); }}
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12,
                  background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                  border: "none", fontSize: 14, fontWeight: 700, color: "#fff",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                🚀 Submit Your Tool
              </button>
            </div>
          )}
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthMessage(null); }}
          title={authMessage?.title}
          subtitle={authMessage?.subtitle}
          defaultMode="signup"
        />
      )}

      {/* ── Sign-out confirmation ── */}
      {showSignOutConfirm && (
        <>
          <div
            onClick={() => setShowSignOutConfirm(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(10,11,26,0.5)", zIndex: 1000 }}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 1001, width: "min(90vw, 380px)",
            background: "var(--surface)", borderRadius: 16,
            padding: "32px 28px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
              Are you sure about signing out?
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              You can always sign back in to access your dashboard and products.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 9,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  fontSize: 13, fontWeight: 600, color: "var(--ink)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 9,
                  border: "none", background: "#dc2626",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  cursor: signingOut ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: signingOut ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {signingOut ? "Signing out…" : "Yes, sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
