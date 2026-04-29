"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DashTopbar from "@/app/components/DashTopbar";
import Btn from "@/app/components/Btn";

// ── Same CATEGORIES list as the submit form ───────────────────────────────────
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

// ── Same USE_CASES list as the submit form ────────────────────────────────────
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

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Parse pricing amount stored as "~$45/mo" in maker_comment */
function parsePricingAmount(mc: string | null): string {
  if (!mc) return "";
  const m = mc.match(/~\$(\d+(?:\.\d+)?)\//);
  return m ? m[1] : "";
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "var(--ink)", background: "var(--surface)",
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 6,
};
const hintSt: React.CSSProperties = { fontSize: 11, color: "var(--ink-muted)", marginTop: 4 };
const section: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "24px 28px", marginBottom: 16,
};

function SectionHeader({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#ff6a3d,#ff3d88)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{n}</span>
      {title}
      {sub && <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-muted)" }}>{sub}</span>}
    </div>
  );
}

function Field({ label, hint: h, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={lbl}>{label}{required && <span style={{ color: "#ff6a3d", marginLeft: 2 }}>*</span>}</label>
      {children}
      {h && <p style={hintSt}>{h}</p>}
    </div>
  );
}

// ── Use Case Picker (identical to submit form) ────────────────────────────────
function UseCasePicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
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
        style={{ ...inp, minHeight: 40, cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", padding: "6px 12px" }}
      >
        {selected.length === 0 && <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>Select use cases…</span>}
        {selected.map(u => (
          <span key={u} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FFE3D6", color: "#ff6a3d", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
            {u}
            <span style={{ cursor: "pointer", fontWeight: 800, lineHeight: 1 }}
              onClick={e => { e.stopPropagation(); onChange(selected.filter(x => x !== u)); }}>×</span>
          </span>
        ))}
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2.5"
          style={{ marginLeft: "auto", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200, maxHeight: 260, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-faint)" }}>
            <input autoFocus placeholder="Search use cases…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inp, padding: "6px 10px", fontSize: 12 }} onClick={e => e.stopPropagation()} />
          </div>
          <div style={{ overflowY: "auto", padding: 6 }}>
            {filtered.length === 0
              ? <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-muted)" }}>No matches</div>
              : filtered.map(u => (
                <button key={u} onClick={() => { onChange([...selected, u]); setSearch(""); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 7, border: "none", background: "transparent", fontSize: 12, color: "var(--ink)", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-alt)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >{u}</button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EditToolPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId]   = useState<string | null>(null);

  // Read-only
  const [toolName, setToolName] = useState("");
  const [toolUrl, setToolUrl]   = useState("");

  // (categories come from the shared CATEGORIES constant above)

  // Logo
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  // Product video
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // Screenshots (loaded from tools.screenshots array column)
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [newScreenshotFiles, setNewScreenshotFiles] = useState<File[]>([]);
  const [newScreenshotPreviews, setNewScreenshotPreviews] = useState<string[]>([]);
  const screenshotRef = useRef<HTMLInputElement>(null);

  // Use cases (stored as tags)
  const [useCases, setUseCases] = useState<string[]>([]);

  // Form fields — same as submit form
  const [form, setForm] = useState({
    tagline:        "",   // = "One-line Description"
    about:          "",   // = "About the Tool" (stored as description)
    category:       "",   // category name string (same as submit form)
    pricing:        "free" as "free" | "freemium" | "paid",
    pricing_amount: "",   // stored as maker_comment "~$X/mo"
    linkedin_url:   "",
    youtube_url:    "",
    instagram_url:  "",
    twitter_url:    "",
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // ── Load tool ───────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/"); return; }
      setUserId(user.id);

      const { data: tool, error: fetchErr } = await supabase
        .from("tools")
        .select(`
          id, name, website_url, tagline, description, logo_url,
          pricing, category_id, maker_comment, demo_url,
          twitter_url, linkedin_url, youtube_url, instagram_url,
          screenshots, submitter_id,
          categories(name),
          tool_tags(tags(name))
        `)
        .eq("id", id)
        .single();

      if (fetchErr || !tool) { router.push("/dashboard"); return; }
      if (tool.submitter_id !== user.id) { router.push("/dashboard"); return; }

      setToolName(tool.name);
      setToolUrl(tool.website_url ?? "");
      setExistingLogoUrl(tool.logo_url ?? null);
      setExistingVideoUrl(tool.demo_url ?? null);

      // Screenshots stored as array in tools.screenshots column
      const shots = (tool.screenshots as unknown as string[] | null) ?? [];
      setScreenshotUrls(shots);

      // Use cases stored as tags
      const tagRows = (tool.tool_tags as unknown as { tags: { name: string } | null }[] | null) ?? [];
      setUseCases(tagRows.map(r => r.tags?.name ?? "").filter(Boolean));

      // Resolve category name from the joined categories row
      const catName = (tool.categories as unknown as { name: string } | null)?.name ?? "";

      setForm({
        tagline:        tool.tagline       ?? "",
        about:          tool.description   ?? "",
        category:       catName,
        pricing:        (tool.pricing as "free" | "freemium" | "paid") ?? "free",
        pricing_amount: parsePricingAmount(tool.maker_comment ?? null),
        twitter_url:    tool.twitter_url   ?? "",
        linkedin_url:   tool.linkedin_url  ?? "",
        youtube_url:    tool.youtube_url   ?? "",
        instagram_url:  tool.instagram_url ?? "",
      });
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Screenshot helpers ─────────────────────────────────────────────────────
  const totalScreenshots = screenshotUrls.length + newScreenshotFiles.length;

  function removeExistingScreenshot(url: string) {
    setScreenshotUrls(p => p.filter(u => u !== url));
  }

  function handleScreenshotAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const toAdd = files.slice(0, 5 - totalScreenshots);
    setNewScreenshotFiles(p => [...p, ...toAdd]);
    setNewScreenshotPreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeNewScreenshot(i: number) {
    setNewScreenshotFiles(p => p.filter((_, idx) => idx !== i));
    setNewScreenshotPreviews(p => p.filter((_, idx) => idx !== i));
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!userId) return;
    setSaving(true); setError(""); setSuccess(false);

    try {
      const ts = Date.now();

      async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) return null;
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      }

      // 1. Logo
      let logo_url = existingLogoUrl;
      if (logoFile) {
        const ext  = logoFile.name.split(".").pop();
        logo_url = await uploadFile("tool-logos", `${userId}/${ts}-logo.${ext}`, logoFile);
      }

      // 2. Video
      let demo_url = existingVideoUrl;
      if (videoFile) {
        const ext = videoFile.name.split(".").pop();
        demo_url = await uploadFile("tool-logos", `${userId}/${ts}-video.${ext}`, videoFile);
      }

      // 3. New screenshots
      const allScreenshots = [...screenshotUrls];
      for (const file of newScreenshotFiles) {
        const ext = file.name.split(".").pop();
        const url = await uploadFile("tool-logos", `${userId}/${ts}-ss${allScreenshots.length}.${ext}`, file);
        if (url) allScreenshots.push(url);
      }

      // 4. Pricing note (same format as submit form)
      const maker_comment = (form.pricing !== "free" && form.pricing_amount)
        ? `~$${form.pricing_amount}/mo`
        : null;

      // 5. Upsert category by name (same as submit form) to get its UUID
      let category_id: string | null = null;
      if (form.category) {
        const { data: catRow } = await supabase
          .from("categories")
          .upsert({ name: form.category, slug: toSlug(form.category) }, { onConflict: "slug" })
          .select("id")
          .single();
        category_id = catRow?.id ?? null;
      }

      // 6. Update tool
      const { error: updateErr } = await supabase
        .from("tools")
        .update({
          tagline:       form.tagline,
          description:   form.about,
          logo_url,
          demo_url,
          pricing:       form.pricing,
          category_id,
          maker_comment,
          screenshots:   allScreenshots.length ? allScreenshots : null,
          twitter_url:   form.twitter_url   || null,
          linkedin_url:  form.linkedin_url  || null,
          youtube_url:   form.youtube_url   || null,
          instagram_url: form.instagram_url || null,
        })
        .eq("id", id);

      if (updateErr) throw new Error(updateErr.message);

      // 7. Use cases → sync tool_tags
      await supabase.from("tool_tags").delete().eq("tool_id", id);
      for (const uc of useCases) {
        const { data: tagRow } = await supabase
          .from("tags")
          .upsert({ slug: toSlug(uc), name: uc }, { onConflict: "slug" })
          .select("id").single();
        if (tagRow) await supabase.from("tool_tags").insert({ tool_id: id, tag_id: tagRow.id });
      }

      // Update local state
      setScreenshotUrls(allScreenshots);
      setNewScreenshotFiles([]); setNewScreenshotPreviews([]);
      if (logoFile)  { setExistingLogoUrl(logo_url);   setLogoFile(null);  setLogoPreview(null); }
      if (videoFile) { setExistingVideoUrl(demo_url);  setVideoFile(null); }
      setSuccess(true);
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
      <div style={{ flex: 1, overflow: "auto", padding: "28px 40px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* Read-only banner */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 3 }}>Product name</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{toolName}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 3 }}>Website URL</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{toolUrl}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>🔒 Name &amp; URL cannot be changed</span>
            </div>
          </div>

          {/* ── Section 1: Brand Assets ── */}
          <div style={section}>
            <SectionHeader n={1} title="Brand Assets" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 18 }}>
              {/* Logo */}
              <Field label="Brand Logo" required hint="PNG or JPG, min 200×200px">
                <div
                  onClick={() => logoRef.current?.click()}
                  style={{ width: 100, height: 100, borderRadius: 14, border: "1.5px dashed var(--border)", background: currentLogo ? "transparent" : "var(--surface-alt)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                >
                  {currentLogo
                    ? <img src={currentLogo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" style={{ marginBottom: 4 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <div style={{ fontSize: 10, color: "var(--ink-muted)", textAlign: "center" }}>Upload logo</div>
                    </>
                  }
                </div>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
              </Field>

              {/* Product Video */}
              <Field label="Product Video" hint="Optional — MP4 brand video (max 100MB)">
                <div
                  onClick={() => videoRef.current?.click()}
                  style={{ ...inp, minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-muted)", gap: 6, background: "var(--surface-alt)", textAlign: "center" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                >
                  {videoFile ? (
                    <>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00b87a" strokeWidth="2"><path d="M5 12l5 5 9-11"/></svg>
                      <div style={{ fontSize: 12, color: "var(--ink)" }}>{videoFile.name}</div>
                    </>
                  ) : existingVideoUrl ? (
                    <>
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#00b87a" strokeWidth="2"><path d="M5 12l5 5 9-11"/></svg>
                      <div style={{ fontSize: 12, color: "var(--ink)" }}>Video uploaded</div>
                      <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>Click to replace</div>
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
            <Field label="Product Screenshots" required hint={`Upload up to 5 screenshots (PNG or JPG) — ${totalScreenshots}/5`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {/* Existing */}
                {screenshotUrls.map((url, i) => (
                  <div key={url} style={{ position: "relative", aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removeExistingScreenshot(url)}
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  </div>
                ))}
                {/* New */}
                {newScreenshotPreviews.map((src, i) => (
                  <div key={`new-${i}`} style={{ position: "relative", aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", border: "1.5px dashed #ff6a3d" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => removeNewScreenshot(i)}
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  </div>
                ))}
                {/* Add */}
                {totalScreenshots < 5 && (
                  <div onClick={() => screenshotRef.current?.click()}
                    style={{ aspectRatio: "16/10", borderRadius: 8, border: "1.5px dashed var(--border)", background: "var(--surface-alt)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#ff6a3d"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>Add</div>
                  </div>
                )}
                <input ref={screenshotRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleScreenshotAdd} />
              </div>
            </Field>
          </div>

          {/* ── Section 2: Classification ── */}
          <div style={section}>
            <SectionHeader n={2} title="Classification" />

            <Field label="Category" required>
              <select style={{ ...inp, appearance: "none" }} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Use Cases" hint="Select all that apply">
              <UseCasePicker selected={useCases} onChange={setUseCases} />
            </Field>
          </div>

          {/* ── Section 3: About & Pricing ── */}
          <div style={section}>
            <SectionHeader n={3} title="About & Pricing" />

            <Field label="One-line Description" required hint={`${form.tagline.length}/100 characters`}>
              <input style={inp} maxLength={100} placeholder="The best way to do X for Y"
                value={form.tagline} onChange={e => set("tagline", e.target.value)} />
            </Field>

            <Field label="About the Tool" required hint={`${form.about.length}/700 characters — explain what it does and who it's for`}>
              <textarea style={{ ...inp, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
                maxLength={700}
                placeholder="Describe your product — what problem it solves, who benefits, and what makes it different…"
                value={form.about} onChange={e => set("about", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: form.pricing !== "free" ? "1fr 1fr" : "1fr", gap: 16 }}>
              <Field label="Pricing Model" required>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["free", "freemium", "paid"] as const).map(p => (
                    <button key={p} onClick={() => set("pricing", p)} style={{
                      flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: form.pricing === p ? "2px solid #ff6a3d" : "1px solid var(--border)",
                      background: form.pricing === p ? "#FFF0EB" : "var(--surface)",
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
                    value={form.pricing_amount} onChange={e => set("pricing_amount", e.target.value)} />
                </Field>
              )}
            </div>
          </div>

          {/* ── Section 4: Social Media Links ── */}
          <div style={section}>
            <SectionHeader n={4} title="Social Media Links" sub="— optional" />
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
                    <svg width={14} height={14} viewBox="0 0 24 24"><defs><radialGradient id="ig-edit" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig-edit)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
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

          {/* Error / success */}
          {error && (
            <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>{error}</div>
          )}
          {success && (
            <div style={{ fontSize: 12, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>✓ Changes saved successfully!</div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 48 }}>
            <Btn variant="ghostMuted" size="md" onClick={() => router.push("/dashboard")}>← Back to Dashboard</Btn>
            <Btn variant="primary" size="md" onClick={handleSave}>{saving ? "Saving…" : "Save changes"}</Btn>
          </div>

        </div>
      </div>
    </>
  );
}
