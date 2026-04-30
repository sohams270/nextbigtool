"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CmsLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    const res = await fetch("/api/cms-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/cms/dashboard");
    } else {
      const data = await res.json();
      setError(data.error ?? "Invalid credentials");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0B1A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(255,107,53,0.15)",
            border: "1px solid rgba(255,107,53,0.3)",
            fontSize: 22, marginBottom: 16,
          }}>✍️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            NBT CMS
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Content Management System
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "28px 28px 24px",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            Sign in to your CMS
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
            Enter your credentials to continue
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter username"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, color: "#fff",
                  fontSize: 13, fontFamily: "inherit", outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, color: "#fff",
                  fontSize: 13, fontFamily: "inherit", outline: "none",
                }}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 11, color: "#FF6B6B",
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.25)",
                borderRadius: 7, padding: "8px 12px",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px",
                background: loading ? "rgba(255,107,53,0.5)" : "#FF6B35",
                border: "none", borderRadius: 8,
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginTop: 4,
                transition: "background .15s",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Next Big Tool CMS · Access restricted
        </div>
      </div>
    </div>
  );
}
