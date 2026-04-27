"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashTopbar from "../../components/DashTopbar";
import Btn from "../../components/Btn";
import Pill from "../../components/Pill";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const STEPS = ["URL", "Details", "Plan", "Launch"];

const PRICING_OPTIONS = ["free", "freemium", "paid", "contact"] as const;

const PLAN_OPTIONS = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    perks: ["Listed in directory", "Upvotes & comments", "Build-in-public wall"],
    highlight: false,
  },
  {
    id: "featured",
    label: "Featured",
    price: "$49",
    perks: ["Everything in Free", "Featured Today placement", "Rainbow border highlight", "Newsletter mention"],
    highlight: true,
  },
  {
    id: "hall_of_fame",
    label: "Hall of Fame",
    price: "$149",
    perks: ["Everything in Featured", "Permanent Hall of Fame listing", "Homepage sidebar placement", "Talk-to-us priority support"],
    highlight: false,
  },
] as const;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border)",
  borderRadius: 7,
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "var(--ink)",
  background: "var(--surface)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--ink)",
  display: "block",
  marginBottom: 5,
};

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#A8A8AD",
  marginTop: 4,
};

/* ─── sub-components ────────────────────────────────────────────────────────── */
function StepIndicator({ active }: { active: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {STEPS.map((s, i) => {
        const done = i < active;
        const cur  = i === active;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: done ? "#00B87A" : cur ? "#FF6B35" : "#fff",
                color: done || cur ? "#fff" : "var(--ink-muted)",
                border: `1.5px solid ${done ? "#00B87A" : cur ? "#FF6B35" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, flexShrink: 0,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: cur || done ? 700 : 500, color: cur ? "var(--ink)" : done ? "#00B87A" : "var(--ink-muted)", whiteSpace: "nowrap" }}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "#00B87A" : "var(--border)", margin: "0 12px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
      {children}
    </div>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────────────────── */
export default function SubmitPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep]       = useState(0);
  const [userId, setUserId]   = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone]       = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  // form data
  const [form, setForm] = useState({
    website_url:     "",
    name:            "",
    tagline:         "",
    description:     "",
    category_id:     "",
    pricing:         "free" as typeof PRICING_OPTIONS[number],
    tags:            [] as string[],
    contact_email:   "",
    maker_comment:   "",
    demo_url:        "",
    twitter_url:     "",
    github_url:      "",
    plan:            "free" as "free" | "featured" | "hall_of_fame",
    logo_file:       null as File | null,
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  /* auth guard */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
    });
  }, []);

  /* load categories */
  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  /* logo file pick */
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("logo_file", file);
    setLogoPreview(URL.createObjectURL(file));
  }

  /* tag helpers */
  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || form.tags.includes(tag) || form.tags.length >= 5) return;
    set("tags", [...form.tags, tag]);
    setTagInput("");
  }

  function removeTag(t: string) {
    set("tags", form.tags.filter((x) => x !== t));
  }

  /* submit */
  async function handleSubmit() {
    if (!userId) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // 1. upload logo if provided
      let logo_url: string | null = null;
      if (form.logo_file) {
        const ext  = form.logo_file.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("tool-logos")
          .upload(path, form.logo_file, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("tool-logos").getPublicUrl(path);
          logo_url = urlData.publicUrl;
        }
      }

      // 2. insert tool
      const slug = toSlug(form.name) + "-" + Date.now().toString(36);
      const { data: tool, error: toolErr } = await supabase
        .from("tools")
        .insert({
          submitter_id:   userId,
          slug,
          name:           form.name,
          tagline:        form.tagline,
          description:    form.description,
          website_url:    form.website_url,
          logo_url,
          pricing:        form.pricing,
          category_id:    form.category_id || null,
          contact_email:  form.contact_email,
          maker_comment:  form.maker_comment,
          demo_url:       form.demo_url || null,
          twitter_url:    form.twitter_url || null,
          github_url:     form.github_url || null,
          plan:           form.plan,
          status:         "pending",
          featured:       false,
        })
        .select("id")
        .single();

      if (toolErr) throw new Error(toolErr.message);

      // 3. insert tags (create tag rows if needed, then link)
      for (const tagName of form.tags) {
        const tagSlug = toSlug(tagName);
        // upsert tag
        const { data: tagRow } = await supabase
          .from("tags")
          .upsert({ slug: tagSlug, name: tagName }, { onConflict: "slug" })
          .select("id")
          .single();

        if (tagRow) {
          await supabase.from("tool_tags").insert({ tool_id: tool.id, tag_id: tagRow.id });
        }
      }

      setDone(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── done screen ───────────────────────────────────────────────────────── */
  if (done) {
    return (
      <>
        <DashTopbar title="Submit Your Tool" subtitle="Submission received" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-alt)" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>You're in the queue!</div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 24 }}>
              Your tool <strong style={{ color: "var(--ink)" }}>{form.name}</strong> has been submitted and is pending review.<br />
              We'll notify you at <strong style={{ color: "var(--ink)" }}>{form.contact_email}</strong> once it's live.
            </div>
            <Btn variant="primary" size="md" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Btn>
          </div>
        </div>
      </>
    );
  }

  /* ─── step views ────────────────────────────────────────────────────────── */
  return (
    <>
      <DashTopbar
        title="Submit Your Tool"
        subtitle={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
      />
      <div style={{ flex: 1, overflow: "auto", padding: "28px 40px", background: "var(--surface-alt)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <StepIndicator active={step} />

          {/* ── STEP 0: URL ── */}
          {step === 0 && (
            <Panel>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Start with your website</div>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 20, marginTop: 0 }}>
                Paste your product URL — we'll use it to identify your listing.
              </p>
              <FieldGroup label="Website URL">
                <input
                  style={inputStyle}
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={form.website_url}
                  onChange={(e) => set("website_url", e.target.value)}
                />
              </FieldGroup>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Btn
                  variant="primary" size="md"
                  onClick={() => form.website_url ? setStep(1) : null}
                >
                  Next: Product Details →
                </Btn>
              </div>
            </Panel>
          )}

          {/* ── STEP 1: DETAILS ── */}
          {step === 1 && (
            <Panel>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Product details</div>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 20, marginTop: 0 }}>
                This is what people see in the directory.
              </p>

              {/* Logo upload */}
              <FieldGroup label="Logo" hint="Square image, min 200×200px — PNG or JPG">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    onClick={() => logoRef.current?.click()}
                    style={{
                      width: 64, height: 64, borderRadius: 10,
                      border: "1.5px dashed #CFCFD4",
                      background: logoPreview ? "transparent" : "var(--surface-alt)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", overflow: "hidden", flexShrink: 0,
                    }}
                  >
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 22, color: "var(--border)" }}>+</span>}
                  </div>
                  <div>
                    <Btn variant="ghostMuted" size="sm" onClick={() => logoRef.current?.click()}>
                      {logoPreview ? "Change logo" : "Upload logo"}
                    </Btn>
                    <p style={{ ...hintStyle, marginTop: 6 }}>Click to browse or drag & drop</p>
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                </div>
              </FieldGroup>

              <FieldGroup label="Product name *">
                <input style={inputStyle} placeholder="e.g. Raycast" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </FieldGroup>

              <FieldGroup label="Tagline *" hint={`${form.tagline.length}/60 characters`}>
                <input
                  style={inputStyle} maxLength={60}
                  placeholder="One sentence that sells your product"
                  value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label="Description *" hint="Tell the community what your product does and who it's for.">
                <textarea
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
                  placeholder="Describe your product in detail..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </FieldGroup>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FieldGroup label="Category">
                  <select
                    style={{ ...inputStyle, appearance: "none" }}
                    value={form.category_id}
                    onChange={(e) => set("category_id", e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FieldGroup>

                <FieldGroup label="Pricing model">
                  <select
                    style={{ ...inputStyle, appearance: "none" }}
                    value={form.pricing}
                    onChange={(e) => set("pricing", e.target.value as typeof form["pricing"])}
                  >
                    {PRICING_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </FieldGroup>
              </div>

              <FieldGroup label="Tags" hint="Up to 5 tags — press Enter or comma to add">
                <div style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "6px 8px", background: "var(--surface)", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {form.tags.map((t) => (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFE3D6", color: "#FF6B35", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                      {t}
                      <span style={{ cursor: "pointer", fontWeight: 800, marginLeft: 2 }} onClick={() => removeTag(t)}>×</span>
                    </span>
                  ))}
                  {form.tags.length < 5 && (
                    <input
                      style={{ border: "none", outline: "none", fontSize: 12, fontFamily: "inherit", flex: 1, minWidth: 100, color: "var(--ink)" }}
                      placeholder="+ add tag…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                        if (e.key === "Backspace" && !tagInput) removeTag(form.tags[form.tags.length - 1]);
                      }}
                    />
                  )}
                </div>
              </FieldGroup>

              <div style={{ borderTop: "1px solid #EDEDEE", paddingTop: 16, marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Optional details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <FieldGroup label="Your contact email">
                    <input style={inputStyle} type="email" placeholder="you@email.com" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Demo video URL" hint="YouTube or Loom">
                    <input style={inputStyle} type="url" placeholder="https://youtube.com/…" value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Twitter / X">
                    <input style={inputStyle} placeholder="@yourproduct" value={form.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="GitHub repo">
                    <input style={inputStyle} placeholder="https://github.com/…" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Founder's note" hint="A personal message shown on your product page — tell the story behind it.">
                  <textarea
                    style={{ ...inputStyle, minHeight: 72, resize: "vertical", lineHeight: 1.6 }}
                    placeholder="Why did you build this? What problem does it solve?"
                    value={form.maker_comment}
                    onChange={(e) => set("maker_comment", e.target.value)}
                  />
                </FieldGroup>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <Btn variant="ghostMuted" size="md" onClick={() => setStep(0)}>← Back</Btn>
                <Btn
                  variant="primary" size="md"
                  onClick={() => (form.name && form.tagline && form.description) ? setStep(2) : null}
                >
                  Next: Choose Plan →
                </Btn>
              </div>
            </Panel>
          )}

          {/* ── STEP 2: PLAN ── */}
          {step === 2 && (
            <Panel>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Choose a plan</div>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 22, marginTop: 0 }}>
                You can upgrade anytime after launch.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PLAN_OPTIONS.map((plan) => {
                  const selected = form.plan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => set("plan", plan.id)}
                      style={{
                        border: `2px solid ${selected ? "#FF6B35" : "var(--border)"}`,
                        borderRadius: 10, padding: "16px 18px",
                        cursor: "pointer", background: selected ? "#FFF8F5" : "#fff",
                        transition: "all 0.15s",
                        position: "relative",
                      }}
                    >
                      {plan.highlight && (
                        <span style={{ position: "absolute", top: -10, right: 14, background: "#FF6B35", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em" }}>
                          POPULAR
                        </span>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%",
                            border: `2px solid ${selected ? "#FF6B35" : "var(--border)"}`,
                            background: selected ? "#FF6B35" : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--surface)" }} />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{plan.label}</span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: selected ? "#FF6B35" : "var(--ink)" }}>{plan.price}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 28 }}>
                        {plan.perks.map((p) => (
                          <div key={p} style={{ fontSize: 11, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#00B87A", fontWeight: 700 }}>✓</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <Btn variant="ghostMuted" size="md" onClick={() => setStep(1)}>← Back</Btn>
                <Btn variant="primary" size="md" onClick={() => setStep(3)}>Next: Review →</Btn>
              </div>
            </Panel>
          )}

          {/* ── STEP 3: REVIEW & LAUNCH ── */}
          {step === 3 && (
            <Panel>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Review & Launch</div>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 20, marginTop: 0 }}>
                Double-check your details before submitting.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  ["Product", form.name],
                  ["Tagline", form.tagline],
                  ["Website", form.website_url],
                  ["Pricing", form.pricing],
                  ["Plan", form.plan],
                  ["Tags", form.tags.join(", ") || "—"],
                  ["Contact email", form.contact_email || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 12, fontSize: 12 }}>
                    <span style={{ width: 110, flexShrink: 0, color: "var(--ink-muted)", fontWeight: 600 }}>{k}</span>
                    <span style={{ color: "var(--ink)", fontWeight: 500, wordBreak: "break-all" }}>{v}</span>
                  </div>
                ))}
              </div>

              {submitError && (
                <div style={{ fontSize: 11, color: "#DC2626", padding: "10px 12px", background: "#FEF2F2", borderRadius: 7, marginBottom: 14, lineHeight: 1.4 }}>
                  {submitError}
                </div>
              )}

              <div style={{ background: "#F9F9F9", borderRadius: 8, padding: "12px 14px", marginBottom: 18, fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                Your tool will be reviewed by the team before going live. Usually within 24 hours.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Btn variant="ghostMuted" size="md" onClick={() => setStep(2)}>← Back</Btn>
                <Btn variant="primary" size="md" onClick={handleSubmit}>
                  {submitting ? "Submitting…" : "🚀 Submit for Review"}
                </Btn>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
