"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Btn from "../../components/Btn";
import Link from "next/link";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const CATEGORIES = [
  "AI Tools","Analytics & Monitoring","Automation & Workflow","Baby Face",
  "Couple Photo","Creator Economy","Cybersecurity & Privacy","Data & Infrastructure",
  "Design Tools","Developer Tools","E-Commerce","Education & Learning",
  "FinTech","Food & Travel","Future Child","Gaming & Game Dev",
  "Hardware & IoT","Health & Wellness","HR & Recruiting","Legal & Compliance",
  "Mobile Apps","Mock Interview","No-Code / Low-Code","Open Source",
  "Photo Merger","Productivity & Notes","Product Marketing","SEO & Content Marketing",
  "Social Media & Influencer Tools","Video & Audio Tools","Web3 / Blockchain",
  "Website & Landing Page Builders","Writing & Documentation",
];

const USE_CASES = [
  "A/B Testing","AI Agents","AI Analytics","AI Automation","AI Code Assistant",
  "AI Marketing","AI Video Generation","AI Voice Generation","Analytics & Reporting",
  "API Development","Art Portfolio","Audio Editing","Authentication",
  "Book Recommendations","Bug Tracking","CI/CD","Code Development","Code Review",
  "Cold Call","Cold Email","Community Management","Competitor Analysis",
  "Contact Management","Content Creation","Content Promotion","Customer Support",
  "Data Analysis","Database Management","Data Enrichment","Data Integration",
  "Design & Prototyping","Digital Signage","Digital Signature","Documentation",
  "Email Campaigns","Email Management","Event Management","Fact Verifying",
  "Feedback Collection","File Conversion","File Sharing","File Storage",
  "Financial Planning For Startups","Form Building","Gear Organizer","Graphic Design",
  "Habit Building","Home Automation","Hosted Trivia","Hosting & Deployment",
  "Image Generation","Insurance Claims","Invoicing & Billing","Job Hunters",
  "Job Search","Journaling","Keyword Research","Knowledge Base","Landing Pages",
  "Lead Generation","Live Chat","LLM Security","Macro Tracking",
  "Meeting Transcription","Monitoring & Alerting","Network Printer Discovery",
  "Note-Taking","Offramping","Online Art Gallery","Online Shopping",
  "Payment Processing","Payroll","Photo Sharing","Price Comparison",
  "Printer Usage Monitoring","Product Launch","Professional Portfolio",
  "Project Management","Public Relations","Reading Insights","Receive Files via QR",
  "Reddit Marketing","Referral Programs","Runtime Threat Detection","Sales Quote",
  "Sales Roleplay","Scheduling & Booking","Screen Resumes","SEO Optimization",
  "Skill Building","Social Media Management","Software Comparison","Startup Naming",
  "Steps Tracking","Subscription Management","Task Management","Team Collaboration",
  "Testing & QA","Trading","Trip Planning","User Onboarding","Video Editing",
  "Video Hosting","Waitlist Management","Web Scraping","Website Management",
  "Website Performance","Website Security","Workflow Automation","Workout Tracking",
  "Writing & Copywriting",
];

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "var(--ink)", background: "var(--surface)",
};

const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6,
};

const hint: React.CSSProperties = {
  fontSize: 11, color: "var(--ink-muted)", marginTop: 4,
};

const section: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "24px 28px", marginBottom: 16,
};

