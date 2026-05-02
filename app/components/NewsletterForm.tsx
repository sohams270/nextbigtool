"use client";

import { useState, useRef } from "react";

export default function NewsletterForm({
  source = "sidebar",
  dark = true,
}: {
  source?: string;
  dark?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value?.trim() ?? "";
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're in! 🎉 Welcome to The Founder's Weekly.");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div style={{
        padding: "12px 14px", borderRadius: 8,
        background: dark ? "rgba(0,184,122,0.12)" : "rgba(0,184,122,0.08)",
        border: "1px solid rgba(0,184,122,0.3)",
        fontSize: 12, color: "#00B87A", fontWeight: 600, lineHeight: 1.5,
        display: "flex", alignItems: "flex-start", gap: 8,
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>✓</span>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        ref={inputRef}
        type="email"
        name="email"
        required
        defaultValue=""
        placeholder="name@company.com"
        disabled={status === "loading"}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
          borderRadius: 7,
          padding: "8px 10px",
          fontSize: 11,
          color: dark ? "#fff" : "#111",
          outline: "none",
          fontFamily: "inherit",
        }}
      />

      {status === "error" && (
        <div style={{ fontSize: 10.5, color: "#f87171", fontWeight: 600, marginTop: -2 }}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          background: status === "loading" ? "#c94f22" : "#FF6B35",
          border: "none",
          borderRadius: 7,
          padding: "8px 0",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          cursor: status === "loading" ? "default" : "pointer",
          fontFamily: "inherit",
          opacity: status === "loading" ? 0.8 : 1,
        }}
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
