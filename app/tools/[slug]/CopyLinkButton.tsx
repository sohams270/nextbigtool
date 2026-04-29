"use client";

import { useState } from "react";

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/tools/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy page link"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "10px 14px", borderRadius: 10,
        border: copied ? "1px solid #bbf7d0" : "1px solid #e8e8e6",
        background: copied ? "#f0fdf4" : "#fafaf8",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {copied ? (
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11"/>
        </svg>
      ) : (
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#6b6b78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: copied ? "#16a34a" : "#3a3a45",
      }}>
        {copied ? "Link copied!" : "Copy page link"}
      </span>
    </button>
  );
}
