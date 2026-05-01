"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "sohams270@gmail.com";

async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  // Return admin client for writes — bypasses RLS so updates always land
  return { user, supabase: createAdminClient() };
}

export async function approveTool(toolId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("tools").update({ status: "approved" }).eq("id", toolId);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectTool(toolId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("tools").update({ status: "rejected" }).eq("id", toolId);
  revalidatePath("/admin");
}

export async function approveSubmission(submissionId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("newsletter_submissions").update({ status: "approved" }).eq("id", submissionId);
  revalidatePath("/admin");
}

export async function rejectSubmission(submissionId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("newsletter_submissions").update({ status: "rejected" }).eq("id", submissionId);
  revalidatePath("/admin");
}

export async function approveBlogRequest(requestId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "approved" }).eq("id", requestId);
  revalidatePath("/admin");
}

export async function rejectBlogRequest(requestId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "rejected" }).eq("id", requestId);
  revalidatePath("/admin");
}

export async function inductHofNomination(nominationId: string) {
  const { supabase } = await getAdminUser();

  // 1. Mark nomination as approved
  const { data: hofRow, error } = await supabase
    .from("hall_of_fame")
    .update({ status: "approved", inducted_at: new Date().toISOString() })
    .eq("id", nominationId)
    .select("tool_id")
    .single();

  if (error) {
    console.error("[inductHofNomination] hof error:", JSON.stringify(error));
    throw new Error(error.message);
  }

  // 2. Also mark the tool as featured so it surfaces in the featured strip
  if (hofRow?.tool_id) {
    const { error: toolError } = await supabase
      .from("tools")
      .update({ featured: true })
      .eq("id", hofRow.tool_id);
    if (toolError) console.error("[inductHofNomination] tool featured error:", JSON.stringify(toolError));
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectHofNomination(nominationId: string) {
  const { supabase } = await getAdminUser();
  const { error } = await supabase.from("hall_of_fame")
    .update({ status: "rejected" })
    .eq("id", nominationId);
  if (error) {
    console.error("[rejectHofNomination] error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  revalidatePath("/admin");
}

export async function removeFromHof(nominationId: string, toolId: string) {
  const { supabase } = await getAdminUser();

  // 1. Mark nomination as removed (keeps the record, just hides from HoF)
  const { error: hofError } = await supabase
    .from("hall_of_fame")
    .update({ status: "removed" })
    .eq("id", nominationId);
  if (hofError) {
    console.error("[removeFromHof] hof error:", JSON.stringify(hofError));
    throw new Error(hofError.message);
  }

  // 2. Keep tools.featured = true so it stays in the featured strip
  // (no change needed — just leaving it as-is)
  console.log(`[removeFromHof] Removed nomination ${nominationId}, tool ${toolId} stays featured`);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function publishBlogRequest(requestId: string, blogUrl: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "published", blog_url: blogUrl }).eq("id", requestId);
  revalidatePath("/admin");
}
