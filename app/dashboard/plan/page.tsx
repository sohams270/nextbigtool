import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import PlanToggle from "@/app/components/PlanToggle";
import UnsubscribeButton from "./UnsubscribeButton";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "sohams270@gmail.com";

const PLAN_META: Record<string, { label: string; color: string; bg: string; borderColor: string }> = {
  free:  { label: "Free",  color: "var(--ink-muted)",  bg: "var(--surface-alt)",        borderColor: "var(--border)" },
  basic: { label: "Basic", color: "#3b7fff",            bg: "rgba(59,127,255,.1)",        borderColor: "rgba(59,127,255,.3)" },
  core:  { label: "Core",  color: "#ff6a3d",            bg: "rgba(255,106,61,.1)",        borderColor: "rgba(255,106,61,.3)" },
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  free:  "Upgrade to unlock Founder CRM, unlimited listings, and Hall of Fame placement.",
  basic: "You have boosted visibility and CSV exports. Upgrade to Core for Founder CRM and unlimited listings.",
  core:  "You have full access to all features including Founder CRM, Hall of Fame, and unlimited everything.",
};

export default async function PlanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch plan — admin is always Core
  let currentPlan = "free";
  if (user.email === ADMIN_EMAIL) {
    currentPlan = "core";
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    currentPlan = profile?.plan ?? "free";
  }

  const pm = PLAN_META[currentPlan] ?? PLAN_META.free;
  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Billing</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: 0 }}>My Plan</h1>
            <span style={{ background: pm.bg, border: `1px solid ${pm.borderColor}`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, color: pm.color, textTransform: "capitalize" }}>
              {pm.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            You&apos;re on the <b style={{ color: "var(--ink)" }}>{pm.label}</b> plan.{" "}
            {PLAN_DESCRIPTIONS[currentPlan]}
          </p>
        </div>
        <Link href="/pricing" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)",
          background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--ink)",
          textDecoration: "none",
        }}>
          See full pricing →
        </Link>
      </div>

      {/* Plan cards + comparison */}
      <PlanToggle currentPlan={currentPlan as "free" | "basic" | "core"} />

      {/* Billing & invoices */}
      <div style={{ marginTop: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Billing &amp; invoices</h2>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 20px" }}>Manage your subscription and download past receipts.</p>

        {currentPlan === "free" ? (
          /* Free state */
          <div style={{ padding: "24px 0", textAlign: "center", borderTop: "1px solid var(--border-faint)" }}>
            <div style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 16 }}>
              No active subscription — you&apos;re on the Free plan.
            </div>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <button style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                View upgrade options →
              </button>
            </Link>
          </div>
        ) : (
          /* Paid plan state */
          <div style={{ borderTop: "1px solid var(--border-faint)", paddingTop: 20 }}>
            {/* Active plan info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: pm.bg, border: `1px solid ${pm.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={pm.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                    {pm.label} Plan
                    {isAdmin && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#ff6a3d", background: "rgba(255,106,61,.1)", padding: "2px 8px", borderRadius: 20 }}>Admin</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                    {currentPlan === "core" ? "Billed monthly · $79/mo" : "One-time payment · $19 per product"}
                  </div>
                </div>
              </div>
              {/* Only show unsubscribe for non-admin paid users */}
              {!isAdmin && <UnsubscribeButton currentPlan={currentPlan} userId={user.id} />}
            </div>

            {/* Invoices placeholder — will be replaced by real Stripe data */}
            <div style={{ padding: "14px 16px", borderRadius: 10, background: "var(--surface-alt)", border: "1px solid var(--border-faint)", fontSize: 13, color: "var(--ink-muted)", textAlign: "center" }}>
              Invoice history will appear here once payment integration is complete.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
