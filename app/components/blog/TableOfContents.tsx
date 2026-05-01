"use client";
import { useEffect, useState } from "react";
type TocItem = { id: string; text: string };
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#FF6B35,#ff3d88)" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)", marginBottom: 12 }}>
          Table of Contents
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} style={{
              fontSize: 12, textDecoration: "none", padding: "5px 8px", borderRadius: 7,
              fontWeight: active === item.id ? 700 : 500,
              color: active === item.id ? "#FF6B35" : "var(--ink-muted)",
              background: active === item.id ? "rgba(255,107,53,0.08)" : "transparent",
              transition: "all .15s", display: "block", lineHeight: 1.4,
            }}>
              {item.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
