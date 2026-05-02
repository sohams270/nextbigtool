"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CompareCtaBlock() {
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
      marginTop: 40, padding: "28px 32px", borderRadius: 16,
      background: "linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(255,107,53,0.03) 100%)",
      border: "1px solid rgba(255,107,53,0.2)", textAlign: "center",
    }}>
      <div style={{
        fontSize: 18, fontWeight: 800, color: "var(--ink)",
        marginBottom: 8, letterSpacing: "-0.02em",
      }}>
        Submit your tool free at NextBigTool
      </div>
      <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        No credit card. No queue. Instant listing with a DR 70+ backlink.
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 28px", borderRadius: 10,
          background: "#FF6B35", color: "#fff",
          border: "none", fontSize: 14, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontFamily: "inherit", letterSpacing: "0.01em",
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "Loading..." : (isSignedIn ? "Add Your Tool" : "List Your Tool Free")}
        {!loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </div>
  );
}