function Field({ label, hint: h, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={lbl}>
        {label}{required && <span style={{ color: "#ff6a3d", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {h && <p style={hint}>{h}</p>}
    </div>
  );
}

function UseCasePicker({
  selected, onChange,
}: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function down(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  const filtered = USE_CASES.filter(u =>
    u.toLowerCase().includes(search.toLowerCase()) && !selected.includes(u)
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          ...inp, minHeight: 40, cursor: "pointer", display: "flex",
          flexWrap: "wrap", gap: 6, alignItems: "center", padding: "6px 12px",
        }}
      >
        {selected.length === 0 && (
          <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>Select use cases…</span>
        )}
        {selected.map(u => (
          <span key={u} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "var(--orange-soft)", color: "#ff6a3d",
            borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600,
          }}>
            {u}
            <span
              style={{ cursor: "pointer", fontWeight: 800, lineHeight: 1 }}
              onClick={(e) => { e.stopPropagation(); onChange(selected.filter(x => x !== u)); }}
            >×</span>
          </span>
        ))}
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2.5"
          style={{ marginLeft: "auto", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 200, maxHeight: 260, display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-faint)" }}>
            <input
              autoFocus
              placeholder="Search use cases…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inp, padding: "6px 10px", fontSize: 12 }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-muted)" }}>No matches</div>
            ) : filtered.map(u => (
              <button key={u} onClick={() => { onChange([...selected, u]); setSearch(""); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "7px 10px", borderRadius: 7, border: "none",
                  background: "transparent", fontSize: 12, color: "var(--ink)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-alt)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUploadBox({
  preview, onFile, label, hint: h,
}: { preview?: string | null; onFile: (f: File) => void; label: string; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width: "100%", minHeight: 100, border: "1.5px dashed var(--border)",
          borderRadius: 10, background: preview ? "transparent" : "var(--surface-alt)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden", position: "relative", transition: "border-color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
      >
        {preview ? (
          <img src={preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" style={{ marginBottom: 6 }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>{label}</div>
            {h && <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2 }}>{h}</div>}
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

export default function AddYourToolPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [yearly, setYearly] = useState(false);

  const [form, setForm] = useState({
    website_url: "",
    name: "",
    tagline: "",
    about: "",
    category: "",
    use_cases: [] as string[],
    pricing: "free" as "free" | "freemium" | "paid",
    pricing_amount: "",
    linkedin_url: "",
    youtube_url: "",
    instagram_url: "",
    twitter_url: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<{ file: File; preview: string }[]>([]);
  const videoRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);
    });
  }, []);

  function handleLogo(file: File) {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function addScreenshot(file: File) {
    if (screenshots.length >= 5) return;
    setScreenshots(prev => [...prev, { file, preview: URL.createObjectURL(file) }]);
  }

  function removeScreenshot(i: number) {
    setScreenshots(prev => prev.filter((_, idx) => idx !== i));
  }

  async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return null;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit() {
    if (!userId) return;
    const missing: string[] = [];
    if (!form.website_url) missing.push("Website URL");
    if (!form.name)        missing.push("Product Name");
    if (!form.tagline)     missing.push("One-line Description");
    if (!logoFile)         missing.push("Brand Logo");
    if (!form.category)    missing.push("Category");
    if (!form.about)       missing.push("About the Tool");
    if (screenshots.length === 0) missing.push("at least 1 Product Screenshot");
    if (missing.length > 0) {
      setError(`Please complete the following required fields: ${missing.join(", ")}.`);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const ts = Date.now();

      // Upload logo
      let logo_url: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        logo_url = await uploadFile("tool-logos", `${userId}/${ts}-logo.${ext}`, logoFile);
      }

      // Upload video
      let video_url: string | null = null;
      if (videoFile) {
        const ext = videoFile.name.split(".").pop();
        video_url = await uploadFile("tool-logos", `${userId}/${ts}-video.${ext}`, videoFile);
      }

      // Upload screenshots
      const screenshotUrls: string[] = [];
      for (let i = 0; i < screenshots.length; i++) {
        const f = screenshots[i].file;
        const ext = f.name.split(".").pop();
        const url = await uploadFile("tool-logos", `${userId}/${ts}-ss${i}.${ext}`, f);
        if (url) screenshotUrls.push(url);
      }

      // Upsert category
      let category_id: string | null = null;
      if (form.category) {
        const { data: catRow } = await supabase
          .from("categories")
          .upsert({ name: form.category, slug: toSlug(form.category) }, { onConflict: "slug" })
          .select("id")
          .single();
        category_id = catRow?.id ?? null;
      }

      const slug = toSlug(form.name) + "-" + ts.toString(36);
      const pricingNote = form.pricing_amount ? `~$${form.pricing_amount}/mo` : null;

      const { data: tool, error: toolErr } = await supabase
        .from("tools")
        .insert({
          submitter_id:  userId,
          slug,
          name:          form.name,
          tagline:       form.tagline,
          description:   form.about,
          website_url:   form.website_url,
          logo_url,
          pricing:       form.pricing,
          category_id,
          twitter_url:   form.twitter_url   || null,
          linkedin_url:  form.linkedin_url  || null,
          youtube_url:   form.youtube_url   || null,
          instagram_url: form.instagram_url || null,
          demo_url:      video_url          || null,
          screenshots:   screenshotUrls.length ? screenshotUrls : null,
          maker_comment: pricingNote,
          plan:          "free",
          status:        "pending",
          featured:      false,
        })
        .select("id")
        .single();

      if (toolErr) throw new Error(toolErr.message);

      // Save use cases as tags
      for (const uc of form.use_cases) {
        const { data: tagRow } = await supabase
          .from("tags")
          .upsert({ slug: toSlug(uc), name: uc }, { onConflict: "slug" })
          .select("id")
          .single();
        if (tagRow) {
          await supabase.from("tool_tags").insert({ tool_id: tool.id, tag_id: tagRow.id });
        }
      }

      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──
  if (done) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 40 }}>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚀</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>You&apos;re in the queue!</div>
          <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 28 }}>
            <strong style={{ color: "var(--ink)" }}>{form.name}</strong> has been submitted and is pending review.
            We&apos;ll notify you once it&apos;s live.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="primary" size="md" onClick={() => router.push("/dashboard")}>Go to Dashboard</Btn>
            <Btn variant="ghost" size="md" onClick={() => { setDone(false); setForm({ website_url: "", name: "", tagline: "", about: "", category: "", use_cases: [], pricing: "free", pricing_amount: "", linkedin_url: "", youtube_url: "", instagram_url: "", twitter_url: "" }); setLogoFile(null); setLogoPreview(null); setVideoFile(null); setScreenshots([]); }}>
              Submit another
            </Btn>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, overflow: "auto", padding: "28px 40px", background: "var(--bg)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>
            Add Your Tool
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            List your product
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
            Fill in the details below. Your listing will be reviewed within 24 hours.
          </p>
        </div>

        {/* ── Section 1: Basic Info ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>1</span>
            Basic Information
          </div>

          <Field label="Website URL" required>
            <input style={inp} type="url" placeholder="https://yourproduct.com"
              value={form.website_url} onChange={e => set("website_url", e.target.value)} />
          </Field>

          <Field label="Product Name" required>
            <input style={inp} placeholder="e.g. Raycast"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>
          <Field label="One-line Description" required hint={`${form.tagline.length}/100 characters`}>
            <input style={inp} maxLength={100} placeholder="The best way to do X for Y"
              value={form.tagline} onChange={e => set("tagline", e.target.value)} />
          </Field>
        </div>

        {/* ── Section 2: Brand Assets ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>2</span>
            Brand Assets
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 18 }}>
            <Field label="Brand Logo" required hint="PNG or JPG, min 200×200px">
              <div
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/png,image/jpeg,image/jpg";
                  input.onchange = (e) => {
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) handleLogo(f);
                  };
                  input.click();
                }}
                style={{
                  width: 100, height: 100, borderRadius: 14,
                  border: "1.5px dashed var(--border)",
                  background: logoPreview ? "transparent" : "var(--surface-alt)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", overflow: "hidden",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
              >
                {logoPreview
                  ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" style={{ marginBottom: 4 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <div style={{ fontSize: 10, color: "var(--ink-muted)", textAlign: "center" }}>Upload logo</div>
                  </>
                }
              </div>
            </Field>

            <Field label="Product Video" hint="Optional — MP4 brand video (max 100MB)">
              <div
                onClick={() => videoRef.current?.click()}
                style={{
                  ...inp, minHeight: 100, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  color: "var(--ink-muted)", gap: 6, background: "var(--surface-alt)",
                  textAlign: "center",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
              >
                {videoFile ? (
                  <>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00b87a" strokeWidth="2"><path d="M5 12l5 5 9-11"/></svg>
                    <div style={{ fontSize: 12, color: "var(--ink)" }}>{videoFile.name}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
                  </>
                ) : (
                  <>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Click to upload video</div>
                    <div style={{ fontSize: 10 }}>MP4 format</div>
                  </>
                )}
              </div>
              <input ref={videoRef} type="file" accept="video/mp4" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />
            </Field>
          </div>

          {/* Screenshots */}
          <Field label="Product Screenshots" required hint={`Upload up to 5 screenshots (PNG or JPG) — ${screenshots.length}/5`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {screenshots.map((s, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={s.preview} alt={`screenshot ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => removeScreenshot(i)}
                    style={{
                      position: "absolute", top: 4, right: 4, width: 20, height: 20,
                      borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none",
                      color: "#fff", fontSize: 11, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >×</button>
                </div>
              ))}
              {screenshots.length < 5 && (
                <div
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/png,image/jpeg,image/jpg";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) addScreenshot(f);
                    };
                    input.click();
                  }}
                  style={{
                    aspectRatio: "16/10", borderRadius: 8, border: "1.5px dashed var(--border)",
                    background: "var(--surface-alt)", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>Add</div>
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* ── Section 3: Classification ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>3</span>
            Classification
          </div>

          <Field label="Category" required>
            <select style={{ ...inp, appearance: "none" as const }} value={form.category}
              onChange={e => set("category", e.target.value)}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Use Cases" hint="Select all that apply">
            <UseCasePicker selected={form.use_cases} onChange={v => set("use_cases", v)} />
          </Field>
        </div>

        {/* ── Section 4: About & Pricing ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>4</span>
            About & Pricing
          </div>

          <Field label="About the Tool" required hint={`${form.about.length}/700 characters — explain what it does and who it's for`}>
            <textarea
              style={{ ...inp, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
              maxLength={700}
              placeholder="Describe your product — what problem it solves, who benefits, and what makes it different…"
              value={form.about}
              onChange={e => set("about", e.target.value)}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: form.pricing !== "free" ? "1fr 1fr" : "1fr", gap: 16 }}>
            <Field label="Pricing Model" required>
              <div style={{ display: "flex", gap: 8 }}>
                {(["free", "freemium", "paid"] as const).map(p => (
                  <button key={p} onClick={() => set("pricing", p)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: form.pricing === p ? "2px solid #ff6a3d" : "1px solid var(--border)",
                    background: form.pricing === p ? "var(--orange-soft)" : "var(--surface)",
                    color: form.pricing === p ? "#ff6a3d" : "var(--ink)",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                  }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </Field>
            {form.pricing !== "free" && (
              <Field label="Average monthly cost ($)" hint="e.g. 12 for $12/month">
                <input style={inp} type="number" min="0" placeholder="e.g. 12"
                  value={form.pricing_amount}
                  onChange={e => set("pricing_amount", e.target.value)} />
              </Field>
            )}
          </div>
        </div>

        {/* ── Section 5: Social Links ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>5</span>
            Social Media Links <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-muted)" }}>— optional</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="LinkedIn">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://linkedin.com/company/…"
                  value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} />
              </div>
            </Field>
            <Field label="YouTube">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://youtube.com/@…"
                  value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} />
              </div>
            </Field>
            <Field label="Instagram">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24"><defs><radialGradient id="ig-sub" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig-sub)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://instagram.com/…"
                  value={form.instagram_url} onChange={e => set("instagram_url", e.target.value)} />
              </div>
            </Field>
            <Field label="X / Twitter">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </span>
                <input style={{ ...inp, paddingLeft: 30 }} placeholder="@yourproduct"
                  value={form.twitter_url} onChange={e => set("twitter_url", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 9,
            background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
            fontSize: 13, color: "#dc2626", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Confirmation checkbox */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 20, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${confirmed ? "#ff6a3d" : "var(--border)"}`, background: confirmed ? "var(--orange-soft)" : "var(--surface)", transition: "all 0.15s" }}>
          <div style={{ position: "relative", flexShrink: 0, marginTop: 1 }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
            />
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `2px solid ${confirmed ? "#ff6a3d" : "var(--border)"}`,
              background: confirmed ? "#ff6a3d" : "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {confirmed && (
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11"/>
                </svg>
              )}
            </div>
          </div>
          <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
            I confirm I am the founder or authorised representative of this product and that the information provided is accurate.
          </span>
        </label>

        {/* Submit row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, gap: 12, flexWrap: "wrap" as const }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Priority review button */}
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                padding: "0 16px", height: 44, borderRadius: 10,
                border: "1.5px solid rgba(255,200,0,0.45)",
                background: "rgba(255,200,0,0.07)",
                color: "#b8860b", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap" as const, transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,200,0,0.14)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,200,0,0.7)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,200,0,0.07)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,200,0,0.45)"; }}
            >
              ⚡ Want priority review?
            </button>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !confirmed}
              style={{
                background: (!confirmed || submitting) ? "var(--border)" : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
                border: "none", borderRadius: 10, padding: "0 28px", height: 44,
                fontSize: 14, fontWeight: 700,
                color: (!confirmed || submitting) ? "var(--ink-muted)" : "#fff",
                cursor: (!confirmed || submitting) ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Submitting…
                </>
              ) : "🚀 Submit for Review"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Upgrade modal ── */}
      {showUpgrade && (
        <>
          <div onClick={() => setShowUpgrade(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,11,26,0.6)", zIndex: 1000 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            zIndex: 1001, width: "min(94vw, 700px)", maxHeight: "90vh", overflowY: "auto",
            background: "var(--surface)", borderRadius: 18,
            boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          }}>
            {/* Header */}
            <div style={{ padding: "24px 28px 0", position: "relative" }}>
              <button onClick={() => setShowUpgrade(false)} style={{ position: "absolute", top: 18, right: 20, background: "none", border: "none", fontSize: 18, color: "var(--ink-muted)", cursor: "pointer", lineHeight: 1, padding: 4 }}>✕</button>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#ff6a3d", marginBottom: 4 }}>⚡ Priority Review</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>Upgrade for faster visibility</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>Free submissions are reviewed within 48h. Upgrade to skip the queue and get featured placement.</div>

              {/* Monthly / Yearly toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? "var(--ink-muted)" : "var(--ink)" }}>Monthly</span>
                <button onClick={() => setYearly(v => !v)} style={{
                  width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
                  background: "#FF6B35", position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, left: yearly ? "calc(100% - 21px)" : 3,
                    transition: "left 0.2s",
                  }} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: yearly ? "var(--ink)" : "var(--ink-muted)" }}>Yearly</span>
                <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>Save 38%</span>
              </div>
            </div>

            {/* Plan cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "0 28px 28px" }}>

              {/* Basic */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 18px", background: "var(--surface-alt)", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ink-muted)", marginBottom: 8 }}>BASIC</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.03em" }}>$19</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8 }}>One-time per product. Pay once, keep forever.</div>
                <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.5, marginBottom: 16 }}>For founders who want more visibility and a boost on launch day.</div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ink-muted)", marginBottom: 10 }}>EVERYTHING IN FREE, PLUS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, marginBottom: 18 }}>
                  {["Featured for 48 hours on launch", "Featured in weekly newsletter (once)", "Re-launch option", "5 posts on Build in Public wall", "CSV export of your data"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(0,184,122,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#00B87A" strokeWidth="3"><path d="M5 12l5 5 9-11"/></svg>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "1.5px solid #FF6B35", background: "transparent", fontSize: 13, fontWeight: 700, color: "#FF6B35", cursor: "pointer", fontFamily: "inherit" }}>
                  Upgrade to Basic →
                </button>
              </div>

              {/* Core */}
              <div style={{ background: "#FF6B35", borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", position: "relative" }}>
                <div style={{ position: "absolute", top: -10, right: 14, background: "#fff", color: "#FF6B35", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>★ BEST VALUE</div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>CORE</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{yearly ? "$49" : "$79"}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>/month</span>
                </div>
                <div style={{ fontSize: 12, color: "#d1fae5", fontWeight: 600, marginBottom: 8 }}>
                  {yearly ? "Billed as $588/year" : "Or $49/month billed yearly — save $360/year."}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, marginBottom: 14 }}>For serious builders turning discovery into real pipeline and traction.</div>

                {/* Core exclusives panel */}
                <div style={{ background: "#0f0f10", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>★ CORE EXCLUSIVES</div>
                  {[
                    { title: "Founder CRM", desc: "See exactly who upvoted or followed your product. Turn interest into pipeline." },
                    { title: "Hall of Fame Placement", desc: "Permanent evergreen visibility that compounds over time." },
                  ].map(ex => (
                    <div key={ex.title} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 1 }}>{ex.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{ex.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>EVERYTHING IN BASIC, PLUS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, marginBottom: 18 }}>
                  {["One follow-up message per interested user", "Weekly newsletter placement", "Unlimited product listings", "Unlimited Build in Public posts", "1 featured blog post written about you"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5 9-11"/></svg>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "none", background: "#fff", fontSize: 13, fontWeight: 700, color: "#FF6B35", cursor: "pointer", fontFamily: "inherit" }}>
                  Upgrade to Core →
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "0 28px 20px", fontSize: 11, color: "var(--ink-muted)" }}>
              All plans include a 7-day money-back guarantee. Questions?{" "}
              <a href="mailto:hello@nextbigtool.com" style={{ color: "#ff6a3d", textDecoration: "none" }}>Contact us</a>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
