"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "./AuthModal";

export default function UpvoteBox({
  toolId,
  userId,
  initialCount,
  initialActive,
}: {
  toolId: string;
  userId: string | null;
  initialCount: number;
  initialActive: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleClick() {
    if (!userId) { setShowModal(true); return; }
    if (loading) return;

    // optimistic update
    if (active) {
      setActive(false);
      setCount((c) => c - 1);
    } else {
      setActive(true);
      setCount((c) => c + 1);
    }
    setLoading(true);

    if (active) {
      await supabase.from("upvotes").delete().match({ user_id: userId, tool_id: toolId });
    } else {
      await supabase.from("upvotes").insert({ user_id: userId, tool_id: toolId });
    }

    setLoading(false);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={active ? "Remove upvote" : "Upvote this tool"}
        aria-pressed={active}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
        style={{
          margin: "0 12px 12px",
          padding: "11px 13px",
          borderRadius: 10,
          background: active
            ? "linear-gradient(135deg, #fff0eb, #ffe4d9)"
            : "linear-gradient(135deg, #fff7f4, #fff0eb)",
          border: active ? "1px solid #FF6B35" : "1px solid #ffd9cc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "background 0.15s, border-color 0.15s, transform 0.1s",
          transform: loading ? "scale(0.98)" : "scale(1)",
          userSelect: "none",
        }}
        title={active ? "Click to remove upvote" : "Click to upvote"}
      >
        <span style={{ fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>
          {active ? "▲ Upvoted!" : "Upvotes"}
        </span>
        <span style={{
          fontSize: 20, fontWeight: 900, color: "#FF6B35",
          letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 5,
        }}>
          <svg width={13} height={13} viewBox="0 0 12 12" fill={active ? "#FF6B35" : "#FF6B35"}>
            <path d="M6 2L10 8H2L6 2Z" />
          </svg>
          {count}
        </span>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
