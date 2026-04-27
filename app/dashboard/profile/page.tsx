"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── styles ─── */
const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--ink-muted)" };
const reqDot = <span style={{ color: "#ff6a3d", marginLeft: 2 }}>*</span>;

function inputSt(disabled?: boolean): React.CSSProperties {
  return {
    padding: "9px 12px", borderRadius: 9, fontSize: 13, color: "var(--ink)",
    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
    border: `1.5px solid var(--border)`,
    background: disabled ? "var(--surface-alt)" : "var(--surface)",
    cursor: disabled ? "not-allowed" : "text",
    transition: "border-color .15s",
  };
}

type Profile = {
  full_name: string;
  username: string;
  company: string;
  role: string;
  bio: string;
  website_url: string;
  twitter_url: string;
  linkedin_url: string;
  github_url: string;
  avatar_url: string;
  plan: string;
};

const ADMIN_EMAIL = "sohams270@gmail.com";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId]     = useState<string | null>(null);
  const [userEmail, setEmail]   = useState("");
  const [profile, setProfile]   = useState<Partial<Profile>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar]   = useState(false);

  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data as Partial<Profile>);
          if (data.avatar_url) setAvatarPreview(data.avatar_url);
        }
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(p => ({ ...p, [k]: e.target.value }));
    setErrors(er => { const n = { ...er }; delete n[k]; return n; });
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setErrors(er => ({ ...er, avatar: "Only JPG or PNG allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, avatar: "Max file size is 5MB." }));
      return;
    }
    setAvatarFile(file);
    setRemoveAvatar(false);
    setErrors(er => { const n = { ...er }; delete n.avatar; return n; });
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  function validate(): boolean {
    const fullName = profile.full_name ?? "";
    const [first, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ").trim();
    const errs: Record<string, string> = {};
    if (!first) errs.first_name = "First name is required.";
    if (!lastName) errs.last_name = "Last name is required.";
    if (!profile.username?.trim()) errs.username = "Username is required.";
    else if (!/^[a-z0-9_]{2,30}$/.test(profile.username.trim())) errs.username = "2–30 chars: lowercase letters, numbers, underscores only.";
    if (!profile.company?.trim()) errs.company = "Company is required.";
    if (!profile.role?.trim()) errs.role = "Role is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!userId || !validate()) return;
    setSaving(true);
    let avatarUrl = profile.avatar_url ?? null;

    if (avatarFile) {
      setUploadProgress(true);
      const ext  = avatarFile.name.split(".").pop();
      const path = `${userId}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
      setUploadProgress(false);
      if (upErr) { setErrors({ avatar: "Upload failed. Please try again." }); setSaving(false); return; }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrl;
    } else if (removeAvatar) {
      avatarUrl = null;
    }

    const { error: saveErr } = await supabase.from("profiles").update({
      full_name:    profile.full_name?.trim() ?? "",
      username:     profile.username?.trim().toLowerCase() ?? "",
      company:      profile.company?.trim() ?? "",
      role:         profile.role?.trim() ?? "",
      bio:          profile.bio?.trim() || null,
      website_url:  profile.website_url?.trim() || null,
      twitter_url:  profile.twitter_url?.trim() || null,
      linkedin_url: profile.linkedin_url?.trim() || null,
      github_url:   profile.github_url?.trim() || null,
      avatar_url:   avatarUrl,
    }).eq("id", userId);

    if (saveErr) {
      console.error("Profile save error:", saveErr);
      setErrors({ save: saveErr.message });
      setSaving(false);
      return;
    }

    setProfile(p => ({ ...p, avatar_url: avatarUrl ?? undefined }));
    setAvatarFile(null);
    setSaving(false); setSaved(true);
    window.dispatchEvent(new Event("profileUpdated"));
    setTimeout(() => setSaved(false), 2500);
  }

  /* derived */
  const fullName  = profile.full_name ?? "";
  const [first, ...restName] = fullName.split(" ");
  const lastName  = restName.join(" ");
  const username  = profile.username ?? "";
  const planRaw   = userEmail === ADMIN_EMAIL ? "core" : (profile.plan ?? "free");
  const plan      = planRaw.toLowerCase() as "free" | "basic" | "core";

  const planMeta: Record<string, { label: string; color: string; bg: string }> = {
    free:  { label: "Free",  color: "var(--ink-muted)",  bg: "var(--surface-alt)" },
    basic: { label: "Basic", color: "#3b7fff",            bg: "rgba(59,127,255,.1)" },
    core:  { label: "Core",  color: "#ff6a3d",            bg: "rgba(255,106,61,.12)" },
  };
  const pm = planMeta[plan] ?? planMeta.free;

  const initials = ((first?.[0] ?? "") + (restName[restName.length - 1]?.[0] ?? "")).toUpperCase() || "?";

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = "#ff6a3d");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.currentTarget.style.borderColor = errors[e.currentTarget.name ?? ""] ? "#dc2626" : "var(--border)");

  function ErrMsg({ k }: { k: string }) {
    return errors[k] ? <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>{errors[k]}</span> : null;
  }

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>Account</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>My Profile</h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>This info appears on your product listings and public profile.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setProfile(p => ({ ...p })); setErrors({}); }}
            style={{ padding: "0 14px", height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "transparent", fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: "var(--ink)", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saving ? "var(--surface-alt)" : "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 9, padding: "0 18px", height: 36, fontSize: 12.5, fontWeight: 700, color: saving ? "var(--ink-muted)" : "#fff", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "opacity .15s" }}>
            {saved ? "✓ Saved!" : saving ? (uploadProgress ? "Uploading…" : "Saving…") : "Save changes"}
          </button>
        </div>
      </div>

      {errors.save && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 9, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
          Save failed: {errors.save}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* ── Form ── */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 20px" }}>Personal details</h2>

          {/* Avatar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2, color: "var(--ink)" }}>Profile photo</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 10 }}>PNG or JPG, 400×400 recommended · Max 5MB</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={handleFileChange} />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--ink)", fontFamily: "inherit" }}>
                  {avatarPreview ? "Change photo" : "Upload"}
                </button>
                {avatarPreview && (
                  <button
                    onClick={handleRemoveAvatar}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#dc2626", fontFamily: "inherit" }}>
                    Remove
                  </button>
                )}
              </div>
              {errors.avatar && <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 4 }}>{errors.avatar}</div>}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-faint)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={field}>
                <label style={labelStyle}>First name {reqDot}</label>
                <input
                  name="first_name"
                  value={first ?? ""}
                  onChange={e => { setProfile(p => ({ ...p, full_name: e.target.value + " " + (restName.join(" ") || "") })); setErrors(er => { const n = { ...er }; delete n.first_name; return n; }); }}
                  style={{ ...inputSt(), borderColor: errors.first_name ? "#dc2626" : "var(--border)" }}
                  placeholder="First name"
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <ErrMsg k="first_name" />
              </div>
              <div style={field}>
                <label style={labelStyle}>Last name {reqDot}</label>
                <input
                  name="last_name"
                  value={lastName}
                  onChange={e => { setProfile(p => ({ ...p, full_name: (first || "") + " " + e.target.value })); setErrors(er => { const n = { ...er }; delete n.last_name; return n; }); }}
                  style={{ ...inputSt(), borderColor: errors.last_name ? "#dc2626" : "var(--border)" }}
                  placeholder="Last name"
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <ErrMsg k="last_name" />
              </div>
            </div>

            {/* Email */}
            <div style={field}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: "relative" }}>
                <input value={userEmail} disabled style={{ ...inputSt(true), paddingRight: 90 }} />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "2px 9px", borderRadius: 20, background: "#e6f9f1", color: "#0a7a4f", fontSize: 11, fontWeight: 700 }}>
                  ✓ Verified
                </span>
              </div>
            </div>

            {/* Username */}
            <div style={field}>
              <label style={labelStyle}>Username {reqDot}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--ink-muted)", fontWeight: 600 }}>@</span>
                <input
                  name="username"
                  value={username}
                  onChange={set("username")}
                  placeholder="yourhandle"
                  style={{ ...inputSt(), paddingLeft: 26, borderColor: errors.username ? "#dc2626" : "var(--border)" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
              {username && !errors.username && <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>nextbigtool.com/@{username}</div>}
              <ErrMsg k="username" />
            </div>

            {/* Company + Role */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={field}>
                <label style={labelStyle}>Company {reqDot}</label>
                <input
                  name="company"
                  value={profile.company ?? ""}
                  onChange={set("company")}
                  placeholder="Acme Inc."
                  style={{ ...inputSt(), borderColor: errors.company ? "#dc2626" : "var(--border)" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <ErrMsg k="company" />
              </div>
              <div style={field}>
                <label style={labelStyle}>Role {reqDot}</label>
                <input
                  name="role"
                  value={profile.role ?? ""}
                  onChange={set("role")}
                  placeholder="Founder"
                  style={{ ...inputSt(), borderColor: errors.role ? "#dc2626" : "var(--border)" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <ErrMsg k="role" />
              </div>
            </div>

            {/* Bio */}
            <div style={field}>
              <label style={labelStyle}>Bio <span style={{ color: "var(--ink-faint)", fontWeight: 500 }}>— optional</span></label>
              <textarea
                value={profile.bio ?? ""}
                onChange={set("bio")}
                rows={3}
                placeholder="Tell the community about yourself…"
                style={{ ...inputSt(), resize: "vertical" }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            {/* Social links */}
            <div style={{ borderTop: "1px solid var(--border-faint)", paddingTop: 16 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>
                Social links <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 500 }}>— optional</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Website",    key: "website_url",  ph: "https://" },
                  { label: "X / Twitter", key: "twitter_url", ph: "@username" },
                  { label: "LinkedIn",   key: "linkedin_url", ph: "linkedin.com/in/" },
                  { label: "GitHub",     key: "github_url",   ph: "github.com/" },
                ].map(f => (
                  <div key={f.key} style={field}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      value={(profile as Record<string, string>)[f.key] ?? ""}
                      onChange={set(f.key as keyof Profile)}
                      placeholder={f.ph}
                      style={inputSt()}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile preview */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>Profile preview</h3>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 auto 10px", border: "2px solid var(--border)" }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, color: "var(--ink)" }}>{profile.full_name || "Your Name"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8 }}>
                {username ? `@${username} · ` : ""}{profile.role || "Maker"}{profile.company ? ` at ${profile.company}` : ""}
              </div>
              {/* Plan badge */}
              <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: pm.color, background: pm.bg, letterSpacing: "0.04em" }}>
                {pm.label} plan
              </span>
            </div>

            {/* Upgrade CTA */}
            {plan !== "core" && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                  {plan === "free" ? "Unlock more features" : "Go further with Core"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {plan === "free" && (
                    <Link href="/dashboard/plan" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, fontWeight: 600, color: "var(--ink)", cursor: "pointer", fontFamily: "inherit" }}>
                        Upgrade to Basic — $19
                      </button>
                    </Link>
                  )}
                  <Link href="/dashboard/plan" style={{ textDecoration: "none" }}>
                    <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                      Upgrade to Core — $79/mo
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Verification */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: "0 0 12px" }}>Verification</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Email verified</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{userEmail}</div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#e6f9f1", color: "#0a7a4f", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓ Verified</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
