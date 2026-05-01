import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import ReviewButtons from "./ReviewButtons";

export const dynamic = "force-dynamic"; // never serve a cached admin page
import SubmissionButtons from "./SubmissionButtons";
import BlogRequestButtons from "./BlogRequestButtons";
import HofNominationButtons from "./HofNominationButtons";
import HofInductedButtons from "./HofInductedButtons";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

type HofNomination = {
  id: string;
  pitch: string | null;
  status: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
  tools: { name: string; logo_url: string | null; tagline: string } | null;
};

type BlogRequest = {
  id: string;
  company_name: string;
  headline: string;
  story: string;
  link: string | null;
  status: string;
  blog_url: string | null;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
  tools: { name: string } | null;
};

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

  // Use service-role client for all data reads so RLS doesn't block admin queries
  const adminDb = createAdminClient();

  const { data: pending } = await adminDb
    .from("tools")
    .select("*, categories(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: approved } = await adminDb
    .from("tools")
    .select("id, name, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: rejected } = await adminDb
    .from("tools")
    .select("id, name, status, created_at")
    .eq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: pendingNewsletterRaw } = await adminDb
    .from("newsletter_submissions")
    .select("id, headline, story, link, status, created_at, user_id, tools(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // enrich with profiles separately
  const submitterIds = [...new Set((pendingNewsletterRaw ?? []).map((s: any) => s.user_id))];
  const { data: submitterProfiles } = submitterIds.length > 0
    ? await adminDb.from("profiles").select("id, full_name, email").in("id", submitterIds)
    : { data: [] };
  const profileMap = Object.fromEntries((submitterProfiles ?? []).map((p: any) => [p.id, p]));

  const pendingNewsletter: NewsletterSubmission[] = (pendingNewsletterRaw ?? []).map((s: any) => ({
    ...s,
    profiles: profileMap[s.user_id] ?? null,
  }));

  // Hall of Fame nominations — pending
  const { data: pendingHofRaw } = await adminDb
    .from("hall_of_fame")
    .select("id, pitch, status, created_at, user_id, tools(name, logo_url, tagline)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const hofSubmitterIds = [...new Set((pendingHofRaw ?? []).map((r: any) => r.user_id))];
  const { data: hofProfiles } = hofSubmitterIds.length > 0
    ? await adminDb.from("profiles").select("id, full_name, email").in("id", hofSubmitterIds)
    : { data: [] };
  const hofProfileMap = Object.fromEntries((hofProfiles ?? []).map((p: any) => [p.id, p]));

  const pendingHofNominations: HofNomination[] = (pendingHofRaw ?? []).map((r: any) => ({
    ...r,
    profiles: hofProfileMap[r.user_id] ?? null,
  }));

  // Hall of Fame — inducted (approved)
  const { data: inductedHofRaw } = await adminDb
    .from("hall_of_fame")
    .select("id, tool_id, inducted_at, created_at, user_id, tools(name, logo_url, tagline, slug)")
    .eq("status", "approved")
    .order("inducted_at", { ascending: false });

  const inductedHof = (inductedHofRaw ?? []) as any[];

  // Blog post requests
  const { data: pendingBlogRaw } = await adminDb
    .from("blog_post_requests")
    .select("id, company_name, headline, story, link, status, blog_url, created_at, user_id, tools(name)")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false });

  const blogSubmitterIds = [...new Set((pendingBlogRaw ?? []).map((r: any) => r.user_id))];
  const { data: blogProfiles } = blogSubmitterIds.length > 0
    ? await adminDb.from("profiles").select("id, full_name, email").in("id", blogSubmitterIds)
    : { data: [] };
  const blogProfileMap = Object.fromEntries((blogProfiles ?? []).map((p: any) => [p.id, p]));

  const pendingBlogRequests: BlogRequest[] = (pendingBlogRaw ?? []).map((r: any) => ({
    ...r,
    profiles: blogProfileMap[r.user_id] ?? null,
  }));

  const tools = (pending ?? []) as Tool[];

  // All members
  const { data: allMembers } = await adminDb
    .from("profiles")
    .select("id, full_name, email, plan, company, role, created_at")
    .order("created_at", { ascending: false });

  // Tool count per user
  const { data: toolCounts } = await adminDb
    .from("tools")
    .select("submitter_id")
    .neq("status", "rejected");

  const toolCountMap: Record<string, number> = {};
  (toolCounts ?? []).forEach((t: any) => {
    toolCountMap[t.submitter_id] = (toolCountMap[t.submitter_id] ?? 0) + 1;
  });

  const members = (allMembers ?? []) as Array<{
    id: string; full_name: string | null; email: string | null;
    plan: string | null; company: string | null; role: string | null; created_at: string;
  }>;

  // Stats
  const totalMembers = members.length;
  const thisWeek = members.filter(m => {
    const d = new Date(m.created_at);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return d > weekAgo;
  }).length;

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

      {/* ── Hall of Fame Nominations ── */}
      <div style={{ margin: "44px 0 10px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
          Hall of Fame Nominations
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffd700", display: "inline-block" }} />
        Pending Nominations ({pendingHofNominations.length})
      </div>

      {pendingHofNominations.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px", color: "var(--ink-muted)", marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No pending nominations</div>
          <div style={{ fontSize: 13 }}>When Core plan users nominate products, they&apos;ll appear here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
          {pendingHofNominations.map(n => (
            <div key={n.id} style={{ ...card, display: "flex", gap: 14, alignItems: "flex-start" }}>
              {/* Logo */}
              <div style={{
                width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                background: n.tools?.logo_url ? "transparent" : `hsl(${(n.tools?.name.charCodeAt(0) ?? 0) * 7 % 360},60%,50%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#fff", overflow: "hidden",
                border: "1.5px solid rgba(255,215,0,0.4)",
              }}>
                {n.tools?.logo_url
                  ? <img src={n.tools.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (n.tools?.name[0] ?? "?")}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{n.tools?.name}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{n.tools?.tagline}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-muted)", marginLeft: "auto" }}>{timeAgo(n.created_at)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 6 }}>
                  Submitted by: <b>{n.profiles?.full_name ?? n.profiles?.email ?? "Unknown"}</b>
                </div>
                {n.pitch && (
                  <div style={{
                    fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6,
                    padding: "8px 12px", borderRadius: 8,
                    background: "var(--surface-alt)", borderLeft: "3px solid rgba(255,215,0,0.5)",
                  }}>
                    {n.pitch}
                  </div>
                )}
              </div>

              <HofNominationButtons nominationId={n.id} />
            </div>
          ))}
        </div>
      )}

      {/* ── Inducted Tools ── */}
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffd700", display: "inline-block" }} />
        Inducted ({inductedHof.length})
      </div>

      {inductedHof.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "24px 20px", color: "var(--ink-muted)", marginBottom: 36 }}>
          <div style={{ fontSize: 13 }}>No tools inducted yet. Approve a nomination above to induct the first one.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 36 }}>
          {inductedHof.map((n: any) => (
            <div key={n.id} style={{
              ...card,
              padding: "14px",
              position: "relative",
              overflow: "hidden",
              border: "1.5px solid rgba(255,215,0,0.3)",
            }}>
              {/* Gold top bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ffd700,#ff8c00,#ffd700)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {/* Logo */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  border: "1.5px solid rgba(255,215,0,0.3)",
                  background: n.tools?.logo_url ? "transparent" : `hsl(${(n.tools?.name?.charCodeAt(0) ?? 0) * 7 % 360},60%,50%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "#fff", overflow: "hidden",
                }}>
                  {n.tools?.logo_url
                    ? <img src={n.tools.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (n.tools?.name?.[0] ?? "?")}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.tools?.name ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {n.tools?.tagline ?? ""}
                  </div>
                </div>
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                fontSize: 10, fontWeight: 700, color: "#9a6a00",
              }}>
                🏆 {n.inducted_at ? new Date(n.inducted_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Inducted"}
              </div>

              <HofInductedButtons nominationId={n.id} toolId={n.tool_id} />
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

      {/* ── Featured Blog Post Requests ── */}
      <div style={{ margin: "44px 0 10px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
          Featured Blog Post Requests
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b7fff", display: "inline-block" }} />
        Pending / Approved ({pendingBlogRequests.length})
      </div>

      {pendingBlogRequests.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "40px 20px", color: "var(--ink-muted)", marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✍️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>No blog post requests</div>
          <div style={{ fontSize: 13 }}>When Core plan users request a featured blog post, they&apos;ll appear here.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
          {pendingBlogRequests.map(r => (
            <div key={r.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Submitter + company */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                      {r.profiles?.full_name ?? r.profiles?.email ?? "Unknown user"}
                    </span>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(59,127,255,0.1)", color: "#3b7fff" }}>
                      {r.company_name}
                    </span>
                    {r.tools?.name && (
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "var(--orange-soft)", color: "#ff6a3d" }}>
                        {r.tools.name}
                      </span>
                    )}
                    <span style={{
                      marginLeft: "auto", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: r.status === "approved" ? "rgba(59,127,255,0.1)" : "rgba(245,158,11,0.1)",
                      color: r.status === "approved" ? "#3b7fff" : "#b45309",
                    }}>
                      {r.status === "approved" ? "Approved" : "Pending"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{timeAgo(r.created_at)}</span>
                  </div>

                  {/* Headline */}
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                    {r.headline}
                  </div>

                  {/* Story */}
                  <div style={{
                    fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6,
                    padding: "8px 12px", borderRadius: 8,
                    background: "var(--surface-alt)", borderLeft: "3px solid var(--border)",
                  }}>
                    {r.story}
                  </div>

                  {/* Link */}
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#3b7fff", textDecoration: "none", fontWeight: 500, marginTop: 6, display: "inline-block" }}>
                      {r.link.replace(/^https?:\/\//, "")} ↗
                    </a>
                  )}
                </div>

                {/* Action buttons */}
                <BlogRequestButtons requestId={r.id} status={r.status} />
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
      {/* ── Members ── */}
      <div style={{ marginTop: 48 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>
              Platform
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>
              All Members
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ textAlign: "center", padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{totalMembers}</div>
              <div style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#00B875" }}>{thisWeek}</div>
              <div style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>This Week</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...card, overflow: "hidden", padding: 0 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 120px 90px 90px 90px", padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "var(--ink-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            <div>Name</div>
            <div>Email</div>
            <div>Company</div>
            <div>Role</div>
            <div>Plan</div>
            <div>Tools</div>
            <div>Joined</div>
          </div>

          {members.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-muted)", fontSize: 13 }}>No members yet.</div>
          ) : (
            members.map((m, idx) => {
              const initial = (m.full_name ?? m.email ?? "?")[0].toUpperCase();
              const planColor = m.plan === "core" ? "#F59E0B" : m.plan === "pro" ? "#3B7FFF" : "var(--ink-muted)";
              const joined = new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <div key={m.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 120px 120px 90px 90px 90px",
                  padding: "11px 16px",
                  borderBottom: idx < members.length - 1 ? "1px solid var(--border-faint)" : "none",
                  alignItems: "center",
                }}>
                  {/* Avatar + Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#FF6B35,#FF4500)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff",
                    }}>{initial}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.full_name ?? "—"}
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.email ?? "—"}
                  </div>
                  {/* Company */}
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.company ?? "—"}
                  </div>
                  {/* Role */}
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.role ?? "—"}
                  </div>
                  {/* Plan */}
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: m.plan === "core" ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.1)",
                      color: planColor, textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {m.plan ?? "free"}
                    </span>
                  </div>
                  {/* Tools */}
                  <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                    {toolCountMap[m.id] ?? 0}
                  </div>
                  {/* Joined */}
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{joined}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
