"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashTopbar from "@/app/components/DashTopbar";
import Btn from "@/app/components/Btn";

const CATEGORIES = [
  "AI Tools","Analytics & Monitoring","Automation & Workflow","Creator Economy",
  "Cybersecurity & Privacy","Data & Infrastructure","Design Tools","Developer Tools",
  "E-Commerce","Education & Learning","FinTech","Gaming & Game Dev",
  "Hardware & IoT","Health & Wellness","HR & Recruiting","Legal & Compliance",
  "Mobile Apps","No-Code / Low-Code","Open Source","Productivity & Notes",
  "Product Marketing","SEO & Content Marketing","Social Media & Influencer Tools",
  "Video & Audio Tools","Web3 / Blockchain","Website & Landing Page Builders",
  "Writing & Documentation",
];

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "var(--ink)", background: "var(--surface)",
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6,
};
const hint: React.CSSProperties = { fontSize: 11, color: "var(--ink-muted)", marginTop: 4 };

function Field({ label, hint: h, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={lbl}>{label}</label>
      {children}
      {h && <p style={hint}>{h}</p>}
    </div>
  );
}

export default function EditToolPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Read-only display
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl] = useState("");
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  // Editable fields
  const [form, setForm] = useState({
    tagline: "",
    description: "",
    category: "",
    pricing: "free" as "free" | "freemium" | "paid",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
    instagram_url: "",
    maker_comment: "",
    demo_url: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // Auth check + fetch tool
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const { data: tool, error: fetchErr } = await supabase
        .from("tools")
        .select("id, name, website_url, tagline, description, logo_url, pricing, category_id, twitter_url, linkedin_url, youtube_url, instagram_url, maker_comment, demo_url, submitter_id, categories(name)")
        .eq("id", id)
        .single();

      if (fetchErr || !tool) { router.push("/dashboard"); return; }
      // Only the owner can edit
      if (tool.submitter_id !== user.id) { router.push("/dashboard"); return; }

      setToolName(tool.name);
      setToolUrl(tool.website_url ?? "");
      setExistingLogoUrl(tool.logo_url ?? null);
      setForm({
        tagline:       tool.tagline       ?? "",
        description:   tool.description   ?? "",
        category:      (tool.categories as unknown as { name: string } | null)?.name ?? "",
        pricing:       (tool.pricing as "free" | "freemium" | "paid") ?? "free",
        twitter_url:   tool.twitter_url   ?? "",
        linkedin_url:  tool.linkedin_url  ?? "",
        youtube_url:   tool.youtube_url   ?? "",
        instagram_url: tool.instagram_url ?? "",
        maker_comment: tool.maker_comment ?? "",
        demo_url:      tool.demo_url      ?? "",
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // Upload new logo if provided
      let logo_url = existingLogoUrl;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}-logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("tool-logos").upload(path, logoFile, { upsert: true });
        if (!upErr) {
          logo_url = supabase.storage.from("tool-logos").getPublicUrl(path).data.publicUrl;
        }
      }

      // Upsert category if changed
      let category_id: string | null = null;
      if (form.category) {
        const slug = form.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const { data: catRow } = await supabase
          .from("categories")
          .upsert({ name: form.category, slug }, { onConflict: "slug" })
          .select("id").single();
        category_id = catRow?.id ?? null;
      }

      const { error: updateErr } = await supabase
        .from("tools")
        .update({
          tagline:       form.tagline,
          description:   form.description,
          logo_url,
          pricing:       form.pricing,
          category_id,
          twitter_url:   form.twitter_url   || null,
          linkedin_url:  form.linkedin_url  || null,
          youtube_url:   form.youtube_url   || null,
          instagram_url: form.instagram_url || null,
          maker_comment: form.maker_comment || null,
          demo_url:      form.demo_url      || null,
        })
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);
      setSuccess(true);
      if (logoFile) { setExistingLogoUrl(logo_url); setLogoFile(null); setLogoPreview(null); }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <DashTopbar title="Edit Product" subtitle="Loading…" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Loading product…</div>
        </div>
      </>
    );
  }

  const currentLogo = logoPreview ?? existingLogoUrl;

  return (
    <>
      <DashTopbar title="Edit Product" subtitle={toolName} />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 40px", background: "var(--surface-alt)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Read-only info banner */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            display: "flex", gap: 32,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 3 }}>Product name</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{toolName}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 3 }}>Website URL</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{toolUrl}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>🔒 Name &amp; URL cannot be changed</span>
            </div>
          </div>

          {/* Logo */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Logo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                onClick={() => logoRef.current?.click()}
                style={{
                  width: 72, height: 72, borderRadius: 12, overflow: "hidden",
                  border: "1.5px dashed var(--border)", background: "var(--surface-alt)",
                  cursor: "pointer", flexShrink: 0, position: "relative",
                }}
              >
                {currentLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentLogo} alt="logo" style={{ position: "absolute", top: "-15%", left: "-15%", width: "130%", height: "130%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "var(--border)" }}>+</div>
                )}
              </div>
              <div>
                <Btn variant="ghostMuted" size="sm" onClick={() => logoRef.current?.click()}>
                  {currentLogo ? "Change logo" : "Upload logo"}
                </Btn>
                <p style={{ ...hint, marginTop: 6 }}>Square PNG or JPG, min 200×200px</p>
              </div>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
            </div>
          </div>

          {/* Main details */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Product details</div>

            <Field label="Tagline *" hint={`${form.tagline.length}/60`}>
              <input style={inp} maxLength={60} placeholder="One sentence that sells your product"
                value={form.tagline} onChange={e => set("tagline", e.target.value)} />
            </Field>

            <Field label="Description *" hint="Tell the community what your product does and who it's for.">
              <textarea style={{ ...inp, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Describe your product in detail…"
                value={form.description} onChange={e => set("description", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Category">
                <select style={{ ...inp, appearance: "none" }} value={form.category} onChange={e => set("category", e.target.value)}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Pricing model">
                <select style={{ ...inp, appearance: "none" }} value={form.pricing} onChange={e => set("pricing", e.target.value as typeof form["pricing"])}>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </Field>
            </div>

            <Field label="Founder's note" hint="A personal message shown on your product page.">
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Why did you build this?"
                value={form.maker_comment} onChange={e => set("maker_comment", e.target.value)} />
            </Field>

            <Field label="Demo / product video URL" hint="YouTube or Loom">
              <input style={inp} type="url" placeholder="https://youtube.com/…"
                value={form.demo_url} onChange={e => set("demo_url", e.target.value)} />
            </Field>
          </div>

          {/* Social links */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Social links</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Twitter / X">
                <input style={inp} placeholder="@yourproduct" value={form.twitter_url} onChange={e => set("twitter_url", e.target.value)} />
              </Field>
              <Field label="LinkedIn">
                <input style={inp} type="url" placeholder="https://linkedin.com/…" value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} />
              </Field>
              <Field label="YouTube">
                <input style={inp} type="url" placeholder="https://youtube.com/…" value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} />
              </Field>
              <Field label="Instagram">
                <input style={inp} placeholder="@yourproduct" value={form.instagram_url} onChange={e => set("instagram_url", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Errors / success */}
          {error && (
            <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontSize: 12, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
              ✓ Changes saved successfully!
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 40 }}>
            <Btn variant="ghostMuted" size="md" onClick={() => router.push("/dashboard")}>← Back to Dashboard</Btn>
            <Btn variant="primary" size="md" onClick={handleSave}>
              {saving ? "Saving…" : "Save changes"}
            </Btn>
          </div>

        </div>
      </div>
    </>
  );
}
