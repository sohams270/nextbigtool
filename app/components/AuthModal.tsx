"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  border: "1px solid #CFCFD4",
  borderRadius: 8,
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#1A1A1A",
  background: "#fff",
  transition: "border-color 0.15s",
};

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
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleGoogle() {
    // Always use the production URL so Google → Supabase → app redirect
    // works whether the user is on localhost or the deployed site.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      // emailRedirectTo ensures the confirmation link in the email
      // points to the live site, not localhost.
      const emailRedirectTo =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo,
        },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.refresh();
      onClose();
    }
    setLoading(false);
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
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2001,
          background: "#fff",
          borderRadius: 16,
          padding: "32px 32px 28px",
          width: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 16,
            background: "none", border: "none",
            fontSize: 18, color: "#A8A8AD",
            cursor: "pointer", lineHeight: 1, padding: 4,
            fontFamily: "inherit",
          }}
        >
          ✕
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>📬</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 12, color: "#6B6B70", lineHeight: 1.7 }}>
              We sent a confirmation link to<br />
              <strong style={{ color: "#1A1A1A" }}>{email}</strong>.<br />
              Click it to activate your account, then sign in.
            </div>
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "#FFF9F0", border: "1px solid #FFE4C8",
              borderRadius: 8, fontSize: 11, color: "#92500A", lineHeight: 1.6, textAlign: "left",
            }}>
              💡 <strong>Didn&apos;t get it?</strong> Check your <strong>spam / junk</strong> folder.
              It can take up to 2 minutes to arrive. If it&apos;s still missing, try signing up again.
            </div>
            <button
              onClick={() => { setDone(false); switchMode("signin"); }}
              style={{
                marginTop: 16, background: "none", border: "1px solid #CFCFD4",
                borderRadius: 8, padding: "9px 24px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", color: "#1A1A1A",
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* Logo + title */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <Image src="/logo.png" alt="Next Big Tool" height={28} width={62} style={{ objectFit: "contain", marginBottom: 10 }} />
              <div style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A" }}>
                {title ?? (mode === "signin" ? "Welcome back" : "Create your account")}
              </div>
              <div style={{ fontSize: 11, color: "#6B6B70", marginTop: 3, lineHeight: 1.5 }}>
                {subtitle ?? (mode === "signin" ? "Sign in to your account" : "Join 8,400+ builders and product hunters")}
              </div>
            </div>

            {/* Tab toggle */}
            <div
              style={{
                display: "flex", marginBottom: 20,
                background: "#F5F5F5", borderRadius: 9, padding: 3,
              }}
            >
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1, padding: "8px 0",
                    fontSize: 12, fontWeight: 600,
                    border: "none", borderRadius: 7,
                    cursor: "pointer", fontFamily: "inherit",
                    background: mode === m ? "#fff" : "transparent",
                    color: mode === m ? "#1A1A1A" : "#6B6B70",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "10px 0",
                border: "1px solid #CFCFD4", borderRadius: 8,
                background: "#fff", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", color: "#1A1A1A",
                transition: "background 0.15s",
                marginBottom: 16,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F9F9F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {/* Google logo SVG */}
              <svg width={18} height={18} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#EDEDEE" }} />
              <span style={{ fontSize: 11, color: "#A8A8AD", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#EDEDEE" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 5 }}>Full name</label>
                  <input
                    style={inputStyle} type="text" placeholder="Your name"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A", display: "block", marginBottom: 5 }}>Email</label>
                <input
                  style={inputStyle} type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#1A1A1A" }}>Password</label>
                  {mode === "signin" && (
                    <a href="/auth/reset-password" style={{ fontSize: 10, color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  style={inputStyle} type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6}
                />
              </div>

              {error && (
                <div style={{ fontSize: 11, color: "#DC2626", padding: "8px 10px", background: "#FEF2F2", borderRadius: 6, lineHeight: 1.4 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", marginTop: 4,
                  padding: "11px 0",
                  background: loading ? "#CFCFD4" : "#FF6B35",
                  color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div style={{ fontSize: 10, color: "#A8A8AD", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
              By continuing you agree to our{" "}
              <a href="/rules" style={{ color: "#6B6B70", textDecoration: "underline" }}>Terms</a>
              {" "}and{" "}
              <a href="/rules" style={{ color: "#6B6B70", textDecoration: "underline" }}>Privacy Policy</a>.
            </div>
          </>
        )}
      </div>
    </>
  );
}
