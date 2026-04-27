import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import PlanToggle from "@/app/components/PlanToggle";

export default async function PlanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // TODO: fetch real plan from DB — defaulting to "free" for now
  const currentPlan = "free";

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Billing</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: 0 }}>My Plan</h1>
            <span style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", textTransform: "capitalize" as const }}>
              {currentPlan}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            You&apos;re on the <b style={{ color: "var(--ink)" }}>Free</b> plan.{" "}
            Upgrade to unlock Founder CRM, unlimited listings, and Hall of Fame placement.
          </p>
        </div>
        <Link href="/pricing" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)",
          background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--ink-2)",
          textDecoration: "none",
        }}>
          See full pricing →
        </Link>
      </div>

      {/* Plan toggle + cards + comparison — client component */}
      <PlanToggle />

      {/* Billing section */}
      <div style={{ marginTop: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Billing &amp; invoices</h2>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px" }}>Manage your payment method and download past receipts.</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #ececea" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 38, height: 26, borderRadius: 4, background: "#0e0e10", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: ".1em" }}>VISA</div>
            <div>
              <b style={{ fontSize: 13 }}>•••• 4242</b>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>Expires 08/27</div>
            </div>
          </div>
          <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--ink-2)", fontFamily: "inherit" }}>Update</button>
        </div>
        <div style={{ padding: "14px 0", fontSize: 13, color: "var(--ink-muted)" }}>
          No invoices yet — you&apos;re on the Free plan.
        </div>
      </div>
    </main>
  );
}
