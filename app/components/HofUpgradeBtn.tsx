"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function HofUpgradeBtn() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setLoading(true);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval: "monthly" }),
        });
        const data = await res.json();
        if (!res.ok) { alert(data.error || "Could not initiate checkout."); setLoading(false); return; }
        window.location.href = data.paymentLink;
      } catch {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    } else {
      const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        background: "linear-gradient(135deg, rgba(255,215,80,0.15), rgba(255,140,0,0.1))",
        border: "1px solid rgba(255,215,80,0.45)",
        borderRadius: 8, padding: "8px 0",
        fontSize: 11, fontWeight: 700,
        color: "#FFD700", cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", letterSpacing: "0.02em",
        opacity: loading ? 0.7 : 1,
      }}
      className="hof-talk-btn"
    >
      {loading ? "Loading…" : "✦ Upgrade to Core"}
    </button>
  );
}
