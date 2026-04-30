"use client";

import { useState } from "react";

type FaqItem = { q: string; a: string };
type FaqSection = { section: string; items: FaqItem[] };

function FaqRow({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(v => !v)}
      style={{ borderBottom: "1px solid var(--border-faint)", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", gap: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.45 }}>{q}</span>
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: open ? "#FF6B35" : "var(--surface-alt)",
          border: `1px solid ${open ? "#FF6B35" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 14, color: open ? "#fff" : "var(--ink-muted)",
          transition: "all 0.15s",
        }}>
          {open ? "−" : "+"}
        </span>
      </div>
      {open && (
        <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.75, margin: "0 0 16px", paddingRight: 32 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sections.map(sec => (
        <div key={sec.section} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "4px 24px 4px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#FF6B35", padding: "18px 0 8px" }}>
            {sec.section}
          </div>
          {sec.items.map(item => (
            <FaqRow key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      ))}
    </div>
  );
}
