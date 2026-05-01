"use client";

import { useTransition, useState } from "react";
import { inductHofNomination, rejectHofNomination } from "./actions";

export default function HofNominationButtons({ nominationId }: { nominationId: string }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setErr(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        console.error("[HofNominationButtons]", msg);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          disabled={pending}
          onClick={() => run(() => inductHofNomination(nominationId))}
          style={{
            padding: "7px 16px", borderRadius: 8, border: "none",
            background: "linear-gradient(90deg,#ffd700,#ff8c00)",
            color: "#fff", fontSize: 12, fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Working…" : "🏆 Induct"}
        </button>
        <button
          disabled={pending}
          onClick={() => run(() => rejectHofNomination(nominationId))}
          style={{
            padding: "7px 16px", borderRadius: 8,
            border: "1px solid rgba(220,38,38,0.3)",
            background: "rgba(220,38,38,0.06)",
            color: "#dc2626", fontSize: 12, fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: pending ? 0.6 : 1,
          }}
        >
          ✕ Reject
        </button>
      </div>
      {err && (
        <div style={{ fontSize: 11, color: "#dc2626", fontFamily: "monospace", maxWidth: 300, textAlign: "right" }}>
          Error: {err}
        </div>
      )}
    </div>
  );
}
