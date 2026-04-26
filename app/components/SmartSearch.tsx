"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";

/* ─── helpers ─────────────────────────────────────────────────────────── */
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function pricingColor(p: string) {
  if (p === "free")     return { bg: "#ecfaf0", color: "#15a35a" };
  if (p === "freemium") return { bg: "#eff6ff", color: "#3b82f6" };
  return { bg: "#fff1e6", color: "#ff6a3d" };
}

function ResultLogo({ result }: { result: SearchResult }) {
  const [err, setErr] = useState(false);
  if (result.logo_url && !err) {
    return (
      <img
        src={result.logo_url}
        alt={result.name}
        onError={() => setErr(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6, display: "block" }}
      />
    );
  }
  // Fallback: coloured initial
  const colors = ["#ff6a3d","#5b6bff","#15a35a","#ff3d88","#f59e0b","#8b5cf6"];
  const bg = colors[result.name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: "100%", height: "100%", borderRadius: 6,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 800, color: "#fff",
    }}>
      {result.name[0]?.toUpperCase()}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function SmartSearch({ placeholder = "Search 1,248 tools…" }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  /* ── Close on outside click ── */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── Fetch results ── */
  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json() as { results: SearchResult[]; total: number };
        setResults(json.results);
        setTotal(json.total);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280),
    []
  );

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setActive(-1);
    if (val.trim().length >= 2) {
      setLoading(true);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
    fetchResults(val);
  }

  function navigateTo(path: string) {
    setOpen(false);
    router.push(path);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    if (active >= 0 && results[active]) {
      navigateTo(`/tools/${results[active].slug}`);
    } else {
      navigateTo(`/discover?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: "flex",
          background: "#fff",
          borderRadius: showDropdown ? "10px 10px 0 0" : 10,
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: showDropdown
            ? "0 0 0 3px rgba(255,107,53,0.25), 0 8px 30px rgba(0,0,0,0.15)"
            : "0 4px 24px rgba(0,0,0,0.18)",
          overflow: "hidden",
          transition: "box-shadow 0.2s, border-radius 0.15s",
        }}>
          {/* Search icon */}
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 16, color: "#A8A8AD", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={onChange}
            onKeyDown={handleKey}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "13px 12px",
              fontSize: 13,
              color: "#0f0f10",
              background: "transparent",
              fontFamily: "inherit",
            }}
          />

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 12, color: "#A8A8AD" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
          )}

          {/* Clear button */}
          {!loading && query.length > 0 && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
              style={{ display: "flex", alignItems: "center", paddingRight: 10, background: "none", border: "none", cursor: "pointer", color: "#A8A8AD", fontSize: 16, lineHeight: 1, padding: "0 10px" }}
            >
              ×
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            style={{
              background: "#FF6B35", color: "#fff", border: "none",
              padding: "0 20px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e85d25"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B35"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </form>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 900,
          background: "#fff",
          border: "1px solid rgba(255,255,255,0.2)",
          borderTop: "1px solid #f0f0ee",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
          {/* Results */}
          {results.length > 0 ? (
            <>
              {results.map((r, i) => {
                const tags = r.tool_tags
                  .map((tt) => tt.tags?.name)
                  .filter(Boolean)
                  .slice(0, 2) as string[];
                const pc = pricingColor(r.pricing);
                const isActive = i === active;
                return (
                  <div
                    key={r.id}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(-1)}
                    onClick={() => navigateTo(`/tools/${r.slug}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 16px", cursor: "pointer",
                      background: isActive ? "#fff8f5" : "#fff",
                      borderBottom: "1px solid #f5f5f3",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Logo */}
                    <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 8, border: "1px solid #f0f0ee", overflow: "hidden" }}>
                      <ResultLogo result={r} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f0f10" }}>{r.name}</span>
                        {tags.map((t) => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 600, color: "#6b6b78", background: "#f5f5f3", padding: "1px 7px", borderRadius: 20 }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b6b78", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.tagline}
                      </div>
                    </div>

                    {/* Right meta */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pc.color, background: pc.bg, padding: "2px 8px", borderRadius: 20 }}>
                        {r.pricing.charAt(0).toUpperCase() + r.pricing.slice(1)}
                      </span>
                      <span style={{ fontSize: 11, color: "#9090a0", display: "flex", alignItems: "center", gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {r.upvote_count}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FF6B35" : "#d0d0d8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div
                onClick={() => navigateTo(`/discover?q=${encodeURIComponent(query.trim())}`)}
                style={{
                  padding: "11px 16px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", cursor: "pointer",
                  background: "#fafaf9",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f3f3f0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fafaf9"; }}
              >
                <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>
                  See all {total > 6 ? `${total}+` : ""} results for &ldquo;{query}&rdquo;
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </div>
            </>
          ) : !loading ? (
            /* No results */
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f0f10", marginBottom: 4 }}>No tools found</div>
              <div style={{ fontSize: 12, color: "#9090a0", lineHeight: 1.5, marginBottom: 14 }}>
                Try different keywords, or browse the full catalog
              </div>
              <div
                onClick={() => navigateTo("/discover")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 700, color: "#FF6B35",
                  cursor: "pointer", padding: "7px 16px",
                  border: "1.5px solid #FF6B35", borderRadius: 20,
                }}
              >
                Browse all tools →
              </div>
            </div>
          ) : (
            /* Loading skeleton */
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#f0f0ee", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: "#f0f0ee", borderRadius: 4, width: "40%", marginBottom: 6 }} />
                    <div style={{ height: 10, background: "#f5f5f3", borderRadius: 4, width: "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
