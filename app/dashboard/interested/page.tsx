import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CRMClient, { type Lead, type Tool } from "./CRMClient";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "sohams270@gmail.com";

export default async function FounderCRMPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Admin bypasses plan check; everyone else must be on Core
  const isAdmin = user.email === ADMIN_EMAIL;
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const isUnlocked = isAdmin || profile?.plan === "core";

  // Fetch user's approved tools
  const { data: toolsRaw } = await supabase
    .from("tools")
    .select("id, name")
    .eq("submitter_id", user.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const tools: Tool[] = toolsRaw ?? [];

  // Fetch all upvotes for user's tools, joined with profiles
  let leads: Lead[] = [];
  if (tools.length > 0) {
    const toolIds = tools.map(t => t.id);
    const { data: upvoteRows } = await supabase
      .from("upvotes")
      .select(`
        user_id,
        tool_id,
        created_at,
        profiles!upvotes_user_id_fkey(
          full_name, email, company, role,
          avatar_url, twitter_url, linkedin_url, website
        )
      `)
      .in("tool_id", toolIds)
      .order("created_at", { ascending: false });

    if (upvoteRows) {
      leads = (upvoteRows as {
        user_id: string;
        tool_id: string;
        created_at: string;
        profiles: {
          full_name?: string | null;
          email?: string | null;
          company?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          website?: string | null;
        } | null;
      }[]).map(row => {
        const p = row.profiles ?? {};
        const toolName = tools.find(t => t.id === row.tool_id)?.name ?? "";
        return {
          user_id: row.user_id,
          tool_id: row.tool_id,
          upvoted_at: row.created_at,
          tool_name: toolName,
          full_name: p.full_name ?? null,
          email: p.email ?? null,
          company: p.company ?? null,
          role: p.role ?? null,
          avatar_url: p.avatar_url ?? null,
          twitter_url: p.twitter_url ?? null,
          linkedin_url: p.linkedin_url ?? null,
          website: p.website ?? null,
        };
      });
    }
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const newThisWeek = leads.filter(l => l.upvoted_at >= weekAgo).length;

  return (
    <CRMClient
      leads={leads}
      tools={tools}
      isUnlocked={isUnlocked}
      newThisWeek={newThisWeek}
    />
  );
}
