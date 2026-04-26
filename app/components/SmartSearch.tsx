"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";

/* ─── Debounce ─────────────────────────────────────────────────────────── */
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/* ─── Rotating placeholder examples ────────────────────────────────────── */
const EXAMPLES = [
  "I want to track my expenses…",
  "AI tool for writing emails…",
  "No-code app builder…",
  "Social media scheduler…",
  "Analytics for my SaaS…",
  "Collaborative design tool…",
  "Automate customer support…",
  "Project management for teams…",
];

function useRotatingPlaceholder(examples: string[], active: boolean) {
  const [idx, setIdx]   = useState(0);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!active) return;
    const current = examples[idx];
    let t: ReturnType<typeof setTimeout>;
    if (typing) {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
      } else {
        t = setTimeout(() => setTyping(false), 2200);
      }
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText((p) => p.slice(0, -1)), 30);
      } else {
        setIdx((i) => (i + 1) % examples.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(t);
  }, [text, typing, idx, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}

/* ─── Pricing badge colors ──────────────────────────────────────────────── */
function pricingStyle(p: string) {
  if (p === "free")     return { bg: "#ecfaf0", color: "#15a35a" };
  if (p === "freemium") return { bg: "#eff6ff", color: "#3b82f6" };
  return { bg: "#fff1e6", color: "#ff6a3d" };
}

/* ─── Logo with fallback ────────────────────────────────────────────────── */
function ResultLogo({ result }: { result: SearchResult }) {
  const [err, setErr] = useState(false);
  if (result.logo_url && !err) {
    return (
      <img
        src={result.logo_url} alt={result.name} onError={() => setErr(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", borderRadius: 8 }}
      />
    );
  }
  const colors = ["#ff6a3d","#5b6bff","#15a35a","#ff3d88","#f59e0b","#8b5cf6","#0ea5e9","#ec4899"];
  const bg = colors[result.name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
      {result.name[0]?.toUpperCase()}
    </div>
  );
}

/* ─── Sparkle icon ──────────────────────────────────────────────────────── */
function SparkleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" opacity="0.9"/>
      <path d="M5 3l.9 2.7L8.6 6.5 5.9 7.4 5 10.1l-.9-2.7L1.4 6.5l2.7-.9L5 3z" opacity="0.6"/>
      <path d="M19 14l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z" opacity="0.5"/>
    </svg>
  );
}

/* ─── Main SmartSearch ──────────────────────────────────────────────────── */
export default function SmartSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive]   = useState(-1);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const placeholder = useRotatingPlaceholder(EXAMPLES, focused && query.length === 0);

  /* Close on outside click */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setFocused(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]); setTotal(0); setLoading(false); setSearched(false);
        return;
      }
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json() as { results: SearchResult[]; total: number };
        setResults(json.results);
        setTotal(json.total);
        setSearched(true);
        setOpen(true);
      } catch {
        setResults([]); setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setActive(-1);
    setSearched(false);
    if (val.trim().length >= 2) { setLoading(true); setOpen(true); }
    else { setResults([]); setOpen(false); }
    fetchResults(val);
  }

  function navigate(path: string) { setOpen(false); router.push(path); }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    if (active >= 0 && results[active]) {
      navigate(`/tools/${results[active].slug}`);
    } else {
      navigate(`/discover?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === "Escape")    { setOpen(false); }
  }

  const showDropdown = open && query.trim().length >= 2;
  const hasResults   = results.length > 0;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Label above ── */}
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,107,53,0.12)", border: "1px solid rgba(255,107,53,0.25)",
            borderRadius: 20, padding: "4px 12px",
          }}>
            <SparkleIcon size={11} color="#FF6B35" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.04em" }}>
              SMART SEARCH
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        {/* Glow layer — only visible when focused */}
        <div style={{
          position: "absolute", inset: -2, borderRadius: showDropdown ? "14px 14px 0 0" : 14,
          background: focused
            ? "linear-gradient(135deg, rgba(255,107,53,0.5), rgba(255,61,136,0.4))"
            : "transparent",
          transition: "background 0.3s",
          filter: "blur(6px)",
          zIndex: 0,
          opacity: focused ? 1 : 0,
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "stretch",
          background: "#fff",
          borderRadius: showDropdown ? "12px 12px 0 0" : 12,
          border: focused
            ? "1.5px solid rgba(255,107,53,0.6)"
            : "1.5px solid rgba(255,255,255,0.15)",
          boxShadow: focused
            ? "0 0 0 4px rgba(255,107,53,0.12), 0 8px 32px rgba(0,0,0,0.2)"
            : "0 4px 28px rgba(0,0,0,0.22)",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}>
          {/* Left icon area */}
          <div style={{
            display: "flex", alignItems: "center", paddingLeft: 16, gap: 8,
            flexShrink: 0, color: focused ? "#FF6B35" : "#A8A8AD",
            transition: "color 0.2s",
          }}>
            <SparkleIcon size={15} color={focused ? "#FF6B35" : "#A8A8AD"} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={query}
            onChange={onChange}
            onKeyDown={handleKey}
            onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true); }}
            placeholder={focused && query.length === 0 ? placeholder : "Describe what you're looking for…"}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              border: "none", outline: "none",
              padding: compact ? "11px 10px" : "15px 12px",
              fontSize: compact ? 13 : 14,
              color: "#0f0f10",
              background: "transparent",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", paddingRight: 10, color: "#FF6B35", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.7s" repeatCount="indefinite"/>
                </path>
              </svg>
            </div>
          )}

          {/* Clear */}
          {!loading && query.length > 0 && (
            <button type="button" onClick={() => { setQuery(""); setResults([]); setOpen(false); setSearched(false); inputRef.current?.focus(); }}
              style={{ display: "flex", alignItems: "center", padding: "0 8px", background: "none", border: "none", cursor: "pointer", color: "#C0C0C8", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
              ×
            </button>
          )}

          {/* Search button */}
          <button type="submit" style={{
            background: "linear-gradient(135deg, #FF6B35, #ff3d88)",
            color: "#fff", border: "none",
            padding: compact ? "0 18px" : "0 24px",
            fontSize: compact ? 12 : 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 7,
            flexShrink: 0, letterSpacing: "0.02em",
            transition: "opacity 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </div>
      </form>

      {/* ── Hint below ── */}
      {!compact && !showDropdown && (
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.01em" }}>
          Try: &ldquo;email automation&rdquo; · &ldquo;AI writing assistant&rdquo; · &ldquo;no-code database&rdquo;
        </div>
      )}

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 900,
          background: "#fff",
          borderRadius: "0 0 12px 12px",
          border: "1.5px solid rgba(255,107,53,0.3)",
          borderTop: "1px solid #f0f0ee",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", opacity: 1 - i * 0.2 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: "linear-gradient(90deg,#f0f0ee,#e8e8e6,#f0f0ee)", backgroundSize: "200% 100%", flexShrink: 0, animation: "shimmer 1.4s infinite" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 11, background: "linear-gradient(90deg,#f0f0ee,#e8e8e6,#f0f0ee)", backgroundSize: "200% 100%", borderRadius: 4, width: "38%", marginBottom: 7, animation: "shimmer 1.4s infinite" }} />
                    <div style={{ height: 10, background: "linear-gradient(90deg,#f0f0ee,#e8e8e6,#f0f0ee)", backgroundSize: "200% 100%", borderRadius: 4, width: "65%", animation: "shimmer 1.4s infinite" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && hasResults && (
            <>
              <div style={{ padding: "8px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <SparkleIcon size={10} color="#FF6B35" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.06em" }}>
                  BEST MATCHES
                </span>
              </div>

              {results.map((r, i) => {
                const tags = r.tool_tags.map((tt) => tt.tags?.name).filter(Boolean).slice(0, 2) as string[];
                const pc   = pricingStyle(r.pricing);
                const isActive = i === active;
                return (
                  <div
                    key={r.id}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(-1)}
                    onClick={() => navigate(`/tools/${r.slug}`)}
                    style={{
                      display: "flex", alignItems: "center", gap: 13,
                      padding: "10px 16px", cursor: "pointer",
                      background: isActive ? "#fff8f5" : "#fff",
                      borderTop: "1px solid #f5f5f3",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* Logo */}
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 9, border: "1px solid #f0f0ee", overflow: "hidden" }}>
                      <ResultLogo result={r} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f0f10" }}>{r.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pc.color, background: pc.bg, padding: "1px 7px", borderRadius: 20 }}>
                          {r.pricing.charAt(0).toUpperCase() + r.pricing.slice(1)}
                        </span>
                        {tags.map((t) => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 500, color: "#9090a0", background: "#f5f5f3", padding: "1px 7px", borderRadius: 20 }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b6b78", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.tagline}
                      </div>
                    </div>

                    {/* Upvotes + arrow */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#9090a0", display: "flex", alignItems: "center", gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {r.upvote_count}
                      </span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#FF6B35" : "#d8d8d8"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div
                onClick={() => navigate(`/discover?q=${encodeURIComponent(query.trim())}`)}
                style={{
                  padding: "11px 16px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", cursor: "pointer",
                  background: "linear-gradient(135deg, #fff8f5, #fff5fa)",
                  borderTop: "1px solid #f0f0ee",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg,#fff1e6,#ffeef5)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg,#fff8f5,#fff5fa)"; }}
              >
                <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>
                  See all {total > 6 ? `${total}+` : ""} results for &ldquo;{query}&rdquo;
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </div>
            </>
          )}

          {/* No results — only show after search completes */}
          {!loading && searched && !hasResults && (
            <div style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f0f10", marginBottom: 6 }}>
                No tools found
              </div>
              <div style={{ fontSize: 12, color: "#9090a0", lineHeight: 1.65, maxWidth: 280, margin: "0 auto 16px" }}>
                No tool in our catalog matches &ldquo;<strong style={{ color: "#0f0f10" }}>{query}</strong>&rdquo;. Try different keywords or browse by category.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <div
                  onClick={() => navigate("/discover")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#FF6B35", cursor: "pointer", padding: "7px 16px", border: "1.5px solid #FF6B35", borderRadius: 20 }}
                >
                  Browse all tools →
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
