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

/* ─── TopNav ─────────────────────────────────────────────────────────── */
export default function TopNav({ dark }: { dark?: boolean }) {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [userInitial, setUserInitial] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "";
        setUserInitial(name[0]?.toUpperCase() || "U");
      }
    });
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

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
      openAuthModal(
        "Launch your product",
        "Sign up in seconds and submit your tool to thousands of early adopters."
      );
    }
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
              <NBTWordmark height={26} dark={dark} priority />
            </Link>
          </div>

          {/* ── Pill Rail (center zone, auto width) ── */}
          <div style={{
            display: "flex", alignItems: "center",
            background: railBg,
            borderRadius: 999, padding: 3, gap: 1,
            color: railTxt,
            flexShrink: 0,
          }}>
            <RailDropBtn label="Discover"   items={DISCOVER_ITEMS}  hero={DISCOVER_HERO} />
            <RailDropBtn label="Newsletter" featured href="/newsletter" />
            <RailDropBtn label="Resources"  items={RESOURCES_ITEMS} hero={RESOURCES_HERO} />
            <RailDropBtn label="Pricing"    href="/pricing" />
          </div>

          {/* ── Actions (right zone, flex:1, right-aligned) ── */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>
            {isSignedIn ? (
              /* Signed-in: avatar dropdown */
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    padding: "6px 14px 6px 7px", borderRadius: 999,
                    border: `1px solid ${dark ? "rgba(255,255,255,0.2)" : "#e3e3e0"}`,
                    background: dark ? "rgba(255,255,255,0.08)" : "#fff",
                    fontWeight: 500, fontSize: 13,
                    color: dark ? "rgba(255,255,255,0.9)" : "#0f0f10",
                    whiteSpace: "nowrap" as const, cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 7,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-alt)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = userMenuOpen ? "var(--surface-alt)" : (dark ? "rgba(255,255,255,0.08)" : "#fff"); }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
                    {userInitial}
                  </div>
                  Dashboard
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ opacity: 0.5, transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 6, minWidth: 180,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 300,
                  }}>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: "var(--ink)",
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)"}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                      >
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                      </div>
                    </Link>

                    <div style={{ height: 1, background: "var(--border-faint)", margin: "4px 6px" }} />

                    <div
                      onClick={() => { setUserMenuOpen(false); setShowSignOutConfirm(true); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: "#dc2626",
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
                )}
              </div>
            ) : (
              /* Signed-out: Sign in button */
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
            )}

            {/* Submit Your Tool — always visible */}
            <button
              onClick={handleSubmitClick}
              style={{
                padding: "9px 16px", borderRadius: 999, border: "none",
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                color: "#fff", fontWeight: 600, fontSize: 13,
                display: "inline-flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap" as const, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(255,61,136,0.32)",
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 22px rgba(255,61,136,0.42)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(255,61,136,0.32)";
              }}
            >
              <IconRocket />
              Submit Your Tool
            </button>
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
