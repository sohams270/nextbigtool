"use client";

import { useState } from "react";

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/tools/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        width: "100%", padding: "11px 16px", borderRadius: 10,
        border: copied ? "1.5px solid #86efac" : "1.5px solid #FF6B35",
        background: copied
          ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
          : "linear-gradient(135deg, #fff7f4, #fff0eb)",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s",
        boxShadow: copied ? "none" : "0 2px 8px rgba(255,107,53,0.15)",
      }}
    >
      {copied ? (
        <>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-11"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>Link copied!</span>
        </>
      ) : (
        <>
          {/* Share icon */}
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B35" }}>Share this tool</span>
        </>
      )}
    </button>
  );
}
