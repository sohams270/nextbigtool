"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Btn from "@/app/components/Btn";
import NBTWordmark from "@/app/components/NBTWordmark";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #CFCFD4",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 12, padding: 40, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 12, color: "#6B6B70" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </div>
          <Btn variant="ghost" size="sm" style={{ marginTop: 20 }} onClick={() => { setDone(false); setMode("signin"); }}>
            Back to sign in
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
      <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 12, padding: 40, maxWidth: 400, width: "100%" }}>
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <NBTWordmark height={50} priority />
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ fontSize: 12, color: "#6B6B70", marginBottom: 24 }}>
          {mode === "signin"
            ? "Sign in to manage your tools and upvote."
            : "Join 8,400+ builders and product hunters."}
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, border: "1px solid #CFCFD4", borderRadius: 8, overflow: "hidden" }}>
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "9px 0",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: mode === m ? "#0A0B1A" : "#fff",
                color: mode === m ? "#fff" : "#6B6B70",
                fontFamily: "inherit",
              }}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input
              style={input}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            style={input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div style={{ fontSize: 11, color: "#E53E3E", padding: "8px 10px", background: "#FEF2F2", borderRadius: 6 }}>
              {error}
            </div>
          )}

          <Btn variant="primary" size="md" full style={{ marginTop: 4 }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </Btn>
        </form>

        <div style={{ fontSize: 11, color: "#A8A8AD", textAlign: "center", marginTop: 20 }}>
          By signing up you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
