"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashTopbar from "@/app/components/DashTopbar";
import Btn from "@/app/components/Btn";

// Categories loaded from DB — no hardcoded list needed

const PRICING_OPTIONS = ["free", "freemium", "paid", "contact"] as const;

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "var(--ink)", background: "var(--surface)",
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6,
};
const hint: React.CSSProperties = { fontSize: 11, color: "var(--ink-muted)", marginTop: 4 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

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

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [userId, setUserId]     = useState<string | null>(null);

  // Categories from DB (same source as the submit form)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Read-only display
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl]   = useState("");

  // Logo
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile]   = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  // Screenshots
  const [existingScreenshots, setExistingScreenshots] = useState<{ id: string; url: string; position: number }[]>([]);
  const [deletedScreenshotIds, setDeletedScreenshotIds] = useState<string[]>([]);
  const [newScreenshotFiles, setNewScreenshotFiles] = useState<File[]>([]);
  const [newScreenshotPreviews, setNewScreenshotPreviews] = useState<string[]>([]);
  const screenshotRef = useRef<HTMLInputElement>(null);

  // Tags
  const [tags, setTags]       = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Main form
  const [form, setForm] = useState({
    tagline:       "",
    description:   "",
    category_id:   "",
    pricing:       "free" as typeof PRICING_OPTIONS[number],
    contact_email: "",
    demo_url:      "",
    maker_comment: "",
    twitter_url:   "",
    github_url:    "",
    linkedin_url:  "",
    youtube_url:   "",
    instagram_url: "",
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // ── Load categories from DB (same source as submit form) ───────────────────
  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load tool data ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const { data: tool, error: fetchErr } = await supabase
        .from("tools")
        .select(`
          id, name, website_url, tagline, description, logo_url,
          pricing, category_id, contact_email,
          twitter_url, linkedin_url, youtube_url, instagram_url,
          github_url, maker_comment, demo_url, submitter_id,
          tool_tags(tags(name)),
          screenshots(id, url, position)
        `)
        .eq("id", id)
        .single();

      if (fetchErr || !tool) { router.push("/dashboard"); return; }
      if (tool.submitter_id !== user.id) { router.push("/dashboard"); return; }

      setToolName(tool.name);
      setToolUrl(tool.website_url ?? "");
      setExistingLogoUrl(tool.logo_url ?? null);

      // Load screenshots
      const shots = (tool.screenshots as unknown as { id: string; url: string; position: number }[] | null) ?? [];
      setExistingScreenshots(shots.sort((a, b) => a.position - b.position));

      // Load tags
      const tagRows = (tool.tool_tags as unknown as { tags: { name: string } | null }[] | null) ?? [];
      setTags(tagRows.map(r => r.tags?.name ?? "").filter(Boolean));

      setForm({
        tagline:       tool.tagline       ?? "",
        description:   tool.description   ?? "",
        category_id:   tool.category_id   ?? "",   // UUID — matches the DB select options
        pricing:       (tool.pricing as typeof PRICING_OPTIONS[number]) ?? "free",
        contact_email: (tool as unknown as { contact_email?: string }).contact_email ?? "",
        twitter_url:   tool.twitter_url   ?? "",
        linkedin_url:  tool.linkedin_url  ?? "",
        youtube_url:   tool.youtube_url   ?? "",
        instagram_url: tool.instagram_url ?? "",
        github_url:    (tool as unknown as { github_url?: string }).github_url ?? "",
        maker_comment: tool.maker_comment ?? "",
        demo_url:      tool.demo_url      ?? "",
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Screenshot helpers ─────────────────────────────────────────────────────
  const totalScreenshots = existingScreenshots.filter(s => !deletedScreenshotIds.includes(s.id)).length + newScreenshotFiles.length;

  function handleScreenshotAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - totalScreenshots;
    const toAdd = files.slice(0, remaining);
    setNewScreenshotFiles(p => [...p, ...toAdd]);
    setNewScreenshotPreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeExistingScreenshot(shotId: string) {
    setDeletedScreenshotIds(p => [...p, shotId]);
  }

  function removeNewScreenshot(i: number) {
    setNewScreenshotFiles(p => p.filter((_, idx) => idx !== i));
    setNewScreenshotPreviews(p => p.filter((_, idx) => idx !== i));
  }

  // ── Tag helpers ────────────────────────────────────────────────────────────
  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    setTags(t => [...t, tag]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(p => p.filter(x => x !== t));
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Logo upload
      let logo_url = existingLogoUrl;
      if (logoFile) {
        const ext  = logoFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}-logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("tool-logos").upload(path, logoFile, { upsert: true });
        if (!upErr) logo_url = supabase.storage.from("tool-logos").getPublicUrl(path).data.publicUrl;
      }

      // 2. Update tool (category_id is already a UUID from the DB select)
      const { error: updateErr } = await supabase
        .from("tools")
        .update({
          tagline:       form.tagline,
          description:   form.description,
          logo_url,
          pricing:       form.pricing,
          category_id:   form.category_id || null,
          contact_email: form.contact_email || null,
          twitter_url:   form.twitter_url   || null,
          linkedin_url:  form.linkedin_url  || null,
          youtube_url:   form.youtube_url   || null,
          instagram_url: form.instagram_url || null,
          github_url:    form.github_url    || null,
          maker_comment: form.maker_comment || null,
          demo_url:      form.demo_url      || null,
        })
        .eq("id", id);
      if (updateErr) throw new Error(updateErr.message);

      // 4. Tags — delete all existing, re-insert
      await supabase.from("tool_tags").delete().eq("tool_id", id);
      for (const tagName of tags) {
        const tagSlug = toSlug(tagName);
        const { data: tagRow } = await supabase
          .from("tags")
          .upsert({ slug: tagSlug, name: tagName }, { onConflict: "slug" })
          .select("id").single();
        if (tagRow) await supabase.from("tool_tags").insert({ tool_id: id, tag_id: tagRow.id });
      }

      // 5. Delete removed screenshots
      for (const shotId of deletedScreenshotIds) {
        await supabase.from("screenshots").delete().eq("id", shotId);
      }
      setDeletedScreenshotIds([]);
      setExistingScreenshots(p => p.filter(s => !deletedScreenshotIds.includes(s.id)));

      // 6. Upload new screenshots
      let position = existingScreenshots.filter(s => !deletedScreenshotIds.includes(s.id)).length;
      for (const file of newScreenshotFiles) {
        const ext  = file.name.split(".").pop();
        const path = `${userId}/screenshots/${id}/${Date.now()}-${position}.${ext}`;
        const { error: scErr } = await supabase.storage.from("tool-logos").upload(path, file, { upsert: true });
        if (!scErr) {
          const { data: scUrl } = supabase.storage.from("tool-logos").getPublicUrl(path);
          const { data: newShot } = await supabase
            .from("screenshots")
            .insert({ tool_id: id, url: scUrl.publicUrl, position })
            .select("id, url, position").single();
          if (newShot) setExistingScreenshots(p => [...p, newShot]);
          position++;
        }
      }
      setNewScreenshotFiles([]);
      setNewScreenshotPreviews([]);

      if (logoFile) { setExistingLogoUrl(logo_url); setLogoFile(null); setLogoPreview(null); }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
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
  const visibleExisting = existingScreenshots.filter(s => !deletedScreenshotIds.includes(s.id));

  return (
    <>
      <DashTopbar title="Edit Product" subtitle={toolName} />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 40px", background: "var(--surface-alt)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* ── Read-only banner ── */}
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

          {/* ── Logo ── */}
          <Section title="Logo">
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
                  <img src={currentLogo} alt="logo" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
          </Section>

          {/* ── Product details ── */}
          <Section title="Product details">
            <Field label="Tagline *" hint={`${form.tagline.length}/60 characters`}>
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
                <select style={{ ...inp, appearance: "none" }} value={form.category_id} onChange={e => set("category_id", e.target.value)}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Pricing model">
                <select style={{ ...inp, appearance: "none" }} value={form.pricing} onChange={e => set("pricing", e.target.value as typeof form["pricing"])}>
                  {PRICING_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Tags" hint="Up to 5 tags — press Enter or comma to add">
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {tags.map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFE3D6", color: "#FF6B35", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                    {t}
                    <span style={{ cursor: "pointer", fontWeight: 800 }} onClick={() => removeTag(t)}>×</span>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    style={{ border: "none", outline: "none", fontSize: 12, fontFamily: "inherit", flex: 1, minWidth: 100, color: "var(--ink)", background: "transparent" }}
                    placeholder="+ add tag…"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                      if (e.key === "Backspace" && !tagInput) removeTag(tags[tags.length - 1]);
                    }}
                  />
                )}
              </div>
            </Field>

            <Field label="Founder's note" hint="A personal message shown on your product page.">
              <textarea style={{ ...inp, minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Why did you build this?"
                value={form.maker_comment} onChange={e => set("maker_comment", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Demo / product video URL" hint="YouTube or Loom">
                <input style={inp} type="url" placeholder="https://youtube.com/…"
                  value={form.demo_url} onChange={e => set("demo_url", e.target.value)} />
              </Field>
              <Field label="Contact email">
                <input style={inp} type="email" placeholder="you@email.com"
                  value={form.contact_email} onChange={e => set("contact_email", e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Screenshots ── */}
          <Section title="Product screenshots">
            <p style={{ ...hint, marginBottom: 14, marginTop: -8 }}>Up to 5 screenshots (PNG or JPG) — {totalScreenshots}/5 added</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
              {/* Existing */}
              {visibleExisting.map(shot => (
                <div key={shot.id} style={{ position: "relative", width: 110, height: 76, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => removeExistingScreenshot(shot.id)}
                    style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >×</button>
                </div>
              ))}
              {/* New previews */}
              {newScreenshotPreviews.map((src, i) => (
                <div key={`new-${i}`} style={{ position: "relative", width: 110, height: 76, borderRadius: 8, overflow: "hidden", border: "1.5px dashed #FF6B35", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button
                    onClick={() => removeNewScreenshot(i)}
                    style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                  >×</button>
                </div>
              ))}
              {/* Add button */}
              {totalScreenshots < 5 && (
                <div
                  onClick={() => screenshotRef.current?.click()}
                  style={{ width: 110, height: 76, borderRadius: 8, border: "1.5px dashed #CFCFD4", background: "var(--surface-alt)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}
                >
                  <span style={{ fontSize: 20, color: "var(--border)" }}>+</span>
                  <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>Add</span>
                </div>
              )}
              <input ref={screenshotRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleScreenshotAdd} />
            </div>
          </Section>

          {/* ── Social links ── */}
          <Section title="Social links — optional">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Twitter / X">
                <input style={inp} placeholder="@yourproduct" value={form.twitter_url} onChange={e => set("twitter_url", e.target.value)} />
              </Field>
              <Field label="GitHub repo">
                <input style={inp} placeholder="https://github.com/…" value={form.github_url} onChange={e => set("github_url", e.target.value)} />
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
          </Section>

          {/* ── Errors / success ── */}
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

          {/* ── Actions ── */}
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
