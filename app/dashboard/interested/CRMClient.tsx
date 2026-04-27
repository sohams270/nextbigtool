"use client";

import { useState, useMemo } from "react";

export type Lead = {
  user_id: string;
  upvoted_at: string;
  tool_id: string;
  tool_name: string;
  full_name: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website: string | null;
};

export type Tool = { id: string; name: string };

type Sort = "name_asc" | "name_desc" | "time_desc" | "time_asc";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function Avatar({ lead }: { lead: Lead }) {
  const initials = (lead.full_name || lead.email || "?")[0].toUpperCase();
  const hue = (lead.user_id.charCodeAt(0) * 47) % 360;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      overflow: "hidden", border: "1.5px solid var(--border)",
      background: lead.avatar_url ? "transparent" : `hsl(${hue},60%,50%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 800, color: "#fff",
    }}>
      {lead.avatar_url
        ? <img src={lead.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials}
    </div>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label} style={{
      width: 26, height: 26, borderRadius: 6,
      border: "1px solid var(--border)", background: "var(--surface-alt)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color: "var(--ink-muted)", textDecoration: "none", flexShrink: 0,
      transition: "border-color .12s, color .12s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#ff6a3d"; (e.currentTarget as HTMLAnchorElement).style.color = "#ff6a3d"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-muted)"; }}
    >
      {icon}
    </a>
  );
}

export default function CRMClient({
  leads,
  tools,
  isUnlocked,
  newThisWeek,
}: {
  leads: Lead[];
  tools: Tool[];
  isUnlocked: boolean;
  newThisWeek: number;
}) {
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("time_desc");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filtered = useMemo(() => {
    let rows = leads;
    if (selectedTool !== "all") rows = rows.filter(r => r.tool_id === selectedTool);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.company ?? "").toLowerCase().includes(q) ||
        (r.role ?? "").toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      if (sort === "name_asc") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
      if (sort === "name_desc") return (b.full_name ?? "").localeCompare(a.full_name ?? "");
      if (sort === "time_asc") return new Date(a.upvoted_at).getTime() - new Date(b.upvoted_at).getTime();
      return new Date(b.upvoted_at).getTime() - new Date(a.upvoted_at).getTime();
    });
  }, [leads, selectedTool, search, sort]);

  function exportCSV() {
    const header = ["Name", "Email", "Company", "Role", "Twitter", "LinkedIn", "Website", "Product", "Upvoted At"];
    const rows = filtered.map(r => [
      r.full_name ?? "", r.email ?? "", r.company ?? "", r.role ?? "",
      r.twitter_url ?? "", r.linkedin_url ?? "", r.website ?? "",
      r.tool_name, new Date(r.upvoted_at).toISOString(),
    ]);
    const csv = [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "founders-crm.csv"; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  function exportExcel() {
    const header = ["Name", "Email", "Company", "Role", "Twitter", "LinkedIn", "Website", "Product", "Upvoted At"];
    const rows = filtered.map(r => [
      r.full_name ?? "", r.email ?? "", r.company ?? "", r.role ?? "",
      r.twitter_url ?? "", r.linkedin_url ?? "", r.website ?? "",
      r.tool_name, new Date(r.upvoted_at).toLocaleString(),
    ]);
    const tableRows = [header, ...rows].map(r =>
      `<tr>${r.map(c => `<td>${String(c).replace(/</g, "&lt;")}</td>`).join("")}</tr>`
    ).join("");
    const html = `<html><head><meta charset="utf-8"/></head><body><table>${tableRows}</table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "founders-crm.xls"; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff6a3d", marginBottom: 4 }}>
            Founder's CRM · Core Feature
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Interested Users
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            People who upvoted your products — with enriched contact info.
          </p>
        </div>

        {/* Export */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={!isUnlocked || filtered.length === 0}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface)",
              fontSize: 13, fontWeight: 600, color: "var(--ink)",
              cursor: isUnlocked ? "pointer" : "not-allowed", fontFamily: "inherit",
              opacity: isUnlocked ? 1 : 0.5,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {showExportMenu && (
            <>
              <div onClick={() => setShowExportMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, overflow: "hidden", minWidth: 150,
                boxShadow: "0 8px 24px rgba(15,15,16,.14)",
              }}>
                {[
                  { label: "Export as CSV", fn: exportCSV, ext: ".csv" },
                  { label: "Export as Excel", fn: exportExcel, ext: ".xls" },
                ].map(opt => (
                  <div key={opt.ext} onClick={opt.fn} style={{
                    padding: "10px 14px", fontSize: 13, fontWeight: 600,
                    color: "var(--ink)", cursor: "pointer", transition: "background .12s",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total leads", value: leads.length, color: "var(--ink)" },
          { label: "New this week", value: newThisWeek, color: "#00b87a" },
          { label: "Products tracked", value: tools.length, color: "#ff6a3d" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Controls: product filter + search + sort */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {/* Product tabs */}
        {tools.length > 1 && (
          <div style={{ display: "flex", gap: 4, background: "var(--surface-alt)", borderRadius: 8, padding: 3 }}>
            {[{ id: "all", name: "All products" }, ...tools].map(t => (
              <button key={t.id} onClick={() => setSelectedTool(t.id)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none",
                background: selectedTool === t.id ? "var(--surface)" : "transparent",
                boxShadow: selectedTool === t.id ? "0 1px 3px rgba(0,0,0,.1)" : "none",
                fontSize: 12, fontWeight: selectedTool === t.id ? 700 : 500,
                color: selectedTool === t.id ? "var(--ink)" : "var(--ink-muted)",
                cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
              }}>
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company, role…"
            style={{
              width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--surface)",
              fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={{
          padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--surface)", fontSize: 13, color: "var(--ink)",
          fontFamily: "inherit", cursor: "pointer", outline: "none",
        }}>
          <option value="time_desc">Newest upvote</option>
          <option value="time_asc">Oldest upvote</option>
          <option value="name_asc">Name A → Z</option>
          <option value="name_desc">Name Z → A</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: "hidden", position: "relative" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 120px 100px",
          padding: "10px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-alt)",
        }}>
          {["Name", "Email", "Company", "Role", "Social", "Upvoted"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ink-muted)", fontSize: 14 }}>
            {leads.length === 0 ? "No upvotes yet — share your product to get your first leads!" : "No results match your search."}
          </div>
        ) : (
          filtered.map((lead, i) => (
            <div key={`${lead.user_id}-${lead.tool_id}`} style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 120px 100px",
              padding: "12px 20px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border-faint)" : "none",
              transition: "background .12s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-alt)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
            >
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Avatar lead={lead} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lead.full_name || "—"}
                  </div>
                  {tools.length > 1 && (
                    <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{lead.tool_name}</div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                {lead.email
                  ? <a href={`mailto:${lead.email}`} style={{ color: "#3b7fff", textDecoration: "none" }}>{lead.email}</a>
                  : <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>

              {/* Company */}
              <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                {lead.company || <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>

              {/* Role */}
              <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8 }}>
                {lead.role || <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>

              {/* Social */}
              <div style={{ display: "flex", gap: 5 }}>
                {lead.twitter_url && (
                  <SocialLink href={lead.twitter_url} label="X / Twitter" icon={
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  } />
                )}
                {lead.linkedin_url && (
                  <SocialLink href={lead.linkedin_url} label="LinkedIn" icon={
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                  } />
                )}
                {lead.website && (
                  <SocialLink href={lead.website} label="Website" icon={
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
                    </svg>
                  } />
                )}
                {!lead.twitter_url && !lead.linkedin_url && !lead.website && (
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>—</span>
                )}
              </div>

              {/* Time */}
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{timeAgo(lead.upvoted_at)}</div>
            </div>
          ))
        )}

        {/* Lock overlay for non-core users */}
        {!isUnlocked && (
          <div style={{
            position: "absolute", inset: 0,
            backdropFilter: "blur(6px)",
            background: "rgba(var(--bg-rgb, 248,248,246), 0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 12,
          }}>
            <div style={{ textAlign: "center", maxWidth: 360, padding: "0 24px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "linear-gradient(135deg,#1a1a1f,#2a2a30)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(0,0,0,.25)",
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
                Unlock Founder's CRM
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                See the name, email, company and role of everyone who upvotes your products. Available on Core and Premium plans.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <a href="/dashboard/plan" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "10px 20px", borderRadius: 9, border: "none",
                    background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                    color: "#fff", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(255,61,136,.3)",
                  }}>
                    Upgrade to Core — $79/mo
                  </button>
                </a>
                <a href="/pricing" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "10px 16px", borderRadius: 9,
                    border: "1px solid var(--border)", background: "var(--surface)",
                    color: "var(--ink)", fontWeight: 600, fontSize: 13,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    Compare plans
                  </button>
                </a>
              </div>
              {leads.length > 0 && (
                <div style={{ marginTop: 14, fontSize: 12, color: "var(--ink-muted)" }}>
                  Your data is waiting · {leads.length} contact{leads.length !== 1 ? "s" : ""} pending reveal
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
