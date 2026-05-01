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
      {copied ? (
        <>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
