"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

type Fields = {
  first_name: string;
  last_name: string;
  username: string;
  company: string;
  role: string;
  bio: string;
  website_url: string;
  twitter_url: string;
  linkedin_url: string;
};

const STEPS = ["Welcome", "Your handle", "Your role", "Final touches"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid var(--border)", background: "var(--surface)",
  fontSize: 14, color: "var(--ink)", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box", transition: "border-color .15s",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", display: "flex", gap: 4 }}>
        {label}
        {required && <span style={{ color: "#ff6a3d" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function OnboardingModal({ userId, userEmail, onComplete }: {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Fields>({
    first_name: "", last_name: "", username: "", company: "",
    role: "", bio: "", website_url: "", twitter_url: "", linkedin_url: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill name from Google metadata
  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
      const [first, ...rest] = fullName.split(" ");
      setFields(f => ({
        ...f,
        first_name: first ?? "",
        last_name: rest.join(" ") ?? "",
      }));
    });
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 320);
  }, [step]);

  function set(k: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields(f => ({ ...f, [k]: e.target.value }));
      setError("");
    };
  }

  function validateStep(): string {
    if (step === 0) {
      if (!fields.first_name.trim()) return "First name is required.";
      if (!fields.last_name.trim()) return "Last name is required.";
    }
    if (step === 1) {
      if (!fields.username.trim()) return "Username is required.";
      if (!/^[a-z0-9_]{2,30}$/.test(fields.username.trim())) return "Username: 2–30 chars, lowercase letters, numbers, underscores only.";
    }
    if (step === 2) {
      if (!fields.company.trim()) return "Company is required.";
      if (!fields.role.trim()) return "Role is required.";
    }
    return "";
  }

  function scrollTop() {
    // Scroll the outer container back to top on step change (mobile UX)
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function goNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (step === STEPS.length - 1) { handleComplete(); return; }
    setDir(1);
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); scrollTop(); }, 200);
  }

  function goBack() {
    if (step === 0) return;
    setDir(-1);
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setError(""); setAnimating(false); scrollTop(); }, 200);
  }

  async function handleSignOut() {
    const client = createClient();
    await client.auth.signOut();
    window.location.href = "/";
  }

  async function handleComplete() {
    setSaving(true);
    const fullName = `${fields.first_name.trim()} ${fields.last_name.trim()}`.trim();

    try {
      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name:    fullName,
          username:     fields.username.trim().toLowerCase(),
          company:      fields.company.trim(),
          role:         fields.role.trim(),
          bio:          fields.bio.trim() || null,
          website_url:  fields.website_url.trim() || null,
          twitter_url:  fields.twitter_url.trim() || null,
          linkedin_url: fields.linkedin_url.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setSaving(false);
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
    } catch {
      setSaving(false);
      setError("Network error — please check your connection and try again.");
      return;
    }

    setSaving(false);
    onComplete();
  }

  const slideStyle: React.CSSProperties = {
    transition: "opacity .2s ease, transform .2s ease",
    opacity: animating ? 0 : 1,
    transform: animating ? `translateX(${dir * 24}px)` : "translateX(0)",
  };

  const initial = ((fields.first_name[0] ?? "") + (fields.last_name[0] ?? "")).toUpperCase() || "?";

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,11,26,0.55)", zIndex: 2000, backdropFilter: "blur(3px)" }} />

      {/* Scroll container — fills the viewport, centres the modal, scrollable on mobile */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 2001,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        overflowY: "auto", padding: "16px 0 32px",
        // Padding-top increases when keyboard is open (dvh < vh)
      }}>

      {/* Modal */}
      <div style={{
        width: "min(92vw, 500px)",
        marginTop: "auto", marginBottom: "auto",
        background: "var(--surface)",
        borderRadius: 20,
        boxShadow: "0 24px 80px rgba(0,0,0,.22)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Top bar */}
        <div style={{ height: 4, background: "var(--border-faint)" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: "width .35s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>

        {/* Sign out button — top right */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{
            position: "absolute", top: 12, right: 14,
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11.5, fontWeight: 600, color: "var(--ink-muted)",
            fontFamily: "inherit", padding: "4px 8px", borderRadius: 7,
            transition: "color .15s, background .15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#dc2626"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-muted)"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>

        <div style={{ padding: "28px 32px 32px" }}>
          {/* Step dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 7, height: 7, borderRadius: 999,
                background: i <= step ? "#ff6a3d" : "var(--border)",
                transition: "all .3s",
              }} />
            ))}
          </div>

          {/* Slide content */}
          <div style={slideStyle}>

            {/* Step 0: Name */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Welcome to NextBigTool!
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                    Let's set up your founder profile. It takes less than a minute.
                  </p>
                </div>

                {/* Avatar preview */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "linear-gradient(135deg,#ff6a3d,#ff3d88)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 800, color: "#fff",
                    border: "3px solid var(--surface)", boxShadow: "0 0 0 3px #ff6a3d40",
                  }}>
                    {initial}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="First name" required>
                    <input
                      ref={inputRef}
                      value={fields.first_name}
                      onChange={set("first_name")}
                      placeholder="Soham"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </Field>
                  <Field label="Last name" required>
                    <input
                      value={fields.last_name}
                      onChange={set("last_name")}
                      placeholder="Saha"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </Field>
                </div>
                <Field label="Email">
                  <input value={userEmail} disabled style={{ ...inputStyle, background: "var(--surface-alt)", color: "var(--ink-muted)", cursor: "not-allowed" }} />
                </Field>
              </div>
            )}

            {/* Step 1: Username */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Choose your handle
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                    This is how you'll appear on product listings.
                  </p>
                </div>
                <Field label="Username" required>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--ink-muted)", fontWeight: 600 }}>@</span>
                    <input
                      ref={inputRef}
                      value={fields.username}
                      onChange={e => { set("username")(e); }}
                      placeholder="yourhandle"
                      style={{ ...inputStyle, paddingLeft: 28 }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>
                  {fields.username && (
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
                      Your profile: <span style={{ color: "#3b7fff", fontWeight: 600 }}>nextbigtool.com/@{fields.username.toLowerCase()}</span>
                    </div>
                  )}
                </Field>
              </div>
            )}

            {/* Step 2: Company + Role */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🚀</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Tell us about yourself
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                    This helps other founders and users know who you are.
                  </p>
                </div>
                <Field label="Company" required>
                  <input
                    ref={inputRef}
                    value={fields.company}
                    onChange={set("company")}
                    placeholder="Acme Inc."
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </Field>
                <Field label="Role" required>
                  <input
                    value={fields.role}
                    onChange={set("role")}
                    placeholder="Founder, CEO, Indie Hacker…"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </Field>
              </div>
            )}

            {/* Step 3: Bio + Social (optional) */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    Almost there!
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                    Add a bio and social links — or skip them for now.
                  </p>
                </div>
                <Field label="Bio">
                  <textarea
                    ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
                    value={fields.bio}
                    onChange={set("bio")}
                    rows={3}
                    placeholder="Tell the community about yourself… (optional)"
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "X / Twitter", key: "twitter_url" as const, placeholder: "@username" },
                    { label: "LinkedIn", key: "linkedin_url" as const, placeholder: "linkedin.com/in/" },
                    { label: "Website", key: "website_url" as const, placeholder: "https://" },
                  ].map(f => (
                    <Field key={f.key} label={f.label}>
                      <input
                        value={fields[f.key]}
                        onChange={set(f.key)}
                        placeholder={f.placeholder}
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "#ff6a3d")}
                        onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 14, padding: "9px 12px", borderRadius: 8, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={goBack} style={{
                padding: "11px 20px", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--surface)",
                fontSize: 14, fontWeight: 600, color: "var(--ink)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                ← Back
              </button>
            )}
            <button
              onClick={goNext}
              disabled={saving}
              style={{
                flex: 1, padding: "11px 20px", borderRadius: 10, border: "none",
                background: "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit", opacity: saving ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(255,61,136,.28)",
                transition: "opacity .15s, transform .15s",
              }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {saving ? "Saving…" : step === STEPS.length - 1 ? "Complete Setup ✓" : "Continue →"}
            </button>
          </div>

          {/* Skip link (only on optional last step) */}
          {step === STEPS.length - 1 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={handleComplete} disabled={saving} style={{
                background: "none", border: "none", fontSize: 12,
                color: "var(--ink-muted)", cursor: "pointer", fontFamily: "inherit",
              }}>
                Skip for now →
              </button>
            </div>
          )}
        </div>
      </div>

      </div> {/* end scroll container */}
    </>
  );
}
