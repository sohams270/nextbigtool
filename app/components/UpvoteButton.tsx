"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "./AuthModal";

export default function UpvoteButton({
  toolId,
  userId,
  initialCount,
  initialActive,
  size = "sm",
}: {
  toolId: string;
  userId: string | null;
  initialCount: number;
  initialActive: boolean;
  size?: "sm" | "md";
}) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const small = size === "sm";

  async function handleClick() {
    if (!userId) {
      setShowModal(true);
      return;
    }
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
      await supabase
        .from("upvotes")
        .delete()
        .match({ user_id: userId, tool_id: toolId });
    } else {
      await supabase
        .from("upvotes")
        .insert({ user_id: userId, tool_id: toolId });
    }

    setLoading(false);
  }

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: small ? "6px 8px" : "8px 12px",
          border: `1px solid ${active ? "#FF6B35" : "var(--border)"}`,
          borderRadius: 6,
          background: active ? "var(--orange-soft)" : "var(--surface)",
          color: active ? "#FF6B35" : "var(--ink)",
          minWidth: small ? 40 : 52,
          cursor: loading ? "default" : "pointer",
          flexShrink: 0,
          transition: "border-color 0.15s, background 0.15s",
          opacity: loading ? 0.7 : 1,
          userSelect: "none",
        }}
      >
        <svg width={small ? 10 : 12} height={small ? 10 : 12} viewBox="0 0 12 12" fill="none">
          <path d="M6 2L10 8H2L6 2Z" fill={active ? "#FF6B35" : "var(--ink)"} />
        </svg>
        <span style={{ fontSize: small ? 10 : 12, fontWeight: 700 }}>{count}</span>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
