"use client";
import { useState } from "react";
export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} title="Copy link" style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 99,
      border: "1px solid var(--border)",
      background: copied ? "rgba(0,184,117,0.1)" : "var(--surface)",
      color: copied ? "#00B875" : "var(--ink-muted)",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit", transition: "all .2s",
    }}>
      {copied ? "✓ Copied!" : "🔗 Share"}
    </button>
  );
}
