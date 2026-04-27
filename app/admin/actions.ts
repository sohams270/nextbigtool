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
