"use client";

import { createClient } from "@/utils/supabase/client";

export default function HofUpgradeBtn() {
  async function handleClick() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      window.location.href = "/api/checkout?interval=monthly";
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
      style={{
        width: "100%",
        background: "linear-gradient(135deg, rgba(255,215,80,0.15), rgba(255,140,0,0.1))",
        border: "1px solid rgba(255,215,80,0.45)",
        borderRadius: 8, padding: "8px 0",
        fontSize: 11, fontWeight: 700,
        color: "#FFD700", cursor: "pointer",
        fontFamily: "inherit", letterSpacing: "0.02em",
      }}
      className="hof-talk-btn"
    >
      ✦ Upgrade to Core
    </button>
  );
}
