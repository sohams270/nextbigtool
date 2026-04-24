"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5 };
const label: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: "#3a3a45" };
const input: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #ececea", fontSize: 13, color: "#0f0f10", fontFamily: "inherit", outline: "none", width: "100%" };

type Profile = {
  full_name: string;
  username: string;
  company: string;
  role: string;
  bio: string;
  website_url: string;
  twitter_url: string;
  linkedin_url: string;
  github_url?: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) setProfile(data as Partial<Profile>);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }));

  const fullName   = profile.full_name ?? "";
  const [first, ...rest] = fullName.split(" ");
  const initials   = (first?.[0] ?? "") + (rest[rest.length - 1]?.[0] ?? "");
  const username   = profile.username ?? "";

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Account</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>My Profile</h1>
          <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>This info appears on your product listings and public profile.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "0 14px", height: 36, borderRadius: 9, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12.5, fontWeight: 600, cursor: "pointer", color: "#3a3a45" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            background: "linear-gradient(90deg,#ff6a3d,#ff3d88)", border: "none", borderRadius: 9,
            padding: "0 18px", height: 36, fontSize: 12.5, fontWeight: 700, color: "#fff", cursor: "pointer",
          }}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Form */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 16px" }}>Personal details</h2>

          {/* Avatar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {initials.toUpperCase() || "?"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>Profile photo</div>
              <div style={{ fontSize: 12, color: "#9090a0", marginBottom: 10 }}>PNG or JPG, 400×400 recommended</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#3a3a45" }}>Upload</button>
                <button style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#9090a0" }}>Remove</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #ececea", paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={field}>
                <label style={label}>First name</label>
                <input value={first ?? ""} onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value + " " + (rest.join(" ") || "") }))} style={input} />
              </div>
              <div style={field}>
                <label style={label}>Last name</label>
                <input value={rest.join(" ") ?? ""} onChange={(e) => setProfile(p => ({ ...p, full_name: (first || "") + " " + e.target.value }))} style={input} />
              </div>
            </div>
            <div style={field}>
              <label style={label}>Email</label>
              <input value={userEmail} disabled style={{ ...input, background: "#fafaf9", color: "#9090a0" }} />
            </div>
            <div style={field}>
              <label style={label}>Username</label>
              <input value={username} onChange={set("username")} placeholder="yourhandle" style={input} />
              {username && <div style={{ fontSize: 11, color: "#9090a0" }}>nextbigtool.com/@{username}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={field}>
                <label style={label}>Company</label>
                <input value={profile.company ?? ""} onChange={set("company")} placeholder="Acme Inc." style={input} />
              </div>
              <div style={field}>
                <label style={label}>Role</label>
                <input value={profile.role ?? ""} onChange={set("role")} placeholder="Founder" style={input} />
              </div>
            </div>
            <div style={field}>
              <label style={label}>Bio</label>
              <textarea value={profile.bio ?? ""} onChange={set("bio")} rows={3} placeholder="Tell the community about yourself…" style={{ ...input, resize: "vertical" as const }} />
            </div>

            <div style={{ borderTop: "1px solid #ececea", paddingTop: 16 }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f0f10", margin: "0 0 14px" }}>Social links</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={field}>
                  <label style={label}>Website</label>
                  <input value={profile.website_url ?? ""} onChange={set("website_url")} placeholder="https://" style={input} />
                </div>
                <div style={field}>
                  <label style={label}>X / Twitter</label>
                  <input value={profile.twitter_url ?? ""} onChange={set("twitter_url")} placeholder="@username" style={input} />
                </div>
                <div style={field}>
                  <label style={label}>LinkedIn</label>
                  <input value={profile.linkedin_url ?? ""} onChange={set("linkedin_url")} placeholder="linkedin.com/in/" style={input} />
                </div>
                <div style={field}>
                  <label style={label}>GitHub</label>
                  <input value={profile.github_url ?? ""} onChange={(e) => setProfile(p => ({ ...p, github_url: e.target.value }))} placeholder="github.com/" style={input} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile preview */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f0f10", margin: "0 0 14px" }}>Profile preview</h3>
            <div style={{ border: "1px solid #ececea", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 auto 10px" }}>
                {initials.toUpperCase() || "?"}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{profile.full_name || "Your Name"}</div>
              <div style={{ fontSize: 12, color: "#9090a0" }}>
                {username ? `@${username} · ` : ""}{profile.role || "Maker"}{profile.company ? ` at ${profile.company}` : ""}
              </div>
              {profile.bio && (
                <div style={{ fontSize: 12.5, color: "#3a3a45", margin: "8px 0", lineHeight: 1.5 }}>{profile.bio.slice(0, 80)}{profile.bio.length > 80 ? "…" : ""}</div>
              )}
            </div>
          </div>

          {/* Verification */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Verification</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f3" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f10" }}>Email verified</div>
                <div style={{ fontSize: 12, color: "#9090a0" }}>{userEmail}</div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, background: "#e6f9f1", color: "#0a7a4f", fontSize: 11, fontWeight: 700 }}>Verified</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#0f0f10" }}>
                  Domain verified
                  <span style={{ padding: "2px 7px", borderRadius: 20, background: "#fff0eb", color: "#c04400", fontSize: 10, fontWeight: 700 }}>Core</span>
                </div>
                <div style={{ fontSize: 12, color: "#9090a0" }}>Connect a DNS record to show a ✓ on your listings.</div>
              </div>
              <button style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#3a3a45" }}>Connect</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
