"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import NBTWordmark from "./NBTWordmark";

export default function AuthModal({
  onClose,
  title,
  subtitle,
  defaultMode = "signin",
}: {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  defaultMode?: "signin" | "signup";
}) {
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleGoogle() {
    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(error.message);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(10,11,26,0.5)",
          zIndex: 2000,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Card */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2001,
        background: "var(--surface)",
        borderRadius: 22,
        width: "min(92vw, 380px)",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      }}>
        {/* Gradient header */}
        <div style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #ff3d88 100%)",
          padding: "26px 28px 22px",
          textAlign: "center",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 14,
              background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: "50%", width: 28, height: 28,
              fontSize: 13, color: "#fff",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>

          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <NBTWordmark height={36} />
          </div>

          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {title ?? "Welcome to NextBigTool"}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", marginTop: 5, lineHeight: 1.5 }}>
            {subtitle ?? "Sign in or sign up to continue"}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px 26px", textAlign: "center" }}>
          {/* Google button */}
          <button
            onClick={handleGoogle}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "13px 0",
              background: "#fff", border: "1px solid #e2e2e2",
              borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", color: "#1A1A1A",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "box-shadow 0.15s, transform 0.1s",
              marginBottom: 16,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.13)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {error && (
            <div style={{
              marginBottom: 12, fontSize: 11, color: "#DC2626",
              padding: "8px 12px", background: "#FEF2F2",
              borderRadius: 8, lineHeight: 1.4, textAlign: "left",
            }}>
              {error}
            </div>
          )}

          <div style={{ fontSize: 10.5, color: "var(--ink-faint)", lineHeight: 1.6 }}>
            By continuing you agree to our{" "}
            <a href="/rules" style={{ color: "var(--ink-faint)", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/rules" style={{ color: "var(--ink-faint)", textDecoration: "underline" }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </>
  );
}
