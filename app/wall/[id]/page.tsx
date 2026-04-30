import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import PostCard from "@/app/components/PostCard";
import type { PostRow } from "@/app/components/PostCard";

type Props = { params: Promise<{ id: string }> };

export default async function SinglePostPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the post
  const { data: raw, error } = await supabase
    .from("posts")
    .select("id, type, content, metric_label, metric_value, likes_count, comments_count, created_at, author_id, tool_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !raw) notFound();

  // Enrich with profile + tool
  const [{ data: profileData }, { data: toolData }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, username, avatar_url, company, role").eq("id", raw.author_id).maybeSingle(),
    raw.tool_id
      ? supabase.from("tools").select("id, name").eq("id", raw.tool_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const post: PostRow = {
    id:            raw.id,
    type:          raw.type,
    content:       raw.content,
    metric_label:  raw.metric_label,
    metric_value:  raw.metric_value,
    likes_count:   raw.likes_count,
    comments_count: raw.comments_count,
    created_at:    raw.created_at,
    profiles:      profileData ?? null,
    tools:         toolData ?? null,
  };

  // Check if user liked this post
  let isLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .eq("post_id", raw.id)
      .maybeSingle();
    isLiked = !!like;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", padding: "32px 24px 80px" }}>
        {/* Back link */}
        <Link href="/#bip-wall" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "var(--ink-muted)", textDecoration: "none",
          fontWeight: 500, marginBottom: 24,
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6"/>
          </svg>
          Back to Build in Public Wall
        </Link>

        {/* Post heading */}
        <div style={{
          background: "#0A0B1A",
          borderRadius: 16,
          border: "1px solid rgba(255,107,53,0.2)",
          overflow: "hidden",
          padding: "20px 20px 4px",
        }}>
          <PostCard
            post={post}
            userId={user?.id ?? null}
            isLiked={isLiked}
            standalone
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
