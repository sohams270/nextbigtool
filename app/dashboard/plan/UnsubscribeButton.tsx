"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UnsubscribeButton({ currentPlan, userId }: { currentPlan: string; userId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUnsubscribe() {
    setLoading(true);
    await fetch("/api/cancel-subscription", { method: "POST" });
    setLoading(false);
    setShowConfirm(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          padding: "8px 16px", borderRadius: 9,
          border: "1px solid rgba(220,38,38,.3)",
          background: "rgba(220,38,38,.06)",
          color: "#dc2626", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        Cancel subscription
      </button>

      {showConfirm && (
        <>
          <div onClick={() => setShowConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,11,26,.5)", zIndex: 1000 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 1001, width: "min(90vw,400px)",
            background: "var(--surface)", borderRadius: 16, padding: "32px 28px",
            textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.18)",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(220,38,38,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
              Cancel {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan?
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              You'll lose access to all {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} features immediately and be moved back to the Free plan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--ink)", cursor: "pointer", fontFamily: "inherit" }}
              >
                Keep my plan
              </button>
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: "#dc2626", fontSize: 13, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
