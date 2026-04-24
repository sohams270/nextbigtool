"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Btn from "./Btn";
import Logo from "./Logo";

const POST_TYPES = [
  { value: "milestone", label: "🏆 Milestone" },
  { value: "update",    label: "📣 Update"    },
  { value: "funding",   label: "💰 Funding"   },
  { value: "launch",    label: "🚀 Launch"    },
];

export default function PostForm({
  tools,
  userId,
}: {
  tools: { id: string; name: string }[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [toolId, setToolId] = useState(tools[0]?.id ?? "");
  const [type, setType] = useState("update");
  const [content, setContent] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const selectedTool = tools.find((t) => t.id === toolId);
  const showMetric = type === "milestone" || type === "funding";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.from("posts").insert({
      author_id:    userId,
      tool_id:      toolId || null,
      type,
      content:      content.trim(),
      metric_label: showMetric && metricLabel ? metricLabel : null,
      metric_value: showMetric && metricValue ? metricValue : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setContent("");
    setMetricLabel("");
    setMetricValue("");
    setOpen(false);
    router.refresh();
    setLoading(false);
  }

  const select: React.CSSProperties = {
    padding: "8px 10px",
    border: "1px solid #CFCFD4",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #CFCFD4",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          border: "1px dashed #CFCFD4",
          borderRadius: 8,
          cursor: "pointer",
          background: "#FAFAFA",
        }}
      >
        {selectedTool && <Logo size={32} letter={selectedTool.name[0]} />}
        <span style={{ fontSize: 12, color: "#A8A8AD", flex: 1 }}>
          Share a milestone, update, or launch moment…
        </span>
        <Btn variant="primary" size="sm" onClick={() => setOpen(true)}>
          Post Update
        </Btn>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #CFCFD4",
        borderRadius: 8,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* type + tool selectors */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 14px",
          borderBottom: "1px solid #F5F5F5",
          flexWrap: "wrap",
        }}
      >
        <select value={type} onChange={(e) => setType(e.target.value)} style={select}>
          {POST_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>

        {tools.length > 1 && (
          <select value={toolId} onChange={(e) => setToolId(e.target.value)} style={select}>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        {tools.length === 1 && selectedTool && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px" }}>
            <Logo size={20} letter={selectedTool.name[0]} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedTool.name}</span>
          </div>
        )}
      </div>

      {/* metric row (milestone / funding only) */}
      {showMetric && (
        <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderBottom: "1px solid #F5F5F5" }}>
          <input
            style={{ ...input, width: 100 }}
            placeholder={type === "funding" ? "Round (e.g. Pre-seed)" : "Metric (e.g. MRR)"}
            value={metricLabel}
            onChange={(e) => setMetricLabel(e.target.value)}
          />
          <input
            style={{ ...input, width: 130 }}
            placeholder={type === "funding" ? "Amount (e.g. $500k)" : "Value (e.g. $1,000)"}
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
          />
        </div>
      )}

      {/* text content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening with your build? Share with the community…"
        required
        rows={4}
        style={{
          ...input,
          borderRadius: 0,
          border: "none",
          borderBottom: "1px solid #F5F5F5",
          resize: "none",
          padding: "12px 14px",
          lineHeight: 1.5,
        }}
      />

      {error && (
        <div style={{ fontSize: 11, color: "#E53E3E", padding: "8px 14px", background: "#FEF2F2" }}>
          {error}
        </div>
      )}

      {/* actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "10px 14px" }}>
        <Btn variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Btn>
        <Btn variant="primary" size="sm">
          {loading ? "Posting…" : "Post to Wall"}
        </Btn>
      </div>
    </form>
  );
}
