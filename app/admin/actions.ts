"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return { user, supabase };
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
  await supabase.from("hall_of_fame")
    .update({ status: "approved", inducted_at: new Date().toISOString() })
    .eq("id", nominationId);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectHofNomination(nominationId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("hall_of_fame").update({ status: "rejected" }).eq("id", nominationId);
  revalidatePath("/admin");
}

export async function publishBlogRequest(requestId: string, blogUrl: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "published", blog_url: blogUrl }).eq("id", requestId);
  revalidatePath("/admin");
}
