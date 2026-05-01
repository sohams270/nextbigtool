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
    <div style={{
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      background: "linear-gradient(145deg, #0f0f14 0%, #1a0f1e 50%, #0f1318 100%)",
      border: "1px solid rgba(255,107,53,0.25)",
      marginBottom: 20,
    }}>
      {/* Gradient top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#FF6B35,#ff3d88,#a855f7)" }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 160, height: 160, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -30, left: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
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
        <div key={i} style={{
          position: "absolute", top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "rgba(255,200,120,0.55)", pointerEvents: "none",
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, padding: "22px 22px 24px" }}>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, marginBottom: 14,
          background: "linear-gradient(135deg, rgba(255,107,53,0.18), rgba(168,85,247,0.14))",
          border: "1px solid rgba(255,107,53,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="url(#ctaGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.3, marginBottom: 8,
          background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.7))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Ready to Ship<br />Your Tool?
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20,
        }}>
          Join indie founders who've launched on Next Big Tool and got their first users.
        </div>

        {/* CTA button */}
        <button
          onClick={handleClick}
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 11,
            border: "none",
            background: loading
              ? "rgba(255,107,53,0.5)"
              : "linear-gradient(90deg, #FF6B35, #ff3d88)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.01em",
            boxShadow: loading ? "none" : "0 4px 18px rgba(255,107,53,0.35)",
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
        <div style={{
          marginTop: 12, textAlign: "center",
          fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em",
        }}>
          Free to list · No credit card required
        </div>
      </div>
    </div>
  );
}
