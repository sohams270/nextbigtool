"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const card: React.CSSProperties = { background: "#fff", border: "1px solid #ececea", borderRadius: 14, padding: 20 };

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 11, cursor: "pointer",
        background: on ? "linear-gradient(90deg,#ff6a3d,#ff3d88)" : "#d8d8d4",
        position: "relative", flexShrink: 0, transition: "background 0.2s",
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: on ? 19 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

function Row({ title, sub, right }: { title: string; sub?: string; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f5f5f3" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f10" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "#9090a0", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 12 }}>{right}</div>
    </div>
  );
}

const btnOutline: React.CSSProperties = {
  padding: "5px 12px", borderRadius: 7, border: "1px solid #d8d8d4",
  background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#3a3a45",
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState("");
  const [notifs, setNotifs] = useState({ upvotes: true, comments: true, digest: true, featured: true, tips: false });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showEmail: false, allowDMs: true });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserEmail(user.email ?? "");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#9090a0", marginBottom: 4 }}>Account</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f0f10", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6b6b78", margin: 0 }}>Notifications, privacy, and account preferences.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Notifications */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 4px" }}>Notifications</h2>
            <p style={{ fontSize: 12.5, color: "#9090a0", margin: "0 0 12px" }}>Choose what we email you about.</p>
            <Row title="New upvotes on my products" sub="Get a daily digest of upvote activity."
              right={<Toggle on={notifs.upvotes} onChange={(v) => setNotifs(p => ({ ...p, upvotes: v }))} />} />
            <Row title="Comments on my products or posts" sub="Notified immediately when someone replies."
              right={<Toggle on={notifs.comments} onChange={(v) => setNotifs(p => ({ ...p, comments: v }))} />} />
            <Row title="Weekly Digest (subscriber email)" sub="The 5 tools worth checking this week."
              right={<Toggle on={notifs.digest} onChange={(v) => setNotifs(p => ({ ...p, digest: v }))} />} />
            <Row title="Newsletter feature approved" sub="When your submission is accepted for an issue."
              right={<Toggle on={notifs.featured} onChange={(v) => setNotifs(p => ({ ...p, featured: v }))} />} />
            <div style={{ borderBottom: "none" }}>
              <Row title="Product tips & launch advice" sub="Occasional tips to improve your launch."
                right={<Toggle on={notifs.tips} onChange={(v) => setNotifs(p => ({ ...p, tips: v }))} />} />
            </div>
          </div>

          {/* Privacy */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Privacy</h2>
            <Row title="Public profile" sub={`Show your profile at nextbigtool.com/@user`}
              right={<Toggle on={privacy.publicProfile} onChange={(v) => setPrivacy(p => ({ ...p, publicProfile: v }))} />} />
            <Row title="Show email on profile" sub="Only visible to logged-in users."
              right={<Toggle on={privacy.showEmail} onChange={(v) => setPrivacy(p => ({ ...p, showEmail: v }))} />} />
            <div style={{ borderBottom: "none" }}>
              <Row title="Allow DMs from Core+ users" sub="Let paid users message you directly."
                right={<Toggle on={privacy.allowDMs} onChange={(v) => setPrivacy(p => ({ ...p, allowDMs: v }))} />} />
            </div>
          </div>

          {/* Security */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Security</h2>
            <Row title="Password" sub="Last changed 3 months ago."
              right={<button style={btnOutline}>Change</button>} />
            <Row title="Two-factor authentication" sub="Protect your account with an authenticator app."
              right={<button style={btnOutline}>Enable</button>} />
            <div style={{ borderBottom: "none" }}>
              <Row title="Active sessions" sub="Sign out all devices"
                right={
                  <button onClick={handleSignOut} disabled={signingOut} style={{ ...btnOutline, color: signingOut ? "#9090a0" : "#3a3a45" }}>
                    {signingOut ? "Signing out…" : "Sign out all"}
                  </button>
                } />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Connected accounts */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Connected accounts</h2>
            {[
              { icon: "𝕏", bg: "#0e0e10", name: "X / Twitter",  sub: "Not connected",            action: "Connect" },
              { icon: "in", bg: "#2867b2", name: "LinkedIn",     sub: "Not connected",            action: "Connect" },
              { icon: "G",  bg: "#fff",    name: "Google",       sub: userEmail || "Connected",   action: "Disconnect", border: "1px solid #ececea" },
              { icon: "GH", bg: "#24292e", name: "GitHub",       sub: "Not connected",            action: "Connect" },
            ].map((acc) => (
              <div key={acc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f5f5f3" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: acc.bg, color: acc.bg === "#fff" ? "#0f0f10" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, border: acc.border, flexShrink: 0 }}>
                    {acc.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f0f10" }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: "#9090a0" }}>{acc.sub}</div>
                  </div>
                </div>
                <button style={{ ...btnOutline, color: acc.action === "Disconnect" ? "#6b6b78" : "#3a3a45" }}>{acc.action}</button>
              </div>
            ))}
          </div>

          {/* Preferences */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f0f10", margin: "0 0 12px" }}>Preferences</h2>
            <Row title="Theme" sub="System, light, or dark"
              right={
                <div style={{ display: "flex", background: "#f1f1ee", borderRadius: 8, padding: 3 }}>
                  {["Light", "Dark", "Auto"].map((t, i) => (
                    <div key={t} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: i === 0 ? "#fff" : "transparent", color: i === 0 ? "#0f0f10" : "#6b6b78" }}>{t}</div>
                  ))}
                </div>
              } />
            <Row title="Timezone" sub=""
              right={
                <select style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ececea", fontSize: 12, background: "#fff", fontFamily: "inherit" }}>
                  <option>UTC</option>
                  <option>Asia / Kolkata (UTC+5:30)</option>
                  <option>America / New_York (UTC-5)</option>
                </select>
              } />
            <div style={{ borderBottom: "none" }}>
              <Row title="Language" sub=""
                right={
                  <select style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ececea", fontSize: 12, background: "#fff", fontFamily: "inherit" }}>
                    <option>English</option>
                  </select>
                } />
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ ...card, border: "1.5px solid #ffd0d0" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#c23a3a", margin: "0 0 12px" }}>Danger zone</h2>
            <Row title="Export all my data" sub="Download products, posts, and interested-user data as JSON."
              right={<button style={btnOutline}>Export</button>} />
            <div style={{ borderBottom: "none" }}>
              <Row title="Delete account"
                sub="Permanently removes your products, posts, and profile."
                right={
                  <button style={{ ...btnOutline, color: "#c23a3a", borderColor: "#ffb3b3" }}>Delete</button>
                } />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
