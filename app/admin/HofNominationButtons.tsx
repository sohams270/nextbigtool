"use client";

import { useTransition } from "react";
import { inductHofNomination, rejectHofNomination } from "./actions";

export default function HofNominationButtons({ nominationId }: { nominationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <button
        disabled={pending}
        onClick={() => startTransition(() => inductHofNomination(nominationId))}
        style={{
          padding: "7px 16px", borderRadius: 8, border: "none",
          background: "linear-gradient(90deg,#ffd700,#ff8c00)",
          color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "inherit", opacity: pending ? 0.6 : 1,
        }}
      >
        🏆 Induct
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => rejectHofNomination(nominationId))}
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
  );
}
