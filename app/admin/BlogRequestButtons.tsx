"use client";

import { useState, useTransition } from "react";
import { approveBlogRequest, rejectBlogRequest, publishBlogRequest } from "./actions";

export default function BlogRequestButtons({ requestId, status }: { requestId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [showPublish, setShowPublish] = useState(false);
  const [blogUrl, setBlogUrl] = useState("");

  if (status === "published") {
    return <span style={{ fontSize: 11.5, color: "#00875A", fontWeight: 700 }}>✓ Published</span>;
  }

  if (showPublish) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
        <input
          autoFocus
          placeholder="https://blog.nextbigtool.com/…"
          value={blogUrl}
          onChange={e => setBlogUrl(e.target.value)}
          style={{
            padding: "6px 10px", borderRadius: 7, border: "1.5px solid var(--border)",
            fontSize: 12, color: "var(--ink)", fontFamily: "inherit", outline: "none",
            background: "var(--surface)",
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button
            disabled={pending || !blogUrl.trim()}
            onClick={() => startTransition(() => publishBlogRequest(requestId, blogUrl.trim()))}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 7, border: "none",
              background: "linear-gradient(90deg,#00b87a,#00a36a)",
              color: "#fff", fontSize: 11, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Saving…" : "Mark Published"}
          </button>
          <button
            onClick={() => setShowPublish(false)}
            style={{
              padding: "6px 10px", borderRadius: 7,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--ink-muted)", fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" as const }}>
      {status === "pending" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => approveBlogRequest(requestId))}
          style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: "linear-gradient(90deg,#3b7fff,#2563eb)",
            color: "#fff", fontSize: 12, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: pending ? 0.6 : 1,
          }}
        >
          ✓ Approve
        </button>
      )}
      {(status === "pending" || status === "approved") && (
        <button
          disabled={pending}
          onClick={() => setShowPublish(true)}
          style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: "linear-gradient(90deg,#00b87a,#00a36a)",
            color: "#fff", fontSize: 12, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: pending ? 0.6 : 1,
          }}
        >
          🔗 Publish
        </button>
      )}
      {status === "pending" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => rejectBlogRequest(requestId))}
          style={{
            padding: "7px 14px", borderRadius: 8,
            border: "1px solid rgba(220,38,38,0.3)",
            background: "rgba(220,38,38,0.06)",
            color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: pending ? 0.6 : 1,
          }}
        >
          ✕ Reject
        </button>
      )}
    </div>
  );
}
