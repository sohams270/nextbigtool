import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReviewButtons from "./ReviewButtons";
import SubmissionButtons from "./SubmissionButtons";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

type NewsletterSubmission = {
  id: string;
  headline: string;
  story: string;
  link: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
  tools: { name: string } | null;
};

type Tool = {
  id: string;
  name: string;
  tagline: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  pricing: string | null;
  status: string;
  created_at: string;
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  demo_url: string | null;
  screenshots: string[] | null;
  maker_comment: string | null;
  submitter_id: string;
  categories: { name: string } | null;
};

const card: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 14, padding: 24,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1)  return "just now";
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  if (user.email !== ADMIN_EMAIL) redirect("/");

  const { data: pending } = await supabase
    .from("tools")
    .select("*, categories(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: approved } = await supabase
    .from("tools")
    .select("id, name, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: rejected } = await supabase
    .from("tools")
    .select("id, name, status, created_at")
    .eq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: pendingNewsletterRaw } = await supabase
    .from("newsletter_submissions")
    .select("id, headline, story, link, status, created_at, user_id, tools(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // enrich with profiles separately
  const submitterIds = [...new Set((pendingNewsletterRaw ?? []).map((s: any) => s.user_id))];
  const { data: submitterProfiles } = submitterIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, email").in("id", submitterIds)
    : { data: [] };
  const profileMap = Object.fromEntries((submitterProfiles ?? []).map((p: any) => [p.id, p]));

  const pendingNewsletter: NewsletterSubmission[] = (pendingNewsletterRaw ?? []).map((s: any) => ({
    ...s,
    profiles: profileMap[s.user_id] ?? null,
  }));

  const tools = (pending ?? []) as Tool[];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>
          Admin Panel
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Review Submissions
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Approve or reject tools submitted by founders. Approved tools go live on the homepage immediately.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Pending Review", value: tools.length, color: "#ff6a3d" },
          { label: "Approved (recent)", value: approved?.length ?? 0, color: "#00b87a" },
          { label: "Rejected (recent)", value: rejected?.length ?? 0, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6a3d", display: "inline-block" }} />
        Pending Review ({tools.length})
      </div>

      {tools.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px", color: "var(--ink-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>All caught up!</div>
          <div style={{ fontSize: 13 }}>No pending submissions right now.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
          {tools.map(t => (
            <div key={t.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Top row: logo + info + buttons */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Logo */}
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: t.logo_url ? "transparent" : `hsl(${t.name.charCodeAt(0) * 5 % 360},65%,55%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: "#fff", overflow: "hidden",
                  border: "1px solid var(--border)",
                }}>
                  {t.logo_url
                    ? <img src={t.logo_url} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : t.name[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{t.name}</span>
                    {t.categories?.name && (
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "var(--orange-soft)", color: "#ff6a3d" }}>
                        {t.categories.name}
                      </span>
                    )}
                    {t.pricing && (
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "var(--surface-alt)", color: "var(--ink-muted)" }}>
                        {t.pricing.charAt(0).toUpperCase() + t.pricing.slice(1)}
                        {t.maker_comment ? ` · ${t.maker_comment}` : ""}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--ink-muted)", marginLeft: "auto" }}>{timeAgo(t.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 6 }}>{t.tagline}</div>
                  {t.website_url && (
                    <a href={t.website_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#3b7fff", textDecoration: "none", fontWeight: 500 }}>
                      {t.website_url.replace(/^https?:\/\//, "")} ↗
                    </a>
                  )}
                </div>

                {/* Approve / Reject */}
                <ReviewButtons toolId={t.id} />
              </div>

              {/* About */}
              {t.description && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "var(--surface-alt)", fontSize: 13,
                  color: "var(--ink)", lineHeight: 1.6,
                  borderLeft: "3px solid var(--border)",
                }}>
                  {t.description}
                </div>
              )}

              {/* Screenshots */}
              {t.screenshots && t.screenshots.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                  {t.screenshots.map((src, i) => (
                    <img key={i} src={src} alt={`screenshot ${i + 1}`}
                      style={{ height: 90, borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover", flexShrink: 0 }} />
                  ))}
                </div>
              )}

              {/* Social links */}
              {(t.twitter_url || t.linkedin_url || t.youtube_url || t.instagram_url || t.demo_url) && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "𝕏 Twitter",   url: t.twitter_url },
                    { label: "🔗 LinkedIn",  url: t.linkedin_url },
                    { label: "▶ YouTube",    url: t.youtube_url },
                    { label: "📸 Instagram", url: t.instagram_url },
                    { label: "🎬 Video",     url: t.demo_url },
                  ].filter(s => s.url).map(s => (
                    <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" style={{
                      padding: "4px 10px", borderRadius: 7,
                      border: "1px solid var(--border)", background: "var(--surface-alt)",
                      fontSize: 11, fontWeight: 600, color: "var(--ink)", textDecoration: "none",
                    }}>
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Newsletter Submissions ── */}
      <div style={{ margin: "44px 0 10px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
          Newsletter Featuring Requests
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff6a3d", display: "inline-block" }} />
        Pending Submissions ({pendingNewsletter.length})
      </div>

      {pendingNewsletter.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px", color: "var(--ink-muted)", marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No pending newsletter submissions</div>
          <div style={{ fontSize: 13 }}>When founders submit featuring requests, they&apos;ll appear here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
          {pendingNewsletter.map(s => (
            <div key={s.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Top row */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Submitter + tool */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                      {s.profiles?.full_name ?? s.profiles?.email ?? "Unknown user"}
                    </span>
                    {s.tools?.name && (
                      <span style={{
                        padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: "var(--orange-soft)", color: "#ff6a3d",
                      }}>
                        {s.tools.name}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--ink-muted)", marginLeft: "auto" }}>
                      {timeAgo(s.created_at)}
                    </span>
                  </div>

                  {/* Headline */}
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                    {s.headline}
                  </div>

                  {/* Story */}
                  <div style={{
                    fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6,
                    padding: "8px 12px", borderRadius: 8,
                    background: "var(--surface-alt)", borderLeft: "3px solid var(--border)",
                  }}>
                    {s.story}
                  </div>

                  {/* Link */}
                  {s.link && (
                    <a href={s.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#3b7fff", textDecoration: "none", fontWeight: 500, marginTop: 6, display: "inline-block" }}>
                      {s.link.replace(/^https?:\/\//, "")} ↗
                    </a>
                  )}
                </div>

                {/* Action buttons */}
                <SubmissionButtons submissionId={s.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently actioned */}
      {((approved?.length ?? 0) > 0 || (rejected?.length ?? 0) > 0) && (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>Recently Actioned</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...(approved ?? []).map(t => ({ ...t, _s: "approved" })), ...(rejected ?? []).map(t => ({ ...t, _s: "rejected" }))]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 15)
              .map(t => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", borderRadius: 10, background: "var(--surface)",
                  border: "1px solid var(--border)", fontSize: 13,
                }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{t.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{timeAgo(t.created_at)}</span>
                    <span style={{
                      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: t._s === "approved" ? "rgba(0,184,122,0.12)" : "rgba(220,38,38,0.08)",
                      color: t._s === "approved" ? "#00b87a" : "#dc2626",
                    }}>
                      {t._s === "approved" ? "✓ Live" : "✕ Rejected"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </main>
  );
}
