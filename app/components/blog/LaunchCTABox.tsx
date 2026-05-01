"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LaunchCTABox() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
    });
  }, []);

  async function handleClick() {
    setLoading(true);
    if (isSignedIn) {
      router.push("/dashboard/products");
    } else {
      const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    }
    setLoading(false);
  }

  return (
    <div className="launch-cta-box" style={{
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 20,
    }}>
      {/* Top accent bar */}
      <div className="cta-top-bar" style={{ height: 3 }} />

      {/* Glow orbs */}
      <div className="cta-glow-a" style={{
        position: "absolute", top: -40, right: -40,
        width: 160, height: 160, borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <div className="cta-glow-b" style={{
        position: "absolute", bottom: -30, left: -30,
        width: 120, height: 120, borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Star dots */}
      {[
        { top: "18%", left: "12%", size: 1.5 },
        { top: "35%", left: "88%", size: 1 },
        { top: "72%", left: "78%", size: 1.5 },
        { top: "85%", left: "20%", size: 1 },
        { top: "55%", left: "45%", size: 1 },
      ].map((s, i) => (
        <div key={i} className="cta-dot" style={{
          position: "absolute", top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: "50%",
          pointerEvents: "none",
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, padding: "22px 22px 24px" }}>

        {/* Icon */}
        <div className="cta-icon-wrap" style={{
          width: 44, height: 44, borderRadius: 13, marginBottom: 14,
          border: "1px solid transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Headline */}
        <div className="cta-headline" style={{
          fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.3, marginBottom: 8,
        }}>
          Ready to Ship<br />Your Tool?
        </div>

        {/* Subtext */}
        <div className="cta-sub" style={{
          fontSize: 12, lineHeight: 1.6, marginBottom: 20,
        }}>
          Join indie founders who&apos;ve launched on Next Big Tool and got their first users.
        </div>

        {/* CTA button */}
        <button
          onClick={handleClick}
          disabled={loading}
          className="cta-btn"
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 11,
            border: "none",
            opacity: loading ? 0.6 : 1,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.01em",
            transition: "all 0.15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
        >
          {loading ? "Loading…" : (
            <>
              {isSignedIn ? "Add Your Tool" : "Launch Now"}
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Trust note */}
        <div className="cta-trust" style={{
          marginTop: 12, textAlign: "center",
          fontSize: 10, letterSpacing: "0.02em",
        }}>
          Free to list · No credit card required
        </div>
      </div>
    </div>
  );
}
