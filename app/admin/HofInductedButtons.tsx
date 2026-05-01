"use client";

import { useTransition, useState } from "react";
import { removeFromHof } from "./actions";

export default function HofInductedButtons({
  nominationId,
  toolId,
}: {
  nominationId: string;
  toolId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleRemove() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setErr(null);
    startTransition(async () => {
      try {
        await removeFromHof(nominationId, toolId);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg);
        setConfirmed(false);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, marginTop: 10 }}>
      <button
        disabled={pending}
        onClick={handleRemove}
        style={{
          width: "100%",
          padding: "6px 12px", borderRadius: 7,
          border: confirmed ? "1px solid rgba(220,38,38,0.6)" : "1px solid rgba(255,255,255,0.12)",
          background: confirmed ? "rgba(220,38,38,0.12)" : "rgba(255,255,255,0.04)",
          color: confirmed ? "#dc2626" : "rgba(255,255,255,0.55)",
          fontSize: 11, fontWeight: 700,
          cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          opacity: pending ? 0.6 : 1,
          transition: "all 0.15s",
        }}
      >
        {pending ? "Removing…" : confirmed ? "⚠ Confirm remove from HoF" : "✕ Remove from HoF"}
      </button>
      {confirmed && !pending && (
        <span style={{ fontSize: 10, color: "rgba(220,38,38,0.7)" }}>
          Tool stays featured · click again to confirm
        </span>
      )}
      {err && (
        <span style={{ fontSize: 10, color: "#dc2626", fontFamily: "monospace" }}>
          {err}
        </span>
      )}
    </div>
  );
}
