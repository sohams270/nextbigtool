"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";

const SORT_TABS = [
  { key: "trending",  label: "Trending"     },
  { key: "new",       label: "New Today"    },
  { key: "top",       label: "Top All Time" },
  { key: "activity",  label: "Activity"     },
];

const PRICE_TABS = [
  { key: "all",       label: "All"      },
  { key: "free",      label: "Free"     },
  { key: "freemium",  label: "Freemium" },
  { key: "paid",      label: "Paid"     },
];

export default function FilterBar({ categories }: { categories: string[] }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const sort     = searchParams.get("sort")     ?? "trending";
  const price    = searchParams.get("price")    ?? "all";
  const category = searchParams.get("category") ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const isDefault = (key === "sort" && value === "trending") ||
                      (key === "price" && value === "all") ||
                      value === "";
    if (isDefault) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="filter-bar-inner" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 40px", borderBottom: "1px solid var(--border)",
      background: "var(--surface)", position: "sticky", top: 0, zIndex: 100,
      opacity: isPending ? 0.65 : 1, transition: "opacity 0.15s",
      overflowX: "auto",
    }}>

      {/* ── Left: sort tabs ── */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {SORT_TABS.map(({ key, label }) => {
          const active = sort === key;
          return (
            <button key={key} onClick={() => update("sort", key)} style={{
              padding: "5px 13px", borderRadius: 20,
              fontSize: 12, fontWeight: active ? 700 : 500,
              border: active ? "none" : "1px solid var(--border)",
              background: active
                ? "linear-gradient(90deg,#FF6B35,#FF3B6B)"
                : "transparent",
              color: active ? "#fff" : "var(--ink)",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.12s", whiteSpace: "nowrap",
              boxShadow: active ? "0 2px 8px rgba(255,107,53,0.3)" : "none",
            }}>
              {label}
            </button>
          );
        })}

        {/* Hall of Fame — gold, stands out */}
        <button
          onClick={() => update("sort", "hof")}
          style={{
            padding: "5px 13px", borderRadius: 20,
            fontSize: 12, fontWeight: 700,
            border: sort === "hof"
              ? "none"
              : "1px solid rgba(255,200,0,0.5)",
            background: sort === "hof"
              ? "linear-gradient(90deg,#FFD700,#FFA500)"
              : "transparent",
            color: sort === "hof" ? "#0A0B1A" : "#E6AC00",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
            whiteSpace: "nowrap",
            boxShadow: sort === "hof" ? "0 2px 10px rgba(255,180,0,0.4)" : "none",
            transition: "all 0.12s",
          }}
        >
          🏆 Hall of Fame
        </button>
      </div>

      {/* ── Right: price + category ── */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {PRICE_TABS.map(({ key, label }) => {
          const active = price === key;
          return (
            <button key={key} onClick={() => update("price", key)} style={{
              padding: "5px 13px", borderRadius: 20,
              fontSize: 12, fontWeight: active ? 700 : 500,
              border: active ? "none" : "1px solid var(--border)",
              background: active ? "var(--ink)" : "transparent",
              color: active ? "var(--bg)" : "var(--ink)",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.12s",
            }}>
              {label}
            </button>
          );
        })}

        <div style={{ width: 1, background: "var(--border)", height: 16, margin: "0 4px" }} />

        {/* Category dropdown */}
        <div ref={catRef} style={{ position: "relative" }}>
          <button onClick={() => setCatOpen(v => !v)} style={{
            padding: "5px 13px", borderRadius: 20,
            fontSize: 12, fontWeight: category ? 700 : 500,
            border: category ? "1.5px solid #FF6B35" : "1px solid var(--border)",
            background: category ? "var(--orange-soft)" : "transparent",
            color: category ? "#FF6B35" : "var(--ink)",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.12s", whiteSpace: "nowrap",
          }}>
            {category || "Category"}
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {catOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "6px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
              zIndex: 300, minWidth: 220,
              maxHeight: 340, overflowY: "auto",
            }}>
              {category && (
                <button onClick={() => { update("category", ""); setCatOpen(false); }} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "7px 10px", borderRadius: 8, border: "none",
                  background: "transparent", fontSize: 11.5, fontWeight: 600,
                  color: "#FF6B35", cursor: "pointer", fontFamily: "inherit",
                  marginBottom: 4,
                }}>
                  ✕ Clear filter
                </button>
              )}
              {categories.map((cat) => (
                <button key={cat} onClick={() => { update("category", cat); setCatOpen(false); }} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "7px 10px", borderRadius: 8, border: "none",
                  background: category === cat ? "var(--orange-soft)" : "transparent",
                  color: category === cat ? "#FF6B35" : "var(--ink)",
                  fontSize: 12, fontWeight: category === cat ? 700 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "background 0.1s",
                }}>
                  {cat}
                </button>
              ))}
              {categories.length === 0 && (
                <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-muted)" }}>
                  No categories yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
