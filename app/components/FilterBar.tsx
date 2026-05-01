"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const SORT_TABS = [
  { key: "trending",  label: "Trending"      },
  { key: "new",       label: "New Today"     },
  { key: "top",       label: "Top All Time"  },
  { key: "activity",  label: "Activity"      },
];

const PRICE_TABS = [
  { key: "free",      label: "Free"      },
  { key: "freemium",  label: "Freemium"  },
  { key: "paid",      label: "Paid"      },
];

export default function FilterBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sort  = searchParams.get("sort")  ?? "trending";
  const price = searchParams.get("price") ?? "all";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "price") {
      // Toggle: clicking active price deselects it (back to "all")
      if (price === value) {
        params.delete("price");
      } else {
        params.set("price", value);
      }
    } else {
      // Sort: trending is the default, remove param when selecting it
      const isDefault = key === "sort" && value === "trending";
      if (isDefault) params.delete(key);
      else params.set(key, value);
    }

    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  return (
    <div
      className="filter-bar-inner"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 40px", borderBottom: "1px solid var(--border)",
        background: "var(--surface)", position: "sticky", top: 0, zIndex: 100,
        opacity: isPending ? 0.65 : 1, transition: "opacity 0.15s",
        overflowX: "auto",
      }}
    >
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

      {/* ── Right: pricing filters only ── */}
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
      </div>
    </div>
  );
}
