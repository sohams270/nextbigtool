"use client";

import { useTransition } from "react";
import { approveTool, rejectTool } from "./actions";

export default function ReviewButtons({ toolId }: { toolId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <button
        disabled={pending}
        onClick={() => startTransition(() => approveTool(toolId))}
        style={{
          padding: "7px 16px", borderRadius: 8, border: "none",
          background: "linear-gradient(90deg,#00b87a,#00a36a)",
          color: "#fff", fontSize: 12, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "inherit", opacity: pending ? 0.6 : 1, transition: "opacity 0.15s",
        }}
      >
        ✓ Approve
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => rejectTool(toolId))}
        style={{
          padding: "7px 16px", borderRadius: 8,
          border: "1px solid rgba(220,38,38,0.3)",
          background: "rgba(220,38,38,0.06)",
          color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "inherit", opacity: pending ? 0.6 : 1, transition: "opacity 0.15s",
        }}
      >
        ✕ Reject
      </button>
    </div>
  );
}
