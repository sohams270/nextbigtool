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
    if (!form.name || !form.tagline || !form.website_url || !form.category || !form.about) {
      setError("Please fill in all required fields.");
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Product Name" required>
              <input style={inp} placeholder="e.g. Raycast"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </Field>
            <Field label="One-line Description" required hint={`${form.tagline.length}/80 characters`}>
              <input style={inp} maxLength={80} placeholder="The best way to do X for Y"
                value={form.tagline} onChange={e => set("tagline", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Brand Assets ── */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>2</span>
            Brand Assets
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 18 }}>
            <Field label="Brand Logo" hint="PNG or JPG, min 200×200px">
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
          <Field label="Product Screenshots" hint={`Upload up to 5 screenshots (PNG or JPG) — ${screenshots.length}/5`}>
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

          <Field label="About the Tool" required hint={`${form.about.length}/400 characters — explain what it does and who it's for`}>
            <textarea
              style={{ ...inp, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
              maxLength={400}
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
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔗</span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://linkedin.com/company/…"
                  value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} />
              </div>
            </Field>
            <Field label="YouTube">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>▶️</span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://youtube.com/@…"
                  value={form.youtube_url} onChange={e => set("youtube_url", e.target.value)} />
              </div>
            </Field>
            <Field label="Instagram">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>📸</span>
                <input style={{ ...inp, paddingLeft: 30 }} type="url" placeholder="https://instagram.com/…"
                  value={form.instagram_url} onChange={e => set("instagram_url", e.target.value)} />
              </div>
            </Field>
            <Field label="X / Twitter">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>𝕏</span>
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

        {/* Submit */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to dashboard
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || !confirmed}
            style={{
              background: (!confirmed || submitting) ? "var(--border)" : "linear-gradient(90deg,#ff6a3d,#ff3d88)",
              border: "none", borderRadius: 10, padding: "0 28px", height: 44,
              fontSize: 14, fontWeight: 700, color: (!confirmed || submitting) ? "var(--ink-muted)" : "#fff",
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
